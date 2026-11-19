import test from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, SCALES, median, fractionalPitchFromBends, finePitchFromContours, normalizeNotes, predominantNotes, makeProfiles, rankModes, analyzeTranscription } from '../src/basic-pitch-experiment/core.mjs';

test('all 7 Dastgah and 5 Avaz labels, no duplicates',()=>{
 assert.equal(MODELS.length,12);
 assert.equal(new Set(MODELS.map(x=>x.id)).size,12);
 assert.equal(MODELS.filter(x=>x.type==='Avaz').length,5);
 for(const model of MODELS) assert.equal(SCALES[model.scale].length,7);
});
test('Spotify pitchBends contour units are thirds of a semitone, not raw MIDI ticks',()=>{
 assert.equal(fractionalPitchFromBends(60,[1,1,1]),60+1/3);
 assert.equal(fractionalPitchFromBends(60,[-1,-2,-1]),60-1/3);
 assert.equal(fractionalPitchFromBends(60,[]),60);
});
test('sub-bin contour interpolation provides fractional pitch and handles malformed shape',()=>{
 const c=Array.from({length:150},()=>Array(264).fill(.001));
 const k=(69-21)*3;
 for(const frame of c){frame[k-1]=.15;frame[k]=.80;frame[k+1]=.55;}
 const value=finePitchFromContours(c,{pitchMidi:69,startTimeSeconds:0,durationSeconds:1},69);
 assert.ok(value>69 && value<69.25, value);
 assert.equal(finePitchFromContours([[0]],{pitchMidi:69,startTimeSeconds:0,durationSeconds:1},69),69);
});
test('notes with fractional pitch preserve microtonal offsets',()=>{
 const a=normalizeNotes([{pitchMidi:60,startTimeSeconds:0,durationSeconds:.4,amplitude:.8,pitchBends:[1,1]}]);
 assert.equal(a.length,1); assert.ok(a[0].centsOffsetFromPiano > 32);
 assert.equal(a[0].bin24,mod(Math.round((60+1/3)*2),24));
});
function mod(n,m){return ((n%m)+m)%m}
test('profiles normalize and rank all 12, without claiming a calibrated probability',()=>{
 const a=Array.from({length:20},(_,i)=>({pitchMidi:60+i%5,startTimeSeconds:i*.27,durationSeconds:.23,amplitude:.9,pitchBends:[]}));
 const result=analyzeTranscription(a,[]);
 assert.equal(result.ranked.length,12);
 assert.ok(result.ranked.every(x=>Number.isFinite(x.fit) && x.fit>=0&&x.fit<=1));
 assert.ok(Math.abs(result.profiles.hist.reduce((x,y)=>x+y,0)-1)<1e-6);
});
test('unvoiced input does not invent a classification',()=>{
 const result=analyzeTranscription([],[]);assert.equal(result.ranked.length,0);
});
test('overlapping pitches do not inflate melody event count',()=>{
 const a=normalizeNotes([
 {pitchMidi:60,startTimeSeconds:0,durationSeconds:.5,amplitude:.9},
 {pitchMidi:67,startTimeSeconds:.02,durationSeconds:.42,amplitude:.4},
 {pitchMidi:62,startTimeSeconds:.55,durationSeconds:.3,amplitude:.8}
 ]);
 assert.equal(predominantNotes(a).length,2);
});
