/* =============================================================
   OSKAR KNAPP / PORTFOLIO
   Vanilla JS. Einzige Library: anime.js v4 via CDN.
   Alles ist Progressive Enhancement: Fällt JS oder das CDN aus,
   bleibt die Seite komplett lesbar und das Formular sendet
   klassisch per POST.
   ============================================================= */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------
   1. Alter automatisch berechnen.
   Geburtstag: 27. August 2010. Alle Elemente mit data-age zeigen
   immer das aktuelle Alter, ohne dass jemand die Seite anfassen
   muss. Der Wert im HTML ist nur der Fallback ohne JS.
   ------------------------------------------------------------- */
function setupAge() {
  const BIRTH_YEAR = 2010;
  const BIRTH_MONTH = 8; // August
  const BIRTH_DAY = 27;

  const now = new Date();
  let age = now.getFullYear() - BIRTH_YEAR;
  const beforeBirthday =
    now.getMonth() + 1 < BIRTH_MONTH ||
    (now.getMonth() + 1 === BIRTH_MONTH && now.getDate() < BIRTH_DAY);
  if (beforeBirthday) age -= 1;

  $$("[data-age]").forEach((el) => {
    el.textContent = String(age);
  });
}

/* -------------------------------------------------------------
   2. Scroll-Progress: roter Balken oben, wie eine Timeline.
   Läuft ohne Library, rAF-gedrosselt.
   ------------------------------------------------------------- */
function setupProgress() {
  const fill = $(".progress-fill");
  if (!fill) return;

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}

/* -------------------------------------------------------------
   3. YouTube-Embeds: DSGVO-freundlich.
   Erst der Klick lädt das iframe, und zwar via youtube-nocookie.
   ------------------------------------------------------------- */
function setupEmbeds() {
  $$(".embed").forEach((embed) => {
    const button = $(".embed-play", embed);
    if (!button) return;

    button.addEventListener("click", () => {
      const id = embed.dataset.yt || "";

      // Platzhalter-ID: freundlich melden statt kaputtes Video laden
      if (!id || id.startsWith("DEINE_")) {
        const original = button.textContent;
        button.textContent = "VIDEO FOLGT / ID FEHLT NOCH";
        button.disabled = true;
        setTimeout(() => {
          button.textContent = original;
          button.disabled = false;
        }, 2500);
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
      iframe.title = "YouTube Video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      embed.replaceChildren(iframe);
    });
  });
}

/* -------------------------------------------------------------
   4. Kontaktformular: Web3Forms per fetch, ohne Reload.
   ------------------------------------------------------------- */
function setupForm() {
  const form = $(".contact-form");
  if (!form) return;

  const status = $(".form-status", form);
  const submit = $(".submit", form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    delete status.dataset.state;

    // Noch kein Access Key eingetragen: klarer Hinweis statt Fehlversuch
    if (!form.access_key.value || form.access_key.value === "DEIN_ACCESS_KEY") {
      status.dataset.state = "error";
      status.textContent = "FEHLER / Formular noch nicht aktiv. Access Key von web3forms.com eintragen.";
      return;
    }

    submit.disabled = true;
    status.textContent = "SENDET ...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      status.textContent = "GESENDET / Danke, ich melde mich.";
      form.reset();
    } catch {
      status.dataset.state = "error";
      status.textContent = "FEHLER / Nachricht kam nicht durch. Schreib mir direkt per E-Mail.";
    } finally {
      submit.disabled = false;
    }
  });
}

/* -------------------------------------------------------------
   5. Timecode-Werkzeuge: 24 Bilder pro Sekunde, Format HH:MM:SS:FF
   ------------------------------------------------------------- */
const FPS = 24;

function tcToFrames(tc) {
  const [h, m, s, f] = tc.split(":").map(Number);
  return (h * 3600 + m * 60 + s) * FPS + f;
}

function framesToTc(total) {
  const frames = Math.max(0, Math.round(total));
  const f = frames % FPS;
  const seconds = Math.floor(frames / FPS);
  const s = seconds % 60;
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

/* -------------------------------------------------------------
   6. Animationen mit anime.js v4.
   Startzustände werden erst HIER gesetzt (utils.set). Ohne JS
   ist also nichts versteckt. Alle Animationen max. 600ms.
   ------------------------------------------------------------- */
function initMotion({ animate, createTimeline, onScroll, stagger, utils }) {
  /* Text-Split: Headlines in einzelne Buchstaben zerlegen */
  $$("[data-split]").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.replaceChildren(
      ...[...text].map((ch) => {
        const span = document.createElement("span");
        span.className = "char";
        span.setAttribute("aria-hidden", "true");
        span.textContent = ch === " " ? " " : ch;
        return span;
      })
    );
  });

  /* ----- Hero: Name buchstabenweise, Statement als Klappe ----- */
  const heroChars = $$(".hero-name .char");
  const heroRest = [".hero-sub", ".scroll-hint"];

  utils.set(".scene--hero .scene-head", { opacity: 0 });
  utils.set(heroChars, { opacity: 0, translateY: "0.35em" });
  utils.set(".hero-statement", { opacity: 0, rotate: -5 });
  utils.set(heroRest, { opacity: 0 });

  const heroTimeline = createTimeline({ defaults: { ease: "outQuad" } });
  heroTimeline
    .add(".scene--hero .scene-head", { opacity: 1, duration: 400 })
    .add(heroChars, {
      opacity: 1,
      translateY: "0em",
      duration: 500,
      delay: stagger(28),
    }, "-=200")
    /* Die Klappe schlägt ein: kurze Drehung mit Überschwinger */
    .add(".hero-statement", {
      opacity: 1,
      rotate: 0,
      duration: 450,
      ease: "outBack",
    }, "-=250")
    .add(heroRest, { opacity: 1, duration: 400 }, "-=200");

  /* ----- Szenen-Titel: Buchstaben laufen beim Scrollen hoch ----- */
  $$(".scene-title").forEach((title) => {
    const chars = $$(".char", title);
    if (!chars.length) return;
    utils.set(chars, { opacity: 0, translateY: "0.3em" });
    animate(chars, {
      opacity: 1,
      translateY: "0em",
      duration: 450,
      delay: stagger(20),
      ease: "outQuad",
      /* sync "play": einmal ausgelöst, läuft die Animation immer zu Ende,
         auch wenn schnell weitergescrollt wird */
      autoplay: onScroll({ target: title, enter: "bottom-=10% top", sync: "play" }),
    });
  });

  /* ----- Timecodes zählen hoch, sobald die Szene erreicht ist ----- */
  $$(".tc[data-tc]").forEach((tcEl) => {
    const totalFrames = tcToFrames(tcEl.dataset.tc);
    if (!totalFrames) return; // Hero bleibt bei 00:00:00:00

    const counter = { f: 0 };
    tcEl.textContent = "TC 00:00:00:00";
    animate(counter, {
      f: totalFrames,
      duration: 600,
      ease: "outCubic",
      onUpdate: () => {
        tcEl.textContent = `TC ${framesToTc(counter.f)}`;
      },
      autoplay: onScroll({ target: tcEl, enter: "bottom-=5% top", sync: "play" }),
    });
  });

  /* ----- Generische Reveals: alles mit data-animate schiebt sich
     versetzt ins Bild (translateY + Opacity) ----- */
  $$("[data-animate]").forEach((el) => {
    utils.set(el, { opacity: 0, translateY: 32 });
    animate(el, {
      opacity: 1,
      translateY: 0,
      duration: 550,
      ease: "outQuad",
      autoplay: onScroll({ target: el, enter: "bottom-=8% top", sync: "play" }),
    });
  });
}

/* -------------------------------------------------------------
   Start
   ------------------------------------------------------------- */
setupAge();
setupProgress();
setupEmbeds();
setupForm();

/* anime.js nur laden, wenn Bewegung erwünscht ist.
   Dynamischer Import: schlägt er fehl, läuft der Rest trotzdem. */
if (!reducedMotion) {
  try {
    const anime = await import("https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm");
    initMotion(anime);
  } catch (error) {
    console.warn("anime.js konnte nicht geladen werden, Seite läuft ohne Animationen.", error);
  }
}
