#!/usr/bin/env python3
"""Technical audio QC for narrated Papy exports.

A large first difference is not proof of a click: voiced consonants,
intentional percussion and AAC resampling legitimately produce thousands.
Detect *isolated impulses above their local acoustic envelope* instead.
Automated signal QC cannot replace listening to the final mix.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.ndimage import uniform_filter1d

SR = 16000

def decode(path):
    process = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path),
         "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
    )
    x = np.frombuffer(process.stdout, dtype="<f4")
    if not len(x):
        raise RuntimeError("Audio not decoded: " + str(path))
    if not np.isfinite(x).all():
        raise RuntimeError("Non-finite audio samples: " + str(path))
    return x

def find_isolated_spikes(x):
    """Detect single-sample discontinuities whose amplitude dwarfs 10ms context.

    Consecutive high-frequency voiced samples can have very large differences,
    but do not exceed six times the local RMS. An isolated large glitch does.
    Report separated events, not individual flagged samples.
    """
    if len(x) < 512:
        return np.array([], dtype=np.int64)
    energy = np.maximum(uniform_filter1d(x*x, size=161, mode="nearest"), 0)
    local_rms = np.sqrt(energy)
    residual = np.abs(x[1:-1] - (x[:-2] + x[2:]) * .5)
    candidates = np.flatnonzero(
        (residual > .20) &
        (residual > 6.0 * np.maximum(local_rms[1:-1], .003)) &
        (np.abs(x[1:-1]) > .20)
    ) + 1
    # Close samples forming the same one click are one event (16 ms apart).
    if not len(candidates):
        return candidates
    events = candidates[np.r_[True, np.diff(candidates) > int(.016*SR)]]
    return events

def inspect(path):
    x = decode(path)
    duration = len(x)/SR
    peak = float(np.max(np.abs(x)))
    rms = float(np.sqrt(np.mean(x*x)))
    clipped = int(np.count_nonzero(np.abs(x) >= .998))
    windows = np.array_split(x, max(1, int(duration)))
    quiet = int(sum(float(np.sqrt(np.mean(w*w))) < .0004 for w in windows))
    # Preserve the old crude metric for diagnosis only; it is not a click detector.
    d = np.abs(np.diff(x))
    gradients = int(np.count_nonzero(
        (d > .48) & (np.abs(x[:-1]) > .23) & (np.abs(x[1:]) > .23)
    ))
    spikes = find_isolated_spikes(x)
    return {
        "file": str(path), "duration_s": round(duration, 2),
        "peak": round(peak, 4), "rms": round(rms, 5),
        "clipped_samples": clipped, "abrupt_gradients_not_clicks": gradients,
        "isolated_spikes": int(len(spikes)),
        "spike_times_s": [round(float(i/SR), 3) for i in spikes[:30]],
        "silent_1s_windows": quiet
    }

def main(d, slug, mix_only=False):
    paths = [d/"out/mix.wav"]
    if not mix_only:
        paths += [
            d/f"le-livre-de-papy-{slug}-short-9x16.mp4",
            d/f"le-livre-de-papy-{slug}-youtube-16x9.mp4",
        ]
    report = [inspect(p) for p in paths]
    (d/("audio-preflight.json" if mix_only else "audio-qc.json")).write_text(
        json.dumps(report, indent=2) + "\n"
    )
    for r in report:
        print("AUDIO-QC", json.dumps(r))
        if r["peak"] > .999 or r["clipped_samples"] > 10:
            raise RuntimeError("Clipping/saturation: " + r["file"])
        if r["rms"] < .003:
            raise RuntimeError("Audio nearly silent: " + r["file"])
        if r["isolated_spikes"] > 25:
            raise RuntimeError("Too many isolated acoustic impulses: " + r["file"])
    if len(report) == 3:
        if max(
            abs(report[1]["duration_s"]-report[2]["duration_s"]),
            abs(report[0]["duration_s"]-report[1]["duration_s"])
        ) > 2.0:
            raise RuntimeError("Audio durations differ between formats")
    print("Technical audio checks passed; direct listening is still required.")

if __name__ == "__main__":
    main(Path(sys.argv[1]), sys.argv[2], "--mix-only" in sys.argv[3:])
