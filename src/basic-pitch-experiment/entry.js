/* Build entry: Spotify Basic Pitch v1.0.1 is installed and bundled on the user's
 * own computer via `npm run basic-pitch:build`. The model and all user audio
 * are processed locally in the browser. This is NOT a pretrained mode detector.
 */
import {BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime} from '@spotify/basic-pitch';
import {analyzeTranscription} from './core.mjs';

const MODEL_URL = new URL('./assets/models/basic-pitch/model.json', window.location.href).href;
let cachedModel = null;

async function decodeAndResample(file, maxSeconds, requestedStartSeconds=0) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const OfflineCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContextCtor || !OfflineCtor) throw new Error('Your browser does not support offline audio resampling.');
  const context = new AudioContextCtor();
  let original;
  try { original = await context.decodeAudioData(await file.arrayBuffer()); }
  finally { await context.close(); }
  const startSeconds = Math.max(0, Math.min(Number(requestedStartSeconds) || 0, Math.max(0, original.duration - 1)));
  const seconds = Math.min(maxSeconds, original.duration - startSeconds);
  if (!Number.isFinite(seconds) || seconds < 1) throw new Error('The recording must contain at least one second of decodable audio.');
  const offline = new OfflineCtor(1, Math.ceil(seconds * 22050), 22050);
  const src = offline.createBufferSource();
  src.buffer = original;
  src.connect(offline.destination);
  src.start(0, startSeconds);
  src.stop(seconds);
  const resampled = await offline.startRendering();
  return {samples: resampled.getChannelData(0).slice(), seconds, startSeconds, totalSeconds: original.duration};
}

export async function runNeuralMicrotones(file, onProgress=()=>{}, maxSeconds=45, workerEvents=[], requestedStartSeconds=0) {
  if (!(file instanceof File)) throw new TypeError('Select an audio File first.');
  if (file.size > 100 * 1024 * 1024) throw new Error('Use an audio file smaller than 100 MB.');
  const {samples,seconds,startSeconds,totalSeconds} = await decodeAndResample(file, maxSeconds, requestedStartSeconds);
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
  // Existing worker-event times refer to the full recording; convert them to
  // the selected excerpt's local time base for the independent pitch cross-check.
  const localWorkerEvents = (Array.isArray(workerEvents) ? workerEvents : [])
    .filter(e => Number.isFinite(e.startTime) && Number.isFinite(e.endTime) &&
      e.endTime > startSeconds && e.startTime < startSeconds + seconds)
    .map(e => ({...e, startTime: Math.max(0, e.startTime - startSeconds),
      endTime: Math.min(seconds, e.endTime - startSeconds)}));
  const analysis=analyzeTranscription(timeNotes, contours, localWorkerEvents, seconds);
  return {...analysis, seconds, startSeconds, totalSeconds, rawNoteCount:timeNotes.length, engine:'@spotify/basic-pitch@1.0.1',
    isCalibrated:false, labelModel:'heuristic-12-mode-reference-v1'};
}

// Browser bundle is loaded on demand as an ES module. Make the entry API visible
// to the companion classic script without loading TensorFlow.js on page load.
window.PersianBasicPitchExperiment = Object.freeze({runNeuralMicrotones});
