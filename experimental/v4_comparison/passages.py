"""Compare V4's opening-minute estimate with estimates from disjoint passages."""

import subprocess

import numpy as np


VERSION = "v4-passages-1"
ENVELOPE_RATE = 8000
FRAMES_PER_SECOND = 10
MIN_ACTIVE_SECONDS_PER_SECTION = 12
MAX_PASSAGE_SECONDS = 40
MAX_PASSAGES = 3
MIN_VOICED_SECONDS = 2.0
SHUR_FAMILY = {"shur", "abu_ata", "bayat_tork", "afshari", "dashti"}
HOMAYOUN_FAMILY = {"homayoun", "esfahan"}


def audio_envelope(path):
    """Read PCM in fixed blocks and retain one RMS value per 100 ms."""
    command = ["ffmpeg", "-nostdin", "-v", "error", "-protocol_whitelist", "file,pipe", "-i", str(path), "-map", "0:a:0",
               "-ac", "1", "-ar", str(ENVELOPE_RATE), "-f", "s16le", "pipe:1"]
    frame = ENVELOPE_RATE // FRAMES_PER_SECOND
    blocks = []
    sample_count = 0
    with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL) as process:
        while raw := process.stdout.read(2 * frame * 256):
            samples = np.frombuffer(raw, dtype="<i2").astype(float) / 32768
            sample_count += samples.size
            whole = samples.size // frame * frame
            if whole:
                blocks.append(np.sqrt(np.mean(samples[:whole].reshape(-1, frame) ** 2, axis=1)))
            if whole < samples.size:
                blocks.append(np.array([np.sqrt(np.mean(samples[whole:] ** 2))]))
        if process.wait() or not sample_count:
            raise ValueError("FFmpeg could not decode an audio stream in this file.")
    return np.concatenate(blocks), sample_count / ENVELOPE_RATE


def at_quiet_boundary(index, active, low, high):
    """Snap to a nearby quiet frame when one exists. Bounds are inclusive."""
    lo = max(low, index - FRAMES_PER_SECOND)
    hi = min(high, index + FRAMES_PER_SECOND)
    quiet = np.flatnonzero(~active[lo:hi + 1]) + lo
    return int(quiet[np.argmin(abs(quiet - index))]) if quiet.size else index


def short_clip_break(sounding):
    """Allow a second view on a short recording only across an audible gap."""
    minimum = 4 * FRAMES_PER_SECOND
    gaps = np.diff(sounding) - 1
    k = np.flatnonzero(gaps >= 5) + 1  # At least half a second of quiet.
    k = k[(k >= minimum) & (sounding.size - k >= minimum)]
    if not k.size:
        return None
    # For comparable gaps keep both passages as balanced as possible.
    widest = k[gaps[k - 1] == np.max(gaps[k - 1])]
    split = widest[np.argmin(abs(widest - sounding.size / 2))]
    return int(sounding[split - 1] + sounding[split] + 1) // 2


def passage_times(levels, duration):
    nonzero = levels[levels > 0]
    if not nonzero.size:
        return []
    # Relative energy locates activity; V4 checks voiced pitch separately.
    active = levels >= max(0.00025, float(np.quantile(nonzero, 0.90)) * 0.025)
    sounding = np.flatnonzero(active)
    if not sounding.size:
        return []
    n = min(MAX_PASSAGES, max(1, sounding.size // (MIN_ACTIVE_SECONDS_PER_SECTION * FRAMES_PER_SECOND)))
    left = max(0, int(sounding[0]) - 3)
    right = min(len(levels), int(sounding[-1]) + 4)
    cuts = [left]
    if n == 1:
        short_break = short_clip_break(sounding)
        if short_break is not None:
            cuts.append(short_break)
    for i in range(1, n):
        k = i * sounding.size // n
        middle = int(sounding[k - 1] + sounding[k] + 1) // 2
        cuts.append(at_quiet_boundary(middle, active, cuts[-1] + 1, right - 1))
    cuts.append(right)
    n = len(cuts) - 1
    times = []
    cap = MAX_PASSAGE_SECONDS * FRAMES_PER_SECOND
    counts = np.concatenate(([0], np.cumsum(active, dtype=int)))
    for i, (lo, hi) in enumerate(zip(cuts, cuts[1:])):
        if hi - lo > cap:
            # Prefer sounding material. For equal occupancy, cover the opening,
            # middle and ending rather than always choosing the earliest clip.
            windows = counts[lo + cap:hi + 1] - counts[lo:hi - cap + 1]
            best = np.flatnonzero(windows == windows.max())
            position = i / (n - 1) if n > 1 else 0.5
            target = (hi - lo - cap) * position
            start = lo + int(best[np.argmin(abs(best - target))])
            lo, hi = start, start + cap
        times.append((lo / FRAMES_PER_SECOND, min(duration, hi / FRAMES_PER_SECOND)))
    return times


def extract_passage(source, destination, start, end):
    # Preserve rate and channel layout. The frozen extractor decodes this WAV with
    # its own mono/resampling settings, just as it does for the original upload.
    command = ["ffmpeg", "-nostdin", "-v", "error", "-protocol_whitelist", "file,pipe", "-ss", f"{start:.6f}", "-i", str(source),
               "-t", f"{end - start:.6f}", "-map", "0:a:0", "-c:a", "pcm_f32le", "-y", str(destination)]
    completed = subprocess.run(command, capture_output=True, timeout=180)
    if completed.returncode:
        raise ValueError("FFmpeg could not extract this passage.")


def ranked(labels, values):
    return [{"label": str(labels[i]), "score": float(values[i])}
            for i in np.argsort(-np.asarray(values), kind="stable")]


def leaders(ranking):
    return [r["label"] for r in ranking if ranking[0]["score"] - r["score"] <= 1e-12]


def observed(path, start, end, reference):
    result = {"start": start, "end": end, "ranking": [], "excluded": None}
    try:
        features = reference.extract(path)
    except ValueError as error:
        # Decoder diagnostics can include temporary local paths.
        result["excluded"] = "V4 could not decode this interval." if "ffmpeg" in str(error).lower() else str(error)
        return result
    scores = reference.model.predict_proba(features.reshape(1, -1))[0]
    result["ranking"] = ranked(reference.model.classes_, scores)
    # Frozen layout: original 147, relative 48, motion 24, six summaries.
    # The fourth summary is the extractor's valid-pitch frame fraction.
    histogram = features[147:195]
    voiced_seconds = float(features[222]) * (end - start)
    result["voiced_seconds_estimate"] = voiced_seconds
    # A circular five-bin band spans 125 cents, including across the octave.
    band_mass = np.convolve(np.r_[histogram, histogram[:4]], np.ones(5), mode="valid").max()
    if voiced_seconds < MIN_VOICED_SECONDS:
        result["excluded"] = "Less than two seconds of estimated voiced pitch."
    elif band_mass >= 0.90:
        result["excluded"] = "At least 90% of pitched frames occupy one narrow pitch-class band."
    return result


def combine(passages, labels):
    usable = [p for p in passages if p["ranking"] and p["excluded"] is None]
    result = {"status": "insufficient", "label": None, "ranking": [], "usable": len(usable),
              "support": 0, "family": None}
    if not usable:
        return result
    values = [{r["label"]: r["score"] for r in p["ranking"]} for p in usable]
    result["ranking"] = ranked(labels, [np.mean([v[label] for v in values]) for label in labels])
    top = leaders(result["ranking"])
    local_leaders = [leaders(p["ranking"]) for p in usable]
    result["support"] = sum(winners == top for winners in local_leaders) if len(top) == 1 else 0
    if len(usable) == 1:
        result["status"] = "single"
    elif result["support"] > len(usable) / 2:
        result.update(status="agreement", label=top[0])
    else:
        result["status"] = "mixed"
        named = {name for names in local_leaders for name in names} | set(top)
        for family, members in (("Shur", SHUR_FAMILY), ("Homayoun", HOMAYOUN_FAMILY)):
            if named <= members:
                result["family"] = family
    return result


def compare(path, scratch, reference):
    levels, duration = audio_envelope(path)
    baseline = observed(path, 0, min(60.0, duration), reference)
    passages = []
    for index, (start, end) in enumerate(passage_times(levels, duration)):
        if start == 0 and abs(end - baseline["end"]) < 1e-6:
            passage = baseline.copy()
        else:
            clip = scratch / f"passage-{index}.wav"
            try:
                extract_passage(path, clip, start, end)
                passage = observed(clip, start, end, reference)
            except (ValueError, subprocess.TimeoutExpired) as error:
                reason = "Passage extraction timed out." if isinstance(error, subprocess.TimeoutExpired) else str(error)
                passage = {"start": start, "end": end, "ranking": [], "excluded": reason}
        passages.append(passage)
    return {"method": VERSION, "reference": reference.identity, "duration": duration, "baseline": baseline,
            "passages": passages, "candidate": combine(passages, reference.model.classes_)}
