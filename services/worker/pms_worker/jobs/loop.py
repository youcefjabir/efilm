"""Worker main loop: claims jobs from the web app's internal API, executes
handlers, reports progress/results. Concurrency defaults to 1 (single owner).

Run: python3 -m pms_worker.jobs.loop
Env: WEB_INTERNAL_URL, WORKER_SHARED_SECRET, WORKER_POLL_SECONDS,
     DEPTH_PROVIDER, DIRECTOR_PROVIDER, GEMINI_API_KEY (optional)
"""
from __future__ import annotations

import os
import platform
import time
import traceback

import requests

from .handlers import HANDLERS

BASE = os.environ.get("WEB_INTERNAL_URL", "http://localhost:3000").rstrip("/")
SECRET = os.environ.get("WORKER_SHARED_SECRET", "")
POLL_SECONDS = float(os.environ.get("WORKER_POLL_SECONDS", "2.5"))
WORKER_ID = f"{platform.node()}-{os.getpid()}"


def _headers() -> dict:
    return {"Authorization": f"Bearer {SECRET}"}


def _post(path: str, body: dict, timeout: int = 60) -> requests.Response:
    return requests.post(f"{BASE}{path}", json=body, headers=_headers(), timeout=timeout)


def claim() -> dict | None:
    r = _post("/api/worker/claim", {"worker_id": WORKER_ID})
    if r.status_code == 401:
        raise SystemExit("Worker secret rejected by web app (401). Check WORKER_SHARED_SECRET.")
    r.raise_for_status()
    return r.json().get("job")


def run_job(job: dict) -> None:
    job_id = job["id"]
    handler = HANDLERS.get(job["type"])

    def report_progress(progress: float, message: str = "") -> None:
        try:
            _post(f"/api/worker/jobs/{job_id}/progress", {"progress": progress, "message": message})
        except requests.RequestException:
            pass  # progress loss is non-fatal

    if handler is None:
        _post(f"/api/worker/jobs/{job_id}/fail", {"error": f"unknown job type {job['type']}", "retryable": False})
        return

    try:
        result = handler(job["payload"], report_progress)
        _post(f"/api/worker/jobs/{job_id}/complete", {"result": result}, timeout=300)
        print(f"[worker] job {job_id} ({job['type']}) completed")
    except Exception as e:
        print(f"[worker] job {job_id} failed: {e}")
        traceback.print_exc()
        _post(
            f"/api/worker/jobs/{job_id}/fail",
            {"error": f"{type(e).__name__}: {e}", "retryable": True},
        )


def main() -> None:
    if not SECRET:
        raise SystemExit("WORKER_SHARED_SECRET is required")
    print(f"[worker] {WORKER_ID} polling {BASE} every {POLL_SECONDS}s")
    consecutive_errors = 0
    while True:
        try:
            job = claim()
            consecutive_errors = 0
            if job:
                run_job(job)
                continue  # immediately look for the next job
        except SystemExit:
            raise
        except Exception as e:
            consecutive_errors += 1
            if consecutive_errors in (1, 5, 20):
                print(f"[worker] claim error ({consecutive_errors}): {e}")
            time.sleep(min(POLL_SECONDS * consecutive_errors, 30))
            continue
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
