"use strict";

globalThis.PersianV4Panel = (() => {
  const el = id => document.getElementById(id);
  const names = {
    en: { abu_ata: "Abu Ata", afshari: "Afshari", bayat_tork: "Bayat-e Tork", chahargah: "Chahargah",
      dashti: "Dashti", esfahan: "Bayat-e Esfahan", homayoun: "Homayoun", mahur: "Mahur", nava: "Nava",
      rast_panjgah: "Rast-Panjgah", segah: "Segah", shur: "Shur" },
    fa: { abu_ata: "ابوعطا", afshari: "افشاری", bayat_tork: "بیات ترک", chahargah: "چهارگاه",
      dashti: "دشتی", esfahan: "بیات اصفهان", homayoun: "همایون", mahur: "ماهور", nava: "نوا",
      rast_panjgah: "راست‌پنجگاه", segah: "سه‌گاه", shur: "شور" }
  };
  const words = {
    en: { heading: "Mode recognition · V4", waiting: "Comparing passages…", details: "Opening and passage results",
      agreement: (s, n) => `${s} of ${n} passages favor this mode.`, single: "One eligible passage. The mode is tentative.",
      mixed: "Passages suggest different modes", family: f => `The leading modes belong to the ${f} family.`,
      insufficient: "Too little varied pitch to identify a mode", opening: "Opening minute", skip: "Insufficient varied pitch",
      minor: "Natural Minor", pitch: "Pitch collection and tonic", minorSupport: (s, n) => `Natural Minor pitch and tonic in ${s} of ${n} passages.`,
      possible: "The pitches also fit Natural Minor. Tonic or passage agreement is uncertain.", kdc: "KDC mode estimate",
      absent: "Insufficient evidence for Natural Minor.", unavailable: "V4 could not finish. The scale and tonic matcher is still available.",
      reserved: "This recording is reserved for the KDC final evaluation." },
    fr: { heading: "Reconnaissance du mode · V4", waiting: "Comparaison des passages…", details: "Résultats par passage et pour l’ouverture",
      agreement: (s, n) => `${s} passages sur ${n} suggèrent ce mode.`, single: "Un seul passage exploitable. Le mode reste incertain.",
      mixed: "Les passages suggèrent des modes différents", family: f => `Les modes proposés appartiennent à la famille ${f}.`,
      insufficient: "Trop peu de hauteurs distinctes pour identifier un mode", opening: "Première minute", skip: "Trop peu de hauteurs distinctes",
      minor: "Mineur naturel", pitch: "Notes et tonique", minorSupport: (s, n) => `Notes et tonique du mineur naturel dans ${s} passages sur ${n}.`,
      possible: "Les notes sont aussi compatibles avec le mineur naturel. La tonique ou l’accord entre passages reste incertain.", kdc: "Mode estimé par le KDC",
      absent: "Indices insuffisants pour le mineur naturel.", unavailable: "V4 n’a pas pu terminer. L’estimation de la gamme et de la tonique reste disponible.",
      reserved: "Cet enregistrement est réservé à l’évaluation finale du KDC." },
    fa: { heading: "تشخیص دستگاه و آواز · V4", waiting: "در حال مقایسهٔ بخش‌های ضبط…", details: "نتیجهٔ آغاز ضبط و بخش‌ها",
      agreement: (s, n) => `${s} بخش از ${n} بخش این دستگاه یا آواز را پیشنهاد می‌کنند.`, single: "فقط یک بخش قابل بررسی بود. نتیجه مقدماتی است.",
      mixed: "بخش‌ها دستگاه‌ها یا آوازهای متفاوتی را پیشنهاد می‌کنند", family: f => `نتیجه‌های اصلی از خانوادهٔ ${f} هستند.`,
      insufficient: "تنوع نت‌ها برای تشخیص کافی نیست", opening: "دقیقهٔ نخست", skip: "تنوع نت‌ها کافی نیست",
      minor: "مینور طبیعی", pitch: "مجموعهٔ نت‌ها و تونیک", minorSupport: (s, n) => `نت‌ها و تونیک در ${s} بخش از ${n} بخش با مینور طبیعی سازگارند.`,
      possible: "نت‌ها با مینور طبیعی هم سازگارند. تونیک یا توافق بین بخش‌ها روشن نیست.", kdc: "پیشنهاد مدل KDC",
      absent: "شواهد کافی برای مینور طبیعی وجود ندارد.", unavailable: "تحلیل V4 کامل نشد. نتیجهٔ تطبیق گام و تونیک همچنان در دسترس است.",
      reserved: "این ضبط برای ارزیابی نهایی KDC کنار گذاشته شده است." }
  };
  let language = "en", job = null, report = null, phase = "", noteName = () => "";
  const modeName = id => (names[language] || names.en)[id] || id;
  function winners(ranking) {
    if (!ranking.length) return "";
    return ranking.filter(r => ranking[0].score - r.score <= 1e-12).map(r => modeName(r.label)).join(" / ");
  }
  function clock(s) {
    const ticks = Math.round(s * 10);
    return Math.floor(ticks / 600) + ":" + String(Math.floor(ticks / 10) % 60).padStart(2, "0") + "." + ticks % 10;
  }
  function render() {
    const panel = el("v4Panel");
    if (!panel) return;
    panel.hidden = !phase;
    if (!phase) return;
    const w = words[language];
    el("v4Heading").textContent = w.heading;
    el("v4Details").hidden = !report;
    el("v4Explanation").textContent = "";
    if (!report) { el("v4Result").textContent = w[phase]; return; }
    const { candidate: c, minor, baseline, passages } = report;
    const minorLeads = minor?.status === "supported";
    const modal = c.status === "single" || c.status === "agreement" ? winners(c.ranking) : w[c.status];
    const title = minorLeads ? `${w.minor} · ${noteName(minor.tonic)}` : modal;
    el("v4Result").textContent = title;
    const support = c.status === "agreement" ? w.agreement(c.support, c.usable) : c.status === "single" ? w.single :
      c.family ? w.family(modeName(c.family)) : "";
    const why = minorLeads ? w.minorSupport(minor.support, minor.usable) : support;
    el("v4Explanation").textContent = [why, minor?.status === "possible" ? w.possible : ""].filter(Boolean).join(" ");
    el("v4DetailsLabel").textContent = w.details;
    const list = el("v4Passages");
    list.replaceChildren();
    const add = (title, value) => {
      const dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = title; dd.textContent = value;
      list.append(dt, dd);
    };
    if (minorLeads) add(w.kdc, [modal, support].filter(Boolean).join(" · "));
    add(w.opening + " · " + clock(baseline.start) + "–" + clock(baseline.end), winners(baseline.ranking) || w.skip);
    for (const p of passages) add(clock(p.start) + "–" + clock(p.end), p.excluded ? w.skip : winners(p.ranking));
    if (!minorLeads) add(w.pitch, minor ? w.possible : w.absent);
  }

  function reset() {
    if (job) job.terminate();
    job = null; report = null; phase = "";
    if (el("v4Details")) el("v4Details").open = false;
    render();
  }

  async function renderMono(buffer, start, end, rate) {
    const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const length = Math.max(1, Math.round((end - start) * rate));
    const context = new Offline(1, length, rate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0, start);
    const rendered = await context.startRendering();
    return rendered.getChannelData(0);
  }

  async function energyLevels(buffer, worker) {
    const length = Math.round(buffer.duration * 8000);
    const levels = new Float64Array(Math.ceil(length / 800));
    // Resample one minute at a time so a long upload does not allocate a second full audio buffer.
    for (let offset = 0; offset < length; offset += 480000) {
      if (worker !== job) return null;
      const size = Math.min(480000, length - offset);
      const samples = await renderMono(buffer, offset / 8000, (offset + size) / 8000, 8000);
      for (let a = 0; a < samples.length; a += 800) {
        const end = Math.min(samples.length, a + 800);
        let sum = 0;
        for (let i = a; i < end; i++) {
          const v = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768))) / 32768;
          sum += v * v;
        }
        levels[(offset + a) / 800] = Math.sqrt(sum / (end - a));
      }
    }
    return levels;
  }

  function run(buffer, filename, pitchName, onComplete) {
    reset();
    noteName = pitchName;
    phase = "waiting"; render();
    let worker;
    try { worker = new Worker("src/v4-recognition.worker.js"); }
    catch { phase = "unavailable"; render(); return; }
    job = worker;
    const finish = (status, value = null) => {
      if (worker !== job) return;
      worker.terminate(); job = null; phase = status; report = value;
      render();
      if (value) onComplete(value);
    };
    worker.onerror = () => finish("unavailable");
    worker.onmessage = async ({ data }) => {
      if (worker !== job) return;
      try {
        if (data.type === "envelope") {
          const levels = await energyLevels(buffer, worker);
          if (worker === job) worker.postMessage({ type: "levels", levels, duration: buffer.duration }, [levels.buffer]);
        } else if (data.type === "interval") {
          const samples = await renderMono(buffer, data.span[0], data.span[1], 16000);
          if (worker === job) worker.postMessage({ type: "samples", samples }, [samples.buffer]);
        } else if (data.type === "complete") finish("done", data.result);
        else finish(data.type === "reserved" ? "reserved" : "unavailable");
      } catch { finish("unavailable"); }
    };
    worker.postMessage({ type: "start", filename });
  }
  return { run, reset, setLanguage(lang) { language = words[lang] ? lang : "en"; render(); },
    get result() { return report; } };
})();
