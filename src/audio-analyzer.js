/* =========================================================
   Persian Music Scales — Audio Analyzer UI + integration v5.3 — two-stage microphone permission + direct recorder loop
   Requires the existing src/index.js to be loaded first.
   ========================================================= */

(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const I18N = {
    en: {
      launch: "🎧 Analyze Track",
      quickFindScale: "Find the scale",
      quickFindScaleHelp: "Record or upload a short phrase",
      quickHoldHint: "Hold to record",
      enableMicrophone: "Enable microphone",
      microphoneSetupHint: "Tap once for microphone access",
      microphoneReadyHold: "Microphone ready — hold to record",
      microphonePermissionReady: "Microphone ready. Hold to record.",
      loopingPlayback: "Playing repeatedly — tap the page to stop",
      quickPanelTitle: "What scale is this?",
      quickPanelHelp: "Record a clear phrase or choose an audio file.",
      quickUpload: "Upload a track",
      quickMoreSettings: "More settings",
      title: "Track Scale Analyzer",
      subtitle: "Detect the strongest scale match and follow the melody on the circle.",
      uploadTitle: "1. Load a recording",
      local: "Local processing",
      choose: "Choose or drop an audio file",
      formats: "MP3, WAV, M4A, OGG and browser-supported audio",
      inputOr: "or record a phrase",
      holdToRecord: "Hold to record",
      releaseToAnalyze: "Release the button to stop and analyze automatically.",
      recordReady: "Microphone ready",
      requestingMicrophone: "Requesting microphone access…",
      recordingNow: "Recording… release to analyze",
      recordingMaximum: "Maximum recording length reached. Preparing analysis…",
      recordingTooShort: "The recording was too short. Hold for at least 1.5 seconds.",
      microphoneUnsupported: "Microphone recording is not supported in this browser or connection.",
      microphoneDenied: "Microphone access was not granted. Allow microphone access and try again.",
      recordingFailed: "The recording could not be prepared for analysis.",
      recordedClip: "Microphone recording",
      cancelRecording: "Cancel recording",
      recordingCancelled: "Recording cancelled.",
      microphonePrivacy: "The recording stays in this browser and is not uploaded.",
      settingsTitle: "2. Analysis settings",
      resetDefaults: "Reset defaults",
      defaultsRestored: "Recommended defaults restored.",
      autoAnalysisHint: "New tracks are analyzed automatically with the recommended defaults, then playback begins.",
      autoAnalyzing: "Track loaded. Automatic analysis has started…",
      autoplayBlocked: "Analysis is ready. Press Original to begin playback.",
      mode: "Recording type",
      melody: "Solo / melody-dominant",
      balanced: "Balanced recording",
      mix: "Dense ensemble / full mix",
      extractMelody: "Extract a simplified predominant melody",
      extractMelodyHelp: "Follow one continuous, hummable melodic line instead of treating every simultaneous note equally.",
      detail: "Melodic detail",
      stable: "Stable",
      detailed: "Detailed / ornaments",
      register: "Melody register preference",
      registerAuto: "Automatic",
      registerUpper: "Prefer upper voice",
      registerNeutral: "No register preference",
      registerLower: "Prefer lower voice",
      minPitch: "Lowest pitch (Hz)",
      maxPitch: "Highest pitch (Hz)",
      help: "Solo and melody-dominant recordings produce the most reliable note sequence. The full-mix mode gives more weight to the spectral pitch profile.",
      analyze: "Analyze Track",
      play: "▶ Original",
      pause: "❚❚ Original",
      melodyPlay: "♫ Simplified Melody",
      melodyPause: "❚❚ Simplified Melody",
      stop: "■ Stop",
      ready: "Load a track to begin.",
      decoding: "Decoding audio…",
      readyFile: "Ready to analyze.",
      analyzing: "Analyzing pitches and scale candidates…",
      complete: "Analysis complete.",
      error: "Analysis could not be completed.",
      timelineTitle: "3. Track and detected-note timeline",
      timelineHint: "Seek anywhere",
      rawMaterial: "Detected material",
      structural: "Selected melody",
      ornament: "Ornament / short note",
      resultTitle: "4. Best scale match",
      resultEmpty: "The strongest scale candidates will appear here after analysis.",
      tonic: "tonic",
      alternatives: "Other candidates",
      currentTitle: "Live playback",
      currentNote: "Note",
      frequency: "Frequency",
      deviation: "Tuning",
      noteRole: "Function",
      structuralRole: "Structural note",
      ornamentRole: "Ornament / passing note",
      noNote: "—",
      disclaimer: "This is a best-match educational analysis, not a definitive dastgah or gusheh classification. Intonation, variable tones, melodic function and modulation can require expert interpretation.",
      fileTooLong: "Only the first 20 minutes will be analyzed and animated.",
      noVoiced: "No stable melodic pitches were found. Try the full-mix mode or a clearer melody-dominant recording.",
      unsupported: "This browser could not decode the selected audio file.",
      badge: "Detected",
      centsHigh: "{n} cents high",
      centsLow: "{n} cents low",
      centered: "centered",
      events: "{n} melody notes · {o} ornaments",
      confidence: "match",
      pitchEnergy: "{n}% pitch energy on scale notes",
      visualizerTitle: "Circular spectrum visualizer",
      visualizerEnabled: "Show radial spectrum halo",
      visualizerHelp: "Each bar stays fixed on the circle and grows radially outward with the music.",
      visualizerMode: "Visualizer mode",
      visualizerHybrid: "Hybrid spectrum + pitch",
      visualizerPitch: "Pitch-class emphasis",
      visualizerSpectrum: "Full frequency spectrum",
      visualizerMelody: "Melody-focused",
      visualizerMinimal: "Minimal",
      visualizerSensitivity: "Sensitivity",
      visualizerSmoothing: "Smoothing",
      visualizerLength: "Maximum bar length",
      visualizerBackground: "Background intensity",
      visualizerMelodyEmphasis: "Melody emphasis",
      candidateHint: "Select one to apply it to the circle",
      manualOverride: "Manual scale and tonic",
      manualScale: "Scale",
      manualTonic: "Tonic",
      applyManual: "Apply interpretation",
      whyResult: "Why this result?",
      automaticChoice: "Automatic recommendation",
      userChoice: "User-selected interpretation",
      strongMatch: "Strong result",
      moderateMatch: "Moderate result",
      closeCandidates: "Close candidates",
      lowConfidence: "Low-confidence result",
      closeMessage: "The leading candidates are very close. Listen to the simplified melody and select the interpretation that best fits the recording.",
      strongMessage: "The leading interpretation is clearly separated from the alternatives.",
      moderateMessage: "The result is plausible, but the alternatives remain worth checking.",
      lowMessage: "The recording does not provide enough distinctive modal evidence for a reliable automatic choice.",
      metricPitch: "Scale-note coverage",
      metricTonic: "Tonic evidence",
      metricEnding: "Phrase endings",
      metricCharacteristic: "Characteristic intervals",
      metricCadence: "Resolution patterns",
      metricOutside: "Outside-scale energy",
      matchLabel: "match",
      selectedLabel: "Selected",
      autoLabel: "Automatic",
      explanationTemplate: "{scale} on {tonic} places {coverage}% of the structural melodic evidence on scale notes. Tonic evidence is {tonicEvidence}%, phrase-ending evidence is {endingEvidence}%, and characteristic-interval evidence is {characteristicEvidence}%. {gapText}",
      gapClose: "The next candidate is only {gap} percentage points behind, so the interpretation is genuinely ambiguous.",
      gapClear: "It leads the next candidate by {gap} percentage points.",
    },
    fr: {
      launch: "🎧 Analyser un morceau",
      quickFindScale: "Trouver la gamme",
      quickFindScaleHelp: "Enregistrer ou charger une courte phrase",
      quickHoldHint: "Maintenir pour enregistrer",
      enableMicrophone: "Activer le microphone",
      microphoneSetupHint: "Touchez une fois pour autoriser le microphone",
      microphoneReadyHold: "Microphone prêt — maintenez pour enregistrer",
      microphonePermissionReady: "Microphone prêt. Maintenez pour enregistrer.",
      loopingPlayback: "Lecture en boucle — touchez la page pour arrêter",
      quickPanelTitle: "Quelle est cette gamme ?",
      quickPanelHelp: "Enregistrez une phrase claire ou choisissez un fichier audio.",
      quickUpload: "Charger un morceau",
      quickMoreSettings: "Plus de réglages",
      title: "Analyseur de gamme",
      subtitle: "Détecte la meilleure correspondance et suit la mélodie sur le cercle.",
      uploadTitle: "1. Charger un enregistrement",
      local: "Traitement local",
      choose: "Choisir ou déposer un fichier audio",
      formats: "MP3, WAV, M4A, OGG et formats pris en charge",
      inputOr: "ou enregistrer une phrase",
      holdToRecord: "Maintenir pour enregistrer",
      releaseToAnalyze: "Relâchez le bouton pour arrêter et lancer automatiquement l’analyse.",
      recordReady: "Microphone prêt",
      requestingMicrophone: "Demande d’accès au microphone…",
      recordingNow: "Enregistrement… relâchez pour analyser",
      recordingMaximum: "Durée maximale atteinte. Préparation de l’analyse…",
      recordingTooShort: "L’enregistrement est trop court. Maintenez au moins 1,5 seconde.",
      microphoneUnsupported: "L’enregistrement au microphone n’est pas pris en charge par ce navigateur ou cette connexion.",
      microphoneDenied: "L’accès au microphone n’a pas été accordé. Autorisez-le puis réessayez.",
      recordingFailed: "L’enregistrement n’a pas pu être préparé pour l’analyse.",
      recordedClip: "Enregistrement microphone",
      cancelRecording: "Annuler l’enregistrement",
      recordingCancelled: "Enregistrement annulé.",
      microphonePrivacy: "L’enregistrement reste dans ce navigateur et n’est pas téléversé.",
      settingsTitle: "2. Paramètres d’analyse",
      resetDefaults: "Valeurs par défaut",
      defaultsRestored: "Les réglages recommandés ont été restaurés.",
      autoAnalysisHint: "Chaque nouveau morceau est analysé automatiquement avec les réglages recommandés, puis la lecture commence.",
      autoAnalyzing: "Morceau chargé. L’analyse automatique a commencé…",
      autoplayBlocked: "L’analyse est prête. Appuyez sur Original pour commencer la lecture.",
      mode: "Type d’enregistrement",
      melody: "Solo / mélodie dominante",
      balanced: "Enregistrement équilibré",
      mix: "Ensemble dense / mix complet",
      extractMelody: "Extraire une mélodie principale simplifiée",
      extractMelodyHelp: "Suit une seule ligne mélodique continue et chantable au lieu de traiter toutes les notes simultanées de la même façon.",
      detail: "Détail mélodique",
      stable: "Stable",
      detailed: "Détaillé / ornements",
      register: "Registre mélodique préféré",
      registerAuto: "Automatique",
      registerUpper: "Préférer la voix supérieure",
      registerNeutral: "Sans préférence de registre",
      registerLower: "Préférer la voix inférieure",
      minPitch: "Fréquence minimale (Hz)",
      maxPitch: "Fréquence maximale (Hz)",
      help: "Les enregistrements solos donnent la séquence de notes la plus fiable. Le mode mix complet accorde davantage de poids au profil spectral.",
      analyze: "Analyser",
      play: "▶ Original",
      pause: "❚❚ Original",
      melodyPlay: "♫ Mélodie simplifiée",
      melodyPause: "❚❚ Mélodie simplifiée",
      stop: "■ Arrêt",
      ready: "Chargez un morceau pour commencer.",
      decoding: "Décodage audio…",
      readyFile: "Prêt pour l’analyse.",
      analyzing: "Analyse des hauteurs et des gammes…",
      complete: "Analyse terminée.",
      error: "L’analyse n’a pas pu être terminée.",
      timelineTitle: "3. Piste et chronologie des notes",
      timelineHint: "Navigation libre",
      rawMaterial: "Matériau détecté",
      structural: "Mélodie sélectionnée",
      ornament: "Ornement / note brève",
      resultTitle: "4. Meilleure correspondance",
      resultEmpty: "Les meilleures gammes apparaîtront ici après l’analyse.",
      tonic: "tonique",
      alternatives: "Autres possibilités",
      currentTitle: "Lecture en direct",
      currentNote: "Note",
      frequency: "Fréquence",
      deviation: "Accord",
      noteRole: "Fonction",
      structuralRole: "Note structurelle",
      ornamentRole: "Ornement / note de passage",
      noNote: "—",
      disclaimer: "Il s’agit d’une analyse pédagogique de correspondance, et non d’une classification définitive du dastgah ou du gusheh.",
      fileTooLong: "Seules les 20 premières minutes seront analysées et animées.",
      noVoiced: "Aucune hauteur mélodique stable n’a été trouvée. Essayez le mode mix complet ou un enregistrement plus clair.",
      unsupported: "Ce navigateur n’a pas pu décoder le fichier audio.",
      badge: "Détecté",
      centsHigh: "{n} cents au-dessus",
      centsLow: "{n} cents au-dessous",
      centered: "centré",
      events: "{n} notes mélodiques · {o} ornements",
      confidence: "correspondance",
      pitchEnergy: "{n} % de l’énergie sur les notes de la gamme",
      visualizerTitle: "Visualiseur spectral circulaire",
      visualizerEnabled: "Afficher le halo spectral radial",
      visualizerHelp: "Chaque barre reste fixée au cercle et s’étend radialement vers l’extérieur.",
      visualizerMode: "Mode du visualiseur",
      visualizerHybrid: "Spectre + hauteur",
      visualizerPitch: "Accent sur les classes de hauteur",
      visualizerSpectrum: "Spectre fréquentiel complet",
      visualizerMelody: "Centré sur la mélodie",
      visualizerMinimal: "Minimal",
      visualizerSensitivity: "Sensibilité",
      visualizerSmoothing: "Lissage",
      visualizerLength: "Longueur maximale",
      visualizerBackground: "Intensité de fond",
      visualizerMelodyEmphasis: "Accent mélodique",
      candidateHint: "Sélectionnez une interprétation pour l’appliquer au cercle",
      manualOverride: "Gamme et tonique manuelles",
      manualScale: "Gamme",
      manualTonic: "Tonique",
      applyManual: "Appliquer l’interprétation",
      whyResult: "Pourquoi ce résultat ?",
      automaticChoice: "Recommandation automatique",
      userChoice: "Interprétation choisie",
      strongMatch: "Résultat fort",
      moderateMatch: "Résultat modéré",
      closeCandidates: "Candidats proches",
      lowConfidence: "Résultat peu fiable",
      closeMessage: "Les premiers candidats sont très proches. Écoutez la mélodie simplifiée et choisissez l’interprétation la plus convaincante.",
      strongMessage: "L’interprétation principale est nettement séparée des alternatives.",
      moderateMessage: "Le résultat est plausible, mais les alternatives méritent d’être vérifiées.",
      lowMessage: "L’enregistrement ne fournit pas assez d’indices modaux distinctifs pour un choix automatique fiable.",
      metricPitch: "Couverture des notes",
      metricTonic: "Indice de tonique",
      metricEnding: "Fins de phrases",
      metricCharacteristic: "Intervalles caractéristiques",
      metricCadence: "Mouvements de résolution",
      metricOutside: "Énergie hors gamme",
      matchLabel: "correspondance",
      selectedLabel: "Sélectionné",
      autoLabel: "Automatique",
      explanationTemplate: "{scale} sur {tonic} place {coverage} % des indices mélodiques structurels sur les notes de la gamme. L’indice de tonique est de {tonicEvidence} %, celui des fins de phrases de {endingEvidence} %, et celui des intervalles caractéristiques de {characteristicEvidence} %. {gapText}",
      gapClose: "Le candidat suivant n’est qu’à {gap} points, l’interprétation est donc réellement ambiguë.",
      gapClear: "Il devance le candidat suivant de {gap} points.",
    },
    fa: {
      launch: "🎧 تحلیل قطعه",
      quickFindScale: "گام را پیدا کن",
      quickFindScaleHelp: "یک جمله ضبط یا فایل صوتی بارگذاری کنید",
      quickHoldHint: "برای ضبط نگه دارید",
      enableMicrophone: "فعال‌کردن میکروفن",
      microphoneSetupHint: "برای دسترسی، یک‌بار لمس کنید",
      microphoneReadyHold: "میکروفن آماده است — برای ضبط نگه دارید",
      microphonePermissionReady: "میکروفن آماده است. برای ضبط نگه دارید.",
      loopingPlayback: "پخش تکراری — برای توقف صفحه را لمس کنید",
      quickPanelTitle: "این چه گامی است؟",
      quickPanelHelp: "یک جملهٔ واضح ضبط کنید یا فایل صوتی انتخاب کنید.",
      quickUpload: "بارگذاری قطعه",
      quickMoreSettings: "تنظیمات بیشتر",
      title: "تحلیل‌گر گام قطعه",
      subtitle: "بهترین گام را پیدا می‌کند و حرکت ملودی را روی دایره نشان می‌دهد.",
      uploadTitle: "۱. بارگذاری فایل صوتی",
      local: "پردازش محلی",
      choose: "فایل صوتی را انتخاب یا اینجا رها کنید",
      formats: "MP3، WAV، M4A، OGG و فرمت‌های قابل پخش مرورگر",
      inputOr: "یا یک جملهٔ کوتاه ضبط کنید",
      holdToRecord: "برای ضبط نگه دارید",
      releaseToAnalyze: "برای توقف و تحلیل خودکار، دکمه را رها کنید.",
      recordReady: "میکروفن آماده است",
      requestingMicrophone: "در حال درخواست دسترسی به میکروفن…",
      recordingNow: "در حال ضبط… برای تحلیل رها کنید",
      recordingMaximum: "حداکثر زمان ضبط به پایان رسید؛ در حال آماده‌سازی تحلیل…",
      recordingTooShort: "ضبط بسیار کوتاه بود. دکمه را دست‌کم ۱٫۵ ثانیه نگه دارید.",
      microphoneUnsupported: "ضبط با میکروفن در این مرورگر یا اتصال پشتیبانی نمی‌شود.",
      microphoneDenied: "اجازهٔ دسترسی به میکروفن داده نشد. دسترسی را فعال کرده و دوباره تلاش کنید.",
      recordingFailed: "آماده‌سازی فایل ضبط‌شده برای تحلیل ممکن نشد.",
      recordedClip: "ضبط میکروفن",
      cancelRecording: "لغو ضبط",
      recordingCancelled: "ضبط لغو شد.",
      microphonePrivacy: "ضبط فقط در همین مرورگر باقی می‌ماند و بارگذاری نمی‌شود.",
      settingsTitle: "۲. تنظیمات تحلیل",
      resetDefaults: "بازگشت به پیش‌فرض",
      defaultsRestored: "تنظیمات پیشنهادی بازیابی شد.",
      autoAnalysisHint: "هر قطعهٔ جدید با تنظیمات پیشنهادی به‌طور خودکار تحلیل می‌شود و سپس پخش آغاز می‌گردد.",
      autoAnalyzing: "قطعه بارگذاری شد؛ تحلیل خودکار آغاز شده است…",
      autoplayBlocked: "تحلیل آماده است. برای شروع پخش، دکمهٔ قطعهٔ اصلی را بزنید.",
      mode: "نوع ضبط",
      melody: "تک‌نوازی / ملودی غالب",
      balanced: "ضبط متعادل",
      mix: "گروه‌نوازی متراکم / میکس کامل",
      extractMelody: "استخراج ملودی غالب و ساده‌شده",
      extractMelodyHelp: "یک خط ملودیک پیوسته و قابل زمزمه را دنبال می‌کند و همهٔ نت‌های هم‌زمان را هم‌ارزش در نظر نمی‌گیرد.",
      detail: "جزئیات ملودی",
      stable: "پایدار",
      detailed: "پرجزئیات / تزیینات",
      register: "محدودهٔ صوتی ترجیحی ملودی",
      registerAuto: "خودکار",
      registerUpper: "ترجیح صدای بالاتر",
      registerNeutral: "بدون ترجیح محدوده",
      registerLower: "ترجیح صدای پایین‌تر",
      minPitch: "کمترین فرکانس (Hz)",
      maxPitch: "بیشترین فرکانس (Hz)",
      help: "برای استخراج دقیق‌تر توالی نت‌ها، تک‌نوازی یا قطعه‌ای با ملودی غالب مناسب‌تر است. در حالت میکس کامل، وزن بیشتری به نمایهٔ طیفی داده می‌شود.",
      analyze: "تحلیل قطعه",
      play: "▶ قطعهٔ اصلی",
      pause: "❚❚ قطعهٔ اصلی",
      melodyPlay: "♫ ملودی ساده‌شده",
      melodyPause: "❚❚ ملودی ساده‌شده",
      stop: "■ توقف",
      ready: "برای شروع یک قطعه بارگذاری کنید.",
      decoding: "در حال خواندن فایل صوتی…",
      readyFile: "آمادهٔ تحلیل است.",
      analyzing: "در حال تحلیل نت‌ها و گام‌های محتمل…",
      complete: "تحلیل کامل شد.",
      error: "تحلیل کامل نشد.",
      timelineTitle: "۳. خط زمانی قطعه و نت‌های تشخیص‌داده‌شده",
      timelineHint: "امکان جابه‌جایی",
      rawMaterial: "مواد صوتی تشخیص‌داده‌شده",
      structural: "ملودی انتخاب‌شده",
      ornament: "تزیین / نت کوتاه",
      resultTitle: "۴. بهترین تطبیق گام",
      resultEmpty: "پس از تحلیل، بهترین گزینه‌های گام در اینجا نمایش داده می‌شوند.",
      tonic: "نت پایه",
      alternatives: "گزینه‌های دیگر",
      currentTitle: "پخش زنده",
      currentNote: "نت",
      frequency: "فرکانس",
      deviation: "کوک",
      noteRole: "نقش",
      structuralRole: "نت ساختاری",
      ornamentRole: "تزیین / نت گذر",
      noNote: "—",
      disclaimer: "این نتیجه یک تطبیق آموزشی است و تشخیص قطعی دستگاه یا گوشه نیست. کوک اجرایی، نت‌های متغیر، نقش ملودیک و مدگردی ممکن است به تفسیر تخصصی نیاز داشته باشند.",
      fileTooLong: "فقط ۲۰ دقیقهٔ نخست تحلیل و متحرک‌سازی می‌شود.",
      noVoiced: "نت ملودیک پایداری پیدا نشد. حالت میکس کامل یا یک ضبط واضح‌تر را امتحان کنید.",
      unsupported: "مرورگر نتوانست فایل صوتی انتخاب‌شده را بخواند.",
      badge: "تشخیص",
      centsHigh: "{n} سنت بالاتر",
      centsLow: "{n} سنت پایین‌تر",
      centered: "هم‌مرکز",
      events: "{n} نت ملودی · {o} تزیین",
      confidence: "تطبیق",
      pitchEnergy: "{n}٪ انرژی روی نت‌های گام",
      visualizerTitle: "نمایشگر طیفی دایره‌ای",
      visualizerEnabled: "نمایش هالهٔ طیفی شعاعی",
      visualizerHelp: "پایهٔ هر میله روی دایره ثابت می‌ماند و میله همراه موسیقی به‌صورت شعاعی به بیرون رشد می‌کند.",
      visualizerMode: "حالت نمایشگر",
      visualizerHybrid: "ترکیب طیف و زیرایی",
      visualizerPitch: "تأکید بر ردهٔ نت",
      visualizerSpectrum: "طیف کامل فرکانسی",
      visualizerMelody: "تمرکز بر ملودی",
      visualizerMinimal: "کمینه",
      visualizerSensitivity: "حساسیت",
      visualizerSmoothing: "نرمی حرکت",
      visualizerLength: "بیشینهٔ طول میله",
      visualizerBackground: "شدت پس‌زمینه",
      visualizerMelodyEmphasis: "تأکید ملودی",
      candidateHint: "برای اعمال روی دایره یک گزینه را انتخاب کنید",
      manualOverride: "انتخاب دستی گام و نت پایه",
      manualScale: "گام",
      manualTonic: "نت پایه",
      applyManual: "اعمال تفسیر",
      whyResult: "چرا این نتیجه؟",
      automaticChoice: "پیشنهاد خودکار",
      userChoice: "تفسیر انتخاب‌شدهٔ کاربر",
      strongMatch: "نتیجهٔ قوی",
      moderateMatch: "نتیجهٔ متوسط",
      closeCandidates: "گزینه‌های بسیار نزدیک",
      lowConfidence: "نتیجه با اطمینان پایین",
      closeMessage: "گزینه‌های نخست بسیار نزدیک‌اند. ملودی ساده‌شده را بشنوید و تفسیری را انتخاب کنید که با قطعه سازگارتر است.",
      strongMessage: "تفسیر نخست به‌روشنی از گزینه‌های دیگر جدا شده است.",
      moderateMessage: "نتیجه محتمل است، اما بررسی گزینه‌های دیگر مفید است.",
      lowMessage: "قطعه نشانه‌های مدال متمایز کافی برای انتخاب خودکار مطمئن ندارد.",
      metricPitch: "پوشش نت‌های گام",
      metricTonic: "شواهد نت پایه",
      metricEnding: "پایان جمله‌ها",
      metricCharacteristic: "فاصله‌های شاخص",
      metricCadence: "الگوهای فرود",
      metricOutside: "انرژی خارج از گام",
      matchLabel: "تطبیق",
      selectedLabel: "انتخاب‌شده",
      autoLabel: "خودکار",
      explanationTemplate: "در تفسیر {scale} با نت پایهٔ {tonic}، {coverage}٪ از شواهد ساختاری ملودی روی نت‌های گام قرار می‌گیرد. شواهد نت پایه {tonicEvidence}٪، شواهد پایان جمله {endingEvidence}٪ و شواهد فاصله‌های شاخص {characteristicEvidence}٪ است. {gapText}",
      gapClose: "گزینهٔ بعدی تنها {gap} واحد درصد فاصله دارد؛ بنابراین نتیجه واقعاً مبهم است.",
      gapClear: "این گزینه {gap} واحد درصد از گزینهٔ بعدی جلوتر است.",
    },
  };


  const MODAL_SIGNATURES = {
    Shur: { emphasis: [[3, 1], [6, 0.78], [16, 0.42]], cadences: [[3, 0, 1], [6, 3, 0.72], [16, 14, 0.38]] },
    nava: { emphasis: [[4, 0.72], [6, 0.92], [17, 0.62]], cadences: [[4, 0, 0.72], [6, 4, 0.58], [17, 14, 0.42]] },
    segah: { emphasis: [[4, 1], [7, 0.92], [17, 0.56]], cadences: [[4, 0, 0.95], [7, 4, 0.82], [17, 14, 0.42]] },
    homayoun: { emphasis: [[3, 0.96], [8, 1], [16, 0.55]], cadences: [[3, 0, 0.92], [8, 3, 0.78], [16, 14, 0.38]] },
    esfahan: { emphasis: [[4, 0.82], [6, 0.9], [17, 0.62], [22, 0.45]], cadences: [[4, 0, 0.78], [6, 4, 0.62], [22, 17, 0.42]] },
    chahargah: { emphasis: [[3, 0.86], [8, 1], [17, 0.7], [22, 0.58]], cadences: [[3, 0, 0.8], [8, 3, 0.72], [22, 17, 0.5]] },
    mahur: { emphasis: [[4, 0.72], [8, 0.86], [18, 0.62], [22, 0.54]], cadences: [[4, 0, 0.68], [8, 4, 0.58], [22, 18, 0.46]] },
    minor: { emphasis: [[6, 0.9], [10, 0.72], [16, 0.56], [20, 0.68]], cadences: [[2, 0, 0.82], [20, 0, 0.72], [10, 6, 0.48]] },
  };
  const ANALYZER_DEFAULTS = Object.freeze({
    mode: "balanced",
    extractMelody: true,
    detail: 65,
    registerPreference: "auto",
    minFrequency: 70,
    maxFrequency: 1400,
    visualizerEnabled: true,
    visualizerMode: "hybrid",
    visualizerSensitivity: 75,
    visualizerSmoothing: 72,
    visualizerLength: 62,
    visualizerBackground: 35,
    visualizerMelodyEmphasis: 82,
  });

  const state = {
    file: null,
    objectUrl: null,
    audioBuffer: null,
    worker: null,
    analysis: null,
    candidates: [],
    allCandidates: [],
    selectedCandidate: null,
    automaticCandidate: null,
    selectionSource: "automatic",
    modalFeatures: null,
    activeEventIndex: -1,
    animationFrame: 0,
    waveformBase: null,
    timelineBase: null,
    labelBindings: [],
    lastHighlightedLabel: null,
    currentLanguage: "en",
    analysisLimitSeconds: 20 * 60,
    cursorTime: 0,
    playbackKind: "none",
    inputOrigin: "file",
    playbackGain: 1,
    analysisGain: 1,
    loadGeneration: 0,
    autoCloseTimer: 0,
    analysisRequest: null,
    recorder: {
      supported: Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder),
      permissionReady: false,
      permissionState: "unknown",
      permissionPreparing: false,
      ignoreRelease: false,
      holdActive: false,
      starting: false,
      recording: false,
      cancelled: false,
      finalizing: false,
      stream: null,
      mediaRecorder: null,
      chunks: [],
      mimeType: "",
      startedAt: 0,
      duration: 0,
      timerId: 0,
      maximumTimerId: 0,
      meterFrame: 0,
      meterContext: null,
      meterSource: null,
      meterAnalyser: null,
      meterData: null,
      minimumSeconds: 1.5,
      maximumSeconds: 45,
    },
    visualizer: {
      canvas: null,
      context2d: null,
      originalContext: null,
      originalSource: null,
      originalAnalyser: null,
      originalGain: null,
      originalCompressor: null,
      melodyAnalyser: null,
      frequencyData: null,
      smoothedBars: [],
      barCount: 96,
      mappingKey: "",
      pitchClassBins: null,
      reducedMotion: false,
    },
    bufferPlayer: {
      source: null,
      context: null,
      startContextTime: 0,
      offset: 0,
      playing: false,
      loop: false,
      automatic: false,
      interactionHandler: null,
    },
    melodyPlayer: {
      context: null,
      oscillator: null,
      gain: null,
      startContextTime: 0,
      offset: 0,
      playing: false,
    },
  };

  const elements = {
    launch: $("#openAudioAnalyzer"),
    quickFinder: $("#quickScaleFinder"),
    quickFinderButton: $("#quickScaleFinderButton"),
    quickFinderLabel: $("#quickScaleFinderLabel"),
    quickFinderHelp: $("#quickScaleFinderHelp"),
    quickFinderPanel: $("#quickScaleFinderPanel"),
    quickFinderClose: null,
    quickRecordButton: $("#quickScaleFinderButton"),
    quickRecordingFeedback: $("#quickRecordingFeedback"),
    quickRecordingStatus: $("#quickRecordingStatus"),
    quickRecordingTimer: $("#quickRecordingTimer"),
    quickMicrophoneLevel: $("#quickMicrophoneLevel"),
    quickCancelRecording: $("#quickCancelRecordingButton"),
    quickUpload: null,
    quickOpenAnalyzer: null,
    drawer: $("#audioAnalyzerDrawer"),
    backdrop: $("#audioAnalyzerBackdrop"),
    close: $("#closeAudioAnalyzer"),
    fileInput: $("#trackFileInput"),
    dropZone: $("#audioDropZone"),
    recordButton: $("#holdToRecordButton"),
    recordButtonLabel: $("#holdToRecordLabel"),
    recordButtonHelp: $("#holdToRecordHelp"),
    recordingFeedback: $("#recordingFeedback"),
    recordingStatus: $("#recordingStatus"),
    recordingTimer: $("#recordingTimer"),
    microphoneLevel: $("#microphoneLevel"),
    cancelRecording: $("#cancelRecordingButton"),
    trackSummary: $("#trackSummary"),
    trackName: $("#trackName"),
    trackMeta: $("#trackMeta"),
    mode: $("#analysisMode"),
    extractMelody: $("#extractPredominantMelody"),
    detail: $("#melodicDetail"),
    detailValue: $("#melodicDetailValue"),
    register: $("#melodyRegister"),
    minFrequency: $("#analysisMinFrequency"),
    maxFrequency: $("#analysisMaxFrequency"),
    resetDefaults: $("#resetAnalyzerDefaults"),
    analyze: $("#analyzeTrackButton"),
    playPause: $("#trackPlayPauseButton"),
    melodyPlayPause: $("#melodyPlayPauseButton"),
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
    ambiguityNotice: $("#ambiguityNotice"),
    ambiguityTitle: $("#ambiguityTitle"),
    ambiguityText: $("#ambiguityText"),
    candidateComparison: $("#candidateComparison"),
    manualScale: $("#manualScale"),
    manualTonic: $("#manualTonic"),
    applyManual: $("#applyManualCandidate"),
    explanation: $("#analysisExplanationText"),
    spectrumCanvas: $("#radialSpectrumCanvas"),
    visualizerEnabled: $("#visualizerEnabled"),
    visualizerMode: $("#visualizerMode"),
    visualizerSensitivity: $("#visualizerSensitivity"),
    visualizerSensitivityValue: $("#visualizerSensitivityValue"),
    visualizerSmoothing: $("#visualizerSmoothing"),
    visualizerSmoothingValue: $("#visualizerSmoothingValue"),
    visualizerLength: $("#visualizerLength"),
    visualizerLengthValue: $("#visualizerLengthValue"),
    visualizerBackground: $("#visualizerBackground"),
    visualizerBackgroundValue: $("#visualizerBackgroundValue"),
    visualizerMelodyEmphasis: $("#visualizerMelodyEmphasis"),
    visualizerMelodyEmphasisValue: $("#visualizerMelodyEmphasisValue"),
    nowNote: $("#nowPlayingNote"),
    nowFrequency: $("#nowPlayingFrequency"),
    nowDeviation: $("#nowPlayingDeviation"),
    nowRole: $("#nowPlayingRole"),
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

  function recorderButtons() {
    return [elements.recordButton, elements.quickRecordButton].filter(Boolean);
  }

  function recordingFeedbackElements() {
    return [elements.recordingFeedback, elements.quickRecordingFeedback].filter(Boolean);
  }

  function recordingStatusElements() {
    return [elements.recordingStatus, elements.quickRecordingStatus].filter(Boolean);
  }

  function recordingTimerElements() {
    return [elements.recordingTimer, elements.quickRecordingTimer].filter(Boolean);
  }

  function microphoneLevelElements() {
    return [elements.microphoneLevel, elements.quickMicrophoneLevel].filter(Boolean);
  }

  function cancelRecordingButtons() {
    return [elements.cancelRecording, elements.quickCancelRecording].filter(Boolean);
  }

  function microphonePermissionIsReady() {
    return Boolean(state.recorder.permissionReady);
  }

  function updateMicrophonePrompt() {
    const ready = microphonePermissionIsReady();
    const dictionary = I18N[state.currentLanguage] || I18N.en;

    if (elements.quickFinderLabel) {
      elements.quickFinderLabel.textContent = ready ? dictionary.quickFindScale : dictionary.enableMicrophone;
    }
    if (elements.quickFinderHelp) {
      elements.quickFinderHelp.textContent = ready ? dictionary.quickHoldHint : dictionary.microphoneSetupHint;
    }
    if (elements.recordButtonLabel) {
      elements.recordButtonLabel.textContent = ready ? dictionary.holdToRecord : dictionary.enableMicrophone;
    }
    if (elements.recordButtonHelp) {
      elements.recordButtonHelp.textContent = ready ? dictionary.releaseToAnalyze : dictionary.microphoneSetupHint;
    }

    recorderButtons().forEach((button) => {
      button.classList.toggle("permission-needed", !ready);
      button.classList.toggle("permission-ready", ready);
      button.dataset.microphoneReady = ready ? "true" : "false";
      button.setAttribute("aria-label", ready ? dictionary.microphoneReadyHold : dictionary.enableMicrophone);
    });
  }

  function setMicrophonePermissionState(permissionState) {
    const normalized = ["granted", "denied", "prompt", "unknown"].includes(permissionState)
      ? permissionState
      : "unknown";
    state.recorder.permissionState = normalized;
    state.recorder.permissionReady = normalized === "granted";
    if (normalized === "granted") {
      try { window.localStorage.setItem("pms-microphone-permission-ready", "1"); } catch (_) {}
    } else if (normalized === "denied") {
      try { window.localStorage.removeItem("pms-microphone-permission-ready"); } catch (_) {}
    }
    updateMicrophonePrompt();
  }

  async function detectMicrophonePermissionState() {
    if (!state.recorder.supported) return;
    let storedReady = false;
    try { storedReady = window.localStorage.getItem("pms-microphone-permission-ready") === "1"; } catch (_) {}

    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: "microphone" });
        setMicrophonePermissionState(permission.state);
        permission.addEventListener?.("change", () => {
          setMicrophonePermissionState(permission.state);
          if (permission.state === "granted") {
            updateRecordingFeedback(t("microphonePermissionReady"), 0, "ready");
          }
        });
        return;
      }
    } catch (_) {
      /* Safari versions may reject microphone permission queries. */
    }

    if (storedReady) setMicrophonePermissionState("granted");
    else setMicrophonePermissionState("unknown");
  }

  async function prepareMicrophonePermission() {
    const recorder = state.recorder;
    if (!recorder.supported || recorder.permissionPreparing || recorder.recording || recorder.starting) return;

    recorder.permissionPreparing = true;
    recorder.ignoreRelease = true;
    setRecorderButtonsState("arming", false);
    updateRecordingFeedback(t("requestingMicrophone"), 0, "arming");
    updateButtons();

    try {
      await ensureOriginalVisualizerGraph().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 1 },
          echoCancellation: { ideal: false },
          noiseSuppression: { ideal: false },
          autoGainControl: { ideal: false },
        },
        video: false,
      });
      stopMediaStream(stream);
      setMicrophonePermissionState("granted");
      setRecorderButtonsState("ready", false);
      updateRecordingFeedback(t("microphonePermissionReady"), 0, "ready");
      openQuickFinder();
      window.setTimeout(() => {
        if (!recorder.recording && !recorder.starting && !recorder.finalizing) {
          closeQuickFinder({ restoreFocus: false, cancelRecording: false });
        }
      }, 2600);
    } catch (error) {
      console.error("Microphone permission setup failed:", error);
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      setMicrophonePermissionState(denied ? "denied" : "unknown");
      setRecorderButtonsState("ready", false);
      updateRecordingFeedback(t(denied ? "microphoneDenied" : "recordingFailed"), 0, "error");
    } finally {
      recorder.permissionPreparing = false;
      window.setTimeout(() => { recorder.ignoreRelease = false; }, 120);
      updateButtons();
    }
  }

  function setRecorderButtonsState(mode = "ready", pressed = false) {
    recorderButtons().forEach((button) => {
      button.classList.remove("arming", "recording", "processing");
      if (["arming", "recording", "processing"].includes(mode)) button.classList.add(mode);
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
    });
    if (["arming", "recording", "processing"].includes(mode)) openQuickFinder();
  }

  function setCancelRecordingVisible(visible) {
    cancelRecordingButtons().forEach((button) => {
      button.hidden = !visible;
    });
  }

  function isQuickFinderOpen() {
    return Boolean(elements.quickFinderPanel && !elements.quickFinderPanel.hidden && elements.quickFinderPanel.classList.contains("open"));
  }

  function openQuickFinder() {
    if (!elements.quickFinderPanel || !elements.quickFinderButton) return;
    elements.quickFinderPanel.hidden = false;
    elements.quickFinder?.classList.add("status-open");
    requestAnimationFrame(() => elements.quickFinderPanel.classList.add("open"));
  }

  function closeQuickFinder({ restoreFocus = false, cancelRecording = true } = {}) {
    if (!elements.quickFinderPanel || !elements.quickFinderButton) return;
    if (cancelRecording && (state.recorder.recording || state.recorder.starting)) {
      cancelMicrophoneRecording({ announce: false });
    }
    elements.quickFinderPanel.classList.remove("open");
    elements.quickFinder?.classList.remove("status-open");
    window.setTimeout(() => {
      if (!elements.quickFinderPanel.classList.contains("open")) elements.quickFinderPanel.hidden = true;
    }, 190);
    if (restoreFocus) elements.quickFinderButton.focus({ preventScroll: true });
  }

  function bindQuickFinderEvents() {
    if (!elements.quickFinderButton) return;
    const suppressSelection = (event) => event.preventDefault();
    ["selectstart", "dragstart", "contextmenu"].forEach((type) => {
      elements.quickFinderButton.addEventListener(type, suppressSelection);
    });
    /* The button itself is the hold-to-record control. A synthetic click after
       pointer release must not open a menu or trigger a second action. */
    elements.quickFinderButton.addEventListener("click", (event) => event.preventDefault());
  }


  function initialize() {
    applyAnalyzerDefaults({ announce: false });
    bindEvents();
    setLanguage($("#languageSelector")?.value || "en");
    setStatus(t("ready"), 0);
    populateManualTonicOptions();
    initializeVisualizer();
    initializeMicrophoneRecorder();
    detectMicrophonePermissionState().catch(console.warn);
    resizeCanvases();
    drawEmptyCanvas(elements.waveform, "Waveform");
    drawEmptyCanvas(elements.timeline, "Detected notes");
    updateButtons();
  }

  function bindEvents() {
    elements.launch.addEventListener("click", () => {
      closeQuickFinder({ restoreFocus: false, cancelRecording: false });
      openDrawer();
    });
    bindQuickFinderEvents();
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
      elements.fileInput.value = "";
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

    bindMicrophoneRecorderEvents();

    elements.analyze.addEventListener("click", () => analyzeTrack({ autoStart: false }));
    elements.resetDefaults?.addEventListener("click", () => applyAnalyzerDefaults({ announce: true }));
    elements.playPause.addEventListener("click", toggleOriginalPlayback);
    elements.melodyPlayPause?.addEventListener("click", toggleMelodyPlayback);
    elements.stop.addEventListener("click", stopPlayback);
    elements.seek.addEventListener("input", seekFromSlider);
    elements.detail?.addEventListener("input", () => {
      elements.detailValue.textContent = `${Math.round(Number(elements.detail.value) || 0)}%`;
    });

    elements.candidateList?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-candidate-index]");
      if (!button) return;
      const candidate = state.candidates[Number(button.dataset.candidateIndex)];
      if (candidate) selectCandidate(candidate, "user");
    });
    elements.applyManual?.addEventListener("click", applyManualInterpretation);
    [elements.waveform, elements.timeline].forEach((canvas) => {
      canvas?.addEventListener("click", seekFromCanvas);
    });
    bindVisualizerControls();

    elements.audio.addEventListener("play", () => {
      stopMelodyPlayback(false);
      ensureOriginalVisualizerGraph().catch((error) => console.warn("Visualizer audio graph:", error));
      state.playbackKind = "original";
      elements.playPause.textContent = t("pause");
      elements.playPause.classList.add("playing");
      elements.melodyPlayPause?.classList.remove("playing");
      startPlaybackAnimation();
    });
    elements.audio.addEventListener("pause", () => {
      elements.playPause.textContent = t("play");
      elements.playPause.classList.remove("playing");
      if (state.playbackKind === "original") state.cursorTime = elements.audio.currentTime || 0;
      if (!state.melodyPlayer.playing) clearRadialSpectrum();
    });
    elements.audio.addEventListener("ended", () => {
      elements.playPause.textContent = t("play");
      elements.playPause.classList.remove("playing");
      state.playbackKind = "none";
      state.cursorTime = 0;
      clearCircleHighlights();
      clearRadialSpectrum();
      state.activeEventIndex = -1;
    });
    elements.audio.addEventListener("loadedmetadata", () => {
      elements.totalTime.textContent = formatTime(elements.audio.duration || 0);
    });

    $("#languageSelector")?.addEventListener("change", (event) => {
      setLanguage(event.target.value);
      if (state.candidates.length) renderResults(state.candidates, state.selectedCandidate);
      rebuildLabelBindings();
    });

    /* The existing app rotates on circle click and redraws on scale change. */
    $("#circleContainer")?.addEventListener("click", () => setTimeout(rebuildLabelBindings, 0));
    $("#scaleSelector")?.addEventListener("change", () => setTimeout(rebuildLabelBindings, 0));

    window.addEventListener("resize", debounce(() => {
      resizeCanvases();
      resizeSpectrumCanvas();
      if (state.audioBuffer) drawWaveform(state.audioBuffer);
      if (state.analysis) drawTimeline(state.analysis.events, state.analysis.rawEvents || []);
    }, 120));

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (elements.drawer.classList.contains("open")) closeDrawer();
      else if (isQuickFinderOpen()) closeQuickFinder();
    });
  }

  function initializeMicrophoneRecorder() {
    const buttons = recorderButtons();
    if (!buttons.length) return;
    if (!state.recorder.supported) {
      buttons.forEach((button) => {
        button.disabled = true;
        button.classList.add("unsupported");
      });
      updateRecordingFeedback(t("microphoneUnsupported"), 0, "error");
      return;
    }
    updateMicrophonePrompt();
    updateRecordingFeedback(microphonePermissionIsReady() ? t("microphonePermissionReady") : t("enableMicrophone"), 0, "ready");
  }

  function bindMicrophoneRecorderEvents() {
    const bindRecordButton = (button) => {
      if (!button) return;

      const suppressSelection = (event) => event.preventDefault();
      ["selectstart", "dragstart", "contextmenu"].forEach((type) => {
        button.addEventListener(type, suppressSelection);
      });

      button.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();

        if (!microphonePermissionIsReady()) {
          state.recorder.holdActive = false;
          state.recorder.ignoreRelease = true;
          prepareMicrophonePermission();
          return;
        }

        button.setPointerCapture?.(event.pointerId);
        state.recorder.holdActive = true;
        beginMicrophoneRecording();
      });

      const releasePointer = (event) => {
        if (state.recorder.ignoreRelease || state.recorder.permissionPreparing) return;
        if (event?.pointerId != null && button.hasPointerCapture?.(event.pointerId)) {
          button.releasePointerCapture?.(event.pointerId);
        }
        if (!state.recorder.holdActive && !state.recorder.recording && !state.recorder.starting) return;
        state.recorder.holdActive = false;
        finishMicrophoneRecording();
      };

      button.addEventListener("pointerup", releasePointer);
      button.addEventListener("pointercancel", releasePointer);
      button.addEventListener("lostpointercapture", () => {
        if (state.recorder.holdActive) return;
        finishMicrophoneRecording();
      });

      button.addEventListener("keydown", (event) => {
        if ((event.key !== " " && event.key !== "Enter") || event.repeat) return;
        event.preventDefault();
        if (!microphonePermissionIsReady()) {
          state.recorder.holdActive = false;
          state.recorder.ignoreRelease = true;
          prepareMicrophonePermission();
          return;
        }
        state.recorder.holdActive = true;
        beginMicrophoneRecording();
      });
      button.addEventListener("keyup", (event) => {
        if (event.key !== " " && event.key !== "Enter") return;
        event.preventDefault();
        if (state.recorder.ignoreRelease || state.recorder.permissionPreparing) return;
        state.recorder.holdActive = false;
        finishMicrophoneRecording();
      });
      button.addEventListener("blur", () => {
        if (!state.recorder.recording && !state.recorder.starting) return;
        state.recorder.holdActive = false;
        finishMicrophoneRecording();
      });
    };

    recorderButtons().forEach(bindRecordButton);
    cancelRecordingButtons().forEach((button) => {
      button.addEventListener("click", () => cancelMicrophoneRecording({ announce: true }));
    });

    /* Pointer capture normally provides the release event. These document-level
       fallbacks also protect the first-use permission flow, where a browser
       permission prompt can interrupt the original pointer sequence. */
    window.addEventListener("pointerup", () => {
      if (state.recorder.ignoreRelease || state.recorder.permissionPreparing) return;
      if (!state.recorder.holdActive) return;
      state.recorder.holdActive = false;
      finishMicrophoneRecording();
    }, true);
    window.addEventListener("blur", () => {
      if (!state.recorder.recording && !state.recorder.starting) return;
      state.recorder.holdActive = false;
      if (state.recorder.recording) finishMicrophoneRecording();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden || (!state.recorder.recording && !state.recorder.starting)) return;
      state.recorder.holdActive = false;
      if (state.recorder.recording) finishMicrophoneRecording();
    });
  }

  async function beginMicrophoneRecording() {
    const recorder = state.recorder;
    if (!recorder.supported || recorder.starting || recorder.recording || state.worker) return;
    if (!microphonePermissionIsReady()) {
      prepareMicrophonePermission();
      return;
    }

    /* Unlock the persistent Web Audio graph while this trusted pointer/keyboard
       gesture is active. The decoded recording can then start automatically
       after asynchronous analysis without relying on HTML-media autoplay. */
    const playbackUnlock = ensureOriginalVisualizerGraph().catch((error) => {
      console.warn("Could not unlock automatic recording playback:", error);
    });

    clearTimeout(state.autoCloseTimer);
    state.autoCloseTimer = 0;
    recorder.starting = true;
    recorder.cancelled = false;
    recorder.finalizing = false;
    setRecorderButtonsState("arming", true);
    updateRecordingFeedback(t("requestingMicrophone"), 0, "arming");
    updateButtons();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: 1 },
          echoCancellation: { ideal: false },
          noiseSuppression: { ideal: false },
          autoGainControl: { ideal: false },
        },
        video: false,
      });
      await playbackUnlock;
      setMicrophonePermissionState("granted");

      if (!recorder.holdActive || recorder.cancelled) {
        stopMediaStream(stream);
        recorder.starting = false;
        setRecorderButtonsState("ready", false);
        updateRecordingFeedback(t("recordReady"), 0, "ready");
        updateButtons();
        return;
      }

      stopPlayback();
      recorder.stream = stream;
      recorder.mimeType = selectRecordingMimeType();
      recorder.chunks = [];
      recorder.duration = 0;
      recorder.mediaRecorder = recorder.mimeType
        ? new MediaRecorder(stream, { mimeType: recorder.mimeType })
        : new MediaRecorder(stream);

      recorder.mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) recorder.chunks.push(event.data);
      });
      recorder.mediaRecorder.addEventListener("error", (event) => {
        console.error("MediaRecorder error:", event.error || event);
        recorder.cancelled = true;
        finalizeMicrophoneRecording().catch(console.error);
      });
      recorder.mediaRecorder.addEventListener("stop", () => {
        finalizeMicrophoneRecording().catch((error) => {
          console.error(error);
          updateRecordingFeedback(t("recordingFailed"), 0, "error");
        });
      }, { once: true });

      recorder.startedAt = performance.now();
      recorder.starting = false;
      recorder.recording = true;
      recorder.mediaRecorder.start(200);
      setRecorderButtonsState("recording", true);
      setCancelRecordingVisible(true);
      updateRecordingFeedback(t("recordingNow"), 0, "recording");
      startRecordingClock();
      try {
        await startMicrophoneMeter(stream);
      } catch (meterError) {
        console.warn("Microphone level meter was unavailable:", meterError);
      }
      recorder.maximumTimerId = window.setTimeout(() => {
        updateRecordingFeedback(t("recordingMaximum"), recorder.maximumSeconds, "processing");
        recorder.holdActive = false;
        finishMicrophoneRecording();
      }, recorder.maximumSeconds * 1000);
      updateButtons();
    } catch (error) {
      console.error("Microphone access failed:", error);
      recorder.starting = false;
      recorder.recording = false;
      recorder.holdActive = false;
      cleanupMicrophoneResources();
      setRecorderButtonsState("ready", false);
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      if (denied) setMicrophonePermissionState("denied");
      updateRecordingFeedback(t(denied ? "microphoneDenied" : "recordingFailed"), 0, "error");
      updateButtons();
    }
  }

  function finishMicrophoneRecording() {
    const recorder = state.recorder;
    recorder.holdActive = false;
    if (recorder.starting) return;
    if (!recorder.recording || !recorder.mediaRecorder) return;
    recorder.duration = Math.max(0, (performance.now() - recorder.startedAt) / 1000);
    clearTimeout(recorder.maximumTimerId);
    recorder.maximumTimerId = 0;
    stopRecordingClock();
    stopMicrophoneMeter();
    setRecorderButtonsState("processing", false);
    updateRecordingFeedback(t("decoding"), recorder.duration, "processing");
    try {
      if (recorder.mediaRecorder.state !== "inactive") recorder.mediaRecorder.stop();
    } catch (error) {
      console.warn("Could not stop MediaRecorder cleanly:", error);
      finalizeMicrophoneRecording().catch(console.error);
    }
  }

  function cancelMicrophoneRecording({ announce = true } = {}) {
    const recorder = state.recorder;
    recorder.cancelled = true;
    recorder.holdActive = false;
    clearTimeout(recorder.maximumTimerId);
    recorder.maximumTimerId = 0;
    stopRecordingClock();
    stopMicrophoneMeter();

    if (recorder.mediaRecorder && recorder.mediaRecorder.state !== "inactive") {
      try {
        recorder.mediaRecorder.stop();
      } catch (error) {
        console.warn("Could not cancel MediaRecorder cleanly:", error);
        cleanupMicrophoneResources();
      }
    } else {
      cleanupMicrophoneResources();
    }

    recorder.starting = false;
    recorder.recording = false;
    setRecorderButtonsState("ready", false);
    setCancelRecordingVisible(false);
    if (announce) updateRecordingFeedback(t("recordingCancelled"), 0, "ready");
    else updateRecordingFeedback(t("recordReady"), 0, "ready");
    updateButtons();
  }

  async function finalizeMicrophoneRecording() {
    const recorder = state.recorder;
    if (recorder.finalizing) return;
    recorder.finalizing = true;
    const wasCancelled = recorder.cancelled;
    const duration = recorder.duration || Math.max(0, (performance.now() - recorder.startedAt) / 1000);
    const chunks = recorder.chunks.slice();
    const mimeType = recorder.mediaRecorder?.mimeType || recorder.mimeType || chunks[0]?.type || "audio/webm";

    recorder.recording = false;
    recorder.starting = false;
    cleanupMicrophoneResources();
    setRecorderButtonsState("ready", false);
    setCancelRecordingVisible(false);
    updateButtons();

    try {
      if (wasCancelled) {
        recorder.cancelled = false;
        updateRecordingFeedback(t("recordingCancelled"), 0, "ready");
        return;
      }
      if (duration < recorder.minimumSeconds || !chunks.length) {
        updateRecordingFeedback(t("recordingTooShort"), duration, "error");
        return;
      }

      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) {
        updateRecordingFeedback(t("recordingFailed"), 0, "error");
        return;
      }

      const extension = recordingExtension(mimeType);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `${t("recordedClip").replace(/\s+/g, "-").toLowerCase()}-${stamp}.${extension}`;
      const file = new File([blob], filename, { type: mimeType, lastModified: Date.now() });
      updateRecordingFeedback(t("decoding"), duration, "processing");
      await loadFile(file, { origin: "microphone" });
    } finally {
      recorder.finalizing = false;
      updateButtons();
    }
  }

  function selectRecordingMimeType() {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/webm",
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported?.(type)) || "";
  }

  function recordingExtension(mimeType) {
    const normalized = String(mimeType).toLowerCase();
    if (normalized.includes("ogg")) return "ogg";
    if (normalized.includes("mp4") || normalized.includes("m4a")) return "m4a";
    if (normalized.includes("wav")) return "wav";
    return "webm";
  }

  function startRecordingClock() {
    stopRecordingClock();
    const update = () => {
      if (!state.recorder.recording) return;
      const elapsed = Math.max(0, (performance.now() - state.recorder.startedAt) / 1000);
      state.recorder.duration = elapsed;
      recordingTimerElements().forEach((timer) => {
        timer.textContent = formatRecordingTime(elapsed);
        timer.setAttribute("datetime", `PT${elapsed.toFixed(1)}S`);
      });
    };
    update();
    state.recorder.timerId = window.setInterval(update, 100);
  }

  function stopRecordingClock() {
    clearInterval(state.recorder.timerId);
    state.recorder.timerId = 0;
  }

  async function startMicrophoneMeter(stream) {
    stopMicrophoneMeter();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !stream) return;
    const context = new AudioContextClass();
    await context.resume().catch(() => {});
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    state.recorder.meterContext = context;
    state.recorder.meterSource = source;
    state.recorder.meterAnalyser = analyser;
    state.recorder.meterData = new Uint8Array(analyser.fftSize);

    const draw = () => {
      if (!state.recorder.recording || !state.recorder.meterAnalyser) return;
      state.recorder.meterAnalyser.getByteTimeDomainData(state.recorder.meterData);
      let sum = 0;
      for (const sample of state.recorder.meterData) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / state.recorder.meterData.length);
      const level = clamp(Math.pow(rms * 4.4, 0.72) * 100, 0, 100);
      microphoneLevelElements().forEach((meter) => {
        meter.style.width = `${level}%`;
        meter.classList.toggle("clipping", level > 92);
      });
      state.recorder.meterFrame = requestAnimationFrame(draw);
    };
    draw();
  }

  function stopMicrophoneMeter() {
    cancelAnimationFrame(state.recorder.meterFrame);
    state.recorder.meterFrame = 0;
    try { state.recorder.meterSource?.disconnect(); } catch (_) {}
    state.recorder.meterSource = null;
    state.recorder.meterAnalyser = null;
    state.recorder.meterData = null;
    if (state.recorder.meterContext) {
      state.recorder.meterContext.close().catch(() => {});
      state.recorder.meterContext = null;
    }
    microphoneLevelElements().forEach((meter) => {
      meter.style.width = "0%";
      meter.classList.remove("clipping");
    });
  }

  function cleanupMicrophoneResources() {
    stopRecordingClock();
    stopMicrophoneMeter();
    clearTimeout(state.recorder.maximumTimerId);
    state.recorder.maximumTimerId = 0;
    stopMediaStream(state.recorder.stream);
    state.recorder.stream = null;
    state.recorder.mediaRecorder = null;
    state.recorder.chunks = [];
    state.recorder.mimeType = "";
  }

  function stopMediaStream(stream) {
    stream?.getTracks?.().forEach((track) => track.stop());
  }

  function updateRecordingFeedback(message, seconds = 0, mode = "ready") {
    recordingStatusElements().forEach((status) => {
      status.textContent = message;
    });
    recordingFeedbackElements().forEach((feedback) => {
      feedback.dataset.state = mode;
    });
    if (!state.recorder.recording) {
      recordingTimerElements().forEach((timer) => {
        timer.textContent = seconds > 0 ? formatRecordingTime(seconds) : "0:00";
        timer.setAttribute("datetime", `PT${Math.max(0, seconds).toFixed(1)}S`);
      });
    }

    if (["arming", "recording", "processing", "error", "playing"].includes(mode)) {
      openQuickFinder();
      if (mode === "error") {
        window.setTimeout(() => {
          if (!state.recorder.recording && !state.recorder.starting && !state.recorder.finalizing) {
            closeQuickFinder({ restoreFocus: false, cancelRecording: false });
          }
        }, 4200);
      }
    } else if (!state.recorder.recording && !state.recorder.starting) {
      window.setTimeout(() => {
        if (!state.recorder.recording && !state.recorder.starting && !state.recorder.finalizing) {
          closeQuickFinder({ restoreFocus: false, cancelRecording: false });
        }
      }, 900);
    }
  }

  function formatRecordingTime(seconds) {
    const tenths = Math.floor(Math.max(0, seconds) * 10);
    const minutes = Math.floor(tenths / 600);
    const wholeSeconds = Math.floor((tenths % 600) / 10);
    const decimal = tenths % 10;
    return `${minutes}:${String(wholeSeconds).padStart(2, "0")}.${decimal}`;
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
    elements.playPause.textContent = (state.bufferPlayer.playing || !elements.audio.paused) ? dictionary.pause : dictionary.play;
    if (elements.melodyPlayPause) {
      elements.melodyPlayPause.textContent = state.melodyPlayer.playing
        ? dictionary.melodyPause
        : dictionary.melodyPlay;
    }
    elements.stop.textContent = dictionary.stop;
    if (elements.detailValue && elements.detail) {
      elements.detailValue.textContent = `${Math.round(Number(elements.detail.value) || 0)}%`;
    }
    updateVisualizerControlLabels();
    populateManualTonicOptions();

    if (!state.file) setStatus(dictionary.ready, 0);
    updateMicrophonePrompt();
    elements.nowNote.textContent ||= dictionary.noNote;
    elements.nowFrequency.textContent ||= dictionary.noNote;
    elements.nowDeviation.textContent ||= dictionary.noNote;
    if (elements.nowRole) elements.nowRole.textContent ||= dictionary.noNote;
    if (state.bufferPlayer.playing && state.bufferPlayer.automatic) {
      updateRecordingFeedback(dictionary.loopingPlayback, 0, "playing");
    } else if (!state.recorder.recording && !state.recorder.starting) {
      const recorderMessage = state.recorder.supported
        ? (microphonePermissionIsReady() ? dictionary.microphonePermissionReady : dictionary.enableMicrophone)
        : dictionary.microphoneUnsupported;
      updateRecordingFeedback(recorderMessage, 0, state.recorder.supported ? "ready" : "error");
    }
  }

  function openDrawer() {
    elements.drawer.classList.add("open");
    elements.backdrop.classList.add("open");
    elements.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("analyzer-lock-scroll");
    setTimeout(() => elements.close.focus(), 80);
  }

  function closeDrawer({ restoreFocus = true } = {}) {
    if (state.recorder.recording || state.recorder.starting) {
      cancelMicrophoneRecording({ announce: false });
    }
    clearTimeout(state.autoCloseTimer);
    state.autoCloseTimer = 0;
    elements.drawer.classList.remove("analysis-complete");
    elements.drawer.classList.remove("open");
    elements.backdrop.classList.remove("open");
    elements.drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("analyzer-lock-scroll");
    if (restoreFocus) elements.launch.focus({ preventScroll: true });
  }

  function scheduleAutomaticDrawerClose(delay = 1350) {
    clearTimeout(state.autoCloseTimer);
    elements.drawer.classList.add("analysis-complete");
    state.autoCloseTimer = window.setTimeout(() => {
      closeDrawer({ restoreFocus: false });
    }, delay);
  }

  async function loadFile(file, { origin = "file" } = {}) {
    if (state.recorder.recording || state.recorder.starting || state.recorder.stream) {
      cancelMicrophoneRecording({ announce: false });
    }
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name);
    if (!isAudio) {
      setStatus(t("unsupported"), 0, true);
      return;
    }

    const generation = ++state.loadGeneration;
    clearTimeout(state.autoCloseTimer);
    state.autoCloseTimer = 0;
    terminateWorker();
    resetPlaybackForNewTrack();
    state.audioBuffer = null;
    state.file = null;
    state.inputOrigin = origin === "microphone" ? "microphone" : "file";
    state.playbackGain = 1;
    state.analysisGain = 1;
    state.analysisRequest = null;
    elements.trackSummary.classList.remove("visible");
    elements.trackName.textContent = "";
    elements.trackMeta.textContent = "";
    drawEmptyCanvas(elements.waveform, "Waveform");
    drawEmptyCanvas(elements.timeline, "Detected notes");
    resetAnalysisResult();
    applyAnalyzerDefaults({ announce: false });
    state.file = file;
    setStatus(t("decoding"), 5);
    updateButtons();

    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = URL.createObjectURL(file);
    elements.audio.src = state.objectUrl;
    elements.audio.load();

    try {
      const bytes = await file.arrayBuffer();
      if (generation !== state.loadGeneration) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      state.audioBuffer = await context.decodeAudioData(bytes.slice(0));
      await context.close();
      if (generation !== state.loadGeneration) return;

      const levelProfile = measureAudioBufferLevel(state.audioBuffer);
      if (state.inputOrigin === "microphone") {
        state.playbackGain = calculateAdaptivePlaybackGain(levelProfile);
        state.analysisGain = clamp(state.playbackGain, 0.7, 3.5);
      }
      applyOriginalPlaybackGain();

      elements.trackSummary.classList.add("visible");
      elements.trackName.textContent = file.name;
      const durationNote = state.audioBuffer.duration > state.analysisLimitSeconds ? ` · ${t("fileTooLong")}` : "";
      elements.trackMeta.textContent = `${formatTime(state.audioBuffer.duration)} · ${formatBytes(file.size)}${durationNote}`;
      elements.totalTime.textContent = formatTime(state.audioBuffer.duration);
      state.cursorTime = 0;
      elements.seek.value = "0";
      drawWaveform(state.audioBuffer);
      drawEmptyCanvas(elements.timeline, "Detected notes");
      setStatus(t("autoAnalyzing"), 0);
      updateButtons();
      await analyzeTrack({ autoStart: true, loadGeneration: generation });
    } catch (error) {
      if (generation !== state.loadGeneration) return;
      console.error(error);
      state.audioBuffer = null;
      setStatus(t("unsupported"), 0, true);
      updateButtons();
    }
  }

  async function analyzeTrack({ autoStart = false, loadGeneration = state.loadGeneration } = {}) {
    if (!state.audioBuffer || !state.file) return;

    terminateWorker();
    stopPlayback();
    resetAnalysisResult(true);
    const request = { autoStart, loadGeneration };
    state.analysisRequest = request;
    setStatus(t("analyzing"), 1);
    elements.analyze.disabled = true;

    const mode = elements.mode.value;
    const extractMelody = elements.extractMelody?.checked !== false;
    const detail = clamp(Number(elements.detail?.value) || 65, 0, 100);
    const registerPreference = elements.register?.value || "auto";
    const minFrequency = clamp(Number(elements.minFrequency.value), 40, 400);
    const maxFrequency = clamp(Number(elements.maxFrequency.value), Math.max(300, minFrequency + 100), 3000);
    elements.minFrequency.value = String(minFrequency);
    elements.maxFrequency.value = String(maxFrequency);

    try {
      const downsampled = downsampleToMono(
        state.audioBuffer,
        12000,
        state.analysisLimitSeconds,
        state.analysisGain
      );

      const worker = new Worker("src/audio-analyzer.worker.js");
      state.worker = worker;

      worker.onmessage = (event) => {
        const message = event.data || {};
        if (message.type === "progress") {
          setStatus(t("analyzing"), message.progress);
        } else if (message.type === "complete") {
          state.worker = null;
          if (request.loadGeneration === state.loadGeneration) {
            handleAnalysisComplete(message.result, mode, request);
          }
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
          options: {
            mode,
            extractMelody,
            detail,
            registerPreference,
            minFrequency,
            maxFrequency,
          },
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
    if (state.inputOrigin === "microphone") updateRecordingFeedback(t("recordingFailed"), 0, "error");
    elements.analyze.disabled = false;
    updateButtons();
  }

  function handleAnalysisComplete(result, mode, request = { autoStart: false }) {
    state.analysis = result;
    elements.analyze.disabled = false;

    if (!result.events?.length || result.voicedFrameCount < 4) {
      setStatus(t("noVoiced"), 0, true);
      if (state.inputOrigin === "microphone") updateRecordingFeedback(t("noVoiced"), 0, "error");
      updateButtons();
      return;
    }

    state.candidates = matchScales(result, mode);
    state.automaticCandidate = state.candidates[0] || null;
    selectCandidate(state.automaticCandidate, "automatic");
    drawTimeline(result.events, result.rawEvents || []);
    setStatus(
      `${t("complete")} ${t("events", {
        n: result.events.length,
        o: result.ornamentCount || 0,
      })}`,
      100
    );
    updateButtons();

    if (request.autoStart && request.loadGeneration === state.loadGeneration) {
      startAutomaticPlaybackAndClose();
    }
  }

  async function startAutomaticPlaybackAndClose() {
    state.cursorTime = 0;
    if (Number.isFinite(elements.audio.duration)) elements.audio.currentTime = 0;
    let started = false;
    try {
      if (state.inputOrigin === "microphone") {
        started = await startBufferPlayback(0, { loop: true, automatic: true });
      } else {
        await elements.audio.play();
        started = !elements.audio.paused;
      }
    } catch (error) {
      console.info("Automatic playback was blocked by the browser:", error);
    }
    if (!started) {
      setStatus(t("autoplayBlocked"), 100);
      updateRecordingFeedback(t("autoplayBlocked"), 0, "error");
      elements.playPause.textContent = t("play");
      elements.playPause.classList.remove("playing");
      elements.playPause.focus({ preventScroll: true });
      return;
    }

    if (state.inputOrigin === "microphone") {
      updateRecordingFeedback(t("loopingPlayback"), 0, "playing");
      window.setTimeout(() => closeQuickFinder({ restoreFocus: false, cancelRecording: false }), 2100);
    }
    scheduleAutomaticDrawerClose(2200);
  }

  function applyAnalyzerDefaults({ announce = false } = {}) {
    if (elements.mode) elements.mode.value = ANALYZER_DEFAULTS.mode;
    if (elements.extractMelody) elements.extractMelody.checked = ANALYZER_DEFAULTS.extractMelody;
    if (elements.detail) elements.detail.value = String(ANALYZER_DEFAULTS.detail);
    if (elements.register) elements.register.value = ANALYZER_DEFAULTS.registerPreference;
    if (elements.minFrequency) elements.minFrequency.value = String(ANALYZER_DEFAULTS.minFrequency);
    if (elements.maxFrequency) elements.maxFrequency.value = String(ANALYZER_DEFAULTS.maxFrequency);
    if (elements.visualizerEnabled) elements.visualizerEnabled.checked = ANALYZER_DEFAULTS.visualizerEnabled;
    if (elements.visualizerMode) elements.visualizerMode.value = ANALYZER_DEFAULTS.visualizerMode;
    if (elements.visualizerSensitivity) elements.visualizerSensitivity.value = String(ANALYZER_DEFAULTS.visualizerSensitivity);
    if (elements.visualizerSmoothing) elements.visualizerSmoothing.value = String(ANALYZER_DEFAULTS.visualizerSmoothing);
    if (elements.visualizerLength) elements.visualizerLength.value = String(ANALYZER_DEFAULTS.visualizerLength);
    if (elements.visualizerBackground) elements.visualizerBackground.value = String(ANALYZER_DEFAULTS.visualizerBackground);
    if (elements.visualizerMelodyEmphasis) elements.visualizerMelodyEmphasis.value = String(ANALYZER_DEFAULTS.visualizerMelodyEmphasis);
    if (elements.detailValue) elements.detailValue.textContent = `${ANALYZER_DEFAULTS.detail}%`;
    updateVisualizerControlLabels();
    state.visualizer.smoothedBars = [];
    state.visualizer.mappingKey = "";
    if (announce && !state.worker) setStatus(t("defaultsRestored"), state.analysis ? 100 : 0);
  }

  function resetPlaybackForNewTrack() {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
    stopBufferPlayback({ resetCursor: true, preserveTime: false });
    elements.audio.pause();
    stopMelodyPlayback(true);
    state.playbackKind = "none";
    state.cursorTime = 0;
    elements.playPause.textContent = t("play");
    elements.playPause.classList.remove("playing");
    if (elements.melodyPlayPause) {
      elements.melodyPlayPause.textContent = t("melodyPlay");
      elements.melodyPlayPause.classList.remove("playing");
    }
    state.activeEventIndex = -1;
    elements.audio.removeAttribute("src");
    elements.audio.load();
    elements.seek.value = "0";
    elements.currentTime.textContent = "0:00";
    elements.totalTime.textContent = "0:00";
    clearCircleHighlights();
    clearRadialSpectrum();
    state.visualizer.frequencyData = null;
    state.visualizer.pitchClassBins = null;
    state.visualizer.smoothedBars = [];
    state.waveformBase = null;
    state.timelineBase = null;
    updateNowPlaying(null);
  }

  function getSelectedTonicBin() {
    if (state.selectedCandidate) return mod(state.selectedCandidate.tonicBin, 24);
    if (typeof rotation !== "undefined") return mod(Math.round(-rotation / 15), 24);
    return 0;
  }

  function pitchClassToCircleSlot(pitchClass) {
    return mod(Math.round(pitchClass) - getSelectedTonicBin(), 24);
  }

  function circleSlotToPitchClass(slot) {
    return mod(getSelectedTonicBin() + Math.round(slot), 24);
  }

  function matchScales(result, mode) {
    if (typeof scaleData === "undefined") {
      throw new Error("The existing scaleData object is not available.");
    }

    const usingExtractedMelody = result.extractMelody !== false;
    const blend = usingExtractedMelody
      ? mode === "mix"
        ? { f0: 0.66, spectral: 0.34 }
        : mode === "balanced"
          ? { f0: 0.82, spectral: 0.18 }
          : { f0: 0.92, spectral: 0.08 }
      : mode === "melody"
        ? { f0: 0.86, spectral: 0.14 }
        : mode === "mix"
          ? { f0: 0.4, spectral: 0.6 }
          : { f0: 0.68, spectral: 0.32 };

    const profile = normalizeProfile(
      result.f0Histogram.map((value, index) =>
        value * blend.f0 + result.spectralHistogram[index] * blend.spectral
      )
    );
    const opening = normalizeProfile(result.openingHistogram || new Array(24).fill(0));
    const ending = normalizeProfile(result.endingHistogram || new Array(24).fill(0));
    const features = deriveModalFeatures(result, opening, ending);
    state.modalFeatures = features;

    const candidates = [];
    Object.entries(scaleData).forEach(([scaleName, definition]) => {
      const offsets = definition.angles.map((angle) => mod(Math.round(angle / 15), 24));
      for (let tonicBin = 0; tonicBin < 24; tonicBin += 1) {
        candidates.push(scoreScaleCandidate(scaleName, tonicBin, offsets, profile, features));
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    candidates.forEach((candidate) => {
      const logistic = 1 / (1 + Math.exp(-8.2 * (candidate.score - 0.5)));
      candidate.matchPercent = Math.round(clamp(22 + logistic * 76, 0, 98));
      candidate.confidence = candidate.matchPercent;
    });
    state.allCandidates = candidates;

    const diverse = [];
    for (const candidate of candidates) {
      const nearDuplicate = diverse.some((existing) =>
        existing.scaleName === candidate.scaleName &&
        circularDistance(existing.tonicBin, candidate.tonicBin, 24) <= 1
      );
      if (nearDuplicate) continue;
      diverse.push(candidate);
      if (diverse.length >= 6) break;
    }
    return diverse;
  }

  function renderResults(candidates, selectedCandidate = null) {
    const automatic = candidates[0];
    const selected = selectedCandidate || state.selectedCandidate || automatic;
    if (!automatic || !selected) return;

    elements.resultPlaceholder.style.display = "none";
    elements.bestMatch.classList.add("visible");
    const tonicName = pitchClassName(selected.tonicBin);
    const sourceLabel = state.selectionSource === "automatic" ? t("automaticChoice") : t("userChoice");
    elements.bestMatchName.textContent = `${scaleDisplayName(selected.scaleName)} · ${tonicName}`;
    elements.bestMatchSubtitle.textContent = `${sourceLabel} · ${t("pitchEnergy", { n: Math.round(selected.exactCoverage * 100) })}`;
    elements.confidenceText.textContent = `${selected.matchPercent}%`;
    elements.confidenceRing.style.setProperty("--confidence-angle", `${selected.matchPercent * 3.6}deg`);

    renderAmbiguityNotice(candidates);
    elements.candidateList.innerHTML = "";
    const bestPercent = automatic.matchPercent;
    candidates.forEach((candidate, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "candidate-item";
      button.dataset.candidateIndex = String(index);
      button.setAttribute("role", "radio");
      const isSelected = sameCandidate(candidate, selected);
      button.setAttribute("aria-checked", String(isSelected));
      if (isSelected) button.classList.add("selected");
      if (index > 0 && bestPercent - candidate.matchPercent <= 7) button.classList.add("close-candidate");
      const evidence = `${t("metricTonic")}: ${Math.round(candidate.tonicEvidence * 100)}% · ${t("metricEnding")}: ${Math.round(candidate.endingEvidence * 100)}%`;
      button.innerHTML = `
        <span class="candidate-rank">${index + 1}</span>
        <span class="candidate-label">
          <strong>${escapeHtml(scaleDisplayName(candidate.scaleName))} · ${escapeHtml(pitchClassName(candidate.tonicBin))}</strong>
          <small>${escapeHtml(evidence)}${index === 0 ? ` · ${escapeHtml(t("autoLabel"))}` : ""}</small>
        </span>
        <span class="candidate-score">${candidate.matchPercent}%</span>
      `;
      elements.candidateList.appendChild(button);
    });

    renderCandidateComparison(selected);
    renderAnalysisExplanation(selected, candidates);
    syncManualControls(selected);

    elements.badge.classList.add("visible");
    elements.badgeText.textContent = `${state.selectionSource === "automatic" ? t("badge") : t("selectedLabel")}: ${scaleDisplayName(selected.scaleName)} · ${tonicName} (${selected.matchPercent}%)`;
    if (elements.quickFinderHelp) {
      elements.quickFinderHelp.textContent = `${state.selectionSource === "automatic" ? t("badge") : t("selectedLabel")}: ${scaleDisplayName(selected.scaleName)} · ${tonicName}`;
    }
    elements.quickFinderButton?.classList.add("has-result");
  }

  function deriveModalFeatures(result, opening, ending) {
    const events = result.events || [];
    const structuralProfile = new Array(24).fill(0);
    const sustainedProfile = new Array(24).fill(0);
    const phraseEndProfile = new Array(24).fill(0);
    const transitionMatrix = Array.from({ length: 24 }, () => new Array(24).fill(0));
    const duration = Math.max(0.001, result.duration || 0);
    let transitionTotal = 0;

    events.forEach((noteEvent, index) => {
      const next = events[index + 1];
      const roleWeight = noteEvent.role === "ornament" ? 0.26 : 1;
      const baseWeight = Math.pow(Math.max(0.025, noteEvent.duration || 0), 0.88) *
        clamp(noteEvent.confidence || 0.5, 0.12, 1) * roleWeight;
      structuralProfile[noteEvent.pitchClass] += baseWeight;
      sustainedProfile[noteEvent.pitchClass] += baseWeight * Math.pow(Math.max(0.04, noteEvent.duration || 0), 0.55);

      const gap = next ? Math.max(0, next.startTime - noteEvent.endTime) : 1;
      const phraseEnding = Boolean(noteEvent.phraseEnding) || !next || gap >= 0.22 ||
        ((noteEvent.duration || 0) >= 0.42 && gap >= 0.09) || noteEvent.endTime >= duration * 0.96;
      noteEvent.phraseEnding = phraseEnding;
      if (phraseEnding) phraseEndProfile[noteEvent.pitchClass] += baseWeight * (1 + Math.min(1.2, gap * 1.5));

      if (next && gap < 1.15) {
        const nextRoleWeight = next.role === "ornament" ? 0.38 : 1;
        const weight = Math.sqrt(baseWeight * Math.max(0.02, next.duration || 0) * nextRoleWeight);
        transitionMatrix[noteEvent.pitchClass][next.pitchClass] += weight;
        transitionTotal += weight;
      }
    });

    normalizeArrayInPlace(structuralProfile);
    normalizeArrayInPlace(sustainedProfile);
    normalizeArrayInPlace(phraseEndProfile);
    if (transitionTotal > 0) {
      transitionMatrix.forEach((row) => {
        for (let i = 0; i < row.length; i += 1) row[i] /= transitionTotal;
      });
    }

    const finalStructural = [...events].reverse().find((noteEvent) => noteEvent.role !== "ornament") || events[events.length - 1] || null;
    return {
      structuralProfile,
      sustainedProfile,
      phraseEndProfile: phraseEndProfile.some(Boolean) ? phraseEndProfile : normalizeProfile(ending),
      openingProfile: normalizeProfile(opening),
      endingProfile: normalizeProfile(ending),
      transitionMatrix,
      finalPitchClass: finalStructural?.pitchClass ?? null,
      phraseCount: events.filter((noteEvent) => noteEvent.phraseEnding).length,
    };
  }

  function scoreScaleCandidate(scaleName, tonicBin, offsets, profile, features) {
    const notes = offsets.map((offset) => mod(tonicBin + offset, 24));
    const noteSet = new Set(notes);
    let exactCoverage = 0;
    let neighboringCoverage = 0;
    let occupiedDegrees = 0;

    notes.forEach((note) => {
      exactCoverage += profile[note];
      neighboringCoverage += 0.5 * (profile[mod(note - 1, 24)] + profile[mod(note + 1, 24)]);
      if (profile[note] > 0.011) occupiedDegrees += 1;
    });

    let outsideEnergy = 0;
    let transitionFit = 0;
    profile.forEach((value, bin) => {
      if (!noteSet.has(bin)) outsideEnergy += value;
    });
    features.transitionMatrix.forEach((row, from) => {
      row.forEach((value, to) => {
        if (noteSet.has(from) && noteSet.has(to)) transitionFit += value;
      });
    });

    const uniform = 1 / 24;
    const tonicProminence = clamp((features.structuralProfile[tonicBin] - uniform * 0.55) / 0.16, 0, 1);
    const sustainedTonic = clamp(features.sustainedProfile[tonicBin] * 5.7, 0, 1);
    const phraseEndEvidence = clamp(features.phraseEndProfile[tonicBin] * 5.4, 0, 1);
    const openingEvidence = clamp(features.openingProfile[tonicBin] * 4.2, 0, 1);
    const finalEvidence = features.finalPitchClass === tonicBin
      ? 1
      : features.finalPitchClass != null && noteSet.has(features.finalPitchClass)
        ? 0.28
        : 0;
    const tonicEvidence = clamp(
      tonicProminence * 0.3 + sustainedTonic * 0.24 + phraseEndEvidence * 0.3 + finalEvidence * 0.16,
      0,
      1
    );
    const endingEvidence = clamp(phraseEndEvidence * 0.72 + finalEvidence * 0.28, 0, 1);

    const signature = MODAL_SIGNATURES[scaleName] || { emphasis: [], cadences: [] };
    let characteristicRaw = 0;
    let characteristicWeight = 0;
    signature.emphasis.forEach(([offset, weight]) => {
      characteristicRaw += features.structuralProfile[mod(tonicBin + offset, 24)] * weight;
      characteristicWeight += weight;
    });
    const characteristicEvidence = characteristicWeight
      ? clamp((characteristicRaw / characteristicWeight) * 7.2, 0, 1)
      : 0;

    let cadenceRaw = 0;
    let cadenceWeight = 0;
    signature.cadences.forEach(([fromOffset, toOffset, weight]) => {
      cadenceRaw += features.transitionMatrix[mod(tonicBin + fromOffset, 24)][mod(tonicBin + toOffset, 24)] * weight;
      cadenceWeight += weight;
    });
    let generalResolution = 0;
    offsets.filter((offset) => offset !== 0).forEach((offset) => {
      generalResolution += features.transitionMatrix[mod(tonicBin + offset, 24)][tonicBin];
    });
    const cadenceEvidence = clamp(
      (cadenceWeight ? cadenceRaw / cadenceWeight : 0) * 22 + generalResolution * 12,
      0,
      1
    );

    const degreeCoverage = occupiedDegrees / Math.max(1, offsets.length);
    const score =
      exactCoverage * 0.46 +
      neighboringCoverage * 0.035 +
      tonicEvidence * 0.1 +
      endingEvidence * 0.09 +
      characteristicEvidence * 0.085 +
      cadenceEvidence * 0.07 +
      transitionFit * 0.045 +
      degreeCoverage * 0.045 +
      openingEvidence * 0.02 -
      outsideEnergy * 0.12;

    return {
      scaleName,
      tonicBin,
      score,
      offsets,
      notes,
      exactCoverage,
      outsideEnergy,
      degreeCoverage,
      tonicEvidence,
      endingEvidence,
      characteristicEvidence,
      cadenceEvidence,
      transitionFit,
      openingEvidence,
      profile,
    };
  }

  function normalizeArrayInPlace(values) {
    const sum = values.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);
    if (sum <= 0) return values;
    for (let i = 0; i < values.length; i += 1) values[i] = Math.max(0, Number(values[i]) || 0) / sum;
    return values;
  }

  function sameCandidate(left, right) {
    return Boolean(left && right && left.scaleName === right.scaleName && left.tonicBin === right.tonicBin);
  }

  function selectCandidate(candidate, source = "user") {
    if (!candidate) return;
    state.selectedCandidate = candidate;
    state.selectionSource = source;
    state.visualizer.smoothedBars = [];
    state.visualizer.mappingKey = "";
    applyCandidateToCircle(candidate);
    renderResults(state.candidates, candidate);
    highlightEvent(state.activeEventIndex >= 0 ? state.analysis?.events?.[state.activeEventIndex] : null);
  }

  function applyManualInterpretation() {
    if (!state.analysis || !elements.manualScale || !elements.manualTonic) return;
    const scaleName = elements.manualScale.value;
    const tonicBin = Number(elements.manualTonic.value);
    const candidate = state.allCandidates.find((item) => item.scaleName === scaleName && item.tonicBin === tonicBin);
    if (candidate) selectCandidate(candidate, "manual");
  }

  function populateManualTonicOptions() {
    if (!elements.manualTonic) return;
    const selected = elements.manualTonic.value;
    elements.manualTonic.innerHTML = "";
    for (let pitchClass = 0; pitchClass < 24; pitchClass += 1) {
      const option = document.createElement("option");
      option.value = String(pitchClass);
      option.textContent = pitchClassName(pitchClass);
      elements.manualTonic.appendChild(option);
    }
    if (selected) elements.manualTonic.value = selected;
  }

  function syncManualControls(candidate) {
    if (!candidate) return;
    if (elements.manualScale) elements.manualScale.value = candidate.scaleName;
    if (elements.manualTonic) elements.manualTonic.value = String(candidate.tonicBin);
  }

  function renderAmbiguityNotice(candidates) {
    if (!elements.ambiguityNotice || candidates.length < 1) return;
    const best = candidates[0];
    const second = candidates[1] || best;
    const gap = Math.max(0, best.matchPercent - second.matchPercent);
    let titleKey = "moderateMatch";
    let messageKey = "moderateMessage";
    let className = "";
    if (best.matchPercent < 52) {
      titleKey = "lowConfidence";
      messageKey = "lowMessage";
      className = "low";
    } else if (gap <= 7) {
      titleKey = "closeCandidates";
      messageKey = "closeMessage";
    } else if (gap >= 12 && best.matchPercent >= 68) {
      titleKey = "strongMatch";
      messageKey = "strongMessage";
      className = "strong";
    }
    elements.ambiguityNotice.className = `ambiguity-notice visible ${className}`.trim();
    elements.ambiguityTitle.textContent = t(titleKey);
    elements.ambiguityText.textContent = `${t(messageKey)} ${scaleDisplayName(best.scaleName)} · ${pitchClassName(best.tonicBin)} ${best.matchPercent}% / ${scaleDisplayName(second.scaleName)} · ${pitchClassName(second.tonicBin)} ${second.matchPercent}%.`;
  }

  function renderCandidateComparison(candidate) {
    if (!elements.candidateComparison || !candidate) return;
    const metrics = [
      [t("metricPitch"), candidate.exactCoverage],
      [t("metricTonic"), candidate.tonicEvidence],
      [t("metricEnding"), candidate.endingEvidence],
      [t("metricCharacteristic"), candidate.characteristicEvidence],
      [t("metricCadence"), candidate.cadenceEvidence],
      [t("metricOutside"), candidate.outsideEnergy],
    ];
    elements.candidateComparison.classList.add("visible");
    elements.candidateComparison.innerHTML = `<div class="candidate-metrics">${metrics.map(([label, value]) => {
      const percent = Math.round(clamp(value, 0, 1) * 100);
      return `<div class="candidate-metric"><small>${escapeHtml(label)}</small><strong>${percent}%</strong><div class="metric-bar"><i style="width:${percent}%"></i></div></div>`;
    }).join("")}</div>`;
  }

  function renderAnalysisExplanation(candidate, candidates) {
    if (!elements.explanation || !candidate) return;
    const candidateIndex = Math.max(0, candidates.findIndex((item) => sameCandidate(item, candidate)));
    const comparison = candidateIndex === 0 ? candidates[1] : candidates[0];
    const gap = comparison ? Math.abs(candidate.matchPercent - comparison.matchPercent) : candidate.matchPercent;
    const gapText = gap <= 7
      ? t("gapClose", { gap })
      : t("gapClear", { gap });
    elements.explanation.textContent = t("explanationTemplate", {
      scale: scaleDisplayName(candidate.scaleName),
      tonic: pitchClassName(candidate.tonicBin),
      coverage: Math.round(candidate.exactCoverage * 100),
      tonicEvidence: Math.round(candidate.tonicEvidence * 100),
      endingEvidence: Math.round(candidate.endingEvidence * 100),
      characteristicEvidence: Math.round(candidate.characteristicEvidence * 100),
      gapText,
    });
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
    setTimeout(() => {
      rebuildLabelBindings();
      if (state.analysis) drawTimeline(state.analysis.events, state.analysis.rawEvents || []);
    }, 0);
  }

  function rebuildLabelBindings() {
    if (typeof scaleData === "undefined" || typeof rotation === "undefined") return;
    const selectedScale = $("#scaleSelector")?.value;
    if (!selectedScale || !scaleData[selectedScale]) return;

    const tonicBin = mod(Math.round(-rotation / 15), 24);
    const offsets = scaleData[selectedScale].angles.map((angle) => mod(Math.round(angle / 15), 24));
    const labels = $$("#outerScale .dynamic-label");
    labels.forEach((label) => label.classList.add("analysis-selected-scale"));

    state.labelBindings = offsets.map((offset, index) => ({
      pitchClass: mod(tonicBin + offset, 24),
      label: labels[index] || null,
      degreeIndex: index,
    }));
  }

  function disarmAutomaticLoopInterruption() {
    const handler = state.bufferPlayer.interactionHandler;
    if (handler) document.removeEventListener("pointerdown", handler, true);
    state.bufferPlayer.interactionHandler = null;
  }

  function stopBufferPlayback({ resetCursor = false, preserveTime = true } = {}) {
    const player = state.bufferPlayer;
    if (player.playing && preserveTime) state.cursorTime = getPlaybackTime();
    disarmAutomaticLoopInterruption();
    if (player.source) {
      player.source.onended = null;
      try { player.source.stop(); } catch (_) { /* already stopped */ }
      try { player.source.disconnect(); } catch (_) { /* already disconnected */ }
    }
    state.bufferPlayer = {
      source: null,
      context: state.visualizer.originalContext,
      startContextTime: 0,
      offset: resetCursor ? 0 : state.cursorTime,
      playing: false,
      loop: false,
      automatic: false,
      interactionHandler: null,
    };
    if (resetCursor) state.cursorTime = 0;
    if (state.playbackKind === "original" && elements.audio.paused) state.playbackKind = "none";
    elements.playPause.textContent = t("play");
    elements.playPause.classList.remove("playing");
  }

  function armAutomaticLoopInterruption() {
    disarmAutomaticLoopInterruption();
    const handler = (event) => {
      if (!state.bufferPlayer.playing || !state.bufferPlayer.automatic) return;
      if (event.target.closest("#trackPlayPauseButton, #trackStopButton, #analysisSeek")) return;
      stopPlayback();
      updateRecordingFeedback(t("recordReady"), 0, "ready");
    };
    state.bufferPlayer.interactionHandler = handler;
    window.setTimeout(() => {
      if (state.bufferPlayer.playing && state.bufferPlayer.automatic && state.bufferPlayer.interactionHandler === handler) {
        document.addEventListener("pointerdown", handler, true);
      }
    }, 320);
  }

  async function startBufferPlayback(offsetSeconds = 0, { loop = true, automatic = false } = {}) {
    if (!state.audioBuffer) return false;
    const context = await ensureOriginalVisualizerGraph();
    if (!context || !state.visualizer.originalGain) return false;

    stopMelodyPlayback(false);
    elements.audio.pause();
    stopBufferPlayback({ resetCursor: false, preserveTime: false });
    applyOriginalPlaybackGain();

    const duration = Math.max(0.001, state.audioBuffer.duration || 0);
    const offset = clamp(Number(offsetSeconds) || 0, 0, Math.max(0, duration - 0.001));
    const source = context.createBufferSource();
    source.buffer = state.audioBuffer;
    source.loop = Boolean(loop);
    source.loopStart = 0;
    source.loopEnd = duration;
    source.connect(state.visualizer.originalGain);
    const startContextTime = context.currentTime + 0.035;
    source.start(startContextTime, offset);

    state.bufferPlayer = {
      source,
      context,
      startContextTime,
      offset,
      playing: true,
      loop: Boolean(loop),
      automatic: Boolean(automatic),
      interactionHandler: null,
    };
    state.playbackKind = "original";
    state.cursorTime = offset;
    elements.playPause.textContent = t("pause");
    elements.playPause.classList.add("playing");
    elements.melodyPlayPause?.classList.remove("playing");

    source.onended = () => {
      if (state.bufferPlayer.source !== source || source.loop) return;
      state.cursorTime = 0;
      stopBufferPlayback({ resetCursor: true, preserveTime: false });
      updatePlaybackFrame();
      clearCircleHighlights();
      clearRadialSpectrum();
    };

    if (automatic) armAutomaticLoopInterruption();
    startPlaybackAnimation();
    return true;
  }

  async function toggleOriginalPlayback() {
    if (!state.file || !state.analysis) return;
    try {
      if (state.inputOrigin === "microphone" && state.audioBuffer) {
        if (state.bufferPlayer.playing) {
          stopBufferPlayback({ resetCursor: false, preserveTime: true });
          clearRadialSpectrum();
          return;
        }
        await startBufferPlayback(state.cursorTime, { loop: true, automatic: false });
        return;
      }

      if (!elements.audio.paused && state.playbackKind === "original") {
        elements.audio.pause();
        return;
      }

      stopBufferPlayback({ resetCursor: false, preserveTime: false });
      stopMelodyPlayback(false);
      const maximumAudioTime = Number.isFinite(elements.audio.duration)
        ? Math.max(0, elements.audio.duration - 0.001)
        : state.cursorTime;
      elements.audio.currentTime = clamp(state.cursorTime, 0, maximumAudioTime);
      await elements.audio.play();
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : String(error), 0, true);
    }
  }

  async function toggleMelodyPlayback() {
    if (!state.analysis?.events?.length) return;
    if (state.melodyPlayer.playing) {
      stopMelodyPlayback(false);
      return;
    }

    elements.audio.pause();
    stopBufferPlayback({ resetCursor: false, preserveTime: true });
    await startMelodyPlayback(state.cursorTime);
  }

  async function startMelodyPlayback(offsetSeconds = 0) {
    stopMelodyPlayback(false);
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setStatus("Web Audio is not available in this browser.", 0, true);
      return;
    }

    const duration = state.analysis?.duration || 0;
    const offset = clamp(Number(offsetSeconds) || 0, 0, Math.max(0, duration - 0.001));
    const context = new AudioContextClass();
    await context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    oscillator.connect(gain);
    connectMelodyVisualizer(context, gain);

    const startContextTime = context.currentTime + 0.045;
    const events = state.analysis.events
      .filter((noteEvent) => noteEvent.endTime > offset)
      .slice(0, 7000);
    let lastScheduledTime = startContextTime;

    for (const noteEvent of events) {
      const eventStart = startContextTime + Math.max(0, noteEvent.startTime - offset);
      const eventEnd = startContextTime + Math.max(0.018, noteEvent.endTime - offset);
      if (eventEnd <= startContextTime || eventEnd <= eventStart) continue;

      const start = Math.max(lastScheduledTime, eventStart);
      const end = Math.max(start + 0.018, eventEnd);
      const attack = Math.min(0.018, Math.max(0.004, noteEvent.duration * 0.16));
      const release = Math.min(0.025, Math.max(0.006, noteEvent.duration * 0.2));
      const level = clamp(
        0.055 + Math.sqrt(Math.max(0, noteEvent.amplitude || 0)) * 0.18,
        0.045,
        noteEvent.role === "ornament" ? 0.105 : 0.135
      );

      oscillator.frequency.setValueAtTime(
        clamp(Number(noteEvent.frequency) || 220, 35, 5000),
        start
      );
      gain.gain.setValueAtTime(0.0001, Math.max(lastScheduledTime, start - 0.003));
      gain.gain.linearRampToValueAtTime(level, start + attack);
      gain.gain.setValueAtTime(level, Math.max(start + attack, end - release));
      gain.gain.linearRampToValueAtTime(0.0001, end);
      lastScheduledTime = end;
    }

    oscillator.start(startContextTime);
    oscillator.stop(startContextTime + Math.max(0.1, duration - offset) + 0.12);

    state.melodyPlayer = {
      context,
      oscillator,
      gain,
      startContextTime,
      offset,
      playing: true,
    };
    state.playbackKind = "melody";
    elements.melodyPlayPause.textContent = t("melodyPause");
    elements.melodyPlayPause.classList.add("playing");
    elements.playPause.classList.remove("playing");

    oscillator.onended = () => {
      if (state.melodyPlayer.oscillator !== oscillator) return;
      state.cursorTime = 0;
      disposeMelodyGraph();
      state.playbackKind = "none";
      updatePlaybackFrame();
      clearCircleHighlights();
    };

    startPlaybackAnimation();
  }

  function stopMelodyPlayback(resetCursor = false) {
    if (state.melodyPlayer.playing && !resetCursor) {
      state.cursorTime = getPlaybackTime();
    }
    const oscillator = state.melodyPlayer.oscillator;
    if (oscillator) {
      oscillator.onended = null;
      try { oscillator.stop(); } catch (_) { /* already stopped */ }
    }
    disposeMelodyGraph();
    if (resetCursor) state.cursorTime = 0;
    if (state.playbackKind === "melody") state.playbackKind = "none";
  }

  function disposeMelodyGraph() {
    const context = state.melodyPlayer.context;
    try { state.melodyPlayer.oscillator?.disconnect(); } catch (_) { /* no-op */ }
    try { state.melodyPlayer.gain?.disconnect(); } catch (_) { /* no-op */ }
    state.visualizer.melodyAnalyser = null;
    if (context && context.state !== "closed") context.close().catch(() => {});
    state.melodyPlayer = {
      context: null,
      oscillator: null,
      gain: null,
      startContextTime: 0,
      offset: state.cursorTime,
      playing: false,
    };
    if (elements.melodyPlayPause) {
      elements.melodyPlayPause.textContent = t("melodyPlay");
      elements.melodyPlayPause.classList.remove("playing");
    }
  }

  function stopPlayback() {
    stopBufferPlayback({ resetCursor: true, preserveTime: false });
    elements.audio.pause();
    stopMelodyPlayback(true);
    if (Number.isFinite(elements.audio.duration)) elements.audio.currentTime = 0;
    state.playbackKind = "none";
    state.cursorTime = 0;
    elements.playPause.textContent = t("play");
    elements.playPause.classList.remove("playing");
    if (elements.melodyPlayPause) {
      elements.melodyPlayPause.textContent = t("melodyPlay");
      elements.melodyPlayPause.classList.remove("playing");
    }
    elements.seek.value = "0";
    elements.currentTime.textContent = "0:00";
    state.activeEventIndex = -1;
    clearCircleHighlights();
    updateNowPlaying(null);
    redrawCanvasesWithPlayhead(0);
    clearRadialSpectrum();
  }

  function seekFromSlider() {
    const duration = getPlaybackDuration();
    if (!Number.isFinite(duration) || duration <= 0) return;
    const fraction = Number(elements.seek.value) / 1000;
    const targetTime = clamp(fraction * duration, 0, duration);
    const melodyWasPlaying = state.melodyPlayer.playing;
    const bufferWasPlaying = state.bufferPlayer.playing;
    const bufferAutomatic = state.bufferPlayer.automatic;
    state.cursorTime = targetTime;

    if (Number.isFinite(elements.audio.duration)) {
      elements.audio.currentTime = clamp(targetTime, 0, Math.max(0, elements.audio.duration - 0.001));
    }
    if (melodyWasPlaying) startMelodyPlayback(targetTime);
    if (bufferWasPlaying) {
      startBufferPlayback(targetTime, { loop: true, automatic: bufferAutomatic }).catch(console.error);
    }
    state.activeEventIndex = findEventIndex(targetTime);
    updatePlaybackFrame();
  }

  function startPlaybackAnimation() {
    cancelAnimationFrame(state.animationFrame);
    const tick = () => {
      updatePlaybackFrame();
      if (isPlaybackActive()) state.animationFrame = requestAnimationFrame(tick);
    };
    state.animationFrame = requestAnimationFrame(tick);
  }

  function isPlaybackActive() {
    return state.bufferPlayer.playing || (!elements.audio.paused && !elements.audio.ended) || state.melodyPlayer.playing;
  }

  function getPlaybackTime() {
    if (state.bufferPlayer.playing && state.bufferPlayer.context) {
      const duration = Math.max(0.001, getPlaybackDuration());
      const elapsed = Math.max(0, state.bufferPlayer.context.currentTime - state.bufferPlayer.startContextTime);
      const rawTime = state.bufferPlayer.offset + elapsed;
      return state.bufferPlayer.loop ? mod(rawTime, duration) : clamp(rawTime, 0, duration);
    }
    if (state.melodyPlayer.playing && state.melodyPlayer.context) {
      return clamp(
        state.melodyPlayer.offset +
          (state.melodyPlayer.context.currentTime - state.melodyPlayer.startContextTime),
        0,
        getPlaybackDuration()
      );
    }
    if (!elements.audio.paused && state.playbackKind === "original") {
      return elements.audio.currentTime || 0;
    }
    return state.cursorTime || elements.audio.currentTime || 0;
  }

  function getPlaybackDuration() {
    return state.analysis?.duration || elements.audio.duration || 0;
  }

  function updatePlaybackFrame() {
    const duration = getPlaybackDuration();
    const currentTime = getPlaybackTime();
    state.cursorTime = currentTime;
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

    const activeNote = eventIndex >= 0 ? state.analysis?.events?.[eventIndex] : null;
    renderRadialSpectrum(activeNote);
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
    if (candidate >= 0 && time <= events[candidate].endTime + 0.025) return candidate;
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
      ? noteEvent.role === "ornament" ? "analysis-ornament" : "analysis-active"
      : nearest.distance === 1
        ? "analysis-near"
        : "analysis-outside";
    nearest.label.classList.add(className);
    state.lastHighlightedLabel = nearest.label;
  }

  function clearCircleHighlights() {
    $$("#outerScale .dynamic-label").forEach((label) => {
      label.classList.remove(
        "analysis-active",
        "analysis-ornament",
        "analysis-near",
        "analysis-outside"
      );
    });
    state.lastHighlightedLabel = null;
  }

  function updateNowPlaying(noteEvent) {
    if (!noteEvent) {
      elements.nowNote.textContent = t("noNote");
      elements.nowFrequency.textContent = t("noNote");
      elements.nowDeviation.textContent = t("noNote");
      if (elements.nowRole) elements.nowRole.textContent = t("noNote");
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
    if (elements.nowRole) {
      elements.nowRole.textContent = noteEvent.role === "ornament"
        ? t("ornamentRole")
        : t("structuralRole");
    }
  }

  function initializeVisualizer() {
    state.visualizer.canvas = elements.spectrumCanvas;
    state.visualizer.context2d = elements.spectrumCanvas?.getContext("2d") || null;
    state.visualizer.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;
    state.visualizer.barCount = state.visualizer.reducedMotion ? 48 : 96;
    resizeSpectrumCanvas();
    clearRadialSpectrum();
  }

  function bindVisualizerControls() {
    const pairs = [
      [elements.visualizerSensitivity, elements.visualizerSensitivityValue],
      [elements.visualizerSmoothing, elements.visualizerSmoothingValue],
      [elements.visualizerLength, elements.visualizerLengthValue],
      [elements.visualizerBackground, elements.visualizerBackgroundValue],
      [elements.visualizerMelodyEmphasis, elements.visualizerMelodyEmphasisValue],
    ];
    pairs.forEach(([input, output]) => {
      input?.addEventListener("input", () => {
        if (output) output.textContent = `${Math.round(Number(input.value) || 0)}%`;
      });
    });
    elements.visualizerEnabled?.addEventListener("change", () => {
      if (!elements.visualizerEnabled.checked) clearRadialSpectrum();
      else if (isPlaybackActive()) startPlaybackAnimation();
    });
    elements.visualizerMode?.addEventListener("change", () => {
      state.visualizer.smoothedBars = [];
      state.visualizer.mappingKey = "";
    });
  }

  function updateVisualizerControlLabels() {
    const pairs = [
      [elements.visualizerSensitivity, elements.visualizerSensitivityValue],
      [elements.visualizerSmoothing, elements.visualizerSmoothingValue],
      [elements.visualizerLength, elements.visualizerLengthValue],
      [elements.visualizerBackground, elements.visualizerBackgroundValue],
      [elements.visualizerMelodyEmphasis, elements.visualizerMelodyEmphasisValue],
    ];
    pairs.forEach(([input, output]) => {
      if (input && output) output.textContent = `${Math.round(Number(input.value) || 0)}%`;
    });
  }

  function measureAudioBufferLevel(audioBuffer) {
    if (!audioBuffer?.length || !audioBuffer.numberOfChannels) return { peak: 0, rms: 0 };
    const stride = Math.max(1, Math.floor(audioBuffer.length / 120000));
    let peak = 0;
    let sumSquares = 0;
    let count = 0;
    for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
      const channel = audioBuffer.getChannelData(channelIndex);
      for (let index = 0; index < channel.length; index += stride) {
        const sample = Number.isFinite(channel[index]) ? channel[index] : 0;
        peak = Math.max(peak, Math.abs(sample));
        sumSquares += sample * sample;
        count += 1;
      }
    }
    return { peak, rms: count ? Math.sqrt(sumSquares / count) : 0 };
  }

  function calculateAdaptivePlaybackGain({ peak = 0, rms = 0 } = {}) {
    if (peak <= 0.0001 || rms <= 0.00001) return 1;
    const targetPeak = 0.9;
    const targetRms = 0.115;
    const peakLimited = targetPeak / peak;
    const rmsBased = targetRms / rms;
    return clamp(Math.min(peakLimited, rmsBased), 0.5, 4);
  }

  function applyOriginalPlaybackGain() {
    const context = state.visualizer.originalContext;
    const gainNode = state.visualizer.originalGain;
    if (!context || !gainNode) return;
    const value = clamp(Number(state.playbackGain) || 1, 0.5, 4);
    gainNode.gain.cancelScheduledValues(context.currentTime);
    gainNode.gain.setTargetAtTime(value, context.currentTime, 0.025);
  }

  async function ensureOriginalVisualizerGraph() {
    if (!elements.audio) return null;
    if (state.visualizer.originalContext) {
      if (state.visualizer.originalContext.state === "suspended") {
        await state.visualizer.originalContext.resume();
      }
      applyOriginalPlaybackGain();
      return state.visualizer.originalContext;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = new AudioContextClass();
    const source = context.createMediaElementSource(elements.audio);
    const gain = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.58;
    compressor.threshold.value = -10;
    compressor.knee.value = 18;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;
    source.connect(gain);
    gain.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(context.destination);
    state.visualizer.originalContext = context;
    state.visualizer.originalSource = source;
    state.visualizer.originalGain = gain;
    state.visualizer.originalCompressor = compressor;
    state.visualizer.originalAnalyser = analyser;
    applyOriginalPlaybackGain();
    await context.resume();
    return context;
  }

  function connectMelodyVisualizer(context, gain) {
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.5;
    gain.connect(analyser);
    analyser.connect(context.destination);
    state.visualizer.melodyAnalyser = analyser;
  }

  function getActiveVisualizerAnalyser() {
    if (state.playbackKind === "melody") return state.visualizer.melodyAnalyser;
    if (state.playbackKind === "original") return state.visualizer.originalAnalyser;
    return null;
  }

  function resizeSpectrumCanvas() {
    const canvas = elements.spectrumCanvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(160, rect.width || 520);
    const cssHeight = Math.max(160, rect.height || cssWidth);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(cssWidth * ratio);
    const height = Math.round(cssHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.dataset.cssWidth = String(cssWidth);
      canvas.dataset.cssHeight = String(cssHeight);
      state.visualizer.smoothedBars = [];
    }
  }

  function renderRadialSpectrum(noteEvent) {
    const canvas = elements.spectrumCanvas;
    const context2d = state.visualizer.context2d;
    const enabled = elements.visualizerEnabled?.checked !== false;
    const analyser = getActiveVisualizerAnalyser();
    if (!canvas || !context2d || !enabled || !analyser || !isPlaybackActive()) {
      if (!isPlaybackActive()) clearRadialSpectrum();
      return;
    }

    resizeSpectrumCanvas();
    const mode = elements.visualizerMode?.value || "hybrid";
    const reduced = state.visualizer.reducedMotion;
    const barCount = mode === "minimal" ? 24 : reduced ? 48 : 96;
    if (state.visualizer.barCount !== barCount) {
      state.visualizer.barCount = barCount;
      state.visualizer.smoothedBars = new Array(barCount).fill(0);
    }
    if (!state.visualizer.frequencyData || state.visualizer.frequencyData.length !== analyser.frequencyBinCount) {
      state.visualizer.frequencyData = new Uint8Array(analyser.frequencyBinCount);
      state.visualizer.mappingKey = "";
    }
    analyser.getByteFrequencyData(state.visualizer.frequencyData);

    const data = state.visualizer.frequencyData;
    const audioContext = state.playbackKind === "melody"
      ? state.melodyPlayer.context
      : state.visualizer.originalContext;
    const sampleRate = audioContext?.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const pitchEnergy = new Float32Array(24);
    let pitchMaximum = 1;
    for (let bin = 1; bin < data.length; bin += 1) {
      const frequency = (bin * nyquist) / data.length;
      if (frequency < 42 || frequency > 6500) continue;
      const magnitude = data[bin] / 255;
      if (magnitude < 0.025) continue;
      const pitchClass = mod(Math.round(24 * Math.log2(frequency / 16.351597831287414)), 24);
      pitchEnergy[pitchClass] += Math.pow(magnitude, 1.35);
      pitchMaximum = Math.max(pitchMaximum, pitchEnergy[pitchClass]);
    }
    for (let pc = 0; pc < 24; pc += 1) pitchEnergy[pc] /= pitchMaximum;

    const sensitivity = clamp((Number(elements.visualizerSensitivity?.value) || 75) / 75, 0.25, 1.9);
    const smoothing = clamp((Number(elements.visualizerSmoothing?.value) || 72) / 100, 0, 0.95);
    const background = clamp((Number(elements.visualizerBackground?.value) || 35) / 100, 0, 1);
    const melodyEmphasis = clamp((Number(elements.visualizerMelodyEmphasis?.value) || 82) / 100, 0, 1);
    const activePitch = noteEvent?.pitchClass;
    const values = new Array(barCount).fill(0);
    const minFrequency = 45;
    const maxFrequency = Math.min(6800, nyquist * 0.92);

    for (let index = 0; index < barCount; index += 1) {
      const normalized = index / Math.max(1, barCount - 1);
      const frequency = minFrequency * Math.pow(maxFrequency / minFrequency, normalized);
      const binFloat = (frequency / nyquist) * data.length;
      const left = clamp(Math.floor(binFloat), 0, data.length - 1);
      const right = clamp(left + 1, 0, data.length - 1);
      const fraction = binFloat - left;
      const spectrumValue = ((data[left] || 0) * (1 - fraction) + (data[right] || 0) * fraction) / 255;
      const circleSlot = mod(Math.floor((index / barCount) * 24), 24);
      const pitchClass = circleSlotToPitchClass(circleSlot);
      const pitchValue = pitchEnergy[pitchClass];
      const activeCircleSlot = activePitch == null ? null : pitchClassToCircleSlot(activePitch);
      const melodyDistance = activeCircleSlot == null ? 12 : circularDistance(circleSlot, activeCircleSlot, 24);
      const melodyFocus = activeCircleSlot == null ? 0 : Math.exp(-0.5 * Math.pow(melodyDistance / 0.9, 2));

      let target;
      if (mode === "spectrum") target = spectrumValue;
      else if (mode === "pitch") target = pitchValue * 0.92 + spectrumValue * 0.08;
      else if (mode === "melody") target = pitchValue * 0.18 + melodyFocus * melodyEmphasis * 1.08;
      else if (mode === "minimal") target = melodyFocus * melodyEmphasis * 0.88 + pitchValue * 0.12;
      else target = spectrumValue * 0.2 + pitchValue * 0.38 + melodyFocus * melodyEmphasis * 0.68;

      target = clamp((target + background * 0.045) * sensitivity, 0, 1.25);
      values[index] = target;
    }

    const attack = reduced ? 0.11 : 0.18 + (1 - smoothing) * 0.48;
    const release = reduced ? 0.045 : 0.035 + (1 - smoothing) * 0.2;
    if (state.visualizer.smoothedBars.length !== barCount) {
      state.visualizer.smoothedBars = new Array(barCount).fill(0);
    }
    values.forEach((target, index) => {
      const previous = state.visualizer.smoothedBars[index] || 0;
      const alpha = target > previous ? attack : release;
      state.visualizer.smoothedBars[index] = previous + (target - previous) * alpha;
    });

    drawRadialBars(state.visualizer.smoothedBars, noteEvent);
  }

  function drawRadialBars(values, noteEvent) {
    const canvas = elements.spectrumCanvas;
    const context = state.visualizer.context2d;
    if (!canvas || !context) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Number(canvas.dataset.cssWidth) || canvas.width / ratio;
    const height = Number(canvas.dataset.cssHeight) || canvas.height / ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const circleRect = $("#circleContainer")?.getBoundingClientRect();
    const baseRadius = Math.max(28, (circleRect?.width || Math.min(width, height) * 0.62) / 2 + 5);
    const available = Math.max(12, Math.min(width, height) / 2 - baseRadius - 3);
    const maximumLength = available * clamp((Number(elements.visualizerLength?.value) || 62) / 100, 0.2, 1);
    const centerX = width / 2;
    const centerY = height / 2;
    const barWidth = clamp((2 * Math.PI * baseRadius) / values.length * 0.48, 1.1, 4.2);
    const activePitch = noteEvent?.pitchClass;
    const activeCircleSlot = activePitch == null ? null : pitchClassToCircleSlot(activePitch);

    context.save();
    context.beginPath();
    context.arc(centerX, centerY, baseRadius - 1, 0, Math.PI * 2);
    context.strokeStyle = "rgba(26, 59, 102, 0.09)";
    context.lineWidth = 1;
    context.stroke();

    values.forEach((value, index) => {
      const angle = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
      const circleSlot = mod(Math.floor((index / values.length) * 24), 24);
      const activeDistance = activeCircleSlot == null ? 12 : circularDistance(circleSlot, activeCircleSlot, 24);
      const activeStrength = activeCircleSlot == null ? 0 : Math.exp(-0.5 * Math.pow(activeDistance / 0.9, 2));
      const minimum = value > 0.015 ? 1.8 : 0;
      const length = minimum + maximumLength * clamp(value, 0, 1.1);
      const startX = centerX + Math.cos(angle) * baseRadius;
      const startY = centerY + Math.sin(angle) * baseRadius;
      const endX = centerX + Math.cos(angle) * (baseRadius + length);
      const endY = centerY + Math.sin(angle) * (baseRadius + length);
      const hue = activeStrength > 0.25 ? 39 : 202 + (index / values.length) * 28;
      const alpha = clamp(0.18 + value * 0.62 + activeStrength * 0.22, 0, 0.95);
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.lineWidth = barWidth * (1 + activeStrength * 0.34);
      context.lineCap = "round";
      context.strokeStyle = `hsla(${hue}, ${activeStrength > 0.25 ? 82 : 58}%, ${activeStrength > 0.25 ? 52 : 42}%, ${alpha})`;
      context.stroke();
    });
    context.restore();
    canvas.classList.add("visible");
  }

  function clearRadialSpectrum() {
    const canvas = elements.spectrumCanvas;
    const context = state.visualizer.context2d;
    if (canvas && context) {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.classList.remove("visible");
      state.visualizer.smoothedBars = new Array(state.visualizer.barCount || 96).fill(0);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }

  function seekFromCanvas(event) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const fraction = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    elements.seek.value = String(Math.round(fraction * 1000));
    seekFromSlider();
  }

  function downsampleToMono(audioBuffer, targetRate, maximumSeconds, gain = 1) {
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
      output[index] = clamp((value / channels.length) * gain, -1, 1);
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

  function drawTimeline(events, rawEvents = []) {
    resizeCanvas(elements.timeline, 110);
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

    /* Raw dominant detections are shown faintly so users can understand what
       the melody tracker kept and what it treated as accompaniment. */
    rawEvents.forEach((noteEvent) => {
      const x = (noteEvent.startTime / duration) * width;
      const eventWidth = Math.max(1, (noteEvent.duration / duration) * width);
      const binding = nearestBinding(noteEvent.pitchClass);
      const row = binding ? binding.degreeIndex : 6;
      const y = (row / 7) * height + height / 28;
      const eventHeight = Math.max(2, height / 14);
      context.fillStyle = "rgba(104, 115, 134, 0.2)";
      context.fillRect(x, y, eventWidth, eventHeight);
    });

    events.forEach((noteEvent) => {
      const x = (noteEvent.startTime / duration) * width;
      const eventWidth = Math.max(1.5, (noteEvent.duration / duration) * width);
      const binding = nearestBinding(noteEvent.pitchClass);
      const row = binding ? binding.degreeIndex : 6;
      const y = (row / 7) * height + 2;
      const eventHeight = Math.max(3, height / 7 - 4);
      const alpha = clamp(0.4 + noteEvent.confidence * 0.55, 0.38, 0.96);

      if (noteEvent.role === "ornament") {
        context.fillStyle = `rgba(166, 106, 0, ${alpha})`;
      } else if (binding?.distance === 0) {
        context.fillStyle = `rgba(26, 59, 102, ${alpha})`;
      } else if (binding?.distance === 1) {
        context.fillStyle = `rgba(119, 73, 83, ${alpha})`;
      } else {
        context.fillStyle = `rgba(162, 58, 58, ${alpha})`;
      }
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
    resizeCanvas(elements.timeline, 110);
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
    resizeCanvas(canvas, canvas === elements.timeline ? 110 : 94);
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
    stopMelodyPlayback(false);
    state.analysis = null;
    state.candidates = [];
    state.allCandidates = [];
    state.selectedCandidate = null;
    state.automaticCandidate = null;
    state.modalFeatures = null;
    state.selectionSource = "automatic";
    state.activeEventIndex = -1;
    state.cursorTime = 0;
    elements.resultPlaceholder.style.display = "block";
    elements.resultPlaceholder.textContent = t("resultEmpty");
    elements.bestMatch.classList.remove("visible");
    elements.candidateList.innerHTML = "";
    if (elements.candidateComparison) elements.candidateComparison.innerHTML = "";
    if (elements.ambiguityNotice) elements.ambiguityNotice.classList.remove("visible");
    if (elements.explanation) elements.explanation.textContent = "";
    elements.confidenceText.textContent = "0%";
    elements.confidenceRing.style.setProperty("--confidence-angle", "0deg");
    updateNowPlaying(null);
    clearCircleHighlights();
    if (clearBadge) {
      elements.badge.classList.remove("visible");
      elements.quickFinderButton?.classList.remove("has-result");
      if (elements.quickFinderHelp) elements.quickFinderHelp.textContent = t("quickHoldHint");
    }
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
    if (elements.melodyPlayPause) elements.melodyPlayPause.disabled = !state.analysis?.events?.length;
    elements.stop.disabled = !state.file && !state.melodyPlayer.playing;
    recorderButtons().forEach((button) => {
      button.disabled = !state.recorder.supported || state.recorder.finalizing || state.recorder.permissionPreparing || (Boolean(state.worker) && !state.recorder.recording);
    });
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
      minor: "Minor",
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
