from flask import Flask, request, send_file, send_from_directory
from PIL import Image, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import io
import os
import pillow_heif

# Registrera HEIF/HEIC-stöd i PIL
pillow_heif.register_heif_opener()

app = Flask(__name__, static_folder='../frontend', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/favicon.svg')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.svg')

@app.route('/health')
def health():
    return {'status': 'ok'}

@app.route('/upload', methods=['POST'])
def upload():
    files = request.files.getlist("images")
    if not files:
        return "No files", 400

    # Inputs
    try:
        size_cm = float(request.form.get("size", 5.5))
    except ValueError:
        size_cm = 5.5

    # Konvertera till pixlar och punkter
    dpi = 300
    size_px = max(1, int(size_cm / 2.54 * dpi))
    size_pt = size_cm / 2.54 * 72.0

    # Bearbeta bilder
    processed = []
    for file in files:
        img = Image.open(file).convert("RGB")
        img = ImageOps.exif_transpose(img)  # hantera rotering
        w, h = img.size
        min_side = min(w, h)
        left = (w - min_side) // 2
        top = (h - min_side) // 2
        img = img.crop((left, top, left + min_side, top + min_side))
        img = img.resize((size_px, size_px), Image.LANCZOS)
        processed.append(img)

    # Skapa PDF
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    page_w, page_h = A4  # i punkter (1/72 inch)

    # Hur många får plats på bredd/höjd?
    cols = max(1, int(page_w // size_pt))
    rows = max(1, int(page_h // size_pt))

    # Dynamiska gaps (jämnt fördelade mellan + runt bilderna)
    gap_x = (page_w - cols * size_pt) / (cols + 1)
    gap_y = (page_h - rows * size_pt) / (rows + 1)

    x = y = 0
    for img in processed:
        if x >= cols:
            x = 0
            y += 1
        if y >= rows:
            c.showPage()
            x = y = 0

        img_io = io.BytesIO()
        img.save(img_io, format="JPEG", quality=95)
        img_io.seek(0)

        xpos = gap_x + x * (size_pt + gap_x)
        ypos = page_h - (gap_y + (y + 1) * size_pt + y * gap_y)

        c.drawImage(ImageReader(img_io), xpos, ypos, width=size_pt, height=size_pt)

        x += 1

    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name="bilder.pdf"
    )

if __name__ == "__main__":
    # Tillåt stora uploads (1 GB)
    app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024
    app.run(host="0.0.0.0", port=5000)
