from flask import Flask, request, send_file, send_from_directory, jsonify
from flask_cors import CORS
from PIL import Image, ImageOps
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import io
import os
import base64

# Försök aktivera HEIF/HEIC-stöd i Pillow
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIF_ENABLED = True
except Exception:
    HEIF_ENABLED = False

# Justera paths enligt din struktur:
# Use environment variable for Docker deployment, fallback to relative path for development
STATIC_FOLDER = os.environ.get('STATIC_FOLDER', os.path.abspath(os.path.join(os.path.dirname(__file__), '../web/build')))

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1 GB

# Enable CORS for development mode
if os.environ.get('FLASK_ENV') == 'development' or app.debug:
    CORS(app, origins=['http://localhost:3000'])

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

@app.route('/debug', methods=['POST'])
def debug():
    """Debug endpoint to help troubleshoot iOS issues"""
    try:
        files = request.files.getlist("images")
        debug_info = {
            'files_received': len(files),
            'heif_support': HEIF_ENABLED,
            'file_details': []
        }
        
        for i, f in enumerate(files):
            file_info = {
                'index': i,
                'filename': f.filename,
                'content_type': f.content_type,
                'size': len(f.read())
            }
            f.seek(0)  # Reset file pointer
            
            # Try to identify and process the image
            try:
                with Image.open(f) as img_raw:
                    img = img_raw.convert("RGB")
                    file_info['pil_format'] = img_raw.format
                    file_info['pil_mode'] = img_raw.mode
                    file_info['dimensions'] = img_raw.size
                    file_info['can_process'] = True
            except Exception as e:
                file_info['pil_error'] = str(e)
                file_info['can_process'] = False
            
            f.seek(0)  # Reset again
            debug_info['file_details'].append(file_info)
        
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e), 'heif_support': HEIF_ENABLED}), 500

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
    
    # Get layout parameter (default to standard)
    layout = request.form.get("layout", "standard")
    if layout not in ["standard", "polaroid"]:
        layout = "standard"
    
    # Check if preview mode is requested
    preview_mode = request.form.get("preview", "false").lower() == "true"
    
    print(f"Processing request with layout: {layout}, size: {size_cm}cm")

    # Konstanter
    DPI = 300               # rasterisering/skalning
    PT_PER_INCH = 72.0
    CM_PER_INCH = 2.54
    
    # Storlek i pixlar (för att skala till 300 DPI) och i punkter (för PDF-placering)
    size_px = max(1, int(size_cm / CM_PER_INCH * DPI))
    size_pt = size_cm / CM_PER_INCH * PT_PER_INCH
    
    # Polaroid frame calculations
    if layout == "polaroid":
        # Authentic Polaroid proportions based on real measurements:
        # Real Polaroid: 6.2x6.2cm image, 7.2x8.6cm total frame
        # Side borders: 0.5cm each = 8.06% of image size
        # Top border: 0.5cm = 8.06% of image size
        # Bottom border: 1.9cm = 30.65% of image size (caption area)
        top_border_ratio = 0.0806     # 8.06% (0.5cm / 6.2cm)
        side_border_ratio = 0.0806    # 8.06% (0.5cm / 6.2cm)
        bottom_border_ratio = 0.3065  # 30.65% (1.9cm / 6.2cm)
        
        # Calculate frame dimensions in points
        top_border_pt = size_pt * top_border_ratio
        side_border_pt = size_pt * side_border_ratio
        bottom_border_pt = size_pt * bottom_border_ratio
        
        # Total frame size
        frame_width_pt = size_pt + 2 * side_border_pt
        frame_height_pt = size_pt + top_border_pt + bottom_border_pt
        
        print(f"Polaroid frame: {frame_width_pt:.1f}x{frame_height_pt:.1f}pt (image: {size_pt:.1f}pt, authentic proportions)")
    else:
        # Standard layout - frame size equals image size
        frame_width_pt = size_pt
        frame_height_pt = size_pt
        top_border_pt = side_border_pt = bottom_border_pt = 0

    processed = []
    try:
        for i, f in enumerate(files):
            try:
                # PIL läser HEIC/HEIF om pillow-heif registrerats
                with Image.open(f) as img_raw:
                    print(f"Processing file {i}: {f.filename} (format: {img_raw.format}, mode: {img_raw.mode})")
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
                    print(f"Successfully processed file {i}")
            except Exception as file_error:
                print(f"Error processing file {i} ({f.filename}): {repr(file_error)}")
                # If HEIF support is missing, give specific error message
                if "cannot identify image file" in str(file_error) and f.filename and f.filename.lower().endswith(('.heic', '.heif')):
                    if not HEIF_ENABLED:
                        return f"HEIC/HEIF-format stöds inte på denna server. Filename: {f.filename}", 400
                    else:
                        return f"Kunde inte läsa HEIC/HEIF-fil trots aktivt stöd. Filename: {f.filename}", 400
                # Re-raise other errors to be caught by outer try-catch
                raise file_error

        # Skapa PDF i minnet
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        page_w, page_h = A4  # i pt (1/72")

        # Hur många får plats på bredd/höjd? Use frame size for grid calculation
        cols = max(1, int(page_w // frame_width_pt))
        rows = max(1, int(page_h // frame_height_pt))

        # Jämn fördelning av mellanrum (gap) runt och mellan
        gap_x = (page_w - cols * frame_width_pt) / (cols + 1)
        gap_y = (page_h - rows * frame_height_pt) / (rows + 1)
        
        print(f"Grid calculation: {cols}x{rows} (frame: {frame_width_pt:.1f}x{frame_height_pt:.1f}pt)")

        x = y = 0
        for img in processed:
            if x >= cols:
                x = 0
                y += 1
            if y >= rows:
                c.showPage()
                x = y = 0

            # Calculate frame position
            frame_xpos = gap_x + x * (frame_width_pt + gap_x)
            # PDF-koordinater har origo nere till vänster
            frame_ypos = page_h - (gap_y + (y + 1) * frame_height_pt + y * gap_y)
            
            if layout == "polaroid":
                # Draw white background frame first
                c.setFillColorRGB(1, 1, 1)  # White
                c.rect(frame_xpos, frame_ypos, frame_width_pt, frame_height_pt, fill=1, stroke=0)
                
                # Add cutting guide - thin dashed border around the frame
                c.setStrokeColorRGB(0.3, 0.3, 0.3)  # Dark gray
                c.setLineWidth(0.5)  # Thin line
                c.setDash([2, 2])  # Dashed pattern: 2pt dash, 2pt gap
                c.rect(frame_xpos, frame_ypos, frame_width_pt, frame_height_pt, fill=0, stroke=1)
                c.setDash([])  # Reset to solid line for future drawings
                
                # Calculate image position within the frame
                img_xpos = frame_xpos + side_border_pt
                img_ypos = frame_ypos + bottom_border_pt  # Leave space for caption at bottom
            else:
                # Standard layout - image fills the entire frame
                img_xpos = frame_xpos
                img_ypos = frame_ypos

            # Skriv bild till mellan-buffer för ImageReader
            img_io = io.BytesIO()
            img.save(img_io, format="JPEG", quality=95, optimize=True)
            img_io.seek(0)

            # Draw the image
            c.drawImage(ImageReader(img_io), img_xpos, img_ypos, width=size_pt, height=size_pt)
            x += 1

        c.save()
        buffer.seek(0)

        if preview_mode:
            # Return PDF as base64-encoded JSON for preview mode
            pdf_data = buffer.getvalue()
            pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
            
            return jsonify({
                'success': True,
                'pdf_data': pdf_base64,
                'filename': 'bilder.pdf',
                'size': len(pdf_data),
                'image_count': len(processed),
                'grid_info': {
                    'cols': cols,
                    'rows': rows,
                    'size_cm': size_cm,
                    'layout': layout
                }
            })
        else:
            # Traditional download mode
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
