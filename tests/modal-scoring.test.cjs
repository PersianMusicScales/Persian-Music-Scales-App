// Regression tests for the isolated modal evidence refinements.
// Run with: node --test tests/modal-scoring.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/audio-analyzer.js'), 'utf8');
function extractFunction(name) {
  const pattern = new RegExp('\\bfunction\\s+' + name + '\\s*\\(');
  const match = pattern.exec(source);
  assert.ok(match, 'Function ' + name + ' must exist');
  const opening = source.indexOf('{', match.index + match[0].length);
  assert.notEqual(opening, -1);
  let depth = 0;
  for (let i = opening; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(match.index, i + 1);
    }
  }
  throw new Error('Unclosed function: ' + name);
}
const names = [
  'estimatePitchGridOffset', 'continuousPitchCoverage',
  'phraseEndingCadenceFit', 'scoreScaleCandidate'
];
const context = {
  mod: (x, n) => ((x % n) + n) % n,
  clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
  MODAL_SIGNATURES: {
    Shur: { emphasis: [[3, 1]], cadences: [[3, 0, 1]] },
    other: { emphasis: [], cadences: [] },
  },
};
vm.runInNewContext(names.map(extractFunction).join('\n'), context);

function features(overrides = {}) {
  const zeros = () => Array(24).fill(0);
  return {
    structuralProfile: zeros(),
    sustainedProfile: zeros(),
    phraseEndProfile: zeros(),
    openingProfile: zeros(),
    transitionMatrix: Array.from({length: 24}, zeros),
    finalPitchClass: null,
    ...overrides,
  };
}
test('continuous coverage favors nearer musical pitch even across a rounding boundary', () => {
  const events = [{pitch: 0.49, weight: 1}, {pitch: 0.51, weight: 1}];
  const near = context.continuousPitchCoverage([0], events, 0);
  const distant = context.continuousPitchCoverage([2], events, 0);
  assert.ok(near > distant);
  assert.ok(near > 0 && near < 1);
});
test('continuous coverage is invariant to octave equivalents and wraps around pitch class zero', () => {
  const events = [{pitch: 23.9, weight: 1}];
  const a = context.continuousPitchCoverage([0], events, 0);
  const b = context.continuousPitchCoverage([24], events, 0);
  assert.ok(Math.abs(a-b)<1e-12);
  assert.ok(a > 0.95);
});
test('global detuning is estimated only when stable', () => {
  const stable = Array.from({length: 6}, (_,i)=>({pitch: i + 0.2,weight:1}));
  assert.ok(Math.abs(context.estimatePitchGridOffset(stable)-0.2)<1e-9);
  const unstable = [0.4,-0.4,1.4,0.6].map(pitch=>({pitch,weight:1}));
  assert.equal(context.estimatePitchGridOffset(unstable),0);
  assert.equal(context.estimatePitchGridOffset([{pitch:0.2,weight:1}]),0);
});
test('phrase cadence rewards only a matching final transition', () => {
  const observed = [{from:3,to:0,weight:1},{from:5,to:2,weight:1}];
  assert.equal(context.phraseEndingCadenceFit(observed,[[3,0,1]],0),0.5);
  assert.equal(context.phraseEndingCadenceFit(observed,[],0),0);
  assert.equal(context.phraseEndingCadenceFit(observed,[[3,0,1]],7),0);
});
test('legacy profile scoring remains functional without continuous observations', () => {
  const profile = Array(24).fill(0); profile[0] = 0.75;profile[3]=0.25;
  const candidate = context.scoreScaleCandidate('Shur',0,[0,3,6],profile,features());
  assert.equal(candidate.pitchCoverage,candidate.exactCoverage);
  assert.equal(candidate.phraseCadenceEvidence,0);
  assert.ok(Number.isFinite(candidate.score));
});
test('continuous microtonal evidence changes ranking without altering note identity', () => {
  const profile=Array(24).fill(0);profile[0]=1;
  const obs = Array.from({length:5},()=>({pitch:0.7,weight:1}));
  const result = context.scoreScaleCandidate('other',0,[0],profile,features({pitchObservations:obs,pitchGridOffset:0}));
  assert.ok(result.continuousCoverage < 0.5);
  assert.ok(result.pitchCoverage < result.exactCoverage);
  assert.equal(result.tonicBin,0);
  assert.equal(result.notes[0],0);
});
