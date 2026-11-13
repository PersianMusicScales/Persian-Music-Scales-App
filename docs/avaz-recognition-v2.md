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

## November 13: Existing recorded-audio control audit and opt-in diagnostics

The user supplied nine further FLAC attachments. **Every one is an exact SHA-256 duplicate of a recording already supplied**, so these do not enlarge the independent evaluation set. The 18 unique labeled FLAC recordings now available to the user are: 12 Shur-family Āvāz files (8 Radif Darāmad + 4 flexible-interval demonstrations), four Homayoun / Esfahan files (2 each), and two controls (Shur and Segah Darāmad). All have provenance tags but tags alone are not independent expert verification of musical labels. No FLAC audio was uploaded into this repository.

A separate exploratory first-30-seconds pitch histogram was computed locally with a YIN-based pitch estimate. It indicated substantial pitch-class ambiguity across different performers. This is **not** the application Worker model and cannot be interpreted as measured PR #36 classification accuracy. No classifier coefficients were fitted to it.

### Opt-in local diagnostic report

Open the experimental application locally at `http://localhost:8000/?avazDebug=1`. Analyze one file. In Chrome DevTools (F12 → Console), run:

```javascript
copy(JSON.stringify(window.__persianModalDiagnostics, null, 2))
```

The report includes original unmodified Dastgāh rankings, independent Āvāz outcomes and reasons, one best hypothesis **per distinct Āvāz branch**, tonal evidence components, any score-fusion adjustment, and the displayed candidate rankings. It contains no recording filename, raw waveform, original note sequences or personally identifying information, and is **not transmitted** by this feature. Share it with the recording's known label for failure analysis. Remove the query parameter to disable diagnostic snapshots.

Previously the `alternatives.slice(0,5)` shortlist could be dominated by near-duplicate transpositions of the same branch, obscuring actual inter-branch competition and making diagnostic interpretation difficult. It now preserves the best supported (or, if none, highest) candidate for **each** of Abu Ata, Bayat-e Tork, Afshari and Dashti. The 37-test regression suite includes a branch-uniqueness safeguard.

The Homayoun/Esfahan issue remains unresolved: no validated pairwise phrase model has been built, and their collections overlap after transposition. Avoid hard-coded guessed roles and further unvalidated score changes; first compare real independent recordings and Worker-extracted notes.

**No audio-driven accuracy claims are made. PR remains draft/unmerged, and `main` is unchanged.**

## Nov 13: Debug initialization fix (PR #36)

The browser previously returned `undefined` for `window.__persianModalDiagnostics` despite having `?avazDebug=1`. The earlier implementation created the global **only inside `matchScales` after successful analysis**, so testers could not distinguish an old script from incomplete processing. Changing the port did not resolve the case in user screenshots.

A small opt-in initialization marker now creates the diagnostic object **immediately when `src/audio-analyzer.js` executes** with the debug query flag. It changes its `status` from `ready` → `analyzing` → `complete`. The report is still local to the browser and no audio is transmitted. Normal app behavior without the query flag is unchanged.

To test: download the **updated ZIP of PR #36**, extract, start the local Python server, open `http://localhost:8000/?avazDebug=1`, then run `window.__persianModalDiagnostics` in Chrome's DevTools Console *before analyzing*. It should show `{diagnosticVersion: 2, status: 'ready', ...}`. After analyzing, inspect the same variable and copy its full object. If it still returns `undefined` before analysis, the browser is not executing this updated script. The syntax and modal-scoring CI workflow passed on commit `fa8aa74333d97c9baecdb44fa9eb779a0e39c2e6`; the browser suite is separate.
