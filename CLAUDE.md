# CLAUDE.md

Orientierung für Claude Code. Ziel: Struktur kennen, ohne alle Dateien neu zu scannen.

## Was das ist
Statische **Ein-Seiten-Portfolio-Website** (Oskar Knapp, Videograf). Live: `okmedia.at`.
Kein Framework, kein Build-Step, kein `package.json`. Reines HTML/CSS/Vanilla-JS.

## Stack & harte Regeln
- **Vanilla JS**, ES-Module. Einzige externe Lib: **anime.js v4** – wird in `main.js` per
  dynamischem Import vom CDN geladen (`if (!reducedMotion)`). Fällt das CDN aus, läuft alles ohne Animation.
- **Progressive Enhancement ist Pflicht:** Ohne JS muss die Seite komplett lesbar sein und das
  Formular klassisch per POST senden. Startzustände von Animationen werden erst in JS gesetzt
  (`utils.set`), nie im CSS versteckt.
- **DSGVO:** YouTube lädt erst **nach Klick** und nur über `youtube-nocookie.com`. Keine Tracker,
  keine externen Requests beim Seitenaufbau (Schriften & Icons sind selbst gehostet / Daten-URIs).
- Schriften selbst gehostet in `assets/fonts/` (Archivo variable, IBM Plex Mono 400/500/600).
- **Alle Animationen ≤ 600 ms.**

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html` | Die gesamte Seite. Szenen 01–07: Hero, Projekte, Fotografie, About, Journey, Zusammenarbeit, Kontakt. |
| `main.js` | Gesamtes Verhalten, in nummerierte Abschnitte (1–6) gegliedert – siehe unten. |
| `style.css` | Gesamtes Styling. Abschnitte per `/* ---------- … ---------- */`. Design-Tokens in `:root`. |
| `impressum/`, `datenschutz/` | Rechtstexte, eigene `index.html`, teilen sich `../style.css`. |
| `assets/` | Fotos (`DSC*`, `IMG*`), `thumbnails/` (YouTube-Standbilder), `fonts/`. |
| `robots.txt`, `sitemap.xml` | SEO. |
| `.github/workflows/static.yml` | Deploy (s. u.). |

## main.js – Abschnitte (Funktion → Zweck)
Alle `setup*()` werden am Dateiende aufgerufen; `initMotion()` nur bei erwünschter Bewegung.
1. `setupAge()` – Alter aus Geburtsdatum (27.08.2010), füllt `[data-age]`.
2. `setupProgress()` – roter Scroll-Fortschrittsbalken oben.
   2b. `setupBurger()` – Mobile-Burger-Menü (≤ 800px).
3. `loadYouTubeApi()` + `setupEmbeds()` – Klick-zu-Laden-YouTube via **IFrame-Player-API**,
   `onReady → playVideo()`. Ladezustand („LÄDT …", Thumbnail bleibt), 10-s-Timeout-Fallback.
   Platzhalter-IDs (`DEINE_…`) zeigen „VIDEO FOLGT".
   3b. `setupGallery()` – justiertes Reihen-Layout, Fotos werden nicht beschnitten.
4. `setupForm()` – Kontaktformular via **Web3Forms** (`fetch` auf `api.web3forms.com/submit`),
   ohne Reload. `access_key` steht als hidden input in `index.html` (öffentlich, kein Secret).
5. `tcToFrames()` / `framesToTc()` – Timecode-Hilfen, 24 fps, Format `HH:MM:SS:FF`.
6. `initMotion({…anime})` – alle Animationen (Hero-Timeline, Szenentitel, Timecode-Counter,
   generische `[data-animate]`-Reveals per `onScroll`).

## JS-Hooks (data-Attribute in HTML)
`data-age`, `data-split` (Text→Buchstaben), `data-tc` (Timecode), `data-yt` (YouTube-ID), `data-animate` (Scroll-Reveal).

## Design-Tokens (`:root` in style.css)
`--paper #E8E6E1`, `--ink #1C1B19`, `--red #E63321` (einzige Akzentfarbe), `--mono` (IBM Plex Mono),
`--display` (Archivo), `--gutter` (Seitenränder). Rot sparsam einsetzen.

## Konventionen
- **Cache-Buster:** CSS/JS werden als `style.css?v=N` / `main.js?v=N` eingebunden. Bei jeder
  Änderung an CSS/JS die Zahl **in allen** HTML-Dateien (`index.html`, `impressum/`, `datenschutz/`)
  hochzählen, sonst laden Browser die alte Version. Aktuell `v=9`.
- Kommentare & Commit-/PR-Sprache: **Deutsch** (wie im bestehenden Code).
- Neue Videos: echte 11-stellige YouTube-ID in `data-yt` eintragen, `DEINE_YOUTUBE_ID` ersetzen.

## Deployment
GitHub Pages via `.github/workflows/static.yml`: Push auf **`main`** deployt das **gesamte Repo**
(kein Build). Andere Branches deployen nicht – erst nach Merge in `main` ist etwas live.

## Verifizieren (kein Test-Framework vorhanden)
- Syntax: `node --check main.js`
- Lokal ansehen: beliebiger Static-Server im Repo-Root (z. B. `python3 -m http.server`), dann Browser.
- Für JS-Verhalten (z. B. Embeds) eignet sich Playwright mit dem vorinstallierten Chromium
  (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`); externe Hosts wie youtube.com sind in der
  Sandbox nicht erreichbar → im Test mocken (`page.route`).
