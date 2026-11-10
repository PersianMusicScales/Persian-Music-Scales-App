"use strict";

(() => {
  const selector = document.getElementById("languageSelector");
  const avazhaButton = document.getElementById("avazhaButton");
  const avazha = document.getElementById("avazhaContainer");
  const menu = document.getElementById("avazhaColumns");
  const referenceRow = document.querySelector(".scale-reference-row");
  const circle = document.getElementById("outerScale");
  const notesButton = document.getElementById("modalRoleButton");
  const notesPopover = document.getElementById("modalRolePopover");
  const scoreButton = document.getElementById("keySignatureButton");
  const scorePopover = document.getElementById("keySignaturePopover");
  if (!selector || !avazhaButton || !avazha || !menu || !circle) return;

  const labels = {
    en: {
      role: "Shahed & finalis", select: "Select scale", avazha: "Related āvāz modes",
      analyze: "Analyze audio", mic: "Identify the scale"
    },
    fr: {
      role: "Shahed et note finale", select: "Choisir une gamme", avazha: "Āvāz apparentés",
      analyze: "Analyser un enregistrement", mic: "Identifier la gamme"
    },
    fa: {
      role: "شاهد و نت فرود", select: "انتخاب دستگاه یا گام", avazha: "آوازهای وابسته",
      analyze: "تحلیل فایل صوتی", mic: "شناسایی گام"
    }
  };
  const key = "persianMusicScalesLanguage";
  const isOpen = () => !menu.classList.contains("hidden");

  function placeMenu() {
    if (!isOpen()) return;
    const width = Math.min(290, window.innerWidth - 24);
    const anchor = referenceRow.getBoundingClientRect();
    const container = avazha.getBoundingClientRect();
    const rtl = selector.value === "fa";
    const x = rtl ? container.left : container.right - width;
    menu.style.width = width + "px";
    menu.style.left = Math.max(12, Math.min(x, window.innerWidth - width - 12)) + "px";
    menu.style.right = "auto";
    menu.style.top = Math.max(12, Math.min(anchor.bottom + 9, window.innerHeight - 170)) + "px";
  }

  function dismissMenu() {
    menu.classList.add("hidden");
    avazha.classList.remove("menu-open");
    avazhaButton.setAttribute("aria-expanded", "false");
  }

  function syncMenuState() {
    avazhaButton.setAttribute("aria-expanded", String(isOpen()));
    if (isOpen()) {
      if (scorePopover && !scorePopover.hidden) scoreButton.click();
      if (notesPopover && !notesPopover.hidden) notesButton.click();
      placeMenu();
    }
  }

  function clampLabels() {
    const width = circle.clientWidth;
    if (!width) return;
    for (const label of circle.querySelectorAll(".dynamic-label")) {
      if (!label.dataset.originalLeft) {
        label.dataset.originalLeft = label.style.left;
      }
      const raw = parseFloat(label.dataset.originalLeft);
      if (!Number.isFinite(raw)) continue;
      const original = width * raw / 100;
      const half = label.getBoundingClientRect().width / 2;
      const edge = Math.min(half + 3, width / 2);
      label.style.left = Math.max(edge, Math.min(width - edge, original)) + "px";
    }
  }

  let updateScheduled = false;
  function scheduleClamp() {
    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(() => {
      updateScheduled = false;
      clampLabels();
    });
  }
  new MutationObserver(scheduleClamp).observe(circle, { childList: true });

  function syncLanguage() {
    const lang = labels[selector.value] ? selector.value : "en";
    const t = labels[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "fa");
    const notes = document.getElementById("modalRoleButtonLabel");
    if (notes) notes.textContent = t.role;
    notesButton.setAttribute("aria-label", t.role);
    document.getElementById("scaleSelector").setAttribute("aria-label", t.select);
    avazhaButton.setAttribute("aria-label", t.avazha);
    const mic = document.getElementById("quickScaleFinderButton");
    if (mic) mic.setAttribute("aria-label", t.mic);
    const analyze = document.getElementById("openAudioAnalyzer");
    if (analyze) analyze.setAttribute("aria-label", t.analyze);
    const formatter = new Intl.NumberFormat(lang === "fa" ? "fa-IR" : lang === "fr" ? "fr-FR" : "en-US");
    document.querySelectorAll("[data-interval-cents]").forEach((item) => {
      const cents = Number(item.dataset.intervalCents);
      item.textContent = lang === "fa" ? formatter.format(cents) + " سنت" :
        formatter.format(cents) + " cents";
    });
    try { localStorage.setItem(key, lang); } catch (_) { /* Storage is optional. */ }
    scheduleClamp();
    if (isOpen()) placeMenu();
  }

  selector.addEventListener("change", syncLanguage);
  avazhaButton.setAttribute("aria-controls", menu.id);
  avazhaButton.setAttribute("aria-expanded", String(isOpen()));
  avazhaButton.addEventListener("click", () => requestAnimationFrame(syncMenuState));
  menu.addEventListener("click", () => requestAnimationFrame(syncMenuState));
  notesButton.addEventListener("click", () => { if (isOpen()) dismissMenu(); });
  scoreButton.addEventListener("click", () => { if (isOpen()) dismissMenu(); });
  document.addEventListener("click", (event) => {
    if (isOpen() && !avazha.contains(event.target)) dismissMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      dismissMenu();
      avazhaButton.focus();
    }
  });
  window.addEventListener("resize", () => { scheduleClamp(); placeMenu(); }, { passive: true });
  window.addEventListener("scroll", placeMenu, { passive: true });

  try {
    const stored = localStorage.getItem(key);
    if (stored && labels[stored] && stored !== selector.value) {
      selector.value = stored;
      selector.dispatchEvent(new Event("change", { bubbles: true }));
    }
  } catch (_) { /* The browser may disable storage. */ }
  syncLanguage();
})();
