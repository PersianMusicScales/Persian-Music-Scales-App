/* Build entry: Spotify Basic Pitch v1.0.1 is installed and bundled on the user's
 * own computer via `npm run basic-pitch:build`. The model and all user audio
 * are processed locally in the browser. This is NOT a pretrained mode detector.
 */
import {BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime} from '@spotify/basic-pitch';
import {analyzeTranscription} from './core.mjs';

const MODEL_URL = new URL('./assets/models/basic-pitch/model.json', window.location.href).href;
let cachedModel = null;

async function decodeAndResample(file, maxSeconds) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const OfflineCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContextCtor || !OfflineCtor) throw new Error('Your browser does not support offline audio resampling.');
  const context = new AudioContextCtor();
  let original;
  try { original = await context.decodeAudioData(await file.arrayBuffer()); }
  finally { await context.close(); }
  const seconds = Math.min(maxSeconds, original.duration);
  if (!Number.isFinite(seconds) || seconds < 1) throw new Error('The recording must contain at least one second of decodable audio.');
  const offline = new OfflineCtor(1, Math.ceil(seconds * 22050), 22050);
  const src = offline.createBufferSource();
  src.buffer = original;
  src.connect(offline.destination);
  src.start(0);
  src.stop(seconds);
  const resampled = await offline.startRendering();
  return {samples: resampled.getChannelData(0).slice(), seconds};
}

export async function runNeuralMicrotones(file, onProgress=()=>{}, maxSeconds=45) {
  if (!(file instanceof File)) throw new TypeError('Select an audio File first.');
  if (file.size > 100 * 1024 * 1024) throw new Error('Use an audio file smaller than 100 MB.');
  const {samples,seconds} = await decodeAndResample(file, maxSeconds);
  onProgress('Loading Spotify Basic Pitch neural model…');
  if (!cachedModel) cachedModel = new BasicPitch(MODEL_URL);
  const model = cachedModel;
  // Explicitly await the graph, so failures are reported before inference starts.
  await model.model;
  const frames=[], onsets=[], contours=[];
  onProgress('Transcribing melody…');
  await model.evaluateModel(samples, (f,o,c)=>{
    frames.push(...f);
    onsets.push(...o);
    contours.push(...c);
  }, ratio=>{
    const value = Math.round(Math.max(0, Math.min(1, Number(ratio)||0)) * 100);
    onProgress(`Transcribing melody… ${value}%`);
  });
  if(!frames.length || !onsets.length || !contours.length) throw new Error('Basic Pitch returned no transcription frames.');
  // Spotify's original note onset and pitch-bend decoders, without replacing
  // the 3-bin/semitone contours with 12-TET pitch classes.
  const notes = outputToNotesPoly(frames, onsets, .45, .30, 8);
  const withBends = addPitchBendsToNoteEvents(contours, notes);
  const timeNotes = noteFramesToTime(withBends);
  const analysis=analyzeTranscription(timeNotes, contours);
  return {...analysis, seconds, rawNoteCount:timeNotes.length, engine:'@spotify/basic-pitch@1.0.1',
    isCalibrated:false, labelModel:'heuristic-12-mode-reference-v1'};
}

// Browser bundle is loaded on demand as an ES module. Make the entry API visible
// to the companion classic script without loading TensorFlow.js on page load.
window.PersianBasicPitchExperiment = Object.freeze({runNeuralMicrotones});