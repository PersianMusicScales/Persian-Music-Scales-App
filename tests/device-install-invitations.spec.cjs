const { test, expect } = require("@playwright/test");

test("desktop browser uses header tip, never the floating phone icon", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only assertion");
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#desktopInstallNotice")).toBeVisible();
  await expect(page.locator("#myAppContainer")).toBeHidden();
  await page.locator("#desktopInstallDismiss").click();
  await expect(page.locator("#desktopInstallNotice")).toBeHidden();
  await page.reload();
  await expect(page.locator("#desktopInstallNotice")).toBeHidden();
});

test("mobile browser uses the phone installation icon, not desktop notice", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only assertion");
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#myAppContainer")).toBeVisible();
  await expect(page.locator("#desktopInstallNotice")).toBeHidden();
});

test("native install event enables a user-triggered install action on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop-only assertion");
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = () => Promise.resolve();
    event.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(event);
  });
  await expect(page.locator("#desktopInstallAction")).toBeVisible();
  await page.locator("#desktopInstallAction").click();
  await expect(page.locator("#desktopInstallNotice")).toBeHidden();
  await expect(page.locator("#myAppContainer")).toBeHidden();
});

test("installed standalone PWA hides installation invitations", async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = query => query.includes("display-mode: standalone")
      ? { matches: true, addEventListener() {}, removeEventListener() {} }
      : original(query);
  });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#desktopInstallNotice")).toBeHidden();
  await expect(page.locator("#myAppContainer")).toBeHidden();
});
