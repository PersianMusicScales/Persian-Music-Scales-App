/* main.js - Persian Music Scales PWA */

/* ================================
   Global Variables and Constants
   ================================ */

// DOM Elements
const scaleSelector = document.getElementById("scaleSelector");
const languageSelector = document.getElementById("languageSelector");
const circleContainer = document.getElementById("circleContainer");
const outerScale = document.getElementById("outerScale");
const diatonicScale = document.getElementById("diatonicScale");
const labelAtZeroAngle = document.getElementById("labelAtZeroAngle");
const playScaleBtn = document.getElementById("playScale");



// Initialization Calls
window.addEventListener("load", () => {
  initializeApp(); // Assuming this initializes the app
});

// State Variables
let currentLanguage = "en"; // Default language
let currentScale = "Shur";   // Default scale
let rotation = 0;            // Rotation angle in degrees


// Translation Data
const translations = {
  en: {
    displayLabels: ["C", "D", "E", "F", "G", "A", "B"],
    koron: "Koron",
    sori: "Sori",
    scales: {
      Shur: "Shur",
      Nava: "Nava",
      Segah: "Segah",
      Homayoun: "Homayoun",
      Esfahan: "Esfahan",
      Chahargah: "Chahargah",
      Mahur: "Mahur / Rast Panjgah",
    },
    playButton: "\u25BA Play Scale"
  },
  fr: {
    displayLabels: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
    koron: "Koron",
    sori: "Sori",
    scales: {
      Shur: "Shur",
      Nava: "Nava",
      Segah: "Segah",
      Homayoun: "Homayoun",
      Esfahan: "Esfahan",
      Chahargah: "Chahargah",
      Mahur: "Mahur / Rast Panjgah",
    },
    playButton: "\u25BA Jouer la Gamme"
  },
 fa: {
    displayLabels: ["دو", "رِ", "می", "فا", "سُل", "لا", "سی"],
    koron: "کُرُن",
    sori: "سُری",
    scales: {
      Shur: "شور",
      Nava: "نوا",
      Segah: "سه گاه",
      Homayoun: "همایون",
      Esfahan: "اصفهان",
      Chahargah: "چهارگاه",
      Mahur: "ماهور / راست پنجگاه",
    },
    playButton: "► پخش گام"
  }
};

// Scale Data: Define angles and colors for each scale
const scaleData = {
  Shur: {
    angles: [0, 45, 90, 150, 210, 240, 300],
    colors: "conic-gradient(pink 0deg 45deg, pink 45deg 90deg, gray 90deg 150deg, gray 150deg 210deg, black 210deg 240deg, gray 240deg 300deg, gray 300deg 360deg)"
  },
  Nava: {
    angles: [0, 60, 90, 150, 210, 255, 300],
    colors: "conic-gradient(gray 0deg 60deg, black 60deg 90deg, gray 90deg 150deg, gray 150deg 210deg, pink 210deg 255deg, pink 255deg 300deg, gray 300deg 360deg)"
  },
  Segah: {
    angles: [0, 60, 105, 150, 210, 255, 300],
    colors: "conic-gradient(gray 0deg 60deg, pink 60deg 105deg, pink 105deg 150deg, gray 150deg 210deg, pink 210deg 255deg, pink 255deg 300deg, gray 300deg 360deg)"
  },
  Homayoun: {
    angles: [0, 45, 120, 150, 210, 240, 300],
    colors: "conic-gradient(pink 0deg 45deg, green 45deg 120deg, black 120deg 150deg, gray 150deg 210deg, black 210deg 240deg, gray 240deg 300deg, gray 300deg 360deg)"
  },
  Esfahan: {
    angles: [0, 60, 90, 150, 210, 255, 330],
    colors: "conic-gradient(gray 0deg 60deg, black 60deg 90deg, gray 90deg 150deg, gray 150deg 210deg, pink 210deg 255deg, green 255deg 330deg, black 330deg 360deg)"
  },
  Chahargah: {
    angles: [0, 45, 120, 150, 210, 255, 330],
    colors: "conic-gradient(pink 0deg 45deg, green 45deg 120deg, black 120deg 150deg, gray 150deg 210deg, pink 210deg 255deg, green 255deg 330deg, black 330deg 360deg)"
  },
  Mahur: {
    angles: [0, 60, 120, 150, 210, 270, 330],
    colors: "conic-gradient(gray 0deg 60deg, gray 60deg 120deg, black 120deg 150deg, gray 150deg 210deg, gray 210deg 270deg, gray 270deg 330deg, black 330deg 360deg)"
  }
};

// Parseable Notes for Audio Playback
const parseableNotes = ["C", "D", "E", "F", "G", "A", "B"];



/**
 * Initializes the diatonic (inner) scale with labels.
 */
function initializeDiatonicScale() {
  diatonicScale.innerHTML = ""; // Clear existing labels
  const { displayLabels } = translations[currentLanguage];

  // Define angles for diatonic labels
  const diatonicAngles = [0, 60, 120, 150, 210, 270, 330];

  diatonicAngles.forEach((angle, index) => {
    // Create rotation lines
    const line = document.createElement("div");
    line.classList.add("line-diatonic");
    line.style.transform = `rotate(${angle}deg)`;
    diatonicScale.appendChild(line);

    // Create labels
    const label = document.createElement("div");
    label.classList.add("label");
    label.textContent = displayLabels[index];

    // Position labels based on angle
    const radians = (angle - 90) * (Math.PI / 180); // Adjust for 12 o'clock
    label.style.top = `${50 + 40 * Math.sin(radians)}%`;
    label.style.left = `${50 + 40 * Math.cos(radians)}%`;

    diatonicScale.appendChild(label);
  });
}


/**
 * Updates dynamic labels on the outer scale based on the selected scale.
 */
function updateDynamicLabels() {
  const { angles } = scaleData[currentScale];
  const { displayLabels, koron, sori } = translations[currentLanguage];

  outerScale.querySelectorAll(".dynamic-label").forEach(label => label.remove());

  angles.forEach(angle => {
    const label = document.createElement("div");
    label.classList.add("dynamic-label");

    // Determine the closest diatonic note
    const closestNote = findClosestNote(angle);

    label.innerHTML = closestNote.displayText;
    label.dataset.allNotes = closestNote.parseableText;
    label.dataset.singleNote = closestNote.parseableText.split("/")[0].trim();

    // Position labels based on angle
    const radians = (angle - 90) * (Math.PI / 180); // Adjust for 12 o'clock
    label.style.top = `${50 + 45 * Math.sin(radians)}%`;
    label.style.left = `${50 + 45 * Math.cos(radians)}%`;

    outerScale.appendChild(label);
  });

  // Update the label at zero angle
  const zeroLabel = findClosestNote(0);
  labelAtZeroAngle.innerHTML = zeroLabel.displayText;
  labelAtZeroAngle.dataset.allNotes = zeroLabel.parseableText;
  labelAtZeroAngle.dataset.singleNote = zeroLabel.parseableText.split("/")[0].trim();
}


/**
 * Finds the closest diatonic note to a given angle.
 * @param {number} angle - The angle in degrees.
 * @returns {Object} - An object containing displayText and parseableText.
 */
function findClosestNote(angle) {
  const diatonicAngles = [0, 60, 120, 150, 210, 270, 330];
  const { displayLabels, koron, sori } = translations[currentLanguage];

  let bestDiff = 360;
  let bestIndices = [];

  diatonicAngles.forEach((diaAngle, index) => {
    let diff = normalizeAngle(angle - diaAngle);
    if (diff > 180) diff -= 360; // Shortest path

    const absDiff = Math.abs(diff);

    if (absDiff < bestDiff) {
      bestDiff = absDiff;
      bestIndices = [{ index, diff }];
    } else if (absDiff === bestDiff) {
      bestIndices.push({ index, diff });
    }
  });

  const displayArr = [];
  const parseArr = [];

  bestIndices.forEach(({ index, diff }) => {
    let display = displayLabels[index];
    let parse = parseableNotes[index];

    if (diff === 30) {
      // Sharp
      display += currentLanguage === "fa" ? " دیز" : "♯";
      parse += "#";
    } else if (diff === -30) {
      // Flat
      display += currentLanguage === "fa" ? " بمل" : "♭";
      parse += "b";
    } else if (diff === 15) {
      // Sori
      display += `<sup>${sori}</sup>`;
      parse += " sori";
    } else if (diff === -15) {
      // Koron
      display += `<sup>${koron}</sup>`;
      parse += " koron";
    }

    displayArr.push(display);
    parseArr.push(parse);
  });

  return {
    displayText: displayArr.join("/"),
    parseableText: parseArr.join("/")
  };
}

/**
 * Normalizes an angle to be within [0, 360) degrees.
 * @param {number} angle - The angle in degrees.
 * @returns {number} - The normalized angle.
 */
function normalizeAngle(angle) {
  return (angle % 360 + 360) % 360;
}

/* ===========================
   Event Listeners and Handlers
   =========================== */

/**
 * Handles changes in the language selector.
 */
languageSelector.addEventListener("change", () => {
  currentLanguage = languageSelector.value;
  updateScaleLabels();
});

/**
 * Handles changes in the scale selector.
 */
scaleSelector.addEventListener("change", () => {
  currentScale = scaleSelector.value;
  initializeOuterScale(currentScale);
  updateDynamicLabels();
  if (navigator.vibrate) navigator.vibrate(100); // Vibration feedback
});

/**
 * Handles click events on the circle container to rotate the scale.
 */
circleContainer.addEventListener("click", rotateScale);

/**
 * Handles click events on the Play Scale button to play the selected scale.
 */
playScaleBtn.addEventListener("click", playScale);

/* ===========================
   Core Functionality
   =========================== */

/**
 * Rotates the diatonic scale based on click position.
 * @param {MouseEvent} event - The click event.
 */
function rotateScale(event) {
  const rect = circleContainer.getBoundingClientRect();
  const clickX = event.clientX - rect.left - rect.width / 2;

  rotation += clickX >= 0 ? 15 : -15; // Rotate clockwise or counter-clockwise

  diatonicScale.style.transform = `rotate(${rotation}deg)`;
  updateDynamicLabels();

  if (navigator.vibrate) navigator.vibrate(50); // Vibration feedback
}

/**
 * Updates all scale labels based on the current language and scale.
 */
function updateScaleLabels() {
  initializeDiatonicScale();
  updateDynamicLabels();
  updateUIControls();
}

/**
 * Updates UI controls such as scale names and play button text based on the current language.
 */
function updateUIControls() {
  const { scales, playButton } = translations[currentLanguage];
  
  // Update scale selector options
  Array.from(scaleSelector.options).forEach(option => {
    option.textContent = scales[option.value];
  });

  // Update play button text
  playScaleBtn.textContent = playButton;
}

/**
 * Initializes the UI with default settings.
 */
function initializeUI() {
  initializeOuterScale(currentScale);
  initializeDiatonicScale();
  updateDynamicLabels();
  updateUIControls();
}

/* ==================================
   Audio Playback Functionality
   ================================== */

/**
 * Base frequencies for diatonic notes.
 * Adjusted for different languages if necessary.
 */
const baseFrequencies = {
  "C": 261.63, // Do
  "D": 293.66, // Re
  "E": 329.63, // Mi
  "F": 349.23, // Fa
  "G": 392.00, // Sol
  "A": 440.00, // La
  "B": 493.88  // Si
};

/**
 * Adjusts a frequency by a certain number of cents.
 * @param {number} freq - The base frequency in Hz.
 * @param {number} cents - The number of cents to adjust.
 * @returns {number} - The adjusted frequency.
 */
function adjustFrequencyByCents(freq, cents) {
  return freq * Math.pow(2, cents / 1200);
}

/**
 * Parses a note string and returns its frequency.
 * Supports sharps (#), flats (b), koron, and sori adjustments.
 * @param {string} note - The note string (e.g., "C", "D#", "F b", "G koron").
 * @returns {number|null} - The frequency in Hz or null if invalid.
 */
function parseNote(note) {
  const match = note.match(/^([A-G]|Do|Re|Mi|Fa|Sol|La|Si)([#b]?)(?:\s+(koron|sori))?$/i);
  if (!match) return null;

  const base = match[1];
  let frequency = baseFrequencies[base.toUpperCase()];
  if (!frequency) return null;

  // Handle sharps and flats
  if (match[2] === "#") {
    frequency = adjustFrequencyByCents(frequency, 100); // Sharp: +100 cents
  } else if (match[2] === "b") {
    frequency = adjustFrequencyByCents(frequency, -100); // Flat: -100 cents
  }

  // Handle koron and sori
  if (match[3]) {
    const modifier = match[3].toLowerCase();
    if (modifier === "koron") {
      frequency = adjustFrequencyByCents(frequency, -50); // Koron: -50 cents
    } else if (modifier === "sori") {
      frequency = adjustFrequencyByCents(frequency, 50); // Sori: +50 cents
    }
  }

  return frequency;
}

/**
 * Plays a single note using the Web Audio API.
 * @param {AudioContext} audioCtx - The AudioContext instance.
 * @param {number} frequency - The frequency of the note in Hz.
 * @param {number} duration - Duration of the note in seconds.
 * @param {number} startTime - When to start the note.
 */
function playNote(audioCtx, frequency, duration, startTime) {
  if (!frequency) return;

  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.02); // Attack
  gainNode.gain.setValueAtTime(0.8, startTime + duration - 0.1); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Release

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/**
 * Animates the label corresponding to the currently playing note.
 * @param {string} singleNote - The single note being played.
 * @param {AudioContext} audioCtx - The AudioContext instance.
 * @param {number} startTime - When the note starts.
 * @param {number} duration - Duration of the note in seconds.
 */
function animateLabelDuringNote(singleNote, audioCtx, startTime, duration) {
  const now = audioCtx.currentTime;
  const startDelayMs = Math.max(0, (startTime - now) * 1000);
  const endDelayMs = startDelayMs + duration * 1000;

  setTimeout(() => {
    const labels = outerScale.querySelectorAll(".dynamic-label");
    labels.forEach(label => {
      if (label.dataset.singleNote === singleNote) {
        label.classList.add("teeter-animate");
      }
    });
  }, startDelayMs);

  setTimeout(() => {
    const labels = outerScale.querySelectorAll(".dynamic-label");
    labels.forEach(label => {
      if (label.dataset.singleNote === singleNote) {
        label.classList.remove("teeter-animate");
      }
    });
  }, endDelayMs);
}

/**
 * Plays the selected scale by playing each note sequentially.
 */
function playScale() {
  const { angles } = scaleData[currentScale];
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let currentTime = audioCtx.currentTime;

  const noteDuration = 1.0; // Duration of each note in seconds
  let lastFrequency = 0;

  angles.forEach((angle) => {
    const { parseableText } = findClosestNote(angle);
    const singleNote = parseableText.split("/")[0].trim();
    let frequency = parseNote(singleNote);

    if (frequency) {
      // Ensure ascending frequencies
      while (frequency <= lastFrequency) {
        frequency *= 2;
      }

      playNote(audioCtx, frequency, noteDuration, currentTime);
      animateLabelDuringNote(singleNote, audioCtx, currentTime, noteDuration);

      lastFrequency = frequency;
      currentTime += noteDuration;
    }
  });
}
