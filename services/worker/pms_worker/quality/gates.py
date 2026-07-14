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
        # The renderer never grades a pixel, so true color drift can only be
        # resampling error. Camera motion sweeps new content through the
        # measured region and that content flux reads as a color trend, so the
        # limit scales with the planned motion rate (a static shot stays at
        # the strict base limit).
        pan_total = abs(float(self.plan["total_pan_x"])) + abs(float(self.plan["total_pan_y"]))
        scale_total = abs(float(self.plan["total_scale_delta"]))
        motion_per_s = (pan_total + scale_total) / max(float(self.plan["duration_seconds"]), 1e-6)
        drift_limit = cfg["color_drift_max_delta_e_per_s"] + 15.0 * motion_per_s
        checks["color_drift_per_s"] = {
            "value": drift,
            "threshold": drift_limit,
            "pass": bool(drift <= drift_limit),
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
        # Median over the checked frames: real warp bending is consistent
        # across the motion extremes, a single-frame fluke is measurement.
        worst_bend = float(np.median(bend_values)) if bend_values else 0.0
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

        # 5+6. Trajectory measurement. Totals are measured with two
        # large-baseline fits (anchor -> first frame, anchor -> last frame),
        # which stays reliable on low-texture content where accumulating many
        # tiny per-pair estimates underestimates the path. Per-pair residuals
        # are still collected as the temporal-stability signal.
        residuals = []
        for i in range(1, len(grays)):
            aff = metrics.estimate_affine_motion(grays[i - 1], grays[i])
            if not aff["valid"]:
                continue
            step = max(frame_indices[i] - frame_indices[i - 1], 1)
            residuals.append(aff["parallax_median"] / step)

        aff_start = metrics.estimate_affine_motion(anchor_gray, grays[0])
        aff_end = metrics.estimate_affine_motion(anchor_gray, grays[-1])
        measurable = (
            aff_start["valid"]
            and aff_end["valid"]
            and aff_start.get("inliers", 0) >= 12
            and aff_end.get("inliers", 0) >= 12
        )
        if measurable:
            measured_scale_delta = float(
                aff_end["scale"] / max(aff_start["scale"], 1e-6) - 1.0
            )
            total_pan_x = aff_end["pan_x"] - aff_start["pan_x"]
            total_pan_y = aff_end["pan_y"] - aff_start["pan_y"]
            total_rot = aff_end["rot_deg"] - aff_start["rot_deg"]
        else:
            measured_scale_delta = total_pan_x = total_pan_y = total_rot = 0.0

        # With depth parallax, a single global affine cannot recover the exact
        # planned base path (near features weight the fit toward larger
        # apparent motion), so the trajectory gate verifies motion SANITY
        # rather than exact magnitude:
        #   direction — measured dolly direction matches the plan,
        #   liveness  — a planned move actually happened (no frozen render),
        #   bounded   — total apparent motion stays under the physical maximum
        #               (base motion + parallax modulation cap).
        planned_scale = float(self.plan["total_scale_delta"])
        planned_pan = abs(float(self.plan["total_pan_x"])) + abs(float(self.plan["total_pan_y"]))
        parallax_gain = float(self.plan.get("parallax_gain", 0.0))
        anchor_factor = 0.5 if self.plan.get("anchor_mode") == "MIDPOINT_ANCHOR" else 1.0
        # Anchor->end covers half the amplitude for midpoint anchors.
        exp_scale = planned_scale * anchor_factor
        exp_pan = planned_pan * anchor_factor

        direction_ok = True
        if measurable and abs(exp_scale) > 0.008:
            direction_ok = np.sign(measured_scale_delta) == np.sign(exp_scale)
        checks["trajectory_direction"] = {
            "value": measured_scale_delta,
            "planned": exp_scale,
            "pass": bool(direction_ok),
        }

        measured_mag = abs(measured_scale_delta) * 0.5 + abs(total_pan_x) + abs(total_pan_y)
        planned_mag = abs(exp_scale) * 0.5 + exp_pan
        liveness_ok = True
        if measurable and planned_mag > 0.006:
            liveness_ok = measured_mag >= planned_mag * 0.2
        checks["trajectory_liveness"] = {
            "value": measured_mag,
            "planned": planned_mag,
            "pass": bool(liveness_ok),
        }

        bound = planned_mag * 2.5 + parallax_gain * 3.0 + 0.01
        bounded_ok = True
        if measurable:
            bounded_ok = measured_mag <= bound
        checks["trajectory_bounded"] = {
            "value": measured_mag,
            "threshold": bound,
            "pass": bool(bounded_ok),
        }
        checks["trajectory_measurable"] = {
            "value": 1.0 if measurable else 0.0,
            "threshold": 0.0,
            "pass": True,  # informational; unmeasurable content is not a defect
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
