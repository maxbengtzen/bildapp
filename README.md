# Gridprint

![Cover photo](/assets/cover.png)

En modern Progressive Web App (PWA) byggd med React 19 och Flask som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett utskriftsvänligt A4-PDF. Appen är optimerad för mobila enheter med särskilt fokus på iOS Safari-kompatibilitet.

## ✨ Funktioner

- **🔲 PDF-generering**: Automatisk beskärning till kvadrater och smart layout på A4-format
- **📱 PDF-förhandsvisning**: Interaktiv PDF-viewer med pdfjs-dist, sidnavigering och zoom
- **🍎 iOS-optimerad**: Inbyggt stöd för iOS Safari med Web Share API och native fildelning
- **🎨 Polaroid-layout**: Nya layoutalternativ med vita ramar och autentiska proportioner
- **📱 PWA-funktionalitet**: Installeras som en riktig app, fungerar offline med service worker
- **🌓 Automatisk temakväxling**: Följer systemets mörkt/ljus läge-inställningar med DaisyUI
- **📸 Modernt bildstöd**: HEIC/HEIF-format (iPhone) samt traditionella PNG/JPG
- **⚡ Responsiv design**: Fungerar perfekt på mobil, tablet och desktop
- **🎨 Modern UI**: Tailwind CSS 4 + DaisyUI med Bricolage Grotesque-typsnitt
- **⚛️ React 19**: Senaste React-versionen med hooks, custom state management och komponentarkitektur
- **🚀 Vite build**: Snabb utveckling och optimerad produktion med kod-splitting

## 🗂️ Projektstruktur

```
gridprint/
├── web/              # React 19 frontend application
│   ├── src/
│   │   ├── components/    # React components (Header, Upload, PDF Preview, etc.)
│   │   ├── hooks/         # Custom React hooks (useFormState, useIOSCompatibility, useTheme)
│   │   ├── App.jsx        # Main React application component
│   │   ├── index.jsx      # React 19 root with service worker registration
│   │   └── styles.css     # Tailwind CSS 4 + DaisyUI configuration
│   ├── public/            # Static assets and PWA files
│   │   ├── manifest.json  # PWA manifest
│   │   ├── sw.js          # Enhanced service worker
│   │   ├── pdf.worker.min.mjs # PDF.js worker
│   │   ├── fonts/         # Bricolage Grotesque font files
│   │   └── icons/         # PWA icons
│   ├── build/             # Vite build output (generated)
│   ├── package.json       # Frontend dependencies (React 19, Vite, pdfjs-dist)
│   └── vite.config.mjs    # Vite build configuration
├── api/              # Flask backend application
│   ├── app.py             # Main Flask application with PDF preview support
│   └── requirements.txt   # Python dependencies
├── assets/           # Shared assets (fonts, icons, cover)
├── package.json      # Root project configuration and scripts
├── Dockerfile        # Multi-stage Docker build (Node 22 + Python 3.13)
└── docker-compose.example.yml # Container orchestration template
```

## 🚀 Kom igång

### Utveckling (Rekommenderat)

1. Installera alla dependencies:
   ```bash
   npm run install:all
   ```

2. Starta utvecklingsservrar parallellt:
   ```bash
   npm run dev
   ```

3. Öppna http://localhost:3000 (React) och http://localhost:5000 (API)

### Docker Compose

1. Bygg och starta:
   ```bash
   npm run docker:dev
   # eller
   docker-compose up --build
   ```

2. Öppna http://localhost:5000 i webbläsaren

## 💻 Utveckling

### Frontend (React 19)

React-appen använder modern hooks-baserad arkitektur med Vite:

```bash
cd web
npm install
npm start          # Vite utvecklingsserver (port 3000)
npm run build      # Vite produktionsversion
npm run preview    # Förhandsgranska produktion lokalt
# npm test         # Vitest (ej installerat ännu)
# npm run lint     # ESLint (ej installerat ännu)
```

### Backend (Flask)

Flask API hanterar bildbehandling och PDF-generering med förhandsvisning:

```bash
cd api
pip install -r requirements.txt
python app.py     # Flask utvecklingsserver (port 5000)
```

### Monorepo-kommandon

```bash
# Utveckling
npm run dev                 # Starta både frontend och backend
npm run dev:web            # Endast React
npm run dev:api            # Endast Flask

# Build och deploy
npm run build              # Bygg React för produktion
npm run docker:build      # Bygg Docker image
npm run docker:run        # Kör Docker container

# Maintenance
npm run clean              # Rensa build-artifacts
npm run install:all        # Installera alla dependencies
```

### Bildformat som stöds

- **JPEG/JPG**: Standard-format
- **PNG**: Med transparens-stöd
- **HEIC/HEIF**: Moderna format från iPhone/iPad
- **Automatisk orientering**: Respekterar EXIF-data

## 📱 PWA-installation

### iOS (Safari)
1. Öppna appen i Safari
2. Tryck på dela-knappen
3. Välj "Lägg till på startskärmen"

### Android (Chrome)
1. Öppna appen i Chrome
2. Tryck på menyn (tre prickar)
3. Välj "Installera appen"

### Desktop
1. Öppna appen i Chrome/Edge
2. Klicka på installations-ikonen i adressfältet
3. Följ installationsguiden

## 🌐 Webbläsarkompatibilitet

### PDF-förhandsvisning (pdfjs-dist)
- **✅ Chrome/Chromium**: Full PDF-funktionalitet med Canvas-rendering
- **✅ Firefox**: Native PDF.js-integration (optimal prestanda)
- **✅ Safari (macOS)**: PDF-förhandsvisning med WebAssembly-stöd
- **✅ iOS Safari**: Optimerad upplevelse med Web Share API + native fildelning
- **✅ Edge**: Full PDF-funktionalitet med modern WebAssembly

### PWA & Moderna webbstandarder
- **✅ Service Workers**: Alla moderna webbläsare
- **✅ Web Share API**: iOS Safari, Android Chrome
- **✅ Canvas API**: Universellt stöd för PDF-rendering
- **✅ ES Modules**: Stöds av alla målwebbläsare

### Fallback-strategier
- **PDF-nedladdning**: När förhandsvisning ej stöds
- **iOS-specifik**: Öppnar PDF i ny flik för maximal kompatibilitet
- **Progressive Enhancement**: Grundfunktionalitet fungerar överallt

## 🔧 API-endpoints

### `POST /upload`
Ladda upp bilder och generera PDF med förhandsvisning eller direkt nedladdning.

**Parametrar:**
- `images`: Bildfiler (multipart/form-data)
- `size`: Bildstorlek i cm (standard: 5.5)
- `layout`: Layout-typ - `"standard"` eller `"polaroid"` (standard: "standard")
- `preview`: `"true"` för JSON-svar med base64 PDF-data, `"false"` för direkt nedladdning

**Svar (preview=true):**
```json
{
  "success": true,
  "pdf_data": "base64-encoded-pdf-data",
  "filename": "bilder.pdf",
  "size": 1234567,
  "image_count": 8,
  "grid_info": {
    "cols": 3,
    "rows": 3,
    "size_cm": 5.5,
    "layout": "polaroid"
  }
}
```

### `POST /debug`
Debug-endpoint för felsökning av bildformat och processeringsfel.

### `GET /health`
Hälsokontroll och funktionalitetsstatus inklusive HEIC/HEIF-stöd.

### `GET /`
Servar React-applikationen (SPA).

### Static Assets
- `GET /favicon.svg`: PWA-favicon
- `GET /manifest.json`: PWA-manifest
- `GET /sw.js`: Service worker

## 🎯 PWA-funktioner

- **Offline-läge**: Caching av statiska resurser
- **Installbar**: Lägg till på startskärmen
- **Push-notifikationer**: Redo för framtida implementation
- **Service Worker**: Intelligent cache-hantering
- **Native-känsla**: Fullskärmläge utan webbläsarfält

## 🏗️ Arkitektur

### React 19 Frontend
- **Modern Components**: Funktionella komponenter med React 19 hooks
- **Custom Hooks**:
  - `useFormState`: Komplex formulärhantering och validering
  - `useIOSCompatibility`: Platform-specifik funktionalitet och debug-logging
  - `useTheme`: Automatisk systemtema-detection med DaisyUI
- **State Management**: Lokalt state med `useState` och `useCallback` optimering
- **PDF Integration**: pdfjs-dist för client-side PDF-rendering med Canvas API
- **iOS Compatibility**: Web Share API och Safari-specifika workarounds

### Modern Build & Styling
- **Vite**: Snabb utveckling med HMR och optimerad produktions-build
- **Tailwind CSS 4**: Utility-first styling med CSS-variabler
- **DaisyUI**: Komponentbibliotek med tema-stöd
- **Code Splitting**: Separata chunks för vendor, PDF och applikationskod

### Flask Backend
- **Enhanced API**: RESTful endpoints med förhandsvisning och direkt nedladdning
- **Preview Mode**: JSON-svar med base64 PDF-data för client-side rendering
- **Layout Support**: Standard och Polaroid-layout med autentiska proportioner
- **Image Processing**: PIL/Pillow för bildmanipulation med EXIF-orientering
- **PDF Generation**: ReportLab för avancerad PDF-skapande
- **Multi-format Support**: HEIC/HEIF-stöd via pillow-heif

### Nya Dependencies & Syfte
- **pdfjs-dist@5.4.149**: Mozilla PDF.js för robust PDF-rendering i webbläsare
- **@fontsource/bricolage-grotesque@5.2.8**: Modern typografi från Google Fonts
- **@tailwindcss/vite@4.1.12**: Tailwind CSS 4 integration för Vite
- **daisyui@5.1.6**: UI-komponenter och tema-system för Tailwind

## 📞 Kontakt

Detta projekt har utvecklats från en enkel webapp till en fullfjädrad PWA med modern React-arkitektur. Bidrag välkomnas via issues och pull requests!