const { test, expect } = require("@playwright/test");

test("bottom tabs retain geometry and icon sizes across pages and languages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pages = ["/index.html", "/htmls/tuner.html", "/htmls/guide.html", "/htmls/about.html"];
  const measurements = [];
  for (const language of ["en", "fr", "fa"]) {
    for (const path of pages) {
      await page.goto(path + "?lang=" + language, { waitUntil: "domcontentloaded" });
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      const result = await page.locator(".bottom-nav").evaluate(nav => {
        const bounds = nav.getBoundingClientRect();
        return {
          navHeight: bounds.height,
          navWidth: bounds.width,
          iconSizes: [...nav.querySelectorAll(".nav-icon")].map(el => {
            const rect = el.getBoundingClientRect();
            return [rect.width, rect.height, getComputedStyle(el).fontSize];
          }),
          tabWidths: [...nav.querySelectorAll(":scope > a")].map(el => el.getBoundingClientRect().width),
          labelSizes: [...nav.querySelectorAll(":scope > a > :not(.nav-icon)")].map(el => getComputedStyle(el).fontSize)
        };
      });
      measurements.push({ language, path, result });
    }
  }
  const first = measurements[0].result;
  for (const item of measurements) {
    expect(item.result.navHeight).toBeCloseTo(first.navHeight, 1);
    expect(item.result.navWidth).toBeCloseTo(first.navWidth, 1);
    expect(item.result.iconSizes).toEqual(first.iconSizes);
    expect(item.result.tabWidths).toEqual(first.tabWidths);
    expect(item.result.labelSizes).toEqual(first.labelSizes);
  }
});

test("Tuner preserves Farsi language when navigating from Scales and back", async ({ page }) => {
  await page.goto("/index.html");
  await page.locator("#languageSelector").selectOption("fa");
  await page.locator('.bottom-nav a[href*="tuner"]').click();
  await expect(page).toHaveURL(/tuner\.html/);
  await expect(page.locator("#languageSelector")).toHaveValue("fa");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("#tunerAutoLabel")).toHaveText("خودکار");
  await expect(page.locator(".bottom-nav a").nth(1)).toContainText("تیونر");
  await page.locator('.bottom-nav a[href*="index.html"]').click();
  await expect(page.locator("#languageSelector")).toHaveValue("fa");
});

test("Tuner supports French and persists a language change to Guide", async ({ page }) => {
  await page.goto("/htmls/tuner.html?lang=fr");
  await expect(page.locator("#languageSelector")).toHaveValue("fr");
  await expect(page.locator(".bottom-nav a").nth(1)).toContainText("Accordeur");
  await page.locator("#languageSelector").selectOption("fa");
  await page.locator('.bottom-nav a[href*="guide.html"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
});
