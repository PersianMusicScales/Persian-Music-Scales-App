/* =========================================================
   Persian Music Scales — Audio analysis worker
   No third-party dependency. Runs entirely in the browser.

   Strategy:
   1) FFT-based harmonic salience for the dominant melodic pitch.
   2) Short normalized-autocorrelation refinement.
   3) A separate 24-bin spectral pitch-class profile for denser mixes.
   4) Consecutive voiced frames are consolidated into note events.
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
  const minFrequency = clamp(Number(options.minFrequency) || 70, 40, 400);
  const maxFrequency = clamp(Number(options.maxFrequency) || 1400, 300, 3000);
  const frameSize = 2048;
  const hopSize = mode === "melody" ? 768 : 1024;
  const frameDuration = hopSize / sampleRate;
  const totalFrames = Math.max(1, Math.floor((samples.length - frameSize) / hopSize) + 1);
  const window = createHannWindow(frameSize);
  const rmsProbe = probeRms(samples, frameSize, hopSize, totalFrames);
  const lowRms = percentile(rmsProbe, 0.18);
  const medianRms = percentile(rmsProbe, 0.5);
  /* A continuous solo recording may contain almost no silent frames.
     The median-based cap prevents musical signal from being mistaken for noise. */
  const noiseFloor = Math.max(0.0025, Math.min(lowRms * 1.7, medianRms * 0.32));
  const voicedThreshold = Math.max(noiseFloor, mode === "mix" ? 0.004 : 0.0035);

  const f0Histogram = new Float64Array(24);
  const spectralHistogram = new Float64Array(24);
  const openingHistogram = new Float64Array(24);
  const endingHistogram = new Float64Array(24);
  const voicedFrames = [];

  const real = new Float64Array(frameSize);
  const imag = new Float64Array(frameSize);
  const magnitudes = new Float64Array(frameSize / 2);
  const rawFrame = new Float64Array(frameSize);

  let lastProgress = -1;

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
    const offset = frameIndex * hopSize;
    let sumSquares = 0;
    let mean = 0;

    for (let i = 0; i < frameSize; i += 1) {
      const value = samples[offset + i] || 0;
      rawFrame[i] = value;
      mean += value;
      sumSquares += value * value;
    }

    mean /= frameSize;
    const rms = Math.sqrt(sumSquares / frameSize);

    if (rms >= voicedThreshold * 0.65) {
      for (let i = 0; i < frameSize; i += 1) {
        real[i] = (rawFrame[i] - mean) * window[i];
        imag[i] = 0;
      }

      fftInPlace(real, imag);

      for (let k = 0; k < magnitudes.length; k += 1) {
        magnitudes[k] = Math.hypot(real[k], imag[k]);
      }

      addSpectralChroma(
        spectralHistogram,
        magnitudes,
        sampleRate,
        frameSize,
        rms,
        mode
      );

      if (rms >= voicedThreshold) {
        const estimate = estimateDominantPitch(
          magnitudes,
          rawFrame,
          sampleRate,
          frameSize,
          minFrequency,
          maxFrequency,
          mode
        );

        if (estimate) {
          const pitch24Float = frequencyToPitch24(estimate.frequency);
          const roundedPitch24 = Math.round(pitch24Float);
          const pitchClass = mod(roundedPitch24, 24);
          const centsDeviation = (pitch24Float - roundedPitch24) * 50;
          const frameWeight = frameDuration * estimate.confidence * Math.sqrt(rms);
          const time = (offset + frameSize / 2) / sampleRate;

          f0Histogram[pitchClass] += frameWeight;
          if (frameIndex < totalFrames * 0.15) openingHistogram[pitchClass] += frameWeight;
          if (frameIndex >= totalFrames * 0.82) endingHistogram[pitchClass] += frameWeight;

          voicedFrames.push({
            time,
            pitchClass,
            frequency: estimate.frequency,
            centsDeviation,
            confidence: estimate.confidence,
            amplitude: rms,
          });
        }
      }
    }

    const progress = Math.round(((frameIndex + 1) / totalFrames) * 100);
    if (progress !== lastProgress && (progress % 2 === 0 || progress === 100)) {
      lastProgress = progress;
      self.postMessage({ type: "progress", progress });
    }
  }

  const smoothedFrames = smoothPitchClasses(voicedFrames, frameDuration);
  const events = buildNoteEvents(smoothedFrames, frameDuration);

  normalizeArray(f0Histogram);
  normalizeArray(spectralHistogram);
  normalizeArray(openingHistogram);
  normalizeArray(endingHistogram);

  return {
    sampleRate,
    duration: samples.length / sampleRate,
    frameDuration,
    noiseFloor,
    voicedFrameCount: smoothedFrames.length,
    f0Histogram: Array.from(f0Histogram),
    spectralHistogram: Array.from(spectralHistogram),
    openingHistogram: Array.from(openingHistogram),
    endingHistogram: Array.from(endingHistogram),
    events,
  };
}

function probeRms(samples, frameSize, hopSize, totalFrames) {
  const probe = [];
  const stride = Math.max(1, Math.floor(totalFrames / 600));

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

function estimateDominantPitch(
  magnitudes,
  rawFrame,
  sampleRate,
  frameSize,
  minFrequency,
  maxFrequency,
  mode
) {
  const nyquistBin = magnitudes.length - 1;
  const minBin = Math.max(2, Math.ceil((minFrequency * frameSize) / sampleRate));
  const maxBin = Math.min(
    nyquistBin - 2,
    Math.floor((maxFrequency * frameSize) / sampleRate)
  );

  let meanMagnitude = 0;
  let count = 0;
  for (let k = minBin; k <= Math.min(nyquistBin, maxBin * 4); k += 1) {
    meanMagnitude += magnitudes[k];
    count += 1;
  }
  meanMagnitude /= Math.max(1, count);

  let bestBin = -1;
  let bestScore = -Infinity;
  let secondScore = -Infinity;

  for (let k = minBin; k <= maxBin; k += 1) {
    const fundamental = Math.log1p(magnitudes[k] / (meanMagnitude + 1e-12));
    let score = fundamental * 1.05;
    let harmonicWeight = 0.66;

    for (let harmonic = 2; harmonic <= 5; harmonic += 1) {
      const harmonicBin = k * harmonic;
      if (harmonicBin >= magnitudes.length) break;
      const neighborhood = Math.max(
        magnitudes[harmonicBin - 1] || 0,
        magnitudes[harmonicBin] || 0,
        magnitudes[harmonicBin + 1] || 0
      );
      score += harmonicWeight * Math.log1p(neighborhood / (meanMagnitude + 1e-12));
      harmonicWeight *= 0.67;
    }

    /* Mildly discourage octave/subharmonic solutions with no local peak. */
    const localPeak = magnitudes[k] >= magnitudes[k - 1] && magnitudes[k] >= magnitudes[k + 1];
    if (!localPeak) score *= 0.92;

    if (score > bestScore) {
      secondScore = bestScore;
      bestScore = score;
      bestBin = k;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  if (bestBin < 1 || !Number.isFinite(bestScore)) return null;

  const refinedBin = parabolicPeak(magnitudes, bestBin);
  let frequency = (refinedBin * sampleRate) / frameSize;

  /* Refine only near the spectral candidate; this is much faster than full YIN. */
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

  if (bestCorrelation > 0.3 && bestLag > 0) {
    const left = normalizedCorrelation(rawFrame, Math.max(2, bestLag - 1));
    const center = bestCorrelation;
    const right = normalizedCorrelation(rawFrame, bestLag + 1);
    const denominator = left - 2 * center + right;
    const lagOffset = Math.abs(denominator) > 1e-8 ? 0.5 * (left - right) / denominator : 0;
    const refinedLag = bestLag + clamp(lagOffset, -0.5, 0.5);
    const autocorrelationFrequency = sampleRate / refinedLag;

    /* Octave errors do not affect pitch class; blend only when estimates are nearby. */
    const ratio = autocorrelationFrequency / frequency;
    const octaveNormalizedRatio = ratio / Math.pow(2, Math.round(Math.log2(Math.max(ratio, 1e-8))));
    if (octaveNormalizedRatio > 0.88 && octaveNormalizedRatio < 1.12) {
      frequency = Math.sqrt(frequency * autocorrelationFrequency);
    }
  }

  const scoreSeparation = Math.max(0, (bestScore - secondScore) / Math.max(1, bestScore));
  const corrComponent = clamp((bestCorrelation - 0.28) / 0.62, 0, 1);
  const separationComponent = clamp(scoreSeparation * 5, 0, 1);
  const modePenalty = mode === "mix" ? 0.08 : 0;
  const confidence = clamp(corrComponent * 0.72 + separationComponent * 0.28 - modePenalty, 0, 1);
  const minimumConfidence = mode === "melody" ? 0.42 : mode === "mix" ? 0.5 : 0.46;

  if (!Number.isFinite(frequency) || frequency < minFrequency || frequency > maxFrequency) return null;
  if (confidence < minimumConfidence) return null;

  return { frequency, confidence };
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

  const thresholdMultiplier = mode === "mix" ? 1.7 : 2.25;
  const threshold = average * thresholdMultiplier;

  for (let k = minBin; k <= maxBin; k += 1) {
    const magnitude = magnitudes[k];
    if (magnitude < threshold) continue;
    if (magnitude < magnitudes[k - 1] || magnitude < magnitudes[k + 1]) continue;

    const refinedBin = parabolicPeak(magnitudes, k);
    const frequency = (refinedBin * sampleRate) / frameSize;
    const pitchClass = mod(Math.round(frequencyToPitch24(frequency)), 24);
    const frequencyPenalty = 1 / (1 + 0.18 * Math.max(0, Math.log2(frequency / 110)));
    const weight = Math.sqrt(Math.max(0, magnitude - threshold)) * frequencyPenalty * Math.sqrt(rms);
    histogram[pitchClass] += weight;
  }
}

function smoothPitchClasses(frames, frameDuration) {
  if (frames.length < 3) return frames;
  const output = frames.map((frame) => ({ ...frame }));

  for (let i = 1; i < frames.length - 1; i += 1) {
    const previous = frames[i - 1];
    const current = frames[i];
    const next = frames[i + 1];
    const contiguous =
      current.time - previous.time <= frameDuration * 2.4 &&
      next.time - current.time <= frameDuration * 2.4;

    if (!contiguous) continue;

    const candidates = [previous.pitchClass, current.pitchClass, next.pitchClass];
    output[i].pitchClass = circularMedoid(candidates, 24);
  }

  return output;
}

function buildNoteEvents(frames, frameDuration) {
  if (!frames.length) return [];
  const events = [];
  let current = null;
  const maximumGap = frameDuration * 2.35;

  for (const frame of frames) {
    if (
      current &&
      current.pitchClass === frame.pitchClass &&
      frame.time - current.lastFrameTime <= maximumGap
    ) {
      const weight = Math.max(0.05, frame.confidence);
      current.weightedFrequency += frame.frequency * weight;
      current.weight += weight;
      current.confidenceSum += frame.confidence;
      current.amplitudeSum += frame.amplitude;
      current.centsSum += frame.centsDeviation;
      current.frameCount += 1;
      current.lastFrameTime = frame.time;
      current.endTime = frame.time + frameDuration * 0.55;
    } else {
      if (current) finalizeEvent(current, events, frameDuration);
      const weight = Math.max(0.05, frame.confidence);
      current = {
        pitchClass: frame.pitchClass,
        startTime: Math.max(0, frame.time - frameDuration * 0.45),
        endTime: frame.time + frameDuration * 0.55,
        lastFrameTime: frame.time,
        weightedFrequency: frame.frequency * weight,
        weight,
        confidenceSum: frame.confidence,
        amplitudeSum: frame.amplitude,
        centsSum: frame.centsDeviation,
        frameCount: 1,
      };
    }
  }

  if (current) finalizeEvent(current, events, frameDuration);

  /* Remove isolated low-confidence blips and bridge tiny same-note gaps. */
  const filtered = events.filter(
    (event) => event.frameCount >= 2 && event.duration >= Math.max(0.085, frameDuration * 1.1)
  );
  const merged = [];

  for (const event of filtered) {
    const previous = merged[merged.length - 1];
    if (
      previous &&
      previous.pitchClass === event.pitchClass &&
      event.startTime - previous.endTime < frameDuration * 1.6
    ) {
      const totalDuration = previous.duration + event.duration;
      previous.frequency =
        (previous.frequency * previous.duration + event.frequency * event.duration) / totalDuration;
      previous.confidence =
        (previous.confidence * previous.duration + event.confidence * event.duration) / totalDuration;
      previous.amplitude = Math.max(previous.amplitude, event.amplitude);
      previous.centsDeviation =
        (previous.centsDeviation * previous.duration + event.centsDeviation * event.duration) /
        totalDuration;
      previous.endTime = event.endTime;
      previous.duration = previous.endTime - previous.startTime;
    } else {
      merged.push(event);
    }
  }

  return merged;
}

function finalizeEvent(current, events, frameDuration) {
  const duration = Math.max(frameDuration, current.endTime - current.startTime);
  events.push({
    pitchClass: current.pitchClass,
    startTime: current.startTime,
    endTime: current.endTime,
    duration,
    frequency: current.weightedFrequency / Math.max(current.weight, 1e-9),
    confidence: current.confidenceSum / current.frameCount,
    amplitude: current.amplitudeSum / current.frameCount,
    centsDeviation: current.centsSum / current.frameCount,
    frameCount: current.frameCount,
  });
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
  /* MIDI 69 = A4 = 440 Hz; doubling gives quarter-tone units. */
  return (69 + 12 * Math.log2(frequency / 440)) * 2;
}

function circularMedoid(values, modulo) {
  let best = values[0];
  let bestCost = Infinity;

  for (const candidate of values) {
    let cost = 0;
    for (const value of values) cost += circularDistance(candidate, value, modulo);
    if (cost < bestCost) {
      best = candidate;
      bestCost = cost;
    }
  }
  return best;
}

function circularDistance(a, b, modulo) {
  const difference = Math.abs(a - b) % modulo;
  return Math.min(difference, modulo - difference);
}

function normalizeArray(values) {
  let sum = 0;
  for (const value of values) sum += value;
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
