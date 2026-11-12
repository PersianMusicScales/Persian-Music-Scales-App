# Experimental modal-recognition revision — PR #35

## Scope

Experimental phrase-aware modal scoring, **not** a validated Dastgāh/Āvāz classifier.
The existing interface, recording/upload, playback, circle, Worker, and note labels remain unchanged.
All enhancements are internal to `src/audio-analyzer.js`; the published `main` branch is untouched.

## Added internal evidence

- `structuralPhrases`: segments derived from existing Worker note-event boundaries. Ornamental events are skipped for structural modeling but remain in playback and visualization.
- `phraseBehavior`: repeated phrase-ending resolution and emphasis over multiple phrases. No score is added when fewer than two usable phrases have three structural notes.
- `cadenceDirection`: checks if directed approach at a phrase ending agrees with an **existing** modal cadence template. It ignores zero-sized changes and octave-sized leaps. This does not create new learned motifs.
- `tonalRoleEvidence`: **very small, provisional** alignment of shāhed and finalis for Shur, Segah, and Homayoun with existing `src/modal-roles.js` educational reference assumptions. `ist` can be scored when verified but **no ist position is hard-coded yet**.
- Existing continuous-cent, global detuning, and phrase-final cadence logic from the first version of PR #35 is unchanged.

## Guardrails

- Role models apply only if the referenced pitch degrees actually exist in the selected seven-note scale.
- Modal roles are **hypotheses**, not universal across gusheh/traditions.
- Phrase evidence contributes at most a few percentage points to the heuristic score. These are *not* calibrated likelihoods.
- No new Āvāz candidate is added to the results. In particular, Abu Ata, Bayat-e Tork, Afshari and Dashti cannot yet be honestly classified independently. Rast-Panjgah remains manual-only.
- No hard-coded source-unverified motif signatures or static `ist` assumptions.
- No modifications to user controls, visible scale markers, or graphic.
- Results can regress. Do not merge until tested against independent reference recordings.

## Evaluation protocol

For each reference clip log the known mode, gusheh where available, tonic reference, source performer/tradition, and whether the simplified melody correctly follows the intended line.

Compare the SAME files and controls on `main` versus this branch:
1. First check pitch extraction errors separately from modal ranking errors.
2. Evaluate top-1 mode and top-3 mode accuracy and tonic accuracy.
3. Add candidate confusion tables (especially Shur family and Mahur/Rast-Panjgah).
4. Measure changes per recording, not just examples selected after success.
5. Include short and long clips, singing, setar, and accompanied recordings.
6. Keep artists/performances separated between training and held-out evaluation once learned templates are introduced.

## Next research-dependent steps

- Establish source-specific, validated pitch-reference mappings for shāhed, ist, finalis, āghāz, and motaghayyer for each modal/ gusheh context.
- Obtain annotated, source-linked recordings and scored transcriptions for genuine multi-note motifs and forud.
- Add explicit Āvāz recognition only after the app's output/UI semantics are designed to handle those independently without mislabeling a Shur pitch collection.
- Validate calibration and handle true ambiguity rather than inflating match percentages.

## Testing

`node --check src/audio-analyzer.js`
`node --test tests/modal-scoring.test.cjs`

GitHub Actions also runs the repository's browser tests. Local Chrome testing requires `http://localhost:8000`, not `file://`.
