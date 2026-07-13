"""Measurable image/video quality metrics used by the quality gates.

These implement the FAS 1 criteria: anchor PSNR, LAB color drift, line
stability, achieved-trajectory decomposition (pan/zoom/rotation + parallax
residual via dense optical flow), and temporal flicker.
"""
from __future__ import annotations

import cv2
import numpy as np


def psnr(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float64)
    b = b.astype(np.float64)
    mse = np.mean((a - b) ** 2)
    if mse <= 1e-12:
        return 99.0
    return float(10.0 * np.log10(255.0**2 / mse))


def mean_delta_e(a_bgr: np.ndarray, b_bgr: np.ndarray) -> float:
    """Mean CIE76 delta-E between two images in LAB."""
    a_lab = cv2.cvtColor(a_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    b_lab = cv2.cvtColor(b_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    # OpenCV LAB for uint8: L in [0,255] (=L*255/100), a/b offset by 128.
    a_lab[..., 0] *= 100.0 / 255.0
    b_lab[..., 0] *= 100.0 / 255.0
    return float(np.mean(np.linalg.norm(a_lab - b_lab, axis=2)))


def estimate_affine_motion(prev_gray: np.ndarray, cur_gray: np.ndarray):
    """Decompose inter-frame motion into (pan_x, pan_y, scale, rot_deg) via
    sparse features + estimateAffinePartial2D, plus the dense-flow residual
    after removing that affine model (the measured parallax)."""
    h, w = prev_gray.shape[:2]
    pts = cv2.goodFeaturesToTrack(prev_gray, maxCorners=400, qualityLevel=0.01, minDistance=12)
    result = {
        "pan_x": 0.0,
        "pan_y": 0.0,
        "scale": 1.0,
        "rot_deg": 0.0,
        "parallax_median": 0.0,
        "parallax_p95": 0.0,
        "valid": False,
        "affine": None,
    }
    if pts is None or len(pts) < 20:
        return result
    nxt, status, _ = cv2.calcOpticalFlowPyrLK(prev_gray, cur_gray, pts, None)
    good_prev = pts[status.flatten() == 1]
    good_next = nxt[status.flatten() == 1]
    if len(good_prev) < 20:
        return result
    m, inliers = cv2.estimateAffinePartial2D(good_prev, good_next, method=cv2.RANSAC)
    if m is None:
        return result
    scale = float(np.hypot(m[0, 0], m[0, 1]))
    rot = float(np.degrees(np.arctan2(m[0, 1], m[0, 0])))
    result.update(
        {
            "pan_x": float(m[0, 2]) / w,
            "pan_y": float(m[1, 2]) / h,
            "scale": scale,
            "rot_deg": rot,
            "valid": True,
            "affine": m,
        }
    )

    # Dense flow on downscaled frames for the parallax residual.
    target_w = 480
    f = target_w / w
    small_prev = cv2.resize(prev_gray, None, fx=f, fy=f)
    small_cur = cv2.resize(cur_gray, None, fx=f, fy=f)
    flow = cv2.calcOpticalFlowFarneback(
        small_prev, small_cur, None, 0.5, 3, 21, 3, 5, 1.2, 0
    )
    sh, sw = small_prev.shape[:2]
    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    ms = m.copy()
    ms[:, 2] *= f
    pred_x = ms[0, 0] * xx + ms[0, 1] * yy + ms[0, 2] - xx
    pred_y = ms[1, 0] * xx + ms[1, 1] * yy + ms[1, 2] - yy
    resid = np.hypot(flow[..., 0] - pred_x, flow[..., 1] - pred_y) / sw
    # Ignore the outer border where replication padding distorts flow.
    b = int(0.03 * sw)
    resid_in = resid[b:-b, b:-b] if b > 0 else resid
    result["parallax_median"] = float(np.median(resid_in))
    result["parallax_p95"] = float(np.percentile(resid_in, 95))
    return result


def detect_long_lines(gray: np.ndarray, min_len_px: int = 40):
    edges = cv2.Canny(gray, 60, 160)
    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180, threshold=50, minLineLength=min_len_px, maxLineGap=6
    )
    if lines is None:
        return []
    return lines.reshape(-1, 4)


def _gradient_magnitude(gray: np.ndarray) -> np.ndarray:
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    return np.hypot(gx, gy)


def _profile_peak(mag: np.ndarray, base, normal, search_px: float):
    """Strongest gradient peak along the perpendicular profile. Returns
    (offset, peak_mag, n_competing_peaks)."""
    h, w = mag.shape[:2]
    offsets = np.arange(-search_px, search_px + 0.5, 0.5)
    vals = np.full(len(offsets), -1.0)
    for k, off in enumerate(offsets):
        q = base + normal * off
        xq, yq = int(round(q[0])), int(round(q[1]))
        if 1 <= xq < w - 1 and 1 <= yq < h - 1:
            vals[k] = mag[yq, xq]
    best_k = int(np.argmax(vals))
    if vals[best_k] <= 0:
        return None, 0.0, 0
    # Count competing local maxima at least half as strong and >2px away.
    strong = vals > vals[best_k] * 0.55
    competing = 0
    k = 0
    while k < len(offsets):
        if strong[k]:
            k2 = k
            while k2 < len(offsets) and strong[k2]:
                k2 += 1
            if abs(offsets[(k + k2 - 1) // 2] - offsets[best_k]) > 2.0:
                competing += 1
            k = k2
        else:
            k += 1
    return float(offsets[best_k]), float(vals[best_k]), competing


def measure_line_bending(
    anchor_gray: np.ndarray,
    target_gray: np.ndarray,
    lines,
    affine: np.ndarray | None,
    search_px: float = 6.0,
) -> dict:
    """Measure how much source lines BEND in a target frame.

    Only unambiguous lines are used: at each sample point the anchor frame
    must show a single dominant perpendicular edge (rejects parallel-line
    clutter like floor boards near a vanishing point). In the target frame the
    edge is located by a perpendicular gradient-peak search; the linear
    component along the line (translation/rotation, incl. legitimate parallax
    of a straight line) is removed; the residual is true bending, reported as
    a fraction of line length (FAS 1 criterion: < 0.3%). Returns the p90 over
    measured lines to stay robust against single mismatches.
    """
    anchor_mag = _gradient_magnitude(anchor_gray)
    target_mag = _gradient_magnitude(target_gray)

    bends = []
    for x1, y1, x2, y2 in lines[:60]:
        a1 = np.array([x1, y1], np.float64)
        a2 = np.array([x2, y2], np.float64)
        length = float(np.linalg.norm(a2 - a1))
        if length < 40:
            continue
        direction = (a2 - a1) / length
        normal = np.array([-direction[1], direction[0]])

        p1, p2 = a1, a2
        if affine is not None:
            p1 = affine[:, :2] @ a1 + affine[:, 2]
            p2 = affine[:, :2] @ a2 + affine[:, 2]

        n_samples = int(np.clip(length / 14, 8, 24))
        ts = np.linspace(0.08, 0.92, n_samples)
        offsets_found, ts_found = [], []
        ambiguous = 0
        for t in ts:
            base_a = a1 + (a2 - a1) * t
            off_a, mag_a, competing_a = _profile_peak(anchor_mag, base_a, normal, search_px)
            if off_a is None or mag_a < 25.0 or competing_a > 0 or abs(off_a) > 2.0:
                ambiguous += 1
                continue
            base_t = p1 + (p2 - p1) * t
            off_t, mag_t, competing_t = _profile_peak(target_mag, base_t, normal, search_px)
            if off_t is None or mag_t < 20.0 or competing_t > 0:
                ambiguous += 1
                continue
            offsets_found.append(off_t - off_a)
            ts_found.append(t)
        if len(offsets_found) < 6 or ambiguous > n_samples * 0.5:
            continue
        offs = np.array(offsets_found)
        tsf = np.array(ts_found)
        coeff = np.polyfit(tsf, offs, 1)
        resid = offs - np.polyval(coeff, tsf)
        bend_px = float(np.percentile(np.abs(resid), 90))
        bends.append(bend_px / length)

    if not bends:
        return {"max_bend_fraction": 0.0, "mean_bend_fraction": 0.0, "lines_measured": 0}
    return {
        "max_bend_fraction": float(np.percentile(bends, 90)),
        "mean_bend_fraction": float(np.mean(bends)),
        "lines_measured": len(bends),
    }


def line_straightness_score(gray: np.ndarray, lines) -> float:
    """Measure how straight the neighborhoods of given source lines remain in a
    frame: samples edge-strength along each line; a bent line loses edge
    support. Returns mean support in [0, 1]."""
    if len(lines) == 0:
        return 1.0
    edges = cv2.Canny(gray, 50, 150)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8))
    supports = []
    for x1, y1, x2, y2 in lines[:60]:
        n = max(int(np.hypot(x2 - x1, y2 - y1) / 2), 8)
        xs = np.linspace(x1, x2, n).astype(int).clip(0, gray.shape[1] - 1)
        ys = np.linspace(y1, y2, n).astype(int).clip(0, gray.shape[0] - 1)
        supports.append(float((edges[ys, xs] > 0).mean()))
    return float(np.mean(supports))


def temporal_flicker(mean_luma_series: list[float], fps: float) -> float:
    """Amplitude of periodic luma oscillation (flicker) relative to the mean.
    Returns the peak normalized FFT magnitude in the 1..fps/2 Hz band after
    removing the linear trend (planned exposure change from motion is slow)."""
    y = np.asarray(mean_luma_series, dtype=np.float64)
    if len(y) < 8:
        return 0.0
    t = np.arange(len(y))
    coeffs = np.polyfit(t, y, deg=2)
    detrended = y - np.polyval(coeffs, t)
    spectrum = np.abs(np.fft.rfft(detrended))
    freqs = np.fft.rfftfreq(len(y), d=1.0 / fps)
    band = (freqs >= 1.0) & (freqs <= fps / 2)
    if not band.any():
        return 0.0
    return float(spectrum[band].max() / (np.mean(y) + 1e-9) / len(y) * 2.0)
