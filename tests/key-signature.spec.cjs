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
  // Invariants for a non-flow notation widget: the entire playback row
  // must be no taller than the Play Scale button. Scale selection itself can
  // independently change the original app's vertical centering.
  const getLayout = () => page.evaluate(() => {
    const play = document.getElementById("playScale");
    const row = play.parentElement;
    const staff = document.getElementById("keySignatureWidget");
    return {
      rowHeight: row.getBoundingClientRect().height,
      playHeight: play.getBoundingClientRect().height,
      staffPosition: getComputedStyle(staff).position,
      staffWidth: staff.getBoundingClientRect().width
    };
  });
  const before = await getLayout();
  expect(before.staffPosition).toBe("absolute");
  expect(before.staffWidth).toBeGreaterThan(75);
  expect(Math.abs(before.rowHeight - before.playHeight)).toBeLessThan(2);
  await page.locator("#circleContainer").click({ position: { x: 20, y: 20 } });
  await expect(svg).toHaveAttribute("data-scale", "Shur");
  await page.locator("#scaleSelector").selectOption("segah");
  await expect(svg).toHaveAttribute("data-scale", "segah");
  // Independent SVG paths eliminate browser text baseline/image box offsets.
  await expect(svg.locator("image")).toHaveCount(0);
  await expect(svg.locator("text")).toHaveCount(0);
  expect(await svg.locator('g.key-signature-accidental path[data-glyph]').count()).toBeGreaterThan(0);
  const after = await getLayout();
  expect(after.staffPosition).toBe("absolute");
  expect(Math.abs(after.rowHeight - after.playHeight)).toBeLessThan(2);
  expect(Math.abs(before.rowHeight - after.rowHeight)).toBeLessThan(2);
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

test("accidentals are aligned to their correct treble-clef staff positions", async ({ page }) => {
  await page.goto("/index.html", {waitUntil: "domcontentloaded"});
  const svg = page.locator("#keySignatureLargeStaff");
  const preview = page.locator("#keySignatureStaff");
  const expectedY = {
    B: 46, E: 28, A: 52, D: 34, G: 58, C: 40, F: 64
  };
  // Select C-referenced Shur (C, D-koron, E-flat, F, G, A-flat, B-flat).
  // Every accidental's anchor coincides with the correct staff step.
  for (const staff of [svg, preview]) {
    const pairs = await staff.locator("g.key-signature-accidental").evaluateAll(nodes =>
      nodes.map(n => ({
        note: n.getAttribute("data-note"),
        y: Number(n.getAttribute("data-staff-y")),
        glyphs: Array.from(n.querySelectorAll("path")).map(p => p.getAttribute("data-glyph"))
      }))
    );
    expect(pairs).toHaveLength(4);
    expect(pairs.map(n=>n.note).sort()).toEqual(["A","B","D","E"]);
    for (const p of pairs) {
      expect(p.y).toBe(expectedY[p.note]);
      expect(p.glyphs).toHaveLength(1);
    }
  }
});

test("G minor and F minor use proper flat sequence and staff step anchors", async ({page}) => {
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  await page.locator("#scaleSelector").selectOption("minor");
  const profiles = [
    { root: "G", positions: [46,28], notes: ["B", "E"] },
    { root: "F", positions: [46,28,52,34], notes: ["B", "E", "A", "D"] }
  ];
  for (const profile of profiles) {
    // The 12-o'clock label shows the actual reference pitch after rotation.
    for (let attempt=0; attempt<24; attempt++) {
      const current = await page.locator("#keySignatureRoot").textContent();
      if (current.trim().endsWith(profile.root)) break;
      await page.locator("#circleContainer").click({ position: { x: 20, y: 20 } });
    }
    await expect(page.locator("#keySignatureRoot")).toContainText(profile.root);
    const items = await page.locator("#keySignatureStaff g.key-signature-accidental").evaluateAll(nodes =>
      nodes.map(n => ({
        note:n.getAttribute("data-note"),
        y:Number(n.getAttribute("data-staff-y")),
        kind:n.getAttribute("data-kind")
      }))
    );
    expect(items.map(n=>n.note)).toEqual(profile.notes);
    expect(items.map(n=>n.y)).toEqual(profile.positions);
    expect(items.every(n => n.kind === "flat")).toBe(true);
  }
});
