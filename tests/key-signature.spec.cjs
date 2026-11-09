const { test, expect } = require("@playwright/test");
const notation = require("../src/key-signature.js");
const dataset = require("../data/persian-scales.json");

const modelIds = {
  Shur: "shur", nava: "nava", segah: "segah",
  homayoun: "homayoun", esfahan: "esfahan", chahargah: "chahargah",
  mahur: "mahur", rastPanjgah: "rast-panjgah"
};
const mod = (a, n) => ((a % n) + n) % n;

test("all eight Persian collections are spelled exactly across all 24 rotations", async () => {
  for (const [scaleId, datasetId] of Object.entries(modelIds)) {
    const item = dataset.scales.find(x => x.id === datasetId);
    expect(item).toBeTruthy();
    const values = item.cumulativeCents;
    for (let position = 0; position < 24; position++) {
      const result = notation.chooseSpelling(values, position * 50);
      expect(result.notes).toHaveLength(7);
      expect(new Set(result.notes.map(x => x.letter)).size).toBe(7);
      result.notes.forEach((note, idx) => {
        expect(note.pitchCents).toBe(mod(values[idx] - position * 50, 1200));
        expect(["flatKoron","flat","koron","natural","sori","sharp","sharpSori"]).toContain(note.kind);
        expect(Math.abs(note.alterationCents) % 50).toBe(0);
      });
    }
  }
});

test("reference C Shur uses Koron and correct conventional flat spellings", async () => {
  const values = dataset.scales.find(x => x.id === "shur").cumulativeCents;
  const notes = notation.chooseSpelling(values, 0).notes;
  expect(notes.map(n => n.letter)).toEqual(["C","D","E","F","G","A","B"]);
  expect(notes.map(n => n.alterationCents)).toEqual([0,-50,-100,0,0,-100,-100]);
  expect(notation.chooseSpelling(values, 0).hasCompound).toBe(false);
  // Moving two 50-cent steps clockwise lowers the displayed pitches by 100 cents.
  expect(notation.chooseSpelling(values, 100).notes[0].pitchCents).toBe(1100);
});

test("staff preview updates with rotation and scale changes without shifting playback controls", async ({ page }) => {
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  const svg = page.locator("#keySignatureStaff");
  await expect(svg).toHaveAttribute("data-scale", "Shur");
  await expect(svg.locator("line")).toHaveCount(5);
  // Use absolute document positions: Playwright may scroll the viewport
  // when it interacts with the selector, without changing page layout.
  const documentY = locator => locator.evaluate(el => el.getBoundingClientRect().top + window.scrollY);
  const playBefore = await documentY(page.locator("#playScale"));
  const analyzerBefore = await documentY(page.locator("#openAudioAnalyzer"));
  const staffBefore = await page.locator("#keySignatureButton").boundingBox();
  expect(staffBefore.width).toBeGreaterThan(75);
  await page.locator("#circleContainer").click({ position: { x: 20, y: 20 } });
  await expect(svg).toHaveAttribute("data-scale", "Shur");
  await page.locator("#scaleSelector").selectOption("segah");
  await expect(svg).toHaveAttribute("data-scale", "segah");
  expect(await svg.locator("image").count()).toBeGreaterThan(0);
  const playAfter = await documentY(page.locator("#playScale"));
  const analyzerAfter = await documentY(page.locator("#openAudioAnalyzer"));
  expect(Math.abs(playBefore - playAfter)).toBeLessThan(2);
  expect(Math.abs(analyzerBefore - analyzerAfter)).toBeLessThan(2);
  expect(errors).toEqual([]);
});

test("notation popover is accessible and translated into three languages", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  const button=page.locator("#keySignatureButton");
  const panel=page.locator("#keySignaturePopover");
  await expect(panel).toBeHidden();
  await button.click();
  await expect(panel).toBeVisible();
  await expect(page.locator("#keySignatureLargeStaff")).toBeVisible();
  await expect(page.locator("#keySignatureLargeStaff line")).toHaveCount(5);
  await expect(page.locator("#keySignatureLargeStaff")).toHaveAttribute("data-scale", "Shur");
  await expect(button).toHaveAttribute("aria-expanded","true");
  await expect(page.locator("#keySignatureNotes")).toContainText("Koron");
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator("#keySignatureStatus")).toContainText("محاسبه");
  await expect(panel).toHaveAttribute("dir","rtl");
  await page.locator("#languageSelector").selectOption("fr");
  await expect(page.locator("#keySignatureStatus")).toContainText("calculées");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});

test("exact Koron/Sori SVG assets load from the same site", async ({ page }) => {
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  const assets=["/assets/notation/koron.svg","/assets/notation/sori.svg"];
  for (const asset of assets) {
    const response=await page.request.get(asset);
    expect(response.ok()).toBe(true);
    const xml=await response.text();
    expect(xml).toContain("<svg");
    expect(xml).toContain("<path");
    expect(xml).toContain('viewBox="0 0 12 12"');
  }
});
