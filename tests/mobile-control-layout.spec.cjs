const { test, expect } = require("@playwright/test");

test("mobile Notes aligns with reference label and mirrors from English to Persian", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  const errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  const label=page.locator("#labelAtZeroAngle");
  const notes=page.locator("#modalRoleButton");
  const circle=page.locator("#circleContainer");

  async function verify(language, shouldBeToRight) {
    await page.locator("#languageSelector").selectOption(language);
    const a=await label.boundingBox();
    const b=await notes.boundingBox();
    const bounds=await circle.boundingBox();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    // Reference and notes must share one row, above the interactive circle.
    expect(Math.abs((a.y+a.height/2)-(b.y+b.height/2))).toBeLessThan(17);
    expect(b.y+b.height).toBeLessThan(bounds.y+18);
    if (shouldBeToRight) expect(b.x).toBeGreaterThan(a.x+a.width-4);
    else expect(b.x+b.width).toBeLessThan(a.x+4);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x+b.width).toBeLessThanOrEqual(391);
    await notes.click();
    await expect(page.locator("#modalRolePopover")).toBeVisible();
    await notes.click();
    await expect(page.locator("#modalRolePopover")).toBeHidden();
  }

  await verify("en",true);
  await verify("fr",true);
  await verify("fa",false);
  expect(errors).toEqual([]);
});

test("phone recorder shares staff level without covering analyzer or bottom navigation", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  const errors=[];
  page.on("pageerror", e=>errors.push(e.message));
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  const staff=page.locator("#keySignatureButton");
  const mic=page.locator("#quickScaleFinderButton");
  const micRing=page.locator(".quick-finder-icon-ring");
  const analyzer=page.locator("#openAudioAnalyzer");
  const nav=page.locator(".bottom-nav");
  const m=await micRing.boundingBox();
  const s=await staff.boundingBox();
  const a=await analyzer.boundingBox();
  const n=await nav.boundingBox();
  expect(m).toBeTruthy();
  expect(s).toBeTruthy();
  expect(Math.abs(m.y-s.y)).toBeLessThan(12);
  expect(m.x).toBeGreaterThan(s.x+s.width+35);
  expect(m.y+m.height).toBeLessThan(a.y+a.height);
  expect(m.y+m.height).toBeLessThan(n.y-20);
  expect(await mic.evaluate(el=>getComputedStyle(el.closest(".quick-scale-finder")).position)).toBe("absolute");
  await staff.click();
  await expect(page.locator("#keySignaturePopover")).toBeVisible();
  await expect(page.locator("#keySignatureAction")).toContainText("Tap to enlarge");
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator("#keySignatureAction")).toContainText("بزرگ‌نمایی");
  await page.locator("#keySignatureClose").click();
  await expect(page.locator("#keySignaturePopover")).toBeHidden();
  expect(errors).toEqual([]);
});

test("desktop microphone stays fixed and panels still work",async ({page})=>{
  await page.setViewportSize({width:1280,height:850});
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  const position=await page.locator("#quickScaleFinder").evaluate(el=>getComputedStyle(el).position);
  expect(position).toBe("fixed");
  await page.locator("#modalRoleButton").click();
  await expect(page.locator("#modalRolePopover")).toBeVisible();
  await page.locator("#modalRoleButton").click();
  await expect(page.locator("#modalRolePopover")).toBeHidden();
  await page.locator("#keySignatureButton").click();
  await expect(page.locator("#keySignaturePopover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#keySignaturePopover")).toBeHidden();
});
