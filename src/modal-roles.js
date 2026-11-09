/* Reviewed modal-function annotations for the app's educational 7-note models.
 *
 * Indices refer to the ordered display pitches, ZERO-based, and transposition
 * preserves those indices. Function means shahed (recitation/emphasis tone)
 * or finalis / khatimeh (concluding pitch), NOT ist (temporary resting tone).
 *
 * "context" and "sources" explain why the assignment is meaningful. A full
 * dastgah includes many gushehs; these defaults are specifically for the
 * representative daramad/main mode rather than all its modulations.
 *
 * Incomplete entries intentionally remain null where no safe one-to-one
 * mapping from a published modal account to the app's model is established.
 */
(function (root) {
  "use strict";

  const roles = {
    Shur: {
      shahed: 0, finalis: 0,
      context: "Shur daramad (C-referenced transposition of central G); not all gushehs or related avazha",
      sources: ["https://www.iranicaonline.org/articles/shur-modal-system/"]
    },
    nava: {
      shahed: null, finalis: null,
      context: "Nava needs review: the app's 200- and 850-cent degrees differ from some documented daramad tunings",
      sources: ["https://www.iranicaonline.org/articles/shur-modal-system/"]
    },
    segah: {
      shahed: 2, finalis: 2,
      context: "Segah daramad, C-referenced model; third note E-koron",
      sources: ["https://openaccess.city.ac.uk/id/eprint/4149/2/Nooshin_PhD_thesis_volume_2.pdf", "https://tuning.ableton.com/persian-radif/dastgah-e-segah/"]
    },
    homayoun: {
      shahed: 1, finalis: 0,
      context: "Homayoun daramad, G-referenced: A-koron (shahed), G (finalis)",
      sources: ["https://www.iranicaonline.org/articles/homayun/"]
    },
    esfahan: {
      // Published F G A-koron B C D E-flat, cyclically re-anchored at C:
      // C D E-flat F G A-koron B = angles [0,60,90,150,210,255,330].
      shahed: 0, finalis: 4,
      context: "Bayat-e Esfahan daramad; C is Shahed, G is Finalis. Published F-anchored collection is identical under cyclic re-anchoring to the app's C-anchored collection.",
      sources: ["https://www.iranicaonline.org/articles/bayat-e-esfahan/"]
    },
    chahargah: {
      shahed: null, finalis: 0,
      context: "Chahargah daramad: first degree is a modal tonic/final reference; third and fifth are emphasized. Tonic is not automatically an exclusive Shahed.",
      sources: ["https://www.iranicaonline.org/articles/cahargah/"]
    },
    mahur: {
      shahed: null, finalis: null,
      context: "One shared Mahur/Rast Panjgah pitch collection cannot support a single unambiguous modal-role pair",
      sources: ["https://www.iranicaonline.org/articles/dastgah/"]
    },
    // Shur-associated avazha share some pitch material but have their own
    // modal centers and cadences. Preserve their separate identities; do
    // not copy the Shur daramad's marker defaults.
    "avaz.abuAta": {
      shahed: null, finalis: null,
      context: "Abu Ata: a Shur-related avaz; requires its own verified daramad model and role assignment",
      sources: ["https://www.iranicaonline.org/articles/shur-modal-system/"]
    },
    "avaz.bayatTork": {
      shahed: null, finalis: null,
      context: "Bayat-e Tork: distinct from Shur's primary daramad modal functions",
      sources: ["https://www.iranicaonline.org/articles/shur-modal-system/"]
    },
    "avaz.afshari": {
      shahed: null, finalis: null,
      context: "Afshari: reference daramad uses E-koron as Ist, G as Shahed, C as Finalis, but the application's Shur collection lacks its required E-koron degree",
      sources: ["https://www.iranicaonline.org/articles/afsari/"]
    },
    "avaz.dashti": {
      shahed: null, finalis: null,
      context: "Dashti: a Shur-related avaz with separate modal functions; model-to-role verification outstanding",
      sources: ["https://www.iranicaonline.org/articles/shur-modal-system/"]
    },
    // Natural minor is not a Persian modal system: annotate its Western tonic.
    minor: { tonic: 0, context: "Western natural-minor comparison" }
  };

  root.PERSIAN_MODAL_ROLE_DEGREES = Object.freeze(
    Object.fromEntries(
      Object.entries(roles).map(([name, value]) => [
        name, Object.freeze({ ...value, sources: Object.freeze(value.sources || []) })
      ])
    )
  );
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.PERSIAN_MODAL_ROLE_DEGREES;
  }
})(typeof window !== "undefined" ? window : globalThis);
