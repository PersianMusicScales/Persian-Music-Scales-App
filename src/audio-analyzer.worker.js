/* =========================================================
   Persian Music Scales — Audio analysis worker v4

   Runs entirely in the browser with no third-party dependency.

   Main improvements:
   1) Multi-resolution analysis: fine frames retain fast notes while
      longer frames preserve stable microtonal pitch information.
   2) Several pitch candidates are generated for every time frame.
   3) A continuity-aware dynamic-programming tracker extracts one
      predominant, "hummable" melody from polyphonic material.
   4) Short ornaments are retained but weighted less strongly than
      structural notes when the scale and tonic are estimated.
   ========================================================= */

"use strict";

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type !== "analyze") return;

  try {
    const samples = new Float32Array(message.samples);
    const result = analyze(samples, Number(message.sampleRate), message.options || {});
    self.postMessage({ type: "complete", result });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

function analyze(samples, sampleRate, options) {
  if (!samples.length || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error("The decoded audio signal is empty or invalid.");
  }

  const mode = options.mode || "balanced";
  const extractMelody = options.extractMelody !== false;
  const detail = clamp(Number(options.detail) || 65, 0, 100);
  const registerPreference = ["auto", "upper", "lower", "neutral"].includes(options.registerPreference)
    ? options.registerPreference
    : "auto";
  const minFrequency = clamp(Number(options.minFrequency) || 70, 40, 400);
  const maxFrequency = clamp(Number(options.maxFrequency) || 1400, 300, 3000);

  /* Fine analysis catches ornaments and quick note changes. The frame remains
     long enough to contain several periods of a 70 Hz pitch at 12 kHz. */
  const fineFrameSize = 1024;
  const fineHopSize = detail >= 78 ? 128 : detail >= 42 ? 192 : 256;
  const fineFrameDuration = fineHopSize / sampleRate;
  const totalFineFrames = Math.max(1, Math.floor((samples.length - fineFrameSize) / fineHopSize) + 1);
  const fineWindow = createHannWindow(fineFrameSize);

  /* Stable analysis improves the spectral pitch-class profile and tuning
     evidence without sacrificing the temporal resolution of the melody path. */
  const stableFrameSize = 2048;
  const stableHopTarget = mode === "mix" ? 384 : 512;
  const stableStride = Math.max(1, Math.round(stableHopTarget / fineHopSize));
  const stableWindow = createHannWindow(stableFrameSize);

  const rmsProbe = probeRms(samples, fineFrameSize, fineHopSize, totalFineFrames);
  const lowRms = percentile(rmsProbe, 0.16);
  const medianRms = percentile(rmsProbe, 0.5);
  const noiseFloor = Math.max(0.002, Math.min(lowRms * 1.65, medianRms * 0.3));
  const voicedThreshold = Math.max(noiseFloor, mode === "mix" ? 0.0038 : 0.0032);

  const spectralHistogram = new Float64Array(24);
  const rawDominantHistogram = new Float64Array(24);
  const frameCandidates = [];
  const rawDominantFrames = [];

  const fineReal = new Float64Array(fineFrameSize);
  const fineImag = new Float64Array(fineFrameSize);
  const fineMagnitudes = new Float64Array(fineFrameSize / 2);
  const fineRawFrame = new Float64Array(fineFrameSize);
  const previousNormalizedMagnitudes = new Float64Array(fineMagnitudes.length);

  const stableReal = new Float64Array(stableFrameSize);
  const stableImag = new Float64Array(stableFrameSize);
  const stableMagnitudes = new Float64Array(stableFrameSize / 2);

  let previousRms = voicedThreshold;
  let lastProgress = -1;

  for (let frameIndex = 0; frameIndex < totalFineFrames; frameIndex += 1) {
    const offset = frameIndex * fineHopSize;
    let mean = 0;
    let sumSquares = 0;

    for (let i = 0; i < fineFrameSize; i += 1) {
      const value = samples[offset + i] || 0;
      fineRawFrame[i] = value;
      mean += value;
      sumSquares += value * value;
    }

    mean /= fineFrameSize;
    const rms = Math.sqrt(sumSquares / fineFrameSize);
    const time = (offset + fineFrameSize / 2) / sampleRate;
    let onsetStrength = 0;
    let candidates = [];

    if (rms >= voicedThreshold * 0.55) {
      for (let i = 0; i < fineFrameSize; i += 1) {
        fineReal[i] = (fineRawFrame[i] - mean) * fineWindow[i];
        fineImag[i] = 0;
      }
      fftInPlace(fineReal, fineImag);

      let magnitudeSum = 0;
      let positiveFlux = 0;
      for (let k = 0; k < fineMagnitudes.length; k += 1) {
        const magnitude = Math.hypot(fineReal[k], fineImag[k]);
        fineMagnitudes[k] = magnitude;
        magnitudeSum += magnitude;
      }

      const magnitudeScale = 1 / Math.max(1e-12, magnitudeSum);
      for (let k = 1; k < fineMagnitudes.length; k += 1) {
        const normalized = fineMagnitudes[k] * magnitudeScale;
        positiveFlux += Math.max(0, normalized - previousNormalizedMagnitudes[k]);
        previousNormalizedMagnitudes[k] = normalized;
      }

      const rmsRise = Math.max(0, (rms - previousRms) / Math.max(previousRms, voicedThreshold));
      onsetStrength = clamp(positiveFlux * 5.2 + rmsRise * 0.24, 0, 1);

      if (rms >= voicedThreshold) {
        candidates = extractPitchCandidates(
          fineMagnitudes,
          fineRawFrame,
          sampleRate,
          fineFrameSize,
          minFrequency,
          maxFrequency,
          mode,
          4
        );

        if (candidates.length) {
          const dominant = candidates[0];
          rawDominantFrames.push(frameFromCandidate(time, dominant, rms, onsetStrength));
          rawDominantHistogram[dominant.pitchClass] +=
            fineFrameDuration * dominant.confidence * Math.sqrt(rms);
        }
      }
    }

    frameCandidates.push({ time, rms, onsetStrength, candidates });
    previousRms = rms;

    if (frameIndex % stableStride === 0 && offset + stableFrameSize <= samples.length) {
      let stableMean = 0;
      let stableSquares = 0;
      for (let i = 0; i < stableFrameSize; i += 1) {
        const value = samples[offset + i] || 0;
        stableReal[i] = value;
        stableMean += value;
        stableSquares += value * value;
      }
      stableMean /= stableFrameSize;
      const stableRms = Math.sqrt(stableSquares / stableFrameSize);

      if (stableRms >= voicedThreshold * 0.55) {
        for (let i = 0; i < stableFrameSize; i += 1) {
          stableReal[i] = (stableReal[i] - stableMean) * stableWindow[i];
          stableImag[i] = 0;
        }
        fftInPlace(stableReal, stableImag);
        for (let k = 0; k < stableMagnitudes.length; k += 1) {
          stableMagnitudes[k] = Math.hypot(stableReal[k], stableImag[k]);
        }
        addSpectralChroma(
          spectralHistogram,
          stableMagnitudes,
          sampleRate,
          stableFrameSize,
          stableRms,
          mode
        );
      }
    }

    const progress = Math.round(((frameIndex + 1) / totalFineFrames) * 82);
    if (progress !== lastProgress && (progress % 2 === 0 || progress >= 82)) {
      lastProgress = progress;
      self.postMessage({ type: "progress", progress });
    }
  }

  self.postMessage({ type: "progress", progress: 86 });

  const rawEvents = buildNoteEvents(
    stabilizePitchPath(rawDominantFrames, fineFrameDuration, detail, false),
    fineFrameDuration,
    detail,
    false
  );

  let melodyFrames;
  let selectedRegisterPreference = registerPreference;
  let registerSelectionScores = null;
  if (extractMelody) {
    melodyFrames = trackPredominantMelody(
      frameCandidates,
      fineFrameDuration,
      minFrequency,
      maxFrequency,
      mode,
      registerPreference
    );
    selectedRegisterPreference = melodyFrames.selectedPreference || registerPreference;
    registerSelectionScores = melodyFrames.selectionScores || null;
  } else {
    melodyFrames = rawDominantFrames;
  }

  self.postMessage({ type: "progress", progress: 92 });

  melodyFrames = stabilizePitchPath(melodyFrames, fineFrameDuration, detail, true);
  const events = buildNoteEvents(melodyFrames, fineFrameDuration, detail, true);
  classifyEvents(events);
  const duration = samples.length / sampleRate;
  annotatePhraseBoundaries(events, duration, detail);

  const f0Histogram = new Float64Array(24);
  const openingHistogram = new Float64Array(24);
  const endingHistogram = new Float64Array(24);
  const phraseEndHistogram = new Float64Array(24);
  const sustainedHistogram = new Float64Array(24);
  const transitionMatrix = Array.from({ length: 24 }, () => new Float64Array(24));

  for (const noteEvent of events) {
    /* Ornaments remain visible and audible but exert less influence on modal
       matching than structural and sustained notes. */
    const roleWeight = noteEvent.role === "ornament" ? 0.34 : 1;
    const durationWeight = Math.pow(Math.max(0.025, noteEvent.duration), 0.82);
    const weight = durationWeight * noteEvent.confidence * Math.sqrt(noteEvent.amplitude) * roleWeight;
    f0Histogram[noteEvent.pitchClass] += weight;
    sustainedHistogram[noteEvent.pitchClass] += weight * Math.pow(Math.max(0.035, noteEvent.duration), 0.55);
    if (noteEvent.phraseEnding) phraseEndHistogram[noteEvent.pitchClass] += weight * (1 + Math.min(1, noteEvent.followingGap || 0));
    if (noteEvent.startTime < duration * 0.15) openingHistogram[noteEvent.pitchClass] += weight;
    if (noteEvent.endTime >= duration * 0.82) endingHistogram[noteEvent.pitchClass] += weight;
  }

  for (let index = 0; index + 1 < events.length; index += 1) {
    const current = events[index];
    const next = events[index + 1];
    const gap = Math.max(0, next.startTime - current.endTime);
    if (gap > 1.15) continue;
    const roleWeight = current.role === "ornament" || next.role === "ornament" ? 0.38 : 1;
    const transitionWeight = Math.sqrt(Math.max(0.02, current.duration) * Math.max(0.02, next.duration)) *
      Math.sqrt(Math.max(0.1, current.confidence) * Math.max(0.1, next.confidence)) * roleWeight;
    transitionMatrix[current.pitchClass][next.pitchClass] += transitionWeight;
  }

  /* Fall back to the raw dominant profile when melody tracking found too little. */
  const structuralCount = events.filter((event) => event.role === "structural").length;
  if (sumArray(f0Histogram) <= 1e-12) {
    for (let i = 0; i < 24; i += 1) f0Histogram[i] = rawDominantHistogram[i];
  }

  normalizeArray(f0Histogram);
  normalizeArray(rawDominantHistogram);
  normalizeArray(spectralHistogram);
  normalizeArray(openingHistogram);
  normalizeArray(endingHistogram);
  normalizeArray(phraseEndHistogram);
  normalizeArray(sustainedHistogram);
  const transitionTotal = transitionMatrix.reduce((sum, row) => sum + sumArray(row), 0);
  if (transitionTotal > 0) {
    transitionMatrix.forEach((row) => {
      for (let i = 0; i < row.length; i += 1) row[i] /= transitionTotal;
    });
  }

  const meanConfidence = events.length
    ? events.reduce((sum, event) => sum + event.confidence, 0) / events.length
    : 0;
  const voicedDuration = events.reduce((sum, event) => sum + event.duration, 0);
  const melodyQuality = clamp(
    meanConfidence * 0.62 + clamp(voicedDuration / Math.max(1, duration * 0.45), 0, 1) * 0.38,
    0,
    1
  );

  self.postMessage({ type: "progress", progress: 100 });

  return {
    version: 3,
    sampleRate,
    duration,
    frameDuration: fineFrameDuration,
    noiseFloor,
    extractMelody,
    detail,
    registerPreference,
    selectedRegisterPreference,
    registerSelectionScores,
    voicedFrameCount: melodyFrames.length,
    f0Histogram: Array.from(f0Histogram),
    rawDominantHistogram: Array.from(rawDominantHistogram),
    spectralHistogram: Array.from(spectralHistogram),
    openingHistogram: Array.from(openingHistogram),
    endingHistogram: Array.from(endingHistogram),
    phraseEndHistogram: Array.from(phraseEndHistogram),
    sustainedHistogram: Array.from(sustainedHistogram),
    transitionMatrix: transitionMatrix.map((row) => Array.from(row)),
    phraseCount: events.filter((noteEvent) => noteEvent.phraseEnding).length,
    events,
    melodyEvents: events,
    rawEvents,
    structuralCount,
    ornamentCount: Math.max(0, events.length - structuralCount),
    melodyQuality,
  };
}

function extractPitchCandidates(
  magnitudes,
  rawFrame,
  sampleRate,
  frameSize,
  minFrequency,
  maxFrequency,
  mode,
  maximumCandidates
) {
  const nyquistBin = magnitudes.length - 1;
  const minBin = Math.max(2, Math.ceil((minFrequency * frameSize) / sampleRate));
  const maxBin = Math.min(nyquistBin - 2, Math.floor((maxFrequency * frameSize) / sampleRate));
  if (maxBin <= minBin) return [];

  let meanMagnitude = 0;
  let count = 0;
  for (let k = minBin; k <= Math.min(nyquistBin, maxBin * 5); k += 1) {
    meanMagnitude += magnitudes[k];
    count += 1;
  }
  meanMagnitude /= Math.max(1, count);

  const scoredBins = [];
  for (let k = minBin; k <= maxBin; k += 1) {
    const fundamental = Math.log1p(magnitudes[k] / (meanMagnitude + 1e-12));
    let score = fundamental * 1.02;
    let harmonicWeight = 0.72;

    for (let harmonic = 2; harmonic <= 6; harmonic += 1) {
      const harmonicBin = k * harmonic;
      if (harmonicBin >= magnitudes.length - 1) break;
      const neighborhood = Math.max(
        magnitudes[harmonicBin - 1] || 0,
        magnitudes[harmonicBin] || 0,
        magnitudes[harmonicBin + 1] || 0
      );
      score += harmonicWeight * Math.log1p(neighborhood / (meanMagnitude + 1e-12));
      harmonicWeight *= 0.68;
    }

    const localPeak = magnitudes[k] >= magnitudes[k - 1] && magnitudes[k] >= magnitudes[k + 1];
    if (localPeak) score *= 1.055;
    else score *= 0.92;

    /* Discourage very weak subharmonic guesses while still allowing a missing
       fundamental when several harmonics strongly support it. */
    const directRatio = magnitudes[k] / (meanMagnitude + 1e-12);
    if (directRatio < 0.45) score *= 0.9;

    scoredBins.push({ bin: k, score, localPeak });
  }

  scoredBins.sort((a, b) => b.score - a.score);
  const bestScore = scoredBins[0]?.score || 1;
  const preliminary = scoredBins.slice(0, Math.min(28, scoredBins.length));
  const selected = [];

  for (const item of preliminary) {
    if (selected.length >= maximumCandidates) break;
    const refinedBin = parabolicPeak(magnitudes, item.bin);
    let frequency = (refinedBin * sampleRate) / frameSize;
    if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) continue;

    const predictedLag = sampleRate / Math.max(frequency, 1);
    const lagRadius = 5;
    let bestLag = Math.round(predictedLag);
    let bestCorrelation = -1;

    for (
      let lag = Math.max(2, Math.round(predictedLag) - lagRadius);
      lag <= Math.min(rawFrame.length / 2, Math.round(predictedLag) + lagRadius);
      lag += 1
    ) {
      const correlation = normalizedCorrelation(rawFrame, lag);
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (bestCorrelation > 0.22 && bestLag > 0) {
      const left = normalizedCorrelation(rawFrame, Math.max(2, bestLag - 1));
      const center = bestCorrelation;
      const right = normalizedCorrelation(rawFrame, bestLag + 1);
      const denominator = left - 2 * center + right;
      const lagOffset = Math.abs(denominator) > 1e-8 ? 0.5 * (left - right) / denominator : 0;
      const autocorrelationFrequency = sampleRate / (bestLag + clamp(lagOffset, -0.5, 0.5));
      const ratio = autocorrelationFrequency / frequency;
      const octaveNormalizedRatio = ratio / Math.pow(2, Math.round(Math.log2(Math.max(ratio, 1e-8))));
      if (octaveNormalizedRatio > 0.9 && octaveNormalizedRatio < 1.1) {
        frequency = Math.sqrt(frequency * autocorrelationFrequency);
      }
    }

    const pitch24Float = frequencyToPitch24(frequency);
    if (selected.some((candidate) => Math.abs(candidate.pitch24Float - pitch24Float) < 0.78)) continue;

    const salience = clamp(item.score / Math.max(1e-9, bestScore), 0, 1);
    const correlationComponent = clamp((bestCorrelation - 0.18) / 0.62, 0, 1);
    const confidence = clamp(
      salience * 0.5 + correlationComponent * 0.38 + (item.localPeak ? 0.12 : 0.04),
      0,
      1
    );
    const minimumConfidence = mode === "melody" ? 0.33 : mode === "mix" ? 0.25 : 0.29;
    if (confidence < minimumConfidence) continue;

    const roundedPitch24 = Math.round(pitch24Float);
    selected.push({
      frequency,
      pitch24Float,
      pitchIndex: roundedPitch24,
      pitchClass: mod(roundedPitch24, 24),
      centsDeviation: (pitch24Float - roundedPitch24) * 50,
      confidence,
      salience,
    });
  }

  return selected.sort((a, b) => (b.confidence + b.salience) - (a.confidence + a.salience));
}

function trackPredominantMelody(
  frames,
  frameDuration,
  minFrequency,
  maxFrequency,
  mode,
  registerPreference
) {
  if (!frames.length) return [];

  if (registerPreference === "auto") {
    const neutralPath = trackPredominantMelodyWithPreference(
      frames, frameDuration, minFrequency, maxFrequency, mode, "neutral"
    );
    const upperPath = trackPredominantMelodyWithPreference(
      frames, frameDuration, minFrequency, maxFrequency, mode, "upper"
    );
    const lowerPath = trackPredominantMelodyWithPreference(
      frames, frameDuration, minFrequency, maxFrequency, mode, "lower"
    );

    const candidates = [
      { path: neutralPath, preference: "neutral", score: melodyPathScore(neutralPath, frameDuration, mode) },
      { path: upperPath, preference: "upper", score: melodyPathScore(upperPath, frameDuration, mode) },
      { path: lowerPath, preference: "lower", score: melodyPathScore(lowerPath, frameDuration, mode) },
    ].sort((a, b) => b.score - a.score);

    /* Avoid switching away from the neutral path for a negligible gain. */
    const neutral = candidates.find((candidate) => candidate.preference === "neutral");
    const selection =
      candidates[0].preference !== "neutral" && candidates[0].score < neutral.score + 0.045
        ? neutral
        : candidates[0];
    selection.path.selectedPreference = selection.preference;
    selection.path.selectionScores = Object.fromEntries(
      candidates.map((candidate) => [candidate.preference, candidate.score])
    );
    return selection.path;
  }

  const selectedPath = trackPredominantMelodyWithPreference(
    frames,
    frameDuration,
    minFrequency,
    maxFrequency,
    mode,
    registerPreference
  );
  selectedPath.selectedPreference = registerPreference;
  return selectedPath;
}

function trackPredominantMelodyWithPreference(
  frames,
  frameDuration,
  minFrequency,
  maxFrequency,
  mode,
  registerPreference
) {
  const chunkSize = 3200;
  const output = [];
  let seedCandidate = null;

  for (let start = 0; start < frames.length; start += chunkSize) {
    const chunk = frames.slice(start, Math.min(frames.length, start + chunkSize));
    const tracked = trackMelodyChunk(
      chunk,
      frameDuration,
      minFrequency,
      maxFrequency,
      mode,
      registerPreference,
      seedCandidate
    );
    output.push(...tracked);
    seedCandidate = tracked.length ? tracked[tracked.length - 1] : seedCandidate;
  }

  return output;
}

function melodyPathScore(path, frameDuration, mode) {
  if (!path.length) return -Infinity;
  const confidences = path.map((frame) => frame.confidence);
  const pitches = path.map((frame) => frame.pitchIndex).sort((a, b) => a - b);
  const lowPitch = pitches[Math.floor((pitches.length - 1) * 0.1)];
  const highPitch = pitches[Math.floor((pitches.length - 1) * 0.9)];
  const pitchRange = Math.max(0, highPitch - lowPitch);

  let changes = 0;
  let onsetAtChanges = 0;
  let smoothTransitions = 0;
  let octaveJumps = 0;
  let previous = path[0];

  for (let index = 1; index < path.length; index += 1) {
    const current = path[index];
    if (current.time - previous.time > frameDuration * 2.8) {
      previous = current;
      continue;
    }
    const jump = Math.abs(current.pitchIndex - previous.pitchIndex);
    if (jump > 0) {
      changes += 1;
      onsetAtChanges += current.onsetStrength;
      if (jump <= 8) smoothTransitions += 1;
      if (jump >= 20) octaveJumps += 1;
    }
    previous = current;
  }

  const duration = Math.max(frameDuration, path[path.length - 1].time - path[0].time);
  const changeRate = changes / duration;
  const meanConfidence = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
  const onsetScore = changes ? onsetAtChanges / changes : 0;
  const smoothness = changes ? smoothTransitions / changes : 0.5;
  const rangeScore = clamp(pitchRange / 15, 0, 1) * clamp((42 - pitchRange) / 22, 0.25, 1);
  const activityScore = clamp(changeRate / 1.1, 0, 1) * clamp((11 - changeRate) / 5.5, 0.2, 1);
  const octavePenalty = changes ? octaveJumps / changes : 0;
  const dronePenalty =
    mode !== "melody" && duration > 2.5 && pitchRange < 4
      ? ((4 - pitchRange) / 4) * 0.45
      : 0;

  return (
    meanConfidence * 0.34 +
    rangeScore * 0.22 +
    onsetScore * 0.18 +
    activityScore * 0.14 +
    smoothness * 0.12 -
    octavePenalty * 0.24 -
    dronePenalty
  );
}

function trackMelodyChunk(
  frames,
  frameDuration,
  minFrequency,
  maxFrequency,
  mode,
  registerPreference,
  seedCandidate
) {
  const scores = [];
  const backPointers = [];
  let previousStates = seedCandidate ? [seedCandidate, null] : [null];
  let previousScores = seedCandidate ? [0.35, -0.15] : [0];

  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    const frame = frames[frameIndex];
    const states = [...frame.candidates.slice(0, 4), null];
    const frameScores = new Float64Array(states.length);
    const frameBack = new Int16Array(states.length);

    for (let stateIndex = 0; stateIndex < states.length; stateIndex += 1) {
      const candidate = states[stateIndex];
      const emission = melodyEmissionScore(
        candidate,
        frame,
        minFrequency,
        maxFrequency,
        mode,
        registerPreference
      );
      let bestScore = -Infinity;
      let bestPrevious = 0;

      for (let previousIndex = 0; previousIndex < previousStates.length; previousIndex += 1) {
        const transition = melodyTransitionScore(
          previousStates[previousIndex],
          candidate,
          frame.onsetStrength,
          frameDuration
        );
        const score = previousScores[previousIndex] + transition + emission;
        if (score > bestScore) {
          bestScore = score;
          bestPrevious = previousIndex;
        }
      }

      frameScores[stateIndex] = bestScore;
      frameBack[stateIndex] = bestPrevious;
    }

    scores.push(frameScores);
    backPointers.push(frameBack);
    previousStates = states;
    previousScores = frameScores;
  }

  if (!scores.length) return [];
  let stateIndex = indexOfMaximum(scores[scores.length - 1]);
  const selectedStateIndices = new Int16Array(frames.length);

  for (let frameIndex = frames.length - 1; frameIndex >= 0; frameIndex -= 1) {
    selectedStateIndices[frameIndex] = stateIndex;
    stateIndex = backPointers[frameIndex][stateIndex];
  }

  const output = [];
  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    const frame = frames[frameIndex];
    const candidate = [...frame.candidates.slice(0, 4), null][selectedStateIndices[frameIndex]];
    if (!candidate) continue;
    output.push(frameFromCandidate(frame.time, candidate, frame.rms, frame.onsetStrength));
  }
  return output;
}

function melodyEmissionScore(candidate, frame, minFrequency, maxFrequency, mode, registerPreference) {
  if (!candidate) return frame.candidates.length ? -0.72 : 0.18;

  const logMin = Math.log2(minFrequency);
  const logMax = Math.log2(maxFrequency);
  const registerPosition = clamp(
    (Math.log2(candidate.frequency) - logMin) / Math.max(1e-9, logMax - logMin),
    0,
    1
  );

  let registerScore = 0;
  if (registerPreference === "upper") registerScore = registerPosition * 3.0;
  else if (registerPreference === "lower") registerScore = (1 - registerPosition) * 3.0;
  else if (registerPreference === "auto") {
    registerScore = (mode === "mix" ? 0.55 : mode === "balanced" ? 0.34 : 0.12) * registerPosition;
  }

  const onsetSupport = frame.onsetStrength * candidate.confidence * 0.18;
  const amplitudeSupport = clamp(Math.sqrt(frame.rms) * 3.2, 0, 0.24);
  return candidate.confidence * 1.7 + candidate.salience * 0.72 + registerScore + onsetSupport + amplitudeSupport;
}

function melodyTransitionScore(previous, current, onsetStrength) {
  if (!previous && !current) return 0.1;
  if (!previous && current) return -0.13 + onsetStrength * 0.18;
  if (previous && !current) return -0.2;

  const distance = Math.abs(current.pitch24Float - previous.pitch24Float);
  if (distance < 0.75) return 0.38;

  let penalty;
  if (distance <= 2) penalty = 0.08 * distance;
  else if (distance <= 6) penalty = 0.18 + 0.09 * (distance - 2);
  else if (distance <= 12) penalty = 0.55 + 0.14 * (distance - 6);
  else penalty = 1.48 + 0.2 * (distance - 12);

  /* A clear onset makes a genuine melodic leap more plausible. */
  penalty *= 1 - onsetStrength * 0.48;
  if (Math.abs(distance - 24) < 1.4) penalty += 0.42;
  return -penalty;
}

function stabilizePitchPath(frames, frameDuration, detail, preserveOnsets) {
  if (!frames.length) return [];
  const output = frames.map((frame) => ({ ...frame }));
  const maximumGap = frameDuration * 2.6;

  /* Fill a one-frame gap only when both sides strongly agree. */
  for (let i = 1; i < output.length - 1; i += 1) {
    const previous = output[i - 1];
    const current = output[i];
    const next = output[i + 1];
    const contiguous =
      current.time - previous.time <= maximumGap &&
      next.time - current.time <= maximumGap;
    if (!contiguous) continue;

    if (
      previous.pitchIndex === next.pitchIndex &&
      current.pitchIndex !== previous.pitchIndex &&
      (!preserveOnsets || current.onsetStrength < 0.48 || current.confidence < 0.55)
    ) {
      output[i].pitchIndex = previous.pitchIndex;
      output[i].pitchClass = previous.pitchClass;
      output[i].frequency = Math.sqrt(previous.frequency * next.frequency);
      output[i].centsDeviation = (previous.centsDeviation + next.centsDeviation) / 2;
    }
  }

  /* Light hysteresis prevents vibrato around a quarter-tone boundary from
     becoming a stream of artificial notes. Detailed mode applies less. */
  const hysteresis = 0.62 - detail * 0.0024;
  for (let i = 1; i < output.length; i += 1) {
    const previous = output[i - 1];
    const current = output[i];
    if (current.time - previous.time > maximumGap) continue;
    const distance = Math.abs(current.pitchIndex - previous.pitchIndex);
    if (
      distance === 1 &&
      current.onsetStrength < hysteresis &&
      current.confidence < previous.confidence + 0.08
    ) {
      current.pitchIndex = previous.pitchIndex;
      current.pitchClass = mod(previous.pitchIndex, 24);
    }
  }

  return output;
}

function buildNoteEvents(frames, frameDuration, detail, preserveShortNotes) {
  if (!frames.length) return [];
  const events = [];
  let current = null;
  const maximumGap = frameDuration * 2.55;

  for (const frame of frames) {
    if (
      current &&
      current.pitchIndex === frame.pitchIndex &&
      frame.time - current.lastFrameTime <= maximumGap
    ) {
      accumulateFrame(current, frame, frameDuration);
    } else {
      if (current) finalizeEvent(current, events, frameDuration);
      current = beginEvent(frame, frameDuration);
    }
  }
  if (current) finalizeEvent(current, events, frameDuration);

  const minimumDuration = 0.078 - detail * 0.00043; // 78 ms → 35 ms
  const filtered = events.filter((noteEvent) => {
    if (noteEvent.duration >= minimumDuration && noteEvent.frameCount >= 2) return true;
    return preserveShortNotes &&
      noteEvent.duration >= 0.026 &&
      noteEvent.onsetStrength >= 0.46 &&
      noteEvent.confidence >= 0.5;
  });

  /* Bridge tiny same-note interruptions, but never merge across a clear onset. */
  const merged = [];
  for (const noteEvent of filtered) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.pitchIndex === noteEvent.pitchIndex &&
      noteEvent.startTime - previous.endTime < frameDuration * 1.8 &&
      noteEvent.onsetStrength < 0.5
    ) {
      mergeEvents(previous, noteEvent);
    } else {
      merged.push(noteEvent);
    }
  }

  return merged;
}

function classifyEvents(events) {
  for (let index = 0; index < events.length; index += 1) {
    const noteEvent = events[index];
    const previous = events[index - 1];
    const next = events[index + 1];
    const returnOrnament =
      previous &&
      next &&
      previous.pitchIndex === next.pitchIndex &&
      noteEvent.pitchIndex !== previous.pitchIndex &&
      noteEvent.duration < 0.19;
    const veryShort = noteEvent.duration < 0.095;
    const fastPassing = noteEvent.duration < 0.145 && noteEvent.confidence < 0.8;
    noteEvent.role = returnOrnament || veryShort || fastPassing ? "ornament" : "structural";
  }
}

function annotatePhraseBoundaries(events, duration, detail) {
  if (!events.length) return;
  const gaps = [];
  for (let index = 0; index + 1 < events.length; index += 1) {
    gaps.push(Math.max(0, events[index + 1].startTime - events[index].endTime));
  }
  const sorted = gaps.filter((gap) => gap > 0).sort((a, b) => a - b);
  const medianGap = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const detailFactor = clamp(Number(detail) / 100, 0, 1);
  const silenceThreshold = clamp(Math.max(0.17, medianGap * 2.8), 0.17, 0.48);
  const longNoteThreshold = 0.34 + (1 - detailFactor) * 0.12;

  events.forEach((noteEvent, index) => {
    const next = events[index + 1];
    const followingGap = next ? Math.max(0, next.startTime - noteEvent.endTime) : Math.max(0.5, duration - noteEvent.endTime);
    const finalEvent = !next || noteEvent.endTime >= duration * 0.965;
    const silenceBoundary = followingGap >= silenceThreshold;
    const releaseBoundary = noteEvent.duration >= longNoteThreshold && followingGap >= Math.max(0.075, medianGap * 1.45);
    noteEvent.followingGap = followingGap;
    noteEvent.phraseEnding = finalEvent || silenceBoundary || releaseBoundary;
    if (noteEvent.phraseEnding && noteEvent.role === "ornament" && noteEvent.duration >= 0.085) {
      noteEvent.role = "structural";
    }
  });
}

function beginEvent(frame, frameDuration) {
  const weight = Math.max(0.05, frame.confidence);
  return {
    pitchIndex: frame.pitchIndex,
    pitchClass: frame.pitchClass,
    startTime: Math.max(0, frame.time - frameDuration * 0.52),
    endTime: frame.time + frameDuration * 0.52,
    lastFrameTime: frame.time,
    weightedFrequency: frame.frequency * weight,
    weight,
    confidenceSum: frame.confidence,
    amplitudeSum: frame.amplitude,
    centsSum: frame.centsDeviation,
    onsetStrength: frame.onsetStrength,
    frameCount: 1,
  };
}

function accumulateFrame(current, frame, frameDuration) {
  const weight = Math.max(0.05, frame.confidence);
  current.weightedFrequency += frame.frequency * weight;
  current.weight += weight;
  current.confidenceSum += frame.confidence;
  current.amplitudeSum += frame.amplitude;
  current.centsSum += frame.centsDeviation;
  current.onsetStrength = Math.max(current.onsetStrength, frame.onsetStrength);
  current.frameCount += 1;
  current.lastFrameTime = frame.time;
  current.endTime = frame.time + frameDuration * 0.52;
}

function finalizeEvent(current, events, frameDuration) {
  const duration = Math.max(frameDuration, current.endTime - current.startTime);
  const frequency = current.weightedFrequency / Math.max(current.weight, 1e-9);
  const pitch24Float = frequencyToPitch24(frequency);
  const nearestPitchIndex = Math.round(pitch24Float);
  events.push({
    pitchIndex: nearestPitchIndex,
    pitchClass: mod(nearestPitchIndex, 24),
    startTime: current.startTime,
    endTime: current.endTime,
    duration,
    frequency,
    confidence: current.confidenceSum / current.frameCount,
    amplitude: current.amplitudeSum / current.frameCount,
    centsDeviation: (pitch24Float - nearestPitchIndex) * 50,
    onsetStrength: current.onsetStrength,
    frameCount: current.frameCount,
  });
}

function mergeEvents(target, source) {
  const targetWeight = target.duration;
  const sourceWeight = source.duration;
  const totalWeight = targetWeight + sourceWeight;
  target.frequency = (target.frequency * targetWeight + source.frequency * sourceWeight) / totalWeight;
  target.confidence = (target.confidence * targetWeight + source.confidence * sourceWeight) / totalWeight;
  target.amplitude = Math.max(target.amplitude, source.amplitude);
  target.centsDeviation =
    (target.centsDeviation * targetWeight + source.centsDeviation * sourceWeight) / totalWeight;
  target.onsetStrength = Math.max(target.onsetStrength, source.onsetStrength);
  target.endTime = source.endTime;
  target.duration = target.endTime - target.startTime;
  target.frameCount += source.frameCount;
}

function frameFromCandidate(time, candidate, rms, onsetStrength) {
  return {
    time,
    pitchIndex: candidate.pitchIndex,
    pitchClass: candidate.pitchClass,
    pitch24Float: candidate.pitch24Float,
    frequency: candidate.frequency,
    centsDeviation: candidate.centsDeviation,
    confidence: candidate.confidence,
    amplitude: rms,
    onsetStrength,
  };
}

function addSpectralChroma(histogram, magnitudes, sampleRate, frameSize, rms, mode) {
  const minBin = Math.max(2, Math.ceil((55 * frameSize) / sampleRate));
  const maxBin = Math.min(magnitudes.length - 2, Math.floor((2600 * frameSize) / sampleRate));
  let average = 0;
  let count = 0;

  for (let k = minBin; k <= maxBin; k += 1) {
    average += magnitudes[k];
    count += 1;
  }
  average /= Math.max(1, count);

  const thresholdMultiplier = mode === "mix" ? 1.62 : 2.05;
  const threshold = average * thresholdMultiplier;

  for (let k = minBin; k <= maxBin; k += 1) {
    const magnitude = magnitudes[k];
    if (magnitude < threshold) continue;
    if (magnitude < magnitudes[k - 1] || magnitude < magnitudes[k + 1]) continue;

    const refinedBin = parabolicPeak(magnitudes, k);
    const frequency = (refinedBin * sampleRate) / frameSize;
    const pitchClass = mod(Math.round(frequencyToPitch24(frequency)), 24);
    const frequencyPenalty = 1 / (1 + 0.16 * Math.max(0, Math.log2(frequency / 110)));
    const weight = Math.sqrt(Math.max(0, magnitude - threshold)) * frequencyPenalty * Math.sqrt(rms);
    histogram[pitchClass] += weight;
  }
}

function probeRms(samples, frameSize, hopSize, totalFrames) {
  const probe = [];
  const stride = Math.max(1, Math.floor(totalFrames / 700));
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += stride) {
    const offset = frameIndex * hopSize;
    let sumSquares = 0;
    for (let i = 0; i < frameSize; i += 2) {
      const value = samples[offset + i] || 0;
      sumSquares += value * value;
    }
    probe.push(Math.sqrt(sumSquares / (frameSize / 2)));
  }
  return probe.length ? probe : [0.003];
}

function normalizedCorrelation(frame, lag) {
  let numerator = 0;
  let energyA = 0;
  let energyB = 0;
  const limit = frame.length - lag;
  for (let i = 0; i < limit; i += 2) {
    const a = frame[i];
    const b = frame[i + lag];
    numerator += a * b;
    energyA += a * a;
    energyB += b * b;
  }
  return numerator / Math.sqrt(Math.max(1e-18, energyA * energyB));
}

function createHannWindow(size) {
  const window = new Float64Array(size);
  for (let i = 0; i < size; i += 1) {
    window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }
  return window;
}

function fftInPlace(real, imag) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const wLengthReal = Math.cos(angle);
    const wLengthImag = Math.sin(angle);
    for (let start = 0; start < n; start += length) {
      let wReal = 1;
      let wImag = 0;
      const half = length >> 1;
      for (let j = 0; j < half; j += 1) {
        const evenIndex = start + j;
        const oddIndex = evenIndex + half;
        const oddReal = real[oddIndex] * wReal - imag[oddIndex] * wImag;
        const oddImag = real[oddIndex] * wImag + imag[oddIndex] * wReal;
        const evenReal = real[evenIndex];
        const evenImag = imag[evenIndex];
        real[evenIndex] = evenReal + oddReal;
        imag[evenIndex] = evenImag + oddImag;
        real[oddIndex] = evenReal - oddReal;
        imag[oddIndex] = evenImag - oddImag;
        const nextWReal = wReal * wLengthReal - wImag * wLengthImag;
        wImag = wReal * wLengthImag + wImag * wLengthReal;
        wReal = nextWReal;
      }
    }
  }
}

function parabolicPeak(values, index) {
  if (index <= 0 || index >= values.length - 1) return index;
  const left = Math.log(values[index - 1] + 1e-12);
  const center = Math.log(values[index] + 1e-12);
  const right = Math.log(values[index + 1] + 1e-12);
  const denominator = left - 2 * center + right;
  if (Math.abs(denominator) < 1e-12) return index;
  return index + clamp(0.5 * (left - right) / denominator, -0.5, 0.5);
}

function frequencyToPitch24(frequency) {
  return (69 + 12 * Math.log2(frequency / 440)) * 2;
}

function indexOfMaximum(values) {
  let bestIndex = 0;
  let bestValue = -Infinity;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] > bestValue) {
      bestValue = values[index];
      bestIndex = index;
    }
  }
  return bestIndex;
}

function sumArray(values) {
  let sum = 0;
  for (const value of values) sum += value;
  return sum;
}

function normalizeArray(values) {
  const sum = sumArray(values);
  if (sum <= 0) return;
  for (let i = 0; i < values.length; i += 1) values[i] /= sum;
}

function percentile(values, fraction) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor((sorted.length - 1) * fraction), 0, sorted.length - 1);
  return sorted[index];
}

function mod(value, modulo) {
  return ((value % modulo) + modulo) % modulo;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}
