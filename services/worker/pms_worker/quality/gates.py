"""Quality gates — every rendered shot must pass before it can be approved.

The gate operates on pre-encoding frames (so encoder loss is never confused
with render error) plus the motion plan and the pixel-exact anchor reference.
"""
from __future__ import annotations

import cv2
import numpy as np

from ..config import quality_gates
from . import metrics


def _sample_indices(n: int, step: int = 4) -> list[int]:
    idx = list(range(0, n, step))
    if (n - 1) not in idx:
        idx.append(n - 1)
    return idx


class CameraMotionGate:
    def __init__(self, plan_dict: dict):
        self.cfg = quality_gates()["camera_motion"]
        self.plan = plan_dict

    def evaluate(
        self,
        frames: list[np.ndarray],
        frame_indices: list[int],
        anchor_reference: np.ndarray,
        anchor_index: int,
        stretch_stats: dict | None = None,
    ) -> dict:
        cfg = self.cfg
        checks: dict[str, dict] = {}
        fps = float(self.plan["fps"])

        grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]

        # 1. Anchor fidelity (pixel-exact before encoding)
        if anchor_index in frame_indices:
            anchor_frame = frames[frame_indices.index(anchor_index)]
            anchor_psnr = metrics.psnr(anchor_frame, anchor_reference)
        else:
            anchor_psnr = float("nan")
        checks["anchor_psnr"] = {
            "value": anchor_psnr,
            "threshold": cfg["anchor_psnr_min_db"],
            "pass": bool(anchor_psnr >= cfg["anchor_psnr_min_db"]),
        }

        # 2. Color fidelity: central-region LAB mean vs anchor + drift trend
        def central(img):
            h, w = img.shape[:2]
            return img[int(h * 0.1) : int(h * 0.9), int(w * 0.1) : int(w * 0.9)]

        ref_lab = cv2.cvtColor(central(anchor_reference), cv2.COLOR_BGR2LAB).astype(np.float32)
        ref_mean = ref_lab.reshape(-1, 3).mean(axis=0)
        ref_mean[0] *= 100.0 / 255.0
        deltas = []
        for f in frames:
            lab = cv2.cvtColor(central(f), cv2.COLOR_BGR2LAB).astype(np.float32)
            m = lab.reshape(-1, 3).mean(axis=0)
            m[0] *= 100.0 / 255.0
            deltas.append(float(np.linalg.norm(m - ref_mean)))
        times = np.array(frame_indices) / fps
        drift = 0.0
        if len(deltas) >= 3:
            drift = abs(float(np.polyfit(times, deltas, 1)[0]))
        checks["color_mean_delta_e"] = {
            "value": float(np.mean(deltas)),
            "threshold": cfg["color_mean_delta_e_max"],
            "pass": bool(np.mean(deltas) <= cfg["color_mean_delta_e_max"]),
        }
        checks["color_drift_per_s"] = {
            "value": drift,
            "threshold": cfg["color_drift_max_delta_e_per_s"],
            "pass": bool(drift <= cfg["color_drift_max_delta_e_per_s"]),
        }

        # 3. Line stability: anchor lines must not BEND in rendered frames.
        # Their neighborhoods are located via the measured global affine and a
        # perpendicular edge search; the linear component along each line
        # (translation/rotation, incl. legitimate parallax) is removed and the
        # residual bending compared against the FAS 1 criterion.
        anchor_gray = cv2.cvtColor(anchor_reference, cv2.COLOR_BGR2GRAY)
        src_lines = metrics.detect_long_lines(anchor_gray)
        bend_values = []
        if len(src_lines) >= 3:
            anchor_pos = frame_indices.index(anchor_index) if anchor_index in frame_indices else 0
            for i in (0, len(frames) // 2, len(frames) - 1):
                if i == anchor_pos:
                    continue
                aff = metrics.estimate_affine_motion(anchor_gray, grays[i])
                if not aff["valid"] or aff["affine"] is None:
                    continue
                bend = metrics.measure_line_bending(anchor_gray, grays[i], src_lines, aff["affine"])
                if bend["lines_measured"] >= 3:
                    bend_values.append(bend["max_bend_fraction"])
        worst_bend = float(np.max(bend_values)) if bend_values else 0.0
        checks["line_max_bend_fraction"] = {
            "value": worst_bend,
            "threshold": cfg["line_max_bend_fraction"],
            "pass": bool(worst_bend <= cfg["line_max_bend_fraction"]),
        }

        # 4. Disocclusion / stretch (from renderer warp-jacobian analysis)
        if stretch_stats is not None:
            checks["warp_stretch_fraction"] = {
                "value": stretch_stats.get("overstretch_fraction", 0.0),
                "threshold": cfg["disocclusion_max_fraction_per_frame"],
                "pass": bool(
                    stretch_stats.get("overstretch_fraction", 0.0)
                    <= cfg["disocclusion_max_fraction_per_frame"]
                ),
            }

        # 5+6. Trajectory measurement: accumulate affine between consecutive
        # sampled frames; compare totals against the plan (±25%); also collect
        # per-step parallax residual as temporal-stability signal.
        total_pan_x = total_pan_y = total_rot = 0.0
        total_log_scale = 0.0
        residuals = []
        for i in range(1, len(grays)):
            aff = metrics.estimate_affine_motion(grays[i - 1], grays[i])
            if not aff["valid"]:
                continue
            total_pan_x += aff["pan_x"]
            total_pan_y += aff["pan_y"]
            total_rot += aff["rot_deg"]
            total_log_scale += np.log(max(aff["scale"], 1e-6))
            step = max(frame_indices[i] - frame_indices[i - 1], 1)
            residuals.append(aff["parallax_median"] / step)
        measured_scale_delta = float(np.exp(total_log_scale) - 1.0)

        tol = cfg["trajectory_tolerance_fraction"]
        # Parallax shifts the feature-weighted affine fit; widen the tolerance
        # floor accordingly so planned parallax is not misread as a path error.
        parallax_bias = float(self.plan.get("parallax_gain", 0.0)) * 0.7

        def within(measured: float, planned: float, floor: float) -> bool:
            if abs(planned) < floor:
                return abs(measured) < max(floor * 2.5, abs(planned) * (1 + tol) + floor)
            lo, hi = sorted((planned * (1 - tol), planned * (1 + tol)))
            return lo - floor <= measured <= hi + floor

        checks["trajectory_scale"] = {
            "value": measured_scale_delta,
            "planned": self.plan["total_scale_delta"],
            "pass": within(measured_scale_delta, self.plan["total_scale_delta"], 0.004 + parallax_bias),
        }
        checks["trajectory_pan_x"] = {
            "value": total_pan_x,
            "planned": self.plan["total_pan_x"],
            "pass": within(total_pan_x, self.plan["total_pan_x"], 0.004 + parallax_bias),
        }
        checks["trajectory_rotation"] = {
            "value": total_rot,
            "planned": self.plan["total_roll_deg"],
            "pass": within(total_rot, self.plan["total_roll_deg"], 0.15 + parallax_bias * 40),
        }

        med_resid = float(np.median(residuals)) if residuals else 0.0
        planned_parallax_per_frame = self.plan["parallax_gain"] / max(
            self.plan["duration_seconds"] * fps, 1
        )
        # Residual = planned parallax + noise; allow planned + hard cap.
        resid_limit = cfg["temporal_residual_median_max_fraction"] + planned_parallax_per_frame
        checks["temporal_residual_median"] = {
            "value": med_resid,
            "threshold": resid_limit,
            "pass": bool(med_resid <= resid_limit),
        }

        # 7. Flicker
        lumas = [float(g.mean()) for g in grays]
        flick = metrics.temporal_flicker(lumas, fps / 4.0)
        checks["flicker"] = {"value": flick, "threshold": 0.004, "pass": bool(flick <= 0.004)}

        passed = all(c["pass"] for c in checks.values())
        return {"category": "CAMERA_MOTION", "pass": passed, "checks": checks}


class SceneLifeGate:
    def __init__(self):
        self.cfg = quality_gates()["scene_life"]

    def evaluate(
        self,
        frames: list[np.ndarray],
        frame_indices: list[int],
        base_frame: np.ndarray,
        mask: np.ndarray,
        fps: float,
    ) -> dict:
        cfg = self.cfg
        checks: dict[str, dict] = {}
        grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
        base_gray = cv2.cvtColor(base_frame, cv2.COLOR_BGR2GRAY)

        # 1. Camera identity: global affine vs base must be ~zero.
        max_global = 0.0
        for g in grays[1:]:
            aff = metrics.estimate_affine_motion(base_gray, g)
            if aff["valid"]:
                mag = abs(aff["pan_x"]) + abs(aff["pan_y"]) + abs(aff["scale"] - 1.0)
                max_global = max(max_global, mag)
        dur = max(frame_indices[-1] / fps, 1e-6)
        checks["camera_identity"] = {
            "value": max_global / dur,
            "threshold": cfg["global_flow_max_fraction_per_s"] * 10,
            "pass": bool(max_global / dur <= cfg["global_flow_max_fraction_per_s"] * 10),
        }

        # 2. Outside-mask pixels byte-identical to the base frame.
        outside = mask == 0
        max_outside_diff = 0
        for f in frames:
            diff = np.abs(f.astype(np.int16) - base_frame.astype(np.int16)).max(axis=2)
            max_outside_diff = max(max_outside_diff, int(diff[outside].max()) if outside.any() else 0)
        checks["outside_mask_identity"] = {
            "value": max_outside_diff,
            "threshold": cfg["outside_mask_pixel_diff_max"],
            "pass": bool(max_outside_diff <= cfg["outside_mask_pixel_diff_max"]),
        }

        # 3. Mask leakage: motion energy just outside the mask boundary.
        kernel = np.ones((15, 15), np.uint8)
        ring = (cv2.dilate(mask, kernel) > 0) & (mask == 0)
        leak_vals = []
        for g in grays[1:]:
            d = np.abs(g.astype(np.int16) - base_gray.astype(np.int16))
            if ring.any():
                leak_vals.append(float((d[ring] > 4).mean()))
        leakage = float(np.max(leak_vals)) if leak_vals else 0.0
        checks["mask_leakage_ratio"] = {
            "value": leakage,
            "threshold": cfg["mask_leakage_ratio_max"],
            "pass": bool(leakage <= cfg["mask_leakage_ratio_max"]),
        }

        # 4. Effect present but subtle and non-pulsing: motion energy inside the
        # mask should be positive and roughly uniform over time.
        inside = mask > 0
        energies = []
        for g in grays[1:]:
            d = np.abs(g.astype(np.int16) - base_gray.astype(np.int16))
            energies.append(float(d[inside].mean()) if inside.any() else 0.0)
        if energies:
            e = np.array(energies[max(1, len(energies) // 4) :])  # after ramp-in
            mean_e = float(e.mean())
            uniform = float(e.std() / (mean_e + 1e-9))
        else:
            mean_e, uniform = 0.0, 0.0
        checks["effect_energy_present"] = {
            "value": mean_e,
            "threshold": 0.15,
            "pass": bool(mean_e >= 0.15),
        }
        checks["effect_energy_uniform"] = {
            "value": uniform,
            "threshold": cfg["energy_uniformity_tolerance"],
            "pass": bool(uniform <= cfg["energy_uniformity_tolerance"]),
        }

        passed = all(c["pass"] for c in checks.values())
        return {"category": "SCENE_LIFE", "pass": passed, "checks": checks}
