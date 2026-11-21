"""Numerical front end recovered from the original Windows NumPy YIN and V4 contour sources."""

import subprocess

import numpy as np


def _pitch_track_numpy(y, sr: int, hop: int = 256, frame: int = 2048):
    """Numba-free YIN: FFT autocorrelation + cumulative mean normalized difference.

    Returns (f0, rms); uses only NumPy. This is an experimental pitch baseline,
    not a validated substitute for the application's melody tracking.
    """
    import numpy as np

    if y.size < frame:
        return np.empty(0, dtype=float), np.empty(0, dtype=float)
    n_frames = 1 + (len(y) - frame) // hop
    f0 = np.full(n_frames, np.nan, dtype=float)
    rms = np.zeros(n_frames, dtype=float)
    min_tau = max(2, int(sr / 1100))
    max_tau = min(frame // 2, int(sr / 70))
    taus = np.arange(1, max_tau + 1)
    fft_size = 1 << (2 * frame - 2).bit_length()
    indices = np.arange(1, max_tau + 1)

    for i in range(n_frames):
        x = np.asarray(y[i * hop:i * hop + frame], dtype=np.float64)
        rms[i] = float(np.sqrt(np.mean(x * x)))
        if rms[i] < 0.0015:
            continue
        x = x - np.mean(x)
        spectrum = np.fft.rfft(x, n=fft_size)
        autocorrelation = np.fft.irfft(spectrum * np.conj(spectrum), n=fft_size)[:max_tau + 1]
        square_sum = np.concatenate(([0.0], np.cumsum(x * x)))
        diff = square_sum[frame - taus] + square_sum[frame] - square_sum[taus] - 2 * autocorrelation[taus]
        diff = np.maximum(diff, 0.0)
        cmnd = np.ones(max_tau + 1, dtype=float)
        cmnd[1:] = diff * indices / np.maximum(np.cumsum(diff), 1e-12)
        candidates = np.flatnonzero(cmnd[min_tau:max_tau + 1] < 0.15)
        if candidates.size:
            tau = int(candidates[0] + min_tau)
            while tau < max_tau and cmnd[tau + 1] < cmnd[tau]:
                tau += 1
        else:
            tau = int(np.argmin(cmnd[min_tau:max_tau + 1]) + min_tau)
        if cmnd[tau] > 0.32:
            continue
        fine_tau = float(tau)
        if 1 < tau < max_tau:
            before, current, after = cmnd[tau - 1:tau + 2]
            divisor = before - 2 * current + after
            if abs(divisor) > 1e-10:
                fine_tau += float(np.clip(0.5 * (before - after) / divisor, -0.5, 0.5))
        f0[i] = sr / fine_tau
    return f0, rms


def pitch_track(path, pcm_format):
    # V4's original 147 features use 16-bit PCM. Its extra 78 use float PCM.
    command = ["ffmpeg", "-nostdin", "-v", "error", "-protocol_whitelist", "file,pipe",
               "-i", str(path), "-t", "60", "-vn", "-ac", "1", "-ar", "16000",
               "-f", pcm_format, "pipe:1"]
    result = subprocess.run(command, capture_output=True, timeout=180)
    if result.returncode:
        raise ValueError("FFmpeg could not decode this audio.")
    if pcm_format == "s16le":
        samples = np.frombuffer(result.stdout, dtype="<i2").astype(np.float32) / 32768.0
    else:
        samples = np.frombuffer(result.stdout, dtype="<f4")
    if samples.size < 32000:
        raise ValueError("Less than two seconds of decoded audio.")
    return _pitch_track_numpy(samples, 16000)


def original_features(f0, rms):
    sr, hop = 16000, 256
    length = min(f0.size, rms.size)
    f0, rms = f0[:length], rms[:length]
    valid = np.isfinite(f0) & (f0 > 70) & (f0 < 1100)
    active = rms > max(float(np.quantile(rms, .70)) * .2, 0.002)
    valid &= active
    if np.sum(valid) < 40:
        raise ValueError("Too few reliable melodic pitch frames")
    # 50-cent bins are a measurement grid, NOT an assumption of equal-tempered tuning.
    cents = 1200 * np.log2(f0[valid] / 440.0)
    abs_pc = np.mod(cents, 1200.0)
    histogram, _ = np.histogram(abs_pc, bins=np.linspace(0, 1200, 25))
    hist = histogram / max(1, histogram.sum())
    anchor = int(np.argmax(hist))
    rotated = np.roll(hist, -anchor)
    pitch_valid = np.where(valid, np.mod(1200 * np.log2(np.maximum(f0, 1e-6) / 440), 1200), np.nan)
    ending = pitch_valid[int(.82 * len(pitch_valid)):]
    ending = ending[np.isfinite(ending)]
    ends, _ = np.histogram(ending, bins=np.linspace(0, 1200, 25))
    ends = np.roll(ends / max(1, ends.sum()), -anchor)
    opening = pitch_valid[:max(1, int(.18 * len(pitch_valid)))]
    opening = opening[np.isfinite(opening)]
    starts, _ = np.histogram(opening, bins=np.linspace(0, 1200, 25))
    starts = np.roll(starts / max(1, starts.sum()), -anchor)
    lag = max(1, round(.25 * sr / hop))
    pair_ok = valid[lag:] & valid[:-lag]
    intervals = 1200 * np.log2(np.maximum(f0[lag:][pair_ok], 1e-6) /
                               np.maximum(f0[:-lag][pair_ok], 1e-6))
    intervals = np.clip(intervals, -1200, 1200)
    ih, _ = np.histogram(intervals, bins=np.linspace(-1200, 1200, 49))
    ih = ih / max(1, ih.sum())
    scalars = [min(1., np.std(cents) / 1500), float(valid.mean()),
               float(np.mean(np.abs(intervals) < 50)) if intervals.size else 0]
    return np.concatenate([hist, rotated, starts, ends, ih, scalars])


def histogram_pc(cents, bins, anchor=None):
    """Normalized circular pitch-class histogram, optional alignment to dominant bin."""
    valid = np.asarray(cents, dtype=float)
    valid = valid[np.isfinite(valid)]
    result = np.histogram(np.mod(valid, 1200), bins=np.linspace(0, 1200, bins+1))[0].astype(float)
    if result.sum() > 0: result /= result.sum()
    if anchor is not None: result = np.roll(result, -int(anchor))
    return result


def contour_features(f0, rms):
    """New representations from continuous, full-resolution pitch tracks.

    'Anchor' is the most populated pitch CLASS, not a musicologically established
    tonic or Shahed. The 25- and 12.5-cent grids are measurement resolutions.
    """
    f0 = np.asarray(f0, dtype=float)
    rms = np.asarray(rms, dtype=float)
    if f0.ndim != 1 or rms.ndim != 1 or len(f0) != len(rms):
        raise ValueError('Invalid pitch-track shapes')
    if len(f0) < 50: raise ValueError('Pitch track is too short')
    active = rms > max(0.002, float(np.quantile(rms, .7)) * .20)
    valid = np.isfinite(f0) & (f0 > 70) & (f0 < 1100) & active
    if int(valid.sum()) < 40: raise ValueError('Fewer than 40 reliable pitched frames')
    cents = np.full(len(f0), np.nan)
    cents[valid] = 1200 * np.log2(f0[valid] / 440.)
    pc = np.mod(cents[valid], 1200)
    abs48 = histogram_pc(pc, 48)
    rel48 = np.roll(abs48, -int(np.argmax(abs48)))
    abs96 = histogram_pc(pc, 96)
    rel96 = np.roll(abs96, -int(np.argmax(abs96)))

    # Local contour movement between 0.16-second-separated *simultaneously*
    # voiced frames, avoiding pitch links across a silence. Keep signed cents
    # instead of the old 0.25-second 50-cent histogram alone.
    lag = 10  # 10*256/16000 = 0.16 seconds
    pair_ok = valid[lag:] & valid[:-lag]
    deltas = cents[lag:][pair_ok] - cents[:-lag][pair_ok]
    # Skip suspected octave-tracker jumps; record their prevalence separately.
    jump_fraction = float(np.mean(np.abs(deltas) > 900)) if deltas.size else 0.
    clean_deltas = deltas[np.abs(deltas) <= 900]
    move24 = np.histogram(np.clip(clean_deltas, -599.999, 599.999),
                          bins=np.linspace(-600,600,25))[0].astype(float)
    if move24.sum() > 0: move24 /= move24.sum()
    if clean_deltas.size:
        direction = [float(np.mean(clean_deltas > 75)),
                     float(np.mean(clean_deltas < -75)),
                     float(np.mean(np.abs(clean_deltas) <= 75))]
    else: direction=[0.,0.,0.]
    # Basic contour stability and coverage; not musician-annotated phrases.
    valid_cents = cents[valid]
    extras = np.asarray(direction + [float(valid.mean()),
                        min(1.,float(np.std(valid_cents))/1200.),jump_fraction], dtype=float)
    # Crude beginning/end regions by timeline, not genuine phrase segmentation.
    first = cents[:max(1,int(.18*len(cents)))]
    last = cents[int(.82*len(cents)):]
    a48 = int(np.argmax(abs48))
    first48 = histogram_pc(first,48,anchor=a48)
    last48 = histogram_pc(last,48,anchor=a48)
    return {'rel48':rel48,'rel96':rel96,'move24':move24,
            'extras6':extras,'first48':first48,'last48':last48,
            'valid_fraction':float(valid.mean()), 'potential_jumps_fraction':jump_fraction}


def extract(path, *, training=False):
    old = original_features(*pitch_track(path, "s16le"))
    f0, rms = pitch_track(path, "f32le")
    if training:
        # The reference freeze reads the float32 values stored by get_track().
        f0, rms = f0.astype(np.float32), rms.astype(np.float32)
    detail = contour_features(f0, rms)
    vector = np.concatenate((old, detail["rel48"], detail["move24"], detail["extras6"]))
    if vector.shape != (225,) or not np.isfinite(vector).all():
        raise ValueError("V4 could not construct a finite 225-feature vector.")
    return vector
