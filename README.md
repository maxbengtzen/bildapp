# Gridprint

![Cover photo](/assets/cover.png)

En enkel webapp som tar flera uppladdade bilder, beskär dem till kvadrater och arrangerar dem i ett A4-PDF. Projektet innehåller en liten frontend (HTML/CSS) och en Python-backend.

## Innehåll

- backend/: Flask-app som tar emot uppladdade bilder och genererar PDF
- frontend/: statisk HTML/CSS (Tailwind + DaisyUI) för att ladda upp bilder och välja storlek
- Dockerfile: bygger frontend med en Node-byggetrinn och packar sedan en Python-runtime
- docker-compose.example.yml: exempel för hur du kan köra appen med Docker Compose med färdigbyggda docker images från GHCR

## Använda appen med Docker Compose

1. Kopiera example-filen om du vill använda Docker Compose lokalt:
   cp docker-compose.example.yml docker-compose.yml
2. Bygg och starta (Docker bygger frontend i node-steget):
   docker-compose up --build
3. Öppna http://localhost:5000 i webbläsaren

## Kontakt

Detta är ett litet exempelprojekt — lägg till issue/PR om du vill bidra eller har frågor.
