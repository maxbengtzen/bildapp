# Gridprint

![Cover photo](/assets/cover.png)

En modern Progressive Web App (PWA) som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett utskriftsvänligt A4-PDF. Appen är optimerad för mobila enheter med särskilt fokus på iOS Safari-kompatibilitet.

## ✨ Funktioner

- **🔲 PDF-generering**: Automatisk beskärning till kvadrater och smart layout på A4-format
- **📱 PWA-funktionalitet**: Installeras som en riktig app, fungerar offline med service worker
- **🍎 iOS-optimerad**: Inbyggt stöd för iOS Safari med PDF-förhandsvisning och native sharing
- **🌓 Automatisk temakväxling**: Följer systemets mörkt/ljus läge-inställningar
- **📸 Modernt bildstöd**: HEIC/HEIF-format (iPhone) samt traditionella PNG/JPG
- **⚡ Responsiv design**: Fungerar perfekt på mobil, tablet och desktop
- **🎨 Anpassad design**: Modern UI med Bricolage Grotesque-typsnitt och teal-färgschema

## 🗂️ Projektstruktur

- **backend/**: Flask-app som hanterar bildbehandling och PDF-generering
- **frontend/**: Modern frontend med Tailwind CSS, DaisyUI och PWA-funktionalitet
- **Dockerfile**: Multistage-build som bygger frontend och packar Python-runtime
- **docker-compose.example.yml**: Exempel för deployment med Docker Compose

## 🚀 Kom igång med Docker Compose

1. Kopiera example-filen:
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```

2. Bygg och starta:
   ```bash
   docker-compose up --build
   ```

3. Öppna http://localhost:5000 i webbläsaren

## 💻 Utveckling

### Frontend-utveckling

Appen använder Tailwind CSS med DaisyUI för styling:

```bash
cd frontend
npm install
npm run build:css  # Bygger output.css från input.css
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

## 📞 Kontakt

Detta projekt har utvecklats från en enkel webapp till en fullfjädrad PWA. Bidrag välkomnas via issues och pull requests!