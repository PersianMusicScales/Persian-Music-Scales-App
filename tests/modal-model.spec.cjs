const { test, expect } = require("@playwright/test");
const roles = require("../src/modal-roles.js");
const model = require("../data/persian-scales.json");

const keys = {
  Shur: "shur", nava: "nava", segah: "segah", homayoun: "homayoun",
  esfahan: "esfahan", chahargah: "chahargah",
  mahur: "mahur-rast-panjgah"
};

test("every role degree refers to an existing note in its pitch collection", () => {
  for (const [key, id] of Object.entries(keys)) {
    const scale = model.scales.find(x => x.id === id);
    expect(scale).toBeTruthy();
    expect(scale.anglesDegrees).toHaveLength(7);
    for (const role of ["shahed", "finalis"]) {
      const index = roles[key][role];
      expect(index === null || (Number.isInteger(index) && index >= 0 && index < 7)).toBe(true);
    }
    for (let i = 0; i < 7; i++) {
      expect(scale.anglesDegrees[i]).toBeCloseTo(scale.cumulativeCents[i] * .3, 8);
    }
    expect(scale.stepIntervalsCents.reduce((a, b) => a + b, 0)).toBe(1200);
  }
});

test("Esfahan's F-referenced source and C-referenced app use the same cyclic pitch collection", () => {
  const cents = model.scales.find(x => x.id === "esfahan").cumulativeCents;
  // Esfahan in Encyclopaedia Iranica: F, G, A-koron, B, C, D, E-flat.
  const sourceRelativeToF = [0, 200, 350, 600, 700, 900, 1000];
  const rotated = cents.map(v => (v - 500 + 1200) % 1200).sort((a,b) => a-b);
  expect(rotated).toEqual(sourceRelativeToF);
  expect(roles.esfahan.shahed).toBe(0); // C
  expect(roles.esfahan.finalis).toBe(4); // G
});

test("each Shur-related avaz has a separate role context", () => {
  for (const id of ["abuAta","bayatTork","afshari","dashti"]) {
    expect(roles["avaz."+id]).toBeTruthy();
    expect(roles["avaz."+id].shahed).toBeNull();
    expect(roles["avaz."+id].finalis).toBeNull();
  }
});
