const { test, expect } = require("@playwright/test");

test("each Avaz highlights its matching tonal degree and menu indicator", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  const keys = ["abuAta", "bayatTork", "afshari", "dashti"];
  const notes = page.locator("#outerScale .dynamic-label");
  for (let degree = 1; degree <= 4; degree++) {
    const key = keys[degree - 1];
    await page.locator("#avazhaButton").click();
    await page.locator('.avazha-item[data-translate="avazha.' + key + '"]').click();
    await expect(notes.nth(degree)).toHaveClass(/avaz-tonal-highlight/);
    await expect(notes.nth(degree)).toHaveAttribute("data-avaz-key", key);
    await expect(page.locator("#avazhaButton")).toHaveAttribute("data-avaz-key", key);
    await expect(page.locator('#avazhaDynamicColumn .avazha-item').nth(degree - 1)).toHaveAttribute("data-avaz-key", key);
    await expect(page.locator("#outerScale .avaz-tonal-highlight")).toHaveCount(1);
    await page.locator("#avazhaButton").click();
    await page.locator('.avazha-item[data-translate="avazha.' + key + '"]').click();
    await expect(page.locator("#outerScale .avaz-tonal-highlight")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("Avaz tonal color follows rotation and translation without shifting circle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  const circle = page.locator("#circleContainer");
  const rect = await circle.boundingBox();
  await page.locator("#avazhaButton").click();
  await page.locator('.avazha-item[data-translate="avazha.bayatTork"]').click();
  const before = await page.locator("#outerScale .dynamic-label").nth(2).getAttribute("data-single-note");
  await circle.click({ position: { x: 30, y: 30 } });
  const after = await page.locator("#outerScale .dynamic-label").nth(2).getAttribute("data-single-note");
  expect(before).not.toEqual(after);
  await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveClass(/avaz-tonal-highlight/);
  for (const lang of ["fa", "fr", "en"]) {
    await page.locator("#languageSelector").selectOption(lang);
    await expect(page.locator("#outerScale .dynamic-label").nth(2)).toHaveAttribute("data-avaz-key", "bayatTork");
    await expect(page.locator("#avazhaButton")).toHaveAttribute("data-avaz-key", "bayatTork");
  }
  const current = await circle.boundingBox();
  expect(Math.abs(rect.y - current.y)).toBeLessThan(2);
  await page.locator("#scaleSelector").selectOption("nava");
  await expect(page.locator("#outerScale .avaz-tonal-highlight")).toHaveCount(0);
  await expect(page.locator("#avazhaButton")).not.toHaveAttribute("data-avaz-key", "bayatTork");
});

test("Avaz tonal color does not replace Shahed or Finalis symbols", async ({ page }) => {
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator("#avazhaButton").click();
  await page.locator('.avazha-item[data-translate="avazha.afshari"]').click();
  await expect(page.locator("#outerScale .avaz-tonal-highlight")).toHaveCount(1);
  const marked = page.locator("#outerScale .dynamic-label.modal-shahed, #outerScale .dynamic-label.modal-finalis");
  await expect(marked.first()).toBeVisible();
  await page.locator("#modalRoleButton").click();
  await expect(page.locator("#modalRolePopover")).toBeVisible();
  await expect(page.locator("#modalRoleLegend")).toContainText("Shahed");
});
