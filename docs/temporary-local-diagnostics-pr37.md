# PR #37 — temporary automatic local Āvāz diagnostic collector

This PR adds a **local-only, removable diagnostic workflow** on top of experimental PR #36. It does NOT change the musical scoring models, visualization, audio extraction Worker, controls, or published `main`. The goal is to gather diagnostic evidence from real labeled FLAC files so we can fix the actual classification errors rather than guess thresholds.

## Windows — no Console, no pip, no Node

1. Download ZIP of the branch `feature/avaz-pr37-local-auto-reports`. Extract to a new folder containing `index.html` and `tools`.
2. **Double-click `Start-Local-Avaz-Diagnostics.cmd`** in the extracted folder. No PowerShell or Developer Tools are needed. If Windows asks for confirmation, run only the file you downloaded from your own GitHub repository.
3. Alternatively, open PowerShell in this folder and run `py tools\local_diagnostics_server.py`.
4. Python opens Chrome at `http://localhost:8765/?avazDebug=1&autoSave=1`. You will see a **dark-blue local test panel** at the bottom right (the regular app remains unchanged underneath).
5. In the panel, choose the **correct musical mode** for the files you want to test. Select one or more **FLAC/WAV/MP3** files belonging to that mode. Click **Analyze files and save reports**. Do not interact with the analyzer while a batch is running.
6. Each file is processed by the *same existing browser Worker*. A JSON report is automatically saved in `local-diagnostic-reports` inside the extracted folder. The panel shows counts and errors. Repeat separately for each Āvāz, Homayoun, Esfahan, ordinary Shur, and Segah controls.
7. Send the JSON reports here (ZIP the `local-diagnostic-reports` folder when finished). **Do not upload the source FLACs or ZIPs again** unless needed for a specific audio error.
8. Press Ctrl+C in PowerShell to stop.

If Python reports that port 8765 is in use, run `py tools\local_diagnostics_server.py --port 8766`. If the dark-blue panel is missing, verify you started the **special launcher** instead of `py -m http.server`; ordinary HTTP servers do not inject the temporary client.

## What is saved

- Known mode selected in panel, original file name and elapsed duration
- The unchanged legacy Dastgāh rank/score snapshot
- The four independent Āvāz branch hypotheses, tonic references and evidence
- Reason why rank promotion was or was not attempted
- The displayed candidate list and associated heuristic scores
- Technical status and note/phrase counts

Only JSON is saved. **No raw audio, full extracted note sequences, MIDI, credentials, or original recordings are written by this tool.** The Python server binds to `127.0.0.1`, restricts report POST requests to its own origin, and forbids serving the output folder via HTTP. It makes no external API calls. The app may continue to use its existing online assets and analytics from the original app, so offline/privacy guarantees for the *whole app* are not implied.

## Known limitations

- This is a **diagnostic collector**, not a new trained classifier. It will not automatically fix recognition errors.
- The existing FLAC recordings have source labels but may include spoken text, ornamental figures or non-Darāmad gushehs; interpret recorded-audio accuracy cautiously.
- The collector uses Chrome's existing WebAudio/Worker execution. It is not an independent Python melody detector.
- Batch processing runs sequentially so each result is associated with its own filename and known mode.
- The temporary panel is only injected by the local launcher and cannot appear on GitHub Pages.

## Removal after diagnosis

When the decision-rule changes have been validated, remove:
- `tools/local_diagnostics_server.py`
- `tools/local_diagnostics_client.js`
- `tools/test_local_diagnostics_server.py`
- `.github/workflows/local-avaz-diagnostics.yml`
- The temporary analyzer hooks marked `PR #37` / `LOCAL_AUTO_SAVE`
- This documentation file.

The reports folder is untracked and is excluded from Git. Delete the folder locally when no longer needed. Neither PR #35 nor PR #36 is changed or merged by this PR. **PR #37 is a new draft targeting `main`, containing the earlier experimental foundations, and should be treated as a replacement candidate rather than merged alongside #35 and #36.**
