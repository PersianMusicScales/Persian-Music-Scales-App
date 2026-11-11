const { test, expect } = require("@playwright/test");

test("guide offers five topic cards in every language and keeps diagrams in the first lesson", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/htmls/guide.html", { waitUntil: "domcontentloaded" });

  for (const language of ["en", "fr", "fa"]) {
    await page.locator("#languageSelector").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator("html")).toHaveAttribute("dir", language === "fa" ? "rtl" : "ltr");
    const panel = page.locator('section.guide-language-panel[lang="' + language + '"]');
    await expect(panel).toBeVisible();
    await expect(panel.locator(".guide-topic")).toHaveCount(5);
    await expect(panel.locator(".guide-topic[open]")).toHaveCount(1);
    await expect(panel.locator(".guide-intro")).toBeVisible();
    await expect(panel.locator(".guide-model-boundaries")).toHaveCount(1);

    const circles = panel.locator('[data-guide-topic="1"]');
    await expect(circles).toHaveAttribute("open", "");
    await expect(circles).toHaveAttribute("open", "");
    await expect(circles.locator("img")).toHaveCount(3);
    const images = circles.locator("img");
    for (let i = 0; i < 3; i++) {
      expect(await images.nth(i).evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    const refs = panel.locator('[data-guide-topic="5"]');
    await refs.locator("summary").click();
    await expect(refs.locator('a[href*="reference/"]')).toHaveCount(8);
    await expect(refs.locator('a[href*="sites.google.com"]')).toHaveCount(1);
  }

  expect(errors).toEqual([]);
});

test("Guide works on narrow screens without horizontal scrolling or footer changes", async ({ page }) => {
  for (const width of [320, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/htmls/guide.html?lang=fa", { waitUntil: "domcontentloaded" });
    const panel = page.locator('section.guide-language-panel[lang="fa"]');
    await expect(panel.locator('[data-guide-topic="1"]')).toHaveAttribute("open", "");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    const nav = page.locator(".bottom-nav");
    await expect(nav.locator("a")).toHaveCount(4);
    expect((await nav.boundingBox()).height).toBeGreaterThan(50);
  }
});

test("Guide persists the selected language on navigation", async ({ page }) => {
  await page.goto("/htmls/guide.html");
  await page.locator("#languageSelector").selectOption("fa");
  await page.locator('.bottom-nav a[href*="tuner.html"]').click();
  await expect(page.locator("#languageSelector")).toHaveValue("fa");
});
