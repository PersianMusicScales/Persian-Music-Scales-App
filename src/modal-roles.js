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
    key, Object.freeze({ ...value, sources: Object.freeze((value.sources || []).map(s => Object.freeze(s))) })
  ]));
  root.PERSIAN_MODAL_ROLE_DEGREES = Object.freeze(all);
  if (typeof module !== "undefined" && module.exports) module.exports = root.PERSIAN_MODAL_ROLE_DEGREES;
})(typeof window !== "undefined" ? window : globalThis);
