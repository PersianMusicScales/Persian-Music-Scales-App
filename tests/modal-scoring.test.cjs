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
  'scoreTonalRoleBehavior', 'classifyShurAvaz',
  'avazPitchClass', 'avazPitchMatch', 'avazContinuousPitchFit',
  'avazPhraseEvidence', 'scoreIndependentAvaz',
  'relativeMotifFromNotes', 'relativeMotifSimilarity',
  'discoverRecurrentEndingMotifs', 'recurrentEndingMotifFit',
  'scoreScaleCandidate'
];
const context = {
  mod: (x, n) => ((x % n) + n) % n,
  clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
  AVAZ_REFERENCE_MODELS: undefined,
  MODAL_SIGNATURES: {
    Shur: { emphasis: [[3, 1]], cadences: [[3, 0, 1]] },
    other: { emphasis: [], cadences: [] },
  },
};
const avazModels = source.match(/const AVAZ_REFERENCE_MODELS = Object\.freeze\(\[[\s\S]*?\]\);/);
assert.ok(avazModels,'Avaz reference model table is present');
vm.runInNewContext(avazModels[0]+'\n'+names.map(extractFunction).join('\n')+
  '\nthis.AVAZ_REFERENCE_MODELS=AVAZ_REFERENCE_MODELS;', context);

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


// Source examples are translated into abstract *functional* synthetic fixtures.
// No copyrighted IRMA note sequences are included.
const refC=0;
const atCent = cent => Math.round(cent/50);
function phraseC(offsets, t=0) {
  return {notes:offsets.map((offset,i)=>event(atCent(offset),t+i*0.25))};
}
function avazFixture(phraseOffsets,shahedCent,weight=0.28) {
  const phrases=phraseOffsets.map((p,i)=>phraseC(p,i*4));
  const sustained=Array(24).fill(0);sustained[atCent(shahedCent)]=weight;
  const profile=Array(24).fill(0);
  const observations=[];
  for (const p of phrases) for(const e of p.notes) {
    profile[e.pitchClass]+=1;
    observations.push({pitch:e.pitchClass,weight:1});
  }
  const n=profile.reduce((a,b)=>a+b,0);
  return {features:{structuralPhrases:phrases,sustainedProfile:sustained,
    pitchObservations:observations,pitchGridOffset:0},profile:profile.map(v=>v/n)};
}
const models = context.AVAZ_REFERENCE_MODELS;
test('the four sources are represented by independent reference models',()=>{
  assert.equal(models.length,4);
  assert.deepEqual(Array.from(models.map(m=>m.key)),
    ['abuAta','bayatTork','afshari','dashti']);
  assert.equal(models.find(m=>m.key==='bayatTork').finalis,500);
  assert.equal(models.find(m=>m.key==='dashti').finalis,205);
  assert.equal(models.find(m=>m.key==='afshari').ist,340);
});
test('independent tonal evidence does not need a prior Shur candidate',()=>{
  const f=avazFixture([
    [700,500,340],[700,205,340],[700,500,340],[700,500,205,0],
  ],700);
  const af=models.find(m=>m.key==='afshari');
  const candidate=context.scoreIndependentAvaz(af,0,f.features,f.profile);
  assert.ok(candidate);
  assert.equal(candidate.key,'afshari');
  assert.equal(candidate.referenceBin,0);
  assert.equal(candidate.shurTonicBin,4);
  assert.ok(candidate.pitchCompatibility>0.61);
});
test('Abu Ata tonal roles are evaluated from the sourced C-reference',()=>{
  const f=avazFixture([
    [700,500,340],[700,205,340],[700,500,340],[700,340,205]
  ],700);
  const result=context.scoreIndependentAvaz(models[0],0,f.features,f.profile);
  assert.ok(result);
  assert.ok(result.signals.ist>0.8);
  assert.ok(result.signals.finalis>0.8);
});
test('Bayat-e Tork distinguishes F finalis and C ist from Bb finalis',()=>{
  const f=avazFixture([
    [0,205,0],[700,500,0],[0,700,0],[0,340,500]
  ],500,0.35);
  const result=context.scoreIndependentAvaz(models[1],0,f.features,f.profile);
  assert.ok(result);
  assert.equal(result.signals.ist,1);
  assert.equal(result.signals.finalis,1);
});
test('Dashti uses A/A-koron alteration, not an invented D/D-koron rule',()=>{
  const m=models.find(x=>x.key==='dashti');
  assert.deepEqual(Array.from(m.variable),[905,835]);
  const f=avazFixture([[500,700,905],[500,835,905],[500,995,905],[500,905,205]],
    905,0.38);
  const result=context.scoreIndependentAvaz(m,0,f.features,f.profile);
  assert.ok(result);
  assert.ok(result.signals.variable>0.5);
  assert.equal(result.signals.finalis,1);
});
test('all Avaz reference matches are invariant under octave and tonic transposition',()=>{
  const base=avazFixture([[500,700,905],[500,835,905],[500,995,905],[500,905,205]],
    905,0.38);
  const model=models[3];
  const score=context.scoreIndependentAvaz(model,0,base.features,base.profile);
  const shift=7;
  const shifted={
    ...base.features,
    structuralPhrases:base.features.structuralPhrases.map(p=>({notes:p.notes.map(e=>event(
      e.pitchIndex+24+shift,e.startTime,e.duration))})),
    sustainedProfile:base.features.sustainedProfile.map((_,i,a)=>a[(i-shift+24)%24]),
    pitchObservations:base.features.pitchObservations.map(o=>({pitch:(o.pitch+shift)%24,weight:o.weight}))
  };
  const shiftedProfile=base.profile.map((_,i,a)=>a[(i-shift+24)%24]);
  const out=context.scoreIndependentAvaz(model,shift,shifted,shiftedProfile);
  assert.ok(Math.abs(out.evidence-score.evidence)<1e-10);
});
test('unpitched or very short clips abstain',()=>{
  const no=context.classifyShurAvaz({structuralPhrases:[]},Array(24).fill(0));
  assert.equal(no.avazKey,null);
  const f=avazFixture([[0,205,500]],500);
  const tooShort=context.scoreIndependentAvaz(models[1],0,f.features,f.profile);
  assert.equal(tooShort,null);
});
test('recognition uses independent C source pitch and does not conflate E-koron with Eb',()=>{
  assert.equal(context.avazPitchClass(0,340),7);  // E koron
  assert.equal(context.avazPitchClass(0,835),17); // A koron
  assert.equal(context.avazPitchClass(0,995),20); // B flat
  assert.equal(context.avazPitchMatch(6,7),0.45); // Eb differs 50 cents
  assert.equal(context.avazPitchMatch(7,7),1);
});

// No IRMA melodies are copied into these tests: all examples are invented
// scalar pitch-index fixtures, not published Radif transcriptions.
function syntheticPhrase(pitches, onset = 0) {
  return {notes:pitches.map((pitch,i)=>event(pitch,onset+i*0.3))};
}
test('motif contour is invariant to tonic and octave transposition',()=>{
  const a=context.relativeMotifFromNotes(syntheticPhrase([0,4,7,10]).notes);
  const b=context.relativeMotifFromNotes(syntheticPhrase([19,23,26,29]).notes);
  const c=context.relativeMotifFromNotes(syntheticPhrase([24,28,31,34]).notes);
  assert.equal(JSON.stringify(a),JSON.stringify(b));
  assert.equal(JSON.stringify(a),JSON.stringify(c));
  assert.equal(context.relativeMotifSimilarity(a,b),1);
});
test('minor quantization jitter is tolerated but reversed direction is not',()=>{
  const exact=[0,4,7,10], slight=[0,4,8,11], contrary=[0,-4,-7,-10];
  assert.ok(context.relativeMotifSimilarity(exact,slight,1)>=0.7);
  assert.equal(context.relativeMotifSimilarity(exact,contrary,1),0);
  assert.equal(context.relativeMotifSimilarity(exact,slight,0),0);
});
test('motif matching rejects incomplete, malformed or too-short patterns',()=>{
  assert.equal(context.relativeMotifFromNotes(syntheticPhrase([0,3]).notes),null);
  assert.equal(context.relativeMotifSimilarity([0,4],[0,4]),0);
  assert.equal(context.relativeMotifSimilarity([0,3,6],[0,3,NaN]),0);
});
test('recurrent cadence requires same pitch-class ending across distinct phrases',()=>{
  const phrases=[
    syntheticPhrase([0,4,7,10],0),
    syntheticPhrase([24,28,31,34],2),
    syntheticPhrase([2,6,9,12],4)
  ];
  const discovered=context.discoverRecurrentEndingMotifs(phrases);
  assert.equal(discovered.phraseCount,3);
  assert.equal(discovered.support[10],2);
  assert.equal(discovered.support[12],0);
  assert.ok(context.recurrentEndingMotifFit(discovered,10)>0.6);
  assert.equal(context.recurrentEndingMotifFit(discovered,12),0);
});
test('matching relative contour ending on DIFFERENT pitch is not treated as resolution',()=>{
  const phrases=[
    syntheticPhrase([0,4,7,10]),
    syntheticPhrase([1,5,8,11],2),
    syntheticPhrase([2,6,9,12],4),
  ];
  const discovered=context.discoverRecurrentEndingMotifs(phrases);
  assert.equal(discovered.support.reduce((a,b)=>a+b,0),0);
});
test('repeated terminal notes with conflicting contours do not count',()=>{
  const phrases=[
    syntheticPhrase([0,4,7,10]),
    syntheticPhrase([10,4,2,10],2),
    syntheticPhrase([2,5,8,12],4),
  ];
  const discovered=context.discoverRecurrentEndingMotifs(phrases);
  assert.equal(context.recurrentEndingMotifFit(discovered,10),0);
});
test('less than three usable phrases contributes no motif bonus',()=>{
  const discovered=context.discoverRecurrentEndingMotifs([
    syntheticPhrase([0,4,7,10]),syntheticPhrase([0,4,7,10],2)
  ]);
  assert.equal(context.recurrentEndingMotifFit(discovered,10),0);
  assert.equal(context.recurrentEndingMotifFit(null,10),0);
});
test('recurrent motif scoring is bounded to half a percentage point',()=>{
  const p=Array(24).fill(0); p[0]=0.75;p[3]=0.25;
  const base=context.scoreScaleCandidate('Shur',0,[0,3,6],p,features());
  const supporting=Array(24).fill(0);supporting[0]=9;
  const extra=context.scoreScaleCandidate('Shur',0,[0,3,6],p,
    features({recurrentEndingMotifs:{phraseCount:10,support:supporting}}));
  assert.ok(extra.recurrentMotifEvidence>0);
  assert.ok(extra.score>base.score);
  assert.ok(extra.score-base.score<=0.005000001);
  assert.equal(base.recurrentMotifEvidence,0);
});
