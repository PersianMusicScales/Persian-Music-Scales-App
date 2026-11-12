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
  'phraseEndingCadenceFit', 'extractStructuralPhrases', 'scorePhraseBehavior',
  'scoreCadenceDirection', 'analysisRoleHypotheses',
  'scoreTonalRoleBehavior', 'classifyShurAvaz', 'scoreScaleCandidate'
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

function event(pitchIndex, startTime, duration = 0.3, options = {}) {
  return {
    pitchIndex,
    pitchClass: ((pitchIndex % 24) + 24) % 24,
    startTime,
    endTime: startTime + duration,
    duration,
    confidence: 0.95,
    role: 'structural',
    phraseEnding: false,
    ...options,
  };
}
test('structural phrase segmentation excludes ornaments and preserves boundaries', () => {
  const events = [
    event(3, 0),event(6,0.3),
    event(8,0.6,0.1,{role:'ornament'}),
    event(0,0.8,0.3,{phraseEnding:true}),
    event(3,1.2),event(6,1.5),event(0,1.8,0.3,{phraseEnding:true}),
  ];
  const p=context.extractStructuralPhrases(events);
  assert.equal(p.length,2);
  assert.equal(p[0].notes.length,3);
  assert.equal(p[1].notes.length,3);
});
test('phrase behavior requires multiple phrases of at least three notes', () => {
  const p=[{notes:[event(3,0),event(6,0.2),event(0,0.4)]}];
  assert.equal(context.scorePhraseBehavior(p,'Shur',0).available,false);
  assert.equal(context.scorePhraseBehavior([...p,...p],'Shur',0).available,true);
});
test('directed cadence matching distinguishes descent from octave reversal', () => {
  const descent=[{notes:[event(6,0),event(3,0.2),event(0,0.4)]}];
  const ascending=[{notes:[event(6,0),event(3,0.2),event(24,0.4)]}];
  const template=[[3,0,1]];
  assert.equal(context.scoreCadenceDirection(descent,template,0).score,1);
  assert.equal(context.scoreCadenceDirection(ascending,template,0).available,false);
});
test('tonal roles are unavailable for unverified modes or insufficient phrases', () => {
  const p=[{notes:[event(3,0),event(0,0.3)]}];
  const profile=Array(24).fill(0);
  assert.equal(context.scoreTonalRoleBehavior(p,profile,'esfahan',0,[0,4,6,10,14,17,22]).available,false);
  assert.equal(context.scoreTonalRoleBehavior(p,profile,'Shur',0,[0,3,6,10,14,16,20]).available,false);
});
test('role hypotheses reject impossible pitch offsets and remain bounded', () => {
  const p=[
    {notes:[event(3,0),event(0,0.3)]},
    {notes:[event(3,1),event(0,1.3)]},
  ];
  const profile=Array(24).fill(0);profile[0]=1;
  const valid=context.scoreTonalRoleBehavior(p,profile,'Shur',0,[0,3,6,10,14,16,20]);
  assert.equal(valid.available,true);
  assert.ok(valid.score>=0 && valid.score<=1);
  const invalid=context.scoreTonalRoleBehavior(p,profile,'segah',0,[0,4,6,10,14,17,20]);
  assert.equal(invalid.available,false);
});
test('new phrase channels leave empty-input scoring finite and compatible', () => {
  const profile=Array(24).fill(0);profile[0]=1;
  const score=context.scoreScaleCandidate('Shur',0,[0,3,6],profile,features());
  assert.ok(Number.isFinite(score.score));
  assert.equal(score.phraseBehavior.available,false);
  assert.equal(score.cadenceDirection.available,false);
  assert.equal(score.tonalRoleEvidence.available,false);
});


// Synthesized reference-pitch examples exercise exact quarter-tone offsets.
// They are unit fixtures, not mislabeled real-world audio validation.
const shurG = 14; // G pitch class in app, C=0 (24 half-semitone bins)
const rel = (x) => ((shurG+x)%24+24)%24;
function phrase(offsets, t=0, longOffset=null) {
  return {notes:offsets.map((offset,i)=>event(rel(offset),t+i*.25,
    offset===longOffset?0.7:0.25))};
}
function avazFeatures(phrases, emphasisOffsets=[]) {
  const sustainedProfile=Array(24).fill(0);
  for (const [offset,value] of emphasisOffsets) sustainedProfile[rel(offset)]=value;
  return {structuralPhrases:phrases,sustainedProfile};
}
function classify(phrases,emphasis=[]) {
  return context.classifyShurAvaz(shurG,avazFeatures(phrases,emphasis),0.93);
}
test('Abu Ata: C shahed, A-koron ist, G finalis yield provisional branch',()=>{
  const phrases=[
    phrase([10,6,3]), phrase([0,10,3]), phrase([14,10,3]),
    phrase([10,6,3,0]), 
  ];
  const result=classify(phrases,[[10,0.35]]);
  assert.equal(result.avazKey,'abuAta');
  assert.equal(result.experimental,true);
});
test('Bayat-e Tork: Bb prominence and Bb/F phrase rests with no microtone confusion',()=>{
  const phrases=[
    phrase([0,3,6]),phrase([10,14,6]),phrase([20,14,6]),
    phrase([3,0,20])
  ];
  const result=classify(phrases,[[6,0.36]]);
  assert.equal(result.avazKey,'bayatTork');
});
test('Afshari: E-koron ist is NOT Eb; G shahed and C finalis',()=>{
  const phrases=[
    phrase([0,20,17]),phrase([14,20,17]),phrase([0,16,17]),
    phrase([0,17,10])
  ];
  const result=classify(phrases,[[0,0.32]]);
  assert.equal(result.avazKey,'afshari');
  const wrong=classify([
    phrase([0,20,16]),phrase([14,20,16]),phrase([0,20,16]),
    phrase([0,16,10])
  ],[[0,0.32]]);
  assert.notEqual(wrong.avazKey,'afshari');
});
test('Dashti: natural D, later D-koron and G finalis are independently distinguishable',()=>{
  const p=[phrase([14,20,0]),phrase([14,10,13]),phrase([10,14,13]),phrase([20,13,0])];
  const result=classify(p);
  assert.equal(result.avazKey,'dashti');
  const noLowered=classify([
    phrase([14,20,0]),phrase([14,10,14]),
    phrase([10,14,20]),phrase([20,14,0])
  ]);
  assert.notEqual(noLowered.avazKey,'dashti');
});
test('classifier abstains with a short clip, poor scale coverage, or a single clue',()=>{
  const p=[phrase([10,6,3])];
  assert.equal(classify(p,[[10,.4]]).avazKey,null);
  const many=[phrase([10,6,3]),phrase([0,10,3]),phrase([14,10,3]),phrase([10,6,3,0])];
  assert.equal(context.classifyShurAvaz(shurG,avazFeatures(many,[[10,.4]]),.3).avazKey,null);
  const oneClue=[phrase([0,3,6]),phrase([10,14,6]),phrase([20,14,6]),phrase([10,14,6])];
  assert.equal(classify(oneClue).avazKey,null);
});
test('shur family offsets preserve correct microtone distinctions on 24-bin grid',()=>{
  assert.equal(rel(3),17); // A koron, not A flat (16)
  assert.equal(rel(13),3); // D koron, not D flat (2)
  assert.equal(rel(17),7); // E koron, not E flat (6)
});
