#!/usr/bin/env python3
"""One-shot Agnes 2.5 Flash motion test. AGNES_API_KEY comes ONLY from GitHub Actions secrets."""
import json
import os
import pathlib
import sys
import time
import requests

MODEL = "agnes-video-2.5-flash"
ROOT = "https://apihub.agnes-ai.com"
OUT = pathlib.Path("films/renard-mouton/agnes-test/output")
OUT.mkdir(parents=True, exist_ok=True)
IMAGE = "https://raw.githubusercontent.com/senhajiyoussef1990-cloud/lemo-opuscar/ne-suis-pas-les-moutons/films/renard-mouton/img/renard-2.png"
PROMPT = (
    "Use the provided reference image as an EXACT visual reference for the same original "
    "anthropomorphic orange fox gentleman: identical face, snout, ears, cream cheeks, "
    "brown three-piece suit, tie, pocket-watch chain and 1930s retro interior. "
    "Create a REAL CHARACTER ANIMATION, NOT a still image with camera motion: "
    "the fox turns his head toward a listener, lifts and gestures with one hand, "
    "blinks naturally, shifts his shoulders and breathes subtly. He delivers a "
    "short explanatory sentence with clearly articulated jaw and lip movements "
    "(visible open, rounded, wide, and closed mouth shapes), and then relaxes. "
    "Static background and steady medium camera. Preserve the same face and "
    "clothing in every frame, correct anatomy and fingers, no extra limbs. "
    "Refined vintage mid-century cartoon aesthetic, textured fabric and fur, "
    "smooth natural performance. One continuous shot. No text or watermarks."
)

def request(method, path, **kwargs):
    key = os.environ["AGNES_API_KEY"].strip()
    h = {"Authorization": "Bearer " + key, "Content-Type": "application/json"}
    try:
        r = requests.request(method, ROOT + path, headers=h, timeout=55, **kwargs)
    except requests.RequestException as e:
        raise RuntimeError("Network or request error: " + type(e).__name__) from None
    if not r.ok:
        snippet = (r.text or "")[:450].replace(key, "[REDACTED]")
        raise RuntimeError("Agnes API HTTP %d: %s" % (r.status_code, snippet))
    return r.json()

def main():
    if not os.getenv("AGNES_API_KEY", "").strip():
        raise SystemExit("Missing GitHub Actions secret AGNES_API_KEY; see README_AGNES.md")
    response = request("POST", "/v1/videos", json={
        "model": MODEL, "mode": "keyframe", "first_frame": IMAGE,
        "prompt": PROMPT, "seconds": "6", "size": "720P",
        "aspect_ratio": "9:16", "n": 1
    })
    video_id = response.get("video_id") or response.get("id")
    if not video_id:
        raise RuntimeError("Missing video_id in response: " + str(list(response.keys())))
    print("Agnes task created. Model:", MODEL, "Video ID:", video_id)
    (OUT / "task.json").write_text(json.dumps({"model": MODEL, "video_id": video_id, "input_image": IMAGE}, indent=2))
    for attempt in range(60):
        data = request("GET", "/agnesapi", params={"video_id": video_id, "model_name": MODEL})
        status = str(data.get("status", "")).lower()
        print("Poll", attempt + 1, "status:", status or "pending")
        if status in ("failed", "error", "cancelled", "canceled"):
            raise RuntimeError("Video generation failed. Response keys: " + str(list(data.keys())))
        url = data.get("url") or (data.get("data") or {}).get("url") if isinstance(data.get("data"), dict) else data.get("url")
        if status in ("completed", "succeeded", "success", "done") and url:
            if not url.startswith("https://"):
                raise RuntimeError("Invalid video download URL.")
            video = requests.get(url, timeout=120)
            video.raise_for_status()
            if len(video.content) < 50000:
                raise RuntimeError("Unexpectedly small video response.")
            (OUT / "renard_mouvement_6s.mp4").write_bytes(video.content)
            (OUT / "result.json").write_text(json.dumps({
                "model": MODEL, "video_id": video_id, "status": status,
                "size_bytes": len(video.content)
            }, indent=2))
            print("Success: 6-second generated video saved.")
            return
        time.sleep(10)
    raise TimeoutError("The Agnes task did not complete during this GitHub Actions run.")

if __name__ == "__main__":
    main()
