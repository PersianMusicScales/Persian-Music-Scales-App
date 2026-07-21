© 2024 Pouya Hosseini. All rights reserved.

This project and its contents are the intellectual property of Seyed Pouya Hosseini Yazdeli. Unauthorized reproduction, distribution, or use is prohibited.

Proprietary License

Copyright © 2024 Pouya Hosseini. All rights reserved.

This software and its associated materials are the exclusive intellectual property of Pouya Hosseini.

You are not permitted to:

Use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the software or its components, in whole or in part, without prior written consent from Pouya Hosseini.
Reverse engineer, decompile, or disassemble the software for any purpose.
Permissions may be granted for limited use at the sole discretion of Pouya Hosseini upon written request.

For inquiries regarding permissions, please contact: [hoseini.ph@gmail.com]

DISCLAIMER: THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



# Persian Music Scales — Predominant Melody Analyzer v2

This update extends the browser-based audio analyzer with a predominant-melody stage. It is intended to approximate the single melodic line a listener might hum from a polyphonic recording, while retaining short ornaments and microtonal information.

## What changed in v2

- Multi-resolution pitch analysis:
  - fine temporal frames retain short notes and ornaments;
  - longer stable frames preserve tuning and 24-bin pitch-class evidence.
- Up to four pitch candidates are evaluated in each analysis frame.
- A continuity-aware dynamic-programming tracker selects one predominant melody.
- Automatic comparison of neutral, upper-voice and lower-voice melody paths.
- Manual melody-register choices for difficult piano or ensemble recordings.
- A **Melodic detail** control changes the minimum retained note duration from approximately 78 ms to 35 ms.
- Short notes are classified as ornaments/passing notes and remain visible and audible, but receive less weight during scale matching.
- A separate **Simplified Melody** playback button resynthesizes the extracted line locally in the browser.
- The timeline now shows:
  - faint raw detected pitch material;
  - the selected predominant melody;
  - ornaments in a separate visual treatment.
- Live playback identifies each event as a structural note or ornament.
- The service-worker cache was advanced to `v6-predominant-melody` and scripts/workers now use a network-first update policy.

## Files to replace on GitHub

Replace these four existing files:

```text
index.html
service-worker.js
csss/audio-analyzer.css
src/audio-analyzer.js
src/audio-analyzer.worker.js
```

The two WAV files in `test-audio/` are optional and are intended only for testing.

Do not replace `src/index.js` or `csss/indexstyle.css` when your GitHub versions contain later work. The v2 analyzer continues to use the existing scale definitions and circle-drawing functions.

## Recommended settings

### Solo voice or solo instrument

```text
Recording type: Solo / melody-dominant
Predominant melody: enabled
Melodic detail: 55–70%
Register: Automatic
```

### Piano with melody in the right hand

```text
Recording type: Balanced recording
Predominant melody: enabled
Melodic detail: 65–85%
Register: Prefer upper voice
```

### Dense ensemble

```text
Recording type: Dense ensemble / full mix
Predominant melody: enabled
Melodic detail: 55–75%
Register: Automatic, then test Upper if bass is followed
```

### When too many false short notes appear

Move **Melodic detail** toward Stable. When legitimate ornaments are missing, move it toward Detailed.

## Playback

After analysis, two playback controls are available:

- **Original** plays the uploaded recording and animates the circle from the extracted melody.
- **Simplified Melody** plays a neutral synthesized version of the extracted melodic line and uses the same circle animation.

The simplified playback is deliberately plain. Its purpose is to let the user verify whether the analyzer followed the melody they perceive, rather than to imitate the original instrument.

## First tests

### Controlled scale test

Use `test-audio/shur-on-d-test.wav` with Solo / melody-dominant mode. The leading result should remain **Shur on D**.

### Polyphonic short-note test

Use `test-audio/polyphonic-short-notes-test.wav` with Balanced mode and either Automatic or Prefer upper voice. It contains a foreground melody, sustained bass/chord material and several notes around 50–120 ms. The selected melody timeline should retain the short foreground events rather than showing only sustained notes.

## Important limitation

This remains a signal-processing approximation rather than a trained source-separation or neural transcription model. In some recordings, the bass, a strong harmonic, or another instrument can still become the selected melody. The register selector, frequency limits and timeline comparison are provided so that users can diagnose and correct such cases.

The scale result remains a **best match**, not a definitive dastgah or gusheh classification. Melodic hierarchy, finalis, shahed, variable tones, phrase structure, modulation and performance intonation can require expert interpretation.
