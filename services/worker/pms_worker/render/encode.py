"""FFmpeg encoding: web-compatible H.264 High Profile MP4, 24 fps, yuv420p."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np


def ffmpeg_bin() -> str:
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        raise RuntimeError("ffmpeg not found on PATH and imageio-ffmpeg not installed")


class FrameEncoder:
    """Streams raw BGR frames into ffmpeg via stdin."""

    def __init__(
        self,
        out_path: str | Path,
        width: int,
        height: int,
        fps: int = 24,
        crf: int = 17,
        preset: str = "medium",
        preview: bool = False,
    ) -> None:
        self.out_path = str(out_path)
        self.width = width
        self.height = height
        if preview:
            crf, preset = 23, "veryfast"
        cmd = [
            ffmpeg_bin(),
            "-y",
            "-loglevel", "error",
            "-f", "rawvideo",
            "-pix_fmt", "bgr24",
            "-s", f"{width}x{height}",
            "-r", str(fps),
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-profile:v", "high",
            "-preset", preset,
            "-crf", str(crf),
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            self.out_path,
        ]
        Path(self.out_path).parent.mkdir(parents=True, exist_ok=True)
        self.proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        self.frame_count = 0

    def write(self, frame_bgr: np.ndarray) -> None:
        if frame_bgr.shape[0] != self.height or frame_bgr.shape[1] != self.width:
            raise ValueError(
                f"frame size {frame_bgr.shape[1]}x{frame_bgr.shape[0]} != encoder {self.width}x{self.height}"
            )
        self.proc.stdin.write(np.ascontiguousarray(frame_bgr, dtype=np.uint8).tobytes())
        self.frame_count += 1

    def close(self) -> None:
        self.proc.stdin.close()
        err = self.proc.stderr.read().decode(errors="replace")
        rc = self.proc.wait()
        if rc != 0:
            raise RuntimeError(f"ffmpeg failed (rc={rc}): {err[-2000:]}")


def concat_with_crossfade(
    clip_paths: list[str | Path],
    out_path: str | Path,
    crossfade_seconds: float = 0.5,
    crf: int = 17,
    preset: str = "medium",
) -> None:
    """Join clips with a short video dissolve at each cut instead of a hard
    cut, so the final film reads as one continuous tour through the property
    rather than a slideshow of independent clips. Requires re-encoding (xfade
    needs a filter graph, unlike the stream-copy concat demuxer)."""
    clip_paths = [Path(p) for p in clip_paths]
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if len(clip_paths) <= 1:
        if clip_paths:
            shutil.copyfile(clip_paths[0], out_path)
        return

    durations = [float(probe(p)["format"]["duration"]) for p in clip_paths]

    inputs: list[str] = []
    for p in clip_paths:
        inputs += ["-i", str(p)]

    filter_parts = []
    running_dur = durations[0]
    prev_label = "0:v"
    for i in range(1, len(clip_paths)):
        # Never overlap more than ~40% of either adjacent clip so a run of
        # short shots can't collapse into each other.
        d = max(0.1, min(crossfade_seconds, durations[i - 1] * 0.4, durations[i] * 0.4))
        offset = max(running_dur - d, 0.0)
        out_label = f"v{i}" if i < len(clip_paths) - 1 else "vout"
        filter_parts.append(
            f"[{prev_label}][{i}:v]xfade=transition=fade:duration={d:.3f}:offset={offset:.3f}[{out_label}]"
        )
        running_dur = running_dur + durations[i] - d
        prev_label = out_label

    cmd = [
        ffmpeg_bin(),
        "-y",
        "-loglevel", "error",
        *inputs,
        "-filter_complex", ";".join(filter_parts),
        "-map", f"[{prev_label}]",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-preset", preset,
        "-crf", str(crf),
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def probe(path: str | Path) -> dict:
    exe = shutil.which("ffprobe") or ffmpeg_bin().replace("ffmpeg", "ffprobe")
    out = subprocess.run(
        [
            exe,
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate,nb_frames,pix_fmt,profile,codec_name:format=duration",
            "-of", "json",
            str(path),
        ],
        check=True,
        capture_output=True,
    )
    return json.loads(out.stdout)
