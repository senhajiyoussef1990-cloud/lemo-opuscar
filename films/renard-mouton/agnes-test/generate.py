#!/usr/bin/env python3
"""Agnes Video 2.5 Flash - true two-character animation test.
Key supplied exclusively by an Actions secret; never hardcode a token.
"""
import json
import os
from pathlib import Path
import time
import requests

BASE = "https://apihub.agnes-ai.com"
MODEL = "agnes-video-2.5-flash"
BRANCH = "ne-suis-pas-les-moutons"
RAW = f"https://raw.githubusercontent.com/senhajiyoussef1990-cloud/lemo-opuscar/{BRANCH}/films/renard-mouton/img"
FOX = RAW + "/renard-2.png"
SHEEP = RAW + "/mouton-content.png"
OUT = Path("films/renard-mouton/agnes-test/output")
OUT.mkdir(exist_ok=True, parents=True)
PROMPT = (
    "Create ONE CONTINUOUS SHOT with real acting and animation, not a static picture "
    "or camera zoom. In a very detailed warm 1950s retro living room, EXACTLY preserve "
    "the 2 characters from the reference pictures: <Picture 1> is a calm orange fox "
    "gentleman wearing a dark brown three-piece pinstripe suit and watch chain; "
    "<Picture 2> is a cheerful cream wool sheep in tweed flat cap, burgundy bow tie, "
    "and knitted caramel vest. The fox is on the LEFT; the sheep sits on the RIGHT "
    "holding his smartphone. The sheep uses his thumb to scroll, then pauses and "
    "looks up, blinking and raising his eyebrows. The fox turns his head toward "
    "the sheep, lifts an arm and opens his hand while explaining, then lowers it. "
    "Both characters exhibit REAL independent articulated animation: natural head "
    "turns, arm and shoulder movements, blinking, expressive eye direction, "
    "jaw motion and clearly different lip/mouth poses, subtle breathing. "
    "Respect the same character faces and outfits throughout, correct fingers, "
    "no duplicate limbs, no extra characters. Do NOT make the image float or "
    "bounce. Camera stays steady. Mid-century cartoon, warm colors, detailed ink "
    "texture, lively but restrained acting. No words on screen, no logos."
)

def agnes(method, path, **kw):
    key = os.environ["AGNES_API_KEY"].strip()
    try:
        res = requests.request(method, BASE + path, timeout=50, headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json"
        }, **kw)
    except requests.RequestException as exc:
        raise RuntimeError("Connection error: " + type(exc).__name__) from None
    if not res.ok:
        detail = res.text[:450].replace(key, "[REDACTED]")
        raise RuntimeError("HTTP %s: %s" % (res.status_code, detail))
    return res.json()

def main():
    if not os.environ.get("AGNES_API_KEY", "").strip():
        raise SystemExit("Missing repository Actions secret: AGNES_API_KEY")
    task = agnes("POST", "/v1/videos", json={
        "model": MODEL,
        "mode": "reference",
        "images": [FOX, SHEEP],
        "prompt": PROMPT,
        "seconds": "6",
        "size": "720P",
        "aspect_ratio": "9:16",
        "n": 1
    })
    vid = task.get("video_id") or task.get("id")
    if not vid:
        raise RuntimeError("Agnes returned no video_id, fields: " + str(list(task)))
    (OUT / "task.json").write_text(json.dumps({
        "video_id": vid, "model": MODEL, "references": [FOX, SHEEP]
    }, indent=2), encoding="utf-8")
    print("Video submitted. Tracking ID:", vid)
    for i in range(60):
        data = agnes("GET", "/agnesapi", params={"video_id": vid, "model_name": MODEL})
        status = str(data.get("status", "")).lower()
        print("Poll", i + 1, status or "waiting")
        if status in ("error", "failed", "canceled", "cancelled"):
            raise RuntimeError("Video generation failed. Fields: " + str(list(data)))
        nested = data.get("data") if isinstance(data.get("data"), dict) else {}
        url = data.get("url") or nested.get("url")
        if status in ("completed", "success", "succeeded", "done") and url:
            if not url.startswith("https://"):
                raise RuntimeError("Video URL must use HTTPS")
            download = requests.get(url, timeout=120)
            download.raise_for_status()
            if len(download.content) < 50000:
                raise RuntimeError("Video download is unexpectedly small")
            (OUT / "renard_mouton_animation_6s.mp4").write_bytes(download.content)
            print("Video saved:", len(download.content), "bytes")
            return
        time.sleep(10)
    raise TimeoutError("Video generation not completed during the workflow")
if __name__ == "__main__":
    main()
