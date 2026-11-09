/* Dynamic Persian staff-notation preview (educational, 50-cent pitch model).
 *
 * CRITICAL: The seven-note pitch positions are taken from the app. Their
 * enharmonic spellings are chosen independently of circle-label text.
 * The rendered accidentals are DERIVED MODEL ALTERATIONS, not evidence that
 * every 24-EDO rotation is a traditional radif key signature.
 * Koron and Sori SVGs reproduce the user's Wikimedia Commons references.
 * Context and attribution: docs/dynamic-persian-notation.md.
 */
(function (root) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
  const NATURALS = [0, 200, 400, 500, 700, 900, 1100];
  const FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"];
  const SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"];
  const KINDS = Object.freeze({
    "-150": "flatKoron", "-100": "flat", "-50": "koron",
    "0": "natural", "50": "sori", "100": "sharp", "150": "sharpSori"
  });
  const ORDER = { flat: 0, koron: 1, sharp: 2, sori: 3, flatKoron: 4, sharpSori: 5 };
  const TRANSLATIONS = {
    en: {
      open: "Open scale notation", close: "Close scale notation",
      title: "Scale notation", derived: "Calculated scale alterations",
      western: "Standard Western key signature", noAccidentals: "No accidentals",
      root: "Reference spelling", notes: "Seven displayed degrees",
      caveat: "These signs reproduce the app's approximate 50-cent model, not a complete radif transcription. Koron and Sori are context-sensitive in performance.",
      compound: "This transposition needs a combined accidental (flat + Koron or sharp + Sori). That is a theoretical spelling, not a verified conventional Persian key signature.",
      source: "Notation reference: LilyPond Persian classical music; exact Koron/Sori artwork: Wikimedia Commons (CC BY-SA 4.0)."
    },
    fr: {
      open: "Afficher la notation de la gamme", close: "Fermer la notation",
      title: "Notation de la gamme", derived: "Altérations calculées de la gamme",
      western: "Armure occidentale usuelle", noAccidentals: "Aucune altération",
      root: "Écriture de référence", notes: "Sept degrés affichés",
      caveat: "Les signes représentent le modèle approximatif à pas de 50 cents de l'application, et non une transcription complète du radif. L'intonation des koron et sori dépend du contexte.",
      compound: "Cette transposition exige des altérations combinées (bémol + koron ou dièse + sori). C'est une écriture théorique, non une armure persane traditionnelle vérifiée.",
      source: "Référence : LilyPond, musique classique persane ; symboles exacts : Wikimedia Commons (CC BY-SA 4.0)."
    },
    fa: {
      open: "نمایش نت‌نویسی گام", close: "بستن نت‌نویسی",
      title: "نت‌نویسی گام", derived: "علامت‌های تغییرِ محاسبه‌شده",
      western: "سرکلید متعارف غربی", noAccidentals: "بدون علامت تغییر",
      root: "نگارش نت مرجع", notes: "هفت درجهٔ نمایش‌داده‌شده",
      caveat: "این علامت‌ها بر پایهٔ مدل تقریبیِ ۵۰ سنتی برنامه محاسبه می‌شوند و نت‌نویسی کامل ردیف نیستند. کوکِ کرن و سری در اجرا به زمینهٔ موسیقایی وابسته است.",
      compound: "این انتقال نیاز به علامت ترکیبیِ بمل+کرن یا دیز+سری دارد؛ این نگارش محاسباتی است و سرکلید مرسومِ تأییدشدهٔ موسیقی ایرانی نیست.",
      source: "منبع نت‌نویسی: راهنمای لیلی‌پاند؛ شکل دقیق کرن و سری: ویکی‌انبار (CC BY-SA 4.0)."
    }
  };
  const SOLFEGE = {
    en: ["C", "D", "E", "F", "G", "A", "B"],
    fr: ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"],
    fa: ["دو", "ر", "می", "فا", "سل", "لا", "سی"]
  };

  function mod(x, n) { return ((x % n) + n) % n; }
  function signedDifference(target, natural) {
    // Signed nearest interval on the 1200-cent pitch-class ring.
    return mod(target - natural + 600, 1200) - 600;
  }

  function chooseSpelling(relativeCents, rotationCents) {
    if (!Array.isArray(relativeCents) || relativeCents.length !== 7)
      throw new Error("Exactly seven scale degrees are required");
    if (!relativeCents.every(x => Number.isFinite(x) && Number.isInteger(x / 50)))
      throw new Error("Pitch collection must use the app's 50-cent grid");

    // Positive circle rotation moves the diatonic reference clockwise, so
    // the pitch labels at fixed outer-circle angles move downward in cents.
    const transposition = -Math.round(rotationCents / 50) * 50;
    const pitches = relativeCents.map(value => mod(value + transposition, 1200));
    const candidates = [];

    // Preserve one letter per consecutive degree, then search for the
    // simplest spelling. ±150c is displayed as an explicitly theoretical
    // combined accidental, never as an ordinary traditional signature.
    for (let rootLetter = 0; rootLetter < 7; rootLetter++) {
      const spelled = pitches.map((pitch, degree) => {
        const letterIndex = (rootLetter + degree) % 7;
        const alterationCents = signedDifference(pitch, NATURALS[letterIndex]);
        return {
          degree, pitchCents: pitch, letter: LETTERS[letterIndex],
          alterationCents, kind: KINDS[String(alterationCents)] || null
        };
      });
      if (spelled.some(n => !n.kind)) continue;
      const plus = spelled.some(n => n.alterationCents > 0);
      const minus = spelled.some(n => n.alterationCents < 0);
      const score = spelled.reduce((sum, n) =>
        sum + (Math.abs(n.alterationCents) === 150 ? 9 :
          Math.abs(n.alterationCents) === 50 ? 1.3 :
          Math.abs(n.alterationCents) === 100 ? 1 : 0), 0) +
        (plus && minus ? 3 : 0) +
        (spelled[0].alterationCents !== 0 ? 0.4 : 0);
      candidates.push({ score, rootLetter, spelled });
    }
    if (!candidates.length) throw new Error("No supported seven-letter pitch spelling");
    candidates.sort((a,b) => a.score - b.score || a.rootLetter - b.rootLetter);
    const chosen = candidates[0];
    const notes = chosen.spelled;
    const altered = notes.filter(n => n.alterationCents !== 0);
    // Persian dastgahs remain derived in this release. Publication-specific
    // standard signatures require an independently curated, sourced mapping.
    const conventionalWestern = altered.every(n => Math.abs(n.alterationCents) === 100) &&
      !(altered.some(n => n.alterationCents > 0) && altered.some(n => n.alterationCents < 0));
    const westernOnly = altered.length === 0 || conventionalWestern;

    return {
      notes, transpositionCents: transposition,
      ordered: altered.slice().sort((a,b) =>
        ORDER[a.kind] - ORDER[b.kind] ||
        (a.alterationCents < 0 ? FLAT_ORDER : SHARP_ORDER).indexOf(a.letter) -
        (b.alterationCents < 0 ? FLAT_ORDER : SHARP_ORDER).indexOf(b.letter)),
      hasCompound: altered.some(n => Math.abs(n.alterationCents) === 150),
      westernOnly,
      root: notes[0]
    };
  }

  function noteName(note, lang) {
    const name = (SOLFEGE[lang] || SOLFEGE.en)[LETTERS.indexOf(note.letter)];
    const signs = {
      "-150": "♭+Koron", "-100": "♭", "-50": "Koron",
      "0": "", "50": "Sori", "100": "♯", "150": "♯+Sori"
    };
    return name + (note.alterationCents === 0 ? "" : " " + signs[String(note.alterationCents)]);
  }

  function element(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [key, val] of Object.entries(attrs || {})) el.setAttribute(key, String(val));
    return el;
  }
  function drawText(svg, value, attrs) {
    const t = element("text", attrs);
    t.textContent = value;
    svg.appendChild(t);
  }

  // A deliberate staff position for each letter in treble-clef notation,
  // following conventional flat/sharp vertical order (not sorted by pitch).
  const POS_FLAT = { B: 46, E: 28, A: 52, D: 34, G: 58, C: 40, F: 64 };
  const POS_SHARP = { F: 22, C: 40, G: 16, D: 34, A: 52, E: 28, B: 46 };

  function drawGlyph(svg, kind, x, y) {
    if (kind === "koron" || kind === "sori") {
      const asset = kind === "koron" ? "assets/notation/koron.svg" : "assets/notation/sori.svg";
      svg.appendChild(element("image", { href: asset, x: x - 19, y: y - 22,
        width: 38, height: 43, preserveAspectRatio: "xMidYMid meet" }));
    } else if (kind === "flat" || kind === "sharp") {
      drawText(svg, kind === "flat" ? "♭" : "♯", { x: x - 1, y: y + 10,
        "font-family": "Arial, sans-serif", "font-size": 31, "font-weight": "normal",
        "text-anchor": "middle", fill: "#111827" });
    } else if (kind === "flatKoron" || kind === "sharpSori") {
      drawGlyph(svg, kind === "flatKoron" ? "flat" : "sharp", x - 7, y);
      drawGlyph(svg, kind === "flatKoron" ? "koron" : "sori", x + 9, y);
    }
  }

  function drawStaff(svg, result, scaleId) {
    svg.replaceChildren();
    svg.setAttribute("viewBox", "0 0 282 94");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Treble staff with scale accidentals");
    for (const y of [22,34,46,58,70]) {
      svg.appendChild(element("line", { x1: 7, y1: y, x2: 276, y2: y,
        stroke: "#17202a", "stroke-width": 1.5 }));
    }
    // Outline of treble clef from Google Noto Music, licensed SIL OFL 1.1.
    // Embedded as a vector path to render consistently on iOS and Android.
    const clef = element("path", { d: "M314 801Q300 854 291 906Q282 958 282 1012Q282 1059 288.5 1100.5Q295 1142 307 1177Q320 1217 341 1252.5Q362 1288 385.5 1311Q409 1334 427 1334Q451 1334 493 1249Q514 1206 524 1156Q534 1106 534 1049Q534 978 515 907.5Q496 837 459.5 775Q423 713 372 666L407 498Q422 500 432 501Q442 502 447 502Q508 502 556 467.5Q604 433 632.5 377Q661 321 661 254Q661 177 621.5 115.5Q582 54 503 25Q508 8 532 -117Q538 -147 541 -164.5Q544 -182 545 -195Q546 -208 546 -225Q546 -275 521.5 -314.5Q497 -354 455.5 -376Q414 -398 363 -398Q311 -398 271 -378.5Q231 -359 208 -324.5Q185 -290 185 -245Q185 -197 211.5 -165Q238 -133 287 -133Q329 -133 355 -163.5Q382 -194 382 -236Q382 -272 357 -299Q332 -326 292 -326H282Q308 -365 364 -365Q433 -365 472 -320Q511 -275 511 -205Q511 -188 507 -159.5Q503 -131 493 -91Q483 -51 477.5 -25Q472 1 470 12Q436 2 390 2Q304 2 222 52Q142 102 96 184Q50 266 50 361Q50 451 91 530Q132 609 192.5 675Q253 741 314 801ZM341 826Q364 838 390 870.5Q416 903 440 945Q464 987 479 1029.5Q494 1072 494 1106Q494 1142 483 1163Q472 1184 445 1184Q421 1184 398.5 1162Q376 1140 358.5 1103.5Q341 1067 331 1022Q321 977 321 930Q321 898 327.5 872Q334 846 341 826ZM398 379Q371 373 347 353.5Q323 334 308.5 306.5Q294 279 294 248Q294 223 307 196.5Q320 170 339 154Q352 142 365 136Q380 129 380 123Q380 120 370 117Q332 126 301.5 151Q271 176 253.5 211.5Q236 247 236 287Q236 330 253.5 370Q271 410 302.5 442Q334 474 374 490L345 641Q229 547 174.5 456.5Q120 366 120 277Q120 212 154 156Q188 100 247 65.5Q306 31 380 31Q400 31 420.5 35Q441 39 464 45ZM495 55Q593 97 593 227Q593 270 571 305.5Q549 341 512 362Q475 383 429 383Z",
      transform: "translate(0 67) scale(.05 -.05)", fill: "#141c24" });
    svg.appendChild(clef);
    const list = result.ordered;
    list.forEach((n, index) => {
      const y = n.alterationCents < 0 ? POS_FLAT[n.letter] : POS_SHARP[n.letter];
      drawGlyph(svg, n.kind, 88 + index * 26, y);
    });
    svg.dataset.scale = scaleId;
    svg.dataset.count = String(list.length);
  }

  function update({ scaleId, cents, rotationCents, lang }) {
    const button = typeof document !== "undefined" ? document.getElementById("keySignatureButton") : null;
    if (!button) return null;
    const result = chooseSpelling(cents, rotationCents);
    const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const svg = document.getElementById("keySignatureStaff");
    drawStaff(svg, result, scaleId);
    // Only Western major/minor with ordinary sharps/flats earns a
    // conventional label; Persian modes are conservative derived models.
    const standard = (scaleId === "minor" || scaleId === "mahur") &&
      result.westernOnly && !result.hasCompound;
    const status = standard ? dictionary.western : dictionary.derived;
    const noteList = result.notes.map(n => noteName(n, lang)).join(" · ");
    const label = status + ". " + dictionary.notes + ": " + noteList;
    button.setAttribute("aria-label", dictionary.open + ". " + label);
    svg.setAttribute("aria-label", label);
    document.getElementById("keySignatureTitle").textContent = dictionary.title;
    document.getElementById("keySignatureStatus").textContent = status;
    document.getElementById("keySignatureNotes").textContent = dictionary.notes + ": " + noteList;
    document.getElementById("keySignatureRoot").textContent =
      dictionary.root + ": " + noteName(result.root, lang);
    document.getElementById("keySignatureCaveat").textContent = dictionary.caveat;
    document.getElementById("keySignatureCompound").textContent =
      result.hasCompound ? dictionary.compound : "";
    document.getElementById("keySignatureSources").textContent = dictionary.source;
    document.getElementById("keySignaturePopover").setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
    return result;
  }

  function init() {
    const rootEl = document.getElementById("keySignatureWidget");
    const button = document.getElementById("keySignatureButton");
    const panel = document.getElementById("keySignaturePopover");
    const close = document.getElementById("keySignatureClose");
    if (!rootEl || !button || !panel || !close) return;
    rootEl.addEventListener("click", event => event.stopPropagation());
    const setOpen = open => {
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
    };
    button.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => { setOpen(false); button.focus(); });
    document.addEventListener("click", event => {
      if (!rootEl.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) {
        setOpen(false);
        button.focus();
      }
    });
  }

  const api = Object.freeze({ chooseSpelling, update, init, noteName, drawStaff });
  root.PERSIAN_KEY_SIGNATURE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
