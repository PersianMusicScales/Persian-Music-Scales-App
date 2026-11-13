/* Temporary, removable PR #37 local diagnostics panel.
 * Only injected by tools/local_diagnostics_server.py on localhost.
 * Select multiple files in one group; each is analyzed by the EXISTING
 * browser Worker and a JSON-only report is saved locally by Python.
 */
(() => {
  "use strict";
  if (!["localhost", "127.0.0.1"].includes(location.hostname)) return;
  const query = new URLSearchParams(location.search);
  if (query.get("avazDebug") !== "1" || query.get("autoSave") !== "1") return;

  const panel = document.createElement("section");
  panel.setAttribute("aria-label", "Local Persian modal diagnostic capture");
  panel.style.cssText = [
    "position:fixed", "right:16px", "bottom:16px", "z-index:2147483000",
    "background:#14263b", "color:#fff", "border:1px solid #6680a1",
    "border-radius:12px", "padding:14px", "width:min(350px,calc(100vw - 32px))",
    "box-shadow:0 8px 30px rgba(0,0,0,.4)",
    "font:14px/1.4 system-ui,Segoe UI,sans-serif",
  ].join(";");
  const title = document.createElement("strong");
  title.textContent = "Local Āvāz test — PR #37";
  title.style.display = "block";
  title.style.marginBottom = "4px";
  const subtitle = document.createElement("div");
  subtitle.textContent = "Automatic JSON reports saved to local-diagnostic-reports/";
  subtitle.style.cssText = "font-size:12px;opacity:.85;margin-bottom:8px";
  const modeLabel = document.createElement("label");
  modeLabel.textContent = "Known musical mode for these recordings";
  modeLabel.style.cssText = "display:block;font-size:12px;margin-bottom:4px";
  const modeSelect = document.createElement("select");
  const modes = [
    ["unknown", "Unknown / not labeled"], ["shur", "Shur"],
    ["abuAta", "Abu Ata"], ["bayatTork", "Bayat-e Tork"],
    ["afshari", "Afshari"], ["dashti", "Dashti"],
    ["homayoun", "Homayoun"], ["esfahan", "Bayat-e Esfahan"],
    ["segah", "Segah"], ["nava", "Nava"],
    ["chahargah", "Chahargah"], ["mahur", "Mahur"],
  ];
  for (const [value, label] of modes) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    modeSelect.append(option);
  }
  modeSelect.style.cssText = "display:block;width:100%;padding:6px;margin-bottom:10px;color:#111";
  const inputLabel = document.createElement("label");
  inputLabel.textContent = "Select one or more audio recordings";
  inputLabel.style.cssText = "display:block;font-size:12px;margin-bottom:4px";
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = "audio/*,.wav,.flac,.mp3,.m4a,.ogg,.aac,.webm";
  input.style.cssText = "display:block;max-width:100%;font-size:12px;margin-bottom:10px";
  const runButton = document.createElement("button");
  runButton.type = "button";
  runButton.textContent = "Analyze files and save reports";
  runButton.style.cssText = "background:#d9eafe;color:#102741;border:0;border-radius:7px;padding:9px 12px;cursor:pointer;font-weight:650";
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.style.cssText = "font-size:12px;margin-top:8px;white-space:pre-wrap;word-break:break-word";
  status.textContent = "Checking local report collector…";
  panel.append(title, subtitle, modeLabel, modeSelect, inputLabel, input, runButton, status);
  document.body.appendChild(panel);

  let running = false;
  let completed = 0;
  let failed = 0;
  const setStatus = message => { status.textContent = message; };

  function waitForReport(filename) {
    let listener;
    let timer;
    const promise = new Promise(resolve => {
      listener = event => {
        if (event.detail?.fileName !== filename) return;
        clearTimeout(timer);
        window.removeEventListener("persian-avaz-diagnostic-finished", listener);
        resolve(event.detail);
      };
      window.addEventListener("persian-avaz-diagnostic-finished", listener);
      timer = setTimeout(() => {
        window.removeEventListener("persian-avaz-diagnostic-finished", listener);
        resolve({ ok: false, fileName: filename, reason: "Timed out after 5 minutes" });
      }, 300000);
    });
    return { promise, cancel: () => {
      clearTimeout(timer);
      window.removeEventListener("persian-avaz-diagnostic-finished", listener);
    }};
  }

  async function checkServer() {
    try {
      const response = await fetch("/__avaz_health", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ready) throw Error("Collector unavailable");
      setStatus("Ready. Choose a mode, select files, then click Analyze.");
      return true;
    } catch (error) {
      setStatus("Local collector unavailable. Start with: py tools\\local_diagnostics_server.py");
      runButton.disabled = true;
      return false;
    }
  }

  window.addEventListener("persian-avaz-diagnostic-started", event => {
    if (!running) setStatus("Analyzing: " + (event.detail?.fileName || "recording"));
  });
  window.addEventListener("persian-avaz-diagnostic-finished", event => {
    if (!running) {
      const detail = event.detail || {};
      setStatus(detail.ok
        ? "Saved report: " + (detail.savedFile || "local-diagnostic-reports/")
        : "Could not save report: " + (detail.reason || "unknown issue"));
    }
  });

  runButton.addEventListener("click", async () => {
    if (running) return;
    const files = [...input.files];
    if (!files.length) {
      setStatus("Please select one or more FLAC, WAV, MP3 or other audio recordings.");
      return;
    }
    if (typeof window.__localAvazAnalyzeFile !== "function") {
      setStatus("Analyzer hook missing. Use the newest PR #37 ZIP and reload.");
      return;
    }
    const selectedLabel = modeSelect.value;
    running = true;
    window.__localAvazBatchRunning = true;
    completed = 0;
    failed = 0;
    runButton.disabled = true;
    input.disabled = true;
    modeSelect.disabled = true;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        window.__localAvazGroundTruth = selectedLabel;
        setStatus("Analyzing " + (i + 1) + "/" + files.length + ": " + file.name);
        const waiter = waitForReport(file.name);
        try {
          const loaded = await window.__localAvazAnalyzeFile(file);
          if (loaded === false) {
            waiter.cancel();
            failed++;
            continue;
          }
          const result = await waiter.promise;
          if (result.ok) completed++;
          else failed++;
        } catch (error) {
          waiter.cancel();
          failed++;
        }
        setStatus("Completed: " + completed + " saved, " + failed + " failed. " +
          (i+1) + "/" + files.length + " files processed.");
      }
      setStatus("Finished. " + completed + " reports saved; " + failed +
        " failed.\nFind the JSON files in local-diagnostic-reports/ in this app folder.");
    } finally {
      running = false;
      window.__localAvazBatchRunning = false;
      runButton.disabled = false;
      input.disabled = false;
      modeSelect.disabled = false;
    }
  });
  checkServer();
})();
