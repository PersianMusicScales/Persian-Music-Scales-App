# Listen to frozen V4 and the passage candidate

This local experiment tests whether scoring several excerpts separately helps identify a dastgāh or āvāz. Both columns use the same fitted V4 classifier, the same 225 features and the same 12 labels. Frozen V4 uses the first 60 seconds. The candidate samples up to three disjoint passages across the recording. Accuracy for the candidate is unmeasured.

## Start on Windows

1. Download and extract the ZIP of this PR branch. Double-click **START_V4_COMPARISON.cmd** in the top folder.
2. The launcher looks for your existing **Scale detection** research folder on the Desktop. You can enter its location if it lives elsewhere. It uses the existing **radif_discovery_lab** virtual environment and FFmpeg on PATH.
3. If you have a frozen **radif_release_v1** model, the launcher uses its original integrity checks. If you have only the existing development caches, choose **Y** when prompted. This reconstructs the reference in memory for this session. Keep the terminal open while listening.
4. In the browser page that opens, choose a new recording. Enter an optional case ID and the known mode before clicking **Compare recording**. Use **Play** next to a passage to hear what contributed to its result.
5. **Save comparison JSON** downloads the two rankings, passage times and scores, skipped-passage reasons, method version, reference fingerprint and your optional case ID and label. The audio file stays on your PC. Close the terminal to stop the comparison server.

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

The bundled **radif_release.py** is the exact [frozen reference source from PR #38](https://github.com/PersianMusicScales/Persian-Music-Scales-App/blob/3d5ad9af21d50fab5d3aee7502e2fd2627249e83/experimental/local_12_mode_prototype/radif_release.py). The comparison uses its inference code. It has no final-test action in its interface.

For an in-memory reference, both the original 147-feature caches and 49 V4 pitch caches must exist. The loader recognizes **KDC_study/v4_contour_evidence/pitch_cache** and **v4_contour_evidence/pitch_cache**. The original development source paths also need to resolve because V4 includes file size and modification time in its cache keys. It reads the development caches, checks the historical 29/49 and 0.58902 macro-F1, and compares individual V4 predictions when the original CSV is present. This checks the baseline only. All model fitting for this option stays in memory.

If an existing frozen release reports a source-hash mismatch, use the original trusted script that produced its **frozen.json**. From the extracted PR directory in PowerShell, set these two paths to their actual locations on your PC and run:

```powershell
$study = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Scale detection'
$original = 'C:\path\to\the\original\radif_release.py'
& "$study\radif_discovery_lab\.venv\Scripts\python.exe" .\experimental\v4_comparison\compare_server.py --root $study --release-script $original --open
```

The terminal prints the local URL if the browser does not open automatically. The pilot evaluates inference on your working PC with your research dependencies. The public GitHub Pages analyzer uses its existing browser matcher.
