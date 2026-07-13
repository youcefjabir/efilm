"""Camera Motion Renderer — source-locked 2.5D reprojection.

Method (chosen from the FAS 1 benchmark spec): depth-aware backward warp.
Every output frame samples original source pixels through a per-pixel map that
combines the virtual camera pose (scale / truck / roll from the motion plan)
with a depth-modulated parallax term. Backward warping is hole-free by
construction: disocclusion appears as bounded local stretching instead of
missing pixels, which the quality gate measures via line stability. No pixel
is ever generated — only resampled from the original photograph.

At the anchor pose (progress u = 0) the map is the identity, so the anchor
frame is a pixel-exact crop of the original image before encoding.
"""
from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from ..motion.path import CameraPath
from ..motion.templates import MotionPlan


@dataclass
class RenderGeometry:
    """Fixed geometry of a shot: where the 16:9 output window sits in the
    source image and how much overscan margin surrounds it."""

    src_w: int
    src_h: int
    crop_x: float  # top-left of output window in source pixels
    crop_y: float
    crop_w: float
    crop_h: float
    out_w: int
    out_h: int

    @property
    def center_x(self) -> float:
        return self.crop_x + self.crop_w / 2.0

    @property
    def center_y(self) -> float:
        return self.crop_y + self.crop_h / 2.0


def compute_geometry(
    src_w: int,
    src_h: int,
    overscan_fraction: float,
    out_w: int = 1920,
    out_h: int = 1080,
) -> RenderGeometry:
    """Largest centered 16:9 window that keeps `overscan_fraction` margin on
    every side of the source image."""
    usable_w = src_w * (1.0 - 2.0 * overscan_fraction)
    usable_h = src_h * (1.0 - 2.0 * overscan_fraction)
    target_ar = out_w / out_h
    if usable_w / usable_h > target_ar:
        crop_h = usable_h
        crop_w = crop_h * target_ar
    else:
        crop_w = usable_w
        crop_h = crop_w / target_ar
    return RenderGeometry(
        src_w=src_w,
        src_h=src_h,
        crop_x=(src_w - crop_w) / 2.0,
        crop_y=(src_h - crop_h) / 2.0,
        crop_w=crop_w,
        crop_h=crop_h,
        out_w=out_w,
        out_h=out_h,
    )


class CameraMotionRenderer:
    def __init__(
        self,
        image_bgr: np.ndarray,
        inverse_depth: np.ndarray,
        plan: MotionPlan,
        out_w: int = 1920,
        out_h: int = 1080,
        motion_blur_samples: int = 3,
    ) -> None:
        self.image = image_bgr
        self.plan = plan
        self.out_w = out_w
        self.out_h = out_h
        self.blur_samples = max(1, motion_blur_samples)

        src_h, src_w = image_bgr.shape[:2]
        self.geom = compute_geometry(src_w, src_h, plan.overscan_fraction, out_w, out_h)

        depth = inverse_depth
        if depth.shape[:2] != (src_h, src_w):
            depth = cv2.resize(depth, (src_w, src_h), interpolation=cv2.INTER_LINEAR)
        self.depth = depth.astype(np.float32)
        self.depth_mean = float(np.mean(self.depth))
        self.depth_med_abs_rel = float(np.median(np.abs(self.depth - self.depth_mean))) + 1e-4

        n_frames = int(round(plan.duration_seconds * plan.fps))
        self.path = CameraPath(
            num_frames=n_frames,
            fps=plan.fps,
            total_scale_delta=plan.total_scale_delta,
            total_pan_x=plan.total_pan_x,
            total_pan_y=plan.total_pan_y,
            total_roll_deg=plan.total_roll_deg,
            anchor_mode=plan.anchor_mode,
        )
        self.num_frames = n_frames

        # Distribute the parallax budget between the radial (dolly) and lateral
        # (truck) components in proportion to the planned base motion.
        zoom_c = abs(plan.total_scale_delta)
        pan_c = abs(plan.total_pan_x) + abs(plan.total_pan_y)
        share_radial = zoom_c / (zoom_c + pan_c + 1e-9)
        parallax_px = plan.parallax_gain * self.geom.crop_w

        mean_radius = 0.35 * self.geom.crop_w
        self.k_radial = 0.0
        if zoom_c > 1e-6 and share_radial > 0.01:
            self.k_radial = (parallax_px * share_radial) / (
                zoom_c * mean_radius * self.depth_med_abs_rel
            )
        self.k_lateral = 0.0
        if pan_c > 1e-6 and share_radial < 0.99:
            self.k_lateral = (parallax_px * (1.0 - share_radial)) / (
                pan_c * self.geom.crop_w * self.depth_med_abs_rel
            )
        # Bound the parallax modulation so the effective local motion can never
        # exceed ~2.2x the base motion (keeps warps physically plausible).
        self.k_radial = float(np.clip(self.k_radial, 0.0, 2.2))
        self.k_lateral = float(np.clip(self.k_lateral, 0.0, 2.2))

        # Base output pixel grid in source coordinates (before any camera pose):
        # regular grid across the crop window, scaled to output resolution.
        xs = np.linspace(0, self.geom.crop_w, self.out_w, dtype=np.float32) + self.geom.crop_x
        ys = np.linspace(0, self.geom.crop_h, self.out_h, dtype=np.float32) + self.geom.crop_y
        self._grid_x, self._grid_y = np.meshgrid(xs, ys)
        self._rel_x = self._grid_x - self.geom.center_x
        self._rel_y = self._grid_y - self.geom.center_y

        # Depth sampled on the base grid (updated per-frame with one fixed-point
        # refinement of the sampling location).
        self._depth_base = cv2.remap(
            self.depth, self._grid_x, self._grid_y, interpolation=cv2.INTER_LINEAR
        )

    def _maps_for_pose(self, scale: float, pan_x: float, pan_y: float, roll_deg: float):
        """Backward map: output pixel -> source pixel for a camera pose."""
        # Plain-float inputs keep the float32 grids from promoting to float64
        # (cv2.remap requires CV_32FC1 maps).
        scale, pan_x = float(scale), float(pan_x)
        pan_y, roll_deg = float(pan_y), float(roll_deg)
        cx, cy = self.geom.center_x, self.geom.center_y
        crop_w, crop_h = self.geom.crop_w, self.geom.crop_h

        # Negative sign so that positive plan roll is measured as positive
        # content rotation by the quality gate's affine decomposition.
        theta = np.deg2rad(-roll_deg)
        cos_t, sin_t = float(np.cos(theta)), float(np.sin(theta))

        # Inverse rotation + inverse scale of the relative grid.
        rx = (self._rel_x * cos_t + self._rel_y * sin_t) / scale
        ry = (-self._rel_x * sin_t + self._rel_y * cos_t) / scale

        base_x = cx + rx - pan_x * crop_w
        base_y = cy + ry - pan_y * crop_h

        # One fixed-point iteration: sample depth at the affine-only location,
        # then apply the depth-dependent parallax displacement.
        depth_s = cv2.remap(
            self.depth,
            base_x,
            base_y,
            interpolation=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE,
        )
        w_rel = depth_s - self.depth_mean

        map_x = base_x.copy()
        map_y = base_y.copy()
        if self.k_radial > 0.0 and abs(scale - 1.0) > 1e-9:
            radial_gain = (scale - 1.0) * self.k_radial
            map_x -= rx * radial_gain * w_rel
            map_y -= ry * radial_gain * w_rel
        if self.k_lateral > 0.0:
            map_x -= pan_x * crop_w * self.k_lateral * w_rel
            map_y -= pan_y * crop_h * self.k_lateral * w_rel
        return map_x.astype(np.float32, copy=False), map_y.astype(np.float32, copy=False)

    def render_frame(self, frame_index: int) -> np.ndarray:
        pose0 = self.path.pose(frame_index)
        is_anchor = frame_index == self.path.anchor_frame_index

        if is_anchor and self._pose_is_identity(pose0):
            # Pixel-exact anchor: direct resample of the crop window only
            # (single high-quality resize, no warp).
            crop = self._exact_crop()
            return crop

        samples = []
        n = self.blur_samples
        # 180-degree shutter: subframe offsets span half the frame interval.
        offsets = np.linspace(-0.25, 0.25, n) if n > 1 else [0.0]
        for off in offsets:
            pose = self.path.pose(frame_index, subframe_offset=float(off))
            mx, my = self._maps_for_pose(pose.scale, pose.pan_x, pose.pan_y, pose.roll_deg)
            frame = cv2.remap(
                self.image,
                mx,
                my,
                interpolation=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE,
            )
            samples.append(frame.astype(np.float32))
        out = np.mean(samples, axis=0)
        return np.clip(out, 0, 255).astype(np.uint8)

    def _pose_is_identity(self, pose) -> bool:
        return (
            abs(pose.scale - 1.0) < 1e-9
            and abs(pose.pan_x) < 1e-9
            and abs(pose.pan_y) < 1e-9
            and abs(pose.roll_deg) < 1e-9
        )

    def _exact_crop(self) -> np.ndarray:
        return cv2.remap(
            self.image,
            self._grid_x,
            self._grid_y,
            interpolation=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )

    def anchor_reference(self) -> np.ndarray:
        """The pixel-exact anchor frame (identity crop) for quality checks."""
        return self._exact_crop()

    def frames(self):
        for i in range(self.num_frames):
            yield self.render_frame(i)

    def warp_stretch_stats(self) -> dict:
        """Disocclusion proxy for a backward warp: local stretching of the
        sampling map at the most extreme pose. A stretch factor > 2 means the
        warp is smearing hidden area into view."""
        extreme = self.path.max_abs_pose()
        worst_fraction = 0.0
        worst_max = 1.0
        for sgn in (1.0, -1.0):
            mx, _my = self._maps_for_pose(
                1.0 + (extreme.scale - 1.0) * sgn,
                extreme.pan_x * sgn,
                extreme.pan_y * sgn,
                extreme.roll_deg * sgn,
            )
            # d(source_x)/d(out_x) < 0.5 => output stretches source by > 2x.
            dx = np.abs(np.diff(mx, axis=1))
            px_per_out = self.geom.crop_w / self.out_w
            stretch = px_per_out / np.maximum(dx, 1e-6)
            frac = float((stretch > 2.0).mean())
            worst_fraction = max(worst_fraction, frac)
            worst_max = max(worst_max, float(np.percentile(stretch, 99.9)))
        return {"overstretch_fraction": worst_fraction, "stretch_p999": worst_max}

    def source_bounds_check(self) -> dict:
        """Verify the warp never samples outside the source image at the most
        extreme pose. Returns margins in pixels (negative = out of bounds)."""
        extreme = self.path.max_abs_pose()
        # Evaluate both signed extremes for midpoint anchors.
        worst = {"left": np.inf, "right": np.inf, "top": np.inf, "bottom": np.inf}
        for sgn in (1.0, -1.0):
            mx, my = self._maps_for_pose(
                1.0 + (extreme.scale - 1.0) * sgn,
                extreme.pan_x * sgn,
                extreme.pan_y * sgn,
                extreme.roll_deg * sgn,
            )
            worst["left"] = min(worst["left"], float(mx.min()))
            worst["right"] = min(worst["right"], float(self.geom.src_w - 1 - mx.max()))
            worst["top"] = min(worst["top"], float(my.min()))
            worst["bottom"] = min(worst["bottom"], float(self.geom.src_h - 1 - my.max()))
        worst["ok"] = all(v >= 0 for k, v in worst.items() if k != "ok")
        return worst
