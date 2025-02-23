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
      mahur: "Mahur / Rast Panjgah",
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
      mahur: "Mahur / Rast Panjgah",
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
      mahur: "ماهور / راست پنجگاه",
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
      "conic-gradient(#F7E7C6 0deg 45deg, #F7E7C6 45deg 90deg, gray 90deg 150deg, gray 150deg 210deg, black 210deg 240deg, gray 240deg 300deg, gray 300deg 360deg)",
  },
  nava: {
    angles: [0, 60, 90, 150, 210, 255, 300],
    colors:
      "conic-gradient(gray 0deg 60deg, black 60deg 90deg, gray 90deg 150deg, gray 150deg 210deg, #F7E7C6 210deg 255deg, #F7E7C6 255deg 300deg, gray 300deg 360deg)",
  },
  segah: {
    angles: [0, 60, 105, 150, 210, 255, 300],
    colors:
      "conic-gradient(gray 0deg 60deg, #F7E7C6 60deg 105deg, #F7E7C6 105deg 150deg, gray 150deg 210deg, #F7E7C6 210deg 255deg, #F7E7C6 255deg 300deg, gray 300deg 360deg)",
  },
  homayoun: {
    angles: [0, 45, 120, 150, 210, 240, 300],
    colors:
      "conic-gradient(#F7E7C6 0deg 45deg, #1A3B66 45deg 120deg, black 120deg 150deg, gray 150deg 210deg, black 210deg 240deg, gray 240deg 300deg, gray 300deg 360deg)",
  },
  esfahan: {
    angles: [0, 60, 90, 150, 210, 255, 330],
    colors:
      "conic-gradient(gray 0deg 60deg, black 60deg 90deg, gray 90deg 150deg, gray 150deg 210deg, #F7E7C6 210deg 255deg, #1A3B66 255deg 330deg, black 330deg 360deg)",
  },
  chahargah: {
    angles: [0, 45, 120, 150, 210, 255, 330],
    colors:
      "conic-gradient(#F7E7C6 0deg 45deg, #1A3B66 45deg 120deg, black 120deg 150deg, gray 150deg 210deg, #F7E7C6 210deg 255deg, #1A3B66 255deg 330deg, black 330deg 360deg)",
  },
  mahur: {
    angles: [0, 60, 120, 150, 210, 270, 330],
    colors:
      "conic-gradient(gray 0deg 60deg, gray 60deg 120deg, black 120deg 150deg, gray 150deg 210deg, gray 210deg 270deg, gray 270deg 330deg, black 330deg 360deg)",
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
}

/* ---------- Rotate the Scale on Click ---------- */
function rotateScale(evt) {
  const rect = circleContainer.getBoundingClientRect();
  const clickX = evt.clientX - rect.left - rect.width / 2;
  rotation += clickX >= 0 ? 15 : -15;

  diatonicScale.style.transform = `rotate(${rotation}deg)`;
  updateDynamicLabels();
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
}
avazhaButton.addEventListener("click", toggleAvazhaColumns);

function updateAvazhaVisibility() {
  const selectedScale = scaleSelector.value;
  if (selectedScale === "Shur") {
    avazhaContainer.style.display = "flex";
    populateAvazhaDynamicColumn();
  } else {
    avazhaContainer.style.display = "none";
    avazhaColumns.classList.add("hidden");
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

/* ========== Update UI Controls (Translation) ========== */
function updateUIControls() {
  const { scales, playButton, title, bottomNav, avazha, avazhaItems, installPopup, myAppLabel } =
    translations[currentLanguage];

  Array.from(scaleSelector.options).forEach((opt) => {
    opt.textContent = scales[opt.value];
  });
  playScaleBtn.textContent = playButton;

  // Update the page title
  document.title = title;
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
  updateStaticLabels();
  updateDynamicLabels();
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
    animateLabelDuringNote(parseableNotes[0], audioCtx, currentTime, 1.0);
  }
}

playScaleBtn.addEventListener("click", playOuterScale);

/* ========== 4) Language Detection Script ========== */
const userLang = navigator.language || navigator.languages[0];
const langSelector = document.getElementById("languageSelector");

if (userLang.includes("fa")) {
  langSelector.value = "fa"; // Set to Persian
} else if (userLang.includes("fr")) {
  langSelector.value = "fr"; // Set to French
} else {
  langSelector.value = "en"; // Default to English
}
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
