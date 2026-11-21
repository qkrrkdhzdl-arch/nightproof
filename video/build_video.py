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

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


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
    img = Image.new("RGBA", (W, 210), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # soft gradient plate
    for i in range(210):
        a = int(210 * max(0, (i - 40) / 170))
        d.line([(0, i), (W, i)], fill=(5, 8, 12, a))
    y = 118
    if kicker:
        d.text((72, y - 30), kicker.upper(), font=font(FONT_BOLD, 15), fill=AMBER)
    d.text((72, y), text, font=font(FONT_REG, 27), fill=INK)
    img.save(out)


def card(title, sub, out, foot=None, big=False):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    for i in range(H):
        shade = 10 - int(6 * (i / H))
        d.line([(0, i), (W, i)], fill=(max(6, shade), max(9, shade + 2), max(13, shade + 6)))
    d.text((72, 250), "◐", font=font(FONT_REG, 54), fill=AMBER)
    d.text((132, 258), "Nightproof", font=font(FONT_BOLD, 40), fill=INK)
    d.line([(74, 340), (150, 340)], fill=AMBER, width=3)
    d.text((72, 380), title, font=font(FONT_BOLD, 62 if big else 48), fill=INK)
    y = 380 + (96 if big else 82)
    for line in sub.split("\n"):
        d.text((72, y), line, font=font(FONT_REG, 30), fill=DIM)
        y += 46
    if foot:
        d.text((72, H - 110), foot, font=font(FONT_REG, 24), fill=(100, 116, 140))
    img.save(out)


def scene(img, caption, narration, out, kicker=None, zoom=True):
    audio = VID / "audio" / (Path(out).stem + ".mp3")
    speak(narration, audio)
    d = dur_of(audio) + 0.7
    cap = VID / "audio" / (Path(out).stem + ".png")
    caption_png(caption, cap, kicker)

    if zoom:
        vf = (f"scale=1600:1000,zoompan=z='min(1.0+0.00035*on,1.10)':"
              f"x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s={W}x{H}:fps={FPS}")
    else:
        vf = f"scale={W}:{H},fps={FPS}"
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
            scene(frames / s["image"], s["caption"], s["say"], p, s.get("kicker"), s.get("zoom", True))
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
