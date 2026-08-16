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

# Navy do primeiro quadro da animação de abertura (public/videos/intro.mp4).
#
# O ícone precisa desta cor porque o Android monta o splash nativo com ele
# sobre `background_color` do manifest — e esse splash não pode ser desligado.
# Com fundo branco, a abertura virava duas telas: um quadrado branco e depois o
# vídeo. Igualando as cores, o splash vira o primeiro quadro da animação.
GROUND = (0x0B, 0x17, 0x28, 255)

# A mão do logo é navy sobre transparente; sobre fundo escuro ela sumiria.
# Estes pixels viram branco. Os raios verdes ficam como estão — verde sobre
# navy tem contraste de sobra.
TINTA_ESCURA_MAX = 150

# O símbolo ocupa a metade de cima; abaixo disso começa o wordmark.
SYMBOL_MAX_Y = 200


def symbol() -> Image.Image:
    logo = Image.open(LOGO).convert("RGBA")
    top = logo.crop((0, 0, logo.width, min(SYMBOL_MAX_Y, logo.height)))
    box = top.getbbox()  # recorta o transparente em volta
    if box is None:
        raise SystemExit("logo sem pixels visíveis na região do símbolo")
    return clarear_tinta_escura(top.crop(box))


def clarear_tinta_escura(img: Image.Image) -> Image.Image:
    """Troca o traço navy por branco, preservando os raios verdes e o alfa."""
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Traço da mão: escuro e sem dominância de verde.
            if r < TINTA_ESCURA_MAX and g < TINTA_ESCURA_MAX and b < 200 and g <= b + 30:
                px[x, y] = (255, 255, 255, a)
    return img


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
