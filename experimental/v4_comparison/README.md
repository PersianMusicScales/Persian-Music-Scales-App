# V4 passage recognition

The public audio analyzer and the Windows listening tool compare the opening with passages to identify a dastgāh or āvāz. Both columns use the same fitted V4 classifier, the same 225 features and the same 12 labels. Frozen V4 uses the first 60 seconds. The candidate samples up to three disjoint passages across the recording. Accuracy for the candidate is unmeasured.

## Start on Windows

1. Download and extract the ZIP of this PR branch. Keep your original **KDC-v1.0.zip** compressed.
2. Double-click **START_V4_COMPARISON.cmd** in the extracted PR folder. On a PC where the old study folder was deleted, it uses system Python 3.10 or newer to create a private environment under **%LOCALAPPDATA%\PersianMusicScales\V4Comparison**. The first launch requires internet access for missing Python packages. Setup supplies FFmpeg in this environment if needed.
3. In the file picker, select **KDC-v1.0.zip**. You can also drag this ZIP onto the launcher. The terminal shows progress through the 49 development recordings. If interrupted, reopen the launcher and choose the same ZIP to resume. After a successful rebuild, double-clicking the launcher reuses the verified local features.
4. In the browser page that opens, choose one of your own recordings. Enter an optional case ID and its known mode before clicking **Compare recording**. Use **Play** next to a passage to hear what contributed to its result.
5. **Save comparison JSON** downloads both rankings and the passage scores and timestamps. The audio stays on your PC. Keep the terminal open while listening. Close it to stop the server.

KDC is the only archive needed for V4. IRMA belongs to the separate symbolic-melody experiments.

For a first listening session, a solo darāmad with a known label makes it easier to judge an error. A longer performance lets you hear whether different passages favor different modes. Use independent performances for listening. Keep the original 16 Masoud Shaari final-test files reserved. The upload form checks their original filenames. Renamed copies must also be kept out.

## How to read the result

| Result | Interpretation |
| --- | --- |
| One mode leads the pooled ranking and wins a strict majority of at least two eligible passages | The page names the mode and gives the actual support count. |
| The passage leaders disagree and the pooled leader lacks majority support | The ranking remains available. The page reports uncertainty, including a family-level description when all leading labels belong to the Shur or Homayoun family. |
| One eligible passage | The page gives its ranking. An untrimmed short recording can produce exactly the same scores in both columns. |
| Insufficient varied pitch | The candidate abstains. Any measurable opening-minute V4 scores are still shown. |

The numbers are the classifier's raw class scores, averaged over eligible passages for the candidate. Agreement between passages from one performance is descriptive. Different leaders may reflect a modal change, accompaniment, pitch-tracking error, or an ambiguous excerpt. The timestamps let the listener investigate.

## Fixed inference rules in this version

- Scan the audio in blocks, keeping a 100 ms mono energy envelope. The activity threshold is the larger of 0.00025 full scale and 2.5% of the 90th percentile of nonzero RMS values. Retain a short margin at the first and last active frame.
- Allocate one section per 12 seconds of activity, up to three. Distribute cuts by cumulative activity and move a cut to nearby quiet when available. A short clip can supply two passages if at least half a second of quiet separates two stretches with at least four active seconds each.
- Use at most 40 seconds from any section. For longer sections, choose the interval with the most active frames. Break occupancy ties toward the beginning, middle or end according to the section's position. These are acoustic boundaries. They have no assigned musical role.
- Run the original V4 extractor on the selected audio. Exclude an interval from the candidate average if extraction fails, if estimated voiced time is under two seconds, or if at least 90% of the relative pitch-class histogram lies within a circular five-bin band (125 cents). The latter two rules are experimental listening heuristics.
- Give each eligible, non-overlapping passage one equal weight. The opening-minute baseline is scored separately. Tied leaders do not cast a single-mode vote.

## Local reference and troubleshooting

The ZIP route uses the canonical KDC v1.0 metadata to identify each development recording by its MusicBrainz ID, performer and mode, in the original manifest order. The loader checks the roster fingerprint before opening any recording. It reads only the 49 permitted FLAC members, with one temporary audio file at a time. The 16 Masoud Shaari recordings are excluded. Both V4 feature stages use the recovered NumPy YIN implementation. The original 147 features use 16-bit PCM, and the additional 78 use floating-point PCM with the original cache precision during training.

The launcher checks every development recording's performer-held-out prediction against a fingerprint of the saved V4 results, as well as the historical accuracy and macro-F1. Only after these checks does it save the verified matrix locally and open the comparison page. A mismatch prints the local software versions and reproduction score in the terminal. The public analyzer ships the fitted forest’s split rules and class weights. The recording and feature caches stay local. [KUG Dastgāhi Corpus, Babak Nikzat and Rafael Caro Repetto](https://phaidra.kug.ac.at/o:127195)

### Existing research installation

The launcher still recognizes a Desktop **Scale detection** installation with its original Python environment. For a study folder elsewhere, drag that folder onto the launcher. A frozen **radif_release_v1** model uses its original integrity checks. If only the original development caches exist, choose **Y** at the prompt to fit the historical reference in memory for that session.

The bundled **radif_release.py** is the exact [frozen reference source from PR #38](https://github.com/PersianMusicScales/Persian-Music-Scales-App/blob/3d5ad9af21d50fab5d3aee7502e2fd2627249e83/experimental/local_12_mode_prototype/radif_release.py). The comparison uses its inference code. It has no final-test action in its interface.

For an in-memory reference, both the original 147-feature caches and 49 V4 pitch caches must exist. The loader recognizes **KDC_study/v4_contour_evidence/pitch_cache** and **v4_contour_evidence/pitch_cache**. The original development source paths also need to resolve because V4 includes file size and modification time in its cache keys. It reads the development caches, checks the historical 29/49 and 0.58902 macro-F1, and compares individual V4 predictions when the original CSV is present. This checks the baseline only. All model fitting for this option stays in memory.

If an existing frozen release reports a source-hash mismatch, use the original trusted script that produced its **frozen.json**. From the extracted PR directory in PowerShell, set these two paths to their actual locations on your PC and run:

```powershell
$study = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Scale detection'
$original = 'C:\path\to\the\original\radif_release.py'
& "$study\radif_discovery_lab\.venv\Scripts\python.exe" .\experimental\v4_comparison\compare_server.py --root $study --release-script $original --open
```

The terminal prints the local URL if the browser does not open automatically. The Windows page retains the full ranking table and JSON export.

## Public analyzer

The Audio Analyzer runs V4 for file uploads, microphone recordings and the built-in example. Open **Recognition results** for the passage verdict and expand the details for the opening and individual time intervals. Melodies that share a scale can lead to different modal suggestions. A single usable passage is labeled tentative. The circle shows the app’s estimate of the tonic for modes it can draw.

Natural Minor has a separate pitch test in the Windows page and the public analyzer. Pitches are rounded to the nearest quarter-tone, and each candidate tonic is checked for the natural-minor interval pattern. The check requires multiple observed scale degrees, including the second, minor third and minor sixth, and compares tonic emphasis against the relative major using the opening, ending and full pitch profile. Consistent pitch and tonic evidence can place Natural Minor first. Partial or conflicting evidence is reported as uncertain. KDC supplies twelve Persian mode labels and provides no evaluation of Natural Minor.

The browser uses Web Audio for decoding and resampling, computes the frozen 225 features and evaluates the exported 200 trees. Web Audio and FFmpeg can differ at resampling, channel mixing and codec boundaries. On the three development performers, the original performer-held-out V4 predictions matched 29 of 49 labels (macro-F1 0.589). This is the opening-minute development result. Passage voting and Natural Minor have no independent accuracy estimate.

To regenerate the static model from a verified local cache, run `python experimental/v4_comparison/export_browser_model.py PATH_TO_VERIFIED_CACHE data/v4-forest.json` from the project root. The exporter checks the original feature recipe and all 49 saved development predictions before writing the forest.
