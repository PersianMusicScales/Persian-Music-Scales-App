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

## Experimental recurrent-motif channel (November 12: IRMA CSV evaluation)

### Input-data audit — no IRMA content committed

The user supplied a CSV table with **12 excerpts**, all from the **Karimi vocal Radif** segment of the [IRMA dataset](https://github.com/SepiSha/irma-dataset), comprising **3 references each** for Abu Ata, Bayat-e Tork, Afshari and Dashti (2 opening excerpts and 1 terminal excerpt per system). Each CSV excerpt holds 14 note tokens and 14 durations, for 168 note tokens total.

**Important provenance limitations:**

1. The four terminal excerpts are explicitly marked `NOT independently verified as Forud`, so they are NOT used as cadential ground truth.
2. The hand-selected 14-note sequences are **not verbatim prefixes** of their longer source files in all cases. In the original IRMA `DoReMi` files, the Afshari Darāmad opening contains intermediate B-flat notes omitted by the CSV, and the Dashti Darāmad source starts with a B-flat anacrusis omitted by the CSV. Selection/filtering provenance is not specified.
3. The source describes Karimi-derived notated and alignment material, **not 12 independently labeled performance recordings**. These 12 excerpts are correlated excerpts from a single tradition/performer; they are not a sufficient training/test population.
4. Source note tokens include `Ek`, `Ak`, and `Bk` (koron signs) and octave indices. They must not be silently rounded to E-flat, A-flat or B-flat, or flattened across octaves if the future model needs register-sensitive information.
5. The IRMA repository states that its author-generated material is **CC BY-NC 4.0**, and commercial source audio is not supplied. Original sequences and MIDI data have not been copied, bundled, modified or redistributed in this public application; seek appropriate permissions before distribution of dataset-derived templates.

The *research insight* is that short note-to-note intervals are common across branches. A small exploratory count within these CSV excerpts showed many identical 2–3-note interval contours shared across different Āvāz labels. Therefore raw note-pair or fixed-scale matching alone is weak evidence of a unique Āvāz; longer and recurrent phrase boundaries deserve further investigation. These observations are **exploratory**, not empirical recognition accuracy results.

### Implementation — no external templates

The new `relativeMotifFromNotes` / `relativeMotifSimilarity` functions match *relative interval contours*. They are independent of tonic and octave transposition, require matching direction for substantive movements, and allow up to one 50-cent pitch bin of imprecision per step.

`discoverRecurrentEndingMotifs` analyzes only the current user's extracted structural phrases. It detects 4-note ending contours recurring in **distinct** phrases and resolving to the **same** pitch class. Ornamental events are already removed by the existing `extractStructuralPhrases` function. The last 120 phrases cap pairwise work.

`recurrentEndingMotifFit` adds at most **0.005** to the candidate's pre-logistic heuristic score; fewer than 3 eligible phrases or fewer than 2 corroborating phrase endings produces no contribution. The source's motifs are **not** used as templates, and these recurrent contours are **not asserted to be verified traditional Forud**.

The result is an **experimental, source-neutral rhythmic/melodic feature**, not a trained IRMA classifier. It does not introduce new UI controls, alter displayed note labels, change playback, or replace the previous phrase/tuning evidence.

### Tests and interpretation

Added synthetic unit tests for transposition and octave invariance, microtonal tolerance, contour direction reversal, malformed patterns, matching distinct phrase endings, nonmatching endpoints, insufficient evidence, and the strict 0.005 score bound.

The automated test suite passing does **not** show improved classification accuracy on annotated audio. Next step: build a legally usable, independently labeled and artist-separated audio benchmark; verify actual phrase boundaries and forud labels by ear/score; then run baseline-versus-branch comparison and potentially fit source-validated mode-specific motifs. Keep PR #35 draft and unmerged until that evaluation.

## Independent Shur-family Āvāz redesign — supersedes the earlier Shur-gated classifier

**Status:** Experimental and **not yet validated against real performance audio**. PR #35 stays draft. The old Shur-gated `classifyShurAvaz(tonicBin, features, familyCoverage)` classifier and its G-based fixed offsets are **removed**. References to those rules above describe earlier implementation history and are not active.

The independent classifier now evaluates each of Abu Ata, Bayat-e Tork, Afshari, and Dashti in all 24 possible pitch transpositions, **regardless of the ranking or coverage assigned to the legacy Shur candidate**. It reads the user's original Ableton Scala exports as the theoretical basis, normalized to **C = the first named pitch in the exported source**, which is *not* necessarily the mode's finalis.

| Model | Source C-based mode degrees (cents) | Shāhed | Ist | Finalis | Āghāz | Variable tones |
|---|---|---|---|---|---|---|
| Abu Ata | 0, 205, 340, 500, 700, 905 | G (700) | E-koron (340) | D (205) | E-koron / G | Not assigned |
| Bayat-e Tork | 0, 205, 340, 500, 700, 905, 995 | F (500) | C (0) | F (500) | C | Not assigned |
| Afshari | 0, 205, 340, 500, 700, 835, 995 | G (700) | E-koron (340) | C (0) | G | A-koron / A |
| Dashti | 0, 205, 340, 500, 700, 905, 995 | A (905) | **Not assigned** | D (205) | F (500) | A / A-koron |

**Sources:** User-uploaded Ableton `.scl` files and their annotated Sequence screenshots: https://tuning.ableton.com/persian-radif/ . The musical-function assignments are **source-example-specific**. They do not claim universality across different Radif traditions or gushehs.

**Transposition and circle:** In this scheme, the source C reference maps to an existing Shur-circle D reference (+200 cents / four 50-cent bins); an observed transposition by `r` bins therefore maps to `Shur tonic = r + 4`. This is an output-mapping convention, **not a claim that the Shur reference note equals an Āvāz finalis**. The original Shur scale angles/labels/colors, Worker, audio playback, controls, original Dastgāh scoring and ranking are not modified. Strong Āvāz evidence may be surfaced as the second result for comparison; the best original Dastgāh candidate is never displaced.

**Method:** Independent continuous-cent pitch compatibility (soft ~55-cent tolerance), duration-weighted shāhed, internal-phrase ist, finalis/phrase endings, opening-note āghāz, optional variable tones, and recurrent user-audio phrase resolutions. Each candidate must contain at least eight structural note events and ≥0.61 pitch compatibility. Multiple independent cues are required; a maximum-evidence comparison across all transpositions abstains below 0.67 or when a competitor is within 0.075. The two modes with near-identical pitch sets (Bayat-e Tork and Dashti) are differentiated mainly by tonal roles, not by pitch-set membership alone. All scores are **heuristics, not statistical confidence**.

The existing Dastgāh score values and ordering are preserved exactly. In particular, this revision removes the former +0.015 boost given to Shur upon an Āvāz hypothesis. Shur-family classification may be reported as **uncertain** when evidence is insufficient rather than forcing a label.

**Testing:** Replaced the old four Shur-gated fixtures with independent reference-model tests, explicit reference-degree mappings, octave/transposition invariance, microtonal distinction, and short-clip abstention. Isolated scoring tests passed (28 tests) on commit `d072928ad32f3e8daba1d67b4471ff29dea620e0`. Browser tests should be reviewed independently. **No labeled real-recording accuracy study has yet been completed.**

**Remaining concern:** The source's 340/835/905-cent theoretical pitches are not guaranteed to match every player's actual intonation. Distinctive motifs and forud cannot be treated as validated unless checked against labeled, gusheh-annotated performances. Do not merge into `main` without comparative recording-based validation.

### Additional end-to-end synthetic validation

The isolated `classifyShurAvaz` flow was exercised with **four independently invented synthetic examples** designed around the sourced shāhed / ist / finalis / āghāz rules. The tests for Abu Ata, Bayat-e Tork, Afshari and Dashti all pass. The 30-test suite passed at commit `776418eb6a272f08fd4711dd957f84f8934a8933`. **These synthetic examples are designed to fit the models; passing them is not evidence of real recording classification accuracy.**

Comparison with the published main branch should include both (a) recognition of the four Āvāz systems and (b) regression checks on recordings that were already correctly identified as the original Dastgāh. Do not merge without that validation.
