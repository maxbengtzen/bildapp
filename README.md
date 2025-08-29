# Bilder till A4-PDF

En enkel webapp som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett A4-PDF. Projektet innehåller en liten frontend (HTML/CSS) och en Python-backend.

Innehåll
- backend/: Flask-app som tar emot uppladdade bilder och genererar PDF
- frontend/: statisk HTML/CSS (Tailwind + DaisyUI) för att ladda upp bilder och välja storlek
- Dockerfile: bygger frontend med en Node-byggetrinn och packar sedan en Python-runtime
- docker-compose.example.yml: exempel för hur du kan köra appen med Docker Compose

Snabbstart (med Docker)
1. Kopiera example-filen om du vill använda Docker Compose lokalt:
   cp docker-compose.example.yml docker-compose.yml
2. Bygg och starta (Docker bygger frontend i node-steget):
   docker-compose up --build
3. Öppna http://localhost:5000 i webbläsaren

Köra utan Docker (lokal utveckling)
1. Backend (Python):
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
   pip install -r backend/requirements.txt
   python backend/app.py

2. Frontend (Tailwind CLI):
   - Gå till frontend-katalogen och installera dev-deps:
     cd frontend
     npm install

   - Bygg en produktionsfil (genererar output.css i frontend-katalogen):
     npx @tailwindcss/cli -i ./src/input.css -o ./output.css --minify --content './**/*.html' './**/*.js'

   - Alternativt använd npm-skript (om package.json innehåller dem):
     npm run build:css      # bygg en gång
     npm run dev:css        # kör med --watch under utveckling

   - index.html länkar till ./output.css (serverad av Flask från frontend-mappen när du kör Docker eller kopierar filen vid lokal körning), så se till att output.css ligger i frontend-root.

Om du inte ser några Tailwind-stilar i webbläsaren (t.ex. output.css är tom eller 0 bytes)
- Kontrollera att input-filen innehåller Tailwinds direktiv högst upp:
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

- Kontrollera content-globs så Tailwind hittar dina klassnamn (passa --content eller tailwind.config.js)
- Bygg i en temporär Node-container för felsökning (om du inte vill installera Node lokalt):
  docker run --rm -v "$(pwd)/frontend:/work" -w /work node:18-alpine \
    sh -c "npm install --silent && npx @tailwindcss/cli -i ./src/input.css -o ./output.css --minify --content './**/*.html' './**/*.js' && ls -la output.css && head -n 20 output.css"

Docker och var assets hamnar
- Dockerfile använder en multi-stage build: först node:18-alpine (nodebuilder) där frontend byggs, sedan kopieras hela frontend-mappen till slutbilden under /frontend.
- Flask-backenden (backend/app.py) är konfigurerad att serva statiska filer från ../frontend relativt backend-katalogen. När bilden körs i /app (i Docker) motsvarar ../frontend → /frontend.
- Därför måste den byggda CSS-filen ligga i frontend-root (t.ex. /frontend/output.css i containern) så att index.html kan referera till /output.css.

Felsökning i Docker
- Bygg med plain logs och leta efter npm/tailwind-fel:
  docker-compose build --progress=plain
- Lista byggda filer i runtime-container:
  docker-compose run --rm bildapp sh -c "ls -la /frontend || true; wc -c /frontend/output.css || true"

Git och distribution
- Det finns en .gitignore som exkluderar lokala miljöfiler och docker-compose.yml så att du kan ha en lokal compose-fil utan att lägga upp den.

Att tänka på inför publicering
- Ta bort eller se över eventuella hårdkodade hemligheter. Använd .env-filer eller hemliga hanterare för produktionsinställningar.
- Lägg gärna till licensfil (t.ex. MIT) om du vill att andra ska få använda koden.

Kontakt
Detta är ett litet exempelprojekt — lägg till issue/PR om du vill bidra eller har frågor.
