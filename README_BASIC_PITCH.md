# Spotify Basic Pitch + experimental Persian microtonal mode analysis

Draft PR branch, **not ready for a production merge**. This uses Spotify's original [`@spotify/basic-pitch@1.0.1`](https://github.com/spotify/basic-pitch-ts) neural transcription model. The model itself has **not** been retrained for Persian music. In particular, this does **not** guarantee accurate Dastgah/Avaz detection.

## What changed

- The existing audio analyzer remains operational and its scale-matcher is **not** replaced.
- An **opt-in** "Neural microtonal analysis" panel appears after the normal analysis. It processes only the first 45 seconds and displays 12 experimental Dastgah/Avaz rankings separately from the existing scale matches.
- The new pipeline uses the official Basic Pitch neural model, note/onset decoding and pitch bends (original 3 contour bins per semitone), plus parabolic contour refinement and note-duration-weighted 24-bin pitch profiles. The resulting cent offsets are **estimates**, not verified intonation accuracy.
- Mode hypotheses use the app's existing simplified pitch collections and provisional modal role references. Shur-related Avazha can share collections; Mahur and Rast-Panjgah remain indistinguishable on pitches alone. This is **a research heuristic, not a trained 12-class classifier**.
- All audio inference happens **on your PC in the browser**. No Python inference server, remote audio upload or GitHub connection is needed after the local build. NPM installation initially requires internet access.
- Original `main` PWA and PR #38 are unchanged; the experiment lives in its own PR.

## How to test on Windows

Install Node.js LTS and Python 3 first, and then clone **the experiment branch** into a *new* folder:

```powershell
$root = 'C:\Users\hosei\Desktop\Scale detection'
$repo = "$root\Persian-Music-Scales-BasicPitch"
git clone --single-branch --branch experiment/spotify-basic-pitch-microtones-20261119 https://github.com/PersianMusicScales/Persian-Music-Scales-App.git $repo
& "$repo\run_basic_pitch_on_pc.cmd"
```

Or, from an existing checked-out branch folder:

```powershell
npm install
npm run basic-pitch:build
python -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/**, then the existing audio analyzer. Load a recording, wait for its normal analysis, then click **Try neural microtonal detection** in the new panel (below the scale candidates). You will see estimated note counts, median deviation from the nearest equal-tempered note, and a ranked list of **all 12** modal labels. Export a CSV for closer examination.

**Important:** Do **not** use any of the 16 locked KDC test recordings. Use familiar ordinary recordings or a separate test set. The official model may struggle with dense ensembles, setar overtones, ornaments, and very quiet music.

For automated unit tests: `npm run test:basic-pitch`. They test the *adapter*, not the real neural model. A complete live browser inference test still has to be carried out on your laptop.

## Troubleshooting

- If the panel is missing: check your localhost URL and experiment branch. Reload with Ctrl+Shift+R; the existing service worker may cache previous app JS.
- If it says **bundle missing**: run `npm install`, then `npm run basic-pitch:build` from the repo root. The build copies model files into `assets/models/basic-pitch`.
- If model loading fails: check that `http://127.0.0.1:8000/assets/models/basic-pitch/model.json` loads. The relative `.bin` weight files must be beside it. Browsers with low available memory may fail on long tracks; start with shorter solo recordings.
- If predictions seem wrong: that does not mean Basic Pitch failed to transcribe correctly. The **modal recognizer is an unvalidated heuristic**. Inspect exported note events and compare with the older analyzer.
- Stop the local website with Ctrl+C.

## Attribution & licensing

Spotify Basic Pitch is licensed Apache-2.0. This project depends on the official **unmodified** Spotify browser model code and weights, installed by npm; the local build copies the upstream license to `assets/third-party/spotify-basic-pitch-LICENSE.txt`. A local `esbuild` bundle includes applicable upstream legal notices. The new Persian musical analysis code is a separate adaptation of the *outputs*, not a claim that Spotify recognizes Persian modes.

Core source: https://github.com/spotify/basic-pitch-ts

## Validation status

**Not evaluated on KDC, IRMA, or unseen performers.** The frozen 225-feature V4 classifier's 59.2% development accuracy is **not** the accuracy of this new method. No final KDC test was opened and no repository model training is performed. Keep this PR as a draft until you verify local functioning and we have independent accuracy measurements.
