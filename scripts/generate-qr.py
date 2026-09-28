"""Generate the printable EduBook website QR card.

Requires Pillow and qrcode: pip install pillow qrcode
"""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "images" / "edubook-website-qr.png"
LOGO = ROOT / "assets" / "images" / "LOGO-transparent.png"
URL = "https://edubook-iuh.vercel.app/"

NAVY = (13, 43, 115)
BLUE = (8, 127, 189)
GREEN = (22, 163, 74)
INK = (23, 43, 77)
MUTED = (93, 107, 128)
WHITE = (255, 255, 255)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = (
        ["C:/Windows/Fonts/segoeuib.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
        if bold else
        ["C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    )
    for name in names:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    raise FileNotFoundError("A Unicode TrueType font is required to render the QR card")


def main() -> None:
    image = Image.new("RGB", (1200, 1600), (247, 250, 255))
    draw = ImageDraw.Draw(image)

    for y in range(390):
        ratio = y / 390
        color = tuple(round(a * (1 - ratio) + b * ratio) for a, b in zip(NAVY, BLUE))
        draw.line((0, y, 1200, y), fill=color)

    for x in range(0, 1201, 48):
        draw.line((x, 0, x, 390), fill=(31, 91, 159), width=1)
    for y in range(0, 391, 48):
        draw.line((0, y, 1200, y), fill=(31, 91, 159), width=1)

    draw.rounded_rectangle((79, 89, 251, 261), radius=38, fill=WHITE)
    logo = Image.open(LOGO).convert("RGBA")
    logo.thumbnail((138, 138), Image.Resampling.LANCZOS)
    image.paste(logo, (165 - logo.width // 2, 175 - logo.height // 2), logo)

    draw.text((287, 107), "IUH EduBook", font=font(66, True), fill=WHITE)
    draw.text((291, 193), "KHO GIÁO TRÌNH DÀNH CHO SINH VIÊN", font=font(24, True), fill=(223, 244, 255))
    draw.rounded_rectangle((289, 259, 788, 317), radius=29, fill=(223, 248, 232))
    draw.text((314, 270), "Giáo trình chuẩn tay · Giá tiết kiệm", font=font(22, True), fill=(17, 130, 58))

    draw.rounded_rectangle((112, 362, 1088, 1516), radius=42, fill=(219, 234, 247))
    draw.rounded_rectangle((104, 354, 1080, 1508), radius=42, fill=WHITE)
    draw.text((600, 413), "QUÉT MÃ ĐỂ TRUY CẬP", anchor="mt", font=font(37, True), fill=NAVY)
    draw.text((600, 469), "Mở EduBook ngay trên điện thoại của bạn", anchor="mt", font=font(24), fill=MUTED)

    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=4)
    qr.add_data(URL)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    module = 20
    x0, y0 = 190, 528
    draw.rounded_rectangle((x0 - 8, y0 - 8, x0 + 828, y0 + 828), radius=20, outline=(207, 230, 245), width=3)
    for row, cells in enumerate(matrix):
        for col, dark in enumerate(cells):
            if dark:
                x, y = x0 + col * module, y0 + row * module
                draw.rectangle((x, y, x + module - 1, y + module - 1), fill=NAVY)

    draw.rounded_rectangle((248, 1390, 952, 1458), radius=34, fill=(232, 245, 254))
    draw.text((600, 1405), "edubook-iuh.vercel.app", anchor="mt", font=font(30, True), fill=BLUE)
    draw.text((600, 1549), "SÁCH BÁN  ·  SÁCH THUÊ  ·  HỖ TRỢ SINH VIÊN", anchor="mt", font=font(19, True), fill=INK)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
