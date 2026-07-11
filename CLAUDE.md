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
- **⚠️ CACHE-BUSTER — BEI JEDER CSS/JS-ÄNDERUNG PFLICHT:** `?v=N` in **allen drei** HTML-Dateien
  (`index.html`, `impressum/index.html`, `datenschutz/index.html`) hochzählen. Wird das vergessen,
  bekommen wiederkehrende Besucher die alte gecachte Version und sehen die Änderung nicht.
  Details unter „Konventionen".
- **Kein Gewerbe angemeldet:** Es dürfen derzeit **keine kommerziellen Angebote** auf der Seite
  stehen — weder sichtbar noch als HTML-Kommentar noch in Meta-/Schema.org-Daten. Ausgebaute
  Inhalte stehen unten unter „Ausgeblendete Inhalte" und werden nach Gewerbeanmeldung reaktiviert.

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html` | Die gesamte Seite. Szenen: Hero, Projekte, Fotografie, About, Journey, Kontakt. (Szene 06 „Zusammenarbeit" + Projekte 3/4 ausgebaut, s. „Ausgeblendete Inhalte".) |
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
- **Cache-Buster (JEDES MAL!):** CSS/JS werden als `style.css?v=N` / `main.js?v=N` eingebunden.
  Bei **jeder** Änderung an CSS/JS die Zahl **in allen** HTML-Dateien (`index.html`, `impressum/`,
  `datenschutz/`) hochzählen, sonst laden Browser die alte Version. Diese Regel gilt ausnahmslos
  für jeden Commit, der `style.css` oder `main.js` anfasst. Aktuell `v=11`.
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

---

## Ausgeblendete Inhalte (reaktivieren nach Gewerbeanmeldung)

**Grund:** Noch kein Gewerbe angemeldet → keine kommerziellen Angebote auf der Seite, auch nicht
als HTML-Kommentar im Quelltext. Die Blöcke unten sind der vollständige Originalstand und werden
**1:1 wieder eingebaut**, sobald das Gewerbe existiert. Bis dahin: nichts davon auf die Seite!

> Hinweis: Das Repo (und damit diese Datei) ist öffentlich – GitHub Pages liefert auch `CLAUDE.md`
> aus. Im Quelltext der *Seite* taucht nichts mehr auf, „geheim" ist dieses Archiv aber nicht.

### 1. Projekte 3 + 4 (Aftermovies, Kundendrehs)
Wieder einfügen in `index.html`, innerhalb `<div class="projects">`, **nach** Projekt 2 (ALLEIN).
`DEINE_YOUTUBE_ID` durch echte 11-stellige IDs ersetzen.

```html
<!-- Projekt 3: Aftermovies -->
<article class="project" data-animate>
  <div class="embed" data-yt="DEINE_YOUTUBE_ID">
    <img class="embed-thumb"
         src="https://placehold.co/1280x720/23211E/E8E6E1?text=AFTERMOVIES+%2F+THUMBNAIL+%2F+PLATZHALTER"
         alt="Platzhalter für ein Aftermovie-Thumbnail" loading="lazy" width="1280" height="720">
    <span class="embed-hover" aria-hidden="true">AFTERMOVIES</span>
    <button class="embed-play" type="button">PLAY / VIDEO LADEN</button>
  </div>
  <div class="project-info">
    <h3 class="project-title">AFTERMOVIES</h3>
    <p class="project-meta">AUFTRAG / EVENTS / FORTLAUFEND</p>
    <p class="project-desc">Events, verdichtet auf wenige Minuten. Schnitt mit Tempo, Grading mit Charakter.</p>
  </div>
</article>

<!-- Projekt 4: Kundendrehs -->
<article class="project" data-animate>
  <div class="embed" data-yt="DEINE_YOUTUBE_ID">
    <img class="embed-thumb"
         src="https://placehold.co/1280x720/23211E/E8E6E1?text=KUNDENDREHS+%2F+THUMBNAIL+%2F+PLATZHALTER"
         alt="Platzhalter für ein Kundendreh-Thumbnail" loading="lazy" width="1280" height="720">
    <span class="embed-hover" aria-hidden="true">KUNDENDREHS</span>
    <button class="embed-play" type="button">PLAY / VIDEO LADEN</button>
  </div>
  <div class="project-info">
    <h3 class="project-title">KUNDENDREHS</h3>
    <p class="project-meta">IMAGEFILM / EVENT / FORTLAUFEND</p>
    <p class="project-desc">Imagefilme und Eventvideos. Bezahlte Drehs unter echten Bedingungen.</p>
  </div>
</article>
```

### 2. Szene 06 / Zusammenarbeit
Wieder einfügen in `index.html` **zwischen** Szene 05 (Journey, endet nach `journey-cta`) und
Szene 07 (Kontakt). Optional den Nav-Link `<a href="#zusammenarbeit">ZUSAMMENARBEIT</a>` in
`#site-menu` (vor KONTAKT) ergänzen. Zugehörige CSS-Klassen (`.scene--work`, `.work-*`) sind in
`style.css` noch vorhanden.

```html
<!-- ================= SZENE 06 / ZUSAMMENARBEIT ================= -->
<section id="zusammenarbeit" class="scene scene--work">
  <div class="scene-head" data-animate>
    <span class="slug">SZENE 06 / INT. BESPRECHUNG / TAG</span>
    <span class="tc" data-tc="00:07:12:20">TC&nbsp;00:07:12:20</span>
  </div>
  <h2 class="scene-title scene-title--wrap" data-animate>ZUSAMMEN&shy;ARBEIT</h2>

  <p class="work-intro" data-animate>Neben den eigenen Filmen arbeite ich als Videograf im Mostviertel und in ganz Niederösterreich. Kurz und ehrlich, das biete ich an:</p>

  <ul class="work-list">
    <li data-animate><span class="work-index">01</span>AFTERMOVIES</li>
    <li data-animate><span class="work-index">02</span>IMAGEFILME</li>
    <li data-animate><span class="work-index">03</span>SOCIAL MEDIA CONTENT</li>
  </ul>

  <p class="work-note" data-animate>Kein Agentur-Zwischenschritt, du redest direkt mit mir. Anfrage genügt, den Rest klären wir gemeinsam.</p>
</section>
```

### 3. SEO/Meta: kommerzielle Fassungen
Aktuell stehen neutrale Portfolio-Texte drin. Nach Gewerbeanmeldung wieder auf diese Fassungen
zurückstellen:

```html
<meta name="description" content="Oskar Knapp, Videograf und Filmemacher aus dem Mostviertel. Aftermovies, Imagefilme und Eventvideos in ganz Niederösterreich. Jetzt anfragen.">
<meta property="og:description" content="Aftermovies, Imagefilme und Eventvideos in Niederösterreich. Junger Filmemacher, alles selbst gedreht und geschnitten.">
```

In `Person.knowsAbout` (JSON-LD) wieder ergänzen: `"Aftermovie", "Imagefilm", "Eventvideo"`.

### 4. Schema.org: Service- und FAQ-Blöcke
Wieder in den `@graph` des JSON-LD in `index.html` einfügen (nach dem `Person`-Objekt):

```json
{
  "@type": "Service",
  "@id": "https://oskar-knapp.github.io/Personal-Brand/#leistungen",
  "serviceType": "Videoproduktion",
  "provider": { "@id": "https://oskar-knapp.github.io/Personal-Brand/#oskar" },
  "url": "https://oskar-knapp.github.io/Personal-Brand/",
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "Mostviertel" },
    { "@type": "AdministrativeArea", "name": "Niederösterreich" }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Videoproduktion",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Aftermovie" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Imagefilm" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Eventvideo" } }
    ]
  }
},
{
  "@type": "FAQPage",
  "@id": "https://oskar-knapp.github.io/Personal-Brand/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was kostet ein Video?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Das hängt von Länge, Drehzeit und Schnitt ab. Sag mir kurz, was du vorhast, dann bekommst du ein faires, unverbindliches Angebot."
      }
    },
    {
      "@type": "Question",
      "name": "In welcher Region drehst du?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Im ganzen Mostviertel und in Niederösterreich, rund um Loosdorf, Melk, Ybbs, Amstetten und St. Pölten."
      }
    },
    {
      "@type": "Question",
      "name": "Wie läuft ein Dreh ab?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kurze Anfrage, gemeinsames Konzept, Dreh vor Ort, danach Schnitt und Color Grading, fertige Übergabe im passenden Format."
      }
    }
  ]
}
```
