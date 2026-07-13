"""Scene Life Renderer — perfectly static camera, motion only inside a mask.

Principles:
- The base frame is the locked 16:9 crop of the original image.
- Only pixels inside the approved mask may change; outside the mask every
  frame is byte-identical to the base frame (enforced, not just intended).
- Effects are procedural UV displacements of original pixels (multi-octave
  drifting noise), never generated content. Displacement tapers to zero at the
  mask boundary, so pool edges, trunks and curtain rails stay locked.
"""
from __future__ import annotations

import cv2
import numpy as np

from .camera_motion import compute_geometry


def _value_noise(shape_hw: tuple[int, int], grid: int, rng: np.random.Generator) -> np.ndarray:
    """Smooth value noise in [-1, 1] via bicubic-upsampled random grid."""
    gh = max(2, shape_hw[0] // grid)
    gw = max(2, shape_hw[1] // grid)
    coarse = rng.uniform(-1.0, 1.0, size=(gh, gw)).astype(np.float32)
    return cv2.resize(coarse, (shape_hw[1], shape_hw[0]), interpolation=cv2.INTER_CUBIC)


class SceneLifeRenderer:
    """Renders one Scene Life shot.

    effect_type: pool_water | natural_water | outdoor_foliage |
                 small_outdoor_branches | high_grass | outdoor_plants |
                 thin_curtain_near_open_window | thin_curtain_near_open_door
    strength: 0..1 scales displacement amplitude within safe bounds.
    mask: uint8 mask in source-image coordinates (255 = animated region).
    """

    WATER_TYPES = {"pool_water", "natural_water"}
    FOLIAGE_TYPES = {"outdoor_foliage", "small_outdoor_branches", "outdoor_plants"}
    GRASS_TYPES = {"high_grass"}
    CURTAIN_TYPES = {"thin_curtain_near_open_window", "thin_curtain_near_open_door"}

    def __init__(
        self,
        image_bgr: np.ndarray,
        mask: np.ndarray,
        effect_type: str,
        duration_seconds: float = 4.0,
        fps: int = 24,
        strength: float = 0.5,
        out_w: int = 1920,
        out_h: int = 1080,
        seed: int = 7,
    ) -> None:
        self.effect_type = effect_type
        self._source = image_bgr
        self.fps = fps
        self.num_frames = int(round(duration_seconds * fps))
        self.strength = float(np.clip(strength, 0.0, 1.0))
        self.rng = np.random.default_rng(seed)

        # Fixed, locked framing: zero overscan is fine (no camera motion), but
        # keep a tiny margin so displacement sampling never leaves the source.
        geom = compute_geometry(image_bgr.shape[1], image_bgr.shape[0], 0.004, out_w, out_h)
        xs = np.linspace(0, geom.crop_w, out_w, dtype=np.float32) + geom.crop_x
        ys = np.linspace(0, geom.crop_h, out_h, dtype=np.float32) + geom.crop_y
        gx, gy = np.meshgrid(xs, ys)
        self._grid_x, self._grid_y = gx, gy
        self.base = cv2.remap(image_bgr, gx, gy, interpolation=cv2.INTER_CUBIC)

        m = mask
        if m.shape[:2] != image_bgr.shape[:2]:
            m = cv2.resize(m, (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
        self.mask = (
            cv2.remap(m, gx, gy, interpolation=cv2.INTER_NEAREST) > 127
        ).astype(np.uint8) * 255

        # Inward feather: displacement fades to zero before the mask edge.
        dist = cv2.distanceTransform((self.mask > 0).astype(np.uint8), cv2.DIST_L2, 5)
        feather_px = max(6.0, 0.012 * out_w * (0.5 + self.strength * 0.5))
        self.alpha = np.clip(dist / feather_px, 0.0, 1.0).astype(np.float32)

        self._build_effect_fields(out_w, out_h)

    # ---- effect construction -------------------------------------------------

    def _mask_bbox(self):
        ys, xs = np.nonzero(self.mask)
        if len(ys) == 0:
            return 0, 0, self.mask.shape[0], self.mask.shape[1]
        return ys.min(), xs.min(), ys.max() + 1, xs.max() + 1

    def _build_effect_fields(self, w: int, h: int) -> None:
        et = self.effect_type
        y0, x0, y1, x1 = self._mask_bbox()
        mask_h = max(y1 - y0, 1)

        yy = np.arange(h, dtype=np.float32)[:, None]
        y_in_mask = np.clip((yy - y0) / mask_h, 0.0, 1.0) * np.ones((h, w), np.float32)

        if et in self.WATER_TYPES:
            # Perspective-scaled ripples: finer waves at the top (far) edge.
            self.amp_px = 0.8 + 1.4 * self.strength
            persp = 0.45 + 0.8 * y_in_mask  # wavelength multiplier near->far
            self.noise_a = [_value_noise((h, w), int(g), self.rng) for g in (28, 64, 140)]
            self.noise_b = [_value_noise((h, w), int(g), self.rng) for g in (28, 64, 140)]
            self.persp = persp
            self.speeds = [0.35, 0.22, 0.12]  # Hz per octave, slow
            self.weights = [0.5, 0.33, 0.17]
            self.vertical_ratio = 0.55  # water displaces both axes, mostly x
        elif et in self.FOLIAGE_TYPES:
            self.amp_px = 1.0 + 1.8 * self.strength
            # Cluster phases: connected components + coarse grid, one phase per cell.
            num, labels = cv2.connectedComponents((self.mask > 0).astype(np.uint8))
            cell = max(48, w // 24)
            grid_id = (self._grid_y.astype(int) // cell) * 1000 + (
                self._grid_x.astype(int) // cell
            )
            combo = (labels.astype(np.int64) * 1_000_003 + grid_id).astype(np.int64)
            uniq, inv = np.unique(combo, return_inverse=True)
            phases = self.rng.uniform(0, 2 * np.pi, size=len(uniq)).astype(np.float32)
            self.cluster_phase = phases[inv].reshape(h, w)
            self.cluster_phase = cv2.GaussianBlur(self.cluster_phase, (0, 0), sigmaX=cell * 0.35)
            self.detail = _value_noise((h, w), 20, self.rng)
            self.freq = 0.30  # Hz main sway
            self.height_ramp = y_in_mask * 0.4 + 0.6  # slight extra motion higher up? no: anchored below
            # Anchor at cluster bottom: motion grows with height above mask bottom.
            self.height_ramp = 1.0 - y_in_mask  # top of mask moves most
            self.vertical_ratio = 0.25
        elif et in self.GRASS_TYPES:
            self.amp_px = 0.8 + 1.2 * self.strength
            cell = max(24, w // 48)
            gh, gw = h // cell + 2, w // cell + 2
            coarse = self.rng.uniform(0, 2 * np.pi, size=(gh, gw)).astype(np.float32)
            self.cluster_phase = cv2.resize(coarse, (w, h), interpolation=cv2.INTER_LINEAR)
            self.detail = _value_noise((h, w), 12, self.rng)
            self.freq = 0.45
            self.height_ramp = 1.0 - y_in_mask  # anchored at the ground
            self.vertical_ratio = 0.12
        elif et in self.CURTAIN_TYPES:
            self.amp_px = 1.2 + 2.2 * self.strength
            self.detail = _value_noise((h, w), 40, self.rng)
            self.freq = 0.22
            # Anchored at the rail (top of mask): motion grows downward, eases
            # near the bottom hem to avoid length change illusions.
            ramp = np.clip(y_in_mask * 1.4, 0.0, 1.0)
            self.height_ramp = ramp ** 1.5
            self.secondary = _value_noise((h, w), 90, self.rng)
            self.vertical_ratio = 0.08
        else:
            raise ValueError(f"Unsupported scene life effect: {self.effect_type}")

    # ---- rendering -----------------------------------------------------------

    def _displacement(self, t: float) -> tuple[np.ndarray, np.ndarray]:
        et = self.effect_type
        h, w = self.mask.shape[:2]
        if et in self.WATER_TYPES:
            dx = np.zeros((h, w), np.float32)
            dy = np.zeros((h, w), np.float32)
            for na, nb, sp, wt in zip(self.noise_a, self.noise_b, self.speeds, self.weights):
                ph = 2 * np.pi * sp * t
                mix = na * np.cos(ph) + nb * np.sin(ph)
                dx += wt * mix
                ph2 = ph * 0.83 + 1.3
                mix2 = na * np.sin(ph2) - nb * np.cos(ph2)
                dy += wt * mix2 * self.vertical_ratio
            dx *= self.amp_px * self.persp
            dy *= self.amp_px * self.persp
            return dx, dy
        # Sway-type effects (foliage, grass, curtain)
        ph = 2 * np.pi * self.freq * t
        if et in self.CURTAIN_TYPES:
            sway = np.sin(ph + self.detail * 1.2) + 0.35 * np.sin(
                ph * 1.7 + self.secondary * 2.0
            )
            dx = sway * self.amp_px * self.height_ramp
            dy = (
                np.cos(ph * 0.9 + self.detail)
                * self.amp_px
                * self.vertical_ratio
                * self.height_ramp
            )
        else:
            sway = np.sin(ph + self.cluster_phase) + 0.3 * np.sin(
                ph * 2.3 + self.detail * 2.5
            )
            dx = sway * self.amp_px * self.height_ramp
            dy = (
                np.cos(ph * 1.1 + self.cluster_phase)
                * self.amp_px
                * self.vertical_ratio
                * self.height_ramp
            )
        return dx.astype(np.float32), dy.astype(np.float32)

    def render_frame(self, frame_index: int) -> np.ndarray:
        t = frame_index / self.fps
        # Smooth amplitude ramp-in so the shot starts from stillness without a jolt.
        ramp = min(t / 0.8, 1.0)
        ramp = ramp * ramp * (3 - 2 * ramp)
        if ramp <= 1e-6 or not (self.mask > 0).any():
            return self.base.copy()

        dx, dy = self._displacement(t)
        a = self.alpha * ramp
        map_x = self._grid_x + dx * a
        map_y = self._grid_y + dy * a
        # Source image sampling keeps original pixels as the only texture.
        warped = cv2.remap(
            self._src_image(), map_x, map_y, interpolation=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )
        out = self.base.copy()
        inside = self.mask > 0
        out[inside] = warped[inside]
        return out

    def _src_image(self):
        # The remap maps output-grid -> source coordinates, so we sample the
        # original photograph directly; its pixels are the only texture.
        return self._source

    def frames(self):
        for i in range(self.num_frames):
            yield self.render_frame(i)
