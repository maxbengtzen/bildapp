from flask import Flask, request, send_file, send_from_directory, jsonify
from PIL import Image, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import io
import os

# Försök aktivera HEIF/HEIC-stöd i Pillow
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIF_ENABLED = True
except Exception:
    HEIF_ENABLED = False

# Justera paths enligt din struktur:
# Om din frontend ligger i ../frontend från backend-mappen:
STATIC_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1 GB

@app.errorhandler(413)
def too_large(e):
    return "Uppladdningen är för stor.", 413

@app.route('/')
def index():
    return app.send_static_file('index.html')

# Exempel på statiska filer om du vill säkra direktrutter
@app.route('/favicon.svg')
def favicon():
    return send_from_directory(app.static_folder, 'favicon.svg')

@app.route('/manifest.json')
def manifest():
    return send_from_directory(app.static_folder, 'manifest.json')

@app.route('/health')
def health():
    return jsonify(status='ok', heif=HEIF_ENABLED)

@app.route('/upload', methods=['POST'])
def upload():
    files = request.files.getlist("images")
    if not files:
        return "No files", 400

    # Läs in parametrar
    try:
        size_cm = float(request.form.get("size", 5.5))
    except (TypeError, ValueError):
        size_cm = 5.5

    # Konstanter
    DPI = 300               # rasterisering/skalning
    PT_PER_INCH = 72.0
    CM_PER_INCH = 2.54
    # Storlek i pixlar (för att skala till 300 DPI) och i punkter (för PDF-placering)
    size_px = max(1, int(size_cm / CM_PER_INCH * DPI))
    size_pt = size_cm / CM_PER_INCH * PT_PER_INCH

    processed = []
    try:
        for f in files:
            # PIL läser HEIC/HEIF om pillow-heif registrerats
            with Image.open(f) as img_raw:
                img = img_raw.convert("RGB")
                img = ImageOps.exif_transpose(img)  # respektera orientering

                # Centrera kvadratisk crop
                w, h = img.size
                min_side = min(w, h)
                left = (w - min_side) // 2
                top = (h - min_side) // 2
                img = img.crop((left, top, left + min_side, top + min_side))

                # Skala till exakt size_px
                img = img.resize((size_px, size_px), Image.LANCZOS)
                processed.append(img)

        # Skapa PDF i minnet
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        page_w, page_h = A4  # i pt (1/72")

        # Hur många får plats på bredd/höjd?
        cols = max(1, int(page_w // size_pt))
        rows = max(1, int(page_h // size_pt))

        # Jämn fördelning av mellanrum (gap) runt och mellan
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

            # Skriv bild till mellan-buffer för ImageReader
            img_io = io.BytesIO()
            img.save(img_io, format="JPEG", quality=95, optimize=True)
            img_io.seek(0)

            xpos = gap_x + x * (size_pt + gap_x)
            # PDF-koordinater har origo nere till vänster
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
    except Exception as e:
        # Logga och returnera tydligt fel
        # (i produktion, logga med logger i stället för print)
        print("PDF generation error:", repr(e))
        return f"Serverfel vid PDF-skapande: {e}", 500

if __name__ == "__main__":
    # Kör utvecklingsserver
    app.run(host="0.0.0.0", port=5000, debug=True)
