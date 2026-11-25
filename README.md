# Fenstro Fönster

Hemsida för Fenstro Fönster (Fenstro Handelsbolag), fönsterputs i Vellinge med omnejd.

Sidan ligger på https://fenstrofonster.se och publiceras med GitHub Pages från grenen `main`.

## Filer

- `index.html` – hela sidan, med stil och prisräknare
- `404.html` – sidan som visas om en länk inte finns
- `fonsterputs-<ort>.html` – en sida per ort för Google. Byggs av `_bygg/orter.py`, ändra texterna där och kör `python3 _bygg/orter.py` (uppdaterar även `sitemap.xml`)
- `img/` – logga, ikoner och bilder
- `fonts/` – typsnittet Montserrat (fri licens, se `fonts/OFL.txt`)
- `CNAME` – kopplar sidan till fenstrofonster.se
- `robots.txt`, `sitemap.xml` – hjälper Google att hitta sidan

## Ändra något

Priser och texter finns i `index.html`. Priserna i prisräknaren står i JavaScript-delen längst ner, under "Prisräknare".
