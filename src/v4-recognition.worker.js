// Passage recognition. All audio and model evaluation stay on the device.
"use strict";
importScripts("v4-evidence.js");

const RATE = 16000;
const FRAME = 2048;
const HOP = 256;
const MIN_LAG = 14;
const MAX_LAG = 228;

function quantile(values, fraction) {
  if (!values.length) return 0;
  const sorted = Float64Array.from(values).sort();
  const index = (sorted.length - 1) * fraction;
  const low = Math.floor(index);
  return sorted[low] + (sorted[Math.ceil(index)] - sorted[low]) * (index - low);
}

function passageTimes(levels, duration) {
  const threshold = Math.max(.00025, quantile(levels.filter(x => x > 0), .90) * .025);
  const sounding = [];
  const counts = new Uint32Array(levels.length + 1);
  for (let i = 0; i < levels.length; i++) {
    if (levels[i] >= threshold) sounding.push(i);
    counts[i + 1] = sounding.length;
  }
  if (!sounding.length) return [];
  const count = Math.min(3, Math.max(1, Math.floor(sounding.length / 120)));
  const left = Math.max(0, sounding[0] - 3);
  const right = Math.min(levels.length, sounding[sounding.length - 1] + 4);
  const cuts = [left];
  if (count === 1) {
    let widest = 4, split = -1;
    for (let i = 40; i <= sounding.length - 40; i++) {
      const gap = sounding[i] - sounding[i - 1] - 1;
      if (gap >= 5 && (gap > widest || (gap === widest && Math.abs(i - sounding.length / 2) < Math.abs(split - sounding.length / 2)))) {
        widest = gap;
        split = i;
      }
    }
    if (split >= 0) cuts.push(Math.floor((sounding[split - 1] + sounding[split] + 1) / 2));
  }
  for (let i = 1; i < count; i++) {
    const k = Math.floor(i * sounding.length / count);
    const middle = Math.floor((sounding[k - 1] + sounding[k] + 1) / 2);
    let closest = middle, distance = Infinity;
    for (let j = Math.max(cuts[i - 1] + 1, middle - 10); j <= Math.min(right - 1, middle + 10); j++) {
      if (levels[j] < threshold && Math.abs(j - middle) < distance) {
        closest = j;
        distance = Math.abs(j - middle);
      }
    }
    cuts.push(closest);
  }
  cuts.push(right);
  const times = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    let lo = cuts[i], hi = cuts[i + 1];
    if (hi - lo > 400) {
      const fraction = cuts.length > 2 ? i / (cuts.length - 2) : .5;
      const target = lo + (hi - lo - 400) * fraction;
      let best = lo, maximum = -1;
      for (let start = lo; start <= hi - 400; start++) {
        const mass = counts[start + 400] - counts[start];
        if (mass > maximum || (mass === maximum && Math.abs(start - target) < Math.abs(best - target))) {
          best = start;
          maximum = mass;
        }
      }
      lo = best;
      hi = best + 400;
    }
    times.push([lo / 10, Math.min(duration, hi / 10)]);
  }
  return times;
}

// The squared YIN difference cancels the mean. For each lag, accumulate
// successive 256-sample blocks and read the two endpoints of each 2048-sample
// window. This is the same finite-window sum as the reference autocorrelation.
function pitchTrack(samples) {
  const n = 1 + Math.floor((samples.length - FRAME) / HOP);
  const rms = new Float64Array(n);
  const f0 = new Float64Array(n).fill(NaN);
  const differences = new Float64Array(n * (MAX_LAG + 1));
  const blocks = n + FRAME / HOP - 1;
  const prefix = new Float64Array(blocks + 1);
  let total = 0;
  for (let b = 0; b < blocks; b++) {
    const end = (b + 1) * HOP;
    for (let j = b * HOP; j < end; j++) total += samples[j] * samples[j];
    prefix[b + 1] = total;
    if (b >= 7) rms[b - 7] = Math.sqrt(Math.max(0, (total - prefix[b - 7]) / FRAME));
  }
  for (let lag = 1; lag <= MAX_LAG; lag++) {
    total = 0;
    for (let b = 0; b < blocks; b++) {
      const start = b * HOP, end = start + HOP;
      prefix[b] = total;
      for (let j = start; j < end - lag; j++) {
        const delta = samples[j] - samples[j + lag];
        total += delta * delta;
      }
      if (b >= 7) differences[(b - 7) * (MAX_LAG + 1) + lag] = Math.max(0, total - prefix[b - 7]);
      if (b + 1 < blocks) {
        for (let j = end - lag; j < end; j++) {
          const delta = samples[j] - samples[j + lag];
          total += delta * delta;
        }
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (rms[i] < .0015) continue;
    const d = differences.subarray(i * (MAX_LAG + 1), (i + 1) * (MAX_LAG + 1));
    let sum = 0, minimum = MIN_LAG, first = 0;
    for (let lag = 1; lag <= MAX_LAG; lag++) {
      sum += d[lag];
      d[lag] = d[lag] * lag / Math.max(sum, 1e-12);
      if (lag >= MIN_LAG) {
        if (!first && d[lag] < .15) first = lag;
        if (d[lag] < d[minimum]) minimum = lag;
      }
    }
    let lag = first || minimum;
    if (first) while (lag < MAX_LAG && d[lag + 1] < d[lag]) lag++;
    if (d[lag] > .32) continue;
    let fine = lag;
    if (lag < MAX_LAG) {
      const divisor = d[lag - 1] - 2 * d[lag] + d[lag + 1];
      if (Math.abs(divisor) > 1e-10) fine += Math.max(-.5, Math.min(.5, .5 * (d[lag - 1] - d[lag + 1]) / divisor));
    }
    f0[i] = RATE / fine;
  }
  return { f0, rms };
}

function normalized(bins) {
  const sum = bins.reduce((a, b) => a + b, 0) || 1;
  return Array.from(bins, value => value / sum);
}

function dominant(histogram) {
  return histogram.indexOf(Math.max(...histogram));
}

function rotated(histogram, anchor) {
  return histogram.map((_, i) => histogram[(i + anchor) % histogram.length]);
}

function pitched(track) {
  const { rms, f0 } = track;
  const gate = Math.max(.002, .2 * quantile(rms, .7));
  const cents = Float64Array.from(f0, (f, i) => (f > 70 && f < 1100 && rms[i] > gate) ? 1200 * Math.log2(f / 440) : NaN);
  const voiced = cents.filter(Number.isFinite);
  if (voiced.length < 40) return null;
  const mean = voiced.reduce((s, v) => s + v, 0) / voiced.length;
  const spread = Math.sqrt(voiced.reduce((s, v) => s + (v - mean) ** 2, 0) / voiced.length);
  return { cents, voiced, spread };
}

function pitchHistogram(values, size) {
  const hist = new Float64Array(size);
  for (const c of values) {
    if (!Number.isFinite(c)) continue;
    const pc = ((c % 1200) + 1200) % 1200;
    hist[Math.min(size - 1, Math.floor(pc * size / 1200))]++;
  }
  return normalized(hist);
}

function roundedProfile(values) {
  const bins = new Float64Array(24);
  for (const c of values) bins[((Math.floor(18 + c / 50 + .5) % 24) + 24) % 24]++;
  return normalized(bins);
}

function featuresFor(samples) {
  if (samples.length < 2 * RATE) return null;
  const pcm16 = new Float32Array(samples.length);
  let identical = true;
  for (let i = 0; i < samples.length; i++) {
    pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32768))) / 32768;
    if (pcm16[i] !== samples[i]) identical = false;
  }
  const oldTrack = pitchTrack(pcm16);
  const old = pitched(oldTrack);
  if (!old) return null;
  const detail = identical ? old : pitched(pitchTrack(samples));
  if (!detail) return null;
  const absolute = pitchHistogram(old.voiced, 24);
  const anchor = dominant(absolute);
  const n = old.cents.length;
  const first = pitchHistogram(old.cents.subarray(0, Math.max(1, Math.floor(.18 * n))), 24);
  const last = pitchHistogram(old.cents.subarray(Math.floor(.82 * n)), 24);
  const intervals = new Float64Array(48);
  let pairs = 0, steady = 0;
  for (let i = 16; i < n; i++) {
    if (!Number.isFinite(old.cents[i]) || !Number.isFinite(old.cents[i - 16])) continue;
    // The frozen extractor uses the log of the frequency ratio for this block.
    const step = 1200 * Math.log2(oldTrack.f0[i] / oldTrack.f0[i - 16]);
    intervals[Math.max(0, Math.min(47, Math.floor((step + 1200) / 50)))]++;
    pairs++;
    if (Math.abs(step) < 50) steady++;
  }
  const hist48 = pitchHistogram(detail.voiced, 48);
  const moves = new Float64Array(24);
  let total = 0, clean = 0, up = 0, down = 0, jumps = 0;
  for (let i = 10; i < detail.cents.length; i++) {
    const change = detail.cents[i] - detail.cents[i - 10];
    if (!Number.isFinite(change)) continue;
    total++;
    if (Math.abs(change) > 900) { jumps++; continue; }
    clean++;
    if (change > 75) up++;
    if (change < -75) down++;
    moves[Math.max(0, Math.min(23, Math.floor((change + 600) / 50)))]++;
  }
  const relative = rotated(hist48, dominant(hist48));
  const feature = [...absolute, ...rotated(absolute, anchor), ...rotated(first, anchor), ...rotated(last, anchor),
    ...normalized(intervals), Math.min(1, old.spread / 1500), old.voiced.length / n, steady / (pairs || 1),
    ...relative, ...normalized(moves), up / (clean || 1), down / (clean || 1), (clean - up - down) / (clean || 1),
    detail.voiced.length / detail.cents.length, Math.min(1, detail.spread / 1200), jumps / (total || 1)];
  const edge = Math.min(40, Math.max(1, Math.floor(old.voiced.length / 5)));
  const profile = { pitches: roundedProfile(old.voiced), opening: roundedProfile(old.voiced.subarray(0, edge)),
    ending: roundedProfile(old.voiced.subarray(-edge)) };
  return { feature, profile };
}

function rank(labels, scores) {
  return labels.map((label, i) => ({ label, score: scores[i] })).sort((a, b) => b.score - a.score);
}

function forestRanking(model, values) {
  const features = Float32Array.from(values); // sklearn decision trees compare float32 inputs.
  const scores = new Float64Array(model.labels.length);
  for (const tree of model.trees) {
    let node = tree[0];
    while (node[0] >= 0) node = tree[features[node[0]] <= node[1] ? node[2] : node[3]];
    for (let i = 1; i < node.length; i += 2) scores[node[i]] += node[i + 1];
  }
  return rank(model.labels, scores.map(x => x / model.trees.length));
}

function observe(model, span, samples) {
  const [start, end] = span;
  const row = { start, end, ranking: [], excluded: "insufficient", minor: null };
  const result = featuresFor(samples);
  if (!result) return row;
  const { feature, profile } = result;
  row.ranking = forestRanking(model, feature);
  if (feature[222] * (end - start) < 2) return row;
  for (let i = 0; i < 48; i++) {
    let mass = 0;
    for (let j = 0; j < 5; j++) mass += feature[147 + (i + j) % 48];
    if (mass >= .90) return row;
  }
  row.excluded = null;
  row.minor = PersianV4Evidence.minorMatch(profile);
  return row;
}

function leaders(ranking) {
  return ranking.filter(r => ranking[0].score - r.score <= 1e-12).map(r => r.label);
}

function summarize(passages, labels) {
  const usable = passages.filter(p => !p.excluded);
  const result = { ranking: [], status: "insufficient", usable: usable.length, support: 0, family: null };
  if (!usable.length) return result;
  const scores = new Map(labels.map(label => [label, 0]));
  for (const p of usable) for (const r of p.ranking) scores.set(r.label, scores.get(r.label) + r.score);
  result.ranking = rank(labels, labels.map(label => scores.get(label) / usable.length));
  const top = leaders(result.ranking), local = usable.map(p => leaders(p.ranking));
  result.support = top.length === 1 ? local.filter(w => w.length === 1 && w[0] === top[0]).length : 0;
  result.status = usable.length === 1 ? "single" : result.support > usable.length / 2 ? "agreement" : "mixed";
  if (result.status === "mixed") {
    const names = [...local.flat(), ...top];
    if (names.every(x => ["shur", "abu_ata", "bayat_tork", "afshari", "dashti"].includes(x))) result.family = "shur";
    if (names.every(x => ["homayoun", "esfahan"].includes(x))) result.family = "homayoun";
  }
  return result;
}

let model, spans, passages, rows;
function advance() {
  if (rows.length < spans.length) {
    self.postMessage({ type: "interval", span: spans[rows.length] });
    return;
  }
  const clips = passages.map(([start, end]) => rows.find(r => r.start === start && r.end === end));
  self.postMessage({ type: "complete", result: { baseline: rows[0], passages: clips,
    candidate: summarize(clips, model.labels), minor: PersianV4Evidence.combineMinor(clips) } });
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "start") {
      const response = await fetch("../data/v4-forest.json");
      if (!response.ok) throw new Error("Model unavailable");
      model = await response.json();
      if (model.format !== "kdc-v4-tree-1" || model.trees.length !== 200 || model.labels.length !== 12) throw new Error("Invalid model");
      const stem = data.filename.replace(/\.[^.]+$/, "").toLowerCase();
      if (/^[0-9a-f-]{36}$/.test(stem)) {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(stem));
        const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
        if (model.reserved.includes(hash)) { self.postMessage({ type: "reserved" }); return; }
      }
      self.postMessage({ type: "envelope" });
    } else if (data.type === "levels") {
      passages = passageTimes(data.levels, data.duration);
      const baseline = [0, Math.min(60, data.duration)];
      spans = [baseline, ...passages.filter(([a, b]) => a !== 0 || b !== baseline[1])];
      rows = [];
      advance();
    } else if (data.type === "samples") {
      rows.push(observe(model, spans[rows.length], data.samples));
      advance();
    }
  } catch {
    self.postMessage({ type: "error" });
  }
};
