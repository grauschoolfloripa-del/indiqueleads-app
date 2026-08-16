#!/usr/bin/env python3
"""Gera os ícones do PWA a partir do logo oficial.

O logo é largo (633x328: símbolo em cima, wordmark embaixo). Em ícone quadrado
o wordmark vira borrão, então usamos só o símbolo — a mão apontando, que é o
elemento que carrega o significado da marca.

Rodar depois de trocar public/indiqueleads-logo.png:
    python3 scripts/gen-icons.py
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "indiqueleads-logo.png"
OUT = ROOT / "public" / "icons"
GROUND = (255, 255, 255, 255)

# O símbolo ocupa a metade de cima; abaixo disso começa o wordmark.
SYMBOL_MAX_Y = 200


def symbol() -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    top = logo.crop((0, 0, logo.width, min(SYMBOL_MAX_Y, logo.height)))
    box = top.getbbox()  # recorta o transparente em volta
    if box is None:
        raise SystemExit("logo sem pixels visíveis na região do símbolo")
    return top.crop(box)


def render(sym: Image.Image, size: int, coverage: float) -> Image.Image:
    """Centraliza o símbolo num quadrado. `coverage` é a fração ocupada —
    ícone maskable precisa de folga porque o sistema recorta as bordas."""
    canvas = Image.new("RGBA", (size, size), GROUND)
    limit = int(size * coverage)
    scale = min(limit / sym.width, limit / sym.height)
    w, h = max(1, round(sym.width * scale)), max(1, round(sym.height * scale))
    resized = sym.resize((w, h), Image.LANCZOS)
    canvas.paste(resized, ((size - w) // 2, (size - h) // 2), resized)
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sym = symbol()

    targets = [
        ("icon-192.png", 192, 0.80),
        ("icon-512.png", 512, 0.80),
        # maskable: conteúdo dentro da zona segura (~80% central) para o
        # sistema poder recortar em círculo, squircle etc. sem cortar a mão.
        ("icon-maskable-192.png", 192, 0.58),
        ("icon-maskable-512.png", 512, 0.58),
        # iOS aplica o próprio arredondamento e não aceita transparência.
        ("apple-touch-icon.png", 180, 0.74),
    ]

    for name, size, coverage in targets:
        img = render(sym, size, coverage)
        if name == "apple-touch-icon.png":
            img = img.convert("RGB")
        img.save(OUT / name)
        print(f"  {name}  {size}x{size}")

    print(f"símbolo: {sym.width}x{sym.height} → {len(targets)} ícones em public/icons/")


if __name__ == "__main__":
    main()
