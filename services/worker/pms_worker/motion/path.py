"""Camera path generation with reference-calibrated easing.

The FAS 1 measurement showed the reference films hold near-constant speed for
>= 60% of the shot with short smooth attack/release ramps (~0.6 s), not a full
S-curve. `ease_profile` produces that normalized progress curve.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


def _smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def ease_profile(
    num_frames: int,
    fps: float,
    attack_seconds: float = 0.6,
    release_seconds: float = 0.6,
) -> np.ndarray:
    """Normalized progress u(t) in [0, 1] with smooth ramps and a constant-
    velocity plateau. Velocity profile: smoothstep ramp up over `attack`,
    constant, smoothstep ramp down over `release`; u = integral, normalized."""
    if num_frames <= 1:
        return np.zeros(max(num_frames, 1))
    t = np.arange(num_frames) / fps
    total = (num_frames - 1) / fps
    attack = min(attack_seconds, total * 0.4)
    release = min(release_seconds, total * 0.4)

    vel = np.ones(num_frames)
    if attack > 0:
        ramp = _smoothstep(t / attack)
        vel = np.minimum(vel, ramp)
    if release > 0:
        ramp = _smoothstep((total - t) / release)
        vel = np.minimum(vel, ramp)

    u = np.cumsum(vel)
    u -= u[0]
    u /= u[-1]
    return u


@dataclass
class CameraPose:
    """Per-frame virtual camera parameters (amounts, not rates)."""

    scale: float  # cumulative scale factor (1.0 = original)
    pan_x: float  # cumulative horizontal truck as fraction of width (+ = image content moves left)
    pan_y: float  # cumulative vertical truck as fraction of height
    roll_deg: float  # cumulative roll in degrees


class CameraPath:
    """Full path for a shot.

    Anchor modes:
      START_ANCHOR    — pose is identity at frame 0.
      MIDPOINT_ANCHOR — pose is identity at the middle frame; the shot starts
                        at -0.5 x amplitude and ends at +0.5 x amplitude.
    """

    def __init__(
        self,
        num_frames: int,
        fps: float,
        total_scale_delta: float,
        total_pan_x: float,
        total_pan_y: float,
        total_roll_deg: float,
        anchor_mode: str = "START_ANCHOR",
        attack_seconds: float = 0.6,
        release_seconds: float = 0.6,
    ) -> None:
        self.num_frames = num_frames
        self.fps = fps
        self.anchor_mode = anchor_mode
        u = ease_profile(num_frames, fps, attack_seconds, release_seconds)
        if anchor_mode == "MIDPOINT_ANCHOR":
            u = u - 0.5
        self._u = u
        self.total_scale_delta = total_scale_delta
        self.total_pan_x = total_pan_x
        self.total_pan_y = total_pan_y
        self.total_roll_deg = total_roll_deg

    @property
    def anchor_frame_index(self) -> int:
        if self.anchor_mode == "MIDPOINT_ANCHOR":
            return int(np.argmin(np.abs(self._u)))
        return 0

    def pose(self, frame_index: int, subframe_offset: float = 0.0) -> CameraPose:
        """Pose at frame_index (+ fractional offset for motion-blur samples)."""
        idx = frame_index + subframe_offset
        i0 = int(np.clip(np.floor(idx), 0, self.num_frames - 1))
        i1 = int(np.clip(i0 + 1, 0, self.num_frames - 1))
        frac = float(np.clip(idx - i0, 0.0, 1.0))
        u = self._u[i0] * (1 - frac) + self._u[i1] * frac
        return CameraPose(
            scale=1.0 + self.total_scale_delta * u,
            pan_x=self.total_pan_x * u,
            pan_y=self.total_pan_y * u,
            roll_deg=self.total_roll_deg * u,
        )

    def max_abs_pose(self) -> CameraPose:
        u_max = float(np.max(np.abs(self._u)))
        return CameraPose(
            scale=1.0 + abs(self.total_scale_delta) * u_max,
            pan_x=abs(self.total_pan_x) * u_max,
            pan_y=abs(self.total_pan_y) * u_max,
            roll_deg=abs(self.total_roll_deg) * u_max,
        )
