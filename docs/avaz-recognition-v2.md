# Āvāz recognition V2 — standalone draft PR #36

## Scope

This branch starts from the experimental PR #35 baseline but is a **separate PR targeting main**. It includes those earlier experiments plus this V2 detector refinement. Do **not** merge #35 and #36 independently. No original recording, MIDI, or copyrighted melody template is bundled. The main branch is not modified.

**Main change:** After the first-stage Dastgāh scoring, the existing four independently transposed Āvāz hypotheses are evaluated through `integrateIndependentAvaz(candidates, decision)` inside `src/audio-analyzer.js`.

### Why V1 often failed to display Āvāz

PR #35 could independently identify Abu Ata, Bayat-e Tork, Afshari and Dashti but usually inserted the result only as a **secondary alternative** even when independently well supported. The default displayed selection followed the original Dastgāh ranking.

### V2 guarded ranking

V2 allows the correctly transposed Shur-family candidate to become first **only when all of the following hold**:

- The independent model already produced an Āvāz decision with evidence ≥ **0.74**.
- The strongest *different Āvāz* alternative is at least **0.11** below the winner's evidence (alternatives differing by only a nearby reference-pitch bin do not count as different branches).
- The legacy top candidate's score exceeds the matching Shur-family candidate by no more than **0.05**.
- A capped bonus can move that Shur-family candidate past the legacy winner; otherwise original rankings are preserved.
- Bonus ≤ **0.065**; the existing scoring of all other Dastgāh candidates stays untouched.
- When the matching Shur candidate is already first, no bonus is applied and its displayed match percentage is not inflated.

The original models were defined using Ableton theoretical tuning exports and their example tonal roles. They use shāhed, ist when specified, finalis, āghāz, variable pitches, phrase behavior and a continuous-cent pitch fit. Their exact pitches are source-reference examples and not universal to all gushehs or Radif traditions.

The new contribution is **decision fusion**, *not* machine-learning training on the MIDI/FLAC corpus. All thresholds remain provisional.

### Validation

The tests now exercise:

1. Strong Āvāz evidence can become first when the legacy Dastgāh gap is close.
2. Weak or competing evidence cannot alter first place.
3. An obviously different, strongly supported Dastgāh cannot be displaced.
4. No inflation when the Shur candidate is already first.
5. A nearby tuning position of the same Āvāz is not treated as a competing branch.
6. Missing and non-finite evidence is rejected.

These are synthetic unit tests. Real-world classification accuracy on the provided 12 KDC FLACs has **not** yet been measured. The 33 MIDI transcriptions are supplementary gusheh references; they are not direct alignment pairs of the FLAC recordings, and rights remain unverified.

### Manual evaluation procedure

1. Use exactly the same source FLAC tracks and mode settings against the live `main` site, PR #35, and PR #36 (each in a separate served copy).
2. Record the correct Āvāz label, app's first-ranked Dastgāh/Āvāz, top alternative names, shown Shur reference note, and whether the simplified extracted melody matches the audio.
3. Calculate per-Āvāz top-1, top-3, and abstention rates. Also inspect false positives on known Dastgāh recordings and on ordinary Shur.
4. Review cases where the new model changes the top choice; classify each as a gain, regression, or uncertain.
5. Only merge after genuinely positive *held-out* audio evidence. This branch remains a draft.

No UI redesign or changes to the recording worker, circle graphics, or playback are intended.
