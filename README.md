# Bilder till A4-PDF

En enkel webapp som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett A4-PDF. Projektet innehåller en liten frontend (HTML/CSS) och en Python-backend.

Innehåll
- backend/: Flask-app som tar emot uppladdade bilder och genererar PDF
- frontend/: statisk HTML/CSS för att ladda upp bilder och välja storlek
- Dockerfile: bygger backend
- docker-compose.example.yml: exempel för hur du kan köra appen med Docker Compose

Snabbstart (med Docker)
1. Kopiera example-filen om du vill använda Docker Compose lokalt:
   cp docker-compose.example.yml docker-compose.yml
2. Bygg och starta:
   docker-compose up --build
3. Öppna http://localhost:5000 i webbläsaren

Köra utan Docker (lokal utveckling)
1. Skapa ett virtuellt miljö och installera beroenden:
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
   pip install -r backend/requirements.txt
2. Kör appen:
   python backend/app.py
3. Öppna http://localhost:5000

Git och distribution
- Det finns en .gitignore som exkluderar lokala miljöfiler och docker-compose.yml så att du kan ha en lokal compose-fil utan att lägga upp den.
- Se docker-compose.example.yml för en minimal, säker configuration som kan användas som utgångspunkt.

Att tänka på inför publicering
- Ta bort eller se över eventuella hårdkodade hemligheter. Använd .env-filer eller hemliga hanterare för produktionsinställningar.
- Lägg gärna till licensfil (t.ex. MIT) om du vill att andra ska få använda koden.

Kontakt
Detta är ett litet exempelprojekt — lägg till issue/PR om du vill bidra eller har frågor.
