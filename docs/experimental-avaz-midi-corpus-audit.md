# MIDI corpus audit — November 12, 2026

**Status:** private/reference analysis only; no MIDI files, melodies, phrase sequences, or trained weights committed to this repository.

The user supplied four ZIP archives with 33 named gusheh MIDI transcriptions:

| Āvāz | Files | Parsed note events | Notes with nonzero pitch bend |
|---|---:|---:|---:|
| Abu Ata | 7 | 2,843 | 520 |
| Bayat-e Tork | 16 | 3,128 | 549 |
| Afshari | 4 | 1,964 | 308 |
| Dashti | 6 | 1,873 | 247 |
| **Total** | **33** | **9,808** | **1,624** |

The MIDI files are Standard MIDI, with melodic channel 0; all observed pitch wheel values are 0 or −2048. Under the usual ±2-semitone pitch bend range, −2048 lowers a note by 50 cents. This assumption must be checked against the generating notation, because the files did not explicitly set pitch-bend sensitivity with RPN messages. A MIDI decoder that discards pitch bend will misrepresent koron notes.

All four groups contain actual named gusheh pieces, such as Darāmad, Baste Negar and others; they are **not** simply single scales. Durations range from approximately 24 to 269 seconds. The 12 previously supplied KDC FLAC files have different durations (about 10–88 seconds), and consist of 8 Darāmad performances plus 4 short pitch-set examples. The current MIDI files are **not demonstrated to be note-aligned counterparts** of the KDC files. Treat them as independent source traditions until provenance and alignment are established.

## Data rights and provenance

The public [SepiSha/radif-Midi](https://github.com/SepiSha/radif-Midi) source, with similar repertoire structure and pitch-bend encoding, says that it derives from Talā’i's Mirzā Abdollāh transcription, and marks the original collection **all rights reserved**. The exact origin and authorization for the user's four ZIPs have not independently been confirmed. The newer IRMA collection's CC BY-NC 4.0 terms do not automatically prove that redistribution or derivative reuse of these exact ZIPs is permitted. **Do not commit copyright-sensitive melodic note content or train a publicly distributed model from it until its rights are established.**

## Validation pathway

1. Confirm archive provenance, pitch-bend convention, licensing.
2. Keep the original 8 performed FLAC Darāmads separate from 4 pitch-set demonstrations in evaluation.
3. Measure original top Dastgāh, Shur-family and Āvāz ranking, together with melody extraction correctness; record failures and tuning differences.
4. Use the 33 MIDI files as **local supplementary symbolic references**, not as automatically aligned audio labels.
5. Compare against a source-/artist-separated evaluation set before changing heuristic thresholds or adding validated motifs. Avoid leakage between gushehs and artists.
6. Keep PR #35 draft/unmerged until measurable gains are demonstrated on held-out audio.

**Nothing in this audit establishes better Āvāz accuracy.** This document preserves provenance and prevents premature data integration.
