# FITZ INDUSTRIES — Cinematic Website

Pure HTML/CSS/JS (kein Build-Step). Scroll-Storytelling mit **GSAP + ScrollTrigger** und **Lenis** Smooth-Scroll.
Hero nutzt das **echte Brand-Intro-Video** (Erde → Weltkarte → Logo), per CSS ins Gold-Spektrum gegradet und vom
„Veo"-Wasserzeichen befreit (ffmpeg-Crop). Echte Markenassets (weißes FITZ-Logo, FHG-Logo, Länder-Fotos) sind eingebunden.

## Lokal ansehen
```bash
cd fitz-industries-site
python3 -m http.server 8080
# → http://localhost:8080
```

## Auf GitHub Pages pushen
```bash
git init && git add . && git commit -m "FITZ INDUSTRIES cinematic site"
git branch -M main
git remote add origin https://github.com/<USER>/<REPO>.git
git push -u origin main
```
Dann **Settings → Pages → Branch `main` / root**. Alle Pfade sind relativ → funktioniert auch im Unterpfad `/<REPO>/`.

## Sektionen
1. **Hero** — echtes Brand-Video (gold-graded) + Tagline „Global Vision. Swiss Heritage."
2. **Über Uns** — Wort-für-Wort-Reveal + hochzählende Stats
3. **Unternehmen** — horizontaler Pin-Scroll durch alle 11 Firmen (FHG mit echtem Logo)
4. **Globale Präsenz** — „Swiss Heritage"-Marquee mit echten Länder-Fotos (Liechtenstein, Österreich, Deutschland, Luxemburg, Tschechien, Bulgarien, Alpenraum)
5. **Fitz Foundation** — cinematic Parallax
6. **Kontakt** — Formular (Formspree-ready)

## Kontaktformular aktivieren
In `index.html` das `action="https://formspree.io/f/your-id"` durch deine [Formspree](https://formspree.io)-ID
ersetzen. Fallback: `mailto:contact@fitz.li`.

## Assets
```
assets/video/hero-globe.mp4   # echtes Brand-Intro (Wasserzeichen weggecroppt)
assets/brand/                 # echte Logos (logo-white, fhg-ag, …) von test.fitz-industries.ch
assets/real/                  # echte Länder-Fotos (AdobeStock) von test.fitz-industries.ch
assets/img/                   # Branchen-Fotos pro Unternehmen (Unsplash, CC) + Hero-Poster
```
Hinweis: Die Branchen-Fotos in `assets/img/` sind lizenzfreie Unsplash-Platzhalter — für den finalen
Auftritt durch echte Firmenbilder ersetzen (gleiche Dateinamen). Die übrigen Firmenlogos
(`fih`, `fitz-group`, `fitz-ag`, `logo-black`) liegen bereit, falls weitere Karten ein echtes Logo bekommen sollen.
```
css/styles.css   # Dark-Luxus Design-Tokens, Layout
js/main.js       # Lenis + GSAP Szenen, Bild-Loader, Heritage-Marquee, Mobile-Menü
js/cursor.js     # Custom Gold-Cursor + magnetische Buttons
```
