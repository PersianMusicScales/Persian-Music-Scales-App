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
      sources: ["https://fis-iran.org/ebook/persian-system-of-modes/"]
    },
    segah: {
      shahed: 2, finalis: 2,
      context: "Segah daramad, C-referenced model; third note E-koron",
      sources: ["https://www.persianney.com/technique.html"]
    },
    homayoun: {
      shahed: 1, finalis: 0,
      context: "Homayoun daramad, G-referenced: A-koron (shahed), G (finalis)",
      sources: ["https://www.iranicaonline.org/articles/homayun/"]
    },
    esfahan: {
      shahed: 0, finalis: 4,
      context: "Bayat-e Esfahan daramad, C-referenced: C (shahed), G (finalis)",
      sources: ["https://www.iranicaonline.org/articles/bayat-e-esfahan/"]
    },
    chahargah: {
      shahed: 0, finalis: 0,
      context: "Chahargah daramad, C-referenced first-degree center",
      sources: ["https://www.iranicaonline.org/articles/cahargah/", "https://fis-iran.org/ebook/persian-system-of-modes/"]
    },
    mahur: {
      shahed: null, finalis: null,
      context: "One shared Mahur/Rast Panjgah pitch collection cannot support a single unambiguous modal-role pair",
      sources: ["https://www.iranicaonline.org/articles/dastgah/"]
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
