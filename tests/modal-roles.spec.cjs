const { test, expect } = require("@playwright/test");

async function ready(page) {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .dynamic-label")).toHaveCount(7);
  await expect(page.locator("#modalRoleLegend")).toBeVisible();
  return errors;
}

test("all nine scale choices retain seven labeled pitches and role panel", async ({ page }) => {
  const errors = await ready(page);
  for (const name of ["Shur", "nava", "segah", "homayoun", "esfahan", "chahargah", "mahur", "rastPanjgah", "minor"]) {
    await page.locator("#scaleSelector").selectOption(name);
    await expect(page.locator("#outerScale .dynamic-label")).toHaveCount(7);
    await expect(page.locator("#modalRoleLegend")).toBeVisible();
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

test("role editor saves and restores an assignment without touching the source data", async ({ page }) => {
  const errors = await ready(page);
  await page.getByRole("button", { name: "Edit markers" }).click();
  await page.locator(".modal-role-editor select").first().selectOption("1");
  await page.locator(".modal-role-editor select").nth(1).selectOption("3");
  await expect(page.locator("#outerScale .dynamic-label").nth(1)).toHaveClass(/modal-shahed/);
  await expect(page.locator("#outerScale .dynamic-label").nth(3)).toHaveClass(/modal-finalis/);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .dynamic-label").nth(1)).toHaveClass(/modal-shahed/);
  await expect(page.locator("#outerScale .dynamic-label").nth(3)).toHaveClass(/modal-finalis/);
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

test("Shur-related avaz modal contexts are separate and user-editable", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#avazhaButton").click();
  const afshari = page.locator('.avazha-item[data-translate="avazha.afshari"]');
  await afshari.click();
  await expect(afshari).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#modalRoleLegend")).toContainText("Afshari");
  await expect(page.locator("#outerScale .dynamic-label.modal-shahed")).toHaveCount(1);
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-shahed/);
  await expect(page.locator("#outerScale .dynamic-label").nth(3)).toHaveClass(/modal-finalis/);
  await page.getByRole("button", { name: "Edit markers" }).click();
  await page.locator(".modal-role-editor select").first().selectOption("4");
  await expect(page.locator("#outerScale .dynamic-label").nth(4)).toHaveClass(/modal-shahed/);
  await afshari.click();
  await expect(page.locator("#outerScale .dynamic-label").nth(0)).toHaveClass(/modal-shahed/);
  await afshari.click();
  await expect(page.locator("#outerScale .dynamic-label").nth(4)).toHaveClass(/modal-shahed/);
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
  await page.getByRole("button", { name: "Hide markers" }).click();
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(0);
  await expect(legend).toContainText("Show markers");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(0);
  await page.getByRole("button", { name: "Show markers" }).click();
  await expect(page.locator("#outerScale .modal-shahed")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("modal citations and model limitations are accessible for provisional contexts", async ({ page }) => {
  const errors = await ready(page);
  await page.locator("#scaleSelector").selectOption("nava");
  const d = page.locator("#modalRoleLegend details");
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
