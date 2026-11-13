# Testing the PR #38 integration in the ORIGINAL app (Windows)

This draft PR adds a separate **experimental 12-category panel** to the existing audio analyzer. The existing scale matching and circular visualization are unchanged.

**This is not an accuracy improvement.** It exposes the frozen V4 classifier, which achieved only 29/49 on the repeatedly used development recordings. The independently reserved 16 KDC recordings have not been scored here.

## Prerequisites

- The existing research files under `C:\Users\hosei\Desktop\Scale detection`
- Python virtual environment `radif_discovery_lab\.venv` with NumPy, scikit-learn, joblib, etc.
- FFmpeg on PATH
- Run **both** local servers; closing either PowerShell window stops that server
- No production GitHub Pages deployment is modified.

## Step 1: checkout the draft PR branch

In PowerShell:

```powershell
$root = "C:\Users\hosei\Desktop\Scale detection"
$repo = "$root\Persian-Music-Scales-App-PR38"
if (-not (Test-Path "$repo\.git")) {
  git clone --branch experiment/frozen-v4-12-mode-local-prototype-20261113 --single-branch https://github.com/PersianMusicScales/Persian-Music-Scales-App.git $repo
}
Set-Location $repo
git switch experiment/frozen-v4-12-mode-local-prototype-20261113
git pull --ff-only
```

## Step 2: freeze the existing V4 model, once

```powershell
$python = "$root\radif_discovery_lab\.venv\Scripts\python.exe"
$script = "$repo\experimental\local_12_mode_prototype\radif_release.py"
& $python $script status --root $root
# Run freeze ONLY if frozen.json and model.joblib are not present:
& $python $script freeze --root $root
```

If the model has already been frozen, **skip the freeze command**; the release deliberately refuses to overwrite it.

## Step 3: start model server (PowerShell window A)

```powershell
& $python $script serve --root $root
```

Keep it running at `http://127.0.0.1:8765/`.

## Step 4: start original app (PowerShell window B)

```powershell
Set-Location $repo
& $python -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/** (not your public GitHub Pages URL). Use Ctrl+Shift+R to bypass stale cached assets if necessary.

## Step 5: test

1. Open the app's existing audio analyzer.
2. Upload a normal recording **that is not one of the reserved 16 KDC test recordings**.
3. Wait for the normal analysis to complete.
4. Scroll below the existing best scale match: open the **12 Dastgah and Avaz categories — experimental** panel.
5. Click **Run 12-category local analysis**. This sends the recording only to the model server running on this same PC.
6. Inspect all **12** ranked labels. They are *uncalibrated tree-vote shares*, **not confidence or accuracy percentages**.

Seven Dastgahs: Shur, Mahur, Homayoun, Segah, Chahargah, Nava, Rast-Panjgah.

Five Avazha: Abu Ata, Bayat-e Tork, Afshari, Dashti, Bayat-e Esfahan.

The existing pitch-collection matcher is **not** a valid independent identifier of these modes; keep its result separate.

## If things go wrong

- If the panel is missing: ensure your browser URL is `127.0.0.1:8000`, the checked-out branch is the PR branch, and use Ctrl+Shift+R. A service worker can keep older resources; clear site data for the *local development origin* if needed.
- If the model reports connection failure: ensure window A is running and `http://127.0.0.1:8765/health` returns JSON.
- If freezing fails: inspect the parity-error details. Do not delete or overwrite frozen metadata to force it through.
- If the output is musically wrong: **that is a classifier limitation, not proof the Avaz category is missing**. Do not trust vote fractions as calibrated probabilities.
- The original scale matcher may still choose Mahur instead of Rast-Panjgah or choose Shur in a Shur-family Avaz. The separate model panel is where the full 12-class experiment is displayed.

## Scientific safeguards

The trained model and all KDC assets remain on your computer; neither model nor audio is committed to GitHub. This PR is draft-only and must not be merged as an accuracy improvement. Running the final test is a separate one-time decision, not part of this setup.
