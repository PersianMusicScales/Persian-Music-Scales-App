const { test, expect } = require("@playwright/test");

async function visit(page, path, width = 390) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test("all three pages use the same decorative background and safe bottom clearance", async ({ page }) => {
  for (const path of ["/index.html", "/htmls/guide.html", "/htmls/about.html"]) {
    await visit(page, path);
    const background = await page.evaluate(() =>
      getComputedStyle(document.body, "::before").backgroundImage);
    expect(background).toContain("indexBackground.png");
    const nav = await page.locator(".bottom-nav").boundingBox();
    expect(nav.height).toBeGreaterThan(55);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    expect(nav.y + nav.height).toBeLessThanOrEqual(viewportHeight + 2);
  }
});

test("both expanded note panels fit a narrow phone in Persian and English", async ({ page }) => {
  for (const lang of ["en", "fa"]) {
    await visit(page, "/index.html", 320);
    await page.locator("#languageSelector").selectOption(lang);
    for (const [buttonId, panelId] of [
      ["#modalRoleButton", "#modalRolePopover"],
      ["#keySignatureButton", "#keySignaturePopover"]
    ]) {
      await page.locator(buttonId).click();
      const panel = page.locator(panelId);
      await expect(panel).toBeVisible();
      const rect = await panel.boundingBox();
      if (rect.x < 0) {
        console.log("PANEL_GEOMETRY", JSON.stringify(await page.evaluate(id => {
          const el = document.querySelector(id);
          const style = getComputedStyle(el);
          return { id, lang: document.documentElement.lang, viewport: innerWidth, scrollX, documentWidth: document.documentElement.scrollWidth, bounds: el.getBoundingClientRect().toJSON(), position: style.position, left: style.left, right: style.right, transform: style.transform, offsetParent: el.offsetParent?.id || el.offsetParent?.tagName };
        }, panelId)));
      }
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
      expect(rect.x + rect.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(rect.y + rect.height).toBeLessThanOrEqual(viewport.height + 1);
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    }
  }
});

test("Avazha menu opens inward below Notes and remains readable", async ({ page }) => {
  for (const lang of ["en", "fa"]) {
    await visit(page, "/index.html", 390);
    await page.locator("#languageSelector").selectOption(lang);
    await page.locator("#avazhaButton").click();
    const menu = page.locator("#avazhaColumns");
    await expect(menu).toBeVisible();
    const notes = await page.locator("#modalRoleButton").boundingBox();
    const rect = await menu.boundingBox();
    expect(rect.y).toBeGreaterThanOrEqual(notes.y + notes.height - 2);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(391);
    const color = await menu.evaluate(node => getComputedStyle(node).backgroundColor);
    expect(color).not.toBe("rgba(0, 0, 0, 0)");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  }
});

test("long outer labels stay in the phone viewport across scale and language changes", async ({ page }) => {
  await visit(page, "/index.html", 320);
  for (const lang of ["en", "fr", "fa"]) {
    await page.locator("#languageSelector").selectOption(lang);
    for (const scale of ["Shur", "segah", "chahargah", "mahur"]) {
      await page.locator("#scaleSelector").selectOption(scale);
      await expect(page.locator("#outerScale .dynamic-label")).toHaveCount(7);
      await page.waitForTimeout(60);
      const boxes = await page.locator("#outerScale .dynamic-label").evaluateAll(nodes =>
        nodes.map(node => {
          const r = node.getBoundingClientRect();
          return { left: r.left, right: r.right };
        }));
      for (const b of boxes) {
        expect(b.left).toBeGreaterThanOrEqual(-1);
        expect(b.right).toBeLessThanOrEqual(321);
      }
    }
  }
});

test("interval legend follows language and stays out of fixed navigation", async ({ page }) => {
  await visit(page, "/index.html");
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator('[data-interval-cents="100"]')).toHaveText("۱۰۰ سنت");
  await page.evaluate(() => {
    const legend = document.querySelector(".scale-meta-row .legend").getBoundingClientRect();
    const nav = document.querySelector(".bottom-nav").getBoundingClientRect();
    window.scrollBy(0, Math.max(0, legend.bottom - nav.top + 16));
  });
  const legend = await page.locator(".scale-meta-row .legend").boundingBox();
  const nav = await page.locator(".bottom-nav").boundingBox();
  expect(legend.y).toBeGreaterThan(-1);
  expect(legend.y + legend.height).toBeLessThan(nav.y - 5);
  await expect(page.locator("main footer")).toContainText("2024–2026");
});

test("Guide translates into French and Persian and its reference links are visible", async ({ page }) => {
  await visit(page, "/htmls/guide.html");
  const selector = page.locator("#languageSelector");
  await selector.selectOption("fr");
  await expect(page.locator('main > section[lang="fr"]')).toBeVisible();
  await expect(page.locator('main > section[lang="fa"]')).toBeHidden();
  await expect(page.locator("#guideTheoryHeading")).toHaveText("Références musicologiques");
  await selector.selectOption("fa");
  await expect(page.locator('main > section[lang="fa"]')).toBeVisible();
  await expect(page.locator("#guideTheoryHeading")).toHaveText("منابع و مبانی موسیقی‌شناختی");
  await expect(page.locator(".guide-reference-links")).toBeVisible();
  await expect(page.locator('main > section[lang="fa"] img.guide-figure')).toHaveCount(3);
});

test("About keeps the selected language and full page stays readable", async ({ page }) => {
  await visit(page, "/htmls/about.html");
  await page.locator("#aboutLanguageSelector").selectOption("fa");
  await expect(page.locator('[data-language-panel="fa"]')).toBeVisible();
  await expect(page.locator(".about-footer")).toContainText("2024–2026");
  await page.goto("/index.html");
  await expect(page.locator("#languageSelector")).toHaveValue("fa");
  await expect(page.locator("#modalRoleButtonLabel")).toHaveText("شاهد و نت فرود");
});

test("active āvāz is named beside its parent Shur selection", async ({ page }) => {
  await visit(page, "/index.html");
  await page.locator("#avazhaButton").click();
  await page.locator('.avazha-item[data-translate="avazha.abuAta"]').click();
  await expect(page.locator("#scaleSelector")).toHaveValue("Shur");
  await expect(page.locator("#avazhaLabel")).toContainText("Abu Ata");
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator("#avazhaLabel")).toContainText("ابوعطا");
  await page.locator("#avazhaButton").click();
  await page.locator('.avazha-item[data-translate="avazha.abuAta"]').click();
  await expect(page.locator("#avazhaLabel")).toHaveText("آوازها");
});
