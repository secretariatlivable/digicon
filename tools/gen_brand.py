"""
DigiCon brand & PWA asset generator
===================================
 * PWA icons (192 / 512 / 180 apple-touch, plus dedicated maskable variants)
 * favicon.ico
 * Open Graph / Twitter share image (1200x630)
 * Ambient hero video loop (mp4 + webm) + poster frame
"""
import math
import os
import shutil
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PUBLIC = os.environ.get("DIGICON_PUBLIC", "/root/digicon_src/project/public")
MEDIA = os.path.join(PUBLIC, "media")
os.makedirs(MEDIA, exist_ok=True)

LOGO = os.path.join(PUBLIC, "DigiCon.png")
BRAND_BG = (5, 7, 16)
PRIMARY = (0x00, 0x7A, 0xFF)
INFO = (0x5A, 0xC8, 0xFA)
VIOLET = (0x8B, 0x5C, 0xF6)
ECO = (0x10, 0xB9, 0x81)
STEEL = (0xC9, 0xD6, 0xE8)

FONT_DIR = "/usr/share/fonts/truetype/google-fonts"
FALLBACK_DIR = "/usr/share/fonts/truetype/dejavu"


def font(weight="Bold", size=48):
    for path in (os.path.join(FONT_DIR, f"Poppins-{weight}.ttf"),
                 os.path.join(FALLBACK_DIR, "DejaVuSans-Bold.ttf"),
                 os.path.join(FALLBACK_DIR, "DejaVuSans.ttf")):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def logo_plate(size, corner=0.30):
    """
    The DigiCon mark ships on a white plate. Round that plate into a squircle so
    it reads as a deliberate badge floating on the gradient rather than a
    pasted rectangle.
    """
    mark = Image.open(LOGO).convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=int(size * corner), fill=255
    )
    # respect any transparency already in the source
    mask = Image.fromarray(
        (np.asarray(mask, dtype=np.float32) * (np.asarray(mark)[:, :, 3] / 255.0)).astype("uint8")
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(mark, (0, 0), mask)
    return out


# ------------------------------------------------------------------ shared
def radial(size, cx, cy, radius, color, intensity, falloff=2.4):
    w, h = size
    xs = (np.arange(w, dtype=np.float32) - cx * w) / (radius * w)
    ys = (np.arange(h, dtype=np.float32) - cy * h) / (radius * w)
    d = np.sqrt(xs[None, :] ** 2 + ys[:, None] ** 2)
    field = np.clip(1.0 - d, 0.0, 1.0) ** falloff
    return field[:, :, None] * np.array(color, dtype=np.float32)[None, None, :] * intensity


def tone(a, saturation=1.18, contrast=1.08, exposure=1.5):
    x = np.clip(a, 0, None) / 255.0 * exposure
    x = x / (1.0 + x * 0.48)
    lum = (x * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)).sum(-1, keepdims=True)
    x = np.clip(lum + (x - lum) * saturation, 0.0, 1.0)
    x = np.clip((x - 0.5) * contrast + 0.5, 0.0, 1.0)
    return (x * 255.0).astype(np.uint8)


# ------------------------------------------------------------------ icons
def icons():
    print("Rendering PWA icons…")
    def tile(size, pad_ratio, rounded, filename):
        canvas_arr = np.zeros((size, size, 3), dtype=np.float32)
        canvas_arr[:, :] = BRAND_BG
        canvas_arr += radial((size, size), 0.28, 0.24, 0.85, PRIMARY, 1.10)
        canvas_arr += radial((size, size), 0.80, 0.82, 0.75, VIOLET, 0.80)
        canvas_arr += radial((size, size), 0.72, 0.20, 0.55, INFO, 0.55)
        bg = Image.fromarray(tone(canvas_arr, exposure=1.3), "RGB").convert("RGBA")

        inner = int(size * (1 - pad_ratio * 2))
        mark = logo_plate(inner)
        # soft glow behind the mark for depth
        glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        glow.paste(mark, (int(size * pad_ratio), int(size * pad_ratio)), mark)
        bg = Image.alpha_composite(bg, glow.filter(ImageFilter.GaussianBlur(size * 0.05)))
        bg = Image.alpha_composite(bg, glow)

        if rounded:
            mask = Image.new("L", (size, size), 0)
            ImageDraw.Draw(mask).rounded_rectangle(
                [0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255
            )
            out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            out.paste(bg, (0, 0), mask)
        else:
            out = bg
        out.convert("RGB").save(os.path.join(PUBLIC, filename)) if not rounded else out.save(
            os.path.join(PUBLIC, filename)
        )
        print(f"  ✓ {filename}")

    # standard "any" icons — rounded, art-directed
    tile(192, 0.16, True, "icon-192.png")
    tile(512, 0.16, True, "icon-512.png")
    tile(180, 0.14, True, "apple-touch-icon.png")
    # maskable icons need generous safe-area padding (mark inside the 80% circle)
    tile(192, 0.26, False, "icon-maskable-192.png")
    tile(512, 0.26, False, "icon-maskable-512.png")

    ico = Image.open(os.path.join(PUBLIC, "icon-192.png")).convert("RGBA")
    ico.save(os.path.join(PUBLIC, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("  ✓ favicon.ico")


# ------------------------------------------------------------------ og image
def og_image():
    print("Rendering Open Graph image…")
    W, H = 1200, 630
    a = np.zeros((H, W, 3), dtype=np.float32)
    a[:, :] = BRAND_BG
    a += radial((W, H), 0.22, 0.30, 0.62, PRIMARY, 1.25)
    a += radial((W, H), 0.82, 0.24, 0.50, VIOLET, 0.90)
    a += radial((W, H), 0.60, 0.92, 0.48, ECO, 0.42)

    # metallic sheen
    xs = np.arange(W, dtype=np.float32)[None, :] / W
    ys = np.arange(H, dtype=np.float32)[:, None] / H
    ang = math.radians(118)
    d = np.abs(math.cos(ang) * (xs - 0.40) + math.sin(ang) * (ys - 0.5)) / 0.05
    a += (np.clip(1 - d, 0, 1) ** 2.6)[:, :, None] * np.array(STEEL, dtype=np.float32) * 0.45

    im = Image.fromarray(tone(a, exposure=1.45), "RGB").convert("RGBA")

    # graph motif
    rng = np.random.default_rng(9)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    pts = np.column_stack([rng.uniform(0.02, 0.98, 26), rng.uniform(0.05, 0.95, 26)])
    for i in range(26):
        for j in range(i + 1, 26):
            dist = math.hypot(*(pts[i] - pts[j]))
            if dist < 0.24:
                dr.line([pts[i][0] * W, pts[i][1] * H, pts[j][0] * W, pts[j][1] * H],
                        fill=INFO + (int(90 * (1 - dist / 0.24)),), width=2)
    for i in range(26):
        r = int(rng.integers(4, 10))
        x, y = pts[i][0] * W, pts[i][1] * H
        dr.ellipse([x - r, y - r, x + r, y + r], fill=INFO + (150,))
    im = Image.alpha_composite(im, layer.filter(ImageFilter.GaussianBlur(1.0)))

    # darken lower third so the wordmark area reads
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for y in range(H):
        t = max(0.0, (y / H - 0.35) / 0.65)
        sd.line([0, y, W, y], fill=(2, 4, 12, int(215 * t ** 1.4)))
    im = Image.alpha_composite(im, scrim)

    logo = logo_plate(92)
    im.paste(logo, (80, 92), logo)

    d2 = ImageDraw.Draw(im)
    d2.text((188, 122), "DigiCon", font=font("Bold", 44), fill=(255, 255, 255, 255))
    d2.text((80, 262), "More than a digital", font=font("Bold", 62), fill=(255, 255, 255, 255))
    d2.text((80, 330), "business card.", font=font("Bold", 62), fill=(255, 255, 255, 255))
    d2.text((80, 416), "Turn introductions into relationships.",
            font=font("Light", 34), fill=(168, 200, 246, 255))
    d2.line([80, 240, 158, 240], fill=(0x5A, 0xC8, 0xFA, 255), width=5)
    d2.text((80, 500), "digicon.cards", font=font("Medium", 26), fill=(255, 255, 255, 180))
    im.convert("RGB").save(os.path.join(MEDIA, "og-image.jpg"), quality=88, optimize=True)
    print("  ✓ media/og-image.jpg")


# ------------------------------------------------------------------ video
def ambient_video(seconds=8, fps=24, w=1280, h=720):
    """
    Seamless ambient loop for the hero: drifting light blooms + a living
    connection graph. Every parameter is periodic over `seconds` so the
    last frame flows straight back into the first.
    """
    if not shutil.which("ffmpeg"):
        print("!! ffmpeg not found — skipping ambient video")
        return
    print(f"Rendering ambient hero loop ({seconds}s @ {fps}fps)…")
    frames = seconds * fps
    rng = np.random.default_rng(4)
    nodes = 26
    base_pts = np.column_stack([rng.uniform(0.05, 0.95, nodes), rng.uniform(0.08, 0.92, nodes)])
    drift_amp = rng.uniform(0.008, 0.030, (nodes, 2))
    drift_phase = rng.uniform(0, math.tau, (nodes, 2))
    drift_cycles = rng.integers(1, 3, (nodes, 2))  # integer cycles ⇒ seamless loop

    tmp = tempfile.mkdtemp(prefix="digicon_vid_")
    poster = None
    for f in range(frames):
        t = f / frames
        a = np.zeros((h, w, 3), dtype=np.float32)
        a[:, :] = BRAND_BG
        a += radial((w, h), 0.26 + 0.05 * math.sin(t * math.tau),
                    0.34 + 0.04 * math.cos(t * math.tau), 0.66, PRIMARY,
                    1.15 + 0.18 * math.sin(t * math.tau))
        a += radial((w, h), 0.78 - 0.05 * math.cos(t * math.tau),
                    0.26 + 0.05 * math.sin(t * math.tau + 1.2), 0.54, VIOLET,
                    0.85 + 0.15 * math.cos(t * math.tau))
        a += radial((w, h), 0.55 + 0.06 * math.sin(t * math.tau + 2.1), 0.88, 0.50, ECO, 0.45)
        a += radial((w, h), 0.14, 0.72 - 0.04 * math.sin(t * math.tau), 0.40, INFO, 0.50)

        # travelling metallic sheen (wraps at the loop point)
        xs = np.arange(w, dtype=np.float32)[None, :] / w
        ys = np.arange(h, dtype=np.float32)[:, None] / h
        ang = math.radians(118)
        offset = -0.25 + 1.5 * t
        d = np.abs(math.cos(ang) * (xs - offset) + math.sin(ang) * (ys - 0.5)) / 0.045
        a += (np.clip(1 - d, 0, 1) ** 2.8)[:, :, None] * np.array(STEEL, dtype=np.float32) * 0.40

        img = Image.fromarray(tone(a, exposure=1.42), "RGB").convert("RGBA")

        pts = base_pts + drift_amp * np.sin(t * math.tau * drift_cycles + drift_phase)
        layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dr = ImageDraw.Draw(layer)
        for i in range(nodes):
            for j in range(i + 1, nodes):
                dist = math.hypot(*(pts[i] - pts[j]))
                if dist < 0.26:
                    dr.line([pts[i][0] * w, pts[i][1] * h, pts[j][0] * w, pts[j][1] * h],
                            fill=INFO + (int(80 * (1 - dist / 0.26)),), width=2)
        for i in range(nodes):
            pulse = 0.5 + 0.5 * math.sin(t * math.tau * float(drift_cycles[i][0]) + drift_phase[i][0])
            r = 4 + 6 * pulse
            x, y = pts[i][0] * w, pts[i][1] * h
            dr.ellipse([x - r, y - r, x + r, y + r], fill=INFO + (int(120 + 90 * pulse),))
            dr.ellipse([x - r * 3, y - r * 3, x + r * 3, y + r * 3], fill=INFO + (22,))
        img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(1.3)))

        rgb = img.convert("RGB")
        rgb.save(os.path.join(tmp, f"{f:04d}.png"))
        if f == 0:
            poster = rgb

    mp4 = os.path.join(MEDIA, "hero-loop.mp4")
    webm = os.path.join(MEDIA, "hero-loop.webm")
    common = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
              "-i", os.path.join(tmp, "%04d.png")]
    subprocess.run(common + ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
                             "-crf", "30", "-preset", "slow", "-movflags", "+faststart", mp4],
                   check=True)
    subprocess.run(common + ["-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
                             "-row-mt", "1", "-pix_fmt", "yuv420p", webm], check=True)
    poster.save(os.path.join(MEDIA, "hero-loop-poster.jpg"), quality=84, optimize=True)
    shutil.rmtree(tmp)
    for p in (mp4, webm):
        print(f"  ✓ media/{os.path.basename(p)}  {os.path.getsize(p)//1024} KB")
    print("  ✓ media/hero-loop-poster.jpg")


if __name__ == "__main__":
    icons()
    og_image()
    ambient_video()
    print("\nBrand assets complete.")
