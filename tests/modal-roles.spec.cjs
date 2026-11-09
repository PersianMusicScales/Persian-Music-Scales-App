const { test, expect } = require("@playwright/test");

async function ready(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .dynamic-label")).toHaveCount(7);
  await expect(page.locator("#modalRoleButton")).toBeVisible();
  await expect(page.locator("#modalRolePopover")).toBeHidden();
  return errors;
}

test("all nine scale choices retain seven labeled pitches and role panel", async ({ page }) => {
  const errors = await ready(page);
  for (const name of ["Shur", "nava", "segah", "homayoun", "esfahan", "chahargah", "mahur", "rastPanjgah", "minor"]) {
    await page.locator("#scaleSelector").selectOption(name);
    await expect(page.locator("#outerScale .dynamic-label")).toHaveCount(7);
    await expect(page.locator("#modalRoleButton")).toBeVisible();
  }
  await expect(page.locator("#outerScale .dynamic-label.modal-tonic")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("Segah role marks survive pitch transposition and all languages", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("segah");
  const labels = page.locator("#outerScale .dynamic-label");
  const shahed = labels.nth(2);
  await expect(shahed).toHaveClass(/modal-shahed/);
  await expect(shahed).toHaveClass(/modal-finalis/);
  await expect(page.locator("#modalRoleLegend")).toContainText("Shahed");
  const noteBefore = await shahed.getAttribute("data-single-note");
  await page.locator("#circleContainer").click({ position: { x: 20, y: 20 } });
  await expect(labels.nth(2)).toHaveClass(/modal-shahed/);
  await expect(labels.nth(2)).toHaveClass(/modal-finalis/);
  const noteAfter = await labels.nth(2).getAttribute("data-single-note");
  expect(noteAfter).not.toBe(noteBefore);
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator("#modalRoleLegend")).toContainText("شاهد");
  await page.locator("#languageSelector").selectOption("fr");
  await expect(page.locator("#modalRoleLegend")).toContainText("Note finale");
  expect(errors).toEqual([]);
});

test("curated markers ignore preserved legacy browser overrides", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("persianMusicScales.modalRoles.v1", JSON.stringify({
      Shur: { shahed: 1, finalis: 3 },
      "avaz.afshari": { shahed: 4, finalis: 4 }
    }));
  });
  const errors = await ready(page);
  const labels = page.locator("#outerScale .dynamic-label");
  await expect(labels.nth(0)).toHaveClass(/modal-shahed/);
  await expect(labels.nth(0)).toHaveClass(/modal-finalis/);
  await expect(labels.nth(1)).not.toHaveClass(/modal-shahed/);
  await expect(page.getByRole("button", { name: /Edit markers|Close editor/i })).toHaveCount(0);
  await expect(page.locator(".modal-role-editor")).toHaveCount(0);
  await page.locator("#modalRoleButton").click();
  await expect(page.getByRole("button", { name: "Hide markers" })).toBeVisible();
  await expect(page.locator("#modalRoleLegend details")).toHaveCount(1);
  const saved = await page.evaluate(() => localStorage.getItem("persianMusicScales.modalRoles.v1"));
  expect(JSON.parse(saved).Shur.shahed).toBe(1);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-shahed/);
  expect(errors).toEqual([]);
});

test("playback and analyzer drawer do not destroy modal markers", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("segah");
  await page.locator("#playScale").click();
  await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveClass(/modal-shahed/);
  await page.locator("#openAudioAnalyzer").click();
  await expect(page.locator("#audioAnalyzerDrawer")).toHaveClass(/open/);
  await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveClass(/modal-shahed/);
  await page.locator("#closeAudioAnalyzer").click();
  await expect(page.locator("#audioAnalyzerDrawer")).not.toHaveClass(/open/);
  await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveClass(/modal-finalis/);
  expect(errors).toEqual([]);
});

test("short synthesized recording passes through analyzer and preserves modal markers", async ({ page }) => {
  test.setTimeout(120000);
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("segah");
  await page.locator("#openAudioAnalyzer").click();
  const sampleRate = 16000;
  const seconds = 6;
  const sampleCount = sampleRate * seconds;
  const pcm = Buffer.alloc(44 + sampleCount * 2);
  pcm.write("RIFF", 0); pcm.writeUInt32LE(pcm.length - 8, 4);
  pcm.write("WAVEfmt ", 8); pcm.writeUInt32LE(16, 16);
  pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(sampleRate, 24); pcm.writeUInt32LE(sampleRate * 2, 28);
  pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34);
  pcm.write("data", 36); pcm.writeUInt32LE(sampleCount * 2, 40);
  const freqs = [261.63, 329.63 * Math.pow(2, -50/1200), 349.23, 392, 349.23, 329.63 * Math.pow(2, -50/1200)];
  for (let i = 0; i < sampleCount; ++i) {
    const t = i / sampleRate;
    const f = freqs[Math.min(freqs.length - 1, Math.floor(t))];
    const fade = Math.min(1, (t % 1) * 15, (1 - (t % 1)) * 15);
    pcm.writeInt16LE(Math.round(12000 * fade * Math.sin(2 * Math.PI * f * t)), 44 + i * 2);
  }
  await page.locator("#trackFileInput").setInputFiles({
    name: "synthetic-melody.wav",
    mimeType: "audio/wav",
    buffer: pcm
  });
  await expect(page.locator("#analysisStatus")).not.toContainText("Load a track to begin.", { timeout: 20000 });
  await expect.poll(async () =>
    (await page.locator("#analysisProgressLabel").innerText()).trim(),
    { timeout: 85000, message: "Analyzer did not finish processing the synthetic recording" }
  ).toBe("100%");
  await page.locator("#scaleSelector").selectOption("segah");
  await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveClass(/modal-shahed/);
  expect(errors).toEqual([]);
});

test("Shur-related avaz contexts switch curated markers without manual editing", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#avazhaButton").click();
  const afshari = page.locator('.avazha-item[data-translate="avazha.afshari"]');
  await afshari.click();
  await expect(afshari).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#modalRoleLegend")).toContainText("Afshari");
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-shahed/);
  await expect(page.locator("#outerScale .dynamic-label").nth(3)).toHaveClass(/modal-finalis/);
  await expect(page.locator("#modalRoleLegend .modal-role-editor")).toHaveCount(0);
  await afshari.click();
  await expect(afshari).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-shahed/);
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-finalis/);
  await afshari.click();
  await expect(page.locator("#outerScale .dynamic-label").nth(3)).toHaveClass(/modal-finalis/);
  expect(errors).toEqual([]);
});

test("Mahur and Rast-Panjgah are distinct modal identities sharing one collection", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("mahur");
  const mahur = await page.locator("#outerScale .dynamic-label").evaluateAll(
    nodes => nodes.map(n => n.dataset.singleNote)
  );
  await expect(page.locator("#modalRoleLegend")).toContainText("Mahur darāmad");
  await page.locator("#scaleSelector").selectOption("rastPanjgah");
  const rast = await page.locator("#outerScale .dynamic-label").evaluateAll(
    nodes => nodes.map(n => n.dataset.singleNote)
  );
  expect(rast).toEqual(mahur);
  await expect(page.locator("#modalRoleLegend")).toContainText("Rast-Panjgah");
  await expect(page.locator("#modalRoleLegend")).toContainText("Provisional model");
  expect(errors).toEqual([]);
});

test("modal function markers may be hidden and restored, retaining preference", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("segah");
  const legend = page.locator("#modalRoleLegend");
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(1);
  await page.locator("#modalRoleButton").click();
  await page.getByRole("button", { name: "Hide markers" }).click();
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(0);
  await expect(legend).toContainText("Show markers");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(0);
  await page.locator("#modalRoleButton").click();
  await page.getByRole("button", { name: "Show markers" }).click();
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("modal citations and model limitations are accessible for provisional contexts", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("nava");
  const d = page.locator("#modalRoleLegend details");
  await page.locator("#modalRoleButton").click();
  await d.locator("summary").click();
  await expect(d).toContainText("Provisional model");
  await expect(d).toContainText("Direct note-by-note verification");
  await expect(d.locator("a[href^='https://']")).not.toHaveCount(0);
  expect(errors).toEqual([]);
});

test("audio analyzer manual modes include Rast-Panjgah without false automatic certainty", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#openAudioAnalyzer").click();
  await expect(page.locator("#manualScaleSelect")).toHaveCount(0);
  const options = await page.locator("#manualScale").locator("option").allTextContents();
  expect(options.some(name => name.includes("Rast"))).toBeTruthy();
  expect(errors).toEqual([]);
});

test("all dastgah, avaz and minor explanations and citations switch between EN, FA and FR", async ({ page }) => {
  const errors = await ready(page);
  const expected = require("../src/modal-roles.js");
  const scales = ["Shur", "nava", "segah", "homayoun", "esfahan", "chahargah", "mahur", "rastPanjgah", "minor"];

  async function verify(key) {
    const item = expected[key];
    const details = page.locator("#modalRoleLegend details");
    for (const lang of ["en", "fa", "fr"]) {
      await page.locator("#languageSelector").selectOption(lang);
      const panel = page.locator("#modalRoleLegend details");
      if (await page.locator("#modalRolePopover").isHidden()) await page.locator("#modalRoleButton").click();
      await panel.locator("summary").click();
      await expect(panel).toHaveAttribute("open", "");
      await expect(panel).toHaveAttribute("dir", lang === "fa" ? "rtl" : "ltr");
      const context = lang === "en" ? item.context : item.localized[lang].context;
      const warning = lang === "en" ? item.warning : item.localized[lang].warning;
      await expect(panel).toContainText(context);
      if (warning) await expect(panel).toContainText(warning);
      const actualSources = await panel.locator("a").allTextContents();
      const expectedSources = item.sources.map(s => lang === "fa" ? s.labelFa : lang === "fr" ? s.labelFr : s.label);
      expect(actualSources).toEqual(expectedSources);
    }
    await page.locator("#languageSelector").selectOption("en");
  }

  for (const scale of scales) {
    await page.locator("#scaleSelector").selectOption(scale);
    await verify(scale);
  }

  await page.locator("#scaleSelector").selectOption("Shur");
  await page.locator("#avazhaButton").click();
  for (const avaz of ["abuAta", "bayatTork", "afshari", "dashti"]) {
    await page.locator('.avazha-item[data-translate="avazha.' + avaz + '"]').click();
    await verify("avaz." + avaz);
    await page.locator('.avazha-item[data-translate="avazha.' + avaz + '"]').click();
  }
  expect(errors).toEqual([]);
});

test("modal information popover stays out of layout and does not rotate the circle", async ({ page }) => {
  const errors = await ready(page);
  const circle = page.locator("#circleContainer");
  const play = page.locator("#playScale");
  const microphone = page.locator("#quickScaleFinderButton");
  const labelBefore = await page.locator("#outerScale .dynamic-label").first().getAttribute("data-single-note");
  const circleBox = await circle.boundingBox();
  const playBefore = await play.boundingBox();
  const microphoneBefore = await microphone.boundingBox();
  const button = page.locator("#modalRoleButton");
  await button.click();
  await expect(page.locator("#modalRolePopover")).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#modalRoleLegend")).toContainText("Shahed");
  expect(await page.locator("#outerScale .dynamic-label").first().getAttribute("data-single-note")).toBe(labelBefore);
  const playAfter = await play.boundingBox();
  const microphoneAfter = await microphone.boundingBox();
  const circleAfter = await circle.boundingBox();
  expect(Math.abs(playAfter.y - playBefore.y)).toBeLessThan(2);
  expect(Math.abs(microphoneAfter.y - microphoneBefore.y)).toBeLessThan(2);
  expect(Math.abs(circleAfter.y - circleBox.y)).toBeLessThan(2);
  await page.keyboard.press("Escape");
  await expect(page.locator("#modalRolePopover")).toBeHidden();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await page.locator("header h1").click();
  await expect(page.locator("#modalRolePopover")).toBeHidden();
  expect(errors).toEqual([]);
});

test("iPhone Home Screen icon and project-scoped PWA manifest are configured", async ({ page }) => {
  const errors = await ready(page);
  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  expect(href).toBe("assets/icons/icon-192x192.png");
  const png = await page.request.get("/assets/icons/icon-192x192.png");
  expect(png.ok()).toBe(true);
  expect(png.headers()["content-type"]).toContain("image/png");
  const bytes = await png.body();
  expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const manifestRes = await page.request.get("/manifest.json");
  const manifest = await manifestRes.json();
  expect(manifest.scope).toBe("./");
  expect(manifest.start_url).toBe("./index.html");
  expect(manifest.id).toBe("./index.html");
  expect(errors).toEqual([]);
});
