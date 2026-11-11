/* Localized reference text. English stays in the HTML for search engines and no-JS access.
 * Persian classical-music terms are kept as named concepts (dastgāh, āvāz, guše,
 * šāhed, forūd), not substituted with misleading Western tonal equivalents. */
(function () {
  "use strict";
  const storageKey = "persianMusicScalesLanguage";
  const texts = {
  "App": [
    "Application",
    "برنامه"
  ],
  "Reference": [
    "Documentation",
    "منابع"
  ],
  "About": [
    "À propos",
    "دربارهٔ برنامه"
  ],
  "Methodology": [
    "Méthodologie",
    "روش‌شناسی"
  ],
  "Dataset": [
    "Données",
    "داده‌ها"
  ],
  "Persian Music Scales ·": [
    "Persian Music Scales ·",
    "گام‌های موسیقی ایرانی ·"
  ],
  "Persian Music Scales · Educational pitch models and interactive tools ·": [
    "Persian Music Scales · Modèles de hauteurs et outils interactifs à vocation pédagogique ·",
    "گام‌های موسیقی ایرانی · مدل‌های آموزشیِ درجات صوتی و ابزارهای تعاملی ·"
  ],
  "Persian Music Theory Reference": [
    "Références théoriques sur la musique persane",
    "منابع نظری موسیقی دستگاهی ایران"
  ],
  "This reference documents the musical models, terminology, numerical representations and methodological assumptions used by the Persian Music Scales application.": [
    "Cette documentation présente les modèles musicaux, les termes, les représentations numériques et les choix méthodologiques employés dans l’application Persian Music Scales.",
    "این مجموعه، مدل‌های موسیقایی، اصطلاحات، بازنمایی‌های عددی و مبانی روش‌شناختی به‌کاررفته در برنامهٔ «گام‌های موسیقی ایرانی» را شرح می‌دهد."
  ],
  "Scale models": [
    "Modèles de collections de hauteurs",
    "مدل‌های مجموعهٔ درجات صوتی"
  ],
  "Concepts": [
    "Notions fondamentales",
    "مفاهیم"
  ],
  "Dastgah and Avaz": [
    "Dastgāh et āvāz",
    "دستگاه و آواز"
  ],
  "Koron, Sori and Microtones": [
    "Koron, sori et micro-intervalles",
    "کرن، سُری و ریزفاصله‌ها"
  ],
  "Persian Music Terminology": [
    "Terminologie de la musique persane",
    "اصطلاحات موسیقی دستگاهی ایران"
  ],
  "Research and methodology": [
    "Recherche et méthodologie",
    "پژوهش و روش‌شناسی"
  ],
  "Scale Visualization Methodology": [
    "Méthodologie de la représentation des gammes",
    "روش‌شناسی نمایش گام‌ها"
  ],
  "Audio and Melody Analysis": [
    "Analyse audio et mélodique",
    "تحلیل صوت و ملودی"
  ],
  "Machine-readable Dataset": [
    "Jeu de données lisible par machine",
    "مجموعه‌دادهٔ ماشین‌خوان"
  ],
  "Sources and Model Provenance": [
    "Sources et provenance des modèles",
    "منابع و خاستگاه مدل‌ها"
  ],
  "This page documents the exact educational pitch-collection model implemented by Persian Music Scales.": [
    "Cette page présente les valeurs exactes du modèle pédagogique de collection de hauteurs implémenté dans Persian Music Scales.",
    "این صفحه، مقادیر دقیق مدل آموزشیِ مجموعهٔ درجات صوتی را که در برنامه پیاده‌سازی شده است، ثبت می‌کند."
  ],
  "Numerical representation": [
    "Représentation numérique",
    "بازنمایی عددی"
  ],
  "Degree": [
    "Degré",
    "درجه"
  ],
  "Cents from tonic": [
    "Écart à la tonique (cents)",
    "فاصله از نت مبنا (سِنت)"
  ],
  "Circle angle": [
    "Angle sur le cercle",
    "زاویه روی دایره"
  ],
  "Successive intervals": [
    "Intervalles successifs",
    "فاصله‌های پیاپی"
  ],
  "Model limitation": [
    "Limites du modèle",
    "محدودیت مدل"
  ],
  "This is the app's pitch-collection model, not a complete definition of a dastgah, avaz or gusheh. Modal identity can also depend on melodic hierarchy, finalis, shahed, characteristic phrases, variable tones, modulation, context and performance practice.": [
    "Il s’agit du modèle de collection de hauteurs de l’application, et non d’une définition exhaustive d’un dastgāh, d’un āvāz ou d’un guše. L’identité modale dépend aussi de la hiérarchie mélodique, de la note finale (finalis), du šāhed, des phrases caractéristiques, des degrés mobiles, des modulations, du contexte et des pratiques d’interprétation.",
    "این داده‌ها مدل مجموعهٔ درجات صوتیِ برنامه‌اند، نه تعریفی کامل از دستگاه، آواز یا گوشه. هویت مُدال به عواملی چون سلسله‌مراتب ملودیک، نت پایانی، شاهد، جمله‌های شاخص، درجات متغیر، مدگردی، بافت موسیقایی و شیوهٔ اجرا نیز وابسته است."
  ],
  "Explore interactively": [
    "Explorer dans l’application",
    "بررسی تعاملی در برنامه"
  ],
  "Modal context:": [
    "Contexte modal :",
    "بافت مُدال:"
  ],
  "Mahur shares its pitch collection with Rast-Panjgah, but has a distinct modal identity. In the selected Mirza Abdollah-oriented introductory model, Shahed and Finalis are proposed on degree 1. This is provisional, and later Dād/Goshāyesh may emphasize degree 2. See": [
    "Māhur partage ici la même collection de hauteurs que Rāst-Panjgāh, sans pour autant avoir la même identité modale. Dans ce modèle introductif fondé sur le radif de Mirzā Abdollāh, le šāhed et la note finale sont provisoirement placés sur le premier degré. Les guše Dād et Gošāyeš peuvent ensuite mettre davantage l’accent sur le deuxième degré. Voir",
    "ماهور و راست‌پنجگاه در این مدل از مجموعهٔ درجات صوتیِ یکسانی بهره می‌برند، اما هویت مُدال یکسانی ندارند. در این مدل مقدماتیِ مبتنی بر ردیف میرزا عبدالله، شاهد و نت پایانی به‌صورت موقت بر درجهٔ نخست در نظر گرفته شده‌اند. در گوشه‌های بعدی، از جمله داد و گشایش، ممکن است درجهٔ دوم برجسته‌تر شود. رجوع کنید به"
  ],
  "Rast-Panjgah shares an educational pitch collection with Mahur but not its melodic organization or forūd. The opening Rast darāmad is provisionally assigned Shahed and Finalis on displayed degree 1; the Shahed requires direct confirmation in a critical Mirza Abdollah transcription, and must not be confused with the later Panjgāh gusheh. See": [
    "Rāst-Panjgāh partage avec Māhur une collection de hauteurs dans ce modèle pédagogique, mais ni son organisation mélodique ni ses formules de forūd. Pour le darāmad initial de Rāst, le šāhed et la note finale sont provisoirement situés sur le premier degré affiché. La position du šāhed doit encore être vérifiée dans une transcription critique du radif de Mirzā Abdollāh ; elle ne doit pas être confondue avec celle du guše Panjgāh, qui apparaît plus loin. Voir",
    "راست‌پنجگاه در این مدل آموزشی با ماهور مجموعهٔ درجات صوتی مشترکی دارد، اما سازمان ملودیک و الگوهای فرود آن متفاوت‌اند. برای درآمد آغازینِ راست، شاهد و نت پایانی به‌طور موقت بر درجهٔ نخستِ نمایش‌داده‌شده قرار گرفته‌اند. تعیین شاهد نیازمند بررسی مستقیمِ نت‌نگاری انتقادیِ ردیف میرزا عبدالله است و نباید با نقش شاهد در گوشهٔ پنجگاه، که بعدتر می‌آید، خلط شود. رجوع کنید به"
  ],
  "About these notes": [
    "les précisions relatives aux fonctions des notes",
    "توضیحات مربوط به نقش نغمه‌ها"
  ],
  "on the main circle for provenance and limitations.": [
    "sur le cercle principal pour connaître les sources et les limites de ce choix.",
    "در دایرهٔ اصلی برای آگاهی از مبانی و محدودیت‌های این انتخاب."
  ],
  "The application visualizes pitch collections associated with Persian classical music, but a dastgah is more than a Western-style scale.": [
    "L’application visualise des collections de hauteurs de la musique classique persane ; un dastgāh ne se réduit toutefois pas à une gamme au sens occidental.",
    "این برنامه مجموعه‌های درجات صوتیِ مربوط به موسیقی دستگاهی ایران را نمایش می‌دهد؛ اما دستگاه صرفاً معادل یک گام به معنای رایج در موسیقی غربی نیست."
  ],
  "Dastgah": [
    "Dastgāh",
    "دستگاه"
  ],
  "A dastgah is a modal-organizational system whose identity can involve characteristic pitch material, melodic functions, important tones, conventional melodic figures, gusheh relationships and modulation pathways.": [
    "Le dastgāh est un système d’organisation modale, caractérisé notamment par un matériau de hauteurs, des fonctions mélodiques, des notes structurantes, des figures conventionnelles, des relations entre guše et des parcours de modulation.",
    "دستگاه نظامی برای سازمان‌دهی مُدال است که هویت آن با مجموعهٔ درجات، نقش‌های ملودیک، نغمه‌های محوری، الگوهای ملودیکِ شناخته‌شده، ارتباط گوشه‌ها و مسیرهای مدگردی شکل می‌گیرد."
  ],
  "Avaz": [
    "Āvāz",
    "آواز"
  ],
  "Avaz systems are closely related modal branches within Persian classical practice. In the application, the Shur interface also surfaces Abu Ata, Bayat Tork, Afshari and Dashti as related avaz names.": [
    "Les āvāz constituent des branches modales étroitement liées à la pratique de la musique classique persane. Dans l’application, la section Šur présente également Abū Atā, Bayāt-e Tork, Afšāri et Dašti parmi les āvāz qui lui sont associés.",
    "آوازها شاخه‌هایی مُدال در سنت موسیقی دستگاهی ایران‌اند. در برنامه، در بخش شور نام آوازهای وابستهٔ ابوعطا، بیات ترک، افشاری و دشتی نیز نمایش داده می‌شود."
  ],
  "Why the app uses scale models": [
    "Pourquoi utiliser des modèles de gammes ?",
    "چرا برنامه از مدل‌های گامی استفاده می‌کند؟"
  ],
  "A numerical pitch collection is useful for visualization, comparison, transposition and audio analysis. It should be read as one analytical layer rather than a complete theory of modal identity.": [
    "Une collection de hauteurs définie numériquement facilite la visualisation, la comparaison, la transposition et l’analyse audio. Elle représente un niveau d’analyse parmi d’autres, et non une théorie complète de l’identité modale.",
    "مجموعهٔ درجات صوتی با تعریف عددی برای نمایش، مقایسه، انتقال و تحلیل صوت سودمند است. این مجموعه تنها یکی از لایه‌های تحلیل است و نباید نظریه‌ای کامل دربارهٔ هویت مُدال تلقی شود."
  ],
  "Persian Music Scales uses explicit labels for pitches that lie between twelve equal-tempered semitone positions.": [
    "Persian Music Scales distingue explicitement les hauteurs situées entre les douze positions du tempérament égal à douze demi-tons.",
    "برنامهٔ «گام‌های موسیقی ایرانی» برای نغمه‌هایی که میان درجاتِ نیم‌پرده‌ایِ کوک مساوی دوازده‌قسمتی قرار می‌گیرند، نشانه‌های مشخصی به کار می‌برد."
  ],
  "Koron": [
    "Koron",
    "کرن"
  ],
  "Sori": [
    "Sori",
    "سُری"
  ],
  "In the application,": [
    "Dans l’application,",
    "در این برنامه،"
  ],
  "koron": [
    "le koron",
    "کرن"
  ],
  "sori": [
    "le sori",
    "سُری"
  ],
  "marks a pitch modeled 50 cents below the nearest diatonic reference note.": [
    "désigne une hauteur située, dans le modèle, 50 cents au-dessous de la note diatonique de référence la plus proche.",
    "نغمه‌ای را مشخص می‌کند که در مدل، ۵۰ سنت پایین‌تر از نزدیک‌ترین نتِ مرجعِ دیاتونیک قرار دارد."
  ],
  "marks a pitch modeled 50 cents above the nearest diatonic reference note.": [
    "désigne une hauteur située, dans le modèle, 50 cents au-dessus de la note diatonique de référence la plus proche.",
    "نغمه‌ای را مشخص می‌کند که در مدل، ۵۰ سنت بالاتر از نزدیک‌ترین نتِ مرجعِ دیاتونیک قرار دارد."
  ],
  "Important limitation": [
    "Précision essentielle",
    "نکتهٔ مهم دربارهٔ محدودیت مدل"
  ],
  "These ±50-cent offsets are a computational notation convention used by this educational model. Actual Persian performance intonation is not necessarily a fixed quarter-tone grid and can vary with context, performer, instrument and tradition.": [
    "Les écarts de ±50 cents relèvent ici d’une convention de notation numérique. Dans la pratique, l’intonation de la musique persane ne suit pas nécessairement un système fixe de quarts de ton : elle varie selon le contexte musical, l’interprète, l’instrument et la tradition.",
    "فاصله‌های ۵۰± سنت در اینجا قراردادی محاسباتی برای نت‌نویسیِ مدل آموزشی‌اند. فواصل در اجرای موسیقی دستگاهی ایران لزوماً بر شبکه‌ای ثابت از ربع‌پرده‌ها منطبق نیستند و بسته به بافت موسیقایی، نوازنده، ساز و سنت اجرایی تغییر می‌کنند."
  ],
  "Why cents are used": [
    "Pourquoi employer les cents ?",
    "چرا از واحد سنت استفاده شده است؟"
  ],
  "Cents provide a logarithmic unit for comparing pitch intervals independently of absolute frequency.": [
    "Le cent est une unité logarithmique permettant de comparer les intervalles indépendamment de la fréquence absolue.",
    "سِنت واحدی لگاریتمی برای سنجش فاصله‌های صوتی است که به بسامدِ مطلق وابسته نیست."
  ],
  "Persian Music Terminology and Transliteration": [
    "Terminologie et translittération de la musique persane",
    "اصطلاحات موسیقی دستگاهی ایران و آوانویسی آن‌ها"
  ],
  "Common English spellings and Persian-script forms are listed together so readers and machine systems can resolve variant transliterations to the same concept.": [
    "Les formes courantes en alphabet latin sont données avec leur graphie persane afin de rapprocher les différentes translittérations d’un même concept.",
    "صورت‌های رایج لاتین‌نویسی در کنار املای فارسی آمده‌اند تا صورت‌های گوناگونِ آوانویسیِ یک اصطلاح با یکدیگر تطبیق داده شوند."
  ],
  "A modal-organizational system in Persian classical music; not reducible to a fixed scale alone.": [
    "Système d’organisation modale de la musique classique persane, irréductible à une gamme fixe.",
    "نظام سازمان‌دهی مُدال در موسیقی دستگاهی ایران؛ قابل تقلیل به یک گامِ ثابت نیست."
  ],
  "A related modal branch or system.": [
    "Branche modale apparentée ou système modal connexe.",
    "شاخه یا نظام مُدالِ وابسته."
  ],
  "A named melodic/modal unit within the radif tradition.": [
    "Unité mélodique ou modale nommée au sein du radif.",
    "واحد ملودیک یا مُدالِ دارای نام در سنت ردیف."
  ],
  "The canonical repertoire/order of gushehs transmitted in Persian classical music traditions.": [
    "Répertoire de référence et ordre de transmission des guše dans la tradition de la musique classique persane.",
    "مجموعه و ترتیبِ گوشه‌های سنت موسیقی دستگاهی ایران که از نسلی به نسل دیگر منتقل شده است."
  ],
  "An important focal tone whose musical role can contribute to modal identity.": [
    "Note-pôle, souvent centrale dans l’organisation mélodique et l’identité modale.",
    "نتی محوری در سازمان‌دهی ملودیک که در شکل‌گیری هویت مُدال نقش دارد."
  ],
  "A Persian accidental sign; in this application it is modeled as 50 cents below a reference note.": [
    "Signe d’altération de la notation persane ; dans ce modèle, il abaisse une note de référence de 50 cents.",
    "از نشانه‌های تغییرِ ارتفاع صدا در نت‌نویسی ایرانی؛ در این مدل معادل ۵۰ سنت پایین‌تر از نت مرجع است."
  ],
  "A Persian accidental sign; in this application it is modeled as 50 cents above a reference note.": [
    "Signe d’altération de la notation persane ; dans ce modèle, il élève une note de référence de 50 cents.",
    "از نشانه‌های تغییرِ ارتفاع صدا در نت‌نویسی ایرانی؛ در این مدل معادل ۵۰ سنت بالاتر از نت مرجع است."
  ],
  "One of the principal modal systems represented by the app.": [
    "L’un des principaux systèmes modaux représentés dans l’application.",
    "یکی از دستگاه‌های اصلی که در برنامه نمایش داده می‌شود."
  ],
  "A modal system represented by the app.": [
    "Système modal représenté dans l’application.",
    "یکی از نظام‌های مُدالِ نمایش‌داده‌شده در برنامه."
  ],
  "A related modal system represented by the app.": [
    "Système modal apparenté représenté dans l’application.",
    "یکی از نظام‌های مُدالِ مرتبط که در برنامه نمایش داده می‌شود."
  ],
  "A modal system that currently shares one pitch-collection visualization with Mahur in the app.": [
    "Système modal qui partage actuellement avec Māhur une même représentation de collection de hauteurs dans l’application.",
    "دستگاهی که در نسخهٔ کنونیِ برنامه، نمایشِ مجموعهٔ درجات صوتیِ آن با ماهور مشترک است."
  ],
  "Visualization and Scale-Model Methodology": [
    "Méthodologie de la visualisation et des modèles de gammes",
    "روش‌شناسی نمایش تصویری و مدل‌سازی گام‌ها"
  ],
  "Persian Music Scales uses a circular geometric representation to make interval relationships visible and transposable while preserving the numerical pitch model used by the application.": [
    "Persian Music Scales représente les hauteurs sur un cercle afin de rendre les relations intervalliques visibles et de permettre la transposition sans modifier les valeurs numériques du modèle.",
    "در برنامهٔ «گام‌های موسیقی ایرانی» درجات صوتی روی دایره نمایش داده می‌شوند تا نسبت‌های فاصله‌ای آشکار و انتقال گام ممکن شود، بی‌آنکه روابط عددیِ مدل تغییر کند."
  ],
  "Octave and angular mapping": [
    "Correspondance entre octave et angle",
    "نگاشت اکتاو به زاویه"
  ],
  "An octave is treated as 1200 cents and mapped to a full 360° circle:": [
    "Une octave de 1 200 cents correspond à un tour complet de 360° :",
    "اکتاوِ ۱۲۰۰ سِنتی به دایره‌ای کامل با زاویهٔ ۳۶۰ درجه نگاشت می‌شود:"
  ],
  "Thus 100, 150, 200 and 250 cents correspond to 30°, 45°, 60° and 75° respectively.": [
    "Les intervalles de 100, 150, 200 et 250 cents correspondent donc respectivement à 30°, 45°, 60° et 75°.",
    "بنابراین فاصله‌های ۱۰۰، ۱۵۰، ۲۰۰ و ۲۵۰ سنت به‌ترتیب با زاویه‌های ۳۰، ۴۵، ۶۰ و ۷۵ درجه متناظرند."
  ],
  "The seven Persian pitch-collection models documented here are read directly from the application's implemented scale data: Shur, Nava, Segah, Homayoun, Esfahan, Chahargah and Mahur / Rast Panjgah.": [
    "Les sept modèles de collections de hauteurs sont tirés directement des données de l’application : Šur, Navā, Segāh, Homāyun, Esfahān, Čahārgāh et Māhur / Rāst-Panjgāh.",
    "هفت مدلِ مجموعهٔ درجات صوتی مستقیماً از داده‌های پیاده‌سازی‌شده در برنامه استخراج شده‌اند: شور، نوا، سه‌گاه، همایون، اصفهان، چهارگاه و ماهور / راست‌پنجگاه."
  ],
  "Transposition": [
    "Transposition",
    "انتقال گام"
  ],
  "Rotation changes note naming relative to the selected tonic while preserving the internal cent relationships of the selected model.": [
    "La rotation modifie le nom des notes en fonction de la tonique choisie sans changer les intervalles internes, exprimés en cents, du modèle.",
    "با چرخاندن دایره، نام نت‌ها نسبت به نتِ مبنای انتخاب‌شده تغییر می‌کند، اما فاصله‌های درونیِ مدل بر حسب سنت ثابت می‌ماند."
  ],
  "Microtonal labels": [
    "Notation des micro-intervalles",
    "نشانه‌گذاری ریزفاصله‌ها"
  ],
  "The app uses koron and sori labels when a modeled pitch falls 50 cents below or above a diatonic reference pitch. This is a computational convention of the app, not a claim that all Persian performance intonation is fixed to equal 50-cent offsets.": [
    "L’application emploie les signes koron et sori pour noter des hauteurs situées, dans le modèle, 50 cents sous ou au-dessus d’une note diatonique de référence. Cette convention de calcul ne signifie pas que l’intonation réelle de la musique persane obéisse partout à des écarts fixes de 50 cents.",
    "برنامه برای نغمه‌هایی که در مدل ۵۰ سنت پایین‌تر یا بالاتر از نتِ مرجعِ دیاتونیک قرار دارند، به‌ترتیب از نشانه‌های کرن و سُری استفاده می‌کند. این یک قرارداد محاسباتی است، نه ادعایی مبنی بر ثابت‌بودن ریزفاصله‌ها در اجرای موسیقی ایرانی."
  ],
  "Model boundaries": [
    "Portée et limites du modèle",
    "دامنه و محدودیت مدل"
  ],
  "A pitch collection alone cannot fully identify Persian modal practice. Finalis, shahed, melodic hierarchy, phrase grammar, variable tones, gusheh context, modulation and performer/tradition-specific intonation can all matter.": [
    "Une collection de hauteurs ne suffit pas à caractériser une pratique modale persane. La note finale (finalis), le šāhed, la hiérarchie mélodique, la syntaxe des phrases, les degrés mobiles, le contexte des guše, les modulations et l’intonation propre à l’interprète ou à la tradition sont également déterminants.",
    "تنها با داشتن مجموعهٔ درجات صوتی نمی‌توان هویت مُدال در موسیقی ایرانی را به‌طور کامل تعیین کرد. نت پایانی، شاهد، سلسله‌مراتب ملودیک، ساختار جمله‌ها، درجات متغیر، جایگاه گوشه در ردیف، مدگردی و کوکِ وابسته به نوازنده یا سنت اجرایی نیز اهمیت دارند."
  ],
  "Reproducibility": [
    "Reproductibilité",
    "بازآفرینی‌پذیری"
  ],
  "The exact values are published in": [
    "Les valeurs exactes figurent dans le fichier",
    "مقادیر دقیق در پروندهٔ"
  ],
  "The Track Scale Analyzer is designed as an educational candidate-matching tool. Audio remains in the browser; the application does not upload recordings for analysis.": [
    "L’analyseur de gammes est un outil pédagogique qui classe des correspondances possibles. Les enregistrements sont traités dans le navigateur et ne sont pas envoyés à un serveur pour analyse.",
    "ابزار تحلیل گامِ قطعه برای ارزیابی و رتبه‌بندیِ تطابق‌های احتمالی طراحی شده است. فایل صوتی در همان مرورگر پردازش می‌شود و برای تحلیل به سرور فرستاده نمی‌شود."
  ],
  "Analysis pipeline": [
    "Étapes de l’analyse",
    "مراحل تحلیل"
  ],
  "Decode and normalize the recording.": [
    "Décoder l’enregistrement et normaliser son niveau.",
    "رمزگشایی و نرمال‌سازیِ دادهٔ صوتی."
  ],
  "Estimate pitch over multiple time resolutions.": [
    "Estimer la hauteur à plusieurs résolutions temporelles.",
    "برآورد ارتفاع صوت در چند مقیاس زمانی."
  ],
  "Generate pitch candidates and track a predominant melodic line.": [
    "Produire des hypothèses de hauteur et suivre la ligne mélodique prédominante.",
    "تعیین نغمه‌های نامزد و ردیابی خطِ ملودیکِ غالب."
  ],
  "Reduce unstable or ornamental events relative to structurally persistent notes.": [
    "Réduire le poids des événements instables ou ornementaux au profit des notes mélodiquement persistantes.",
    "کاهش وزن رخدادهای ناپایدار یا زینتی در برابر نت‌های پایدارتر از نظر ساختاری."
  ],
  "Build a 24-bin pitch-class representation.": [
    "Construire un profil des classes de hauteurs réparti en 24 cases.",
    "ساختن بازنماییِ ۲۴‌خانه‌ای از رده‌های ارتفاع صوتی."
  ],
  "Compare observed pitch material with candidate scale models and tonic orientations.": [
    "Comparer les hauteurs observées aux modèles de gammes et aux positions de tonique envisagés.",
    "مقایسهٔ درجاتِ استخراج‌شده با مدل‌های گامی و نت‌های مبنای احتمالی."
  ],
  "Use tonic, phrase-ending, interval and resolution evidence to rank candidate interpretations.": [
    "Classer les interprétations candidates en tenant compte de la tonique, des fins de phrase, des intervalles et des mouvements de résolution.",
    "رتبه‌بندیِ تفسیرهای نامزد با توجه به نت مبنا، پایان جمله‌ها، فاصله‌ها و شواهدِ فرود و حلِ ملودیک."
  ],
  "Recommended material": [
    "Enregistrements recommandés",
    "صوت مناسب برای تحلیل"
  ],
  "Solo and melody-dominant recordings generally provide the clearest pitch sequence. Dense mixtures, accompaniment, percussion, tuning drift and ornamentation can reduce confidence.": [
    "Les enregistrements solistes ou à mélodie prédominante permettent généralement de suivre plus nettement les hauteurs. Les textures denses, l’accompagnement, les percussions, les écarts d’intonation et les ornements peuvent réduire la fiabilité du classement.",
    "ضبطِ تک‌ساز یا قطعه‌ای که ملودی در آن غالب است، معمولاً توالیِ درجات را روشن‌تر آشکار می‌کند. بافت‌های متراکم، همراهی سازهای دیگر، سازهای کوبه‌ای، ناپایداری کوک و تزئینات ملودیک می‌توانند اطمینانِ نتیجه را کاهش دهند."
  ],
  "Interpretation": [
    "Interprétation des résultats",
    "تفسیر نتایج"
  ],
  "The output is a ranked educational match, not a definitive identification of dastgah or gusheh.": [
    "Le résultat est un classement indicatif à vocation pédagogique, et non une identification certaine d’un dastgāh ou d’un guše.",
    "خروجی، رتبه‌بندیِ تطابق‌های احتمالی با هدف آموزشی است، نه تشخیص قطعیِ دستگاه یا گوشه."
  ],
  "Privacy": [
    "Confidentialité",
    "حریم خصوصی"
  ],
  "Uploaded and recorded audio is processed locally in the browser.": [
    "Les fichiers importés et les enregistrements sont traités localement dans le navigateur.",
    "فایل‌های بارگذاری‌شده و صدای ضبط‌شده فقط در مرورگر پردازش می‌شوند."
  ],
  "Persian Music Scales Dataset": [
    "Jeu de données Persian Music Scales",
    "مجموعه‌دادهٔ گام‌های موسیقی ایرانی"
  ],
  "The application’s numerical scale models are published as JSON so they can be inspected, cited and reused without extracting values from JavaScript or graphics.": [
    "Les modèles numériques sont publiés au format JSON pour permettre leur examen, leur citation et leur réutilisation sans extraction à partir du code JavaScript ni des graphiques.",
    "مدل‌های عددیِ گام‌ها در قالب JSON منتشر شده‌اند تا بتوان بدون استخراج داده از کد جاوااسکریپت یا نمودارها، آن‌ها را بررسی، به آن‌ها استناد و از آن‌ها استفاده کرد."
  ],
  "Download": [
    "Téléchargement",
    "دریافت داده"
  ],
  "Fields": [
    "Champs de données",
    "فیلدهای داده"
  ],
  ": positions on the 360° visualization circle.": [
    ": positions angulaires sur le cercle de 360°.",
    ": موقعیت زاویه‌ای روی دایرهٔ ۳۶۰ درجه."
  ],
  ": pitch position in cents from the selected tonic.": [
    ": position de la hauteur, en cents, par rapport à la tonique choisie.",
    ": موقعیت هر درجه بر حسب سنت نسبت به نت مبنای انتخاب‌شده."
  ],
  ": successive intervals including the return to the octave.": [
    ": intervalles successifs, y compris le retour à l’octave.",
    ": فاصله‌های پیاپی، همراه با فاصلهٔ بازگشت به اکتاو."
  ],
  ": Persian-script name.": [
    ": nom écrit en alphabet persan.",
    ": نام به خط فارسی."
  ],
  "This dataset documents the computational models implemented by Persian Music Scales. It is not presented as a universal or exhaustive intonation standard for Persian classical music.": [
    "Ce jeu de données décrit les modèles numériques de l’application. Il ne constitue pas une norme universelle ni une description exhaustive de l’intonation de la musique classique persane.",
    "این مجموعه‌داده مدل‌های محاسباتیِ پیاده‌سازی‌شده در برنامه را ثبت می‌کند و به‌عنوان معیاری جهانی یا توصیفی جامع از فواصلِ اجرایی در موسیقی دستگاهی ایران عرضه نمی‌شود."
  ],
  "This page distinguishes the app’s implemented numerical model from broader musicological literature.": [
    "Cette page distingue les modèles numériques implémentés dans l’application des travaux musicologiques de portée plus générale.",
    "در این صفحه میان مدل‌های عددیِ به‌کاررفته در برنامه و پژوهش‌های گسترده‌ترِ موسیقی‌شناختی تمایز گذاشته می‌شود."
  ],
  "Primary project documentation": [
    "Documentation du projet",
    "مستندات اصلی پروژه"
  ],
  "Pouya Hosseini,": [
    "Pouya Hosseini,",
    "پویا حسینی،"
  ],
  ", documenting the circular visualization concept and numerical scale representations used by the application.": [
    ", présentation du dispositif de visualisation circulaire et des représentations numériques utilisées par l’application.",
    "، شرحِ ایدهٔ نمایش دایره‌ای و بازنمایی‌های عددیِ گام‌ها در برنامه."
  ],
  "Open-source repository": [
    "Dépôt du code source",
    "مخزن کدِ متن‌باز"
  ],
  ", documenting the current analyzer, scale data and software behavior.": [
    ", pour le code de l’analyseur, les données des gammes et le fonctionnement du logiciel.",
    "، شامل کدِ تحلیل‌گر، داده‌های گام‌ها و مستندات عملکرد نرم‌افزار."
  ],
  "Background musicology": [
    "Études musicologiques",
    "پژوهش‌های موسیقی‌شناختی"
  ],
  "Citation guidance": [
    "Recommandations de citation",
    "راهنمای استناد"
  ],
  "When a claim concerns an exact cent value, angle or interval sequence, cite Persian Music Scales as the implemented model. For broader historical or musicological claims, consult the relevant scholarly literature.": [
    "Pour les valeurs exactes en cents, les angles et les suites d’intervalles, citer Persian Music Scales en tant que modèle implémenté. Pour les questions historiques ou musicologiques plus générales, consulter la littérature scientifique correspondante.",
    "برای ارجاع به مقادیر دقیق بر حسب سنت، زاویه‌ها یا توالیِ فاصله‌ها، به مدل پیاده‌سازی‌شده در «گام‌های موسیقی ایرانی» استناد کنید. برای ادعاهای تاریخی یا موسیقی‌شناختیِ گسترده‌تر، به منابع پژوهشی مرتبط رجوع شود."
  ],
  "Repository citation metadata is available in": [
    "Les métadonnées de citation du dépôt figurent dans",
    "اطلاعات کتاب‌شناختیِ لازم برای استناد به مخزن در پروندهٔ"
  ]
};
  const supported = ["en", "fr", "fa"];
  const appRoot = "/Persian-Music-Scales-App/";
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  let stored = "";
  try { stored = localStorage.getItem(storageKey) || ""; } catch (_) {}
  const browserLang = (navigator.language || "en").toLowerCase().slice(0, 2);
  let lang = supported.includes(urlLang) ? urlLang :
             supported.includes(stored) ? stored :
             supported.includes(browserLang) ? browserLang : "en";

  const wrap = document.querySelector(".wrap");
  const breadcrumbs = wrap && wrap.querySelector(".breadcrumbs");
  if (!wrap || !breadcrumbs) return;

  const languageSelect = document.createElement("select");
  languageSelect.id = "referenceLanguageSelector";
  languageSelect.className = "reference-language-selector";
  languageSelect.setAttribute("aria-label", "Language / Langue / زبان");
  [["en", "English"], ["fr", "Français"], ["fa", "فارسی"]].forEach(function (item) {
    const opt = document.createElement("option");
    opt.value = item[0];
    opt.textContent = item[1];
    languageSelect.appendChild(opt);
  });
  breadcrumbs.appendChild(languageSelect);

  /* Retain original English nodes for reversible language switches. */
  const englishTitle = document.title;
  const originalNodes = [];
  const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (languageSelect.contains(node) || !node.nodeValue.trim()) continue;
    originalNodes.push([node, node.nodeValue]);
  }

  function translatedText(english, choice) {
    if (choice === "en") return english;
    const pair = texts[english];
    if (pair) return pair[choice === "fr" ? 0 : 1];

    const scaleTitle = english.match(/^(.+?) — Persian Music Scale Model$/);
    if (scaleTitle) {
      const name = scaleTitle[1];
      return choice === "fr" ?
        name + " — modèle de collection de hauteurs" :
        name + " — مدل مجموعهٔ درجات صوتی";
    }
    return english; /* Proper names, numerical data and scholarly titles. */
  }

  function applyLanguage(choice, save) {
    lang = supported.includes(choice) ? choice : "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    languageSelect.value = lang;

    for (const entry of originalNodes) {
      const n = entry[0], original = entry[1];
      const value = original.trim();
      const begin = original.match(/^\s*/)[0];
      const end = original.match(/\s*$/)[0];
      n.nodeValue = begin + translatedText(value, lang) + end;
    }

    const heading = wrap.querySelector("h1");
    document.title = lang === "en" ? englishTitle :
      heading ? heading.textContent.trim() + " – Persian Music Scales" : englishTitle;
    document.querySelectorAll("a[href]").forEach(function (anchor) {
      const target = new URL(anchor.getAttribute("href"), window.location.href);
      if (target.origin !== window.location.origin ||
          !target.pathname.startsWith(appRoot) ||
          !(target.pathname.endsWith("/") || target.pathname.endsWith(".html"))) return;
      target.searchParams.set("lang", lang);
      anchor.href = target.href;
    });

    if (save) {
      try { localStorage.setItem(storageKey, lang); } catch (_) {}
      const current = new URL(window.location.href);
      current.searchParams.set("lang", lang);
      history.replaceState(null, "", current.href);
    }
  }

  languageSelect.addEventListener("change", function () {
    applyLanguage(languageSelect.value, true);
  });
  applyLanguage(lang, true);
})();
