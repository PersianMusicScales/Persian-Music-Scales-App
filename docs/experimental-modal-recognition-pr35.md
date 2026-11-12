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

## Experimental Shur-family Āvāz branch recognition (November 12 update)

**Added:** independent provisional branch hypotheses for Abu Ata, Bayat-e Tork, Afshari, and Dashti, implemented solely within `src/audio-analyzer.js`. The hypotheses appear in an existing result name as `Shur · [Avaz] (experimental) · [Shur reference pitch]` only when characteristic evidence is sufficient. The underlying candidate scale remains Shur and the circle, manual scale selection, audio Worker, raw note labels, playback, visualizer, and existing controls are unchanged.

### Explicit pitch reference

All offset classes are 50 cents, relative to the pre-existing Shur reference (G in the examples):

| Relative offset | Pitch in G-reference |
|---|---|
| 0 | G |
| 3 | A-koron |
| 6 | B-flat |
| 10 | C |
| 13 | D-koron |
| 14 | D natural |
| 16 | E-flat |
| 17 | E-koron |
| 20 | F |

The Shur circle's fixed scale excludes D-koron and E-koron. Therefore the classifier reads these from the detected note-event pitch classes as **additional variable-tone evidence** but never alters the circle's pitch collection. These are not equivalent to D-flat or E-flat.

### Branch-specific evidence

- **Abu Ata**: C shāhed emphasis, A-koron temporary ist in internal phrases, G finalis. Based on Tsuge's cited G reference.
- **Bayat-e Tork**: B-flat shāhed emphasis and cadential attention to B-flat/F, with no asserted universal finalis. Based on Caton's F reference mapped into the shared G/Shur collection.
- **Afshari**: G shāhed, E-koron phrase stops, C finalis, plus the actual presence of E-koron. Based on Farhat's example; this is an exceptionally important deviation from the fixed Shur circle.
- **Dashti**: natural D and *later* D-koron in the melodic sequence (rather than the invalid D-flat substitution); G ending is corroborating but not mandatory. Based on During's two-pentachord description.

### Abstention safeguards

The classifier requires at least 2 usable structural phrases, 10 structural note events, and Shur pitch compatibility ≥0.62. A branch must have a model-specific pair of signals and heuristic evidence ≥0.69. Two supported, near-tied branch hypotheses (within 0.12) yield no branch classification. All results are **experimental hypotheses** and match percentages are **not calibrated probabilities**.

A bounded score bonus of at most 0.015 is applied to an already compatible Shur candidate; this cannot generally overturn a strong parent-scale rejection but can reorder a close result. No automatic change to the displayed circle scale occurs.

The particular branch-specific patterns came from explicit verbal tonal-function descriptions in Encyclopaedia Iranica (Tsuge, Caton, Farhat, During); the user-supplied motif sketches and unverified recording timestamps were **not** turned into recognition rules.

### Test scope and limitations

The regression tests include 4 synthetic branch cases, 24-bin pitch notation checks, and abstention and wrong-microtone controls. **Synthetic tests do not establish real-world audio accuracy.** Verify with independently classified recordings across traditions, gushehs, and performers before contemplating merge. Avoid forcing a branch decision from sparse or modulating clips. Shur remains a legitimate answer for uncertain Shur-family material.

The tonic shown next to an experimental Āvāz result is the Shur **reference pitch**, **not** a claim to be the Āvāz's finalis or shāhed.

Main branch has not been modified; this is still draft PR #35.
