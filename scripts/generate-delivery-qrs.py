from __future__ import annotations

import json
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.image.svg import SvgPathImage

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "entrega" / "qr"
PUBLIC = ROOT / "public" / "qr-codes"
OUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

# URLs auditadas para la entrega del 17/09/2026. El WhatsApp/TikTok corresponden
# a lo publicado en /links ese día; la discrepancia del WhatsApp con el fallback
# local queda anotada en los documentos de auditoría y requiere confirmación del cliente.
LINKS = [
    ("sitio-web", "Sitio web", "https://raicescoffeeart.com/"),
    ("todos-los-links", "Todos los links", "https://raicescoffeeart.com/links"),
    ("carta", "La Carta", "https://raicescoffeeart.com/carta"),
    ("productos-de-origen", "Productos de Origen", "https://raicescoffeeart.com/productos-de-origen"),
    ("galeria-de-arte", "Galería de Arte", "https://raicescoffeeart.com/galeria-de-arte"),
    ("historia", "Nuestra Historia", "https://raicescoffeeart.com/#historia"),
    ("personas", "Personas", "https://raicescoffeeart.com/#personas"),
    ("publicaciones", "Publicaciones", "https://raicescoffeeart.com/publicaciones"),
    ("visitanos", "Visítanos", "https://raicescoffeeart.com/#visita"),
    # Equivale a las coordenadas ya usadas por el sitio, pero evita codificar
    # la URL kilométrica de Street View, lo que produce un QR físico más simple.
    ("google-maps", "Google Maps / Cómo llegar", "https://www.google.com/maps?q=-12.0854495,-77.0831729"),
    ("whatsapp", "WhatsApp", "https://wa.me/992383843"),
    ("tiktok", "TikTok", "https://www.tiktok.com/@qalisaludable11"),
    ("email", "Correo electrónico", "mailto:raicescoffeeartshop@gmail.com"),
    ("instagram", "Instagram", "https://www.instagram.com/raicescoffeeartshop/"),
    ("facebook", "Facebook", "https://www.facebook.com/profile.php?id=100089073728506&locale=es_LA"),
]

FONT_BOLD_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
]
FONT_REGULAR_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
]

def load_font(candidates: list[str], size: int):
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

TITLE = load_font(FONT_BOLD_CANDIDATES, 42)
LABEL = load_font(FONT_BOLD_CANDIDATES, 27)
URL_FONT = load_font(FONT_REGULAR_CANDIDATES, 15)
SHEET_TITLE = load_font(FONT_BOLD_CANDIDATES, 68)
SHEET_SUBTITLE = load_font(FONT_REGULAR_CANDIDATES, 28)


def make_qr(value: str, box_size: int = 18) -> Image.Image:
    # M hace QRs sensiblemente menos densos que H y sigue tolerando daño moderado.
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=box_size, border=4)
    qr.add_data(value)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB")


def fit_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return [""]
    lines: list[str] = []
    line = words[0]
    for word in words[1:]:
        candidate = f"{line} {word}"
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
            line = candidate
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def save_card(slug: str, label: str, url: str) -> Path:
    qr_img = make_qr(url, 20)
    canvas = Image.new("RGB", (1200, 1350), "white")
    qr_target = 820
    qr_img.thumbnail((qr_target, qr_target), Image.Resampling.NEAREST)
    x = (canvas.width - qr_img.width) // 2
    canvas.paste(qr_img, (x, 70))
    draw = ImageDraw.Draw(canvas)
    bbox = draw.textbbox((0, 0), label, font=LABEL)
    draw.text(((canvas.width - (bbox[2] - bbox[0])) / 2, 1090), label, fill="black", font=LABEL)
    url_lines = fit_text(draw, url, URL_FONT, 1050)
    y = 1160
    for line in url_lines[:3]:
        bbox = draw.textbbox((0, 0), line, font=URL_FONT)
        draw.text(((canvas.width - (bbox[2] - bbox[0])) / 2, y), line, fill="#555555", font=URL_FONT)
        y += 26
    target = OUT / f"QR_Raices_{slug}_grande.png"
    canvas.save(target, optimize=True)
    return target


def save_svg(slug: str, url: str):
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(image_factory=SvgPathImage)
    with (PUBLIC / f"{slug}.svg").open("wb") as handle:
        img.save(handle)


cards: list[tuple[str, str, str, Path]] = []
for slug, label, url in LINKS:
    cards.append((slug, label, url, save_card(slug, label, url)))
    save_svg(slug, url)

manifest = [{"slug": slug, "label": label, "url": url} for slug, label, url in LINKS]
(OUT / "QR_MANIFIESTO.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Hoja única de consulta/impresión. 3 columnas x 5 filas.
cell_w, cell_h = 1180, 920
margin_x, margin_top = 70, 270
sheet = Image.new("RGB", (margin_x * 2 + cell_w * 3, margin_top + cell_h * 5 + 110), "white")
draw = ImageDraw.Draw(sheet)
draw.text((80, 60), "RAÍCES — Códigos QR", fill="black", font=SHEET_TITLE)
draw.text((82, 145), "Hoja de entrega · enlaces solicitados y accesos oficiales vigentes al 17/09/2026", fill="#555555", font=SHEET_SUBTITLE)

for index, (slug, label, url, _) in enumerate(cards):
    row, col = divmod(index, 3)
    x0 = margin_x + col * cell_w
    y0 = margin_top + row * cell_h
    if col:
        draw.line((x0, y0, x0, y0 + cell_h), fill="#dddddd", width=2)
    if row:
        draw.line((x0, y0, x0 + cell_w, y0), fill="#dddddd", width=2)
    qr_img = make_qr(url, 10)
    qr_img.thumbnail((500, 500), Image.Resampling.NEAREST)
    qx = x0 + (cell_w - qr_img.width) // 2
    sheet.paste(qr_img, (qx, y0 + 55))
    bbox = draw.textbbox((0, 0), label, font=LABEL)
    draw.text((x0 + (cell_w - (bbox[2]-bbox[0])) / 2, y0 + 600), label, fill="black", font=LABEL)
    lines = fit_text(draw, url, URL_FONT, cell_w - 120)
    yy = y0 + 662
    for line in lines[:4]:
        bbox = draw.textbbox((0, 0), line, font=URL_FONT)
        draw.text((x0 + (cell_w - (bbox[2]-bbox[0])) / 2, yy), line, fill="#555555", font=URL_FONT)
        yy += 25

sheet.save(OUT / "QR_Raices_hoja_completa.png", optimize=True)
print(f"Generados {len(LINKS)} QR físicos + hoja completa en {OUT}")
