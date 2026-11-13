/* Opt-in 12-class research panel. Separate from the existing scale matcher.
 * No source audio leaves the computer; local server must be started explicitly.
 * This is a draft PR experiment and NOT a validated 12-class recognizer.
 */
(() => {
  "use strict";

  const MODE_LABELS = Object.freeze({
    shur: ["Shur", "Dastgah"],
    mahur: ["Mahur", "Dastgah"],
    homayoun: ["Homayoun", "Dastgah"],
    segah: ["Segah", "Dastgah"],
    chahargah: ["Chahargah", "Dastgah"],
    nava: ["Nava", "Dastgah"],
    rast_panjgah: ["Rast-Panjgah", "Dastgah"],
    abu_ata: ["Abu Ata", "Avaz"],
    bayat_tork: ["Bayat-e Tork", "Avaz"],
    afshari: ["Afshari", "Avaz"],
    dashti: ["Dashti", "Avaz"],
    esfahan: ["Bayat-e Esfahan", "Avaz"]
  });
  const EXPECTED = Object.keys(MODE_LABELS);
  const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
  const ENDPOINT = "http://127.0.0.1:8765";
  const anchor = document.getElementById("bestMatch");
  if (!anchor || !anchor.parentNode) return;

  const section = document.createElement("section");
  section.id = "local12ModePanel";
  section.setAttribute("aria-label", "Experimental twelve-category mode recognition");
  section.style.cssText = "margin-top:20px;padding:18px;border:1px solid #a8b9c8;border-radius:13px;background:rgba(120,140,160,.07);";
  const heading = document.createElement("h3");
  heading.textContent = "12 Dastgah and Avaz categories — experimental";
  heading.style.margin = "0 0 10px";
  const explanation = document.createElement("p");
  explanation.textContent = "The scale matches above are pitch-collection estimates, not Dastgah/Avaz identification. This separate local model considers all 12 categories. Its accuracy is limited and results may be wrong.";
  const catalog = document.createElement("p");
  catalog.style.cssText = "font-size:.88em;line-height:1.65;";
  catalog.textContent = "7 Dastgahs: Shur, Mahur, Homayoun, Segah, Chahargah, Nava, Rast-Panjgah. 5 Avazha: Abu Ata, Bayat-e Tork, Afshari, Dashti, Bayat-e Esfahan.";
  const instruction = document.createElement("p");
  instruction.style.cssText = "font-size:.88em";
  instruction.textContent = LOCAL
    ? "After starting the local Python recognizer on port 8765, use the button below. Audio is uploaded only when you click; the server runs on this PC."
    : "To use the experimental model, open this GitHub PR branch on your PC using the local Python static server, and start the recognition server separately.";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Run 12-category local analysis";
  button.disabled = true;
  button.style.cssText = "padding:10px 14px;border-radius:8px;cursor:pointer;margin-top:5px;";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = LOCAL ? "Analyze a recording in the audio analyzer first." : "Local PC mode required.";
  const results = document.createElement("div");
  results.setAttribute("aria-live", "polite");
  section.append(heading, explanation, catalog, instruction, button, status, results);
  anchor.insertAdjacentElement("afterend", section);

  let latestFile = null;
  let generation = -1;
  let requestId = 0;
  let abortController = null;

  function cancelCurrent() {
    requestId += 1;
    if (abortController) abortController.abort();
    abortController = null;
    results.replaceChildren();
  }
  window.addEventListener("persian:analysis-reset", () => {
    cancelCurrent();
    latestFile = null;
    generation = -1;
    button.disabled = true;
    status.textContent = LOCAL ? "Analyze a recording in the audio analyzer first." : "Local PC mode required.";
  });
  window.addEventListener("persian:analysis-complete", event => {
    cancelCurrent();
    latestFile = event.detail?.file instanceof File ? event.detail.file : null;
    generation = event.detail?.generation ?? -1;
    button.disabled = !LOCAL || !latestFile;
    status.textContent = latestFile
      ? "Ready. Press the button to request 12-category analysis (not validated)."
      : "No source file is available for local 12-category analysis.";
  });

  button.addEventListener("click", async () => {
    if (!LOCAL || !latestFile || button.disabled) return;
    const file = latestFile;
    const activeGeneration = generation;
    const id = ++requestId;
    const controller = new AbortController();
    abortController = controller;
    button.disabled = true;
    results.replaceChildren();
    status.textContent = "Analyzing with the local 12-category model…";
    try {
      const response = await fetch(ENDPOINT + "/analyze", {
        method: "POST",
        headers: { "X-Filename": encodeURIComponent(file.name) },
        body: file,
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Local analysis failed");
      if (id !== requestId || latestFile !== file || generation !== activeGeneration) return;
      const ranked = data.ranked;
      if (!Array.isArray(ranked) || ranked.length !== 12 ||
          new Set(ranked.map(row => row.label)).size !== 12 ||
          !EXPECTED.every(label => ranked.some(row => row.label === label))) {
        throw new Error("Server did not return all 12 required categories");
      }
      const title = document.createElement("h4");
      title.textContent = "Experimental ranking — all 12 categories";
      const ordered = document.createElement("ol");
      for (const row of ranked) {
        const entry = document.createElement("li");
        const label = MODE_LABELS[row.label];
        const score = Number(row.vote_fraction);
        entry.textContent = label[0] + " (" + label[1] + ") — " +
          (Number.isFinite(score) ? (100 * score).toFixed(1) + "% tree votes" : "unavailable");
        entry.style.marginBottom = "6px";
        ordered.append(entry);
      }
      const caveat = document.createElement("p");
      caveat.style.fontSize = ".85em";
      caveat.textContent = "These tree-vote shares are NOT calibrated probabilities. The model may confuse related Avazha and Dastgahs. Do not treat the highest rank as an established musical identification.";
      results.append(title, ordered, caveat);
      status.textContent = "Local analysis complete. Existing scale-matcher results above are unchanged.";
    } catch (error) {
      if (id !== requestId) return;
      if (error.name !== "AbortError") {
        status.textContent = "Could not run the local 12-category model: " + error.message +
          ". Start the frozen Python server at 127.0.0.1:8765 and keep both local servers running.";
      }
    } finally {
      if (id === requestId) {
        abortController = null;
        button.disabled = !latestFile || !LOCAL;
      }
    }
  });
})();
