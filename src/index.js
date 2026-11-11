/* ========== 1) Service Worker Registration ========== */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("Service Worker registered!"))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}

/* ========== 2) beforeinstallprompt (A2HS) Handling ========== */
let deferredPrompt;

// Listen for the `beforeinstallprompt` event
window.addEventListener("beforeinstallprompt", (event) => {
  console.log("beforeinstallprompt event fired");
  // Prevent the mini-infobar from appearing
  event.preventDefault();
  // Save the event to use later
  deferredPrompt = event;

  // Show the A2HS button after an interaction
  const playScaleBtn = document.getElementById("playScale");
  playScaleBtn.addEventListener("click", () => {
    // Display the A2HS button after the "Play Scale" interaction
    const a2hsButton = document.getElementById("add-to-home");
    a2hsButton.style.display = "block";

    // Add event listener to the A2HS button
    a2hsButton.addEventListener("click", () => {
      a2hsButton.style.display = "none"; // Hide the button
      deferredPrompt.prompt(); // Show the A2HS prompt

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        deferredPrompt = null; // Clear the deferredPrompt
      });
    });
  });
});

/* ========== 3) Main Script (Scale + Avazha + Rotation logic) ========== */
// Grab references
const scaleSelector    = document.getElementById("scaleSelector");
const languageSelector = document.getElementById("languageSelector");
const circleContainer  = document.getElementById("circleContainer");
const outerScale       = document.getElementById("outerScale");
const diatonicScale    = document.getElementById("diatonicScale");
const labelAtZeroAngle = document.getElementById("labelAtZeroAngle");
const playScaleBtn     = document.getElementById("playScale");
if (window.PERSIAN_KEY_SIGNATURE) window.PERSIAN_KEY_SIGNATURE.init();
const pageTitle        = document.getElementById("pageTitle");
const bottomNavLabels  = document.querySelectorAll('.bottom-nav span[data-translate]');

const myAppButton      = document.getElementById("myAppButton");
const installPopup     = document.getElementById("installPopup");
const closePopupBtn    = document.getElementById("closePopup");
const dismissPopupBtn  = document.getElementById("dismissPopup");
const myAppContainer   = document.getElementById("myAppContainer");

// Rotation & language tracking
let rotation        = 0;
let currentLanguage = "en";

// Translations object
const translations = {
  fr: {
    displayLabels: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
    koron: "Koron",
    sori: "Sori",
    scales: {
      Shur: "Shur",
      nava: "Nava",
      segah: "Segah",
      homayoun: "Homayoun",
      esfahan: "Esfahan",
      chahargah: "Chahargah",
      mahur: "Mahur",
      rastPanjgah: "Rast-Panjgah",
      minor: "Minor",
    },
    playButton: "► Jouer la Gamme",
    title: "Persian Music Scales",
    bottomNav: {
      scales: "Échelles",
      tuner: "Accordeur",
      guide: "Guide",
      about: "À propos",
    },
    avazha: "Avazha",
    avazhaItems: {
      abuAta: "Abu Ata",
      bayatTork: "Bayat Tork",
      afshari: "Afshari",
      dashti: "Dashti",
    },
    installPopup: {
      title: "Install the App",
      instructions: "To install this application, follow the steps below.",
      share: "Tap the Share Button",
      addHome: "Add to Home Screen",
      dismiss: "Close",
    },
    myAppLabel: "App",
  },
  en: {
    displayLabels: ["C", "D", "E", "F", "G", "A", "B"],
    koron: "Koron",
    sori: "Sori",
    scales: {
      Shur: "Shur",
      nava: "Nava",
      segah: "Segah",
      homayoun: "Homayoun",
      esfahan: "Esfahan",
      chahargah: "Chahargah",
      mahur: "Mahur",
      rastPanjgah: "Rast-Panjgah",
      minor: "Minor",
    },
    playButton: "► Play Scale",
    title: "Persian Music Scales",
    bottomNav: {
      scales: "Scales",
      tuner: "Tuner",
      guide: "Guide",
      about: "About",
    },
    avazha: "Avazha",
    avazhaItems: {
      abuAta: "Abu Ata",
      bayatTork: "Bayat Tork",
      afshari: "Afshari",
      dashti: "Dashti",
    },
    installPopup: {
      title: "Install the App",
      instructions: "To install this Application, Follow the Steps Below.",
      share: "Tap the Share Button",
      addHome: "Add to Home Screen",
      dismiss: "Close",
    },
    myAppLabel: "App",
  },
  fa: {
    displayLabels: ["دو", "رِ", "می", "فا", "سُل ", "لا", "سی "],
    koron: "کُرُن",
    sori: "سُری",
    scales: {
      Shur: "شور",
      nava: "نوا",
      segah: "سه‌گاه",
      homayoun: "همایون",
      esfahan: "اصفهان",
      chahargah: "چهارگاه",
      mahur: "ماهور",
      rastPanjgah: "راست‌پنجگاه",
      minor: "مینور",
    },
    playButton: "► پخش گام",
    title: "گام‌های موسیقی ایرانی",
    bottomNav: {
      scales: "گام‌ها",
      tuner: "تیونر",
      guide: "راهنما",
      about: "درباره",
    },
    avazha: "آوازها",
    avazhaItems: {
      abuAta: "ابوعطا",
      bayatTork: "بیات ترک",
      afshari: "افشاری",
      dashti: "دشتی",
    },
    installPopup: {
      title: "نصب برنامه",
      instructions: "برای نصب این برنامه، مراحل زیر را دنبال کنید.",
      share: "دکمه Share را بزنید.",
      addHome: "دکمه add to Home Screen را انتخاب کنید.",
      dismiss: "بستن",
    },
    myAppLabel: "نصب",
  },
};

const parseableNotes = ["C", "D", "E", "F", "G", "A", "B"];

const scaleData = {
  Shur: {
    angles: [0, 45, 90, 150, 210, 240, 300],
    colors:
      "conic-gradient(#F7E7C6 0deg 45deg, #F7E7C6 45deg 90deg, #48625f 90deg 150deg, #48625f 150deg 210deg, black 210deg 240deg, #48625f 240deg 300deg, #48625f 300deg 360deg)",
  },
  nava: {
    angles: [0, 60, 90, 150, 210, 255, 300],
    colors:
      "conic-gradient(#48625f 0deg 60deg, black 60deg 90deg, #48625f 90deg 150deg, #48625f 150deg 210deg, #F7E7C6 210deg 255deg, #F7E7C6 255deg 300deg, #48625f 300deg 360deg)",
  },
  segah: {
    angles: [0, 60, 105, 150, 210, 255, 300],
    colors:
      "conic-gradient(#48625f 0deg 60deg, #F7E7C6 60deg 105deg, #F7E7C6 105deg 150deg, #48625f 150deg 210deg, #F7E7C6 210deg 255deg, #F7E7C6 255deg 300deg, #48625f 300deg 360deg)",
  },
  homayoun: {
    angles: [0, 45, 120, 150, 210, 240, 300],
    colors:
      "conic-gradient(#F7E7C6 0deg 45deg, #1A3B66 45deg 120deg, black 120deg 150deg, #48625f 150deg 210deg, black 210deg 240deg, #48625f 240deg 300deg, #48625f 300deg 360deg)",
  },
  esfahan: {
    angles: [0, 60, 90, 150, 210, 255, 330],
    colors:
      "conic-gradient(#48625f 0deg 60deg, black 60deg 90deg, #48625f 90deg 150deg, #48625f 150deg 210deg, #F7E7C6 210deg 255deg, #1A3B66 255deg 330deg, black 330deg 360deg)",
  },
  chahargah: {
    angles: [0, 45, 120, 150, 210, 255, 330],
    colors:
      "conic-gradient(#F7E7C6 0deg 45deg, #1A3B66 45deg 120deg, black 120deg 150deg, #48625f 150deg 210deg, #F7E7C6 210deg 255deg, #1A3B66 255deg 330deg, black 330deg 360deg)",
  },
  mahur: {
    angles: [0, 60, 120, 150, 210, 270, 330],
    colors:
      "conic-gradient(#48625f 0deg 60deg, #48625f 60deg 120deg, black 120deg 150deg, #48625f 150deg 210deg, #48625f 210deg 270deg, #48625f 270deg 330deg, black 330deg 360deg)",
  },
  rastPanjgah: {
    // Same seven-note pitch collection as Mahur, but a distinct modal identity.
    angles: [0, 60, 120, 150, 210, 270, 330],
    colors: "conic-gradient(#48625f 0deg 60deg, #48625f 60deg 120deg, black 120deg 150deg, #48625f 150deg 210deg, #48625f 210deg 270deg, #48625f 270deg 330deg, black 330deg 360deg)",
  },
  minor: {
    /* Natural minor: 0, 200, 300, 500, 700, 800, 1000 cents. */
    angles: [0, 60, 90, 150, 210, 240, 300],
    colors:
      "conic-gradient(#48625f 0deg 60deg, black 60deg 90deg, #48625f 90deg 150deg, #48625f 150deg 210deg, black 210deg 240deg, #48625f 240deg 300deg, #48625f 300deg 360deg)",
  },
};


const diatonicAngles = [0, 60, 120, 150, 210, 270, 330];

/* ---------- Update Outer Scale Function ---------- */
function updateOuterScale(scale) {
  const { angles, colors } = scaleData[scale];
  outerScale.style.background = colors;
  outerScale.innerHTML = "";

  angles.forEach((angle) => {
    const line = document.createElement("div");
    line.classList.add("line");
    line.style.transform = `rotate(${angle}deg)`;
    outerScale.appendChild(line);
  });
}

/* ---------- Update Static Labels (Diatonic Circle) ---------- */
function updateStaticLabels() {
  diatonicScale.innerHTML = "";
  const { displayLabels } = translations[currentLanguage];

  diatonicAngles.forEach((angle, index) => {
    const line = document.createElement("div");
    line.classList.add("line-diatonic");
    line.style.transform = `rotate(${angle}deg)`;
    diatonicScale.appendChild(line);

    const label = document.createElement("div");
    label.classList.add("label");
    label.innerHTML = displayLabels[index]; // possibly with superscripts
    const radians = (angle - 90) * (Math.PI / 180);
    label.style.top = `${50 + 40 * Math.sin(radians)}%`;
    label.style.left = `${50 + 40 * Math.cos(radians)}%`;
    diatonicScale.appendChild(label);
  });
}

/* ---------- Helpers for Angle + Labels ---------- */
function normalizeAngle(a) {
  return (a + 360) % 360;
}

function findClosestLabel(angle, displayLabels, koron, sori) {
  const normalizedAngle = normalizeAngle(angle);
  const rotatedAngles = diatonicAngles.map((a) => normalizeAngle(a + rotation));

  let bestDiff = 360;
  let bestList = [];

  rotatedAngles.forEach((diaAng, idx) => {
    let diff = normalizedAngle - diaAng;
    diff = normalizeAngle(diff);
    if (diff > 180) diff -= 360;
    const absDiff = Math.abs(diff);

    if (absDiff < bestDiff) {
      bestDiff = absDiff;
      bestList = [{ index: idx, diff }];
    } else if (absDiff === bestDiff) {
      bestList.push({ index: idx, diff });
    }
  });

  const dispArr = [];
  const parseArr = [];

  bestList.forEach(({ index, diff }) => {
    let disp = displayLabels[index];
    let prse = parseableNotes[index];

    if (diff === 30) {
      // Sharp
      if (currentLanguage === "fa") disp += " دیز";
      else disp += "♯";
      prse += "#";
    } else if (diff === -30) {
      // Flat
      if (currentLanguage === "fa") disp += " بمل";
      else disp += "♭";
      prse += "b";
    } else if (diff === 15) {
      // Sori
      disp += `<sup>${sori}</sup>`;
      prse += " sori";
    } else if (diff === -15) {
      // Koron
      disp += `<sup>${koron}</sup>`;
      prse += " koron";
    }
    dispArr.push(disp);
    parseArr.push(prse);
  });

  return {
    displayText: dispArr.join("/"),
    parseableText: parseArr.join("/"),
  };
}

/* ---------- Educational modal-function markers ---------- */
/* Distinguish scale anchor from Shahed / Finalis. Curated reference
 * assignments are read-only; legacy browser annotations remain stored but
 * no longer override public educational markers.
 */
const modalRolesByScale = window.PERSIAN_MODAL_ROLE_DEGREES || {};
let activeAvazRole = null;
const modalRoleTranslations = {
  en: { shahed: "Shahed", finalis: "Finalis", tonic: "Tonic",
    pending: "Shahed and Finalis: reference assignment pending.",
    show: "Show markers", hide: "Hide markers", details: "About these notes",
    trigger: "Notes", triggerLabel: "Shahed and Finalis notes",
    status: "Reference status", documented: "Documented model",
    provisional: "Provisional model", partial: "Partially established",
    warning: "Model limitation", sources: "Research sources" },
  fr: { shahed: "Shahed", finalis: "Note finale", tonic: "Tonique",
    pending: "Shahed et finalis : attribution en cours de vérification.",
    show: "Afficher les repères", hide: "Masquer les repères",
    trigger: "Notes", triggerLabel: "Notes Shahed et finale",
    details: "À propos de ces notes", status: "Statut de référence",
    documented: "Modèle documenté", provisional: "Modèle provisoire",
    partial: "Modèle partiellement établi", warning: "Limites du modèle",
    sources: "Sources scientifiques" },
  fa: { shahed: "شاهد", finalis: "نت پایان", tonic: "نت پایه",
    pending: "شاهد و نت پایان: تعیین نت‌ها در انتظار بررسی منابع است.",
    show: "نمایش نشانگرها", hide: "پنهان‌کردن نشانگرها",
    trigger: "نقش نت‌ها", triggerLabel: "اطلاعات شاهد و نت پایان",
    details: "دربارهٔ این نت‌ها", status: "وضعیت مستندات",
    documented: "مدل مستند", provisional: "مدل پیشنهادی",
    partial: "مدل نیمه‌مستند", warning: "محدودیت مدل",
    sources: "منابع پژوهشی" }
};
/* The pre-existing personal modal-role storage key is intentionally not read,
 * written, or deleted. A future optional personal-annotation feature can
 * migrate it explicitly without affecting reference-only markers. */
let modalRoleMarkersVisible = true;
try {
  modalRoleMarkersVisible = localStorage.getItem("persianMusicScales.showModalRoles.v1") !== "false";
} catch (err) {
  // Visibility defaults to on if local storage is unavailable.
}

/* The popover is anchored to the circle, never in the document flow.
 * Stop its clicks from rotating the circle underneath it. */
const modalRoleFloat = document.getElementById("modalRoleFloat");
const modalRoleButton = document.getElementById("modalRoleButton");
const modalRolePopover = document.getElementById("modalRolePopover");
const modalRoleButtonLabel = document.getElementById("modalRoleButtonLabel");

function setModalRolePopoverOpen(open) {
  if (!modalRolePopover || !modalRoleButton) return;
  modalRolePopover.hidden = !open;
  modalRoleButton.setAttribute("aria-expanded", String(open));
}
if (modalRoleFloat && modalRoleButton && modalRolePopover) {
  modalRoleFloat.addEventListener("click", (event) => event.stopPropagation());
  modalRoleButton.addEventListener("click", () => setModalRolePopoverOpen(modalRolePopover.hidden));
  document.addEventListener("click", (event) => {
    if (!modalRoleFloat.contains(event.target)) setModalRolePopoverOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalRolePopover.hidden) {
      setModalRolePopoverOpen(false);
      modalRoleButton.focus();
    }
  });
}

function updateModalRoleMarkers() {
  const legend = document.getElementById("modalRoleLegend");
  if (!legend) return;
  const selectedScale = scaleSelector.value;
  const dictionary = modalRoleTranslations[currentLanguage] || modalRoleTranslations.en;
  if (modalRoleButton && modalRoleButtonLabel) {
    modalRoleButtonLabel.textContent = dictionary.trigger;
    modalRoleButton.setAttribute("aria-label", dictionary.triggerLabel);
  }
  const noteLabels = Array.from(outerScale.querySelectorAll(".dynamic-label"));
  noteLabels.forEach((label) => {
    label.classList.remove("modal-shahed", "modal-finalis", "modal-tonic");
    delete label.dataset.modalRoles;
    label.removeAttribute("title");
    if (label.getAttribute("role") === "img") label.removeAttribute("role");
    if (label.hasAttribute("aria-label")) label.removeAttribute("aria-label");
  });
  const roleContext = selectedScale === "Shur" && activeAvazRole
    ? "avaz." + activeAvazRole : selectedScale;
  const roles = modalRolesByScale[roleContext] || {};
  const base = roles;
  legend.replaceChildren();
  if (selectedScale === "Shur" && activeAvazRole) {
    const context = document.createElement("strong");
    context.className = "modal-role-context";
    context.textContent = translations[currentLanguage].avazhaItems[activeAvazRole] || activeAvazRole;
    legend.appendChild(context);
  }

  const markerDefinitions = selectedScale === "minor"
    ? [["tonic", "modal-tonic", "●"]]
    : [["shahed", "modal-shahed", "★"], ["finalis", "modal-finalis", "◆"]];
  let assignedCount = 0;

  if (modalRoleMarkersVisible) markerDefinitions.forEach(([role, className, symbol]) => {
    const degree = roles[role];
    if (!Number.isInteger(degree) || degree < 0 || degree >= noteLabels.length) return;
    const noteLabel = noteLabels[degree];
    noteLabel.classList.add(className);
    const existingRoles = noteLabel.dataset.modalRoles
      ? noteLabel.dataset.modalRoles.split(", ")
      : [];
    existingRoles.push(dictionary[role]);
    noteLabel.dataset.modalRoles = existingRoles.join(", ");
    const noteName = noteLabel.dataset.singleNote || noteLabel.textContent.trim();
    noteLabel.title = noteName + " — " + existingRoles.join(", ");
    noteLabel.setAttribute("role", "img");
    noteLabel.setAttribute("aria-label", noteLabel.title);

    const legendItem = document.createElement("span");
    legendItem.className = "modal-role-legend-item " + className;
    legendItem.textContent = symbol + " " + dictionary[role] + ": " + noteName;
    legend.appendChild(legendItem);
    assignedCount++;
  });

  if (!assignedCount && modalRoleMarkersVisible) {
    const pending = document.createElement("span");
    pending.className = "modal-role-pending";
    pending.textContent = dictionary.pending;
    legend.appendChild(pending);
  }

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "modal-role-visibility-button";
  toggleButton.setAttribute("aria-pressed", String(modalRoleMarkersVisible));
  toggleButton.textContent = modalRoleMarkersVisible ? dictionary.hide : dictionary.show;
  toggleButton.addEventListener("click", () => {
    modalRoleMarkersVisible = !modalRoleMarkersVisible;
    try { localStorage.setItem("persianMusicScales.showModalRoles.v1", String(modalRoleMarkersVisible)); } catch (err) {}
    updateModalRoleMarkers();
  });
  legend.appendChild(toggleButton);

  const detail = document.createElement("details");
  detail.className = "modal-role-details";
  const heading = document.createElement("summary");
  heading.textContent = dictionary.details;
  detail.appendChild(heading);
  // The model's musical explanations follow the selected UI language.
  const translatedProfile = base.localized?.[currentLanguage] || {};
  const localizedContext = translatedProfile.context || base.context || dictionary.pending;
  const localizedWarning = translatedProfile.warning ?? base.warning;
  const detailDirection = currentLanguage === "fa" ? "rtl" : "ltr";
  detail.setAttribute("dir", detailDirection);
  const status = document.createElement("p");
  const confidence = base.confidence || "partial";
  status.textContent = dictionary.status + ": " +
    (dictionary[confidence] || confidence) + " — " + localizedContext;
  detail.appendChild(status);
  if (localizedWarning) {
    const warning = document.createElement("p");
    warning.textContent = dictionary.warning + ": " + localizedWarning;
    detail.appendChild(warning);
  }
  if (Array.isArray(base.sources) && base.sources.length) {
    const sources = document.createElement("div");
    sources.className = "modal-role-sources";
    const label = document.createElement("strong");
    label.textContent = dictionary.sources + ": ";
    sources.appendChild(label);
    base.sources.forEach((item, index) => {
      if (!item || typeof item.url !== "string" || !/^https:\/\//.test(item.url)) return;
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = (currentLanguage === "fa" ? item.labelFa
        : currentLanguage === "fr" ? item.labelFr : item.label) || item.label || ("Source " + (index + 1));
      sources.appendChild(link);
    });
    detail.appendChild(sources);
  }
  legend.appendChild(detail);

}

/* ---------- Update Dynamic Labels for Chosen Scale ---------- */
function updateDynamicLabels() {
  const scaleName = scaleSelector.value;
  const { angles } = scaleData[scaleName];
  const { displayLabels, koron, sori } = translations[currentLanguage];

  outerScale.querySelectorAll(".dynamic-label").forEach((d) => d.remove());

  angles.forEach((angle) => {
    const { displayText, parseableText } = findClosestLabel(angle, displayLabels, koron, sori);

    const labelDiv = document.createElement("div");
    labelDiv.classList.add("dynamic-label");
    labelDiv.dataset.allNotes = parseableText;
    labelDiv.dataset.singleNote = parseableText.split("/")[0].trim();

    labelDiv.innerHTML = displayText;

    const radians = (angle - 90) * (Math.PI / 180);
    labelDiv.style.top = `${50 + 45 * Math.sin(radians)}%`;
    labelDiv.style.left = `${50 + 45 * Math.cos(radians)}%`;

    outerScale.appendChild(labelDiv);
  });

  // Update the 12 o'clock label
  const zeroResult = findClosestLabel(0, displayLabels, koron, sori);
  labelAtZeroAngle.innerHTML = zeroResult.displayText;
  labelAtZeroAngle.dataset.allNotes = zeroResult.parseableText;
  labelAtZeroAngle.dataset.singleNote = zeroResult.parseableText.split("/")[0].trim();
  updateModalRoleMarkers();
  // The notation engine is deliberately independent of the circle's
  // enharmonic text labels and uses the same seven scale angles.
  const notation = window.PERSIAN_KEY_SIGNATURE;
  if (notation) {
    notation.update({
      scaleId: scaleName,
      cents: angles.map(angle => Math.round(angle * 1200 / 360)),
      rotationCents: rotation * 1200 / 360,
      lang: currentLanguage
    });
  }
}

function updateScaleTextSummary() {
  const summary = document.getElementById("currentScaleSummaryText");
  if (!summary) return;

  const scaleName = scaleSelector.value;
  const scale = scaleData[scaleName];
  if (!scale) return;

  const displayName =
    translations[currentLanguage] &&
    translations[currentLanguage].scales &&
    translations[currentLanguage].scales[scaleName]
      ? translations[currentLanguage].scales[scaleName]
      : scaleName;

  const cents = scale.angles.map((angle) => Math.round((angle * 1200) / 360));
  const notes = Array.from(outerScale.querySelectorAll(".dynamic-label"))
    .map((label) => label.dataset.singleNote)
    .filter(Boolean);

  summary.textContent =
    `${displayName} — cumulative pitch positions: ${cents.join(", ")} cents from the diagram's 12-o'clock reference pitch.` +
    (notes.length ? ` Current displayed notes: ${notes.join(", ")}.` : "");
}

/* ---------- Rotate the Scale on Click ---------- */
function rotateScale(evt) {
  const rect = circleContainer.getBoundingClientRect();
  const clickX = evt.clientX - rect.left - rect.width / 2;
  rotation += clickX >= 0 ? 15 : -15;

  diatonicScale.style.transform = `rotate(${rotation}deg)`;
  updateDynamicLabels();
  updateScaleTextSummary();
  populateAvazhaDynamicColumn(); // Also update Avazha column

  if (navigator.vibrate) navigator.vibrate(50);
}
circleContainer.addEventListener("click", rotateScale);

/* ========== Avazha Functionality ========== */
const avazhaContainer = document.getElementById("avazhaContainer");
const avazhaButton = document.getElementById("avazhaButton");
const avazhaColumns = document.getElementById("avazhaColumns");
const avazhaDynamicColumn = document.getElementById("avazhaDynamicColumn");

function toggleAvazhaColumns() {
  avazhaColumns.classList.toggle("hidden");
  avazhaContainer.classList.toggle("menu-open", !avazhaColumns.classList.contains("hidden"));
}

/* Each avaz is its own modal context, not Shur with a changed caption. */
const avazItems = Array.from(avazhaColumns.querySelectorAll(".avazha-column:first-child .avazha-item[data-translate]"));
avazItems.forEach((item) => {
  const key = item.getAttribute("data-translate").split(".")[1];
  item.setAttribute("role", "button");
  item.setAttribute("tabindex", "0");
  item.setAttribute("aria-pressed", "false");
  const chooseAvaz = () => {
    activeAvazRole = activeAvazRole === key ? null : key;
    avazItems.forEach((other) => {
      const isSelected = activeAvazRole === other.getAttribute("data-translate").split(".")[1];
      other.classList.toggle("active-modal-avaz", isSelected);
      other.setAttribute("aria-pressed", String(isSelected));
    });
    // Selection is complete; collapse the menu so its list no longer
    // covers the circle's accessible modal-note help control on mobile.
    avazhaColumns.classList.add("hidden");
    avazhaContainer.classList.remove("menu-open");
    updateModalRoleMarkers();
  };
  item.addEventListener("click", chooseAvaz);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseAvaz();
    }
  });
});
avazhaButton.addEventListener("click", toggleAvazhaColumns);

function updateAvazhaVisibility() {
  const selectedScale = scaleSelector.value;
  if (selectedScale === "Shur") {
    avazhaContainer.style.display = "flex";
    populateAvazhaDynamicColumn();
  } else {
    activeAvazRole = null;
    avazItems.forEach((item) => {
      item.classList.remove("active-modal-avaz");
      item.setAttribute("aria-pressed", "false");
    });
    avazhaContainer.style.display = "none";
    avazhaColumns.classList.add("hidden");
    avazhaContainer.classList.remove("menu-open");
  }
}

function populateAvazhaDynamicColumn() {
  avazhaDynamicColumn.innerHTML = ""; // Clear existing content
  const dynamicLabels = outerScale.querySelectorAll(".dynamic-label");
  // Extract the second, third, fourth, and fifth labels
  const labelsArray = Array.from(dynamicLabels).slice(1, 5);

  labelsArray.forEach((label) => {
    const displayText = label.innerHTML;
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("avazha-item");
    itemDiv.innerHTML = displayText;
    avazhaDynamicColumn.appendChild(itemDiv);
  });
}

const referenceIntroductionTranslations = {
  en: {
    title: "Persian music theory reference and interactive tools",
    first: "Persian Music Scales is an educational web application for exploring pitch and interval relationships used in Persian classical music. It includes interactive models for Shur, Nava, Segah, Homayoun, Esfahan, Chahargah and Mahur / Rast Panjgah, together with transposition, scale playback, a chromatic tuner and browser-based melody analysis.",
    second: "The numerical scale models describe pitch collections used by this application. They are not complete definitions of a dastgah or gusheh: modal identity can also depend on melodic hierarchy, finalis, shahed, characteristic phrases, variable tones, modulation, context and performance practice.",
    links: ["Reference", "Methodology", "Audio analysis", "Glossary", "Dataset"]
  },
  fr: {
    title: "Références théoriques et outils interactifs de musique persane",
    first: "Persian Music Scales est une application pédagogique consacrée aux hauteurs et aux intervalles de la musique classique persane. Elle présente des modèles interactifs de Šur, Navā, Segāh, Homāyun, Esfahān, Čahārgāh et Māhur / Rāst-Panjgāh, ainsi que des outils de transposition, d’écoute des gammes, d’accordage chromatique et d’analyse mélodique dans le navigateur.",
    second: "Les modèles numériques décrivent les collections de hauteurs employées par l’application ; ils ne définissent pas à eux seuls un dastgāh ou un guše. L’identité modale dépend aussi de la hiérarchie mélodique, de la note finale (finalis), du šāhed, des phrases caractéristiques, des degrés mobiles, des modulations, du contexte et des pratiques d’interprétation.",
    links: ["Documentation", "Méthodologie", "Analyse audio", "Glossaire", "Données"]
  },
  fa: {
    title: "منابع نظری موسیقی دستگاهی ایران و ابزارهای تعاملی",
    first: "«گام‌های موسیقی ایرانی» برنامه‌ای آموزشی برای بررسی درجات صوتی و روابط فاصله‌ای در موسیقی دستگاهی ایران است. این برنامه مدل‌های تعاملیِ شور، نوا، سه‌گاه، همایون، اصفهان، چهارگاه و ماهور / راست‌پنجگاه را به همراه ابزارهای انتقال گام، پخش صوتی، تیونر کروماتیک و تحلیل ملودی در مرورگر ارائه می‌کند.",
    second: "مدل‌های عددیِ برنامه، مجموعهٔ درجات صوتی را توصیف می‌کنند، نه ساختار کامل یک دستگاه یا گوشه را. هویت مُدال همچنین به سلسله‌مراتب ملودیک، نت پایانی، شاهد، جمله‌های شاخص، درجات متغیر، مدگردی، بافت موسیقایی و شیوهٔ اجرا وابسته است.",
    links: ["منابع", "روش‌شناسی", "تحلیل صوت", "واژه‌نامه", "مجموعه‌داده"]
  }
};

function updateReferenceIntroduction() {
  const copy = referenceIntroductionTranslations[currentLanguage] || referenceIntroductionTranslations.en;
  const section = document.querySelector(".project-introduction");
  if (!section) return;
  section.lang = currentLanguage;
  section.dir = currentLanguage === "fa" ? "rtl" : "ltr";
  const title = document.getElementById("projectIntroductionTitle");
  const paragraphs = section.querySelectorAll(":scope > p");
  const anchors = section.querySelectorAll(".project-reference-links a");
  title.textContent = copy.title;
  if (paragraphs[0]) paragraphs[0].textContent = copy.first;
  if (paragraphs[1]) paragraphs[1].textContent = copy.second;
  anchors.forEach((anchor, index) => {
    anchor.textContent = copy.links[index];
    const url = new URL(anchor.getAttribute("href"), document.baseURI);
    url.searchParams.set("lang", currentLanguage);
    anchor.href = url.href;
  });
}

/* ========== Update UI Controls (Translation) ========== */
function updateUIControls() {
  const { scales, playButton, title, bottomNav, avazha, avazhaItems, installPopup, myAppLabel } =
    translations[currentLanguage];

  Array.from(scaleSelector.options).forEach((opt) => {
    opt.textContent = scales[opt.value];
  });
  playScaleBtn.textContent = playButton;

  // Update the page title
  document.title =
    currentLanguage === "fa"
      ? "گام‌های موسیقی ایرانی – دستگاه، ریزپرده و تحلیل تعاملی"
      : currentLanguage === "fr"
        ? "Échelles de musique persane – Dastgah, microtons et analyse interactive"
        : "Persian Music Scales – Dastgah, Microtones & Interactive Scale Analyzer";
  pageTitle.textContent = title;

  // Update bottom navigation labels
  bottomNavLabels.forEach((label) => {
    const keyPath = label.getAttribute("data-translate").split(".");
    let text = translations[currentLanguage];
    keyPath.forEach((key) => {
      text = text[key];
    });
    label.textContent = text;
  });

  updateReferenceIntroduction();

  // Update Avazha label
  updateAvazhaLabel();

  // Update Avazha fixed items translations
  const avazhaFixedItems = document.querySelectorAll(
    ".avazha-column:first-child .avazha-item[data-translate]"
  );
  avazhaFixedItems.forEach((item) => {
    const key = item.getAttribute("data-translate").split(".")[1]; // e.g. "abuAta"
    if (translations[currentLanguage].avazhaItems && translations[currentLanguage].avazhaItems[key]) {
      item.textContent = translations[currentLanguage].avazhaItems[key];
    }
  });

  // Update Pop-up Content
  updatePopupContent();

  // Update My App Label
  const myAppLabelElement = document.querySelector(".my-app-label");
  if (myAppLabelElement) {
    myAppLabelElement.textContent = myAppLabel;
  }
}

function updateAvazhaLabel() {
  const avazhaLabel = document.getElementById("avazhaLabel");
  avazhaLabel.textContent = translations[currentLanguage].avazha;
}

function updatePopupContent() {
  const { installPopup } = translations[currentLanguage];
  document.getElementById("popupTitle").textContent = installPopup.title;
  document.getElementById("instructionShare").textContent = installPopup.share;
  document.getElementById("instructionAdd").textContent = installPopup.addHome;
  dismissPopupBtn.textContent = installPopup.dismiss;
}

/* ---------- Language Selector Change ---------- */
languageSelector.addEventListener("change", () => {
  currentLanguage = languageSelector.value;
  document.documentElement.lang = currentLanguage;
  try { localStorage.setItem("persianMusicScalesLanguage", currentLanguage); } catch (_) {}
  updateStaticLabels();
  updateDynamicLabels();
  updateScaleTextSummary();
  updateUIControls();
  populateAvazhaDynamicColumn();

  // Adjust RTL for Farsi
  if (currentLanguage === "fa") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
});

/* ---------- Scale Selector Change ---------- */
scaleSelector.addEventListener("change", () => {
  updateOuterScale(scaleSelector.value);
  updateDynamicLabels();
  updateScaleTextSummary();
  updateUIControls();
  updateAvazhaVisibility();
  if (navigator.vibrate) navigator.vibrate(100);
});

/* ========== My App Functionality ========== */
function isPWAInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function toggleMyAppButton() {
  if (!isPWAInstalled()) {
    myAppContainer.style.display = "flex";
  } else {
    myAppContainer.style.display = "none";
  }
}
myAppButton.addEventListener("click", () => {
  installPopup.style.display = "flex";
});
closePopupBtn.addEventListener("click", () => {
  installPopup.style.display = "none";
});
dismissPopupBtn.addEventListener("click", () => {
  installPopup.style.display = "none";
});

window.addEventListener("appinstalled", () => {
  myAppContainer.style.display = "none";
  console.log("PWA was installed");
});

/* ========== Initial Setup Calls ========== */
updateOuterScale("Shur");
updateStaticLabels();
updateDynamicLabels();
updateScaleTextSummary();
updateUIControls();
updateAvazhaVisibility();
toggleMyAppButton();

/* ========== Audio & Teeter Code (Play Scale) ========== */
const baseFrequencies = {
  Do: 261.63,
  Re: 293.66,
  Mi: 329.63,
  Fa: 349.23,
  Sol: 392.0,
  La: 440.0,
  Si: 493.88,
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

function adjustFrequencyByCents(freq, cents) {
  return freq * Math.pow(2, cents / 1200);
}

function parseNote(note) {
  const match = note.match(/^([A-G]|Do|Re|Mi|Fa|Sol|La|Si)([#b]?)(?:\s+(koron|sori))?$/i);
  if (!match) return null;

  const base = match[1];
  let frequency = baseFrequencies[base];
  if (!frequency) return null;

  if (match[2] === "#") {
    frequency = adjustFrequencyByCents(frequency, 100);
  } else if (match[2] === "b") {
    frequency = adjustFrequencyByCents(frequency, -100);
  }

  if (match[3] && match[3].toLowerCase() === "koron") {
    frequency = adjustFrequencyByCents(frequency, -50);
  } else if (match[3] && match[3].toLowerCase() === "sori") {
    frequency = adjustFrequencyByCents(frequency, 50);
  }

  return frequency;
}

function playNote(audioCtx, frequency, duration, startTime) {
  if (!frequency) return;

  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, startTime);

  // Attack
  gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
  // Sustain
  gainNode.gain.setValueAtTime(0.8, startTime + duration - 0.1);
  // Release
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.frequency.value = frequency;

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function animateLabelDuringNote(singleNote, audioCtx, startTime, duration) {
  const now = audioCtx.currentTime;
  const startDelayMs = Math.max(0, (startTime - now) * 1000);
  const endDelayMs = startDelayMs + duration * 1000;

  setTimeout(() => {
    const labels = outerScale.querySelectorAll(".dynamic-label");
    labels.forEach((label) => {
      if (label.dataset.singleNote === singleNote) {
        label.classList.add("teeter-animate");
      }
    });
  }, startDelayMs);

  setTimeout(() => {
    const labels = outerScale.querySelectorAll(".dynamic-label");
    labels.forEach((label) => {
      if (label.dataset.singleNote === singleNote) {
        label.classList.remove("teeter-animate");
      }
    });
  }, endDelayMs);
}

function playOuterScale() {
  const scaleName = scaleSelector.value;
  const { angles } = scaleData[scaleName];
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let currentTime = audioCtx.currentTime;

  const noteDuration = 1.0;
  let lastFreq = 0;
  let firstNoteFrequency = null; // Store the first note's frequency
  let firstNoteName = null;

  for (let i = 0; i < 7; i++) {
    const angle = angles[i % angles.length];
    const { parseableText } = findClosestLabel(
      angle,
      translations[currentLanguage].displayLabels,
      translations[currentLanguage].koron,
      translations[currentLanguage].sori
    );
    const singleNote = parseableText.split("/")[0].trim();
    let freq = parseNote(singleNote);

    if (freq) {
      if (i === 0) {
        firstNoteFrequency = freq;
        firstNoteName = singleNote;
      }
      // Ensure ascending
      while (freq <= lastFreq) {
        freq *= 2;
      }
      playNote(audioCtx, freq, noteDuration, currentTime);
      animateLabelDuringNote(singleNote, audioCtx, currentTime, 1.0);

      lastFreq = freq;
      currentTime += 1.0;
    }
  }

  // Play the first note again in the next octave
  if (firstNoteFrequency) {
    const freqNextOctave = firstNoteFrequency * 2;
    playNote(audioCtx, freqNextOctave, noteDuration, currentTime);
    animateLabelDuringNote(firstNoteName, audioCtx, currentTime, 1.0);
  }
}

playScaleBtn.addEventListener("click", playOuterScale);

/* ========== 4) Language Detection Script ========== */
const userLang = (navigator.language || "en").toLowerCase();
const langSelector = document.getElementById("languageSelector");
const requestedLang = new URLSearchParams(window.location.search).get("lang");
let storedLang = "";
try { storedLang = localStorage.getItem("persianMusicScalesLanguage") || ""; } catch (_) {}
const browserLang = userLang.startsWith("fa") ? "fa" : userLang.startsWith("fr") ? "fr" : "en";
langSelector.value = ["en", "fr", "fa"].includes(requestedLang) ? requestedLang :
  ["en", "fr", "fa"].includes(storedLang) ? storedLang : browserLang;
// Trigger language switch based on selection
langSelector.dispatchEvent(new Event("change"));

/* ========== 5) Add to Home Screen and My App Modal Scripts ========== */
window.addEventListener("load", () => {
  toggleMyAppButton();
});

function showInstallPopup() {
  if (!isPWAInstalled()) {
    installPopup.style.display = "flex";
  }
}
