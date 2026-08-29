"""
DigiCon visual asset generator
==============================
Renders cinematic, ultra-HD section banners in the DigiCon palette:
deep-space base + vivid volumetric light blooms + metallic sheen streaks
+ optional geometric relationship motifs + film grain + vignette.

Output: <public>/media/banners/<name>-2400.jpg  and  <name>-1200.jpg
"""
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = os.environ.get("DIGICON_PUBLIC", "/root/digicon_src/project/public")
BANNERS = os.path.join(OUT, "media", "banners")
os.makedirs(BANNERS, exist_ok=True)

W, H = 2400, 1200

# ---------------------------------------------------------------- palette
PALETTE = {
    "primary":   (0x00, 0x7A, 0xFF),
    "secondary": (0x58, 0x56, 0xD6),
    "info":      (0x5A, 0xC8, 0xFA),
    "eco":       (0x10, 0xB9, 0x81),
    "warning":   (0xFF, 0x95, 0x00),
    "violet":    (0x8B, 0x5C, 0xF6),
    "rose":      (0xF4, 0x72, 0xB6),
    "steel":     (0xC9, 0xD6, 0xE8),
    "gold":      (0xFF, 0xD1, 0x66),
}

BASE = np.array([5, 7, 16], dtype=np.float32)  # #050710


def canvas(w=W, h=H):
    img = np.zeros((h, w, 3), dtype=np.float32)
    img[:, :] = BASE
    # subtle vertical atmosphere so the frame is never flat black
    yy = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None, None]
    img += (yy ** 2.2) * np.array([6, 10, 24], dtype=np.float32)[None, None, :]
    return img


def bloom(img, cx, cy, radius, color, intensity=1.0, falloff=2.4, aspect=1.0):
    """Volumetric radial light bloom (additive)."""
    h, w, _ = img.shape
    xs = (np.arange(w, dtype=np.float32) - cx * w) / (radius * w)
    ys = (np.arange(h, dtype=np.float32) - cy * h) / (radius * w * aspect)
    d = np.sqrt(xs[None, :] ** 2 + ys[:, None] ** 2)
    field = np.clip(1.0 - d, 0.0, 1.0) ** falloff
    c = np.array(color, dtype=np.float32)
    img += field[:, :, None] * c[None, None, :] * intensity
    return img


def streak(img, angle_deg, offset, width, color, intensity=0.5, softness=2.0):
    """Metallic directional light band (additive) — the 'sheen' of the system."""
    h, w, _ = img.shape
    a = math.radians(angle_deg)
    xs = np.arange(w, dtype=np.float32)[None, :] / w
    ys = np.arange(h, dtype=np.float32)[:, None] / h
    # signed distance from an oriented line
    d = np.abs(math.cos(a) * (xs - offset) + math.sin(a) * (ys - 0.5)) / width
    field = np.clip(1.0 - d, 0.0, 1.0) ** softness
    c = np.array(color, dtype=np.float32)
    img += field[:, :, None] * c[None, None, :] * intensity
    return img


def overlay_layer(img, layer_rgba, intensity=1.0):
    """Composite an RGBA PIL overlay additively."""
    arr = np.asarray(layer_rgba, dtype=np.float32)
    rgb, alpha = arr[:, :, :3], arr[:, :, 3:4] / 255.0
    img += rgb * alpha * intensity
    return img


# ------------------------------------------------------------- motifs
def motif_graph(w, h, color, nodes=34, seed=7, radius_range=(6, 20), link_dist=0.26):
    """Connection-graph motif: the DigiCon 'shape of your network'."""
    rng = np.random.default_rng(seed)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    pts = np.column_stack([rng.uniform(0.04, 0.96, nodes), rng.uniform(0.08, 0.92, nodes)])
    # edges
    for i in range(nodes):
        for j in range(i + 1, nodes):
            dist = math.hypot(*(pts[i] - pts[j]))
            if dist < link_dist:
                a = int(150 * (1.0 - dist / link_dist))
                d.line(
                    [pts[i][0] * w, pts[i][1] * h, pts[j][0] * w, pts[j][1] * h],
                    fill=color + (a,), width=2,
                )
    # nodes
    for i in range(nodes):
        r = rng.integers(*radius_range)
        x, y = pts[i][0] * w, pts[i][1] * h
        d.ellipse([x - r, y - r, x + r, y + r], fill=color + (210,))
        d.ellipse([x - r * 2.6, y - r * 2.6, x + r * 2.6, y + r * 2.6], fill=color + (26,))
    return layer.filter(ImageFilter.GaussianBlur(1.4))


def motif_rings(w, h, color, cx=0.5, cy=0.5, count=9, seed=3):
    """Concentric identity rings — 'one identity, always ready'."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(count):
        r = (0.06 + i * 0.075) * w
        a = int(120 * (1 - i / count) ** 1.3) + 12
        d.ellipse(
            [cx * w - r, cy * h - r * 0.98, cx * w + r, cy * h + r * 0.98],
            outline=color + (a,), width=3 if i % 2 == 0 else 2,
        )
    return layer.filter(ImageFilter.GaussianBlur(1.2))


def motif_grid(w, h, color, rows=16, cols=28, perspective=0.55):
    """Perspective grid — structured, systematic, 'relationship workspace'."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    horizon = h * 0.30
    for c in range(cols + 1):
        x = c / cols
        d.line([x * w, h, w * (0.5 + (x - 0.5) * perspective), horizon], fill=color + (40,), width=2)
    for r in range(1, rows + 1):
        t = (r / rows) ** 2.3
        y = horizon + t * (h - horizon)
        a = int(70 * t) + 8
        d.line([0, y, w, y], fill=color + (a,), width=2)
    return layer.filter(ImageFilter.GaussianBlur(0.9))


def motif_flow(w, h, color, lanes=7, seed=11):
    """Flowing connection paths — create → share → connect → remember."""
    rng = np.random.default_rng(seed)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(lanes):
        y0 = rng.uniform(0.15, 0.85)
        amp = rng.uniform(0.04, 0.16)
        phase = rng.uniform(0, math.tau)
        freq = rng.uniform(0.7, 1.5)
        pts = []
        for xi in range(0, w + 1, 8):
            x = xi / w
            y = y0 + amp * math.sin(x * math.tau * freq + phase)
            pts.append((xi, y * h))
        d.line(pts, fill=color + (70,), width=3, joint="curve")
        # travelling node highlights
        for k in range(4):
            idx = int(len(pts) * ((k + 1) / 5.5))
            x, y = pts[idx]
            d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=color + (190,))
            d.ellipse([x - 26, y - 26, x + 26, y + 26], fill=color + (28,))
    return layer.filter(ImageFilter.GaussianBlur(1.6))


def motif_shards(w, h, color, count=13, seed=5):
    """Fragmented glass shards — 'contact exists, context disappears'."""
    rng = np.random.default_rng(seed)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        cx, cy = rng.uniform(0.05, 0.95) * w, rng.uniform(0.1, 0.9) * h
        s = rng.uniform(0.05, 0.16) * w
        rot = rng.uniform(0, math.tau)
        pts = []
        for k in range(rng.integers(3, 6)):
            ang = rot + k * math.tau / 4 + rng.uniform(-0.4, 0.4)
            rr = s * rng.uniform(0.5, 1.0)
            pts.append((cx + math.cos(ang) * rr, cy + math.sin(ang) * rr * 0.7))
        d.polygon(pts, outline=color + (110,), fill=color + (16,))
    return layer.filter(ImageFilter.GaussianBlur(1.0))


def motif_shield(w, h, color):
    """Privacy / trust shield with a soft lattice."""
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy, s = 0.5 * w, 0.52 * h, 0.30 * h
    pts = [
        (cx, cy - s), (cx + s * 0.78, cy - s * 0.55), (cx + s * 0.72, cy + s * 0.35),
        (cx, cy + s), (cx - s * 0.72, cy + s * 0.35), (cx - s * 0.78, cy - s * 0.55),
    ]
    d.polygon(pts, outline=color + (150,), fill=color + (14,))
    for i in range(1, 5):
        k = 1 - i * 0.18
        d.polygon([(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in pts],
                  outline=color + (int(90 * k),), width=2)
    return layer.filter(ImageFilter.GaussianBlur(1.3))


# ------------------------------------------------------------- finishing
def grain(img, amount=3.2, seed=1):
    rng = np.random.default_rng(seed)
    n = rng.normal(0.0, amount, img.shape[:2]).astype(np.float32)
    return img + n[:, :, None]


def vignette(img, strength=0.42, power=1.9):
    h, w, _ = img.shape
    xs = (np.arange(w, dtype=np.float32) / w - 0.5) * 2
    ys = (np.arange(h, dtype=np.float32) / h - 0.5) * 2
    d = np.sqrt(xs[None, :] ** 2 * 0.85 + ys[:, None] ** 2)
    mask = np.clip(1.0 - (d ** power) * strength, 0.42, 1.0)
    return img * mask[:, :, None]


def tonemap(img, exposure=1.0, contrast=1.10, saturation=1.22):
    """Filmic roll-off + saturation lift so the blooms stay vivid, never flat white."""
    x = np.clip(img, 0, None) / 255.0 * (exposure * 1.55)
    x = x / (1.0 + x * 0.48)                      # gentle shoulder, keeps colour
    lum = (x * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)).sum(-1, keepdims=True)
    x = np.clip(lum + (x - lum) * saturation, 0.0, 1.0)   # saturation lift
    x = np.clip((x - 0.5) * contrast + 0.5, 0.0, 1.0)
    return (x ** (1 / 1.06) * 255.0).astype(np.uint8)


def save(img_arr, name, exposure=1.0):
    rgb = tonemap(vignette(grain(img_arr)), exposure=exposure)
    im = Image.fromarray(rgb, "RGB")
    im.save(os.path.join(BANNERS, f"{name}-2400.jpg"), quality=84, optimize=True, progressive=True)
    im.resize((1200, 600), Image.LANCZOS).save(
        os.path.join(BANNERS, f"{name}-1200.jpg"), quality=82, optimize=True, progressive=True
    )
    kb = os.path.getsize(os.path.join(BANNERS, f"{name}-2400.jpg")) // 1024
    print(f"  ✓ {name:<16} {kb} KB")


# ------------------------------------------------------------- the banners
def build():
    P = PALETTE
    print("Rendering DigiCon section banners…")

    # 1. HERO — "More than a digital business card"
    a = canvas()
    a = bloom(a, 0.24, 0.30, 0.62, P["primary"], 1.35, 2.2)
    a = bloom(a, 0.78, 0.22, 0.50, P["secondary"], 1.05, 2.4)
    a = bloom(a, 0.58, 0.86, 0.55, P["info"], 0.70, 2.6)
    a = bloom(a, 0.06, 0.78, 0.34, P["eco"], 0.42, 2.8)
    a = streak(a, 118, 0.30, 0.085, P["steel"], 0.34, 2.4)
    a = streak(a, 118, 0.44, 0.030, P["info"], 0.55, 3.0)
    a = streak(a, 118, 0.72, 0.055, P["steel"], 0.20, 2.6)
    a = overlay_layer(a, motif_graph(W, H, P["info"], nodes=30, seed=7), 0.85)
    save(a, "hero", 1.02)

    # 2. PROBLEM — fragmented contact data
    a = canvas()
    a = bloom(a, 0.18, 0.72, 0.52, P["secondary"], 0.85, 2.5)
    a = bloom(a, 0.84, 0.28, 0.48, P["primary"], 0.72, 2.6)
    a = bloom(a, 0.50, 0.50, 0.30, P["warning"], 0.34, 3.0)
    a = streak(a, 62, 0.55, 0.06, P["steel"], 0.22, 2.6)
    a = overlay_layer(a, motif_shards(W, H, P["steel"], 14, seed=5), 0.9)
    save(a, "problem", 0.96)

    # 3. BIG IDEA — a card is a moment, a connection is a journey
    a = canvas()
    a = bloom(a, 0.10, 0.50, 0.46, P["primary"], 0.95, 2.4)
    a = bloom(a, 0.90, 0.50, 0.46, P["eco"], 0.85, 2.4)
    a = bloom(a, 0.50, 0.20, 0.40, P["violet"], 0.55, 2.8)
    a = overlay_layer(a, motif_flow(W, H, P["info"], lanes=6, seed=11), 0.95)
    save(a, "bigidea", 1.0)

    # 4. WHAT IS DIGICON — the platform overview
    a = canvas()
    a = bloom(a, 0.50, 0.44, 0.66, P["primary"], 1.15, 2.2)
    a = bloom(a, 0.20, 0.80, 0.40, P["secondary"], 0.62, 2.6)
    a = bloom(a, 0.82, 0.76, 0.38, P["info"], 0.55, 2.7)
    a = overlay_layer(a, motif_rings(W, H, P["steel"], 0.5, 0.5, 10), 0.8)
    a = streak(a, 108, 0.36, 0.045, P["steel"], 0.30, 2.8)
    save(a, "platform", 1.02)

    # 5. CREATE — your identity
    a = canvas()
    a = bloom(a, 0.35, 0.42, 0.55, P["violet"], 1.0, 2.3)
    a = bloom(a, 0.72, 0.66, 0.42, P["primary"], 0.72, 2.6)
    a = overlay_layer(a, motif_rings(W, H, P["gold"], 0.36, 0.46, 8), 0.55)
    a = streak(a, 124, 0.52, 0.04, P["steel"], 0.32, 2.9)
    save(a, "create", 1.0)

    # 6. SHARE — the easiest introduction
    a = canvas()
    a = bloom(a, 0.28, 0.56, 0.50, P["info"], 1.05, 2.3)
    a = bloom(a, 0.76, 0.34, 0.46, P["primary"], 0.85, 2.5)
    a = overlay_layer(a, motif_flow(W, H, P["steel"], lanes=5, seed=21), 0.7)
    a = streak(a, 96, 0.60, 0.035, P["info"], 0.45, 3.0)
    save(a, "share", 1.0)

    # 7. CONNECT — exchange possibility
    a = canvas()
    a = bloom(a, 0.30, 0.50, 0.46, P["primary"], 1.0, 2.4)
    a = bloom(a, 0.70, 0.50, 0.46, P["info"], 0.95, 2.4)
    a = bloom(a, 0.50, 0.50, 0.22, P["steel"], 0.45, 3.2)
    a = overlay_layer(a, motif_graph(W, H, P["primary"], nodes=22, seed=17, link_dist=0.34), 0.9)
    save(a, "connect", 1.0)

    # 8. CAPTURE — remember the person
    a = canvas()
    a = bloom(a, 0.22, 0.34, 0.50, P["warning"], 0.72, 2.6)
    a = bloom(a, 0.68, 0.62, 0.54, P["secondary"], 0.95, 2.4)
    a = overlay_layer(a, motif_shards(W, H, P["gold"], 9, seed=23), 0.55)
    a = streak(a, 132, 0.40, 0.05, P["steel"], 0.26, 2.7)
    save(a, "capture", 0.99)

    # 9. MANAGE — relationship workspace, not a spreadsheet
    a = canvas()
    a = bloom(a, 0.50, 0.18, 0.58, P["primary"], 0.95, 2.4)
    a = bloom(a, 0.14, 0.66, 0.40, P["violet"], 0.55, 2.7)
    a = overlay_layer(a, motif_grid(W, H, P["info"]), 0.85)
    save(a, "manage", 1.0)

    # 10. FOLLOW UP — turn intentions into action
    a = canvas()
    a = bloom(a, 0.66, 0.40, 0.54, P["eco"], 1.0, 2.4)
    a = bloom(a, 0.24, 0.66, 0.46, P["primary"], 0.78, 2.5)
    a = overlay_layer(a, motif_flow(W, H, P["eco"], lanes=5, seed=31), 0.75)
    a = streak(a, 110, 0.34, 0.04, P["steel"], 0.30, 2.9)
    save(a, "followup", 1.0)

    # 11. CONNECTION GRAPH — the shape of your network
    a = canvas()
    a = bloom(a, 0.50, 0.50, 0.70, P["secondary"], 1.05, 2.2)
    a = bloom(a, 0.18, 0.24, 0.36, P["info"], 0.62, 2.7)
    a = bloom(a, 0.84, 0.74, 0.36, P["primary"], 0.62, 2.7)
    a = overlay_layer(a, motif_graph(W, H, P["steel"], nodes=48, seed=41, link_dist=0.22), 1.0)
    save(a, "graph", 1.0)

    # 12. FOR PROFESSIONALS
    a = canvas()
    a = bloom(a, 0.32, 0.44, 0.52, P["gold"], 0.62, 2.6)
    a = bloom(a, 0.74, 0.56, 0.50, P["primary"], 1.0, 2.4)
    a = overlay_layer(a, motif_rings(W, H, P["gold"], 0.33, 0.46, 7), 0.45)
    a = streak(a, 122, 0.58, 0.045, P["steel"], 0.28, 2.8)
    save(a, "professionals", 1.0)

    # 13. FOR STARTUPS & TEAMS
    a = canvas()
    a = bloom(a, 0.26, 0.52, 0.48, P["eco"], 0.85, 2.5)
    a = bloom(a, 0.72, 0.40, 0.50, P["info"], 0.90, 2.4)
    a = overlay_layer(a, motif_graph(W, H, P["eco"], nodes=26, seed=53, link_dist=0.30), 0.8)
    save(a, "teams", 1.0)

    # 14. FOR ORGANIZATIONS
    a = canvas()
    a = bloom(a, 0.50, 0.30, 0.60, P["secondary"], 1.0, 2.3)
    a = bloom(a, 0.16, 0.78, 0.38, P["primary"], 0.60, 2.6)
    a = bloom(a, 0.86, 0.72, 0.34, P["violet"], 0.52, 2.7)
    a = overlay_layer(a, motif_grid(W, H, P["steel"], rows=14, cols=24), 0.7)
    save(a, "organizations", 1.0)

    # 15. SIMPLICITY — technology disappears into the experience
    a = canvas()
    a = bloom(a, 0.50, 0.52, 0.58, P["steel"], 0.52, 2.6)
    a = bloom(a, 0.50, 0.52, 0.28, P["primary"], 0.65, 3.0)
    a = streak(a, 100, 0.42, 0.10, P["steel"], 0.22, 2.2)
    a = streak(a, 100, 0.62, 0.030, P["info"], 0.40, 3.0)
    save(a, "simplicity", 1.0)

    # 16. PRIVACY & TRUST
    a = canvas()
    a = bloom(a, 0.50, 0.50, 0.52, P["eco"], 0.85, 2.5)
    a = bloom(a, 0.18, 0.30, 0.36, P["primary"], 0.55, 2.7)
    a = overlay_layer(a, motif_shield(W, H, P["eco"]), 1.0)
    save(a, "privacy", 1.0)

    # 17. FINAL CTA
    a = canvas()
    a = bloom(a, 0.34, 0.60, 0.60, P["primary"], 1.25, 2.2)
    a = bloom(a, 0.72, 0.32, 0.52, P["violet"], 0.95, 2.4)
    a = bloom(a, 0.52, 0.90, 0.40, P["eco"], 0.55, 2.7)
    a = streak(a, 116, 0.38, 0.06, P["steel"], 0.34, 2.5)
    a = streak(a, 116, 0.56, 0.025, P["gold"], 0.40, 3.2)
    a = overlay_layer(a, motif_graph(W, H, P["info"], nodes=24, seed=61, link_dist=0.30), 0.7)
    save(a, "cta", 1.03)

    print(f"\nAll banners written to {BANNERS}")


if __name__ == "__main__":
    build()
