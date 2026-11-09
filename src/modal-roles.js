/* Modal function annotations for the selected pitch-collection model.
 * Degree indices are zero-based and stay attached to the scale during
 * transposition, rather than to an absolute note name.
 *
 * Null means "not yet validated for the stated reference model". Do not
 * equate the 12-o'clock diagram anchor with Shahed or Finalis.
 * A dastgah may contain several gushehs with different modal functions.
 *
 * The combined Mahur / Rast Panjgah selector needs distinct modal contexts
 * before a single authoritative role assignment can be published.
 */
(function (root) {
  "use strict";

  const modalRoles = {
    Shur: { shahed: null, finalis: null },
    nava: { shahed: null, finalis: null },
    segah: {
      // Segah daramad with C-referenced notes: C, D, E-koron, F, G, A-koron, Bb.
      // The third displayed degree (E-koron) is the modal center/finalis.
      shahed: 2,
      finalis: 2,
      context: "Segah daramad, C-referenced model"
    },
    homayoun: { shahed: null, finalis: null },
    esfahan: { shahed: null, finalis: null },
    chahargah: { shahed: null, finalis: null },
    mahur: { shahed: null, finalis: null },
    // Natural minor is a Western comparison scale: tonic, not Shahed.
    minor: { tonic: 0 }
  };

  root.PERSIAN_MODAL_ROLE_DEGREES = Object.freeze(
    Object.fromEntries(
      Object.entries(modalRoles).map(([name, value]) => [name, Object.freeze(value)])
    )
  );

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.PERSIAN_MODAL_ROLE_DEGREES;
  }
})(typeof window !== "undefined" ? window : globalThis);
