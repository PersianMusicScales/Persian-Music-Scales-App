const { test, expect } = require("@playwright/test");

// Synthesize a scale and cadence in memory. No corpus recording is a test fixture.
function scaleWav(root, steps) {
  const rate = 16000;
  const notes = [0, ...steps, ...steps.slice(0, -1).reverse(), 0];
  const samples = [];
  for (const [i, note] of notes.entries()) {
    const seconds = i === 0 || i === notes.length - 1 ? .65 : .33;
    const frequency = 440 * 2 ** ((root + note - 69) / 12);
    let phase = 0;
    for (let j = 0; j < Math.round(rate * seconds); j++) {
      const t = j / rate;
      phase += 2 * Math.PI * frequency * (1 + .0025 * Math.sin(10 * Math.PI * t)) / rate;
      const envelope = Math.min(1, t / .015, (seconds - t) / .025);
      samples.push(Math.round(7800 * envelope * (Math.sin(phase) + .21 * Math.sin(2 * phase))));
    }
    for (let j = 0; j < rate * .05; j++) samples.push(0);
  }
  const wav = Buffer.alloc(44 + 2 * samples.length);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(2 * rate, 28); wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((value, i) => wav.writeInt16LE(value, 44 + i * 2));
  return wav;
}

test("upload recognizes Natural Minor, respects its tonic, and releases it when a major melody replaces it", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/index.html?lang=en", { waitUntil: "domcontentloaded" });
  const file = page.locator("#trackFileInput");
  const minor = [0, 2, 3, 5, 7, 8, 10, 12];
  await file.setInputFiles({ name: "D-minor.wav", mimeType: "audio/wav", buffer: scaleWav(62, minor) });
  await expect(page.locator("#v4Result")).toHaveText("Natural Minor · D", { timeout: 30000 });
  await expect(page.locator("#scaleSelector")).toHaveValue("minor");
  await expect(page.locator("#manualTonic")).toHaveValue("4");
  await expect(page.locator("#analysisMiniBadgeText")).toContainText("Minor · D");
  await expect(page.locator("#v4Explanation")).toContainText("1 of 1");
  await page.locator("#languageSelector").selectOption("fa", { force: true });
  await expect(page.locator("#v4Result")).toHaveText("مینور طبیعی · ر");
  await page.locator("#languageSelector").selectOption("en", { force: true });
  const major = [0, 2, 4, 5, 7, 9, 11, 12];
  await file.setInputFiles({ name: "relative-major.wav", mimeType: "audio/wav", buffer: scaleWav(65, major) });
  await expect(page.locator("#trackName")).toHaveText("relative-major.wav");
  await expect(page.locator("#v4Explanation")).toHaveText("One eligible passage. The mode is tentative.", { timeout: 30000 });
  await expect(page.locator("#v4Passages")).toContainText("Insufficient evidence for Natural Minor.");
  await expect(page.locator("#v4Result")).not.toContainText("Natural Minor");
  await expect(page.locator("#scaleSelector")).toHaveValue("mahur");
  await expect(page.locator("#analysisMiniBadgeText")).toContainText("Mahur · F");
});

test("the center announces the best scale when passage votes disagree", async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    await page.route("**/src/v4-recognition.worker.js", route => route.fulfill({
      contentType: "text/javascript",
      body: `self.onmessage = () => self.postMessage({type: "complete", result: {
        candidate: {status: "mixed", ranking: [], usable: 2}, minor: null,
        baseline: {start: 0, end: 7, ranking: []}, passages: []
      }});`
    }));
    await page.goto("/index.html?lang=en", { waitUntil: "domcontentloaded" });
    await page.locator("#trackFileInput").setInputFiles({ name: "major.wav", mimeType: "audio/wav",
      buffer: scaleWav(65, [0, 2, 4, 5, 7, 9, 11, 12]) });
    await expect(page.locator("#v4Result")).toContainText("Passages suggest different modes");
    await expect(page.locator("#analysisMiniBadgeText")).toContainText("Mahur · F");
    await expect(page.locator("#bestMatchName")).toHaveText("Mahur · F");
  } finally {
    await context.close();
  }
});
