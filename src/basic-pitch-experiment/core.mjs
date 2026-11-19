/* Experimental Persian music analysis. No trained Dastgah/Avaz classification.
 * Original implementation for this project; consumes Spotify Basic Pitch outputs.
 */

export const MODELS = Object.freeze([
  {id:'shur', name:'Shur', type:'Dastgah', scale:'shur', shahed:0, finalis:0},
  {id:'mahur', name:'Mahur', type:'Dastgah', scale:'mahur', shahed:0, finalis:0},
  {id:'homayoun', name:'Homayoun', type:'Dastgah', scale:'homayoun', shahed:3, finalis:0},
  {id:'segah', name:'Segah', type:'Dastgah', scale:'segah', shahed:7, finalis:7},
  {id:'chahargah', name:'Chahargah', type:'Dastgah', scale:'chahargah', shahed:0, finalis:0},
  {id:'nava', name:'Nava', type:'Dastgah', scale:'nava', shahed:0, finalis:0},
  {id:'rast_panjgah', name:'Rast-Panjgah', type:'Dastgah', scale:'mahur', shahed:0, finalis:0, indistinguishableFrom:'mahur'},
  {id:'abu_ata', name:'Abu Ata', type:'Avaz', scale:'shur', shahed:10, finalis:0},
  {id:'bayat_tork', name:'Bayat-e Tork', type:'Avaz', scale:'shur', shahed:6, finalis:null},
  {id:'afshari', name:'Afshari', type:'Avaz', scale:'shur', shahed:0, finalis:10},
  {id:'dashti', name:'Dashti', type:'Avaz', scale:'shur', shahed:14, finalis:0},
  {id:'esfahan', name:'Bayat-e Esfahan', type:'Avaz', scale:'esfahan', shahed:0, finalis:14}
]);

// Canonical 24-bin pitch-collection reference patterns in existing app's index.js.
// Reused Shur collection for its Avazha is only a rough approximation; e.g.,
// Afshari and Dashti contain variable tones NOT represented in this template.
export const SCALES = Object.freeze({
  shur: [0,3,6,10,14,16,20], nava: [0,4,6,10,14,17,20],
  segah: [0,4,7,10,14,17,20], homayoun: [0,3,8,10,14,16,20],
  esfahan: [0,4,6,10,14,17,22], chahargah: [0,3,8,10,14,17,22],
  mahur: [0,4,8,10,14,18,22]
});
const FRAME_RATE = 22050 / 256;
const mod = (n, m) => ((n % m) + m) % m;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

export function median(values) {
  if (!values.length) return NaN;
  const xs = [...values].sort((a,b)=>a-b);
  const k=Math.floor(xs.length/2);
  return xs.length%2 ? xs[k] : (xs[k-1]+xs[k])/2;
}
export function midiToHz(pitch) { return 440 * 2 ** ((pitch - 69) / 12); }
export function fractionalPitchFromBends(midi, bends) {
  const valid = (bends || []).filter(Number.isFinite);
  // Spotify pitchBends are CONTOUR BIN offsets, with 3 bins per semitone,
  // NOT the +/-8192 raw MIDI pitch-wheel integer representation.
  return midi + (valid.length ? median(valid) / 3 : 0);
}

// Estimate a sub-grid contour pitch near the nominal note using a three-point
// log-parabolic refinement. This reduces output quantization (the underlying
// network remains 3 bins per semitone; this is NOT verified cent-level accuracy).
export function finePitchFromContours(contours, note, fallBack) {
  if (!Array.isArray(contours) || !contours.length) return fallBack;
  const start = Math.max(0, Math.floor(note.startTimeSeconds * FRAME_RATE) + 1);
  const end = Math.min(contours.length, Math.ceil((note.startTimeSeconds + note.durationSeconds) * FRAME_RATE) - 1);
  const expectedBin = (note.pitchMidi - 21) * 3;
  if (end - start < 3 || expectedBin < 3 || expectedBin >= 261) return fallBack;
  const values=[];
  const trim = Math.max(1, Math.floor((end-start)*0.13));
  for(let t=start+trim; t<end-trim; t+=Math.max(1,Math.floor((end-start)/80))) {
    const row=contours[t];
    if (!row || row.length !== 264) continue;
    const left=clamp(Math.round(expectedBin)-4, 1, 262);
    const right=clamp(Math.round(expectedBin)+4, 1, 262);
    let k=left, peak=0;
    for(let j=left;j<=right;j++) if(Number.isFinite(row[j]) && row[j]>peak){k=j;peak=row[j];}
    if (peak < 0.08) continue;
    const a=Math.log(Math.max(1e-8,row[k-1])), b=Math.log(Math.max(1e-8,row[k])), c=Math.log(Math.max(1e-8,row[k+1]));
    const denominator=a-2*b+c;
    const delta = Math.abs(denominator) > 1e-7 ? clamp(0.5*(a-c)/denominator,-0.5,0.5) : 0;
    const estimate=21+(k+delta)/3;
    if (Math.abs(estimate-note.pitchMidi) <= 1.65) values.push(estimate);
  }
  if(values.length < 3) return fallBack;
  const refined=median(values);
  // Reject extreme disagreement; e.g., adjacent voice or a strong harmonic.
  return Math.abs(refined-fallBack) > 0.75 ? fallBack : refined;
}

export function normalizeNotes(rawNotes, contours=[]) {
  if (!Array.isArray(rawNotes)) return [];
  return rawNotes.map(note=>{
    const midi=Number(note.pitchMidi), start=Number(note.startTimeSeconds), duration=Number(note.durationSeconds);
    if (!Number.isFinite(midi)||!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0 || start<0) return null;
    const bendPitch=fractionalPitchFromBends(midi, note.pitchBends);
    const floatMidi=finePitchFromContours(contours,note,bendPitch);
    const confidence=clamp(Number(note.amplitude)||0,0,1);
    return { start, end:start+duration, duration, midi:floatMidi, hz:midiToHz(floatMidi),
      centsOffsetFromPiano:(floatMidi-Math.round(floatMidi))*100,
      bin24:mod(Math.round(floatMidi*2),24), weight:Math.sqrt(Math.max(.02,duration))*Math.max(.08,confidence),
      amplitude:confidence };
  }).filter(Boolean).sort((a,b)=>a.start-b.start||b.weight-a.weight);
}

// Select a simple, reproducible predominant melodic line when the transcription
// contains chords / harmonics. Do not classify simultaneous notes as a single mode.
export function predominantNotes(notes) {
  const output=[];
  for(const note of notes) {
    let overlapped=false;
    for(let k=output.length-1;k>=0;k--){
      const prev=output[k];
      if(prev.end < note.start-.05) break;
      const overlap=Math.min(note.end,prev.end)-Math.max(note.start,prev.start);
      if(overlap > 0.55*Math.min(note.duration,prev.duration)) {
        overlapped=true;
        if(note.weight>prev.weight*1.17 && Math.abs(note.midi-prev.midi)<18) output[k]=note;
        break;
      }
    }
    if(!overlapped) output.push(note);
  }
  return output.sort((a,b)=>a.start-b.start);
}

function normalized(hist){const sum=hist.reduce((a,b)=>a+b,0);return sum>0?hist.map(x=>x/sum):hist;}
export function makeProfiles(notes){
  const hist=Array(24).fill(0), emphasis=Array(24).fill(0), ending=Array(24).fill(0);
  const transitions=Array.from({length:24},()=>Array(24).fill(0));
  for(let i=0;i<notes.length;i++){
    const n=notes[i], next=notes[i+1];
    const bin=n.bin24, x=n.midi*2, low=mod(Math.floor(x),24), high=mod(low+1,24);
    const fraction=x-Math.floor(x);
    // Soft assignment makes the representation less brittle at half-semitone boundaries.
    hist[low]+=n.weight*(1-fraction);hist[high]+=n.weight*fraction;
    if(n.duration>=.14){emphasis[bin]+=n.weight*Math.sqrt(n.duration);}
    const gap=next ? Math.max(0,next.start-n.end):1;
    if(!next || gap>=.22 || (n.duration>=.42 && gap>=.09)) ending[bin]+=n.weight*(1+Math.min(gap,1));
    if(next && gap < 1.1) transitions[bin][next.bin24]+=Math.sqrt(n.weight*next.weight);
  }
  return {hist:normalized(hist),emphasis:normalized(emphasis),ending:normalized(ending), transitions};
}

function at(profile, bin){return profile[mod(bin,24)]||0;}
export function rankModes(profiles){
  if(!profiles || !profiles.hist?.some(n=>n>0)) return [];
  return MODELS.map(model=>{
    const scale=SCALES[model.scale], best=[];
    for(let tonic=0;tonic<24;tonic++){
      const coverage=scale.reduce((s,d)=>s+at(profiles.hist,tonic+d),0);
      const shahed=at(profiles.emphasis,tonic+model.shahed);
      const meanEmphasis=scale.reduce((s,d)=>s+at(profiles.emphasis,tonic+d),0)/7;
      const salient=clamp((shahed-meanEmphasis)*3.5+0.5,0,1);
      const final=model.finalis===null?0.5:clamp(at(profiles.ending,tonic+model.finalis)*3.5,0,1);
      // This is a heuristic fit, not a learned label probability. Most modes
      // sharing pitch collections cannot be reliably distinguished this way.
      const score=coverage*.77+salient*.15+final*.08;
      best.push({tonicBin:tonic, fit:score});
    }
    best.sort((a,b)=>b.fit-a.fit);
    return {...model,...best[0]};
  }).sort((a,b)=>b.fit-a.fit);
}

// The Spotify model can jump between a fundamental and its integer harmonics.
// A large change in pitch does NOT, by itself, establish a transcription error;
// the purpose here is to identify unreliable evidence, not to overwrite pitches.
export function melodyReliability(melody) {
  const intervals = Math.max(0, melody.length - 1);
  let leaps = 0, harmonicLeaps = 0;
  for (let i = 1; i < melody.length; i++) {
    const a = melody[i - 1].hz, b = melody[i].hz;
    if (!(a > 0 && b > 0)) continue;
    const ratio = Math.max(a, b) / Math.min(a, b);
    if (ratio < 2) continue;
    leaps++;
    const harmonic = Math.round(ratio);
    if (harmonic >= 2 && harmonic <= 8 &&
        Math.abs(1200 * Math.log2(ratio / harmonic)) <= 50) harmonicLeaps++;
  }
  const hist = makeProfiles(melody).hist;
  const topFourCoverage = [...hist].sort((a, b) => b - a).slice(0, 4).reduce((a, b) => a + b, 0);
  const harmonicJumpFraction = harmonicLeaps / Math.max(1, intervals);
  const unstable = (harmonicLeaps >= 8 && harmonicJumpFraction >= 0.14) ||
    (harmonicLeaps >= 5 && topFourCoverage >= 0.9);
  const insufficient = melody.length < 15;
  return {status: insufficient ? 'insufficient' : unstable ? 'unreliable' : 'review',
    noteCount: melody.length, largeLeaps: leaps, harmonicLeaps,
    harmonicJumpFraction, topFourCoverage,
    // This is only a rule-based warning; it does not confirm actual harmonics.
    caution: unstable ? 'Frequent integer-ratio large jumps: possible harmonic switching. The modal winner should not be trusted.' :
      insufficient ? 'Too few extracted notes for a meaningful modal hypothesis.' :
      'No strong harmonic-switching warning; musical identity remains unvalidated.'};
}

// Independently compare Spotify predictions with the existing JS-worker pitch
// events from the SAME audio. Neither estimate is treated as ground truth.
// Only time-overlapping notes with sufficiently confident worker events count.
export function compareWithWorker(melody, workerEvents = []) {
  if (!Array.isArray(workerEvents) || !workerEvents.length)
    return {available:false, compared:0, agreement:0, harmonicConflicts:0,
      agreementFraction:null, warnings:['JS worker comparison not available']};
  const reference = workerEvents.filter(e => Number.isFinite(e.frequency) && e.frequency > 0 &&
    Number.isFinite(e.startTime) && Number.isFinite(e.endTime) && e.endTime > e.startTime &&
    Number(e.confidence) >= 0.35).sort((a, b) => a.startTime - b.startTime);
  let compared = 0, agreement = 0, harmonicConflicts = 0, disagreements = 0;
  let testedDuration = 0, agreementDuration = 0;
  for (const note of melody) {
    let best = null, bestOverlap = 0;
    for (const event of reference) {
      if (event.startTime >= note.end) break;
      if (event.endTime <= note.start) continue;
      const overlap = Math.max(0, Math.min(note.end, event.endTime) - Math.max(note.start, event.startTime));
      const support = overlap * Math.max(.01, Math.min(1, event.confidence));
      if (support > bestOverlap) {bestOverlap = support; best = event;}
    }
    if (!best || bestOverlap < Math.min(note.duration, best.endTime - best.startTime) * 0.25) continue;
    compared++;testedDuration += note.duration;
    const delta = Math.abs(1200 * Math.log2(note.hz / best.frequency));
    if (delta <= 100) {agreement++;agreementDuration += note.duration;continue;}
    disagreements++;
    const ratio = Math.max(note.hz, best.frequency) / Math.min(note.hz, best.frequency);
    const integer = Math.round(ratio);
    if (integer >= 2 && integer <= 8 && Math.abs(1200 * Math.log2(ratio / integer)) <= 50)
      harmonicConflicts++;
  }
  const comparedFraction = compared / Math.max(1, melody.length);
  return {available:true, compared, comparedFraction, agreement, disagreements,
    harmonicConflicts, agreementFraction: compared ? agreement / compared : null,
    agreementDurationFraction: testedDuration > 0 ? agreementDuration / testedDuration : null,
    warnings: compared < 12 || comparedFraction < .25 ?
      ['Too few overlapping estimates for a reliable cross-check'] :
      agreement / compared < .55 ? ['Spotify and JS-worker pitches frequently disagree'] : []};
}

export function workerMelody(workerEvents = [], maxSeconds = Infinity) {
  if (!Array.isArray(workerEvents)) return [];
  return workerEvents.map(e => {
    const start=Number(e.startTime), end=Number(e.endTime), hz=Number(e.frequency);
    const confidence=Number(e.confidence);
    if (!(Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(hz) &&
          start>=0 && end>start && hz>0 && Number.isFinite(confidence) && confidence>=.35)) return null;
    if (start >= maxSeconds) return null;
    const midi=69+12*Math.log2(hz/440), duration=Math.min(end,maxSeconds)-start;
    if (!(duration>0)) return null;
    return {start,end:Math.min(end,maxSeconds),duration,hz,midi,
      bin24:mod(Math.round(midi*2),24),weight:Math.sqrt(duration)*clamp(confidence,.08,1),
      centsOffsetFromPiano:(midi-Math.round(midi))*100};
  }).filter(Boolean).sort((a,b)=>a.start-b.start);
}

export function analyzeTranscription(noteEvents, contours, workerEvents = [], maxSeconds = Infinity) {
  const poly=normalizeNotes(noteEvents,contours);
  const melody=predominantNotes(poly);
  const profiles=makeProfiles(melody);
  const ranked=rankModes(profiles);
  const durations=melody.map(n=>n.duration);
  const reliability=melodyReliability(melody);
  const reference=workerMelody(workerEvents,maxSeconds);
  const comparison=compareWithWorker(melody,workerEvents);
  const workerRanked=reference.length >= 15 ? rankModes(makeProfiles(reference)) : [];
  // Never invent a new top label from the same two user-provided examples.
  // Instead, abstain when the underlying melody evidence is demonstrably shaky.
  const crossCheckWeak = comparison.compared >= 12 && comparison.comparedFraction >= .25 &&
    comparison.agreementFraction < .55;
  const abstain = reliability.status !== 'review' || crossCheckWeak;
  return {
    noteCount:poly.length, melodyCount:melody.length,
    melody, ranked, profiles, reliability, comparison,
    workerRanked, workerMelodyCount: reference.length,
    decision: abstain ? 'uncertain' : 'exploratory',
    decisionReason: crossCheckWeak ? 'Independent pitch extractors disagree frequently.' :
      reliability.status === 'unreliable' ? reliability.caution :
      reliability.status === 'insufficient' ? reliability.caution :
      'Tentative ranking only. Not calibrated and not verified for Persian modal identity.',
    medianDuration:median(durations),
    // MIDI-only cents offsets reflect model interpolation, NOT measured accuracy.
    medianAbsCentsDeviation:median(melody.map(n=>Math.abs(n.centsOffsetFromPiano))),
    limitations:'12-category similarity is an unvalidated heuristic. Rast-Panjgah/Mahur and Shur-family Avazha can remain inherently ambiguous.'
  };
}
