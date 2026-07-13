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


def concat_mp4s(clip_paths: list[str | Path], out_path: str | Path) -> None:
    """Losslessly concatenate identically-encoded MP4 clips (cuts only)."""
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    list_file = out_path.with_suffix(".concat.txt")
    with open(list_file, "w") as f:
        for p in clip_paths:
            f.write(f"file '{Path(p).resolve()}'\n")
    cmd = [
        ffmpeg_bin(),
        "-y",
        "-loglevel", "error",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        "-movflags", "+faststart",
        str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    list_file.unlink(missing_ok=True)


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
