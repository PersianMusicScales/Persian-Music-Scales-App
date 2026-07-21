/* =========================================================
   Persian Music Scales — Audio Analyzer UI + integration
   Requires the existing src/index.js to be loaded first.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const I18N = {
    en: {
      launch: "🎧 Analyze Track",
      title: "Track Scale Analyzer",
      subtitle: "Detect the strongest scale match and follow the melody on the circle.",
      uploadTitle: "1. Load a recording",
      local: "Local processing",
      choose: "Choose or drop an audio file",
      formats: "MP3, WAV, M4A, OGG and browser-supported audio",
      settingsTitle: "2. Analysis settings",
      mode: "Recording type",
      melody: "Solo / melody-dominant",
      balanced: "Balanced recording",
      mix: "Dense ensemble / full mix",
      minPitch: "Lowest pitch (Hz)",
      maxPitch: "Highest pitch (Hz)",
      help: "Solo and melody-dominant recordings produce the most reliable note sequence. The full-mix mode gives more weight to the spectral pitch profile.",
      analyze: "Analyze Track",
      play: "▶ Play",
      pause: "❚❚ Pause",
      stop: "■ Stop",
      ready: "Load a track to begin.",
      decoding: "Decoding audio…",
      readyFile: "Ready to analyze.",
      analyzing: "Analyzing pitches and scale candidates…",
      complete: "Analysis complete.",
      error: "Analysis could not be completed.",
      timelineTitle: "3. Track and detected-note timeline",
      timelineHint: "Seek anywhere",
      resultTitle: "4. Best scale match",
      resultEmpty: "The strongest scale candidates will appear here after analysis.",
      tonic: "tonic",
      alternatives: "Other candidates",
      currentTitle: "Live playback",
      currentNote: "Note",
      frequency: "Frequency",
      deviation: "Tuning",
      noNote: "—",
      disclaimer: "This is a best-match educational analysis, not a definitive dastgah or gusheh classification. Intonation, variable tones, melodic function and modulation can require expert interpretation.",
      fileTooLong: "Only the first 20 minutes will be analyzed and animated.",
      noVoiced: "No stable melodic pitches were found. Try the full-mix mode or a clearer melody-dominant recording.",
      unsupported: "This browser could not decode the selected audio file.",
      badge: "Detected",
      centsHigh: "{n} cents high",
      centsLow: "{n} cents low",
      centered: "centered",
      events: "{n} note events",
      confidence: "match",
      pitchEnergy: "{n}% pitch energy on scale notes",
    },
    fr: {
      launch: "🎧 Analyser un morceau",
      title: "Analyseur de gamme",
      subtitle: "Détecte la meilleure correspondance et suit la mélodie sur le cercle.",
      uploadTitle: "1. Charger un enregistrement",
      local: "Traitement local",
      choose: "Choisir ou déposer un fichier audio",
      formats: "MP3, WAV, M4A, OGG et formats pris en charge",
      settingsTitle: "2. Paramètres d’analyse",
      mode: "Type d’enregistrement",
      melody: "Solo / mélodie dominante",
      balanced: "Enregistrement équilibré",
      mix: "Ensemble dense / mix complet",
      minPitch: "Fréquence minimale (Hz)",
      maxPitch: "Fréquence maximale (Hz)",
      help: "Les enregistrements solos donnent la séquence de notes la plus fiable. Le mode mix complet accorde davantage de poids au profil spectral.",
      analyze: "Analyser",
      play: "▶ Lecture",
      pause: "❚❚ Pause",
      stop: "■ Arrêt",
      ready: "Chargez un morceau pour commencer.",
      decoding: "Décodage audio…",
      readyFile: "Prêt pour l’analyse.",
      analyzing: "Analyse des hauteurs et des gammes…",
      complete: "Analyse terminée.",
      error: "L’analyse n’a pas pu être terminée.",
      timelineTitle: "3. Piste et chronologie des notes",
      timelineHint: "Navigation libre",
      resultTitle: "4. Meilleure correspondance",
      resultEmpty: "Les meilleures gammes apparaîtront ici après l’analyse.",
      tonic: "tonique",
      alternatives: "Autres possibilités",
      currentTitle: "Lecture en direct",
      currentNote: "Note",
      frequency: "Fréquence",
      deviation: "Accord",
      noNote: "—",
      disclaimer: "Il s’agit d’une analyse pédagogique de correspondance, et non d’une classification définitive du dastgah ou du gusheh.",
      fileTooLong: "Seules les 20 premières minutes seront analysées et animées.",
      noVoiced: "Aucune hauteur mélodique stable n’a été trouvée. Essayez le mode mix complet ou un enregistrement plus clair.",
      unsupported: "Ce navigateur n’a pas pu décoder le fichier audio.",
      badge: "Détecté",
      centsHigh: "{n} cents au-dessus",
      centsLow: "{n} cents au-dessous",
      centered: "centré",
      events: "{n} événements",
      confidence: "correspondance",
      pitchEnergy: "{n} % de l’énergie sur les notes de la gamme",
    },
    fa: {
      launch: "🎧 تحلیل قطعه",
      title: "تحلیل‌گر گام قطعه",
      subtitle: "بهترین گام را پیدا می‌کند و حرکت ملودی را روی دایره نشان می‌دهد.",
      uploadTitle: "۱. بارگذاری فایل صوتی",
      local: "پردازش محلی",
      choose: "فایل صوتی را انتخاب یا اینجا رها کنید",
      formats: "MP3، WAV، M4A، OGG و فرمت‌های قابل پخش مرورگر",
      settingsTitle: "۲. تنظیمات تحلیل",
      mode: "نوع ضبط",
      melody: "تک‌نوازی / ملودی غالب",
      balanced: "ضبط متعادل",
      mix: "گروه‌نوازی متراکم / میکس کامل",
      minPitch: "کمترین فرکانس (Hz)",
      maxPitch: "بیشترین فرکانس (Hz)",
      help: "برای استخراج دقیق‌تر توالی نت‌ها، تک‌نوازی یا قطعه‌ای با ملودی غالب مناسب‌تر است. در حالت میکس کامل، وزن بیشتری به نمایهٔ طیفی داده می‌شود.",
      analyze: "تحلیل قطعه",
      play: "▶ پخش",
      pause: "❚❚ مکث",
      stop: "■ توقف",
      ready: "برای شروع یک قطعه بارگذاری کنید.",
      decoding: "در حال خواندن فایل صوتی…",
      readyFile: "آمادهٔ تحلیل است.",
      analyzing: "در حال تحلیل نت‌ها و گام‌های محتمل…",
      complete: "تحلیل کامل شد.",
      error: "تحلیل کامل نشد.",
      timelineTitle: "۳. خط زمانی قطعه و نت‌های تشخیص‌داده‌شده",
      timelineHint: "امکان جابه‌جایی",
      resultTitle: "۴. بهترین تطبیق گام",
      resultEmpty: "پس از تحلیل، بهترین گزینه‌های گام در اینجا نمایش داده می‌شوند.",
      tonic: "نت پایه",
      alternatives: "گزینه‌های دیگر",
      currentTitle: "پخش زنده",
      currentNote: "نت",
      frequency: "فرکانس",
      deviation: "کوک",
      noNote: "—",
      disclaimer: "این نتیجه یک تطبیق آموزشی است و تشخیص قطعی دستگاه یا گوشه نیست. کوک اجرایی، نت‌های متغیر، نقش ملودیک و مدگردی ممکن است به تفسیر تخصصی نیاز داشته باشند.",
      fileTooLong: "فقط ۲۰ دقیقهٔ نخست تحلیل و متحرک‌سازی می‌شود.",
      noVoiced: "نت ملودیک پایداری پیدا نشد. حالت میکس کامل یا یک ضبط واضح‌تر را امتحان کنید.",
      unsupported: "مرورگر نتوانست فایل صوتی انتخاب‌شده را بخواند.",
      badge: "تشخیص",
      centsHigh: "{n} سنت بالاتر",
      centsLow: "{n} سنت پایین‌تر",
      centered: "هم‌مرکز",
      events: "{n} رویداد نت",
      confidence: "تطبیق",
      pitchEnergy: "{n}٪ انرژی روی نت‌های گام",
    },
  };

  const state = {
    file: null,
    objectUrl: null,
    audioBuffer: null,
    worker: null,
    analysis: null,
    candidates: [],
    activeEventIndex: -1,
    animationFrame: 0,
    waveformBase: null,
    timelineBase: null,
    labelBindings: [],
    lastHighlightedLabel: null,
    currentLanguage: "en",
    analysisLimitSeconds: 20 * 60,
  };

  const elements = {
    launch: $("#openAudioAnalyzer"),
    drawer: $("#audioAnalyzerDrawer"),
    backdrop: $("#audioAnalyzerBackdrop"),
    close: $("#closeAudioAnalyzer"),
    fileInput: $("#trackFileInput"),
    dropZone: $("#audioDropZone"),
    trackSummary: $("#trackSummary"),
    trackName: $("#trackName"),
    trackMeta: $("#trackMeta"),
    mode: $("#analysisMode"),
    minFrequency: $("#analysisMinFrequency"),
    maxFrequency: $("#analysisMaxFrequency"),
    analyze: $("#analyzeTrackButton"),
    playPause: $("#trackPlayPauseButton"),
    stop: $("#trackStopButton"),
    status: $("#analysisStatus"),
    progressLabel: $("#analysisProgressLabel"),
    progressBar: $("#analysisProgressBar"),
    audio: $("#analysisAudio"),
    waveform: $("#waveformCanvas"),
    timeline: $("#noteTimelineCanvas"),
    seek: $("#analysisSeek"),
    currentTime: $("#analysisCurrentTime"),
    totalTime: $("#analysisTotalTime"),
    resultPlaceholder: $("#analysisResultPlaceholder"),
    bestMatch: $("#bestMatch"),
    bestMatchName: $("#bestMatchName"),
    bestMatchSubtitle: $("#bestMatchSubtitle"),
    confidenceRing: $("#confidenceRing"),
    confidenceText: $("#confidenceText"),
    candidateList: $("#candidateList"),
    nowNote: $("#nowPlayingNote"),
    nowFrequency: $("#nowPlayingFrequency"),
    nowDeviation: $("#nowPlayingDeviation"),
    badge: $("#analysisMiniBadge"),
    badgeText: $("#analysisMiniBadgeText"),
  };

  if (!elements.launch || !elements.drawer || !elements.audio) {
    console.warn("Audio analyzer markup was not found; extension was not initialized.");
    return;
  }

  function t(key, replacements = {}) {
    const dictionary = I18N[state.currentLanguage] || I18N.en;
    let value = dictionary[key] ?? I18N.en[key] ?? key;
    Object.entries(replacements).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  }

  function initialize() {
    bindEvents();
    setLanguage($("#languageSelector")?.value || "en");
    setStatus(t("ready"), 0);
    resizeCanvases();
    drawEmptyCanvas(elements.waveform, "Waveform");
    drawEmptyCanvas(elements.timeline, "Detected notes");
    updateButtons();
  }

  function bindEvents() {
    elements.launch.addEventListener("click", openDrawer);
    elements.close.addEventListener("click", closeDrawer);
    elements.backdrop.addEventListener("click", closeDrawer);

    elements.dropZone.addEventListener("click", () => elements.fileInput.click());
    elements.dropZone.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.fileInput.click();
      }
    });
    elements.fileInput.addEventListener("change", () => {
      const [file] = elements.fileInput.files || [];
      if (file) loadFile(file);
    });

    ["dragenter", "dragover"].forEach((type) => {
      elements.dropZone.addEventListener(type, (event) => {
        event.preventDefault();
        elements.dropZone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach((type) => {
      elements.dropZone.addEventListener(type, (event) => {
        event.preventDefault();
        elements.dropZone.classList.remove("dragover");
      });
    });
    elements.dropZone.addEventListener("drop", (event) => {
      const [file] = event.dataTransfer?.files || [];
      if (file) loadFile(file);
    });

    elements.analyze.addEventListener("click", analyzeTrack);
    elements.playPause.addEventListener("click", togglePlayback);
    elements.stop.addEventListener("click", stopPlayback);
    elements.seek.addEventListener("input", seekFromSlider);

    elements.audio.addEventListener("play", () => {
      elements.playPause.textContent = t("pause");
      startPlaybackAnimation();
    });
    elements.audio.addEventListener("pause", () => {
      elements.playPause.textContent = t("play");
    });
    elements.audio.addEventListener("ended", () => {
      elements.playPause.textContent = t("play");
      clearCircleHighlights();
      state.activeEventIndex = -1;
    });
    elements.audio.addEventListener("loadedmetadata", () => {
      elements.totalTime.textContent = formatTime(elements.audio.duration || 0);
    });

    $("#languageSelector")?.addEventListener("change", (event) => {
      setLanguage(event.target.value);
      if (state.candidates.length) renderResults(state.candidates);
      rebuildLabelBindings();
    });

    /* The existing app rotates on circle click and redraws on scale change. */
    $("#circleContainer")?.addEventListener("click", () => setTimeout(rebuildLabelBindings, 0));
    $("#scaleSelector")?.addEventListener("change", () => setTimeout(rebuildLabelBindings, 0));

    window.addEventListener("resize", debounce(() => {
      resizeCanvases();
      if (state.audioBuffer) drawWaveform(state.audioBuffer);
      if (state.analysis) drawTimeline(state.analysis.events);
    }, 120));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && elements.drawer.classList.contains("open")) closeDrawer();
    });
  }

  function setLanguage(language) {
    state.currentLanguage = I18N[language] ? language : "en";
    const dictionary = I18N[state.currentLanguage];

    $$('[data-analyzer-text]').forEach((element) => {
      const key = element.getAttribute("data-analyzer-text");
      if (dictionary[key]) element.textContent = dictionary[key];
    });

    elements.launch.textContent = dictionary.launch;
    elements.analyze.textContent = dictionary.analyze;
    elements.playPause.textContent = elements.audio.paused ? dictionary.play : dictionary.pause;
    elements.stop.textContent = dictionary.stop;

    if (!state.file) setStatus(dictionary.ready, 0);
    elements.nowNote.textContent ||= dictionary.noNote;
    elements.nowFrequency.textContent ||= dictionary.noNote;
    elements.nowDeviation.textContent ||= dictionary.noNote;
  }

  function openDrawer() {
    elements.drawer.classList.add("open");
    elements.backdrop.classList.add("open");
    elements.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("analyzer-lock-scroll");
    setTimeout(() => elements.close.focus(), 80);
  }

  function closeDrawer() {
    elements.drawer.classList.remove("open");
    elements.backdrop.classList.remove("open");
    elements.drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("analyzer-lock-scroll");
    elements.launch.focus({ preventScroll: true });
  }

  async function loadFile(file) {
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name);
    if (!isAudio) {
      setStatus(t("unsupported"), 0, true);
      return;
    }

    terminateWorker();
    stopPlayback();
    resetAnalysisResult();
    state.file = file;
    setStatus(t("decoding"), 5);
    updateButtons();

    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = URL.createObjectURL(file);
    elements.audio.src = state.objectUrl;

    try {
      const bytes = await file.arrayBuffer();
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      state.audioBuffer = await context.decodeAudioData(bytes.slice(0));
      await context.close();

      elements.trackSummary.classList.add("visible");
      elements.trackName.textContent = file.name;
      const limitedDuration = Math.min(state.audioBuffer.duration, state.analysisLimitSeconds);
      const durationNote = state.audioBuffer.duration > state.analysisLimitSeconds ? ` · ${t("fileTooLong")}` : "";
      elements.trackMeta.textContent = `${formatTime(state.audioBuffer.duration)} · ${formatBytes(file.size)}${durationNote}`;
      elements.totalTime.textContent = formatTime(state.audioBuffer.duration);
      elements.seek.value = "0";
      drawWaveform(state.audioBuffer);
      drawEmptyCanvas(elements.timeline, "Detected notes");
      setStatus(t("readyFile"), 0);
    } catch (error) {
      console.error(error);
      state.audioBuffer = null;
      setStatus(t("unsupported"), 0, true);
    }

    updateButtons();
  }

  async function analyzeTrack() {
    if (!state.audioBuffer || !state.file) return;

    terminateWorker();
    stopPlayback();
    resetAnalysisResult(true);
    setStatus(t("analyzing"), 1);
    elements.analyze.disabled = true;

    const mode = elements.mode.value;
    const minFrequency = clamp(Number(elements.minFrequency.value), 40, 400);
    const maxFrequency = clamp(Number(elements.maxFrequency.value), Math.max(300, minFrequency + 100), 3000);
    elements.minFrequency.value = String(minFrequency);
    elements.maxFrequency.value = String(maxFrequency);

    try {
      const downsampled = downsampleToMono(
        state.audioBuffer,
        12000,
        state.analysisLimitSeconds
      );

      const worker = new Worker("src/audio-analyzer.worker.js");
      state.worker = worker;

      worker.onmessage = (event) => {
        const message = event.data || {};
        if (message.type === "progress") {
          setStatus(t("analyzing"), message.progress);
        } else if (message.type === "complete") {
          state.worker = null;
          handleAnalysisComplete(message.result, mode);
          worker.terminate();
        } else if (message.type === "error") {
          state.worker = null;
          worker.terminate();
          throwWorkerError(message.message);
        }
      };

      worker.onerror = (event) => {
        console.error(event);
        state.worker = null;
        worker.terminate();
        throwWorkerError(event.message || t("error"));
      };

      worker.postMessage(
        {
          type: "analyze",
          samples: downsampled.samples.buffer,
          sampleRate: downsampled.sampleRate,
          options: { mode, minFrequency, maxFrequency },
        },
        [downsampled.samples.buffer]
      );
    } catch (error) {
      console.error(error);
      throwWorkerError(error instanceof Error ? error.message : String(error));
    }
  }

  function throwWorkerError(message) {
    setStatus(`${t("error")} ${message || ""}`.trim(), 0, true);
    elements.analyze.disabled = false;
    updateButtons();
  }

  function handleAnalysisComplete(result, mode) {
    state.analysis = result;
    elements.analyze.disabled = false;

    if (!result.events?.length || result.voicedFrameCount < 4) {
      setStatus(t("noVoiced"), 0, true);
      updateButtons();
      return;
    }

    state.candidates = matchScales(result, mode);
    renderResults(state.candidates);
    applyCandidateToCircle(state.candidates[0]);
    drawTimeline(result.events);
    setStatus(`${t("complete")} ${t("events", { n: result.events.length })}`, 100);
    updateButtons();
  }

  function matchScales(result, mode) {
    if (typeof scaleData === "undefined") {
      throw new Error("The existing scaleData object is not available.");
    }

    const blend = mode === "melody"
      ? { f0: 0.86, spectral: 0.14 }
      : mode === "mix"
        ? { f0: 0.38, spectral: 0.62 }
        : { f0: 0.67, spectral: 0.33 };

    const profile = normalizeProfile(
      result.f0Histogram.map((value, index) =>
        value * blend.f0 + result.spectralHistogram[index] * blend.spectral
      )
    );
    const opening = normalizeProfile(result.openingHistogram || new Array(24).fill(0));
    const ending = normalizeProfile(result.endingHistogram || new Array(24).fill(0));
    const candidates = [];

    Object.entries(scaleData).forEach(([scaleName, definition]) => {
      const offsets = definition.angles.map((angle) => mod(Math.round(angle / 15), 24));

      for (let tonicBin = 0; tonicBin < 24; tonicBin += 1) {
        const notes = offsets.map((offset) => mod(tonicBin + offset, 24));
        const noteSet = new Set(notes);
        let exactCoverage = 0;
        let neighboringCoverage = 0;
        let occupiedDegrees = 0;

        notes.forEach((note) => {
          exactCoverage += profile[note];
          neighboringCoverage += 0.5 * (profile[mod(note - 1, 24)] + profile[mod(note + 1, 24)]);
          if (profile[note] > 0.012) occupiedDegrees += 1;
        });

        let outsideEnergy = 0;
        profile.forEach((value, bin) => {
          if (!noteSet.has(bin)) outsideEnergy += value;
        });

        const tonicProminence = clamp((profile[tonicBin] - 1 / 24) / 0.13, 0, 1);
        const endingEvidence = clamp((ending[tonicBin] || 0) * 6.5, 0, 1);
        const openingEvidence = clamp((opening[tonicBin] || 0) * 4.8, 0, 1);
        const degreeCoverage = occupiedDegrees / offsets.length;

        const score =
          exactCoverage * 0.72 +
          neighboringCoverage * 0.08 +
          tonicProminence * 0.08 +
          endingEvidence * 0.07 +
          openingEvidence * 0.02 +
          degreeCoverage * 0.06 -
          outsideEnergy * 0.13;

        candidates.push({
          scaleName,
          tonicBin,
          score,
          offsets,
          exactCoverage,
          outsideEnergy,
          profile,
        });
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    const second = candidates[1] || best;
    const absoluteQuality = clamp((best.score - 0.27) / 0.48, 0, 1);
    const separation = clamp((best.score - second.score) * 9, 0, 1);
    best.confidence = Math.round((absoluteQuality * 0.68 + separation * 0.32) * 100);

    /* Confidence for alternatives is a relative match-strength indicator. */
    const bestScore = Math.max(1e-6, best.score);
    candidates.slice(1, 5).forEach((candidate) => {
      candidate.confidence = Math.round(clamp(candidate.score / bestScore, 0, 1) * best.confidence);
    });

    return candidates.slice(0, 5);
  }

  function renderResults(candidates) {
    const best = candidates[0];
    if (!best) return;

    elements.resultPlaceholder.style.display = "none";
    elements.bestMatch.classList.add("visible");
    const tonicName = pitchClassName(best.tonicBin);
    elements.bestMatchName.textContent = `${scaleDisplayName(best.scaleName)} · ${tonicName}`;
    elements.bestMatchSubtitle.textContent = `${t("tonic")}: ${tonicName} · ${t("pitchEnergy", { n: Math.round(best.exactCoverage * 100) })}`;
    elements.confidenceText.textContent = `${best.confidence}%`;
    elements.confidenceRing.style.setProperty("--confidence-angle", `${best.confidence * 3.6}deg`);

    elements.candidateList.innerHTML = "";
    candidates.slice(1, 4).forEach((candidate) => {
      const item = document.createElement("div");
      item.className = "candidate-item";
      item.innerHTML = `
        <strong>${escapeHtml(scaleDisplayName(candidate.scaleName))} · ${escapeHtml(pitchClassName(candidate.tonicBin))}</strong>
        <span>${candidate.confidence}%</span>
      `;
      elements.candidateList.appendChild(item);
    });

    elements.badge.classList.add("visible");
    elements.badgeText.textContent = `${t("badge")}: ${scaleDisplayName(best.scaleName)} · ${tonicName} (${best.confidence}%)`;
  }

  function applyCandidateToCircle(candidate) {
    if (!candidate || typeof rotation === "undefined") return;
    const selector = $("#scaleSelector");
    const innerCircle = $("#diatonicScale");
    if (!selector || !innerCircle) return;

    selector.value = candidate.scaleName;
    rotation = -candidate.tonicBin * 15;
    innerCircle.style.transform = `rotate(${rotation}deg)`;
    selector.dispatchEvent(new Event("change", { bubbles: true }));
    rebuildLabelBindings();
    setTimeout(rebuildLabelBindings, 0);
  }

  function rebuildLabelBindings() {
    if (typeof scaleData === "undefined" || typeof rotation === "undefined") return;
    const selectedScale = $("#scaleSelector")?.value;
    if (!selectedScale || !scaleData[selectedScale]) return;

    const tonicBin = mod(Math.round(-rotation / 15), 24);
    const offsets = scaleData[selectedScale].angles.map((angle) => mod(Math.round(angle / 15), 24));
    const labels = $$("#outerScale .dynamic-label");

    state.labelBindings = offsets.map((offset, index) => ({
      pitchClass: mod(tonicBin + offset, 24),
      label: labels[index] || null,
      degreeIndex: index,
    }));
  }

  async function togglePlayback() {
    if (!state.file || !state.analysis) return;
    try {
      if (elements.audio.paused) {
        await elements.audio.play();
      } else {
        elements.audio.pause();
      }
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : String(error), 0, true);
    }
  }

  function stopPlayback() {
    elements.audio.pause();
    if (Number.isFinite(elements.audio.duration)) elements.audio.currentTime = 0;
    elements.seek.value = "0";
    elements.currentTime.textContent = "0:00";
    state.activeEventIndex = -1;
    clearCircleHighlights();
    updateNowPlaying(null);
    redrawCanvasesWithPlayhead(0);
  }

  function seekFromSlider() {
    if (!Number.isFinite(elements.audio.duration) || elements.audio.duration <= 0) return;
    const fraction = Number(elements.seek.value) / 1000;
    elements.audio.currentTime = fraction * elements.audio.duration;
    state.activeEventIndex = findEventIndex(elements.audio.currentTime);
    updatePlaybackFrame();
  }

  function startPlaybackAnimation() {
    cancelAnimationFrame(state.animationFrame);
    const tick = () => {
      updatePlaybackFrame();
      if (!elements.audio.paused && !elements.audio.ended) {
        state.animationFrame = requestAnimationFrame(tick);
      }
    };
    state.animationFrame = requestAnimationFrame(tick);
  }

  function updatePlaybackFrame() {
    const duration = elements.audio.duration || state.analysis?.duration || 0;
    const currentTime = elements.audio.currentTime || 0;
    const fraction = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0;
    elements.seek.value = String(Math.round(fraction * 1000));
    elements.currentTime.textContent = formatTime(currentTime);
    elements.totalTime.textContent = formatTime(duration);

    const eventIndex = findEventIndex(currentTime);
    if (eventIndex !== state.activeEventIndex) {
      state.activeEventIndex = eventIndex;
      const noteEvent = eventIndex >= 0 ? state.analysis.events[eventIndex] : null;
      highlightEvent(noteEvent);
      updateNowPlaying(noteEvent);
    }

    redrawCanvasesWithPlayhead(fraction);
  }

  function findEventIndex(time) {
    const events = state.analysis?.events || [];
    if (!events.length) return -1;

    let low = 0;
    let high = events.length - 1;
    let candidate = -1;

    while (low <= high) {
      const middle = (low + high) >> 1;
      if (events[middle].startTime <= time) {
        candidate = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    if (candidate >= 0 && time <= events[candidate].endTime + 0.035) return candidate;
    return -1;
  }

  function highlightEvent(noteEvent) {
    clearCircleHighlights();
    if (!noteEvent || !state.labelBindings.length) return;

    let nearest = null;
    for (const binding of state.labelBindings) {
      if (!binding.label) continue;
      const distance = circularDistance(noteEvent.pitchClass, binding.pitchClass, 24);
      if (!nearest || distance < nearest.distance) nearest = { ...binding, distance };
    }

    if (!nearest?.label) return;
    const className = nearest.distance === 0
      ? "analysis-active"
      : nearest.distance === 1
        ? "analysis-near"
        : "analysis-outside";
    nearest.label.classList.add(className);
    state.lastHighlightedLabel = nearest.label;
  }

  function clearCircleHighlights() {
    $$("#outerScale .dynamic-label").forEach((label) => {
      label.classList.remove("analysis-active", "analysis-near", "analysis-outside");
    });
    state.lastHighlightedLabel = null;
  }

  function updateNowPlaying(noteEvent) {
    if (!noteEvent) {
      elements.nowNote.textContent = t("noNote");
      elements.nowFrequency.textContent = t("noNote");
      elements.nowDeviation.textContent = t("noNote");
      return;
    }

    const exactBinding = state.labelBindings.find((binding) => binding.pitchClass === noteEvent.pitchClass);
    elements.nowNote.textContent = exactBinding?.label?.textContent?.trim() || pitchClassName(noteEvent.pitchClass);
    elements.nowFrequency.textContent = `${noteEvent.frequency.toFixed(1)} Hz`;
    const cents = Math.round(noteEvent.centsDeviation);
    elements.nowDeviation.textContent = Math.abs(cents) <= 3
      ? t("centered")
      : cents > 0
        ? t("centsHigh", { n: Math.abs(cents) })
        : t("centsLow", { n: Math.abs(cents) });
  }

  function downsampleToMono(audioBuffer, targetRate, maximumSeconds) {
    const sourceRate = audioBuffer.sampleRate;
    const duration = Math.min(audioBuffer.duration, maximumSeconds);
    const sourceLength = Math.floor(duration * sourceRate);
    const targetLength = Math.max(1, Math.floor(duration * targetRate));
    const output = new Float32Array(targetLength);
    const channels = [];

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
      channels.push(audioBuffer.getChannelData(channel));
    }

    for (let index = 0; index < targetLength; index += 1) {
      const sourcePosition = (index * sourceRate) / targetRate;
      const leftIndex = Math.min(sourceLength - 1, Math.floor(sourcePosition));
      const rightIndex = Math.min(sourceLength - 1, leftIndex + 1);
      const fraction = sourcePosition - leftIndex;
      let value = 0;

      for (const channel of channels) {
        value += channel[leftIndex] * (1 - fraction) + channel[rightIndex] * fraction;
      }
      output[index] = value / channels.length;
    }

    return { samples: output, sampleRate: targetRate };
  }

  function drawWaveform(audioBuffer) {
    resizeCanvas(elements.waveform, 94);
    const canvas = elements.waveform;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const middle = height / 2;
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) channels.push(audioBuffer.getChannelData(i));

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(26, 59, 102, 0.78)";
    context.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    context.beginPath();

    const samplesPerPixel = Math.max(1, Math.floor(audioBuffer.length / width));
    for (let x = 0; x < width; x += 1) {
      const start = x * samplesPerPixel;
      const end = Math.min(audioBuffer.length, start + samplesPerPixel);
      let minimum = 1;
      let maximum = -1;

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += Math.max(1, Math.floor(samplesPerPixel / 28))) {
        let value = 0;
        channels.forEach((channel) => { value += channel[sampleIndex] || 0; });
        value /= channels.length;
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
      }

      context.moveTo(x, middle + minimum * middle * 0.86);
      context.lineTo(x, middle + maximum * middle * 0.86);
    }
    context.stroke();
    state.waveformBase = cloneCanvas(canvas);
  }

  function drawTimeline(events) {
    resizeCanvas(elements.timeline, 94);
    const canvas = elements.timeline;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const duration = state.analysis?.duration || elements.audio.duration || 1;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, width, height);

    for (let row = 0; row < 7; row += 1) {
      const y = ((row + 0.5) / 7) * height;
      context.strokeStyle = "rgba(24, 32, 43, 0.07)";
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    events.forEach((noteEvent) => {
      const x = (noteEvent.startTime / duration) * width;
      const eventWidth = Math.max(1.5, (noteEvent.duration / duration) * width);
      const binding = nearestBinding(noteEvent.pitchClass);
      const row = binding ? binding.degreeIndex : 6;
      const y = (row / 7) * height + 2;
      const eventHeight = Math.max(3, height / 7 - 4);
      const alpha = clamp(0.36 + noteEvent.confidence * 0.58, 0.35, 0.96);
      context.fillStyle = binding?.distance === 0
        ? `rgba(26, 59, 102, ${alpha})`
        : binding?.distance === 1
          ? `rgba(166, 106, 0, ${alpha})`
          : `rgba(162, 58, 58, ${alpha})`;
      context.fillRect(x, y, eventWidth, eventHeight);
    });

    state.timelineBase = cloneCanvas(canvas);
  }

  function nearestBinding(pitchClass) {
    let best = null;
    state.labelBindings.forEach((binding) => {
      const distance = circularDistance(pitchClass, binding.pitchClass, 24);
      if (!best || distance < best.distance) best = { ...binding, distance };
    });
    return best;
  }

  function redrawCanvasesWithPlayhead(fraction) {
    drawBaseWithPlayhead(elements.waveform, state.waveformBase, fraction);
    drawBaseWithPlayhead(elements.timeline, state.timelineBase, fraction);
  }

  function drawBaseWithPlayhead(canvas, baseCanvas, fraction) {
    if (!canvas || !baseCanvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(baseCanvas, 0, 0);
    const x = clamp(fraction, 0, 1) * canvas.width;
    context.strokeStyle = "rgba(119, 73, 83, 0.95)";
    context.lineWidth = Math.max(1.2, (window.devicePixelRatio || 1) * 1.1);
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  function resizeCanvases() {
    resizeCanvas(elements.waveform, 94);
    resizeCanvas(elements.timeline, 94);
  }

  function resizeCanvas(canvas, cssHeight) {
    if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(280, canvas.parentElement?.clientWidth || 420);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(cssHeight * ratio);
  }

  function cloneCanvas(source) {
    const clone = document.createElement("canvas");
    clone.width = source.width;
    clone.height = source.height;
    clone.getContext("2d").drawImage(source, 0, 0);
    return clone;
  }

  function drawEmptyCanvas(canvas, label) {
    resizeCanvas(canvas, 94);
    const context = canvas.getContext("2d");
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(104, 115, 134, 0.8)";
    context.font = `${12 * (window.devicePixelRatio || 1)}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, canvas.width / 2, canvas.height / 2);
    if (canvas === elements.waveform) state.waveformBase = cloneCanvas(canvas);
    if (canvas === elements.timeline) state.timelineBase = cloneCanvas(canvas);
  }

  function resetAnalysisResult(clearBadge = true) {
    state.analysis = null;
    state.candidates = [];
    state.activeEventIndex = -1;
    elements.resultPlaceholder.style.display = "block";
    elements.resultPlaceholder.textContent = t("resultEmpty");
    elements.bestMatch.classList.remove("visible");
    elements.candidateList.innerHTML = "";
    elements.confidenceText.textContent = "0%";
    elements.confidenceRing.style.setProperty("--confidence-angle", "0deg");
    updateNowPlaying(null);
    clearCircleHighlights();
    if (clearBadge) elements.badge.classList.remove("visible");
  }

  function setStatus(message, progress = 0, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "var(--analyzer-danger)" : "";
    const normalized = clamp(Number(progress) || 0, 0, 100);
    elements.progressBar.style.width = `${normalized}%`;
    elements.progressLabel.textContent = `${Math.round(normalized)}%`;
  }

  function updateButtons() {
    elements.analyze.disabled = !state.audioBuffer || Boolean(state.worker);
    elements.playPause.disabled = !state.analysis;
    elements.stop.disabled = !state.file;
  }

  function terminateWorker() {
    if (state.worker) {
      state.worker.terminate();
      state.worker = null;
    }
  }

  function scaleDisplayName(scaleName) {
    if (typeof translations !== "undefined") {
      const translated = translations[state.currentLanguage]?.scales?.[scaleName];
      if (translated) return translated;
    }
    const fallback = {
      Shur: "Shur",
      nava: "Nava",
      segah: "Segah",
      homayoun: "Homayoun",
      esfahan: "Esfahan",
      chahargah: "Chahargah",
      mahur: "Mahur / Rast Panjgah",
    };
    return fallback[scaleName] || scaleName;
  }

  function pitchClassName(pitchClass) {
    const en = [
      "C", "C sori", "C♯ / D♭", "D koron", "D", "D sori",
      "D♯ / E♭", "E koron", "E", "E sori / F koron", "F", "F sori",
      "F♯ / G♭", "G koron", "G", "G sori", "G♯ / A♭", "A koron",
      "A", "A sori", "A♯ / B♭", "B koron", "B", "C koron",
    ];
    const fa = [
      "دو", "دو سُری", "دو دیز / ر بمل", "ر کُرُن", "ر", "ر سُری",
      "ر دیز / می بمل", "می کُرُن", "می", "می سُری / فا کُرُن", "فا", "فا سُری",
      "فا دیز / سل بمل", "سل کُرُن", "سل", "سل سُری", "سل دیز / لا بمل", "لا کُرُن",
      "لا", "لا سُری", "لا دیز / سی بمل", "سی کُرُن", "سی", "دو کُرُن",
    ];
    return (state.currentLanguage === "fa" ? fa : en)[mod(pitchClass, 24)];
  }

  function normalizeProfile(values) {
    const output = values.map((value) => Math.max(0, Number(value) || 0));
    const sum = output.reduce((total, value) => total + value, 0);
    return sum > 0 ? output.map((value) => value / sum) : output;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainder = String(wholeSeconds % 60).padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function circularDistance(a, b, modulo) {
    const difference = Math.abs(a - b) % modulo;
    return Math.min(difference, modulo - difference);
  }

  function mod(value, modulo) {
    return ((value % modulo) + modulo) % modulo;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function debounce(callback, delay) {
    let timer = 0;
    return (...argumentsList) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => callback(...argumentsList), delay);
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  initialize();
})();
