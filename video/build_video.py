#!/usr/bin/env python3
"""Build the Nightproof demo video.

Screens are captured from the live app in a real browser; this script only lays them
out: a slow push-in on each screen, one caption line, English narration, title and
end cards. No mocked UI.

    python3 video/build_video.py
"""
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
VID = ROOT / "video"
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 1280, 800
FPS = 30

INK = (233, 238, 245)
DIM = (147, 163, 182)
AMBER = (232, 180, 106)
BG = (7, 10, 15)

import matplotlib
_TTF = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
FONT_BOLD = os.path.join(_TTF, "DejaVuSans-Bold.ttf")
FONT_REG = os.path.join(_TTF, "DejaVuSans.ttf")
FONT_SERIF = "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"
FONT_SERIF_B = "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def dur_of(path):
    out = subprocess.run([FF, "-i", str(path)], capture_output=True, text=True).stderr
    for line in out.splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 3.0


def caption_png(text, out, kicker=None):
    img = Image.new("RGBA", (W, 230), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(230):
        a = int(215 * max(0, (i - 30) / 200))
        d.line([(0, i), (W, i)], fill=(4, 6, 10, a))
    f_cap = font(FONT_REG, 30)
    f_kick = font(FONT_BOLD, 14)
    tw = d.textlength(text, font=f_cap)
    pad = 26
    box_w = min(W - 96, int(tw) + pad * 2)
    bx0 = 60
    by0 = 92
    by1 = by0 + (74 if kicker else 62)
    d.rounded_rectangle([bx0, by0, bx0 + box_w, by1], radius=14, fill=(10, 14, 20, 232), outline=(39, 54, 74, 255))
    if kicker:
        d.text((bx0 + pad, by0 + 14), kicker.upper(), font=f_kick, fill=AMBER)
        d.text((bx0 + pad, by0 + 34), text, font=f_cap, fill=INK)
    else:
        d.text((bx0 + pad, by0 + 16), text, font=f_cap, fill=INK)
    img.save(out)


def card(title, sub, out, foot=None, big=False):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for i in range(H):
        t = i / H
        d.line([(0, i), (W, i)], fill=(int(10 - 5 * t), int(14 - 7 * t), int(21 - 10 * t)))
    # mark: a half-lit circle, drawn rather than typed
    cx, cy, r = 108, 118, 15
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=AMBER)
    d.ellipse([cx, cy - r, cx + 2 * r, cy + r], fill=(10, 14, 21))
    d.text((cx + 30, cy - 18), "Nightproof", font=font(FONT_BOLD, 30), fill=INK)
    d.line([(96, 236), (232, 236)], fill=AMBER, width=3)

    size = 66 if big else 54
    f_title = font(FONT_SERIF_B, size)
    y = 300
    for line in title.split("\n"):
        d.text((96, y), line, font=f_title, fill=INK)
        y += int(size * 1.22)
    y += 26
    for line in sub.split("\n"):
        d.text((96, y), line, font=font(FONT_REG, 26), fill=DIM)
        y += 40
    if foot:
        d.text((96, H - 96), foot, font=font(FONT_REG, 21), fill=(100, 116, 140))
    img.save(out)


def scene(img, caption, narration, out, kicker=None, zoom=True, focus=False):
    audio = VID / "audio" / (Path(out).stem + ".mp3")
    speak(narration, audio)
    d = dur_of(audio) + 0.7
    cap = VID / "audio" / (Path(out).stem + ".png")
    caption_png(caption, cap, kicker)

    if focus:
        vf = (f"crop={W}:{H}:(iw-{W})/2:max(0\,(ih-{H})/2),scale={W}:{H},fps={FPS}")
    else:
        vf = f"scale={W}:-2,pad={W}:{H}:0:(oh-ih)/2:color=0x090d13,fps={FPS}"
    filt = (
        f"[0:v]{vf},format=rgba[bg];"
        f"[bg][1:v]overlay=0:{H-210}:format=auto[v0];"
        f"[v0]fade=t=in:st=0:d=0.35,fade=t=out:st={d - 0.35:.2f}:d=0.35,format=yuv420p[v]"
    )
    cmd = [FF, "-y", "-loop", "1", "-i", str(img), "-loop", "1", "-i", str(cap),
           "-i", str(audio),
           "-filter_complex", filt, "-map", "[v]", "-map", "2:a",
           "-t", f"{d:.2f}", "-r", str(FPS), "-c:v", "libx264", "-crf", "19",
           "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-ar", "44100",
           "-shortest", str(out)]
    subprocess.run(cmd, check=True, capture_output=True)


def still(img, narration, out, hold=0.0):
    audio = VID / "audio" / (Path(out).stem + ".mp3")
    speak(narration, audio)
    d = (dur_of(audio) if narration else hold) + 0.9
    cmd = [FF, "-y", "-loop", "1", "-i", str(img), "-i", str(audio),
           "-filter_complex", f"[0:v]scale={W}:{H},fps={FPS},format=yuv420p[v]",
           "-map", "[v]", "-map", "1:a", "-t", f"{d:.2f}",
           "-c:v", "libx264", "-crf", "19", "-preset", "medium",
           "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-shortest", str(out)]
    subprocess.run(cmd, check=True, capture_output=True)


def speak(text, out):
    from gtts import gTTS
    gTTS(text, lang="en", slow=False).save(str(out))


def main():
    frames = VID / "frames"
    out = VID / "out"
    out.mkdir(parents=True, exist_ok=True)
    scenes = json.load(open(VID / "scenes.json"))
    parts = []
    for i, s in enumerate(scenes):
        p = out / f"{i:02d}.mp4"
        if s["kind"] == "card":
            card(s["title"], s["sub"], frames / f"card{i}.png", s.get("foot"), s.get("big", False))
            still(frames / f"card{i}.png", s.get("say", ""), p, hold=3.4)
        elif s["kind"] == "still":
            still(frames / s["image"], s["say"], p, hold=s.get("hold", 3.0))
        else:
            scene(frames / s["image"], s["caption"], s["say"], p, s.get("kicker"), s.get("zoom", True), s.get("focus", False))
        parts.append(p)
        print("built", p.name, f"{dur_of(p):.1f}s")
    listing = out / "list.txt"
    listing.write_text("".join(f"file '{p.name}'\n" for p in parts))
    final = VID / "nightproof-demo.mp4"
    subprocess.run([FF, "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
                    "-c", "copy", str(final)], check=True, capture_output=True)
    print("final:", final, f"{dur_of(final):.1f}s", os.path.getsize(final) // 1024, "KB")


if __name__ == "__main__":
    main()
