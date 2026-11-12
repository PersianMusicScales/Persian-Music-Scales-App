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

test("combined analyzer stays aligned with notation and above bottom navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  const staff = page.locator("#keySignatureButton");
  const combo = page.locator("#quickScaleFinder");
  const toggle = page.locator("#analysisComboToggle");
  const nav = page.locator(".bottom-nav");
  const staffBox = await staff.boundingBox();
  const comboBox = await combo.boundingBox();
  const navBox = await nav.boundingBox();
  expect(staffBox).toBeTruthy();
  expect(comboBox).toBeTruthy();
  expect(Math.abs(staffBox.y - comboBox.y)).toBeLessThan(12);
  expect(comboBox.x).toBeGreaterThan(staffBox.x + staffBox.width);
  expect(comboBox.y + comboBox.height).toBeLessThan(navBox.y - 12);
  await toggle.click();
  await expect(page.locator("#quickScaleFinderButton")).toBeVisible();
  await expect(page.locator("#openAudioAnalyzer")).toBeVisible();
  const after = await combo.boundingBox();
  expect(Math.abs(after.y - comboBox.y)).toBeLessThan(2);
  expect(Math.abs(after.height - comboBox.height)).toBeLessThan(2);
  await staff.click();
  await expect(page.locator("#keySignaturePopover")).toBeVisible();
  await expect(page.locator("#keySignatureAction")).toContainText("Tap to enlarge");
  await page.locator("#languageSelector").selectOption("fa");
  await expect(page.locator("#keySignatureAction")).toContainText("بزرگ‌نمایی");
  await page.locator("#keySignatureClose").click();
  await expect(page.locator("#keySignaturePopover")).toBeHidden();
  expect(errors).toEqual([]);
});

test("desktop microphone and notation share a balanced deck and panels still work",async ({page})=>{
  await page.setViewportSize({width:1280,height:850});
  await page.goto("/index.html", {waitUntil:"domcontentloaded"});
  const position=await page.locator("#quickScaleFinder").evaluate(el=>getComputedStyle(el).position);
  expect(position).toBe("relative");
  const staff=await page.locator("#keySignatureButton").boundingBox();
  const mic=await page.locator("#quickScaleFinder").boundingBox();
  const play=await page.locator("#playScale").boundingBox();
  expect(Math.abs(staff.y-mic.y)).toBeLessThan(2);
  expect(Math.abs(staff.height-mic.height)).toBeLessThan(2);
  expect(staff.x+staff.width).toBeLessThan(play.x);
  expect(play.x+play.width).toBeLessThan(mic.x);
  expect(Math.abs((play.x+play.width/2)-640)).toBeLessThan(32);
  expect(staff.height).toBeGreaterThanOrEqual(80);
  await page.locator("#modalRoleButton").click();
  await expect(page.locator("#modalRolePopover")).toBeVisible();
  await page.locator("#modalRoleButton").click();
  await expect(page.locator("#modalRolePopover")).toBeHidden();
  await page.locator("#keySignatureButton").click();
  await expect(page.locator("#keySignaturePopover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#keySignaturePopover")).toBeHidden();
});

test("reference and notes use opposite ends of the responsive toolbar at multiple sizes", async ({page}) => {
  const sizes=[{width:320,height:720},{width:390,height:844},{width:430,height:932},{width:768,height:950},{width:1280,height:850}];
  for(const size of sizes){
    await page.setViewportSize(size);
    await page.goto("/index.html",{waitUntil:"domcontentloaded"});
    for(const [language,ltr] of [["en",true],["fr",true],["fa",false]]){
      await page.locator("#languageSelector").selectOption(language);
      const row=await page.locator(".scale-reference-row").boundingBox();
      const pitch=await page.locator("#labelAtZeroAngle").boundingBox();
      const notes=await page.locator("#modalRoleButton").boundingBox();
      const select=await page.locator("#scaleSelector").boundingBox();
      const avazha=await page.locator("#avazhaButton").boundingBox();
      expect(Math.abs(pitch.y+pitch.height/2-notes.y-notes.height/2)).toBeLessThan(18);
      expect(notes.y).toBeGreaterThan(select.y);
      expect(notes.y).toBeGreaterThan(avazha.y);
      expect(row.width).toBeGreaterThanOrEqual(size.width < 700 ? size.width*.78 : 500);
      if(ltr) {
        expect(notes.x-notes.width*.05).toBeGreaterThan(pitch.x+pitch.width+15);
        expect(pitch.x-row.x).toBeLessThan(26);
        expect(row.x+row.width-(notes.x+notes.width)).toBeLessThan(26);
      } else {
        expect(pitch.x).toBeGreaterThan(notes.x+notes.width+15);
        expect(row.x-notes.x).toBeLessThanOrEqual(0);
        expect(notes.x-row.x).toBeLessThan(26);
        expect(row.x+row.width-(pitch.x+pitch.width)).toBeLessThan(26);
      }
    }
  }
});

test("score and recorder cards stay visually matched and above nav in narrow phones",async ({page})=>{
  for(const width of [320,360,390,430]){
    await page.setViewportSize({width,height:844});
    await page.goto("/index.html",{waitUntil:"domcontentloaded"});
    const staff=await page.locator("#keySignatureButton").boundingBox();
    const mic=await page.locator("#quickScaleFinder").boundingBox();
    const play=await page.locator("#playScale").boundingBox();
    const nav=await page.locator(".bottom-nav").boundingBox();
    expect(Math.abs(staff.height-mic.height)).toBeLessThan(2);
    expect(Math.abs(staff.y-mic.y)).toBeLessThan(2);
    expect(staff.x+staff.width).toBeLessThan(play.x+3);
    expect(play.x+play.width).toBeLessThan(mic.x+3);
    expect(mic.x+mic.width).toBeLessThanOrEqual(width+2);
    expect(staff.y+staff.height).toBeLessThan(nav.y-12);
    await page.locator("#keySignatureButton").click();
    await expect(page.locator("#keySignaturePopover")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#keySignaturePopover")).toBeHidden();
  }
});
