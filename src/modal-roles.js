/* Persian Music Scales: educational modal functions, reference release draft.
 * Each role is a ZERO-BASED index of the app's displayed seven-note pitch collection.
 * A transposition changes note names, not the index of a modal function.
 *
 * INTERPRETATION: Mirza Abdollah / Boroumand radif as the organizing tradition,
 * cross-checked against published descriptions and scholarship. A source on
 * related contemporary practice is NOT proof of a note-by-note transcription
 * from Mirza Abdollah. "provisional" flags such proposals explicitly.
 *
 * Shahed = characteristic reciting/emphasis tone. Finalis = concluding pitch.
 * Ist = temporary resting pitch, not necessarily the Finalis.
 * A complete dastgah contains multiple gushehs and potentially variable notes.
 *
 * More details: docs/modal-roles-research.md
 */
(function (root) {
  "use strict";
  const base = "https://www.iranicaonline.org/articles/";
  const sources = {
    tradition: { label: "Mirza Abdollah – Encyclopaedia Iranica (Caton)", url: base + "abdallah-mirza/" },
    daramad: { label: "Darāmad – Encyclopaedia Iranica (During)", url: base + "daramad/" },
    shur: { label: "Šur – Encyclopaedia Iranica (During)", url: base + "shur-modal-system/" },
    abuAta: { label: "Abu Ata – Encyclopaedia Iranica (Tsuge)", url: base + "abu-ata/" },
    bayatTork: { label: "Bayat-e Tork – Encyclopaedia Iranica (Caton)", url: base + "bayat-e-tork/" },
    afshari: { label: "Afshari – Encyclopaedia Iranica (Farhat)", url: base + "afsari/" },
    esfahan: { label: "Bayat-e Esfahan – Encyclopaedia Iranica (Caton)", url: base + "bayat-e-esfahan/" },
    chahargah: { label: "Chahargah – Encyclopaedia Iranica (Nettl)", url: base + "cahargah/" },
    dastgah: { label: "Dastgah – Encyclopaedia Iranica", url: base + "dastgah/" },
    rastStudy: { label: "Wright (2019), The Peregrinations of panjgāh", url: "https://edizionicafoscari.unive.it/media/pdf/journals/annali-di-ca-foscari-serie-orientale/2019/55/iss-55-2019.pdf" },
    segah: { label: "Laudan Nooshin, PhD thesis (Segah)", url: "https://openaccess.city.ac.uk/id/eprint/4149/2/Nooshin_PhD_thesis_volume_2.pdf" },
    homayoun: { label: "Homayun – Encyclopaedia Iranica", url: base + "homayun/" }
  };


  /* Full reference explanation translations. Bibliographic URLs remain unchanged. */
  const localizedText = {
    "Shur": {
      "fr": {
        "context": "Darāmad de Shur : le premier degré est le centre modal dans la transposition affichée.",
        "warning": "Dans Shur, l’intonation du cinquième degré peut varier ; l’application présente un modèle pédagogique fixe, et non toutes les gushehs."
      },
      "fa": {
        "context": "درآمد شور: در انتقالِ نمایش‌داده‌شده، درجهٔ نخست مرکز مُدال است.",
        "warning": "در شور، کوکِ درجهٔ پنجم می‌تواند تغییر کند؛ این برنامه فقط یک مدل آموزشی با فواصل ثابت را نشان می‌دهد، نه همهٔ گوشه‌ها."
      }
    },
    "nava": {
      "fr": {
        "context": "Darāmad de Nava : le premier degré est proposé comme centre modal. Le modèle de Nava est une rotation cyclique de la collection de hauteurs de Shur.",
        "warning": "Une vérification note par note de la transcription du darāmad de Nava dans le radif de Mirza Abdollah reste nécessaire. Le Shahed proposé n’est pas une attribution universellement établie."
      },
      "fa": {
        "context": "درآمد نوا: درجهٔ نخست به‌عنوان مرکز مُدال پیشنهاد شده است. الگوی نوا در این برنامه چرخش دوریِ مجموعهٔ نغمه‌های شور است.",
        "warning": "بررسیِ نت‌به‌نتِ درآمد نوا در نت‌نویسی ردیف میرزا عبدالله هنوز انجام نشده است؛ شاهدِ پیشنهادی را نباید قطعی و مورد توافق همگان دانست."
      }
    },
    "segah": {
      "fr": {
        "context": "Darāmad de Segah : troisième degré affiché, correspondant à mi-koron dans le modèle référencé à do.",
        "warning": "D’autres gushehs de Segah peuvent mettre en valeur des notes différentes."
      },
      "fa": {
        "context": "درآمد سه‌گاه: درجهٔ سومِ نمایش، یعنی می‌کرن در مدلِ با نت مرجع دو.",
        "warning": "در گوشه‌های دیگر سه‌گاه ممکن است بر نغمه‌های متفاوتی تأکید شود."
      }
    },
    "homayoun": {
      "fr": {
        "context": "Darāmad de Homayoun : Shahed au deuxième degré affiché et note finale au premier degré de ce modèle de référence.",
        "warning": "L’intonation et la hiérarchie modale varient selon les gushehs et les différentes transmissions du radif."
      },
      "fa": {
        "context": "درآمد همایون: شاهد روی درجهٔ دومِ نمایش و نت فرود روی درجهٔ نخستِ این مدل مرجع قرار دارد.",
        "warning": "کوک و تأکیدهای مُدال در گوشه‌های مختلف و روایت‌های گوناگون ردیف تغییر می‌کنند."
      }
    },
    "esfahan": {
      "fr": {
        "context": "Darāmad de Bayat-e Esfahan : do est le Shahed et sol la note finale dans la collection de hauteurs référencée à do.",
        "warning": "Caton signale des interprétations anciennes se concluant sur fa ; les valeurs retenues décrivent le modèle moderne cité."
      },
      "fa": {
        "context": "درآمد بیات اصفهان: در مجموعهٔ نغمه‌های با نت مرجع دو، «دو» شاهد و «سل» نت فرود است.",
        "warning": "کتن به اجراهای قدیمی‌تری اشاره می‌کند که روی «فا» پایان می‌یافتند؛ مقادیر انتخاب‌شده مربوط به مدل متأخرِ مورد استناد است."
      }
    },
    "chahargah": {
      "fr": {
        "context": "Darāmad de Chahargah : le premier degré est proposé comme note centrale et finale ; les troisième et cinquième degrés sont aussi mis en valeur.",
        "warning": "Nettl décrit l’importance du ton central, mais cela ne suffit pas à établir un Shahed unique et universel ; la transcription de Mirza Abdollah reste à vérifier directement."
      },
      "fa": {
        "context": "درآمد چهارگاه: درجهٔ نخست به‌عنوان نغمهٔ محوری و نت فرود پیشنهاد شده است؛ بر درجه‌های سوم و پنجم نیز تأکید می‌شود.",
        "warning": "نتل بر اهمیت نت مرکزی تأکید می‌کند، اما این موضوع به‌تنهایی شاهدِ یگانه و همگانی را ثابت نمی‌کند؛ نت‌نویسی ردیف میرزا عبدالله هنوز نیاز به بررسی مستقیم دارد."
      }
    },
    "mahur": {
      "fr": {
        "context": "Darāmad de Mahour : premier degré comme Shahed et note finale, selon la convention de travail inspirée du radif de Mirza Abdollah. Dād/Goshāyesh peuvent souligner le deuxième degré.",
        "warning": "Les chercheurs ne s’accordent pas tous sur le degré appelé Shahed. Cette proposition concerne le darāmad, pas l’ensemble des gushehs de Mahour."
      },
      "fa": {
        "context": "درآمد ماهور: بر پایهٔ برداشت کاریِ مبتنی بر ردیف میرزا عبدالله، درجهٔ نخست برای شاهد و نت فرود پیشنهاد شده است. در داد/گشایش ممکن است بر درجهٔ دوم تأکید شود.",
        "warning": "در تعیین درجه‌ای که «شاهد» نامیده می‌شود، میان پژوهشگران اختلاف نظر وجود دارد؛ این پیشنهاد فقط به درآمد مربوط است، نه همهٔ گوشه‌های ماهور."
      }
    },
    "rastPanjgah": {
      "fr": {
        "context": "Darāmad initial de Rast dans Rast-Panjgah, transposé au premier degré affiché ; à distinguer de la gusheh ultérieure appelée Panjgāh.",
        "warning": "Le degré de Shahed reste provisoire tant que le darāmad de Mirza Abdollah n’a pas été vérifié dans sa transcription. La collection de hauteurs commune à Mahour n’implique pas un mode identique."
      },
      "fa": {
        "context": "درآمد آغازینِ راست در راست‌پنجگاه، با انتقال به درجهٔ نخستِ نمایش؛ این درآمد را نباید با گوشهٔ «پنجگاه» در ادامهٔ دستگاه یکسان دانست.",
        "warning": "تا بررسی مستقیمِ نت‌نویسی درآمد ردیف میرزا عبدالله، درجهٔ شاهد پیشنهادی است. یکسان‌بودن مجموعهٔ نغمه‌ها با ماهور به معنای یکسان‌بودن هویت مُدال نیست."
      }
    },
    "avaz.abuAta": {
      "fr": {
        "context": "Mode introductif d’Abu Ata : dans le Shur en sol décrit par Tsuge, do est le Shahed et sol la note finale ; ils deviennent les degrés quatre et un dans cette transposition.",
        "warning": "Le deuxième degré sert aussi de point d’arrêt temporaire (Ist), sans être une seconde note finale. Hejaz et d’autres gushehs ont leurs propres centres."
      },
      "fa": {
        "context": "مدِ آغازین ابوعطا: در شورِ سلِ توصیف‌شده توسط تسوگه، «دو» شاهد و «سل» نت فرود است؛ در این انتقال به‌ترتیب به درجه‌های چهارم و نخست تبدیل می‌شوند.",
        "warning": "درجهٔ دوم نیز محل ایستِ موقتِ مهمی است، نه نت فرود دوم. حجاز و دیگر گوشه‌ها مراکز مُدال متفاوتی دارند."
      }
    },
    "avaz.bayatTork": {
      "fr": {
        "context": "Bayat-e Tork : le si bémol, identifié comme Shahed dans un mode en fa, correspond au troisième degré de la collection de Shur affichée ici en do.",
        "warning": "Aucune note finale unique n’est attribuée ici : les conclusions et les cadences varient selon la gusheh et l’interprétation."
      },
      "fa": {
        "context": "بیات ترک: سی‌بمل که در مدلِ مبتنی بر فا به‌عنوان شاهد معرفی شده است، در مجموعهٔ شورِ نمایش‌داده‌شده با نت مرجع دو، با درجهٔ سوم متناظر می‌شود.",
        "warning": "در اینجا نت فرود یگانه‌ای تعیین نشده است؛ نت‌های پایان و الگوهای فرود با گوشه و تفسیر موسیقایی تغییر می‌کنند."
      }
    },
    "avaz.afshari": {
      "fr": {
        "context": "Afshari : dans l’exemple de Farhat, sol est le Shahed et do la note finale ; la transposition d’un Shur référencé à sol vers do place ces fonctions aux degrés un et quatre.",
        "warning": "La collection actuelle de Shur ne contient ni le mi-koron servant d’Ist temporaire dans cet exemple d’Afshari, ni l’alternance la-koron/la naturel. Ces repères indiquent des fonctions, non une gamme complète d’Afshari."
      },
      "fa": {
        "context": "افشاری: در نمونهٔ فرهت، «سل» شاهد و «دو» نت فرود است؛ با انتقال شور از نت مرجع سل به دو، این نقش‌ها روی درجه‌های نخست و چهارم قرار می‌گیرند.",
        "warning": "مجموعهٔ نغمه‌های شور در برنامه، می‌کرنِ ایستِ موقتِ این نمونهٔ افشاری و تغییر میان لاکرن و لای طبیعی را در بر ندارد. این نشانگرها فقط معادل نقش‌های مُدال‌اند، نه گام کامل افشاری."
      }
    },
    "avaz.dashti": {
      "fr": {
        "context": "Mode introductif de Dashti : cinquième degré proposé comme Shahed et centre conclusif apparenté à Shur dans cette transposition.",
        "warning": "Certains modèles de Dashti comportent une note variable ; le cercle fixe partagé avec Shur ne reproduit pas toute l’intonation mélodique. La note finale propre à la source reste à confirmer."
      },
      "fa": {
        "context": "مدِ آغازین دشتی: درجهٔ پنجم به‌عنوان شاهد و مرکزِ پایانِ وابسته به شور در این انتقال پیشنهاد شده است.",
        "warning": "در برخی روایت‌های دشتی نغمه‌ای متغیر وجود دارد؛ دایرهٔ ثابت و مشترک با شور همهٔ ظرایف کوک ملودیک را نشان نمی‌دهد. نت فرودِ مبتنی بر منبع مشخص هنوز نیاز به تأیید دارد."
      }
    },
    "minor": {
      "fr": {
        "context": "Gamme mineure naturelle occidentale, présentée à titre de comparaison : la première note est la tonique occidentale, et non un Shahed persan.",
        "warning": ""
      },
      "fa": {
        "context": "مینور طبیعیِ غربی برای مقایسه: نت نخست، تونیکِ موسیقی غربی است و نباید آن را شاهدِ موسیقی ایرانی نامید.",
        "warning": ""
      }
    }
  };
  const localizedSourceNames = {
    "tradition": {
      "labelFr": "Mirza Abdollah — Encyclopaedia Iranica (Caton)",
      "labelFa": "میرزا عبدالله — دانشنامهٔ ایرانیکا (کتن)"
    },
    "daramad": {
      "labelFr": "Darāmad — Encyclopaedia Iranica (During)",
      "labelFa": "درآمد — دانشنامهٔ ایرانیکا (دورینگ)"
    },
    "shur": {
      "labelFr": "Shur — Encyclopaedia Iranica (During)",
      "labelFa": "شور — دانشنامهٔ ایرانیکا (دورینگ)"
    },
    "abuAta": {
      "labelFr": "Abu Ata — Encyclopaedia Iranica (Tsuge)",
      "labelFa": "ابوعطا — دانشنامهٔ ایرانیکا (تسوگه)"
    },
    "bayatTork": {
      "labelFr": "Bayat-e Tork — Encyclopaedia Iranica (Caton)",
      "labelFa": "بیات ترک — دانشنامهٔ ایرانیکا (کتن)"
    },
    "afshari": {
      "labelFr": "Afshari — Encyclopaedia Iranica (Farhat)",
      "labelFa": "افشاری — دانشنامهٔ ایرانیکا (فرهت)"
    },
    "esfahan": {
      "labelFr": "Bayat-e Esfahan — Encyclopaedia Iranica (Caton)",
      "labelFa": "بیات اصفهان — دانشنامهٔ ایرانیکا (کتن)"
    },
    "chahargah": {
      "labelFr": "Chahargah — Encyclopaedia Iranica (Nettl)",
      "labelFa": "چهارگاه — دانشنامهٔ ایرانیکا (نتل)"
    },
    "dastgah": {
      "labelFr": "Dastgah — Encyclopaedia Iranica",
      "labelFa": "دستگاه — دانشنامهٔ ایرانیکا"
    },
    "rastStudy": {
      "labelFr": "Wright (2019) — étude « The Peregrinations of panjgāh »",
      "labelFa": "رایت (۲۰۱۹) — پژوهش «The Peregrinations of panjgāh»"
    },
    "segah": {
      "labelFr": "Laudan Nooshin — thèse de doctorat (Segah)",
      "labelFa": "لودان نوشین — رسالهٔ دکتری (سه‌گاه)"
    },
    "homayoun": {
      "labelFr": "Homayoun — Encyclopaedia Iranica",
      "labelFa": "همایون — دانشنامهٔ ایرانیکا"
    }
  };
  for (const [sourceId, labels] of Object.entries(localizedSourceNames)) {
    Object.assign(sources[sourceId], labels);
  }

  const context = {
    Shur: {
      shahed: 0, finalis: 0, confidence: "documented",
      context: "Shur darāmad; first degree is the modal center in the selected transposition.",
      warning: "Shur allows different fifth-degree intonations; this application shows one fixed educational model, not every gusheh.",
      sources: [sources.shur, sources.daramad, sources.tradition]
    },
    nava: {
      shahed: 0, finalis: 0, confidence: "provisional",
      context: "Nava darāmad, proposed first-degree center. The app's Nava pattern is a cyclic rotation of the Shur pitch collection.",
      warning: "Direct note-by-note verification against Mirza Abdollah's Nava darāmad transcription remains outstanding; do not treat this as a universally verified Shahed.",
      sources: [sources.shur, sources.tradition, sources.daramad]
    },
    segah: {
      shahed: 2, finalis: 2, confidence: "documented",
      context: "Segah darāmad: third displayed degree, E-koron in the C-referenced representation.",
      warning: "Other Segah gushehs may foreground other tones.",
      sources: [sources.segah, sources.tradition]
    },
    homayoun: {
      shahed: 1, finalis: 0, confidence: "documented",
      context: "Homayoun darāmad: Shahed on the second displayed degree; Finalis on the first in this reference model.",
      warning: "Intonation and modal emphasis vary among gushehs and radif transmissions.",
      sources: [sources.homayoun, sources.tradition]
    },
    esfahan: {
      shahed: 0, finalis: 4, confidence: "documented",
      context: "Bayat-e Esfahan darāmad: C as Shahed and G as concluding note in the C-referenced pitch collection.",
      warning: "Caton records older performances concluding on F; the chosen defaults describe the cited modern model.",
      sources: [sources.esfahan, sources.tradition]
    },
    chahargah: {
      shahed: 0, finalis: 0, confidence: "provisional",
      context: "Chahargah darāmad: first degree as proposed focal tone and Finalis; the third and fifth degrees are also emphasized.",
      warning: "Nettl documents tonic prominence, but this alone does not establish one universally accepted Shahed; direct Mirza Abdollah transcription verification remains outstanding.",
      sources: [sources.chahargah, sources.tradition, sources.daramad]
    },
    mahur: {
      shahed: 0, finalis: 0, confidence: "provisional",
      context: "Mahur darāmad: first-degree Shahed and Finalis as the chosen Mirza Abdollah-oriented working convention. Dād/Goshāyesh may emphasize degree two.",
      warning: "Scholars differ on which degree is designated Shahed; this applies to darāmad rather than every Mahur gusheh.",
      sources: [sources.daramad, sources.tradition, sources.dastgah]
    },
    rastPanjgah: {
      shahed: 0, finalis: 0, confidence: "provisional",
      context: "Rast-Panjgah's introductory Rast darāmad, transposed to the displayed first degree; do not confuse this with the later Panjgāh gusheh.",
      warning: "The Shahed degree remains provisional until the actual Mirza Abdollah darāmad transcription is checked. The same pitch collection as Mahur does not imply an identical mode.",
      sources: [sources.rastStudy, sources.tradition, sources.dastgah]
    },
    "avaz.abuAta": {
      shahed: 3, finalis: 0, confidence: "documented",
      context: "Abu Ata introductory mode: in Tsuge's G-based Shur, C is Shahed and G is Finalis; here these transpose to degrees four and one.",
      warning: "The second degree is also an important temporary Ist; this is not a second Finalis. Hejaz and other gushehs have other centers.",
      sources: [sources.abuAta, sources.tradition]
    },
    "avaz.bayatTork": {
      shahed: 2, finalis: null, confidence: "partial",
      context: "Bayat-e Tork: the documented B-flat Shahed in the F-based mode maps to degree three of the displayed C-based Shur collection.",
      warning: "A single Finalis is not assigned here: concluding notes and cadences vary with gusheh and interpretation.",
      sources: [sources.bayatTork, sources.tradition]
    },
    "avaz.afshari": {
      shahed: 0, finalis: 3, confidence: "partial",
      context: "Afshari: in Farhat's example G is Shahed and C is Finalis; transposing a G-based Shur reference to C places them on degrees one and four.",
      warning: "The current Shur pitch collection DOES NOT contain Afshari's E-koron temporary Ist and its variable A-koron/A-natural. These markers are a role crosswalk, not a complete Afshari scale.",
      sources: [sources.afshari, sources.tradition]
    },
    "avaz.dashti": {
      shahed: 4, finalis: 0, confidence: "provisional",
      context: "Dashti introductory mode: proposed fifth-degree Shahed and Shur-related final center in this transposed display.",
      warning: "Dashti uses a variable pitch in some descriptions; the shared, fixed Shur circle does not render the complete melodic tuning. Source-specific finalis needs confirmation.",
      sources: [sources.shur, sources.tradition, sources.daramad]
    },
    minor: {
      tonic: 0, confidence: "documented",
      context: "Western natural minor for comparison; the first note is the Western tonic, not a Persian Shahed.",
      warning: "", sources: []
    }
  };

  const all = Object.fromEntries(Object.entries(context).map(([key, value]) => [
    key, Object.freeze({ ...value,
      localized: Object.freeze(Object.fromEntries(Object.entries(localizedText[key] || {}).map(([lang, fields]) => [lang, Object.freeze(fields)]))),
      sources: Object.freeze((value.sources || []).map(s => Object.freeze(s))) })
  ]));
  root.PERSIAN_MODAL_ROLE_DEGREES = Object.freeze(all);
  if (typeof module !== "undefined" && module.exports) module.exports = root.PERSIAN_MODAL_ROLE_DEGREES;
})(typeof window !== "undefined" ? window : globalThis);
