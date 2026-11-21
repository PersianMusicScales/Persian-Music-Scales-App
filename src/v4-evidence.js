// Natural Minor is a pitch-collection comparison outside the twelve-class KDC model.
// Bins are nearest quarter-tones from C. All three profiles have unit mass.
"use strict";

globalThis.PersianV4Evidence = (() => {
  const degrees = [0, 4, 6, 10, 14, 16, 20];

  function minorMatch(profile) {
    if (!profile) return null;
    const { pitches, opening, ending } = profile;
    const center = tonic => .30 * pitches[tonic] + .20 * opening[tonic] + .50 * ending[tonic];
    const candidates = [];
    for (let tonic = 0; tonic < 24; tonic++) {
      const weights = degrees.map(offset => pitches[(tonic + offset) % 24]);
      const coverage = weights.reduce((sum, value) => sum + value, 0);
      // The second, minor third and minor sixth distinguish the app's nearby
      // collections. Partial scales and sustained notes are inconclusive.
      if (coverage < .85 || weights.filter(value => value >= .025).length < 5 ||
          [0, 1, 2, 5].some(i => weights[i] < .025)) continue;
      const relativeMajor = (tonic + 6) % 24;
      const tonicWeight = center(tonic);
      const margin = tonicWeight - center(relativeMajor);
      if (margin < -.10) continue;
      candidates.push({ tonic, coverage, margin, tonicWeight });
    }
    candidates.sort((a, b) => (b.coverage + b.tonicWeight) - (a.coverage + a.tonicWeight));
    const best = candidates[0];
    if (!best) return null;
    const other = candidates[1];
    const clear = best.tonicWeight >= .21 && best.margin > .10 &&
      (!other || best.coverage + best.tonicWeight > other.coverage + other.tonicWeight + .08);
    return { tonic: best.tonic, status: clear ? "supported" : "possible" };
  }

  function combineMinor(passages) {
    const eligible = passages.filter(p => !p.excluded && p.ranking.length);
    const found = eligible.map(p => p.minor).filter(Boolean);
    if (!found.length) return null;
    const tonics = [...new Set(found.map(m => m.tonic))];
    for (const tonic of tonics) {
      const support = found.filter(m => m.tonic === tonic && m.status === "supported").length;
      if (support > eligible.length / 2) return { status: "supported", tonic, support, usable: eligible.length };
    }
    return { status: "possible", tonic: tonics.length === 1 ? tonics[0] : null, support: 0, usable: eligible.length };
  }

  return { minorMatch, combineMinor };
})();
