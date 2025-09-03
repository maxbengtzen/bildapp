# Gridprint

![Cover photo](/assets/cover.png)

En modern Progressive Web App (PWA) byggd med React och Flask som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett utskriftsvänligt A4-PDF. Appen är optimerad för mobila enheter med särskilt fokus på iOS Safari-kompatibilitet.

## ✨ Funktioner

- **🔲 PDF-generering**: Automatisk beskärning till kvadrater och smart layout på A4-format
- **📱 PWA-funktionalitet**: Installeras som en riktig app, fungerar offline med service worker
- **🍎 iOS-optimerad**: Inbyggt stöd för iOS Safari med PDF-förhandsvisning och native sharing
- **🌓 Automatisk temakväxling**: Följer systemets mörkt/ljus läge-inställningar
- **📸 Modernt bildstöd**: HEIC/HEIF-format (iPhone) samt traditionella PNG/JPG
- **⚡ Responsiv design**: Fungerar perfekt på mobil, tablet och desktop
- **🎨 Anpassad design**: Modern UI med Bricolage Grotesque-typsnitt och teal-färgschema
- **⚛️ React-baserad**: Modern komponentarkitektur med hooks och state management

## 🗂️ Projektstruktur

```
gridprint/
├── web/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles.css     # daisyUI + Tailwind CSS 4 config
│   ├── public/            # Static assets and PWA files
│   └── package.json       # Frontend dependencies
├── api/              # Flask backend application
│   ├── app.py             # Main Flask application
│   └── requirements.txt   # Python dependencies
├── assets/           # Shared assets (fonts, icons, cover)
├── package.json      # Root project configuration
├── Dockerfile        # Multi-stage Docker build
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

### Frontend (React)

React-appen använder modern hooks-baserad arkitektur:

```bash
cd packages/web
npm install
npm start          # Utvecklingsserver
npm run build      # Produktionsversion
npm test          # Tester
```

### Backend (Flask)

Flask API hanterar bildbehandling och PDF-generering:

```bash
cd packages/api
pip install -r requirements.txt
python app.py     # Utvecklingsserver
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

- **✅ Chrome/Chromium**: Full funktionalitet
- **✅ Firefox**: Full funktionalitet
- **✅ Safari (macOS)**: PDF-förhandsvisning med fallback
- **✅ iOS Safari**: Optimerad upplevelse med native sharing
- **✅ Edge**: Fungerar med PDF-fallback

## 🔧 API-endpoints

- `POST /upload`: Ladda upp bilder och generera PDF
- `POST /debug`: Debug-endpoint för felsökning
- `GET /health`: Hälsokontroll och funktionalitetsstatus

## 🎯 PWA-funktioner

- **Offline-läge**: Caching av statiska resurser
- **Installbar**: Lägg till på startskärmen
- **Push-notifikationer**: Redo för framtida implementation
- **Service Worker**: Intelligent cache-hantering
- **Native-känsla**: Fullskärmläge utan webbläsarfält

## 🏗️ Arkitektur

### React Frontend
- **Component-based**: Modulära, återanvändbara komponenter
- **Custom Hooks**: Separation av business logic och UI
- **State Management**: React hooks för lokal state
- **iOS Compatibility**: Dedikerat stöd för Safari-specifika funktioner

### Flask Backend
- **RESTful API**: Clean endpoints för bilduppladdning och PDF-generering
- **Image Processing**: PIL/Pillow för bildmanipulation
- **PDF Generation**: ReportLab för PDF-skapande
- **Multi-format Support**: HEIC/HEIF-stöd via pillow-heif

## 📞 Kontakt

Detta projekt har utvecklats från en enkel webapp till en fullfjädrad PWA med modern React-arkitektur. Bidrag välkomnas via issues och pull requests!