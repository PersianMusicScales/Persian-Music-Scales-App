# Persian Music Scales

**An interactive, multilingual web application for exploring Persian musical scales, microtones, tonal relationships, transposition, pitch detection, and melody-based scale analysis.**

Created by **Pouya Hosseini**.

[Open the live application](https://persianmusicscales.github.io/Persian-Music-Scales-App/)  
[View the GitHub repository](https://github.com/PersianMusicScales/Persian-Music-Scales-App)

---

## Overview

Persian Music Scales combines an interactive circular scale explorer with browser-based audio analysis.

The application allows musicians, students, teachers, researchers, and listeners to:

- explore Persian scales visually;
- transpose scales around a 24-position quarter-tone circle;
- hear the notes of each scale;
- record or upload a short musical phrase;
- extract a predominant melodic line;
- estimate the closest matching scale and tonic;
- compare alternative interpretations;
- follow detected notes dynamically around the circle;
- view a radial spectrum visualizer synchronized with playback;
- use a chromatic tuner;
- install the project as a Progressive Web App.

The application is designed as an educational and exploratory tool. Its automatic scale result is presented as a **best match**, not as a definitive musicological classification.

---

## Main Features

### Interactive circular scale explorer

The principal interface represents pitch relationships around a circular 24-position system.

Users can:

- rotate and transpose the selected scale;
- view dynamic note names;
- explore quarter-tone alterations including koron and sori;
- hear the selected scale;
- inspect the interval structure visually;
- explore the principal avaz branches associated with Shur.

### Included scales

The current application includes:

- Shur
- Nava
- Segah
- Homayoun
- Esfahan
- Chahargah
- Mahur / Rast Panjgah
- Natural Minor

Each scale can be transposed interactively to different tonic positions.

### Record a phrase directly

A floating microphone control on the main page allows the user to record a short phrase without preparing an audio file.

Workflow:

1. Hold the microphone button.
2. Hum, sing, whistle, or play a short phrase.
3. Release the button.
4. The recording is analysed automatically.
5. The closest scale and tonic candidates are displayed.
6. The circle updates to the selected interpretation.
7. The recorded phrase plays with synchronized note and spectrum visualization.

Quiet recordings are normalized automatically within safe limits.

The recorded phrase remains in the browser and is not uploaded to a server.

### Upload and analyse a track

Users can also upload a browser-supported audio file.

The analyser can:

- decode the recording locally;
- estimate multiple pitch candidates;
- extract a predominant melody;
- preserve short ornaments and passing notes;
- construct a 24-bin pitch-class profile;
- compare the melody with all supported scales and tonic positions;
- rank the strongest candidates;
- identify close or ambiguous results;
- let the user select another candidate manually;
- replay the original or simplified extracted melody.

Supported audio formats depend on the browser and operating system.

### Predominant-melody extraction

For polyphonic or accompanied recordings, the analyser attempts to identify one coherent melodic line similar to what a listener might hum.

The current implementation uses:

- multi-resolution pitch analysis;
- short-window onset sensitivity;
- longer-window tuning estimation;
- multiple pitch candidates per frame;
- continuity-aware melodic tracking;
- upper-, neutral-, and lower-register path comparison;
- structural-note and ornament classification;
- phrase-ending and tonic evidence;
- modal compatibility scoring.

A register preference can be selected for difficult recordings, including piano music where the melody is carried by the upper voice.

### Selectable scale candidates

The application does not force the user to accept only the highest-ranked result.

The strongest candidates are displayed with their estimated match values. Selecting a candidate immediately:

- changes the scale;
- changes the tonic;
- rotates the circle;
- updates the note labels;
- remaps the detected melody;
- updates playback animation;
- recalculates supporting evidence.

When two candidates are very close, the application warns the user that the result is ambiguous and encourages comparison.

### Simplified melody playback

The extracted melody can be resynthesized as a neutral monophonic line.

This helps the user evaluate whether the analyser followed the intended melody rather than the bass, accompaniment, or a strong harmonic.

Playback options include:

- original recording;
- simplified extracted melody;
- pause;
- stop;
- seek through the detected-note timeline.

### Radial spectrum visualizer

The circular visualizer surrounds the outer note ring.

Each bar:

- is anchored to the circumference;
- follows its local radius;
- expands outward with increasing energy;
- contracts inward as energy decreases;
- remains aligned with the geometry of the circle.

The visualizer combines:

- a subtle full-spectrum background;
- pitch-class emphasis;
- stronger activity near the detected melodic note;
- synchronized highlighting of the corresponding outer note label.

The pitch label, timeline, and radial emphasis use one shared pitch-to-angle mapping.

### Tuner

The application includes a microphone-based chromatic tuner for identifying pitch and tuning deviation.

### Multilingual interface

The application supports:

- English
- French
- Persian

Persian content includes right-to-left layout support.

### Progressive Web App

The project can be installed on compatible desktop and mobile devices.

The service worker provides offline access to the application shell and cached assets after the first successful visit.

---

## Recommended Recording Practice

For the most reliable result:

- record one clear melodic phrase;
- use a solo voice or melodic instrument where possible;
- keep the microphone reasonably close;
- avoid excessive background noise;
- avoid speech, applause, or long silence;
- record at least a few seconds;
- include phrase endings or tonic resolutions when possible.

A short excerpt that does not contain characteristic modal behaviour may remain genuinely ambiguous.

---

## Recommended Analysis Settings

### Solo voice or solo instrument

```text
Recording type: Solo / melody-dominant
Predominant melody: Enabled
Melodic detail: 55–70%
Register preference: Automatic
```

### Piano with melody in the upper voice

```text
Recording type: Balanced recording
Predominant melody: Enabled
Melodic detail: 65–85%
Register preference: Prefer upper voice
```

### Dense ensemble or full mix

```text
Recording type: Dense ensemble / full mix
Predominant melody: Enabled
Melodic detail: 55–75%
Register preference: Automatic
```

When too many unstable short notes appear, move **Melodic detail** toward **Stable**.

When legitimate ornaments or short passing notes are missing, move it toward **Detailed**.

The **Reset defaults** control restores the recommended analysis and visualizer values.

---

## Privacy

Audio analysis is performed locally in the browser.

The application does not require recorded or uploaded audio to be transferred to a remote server.

Microphone access is requested only after user interaction and remains subject to browser permission controls.

---

## Technical Architecture

The project is a static HTML, CSS, and JavaScript application suitable for GitHub Pages.

Principal technologies include:

- HTML5
- CSS3
- JavaScript
- Web Audio API
- MediaDevices API
- MediaRecorder API
- Web Workers
- Canvas-based visualization
- Progressive Web App manifest
- Service Worker caching

The analysis worker runs separately from the main interface to reduce visual blocking during longer calculations.

---

## Project Structure

```text
Persian-Music-Scales-App/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── icons/
│   └── images/
├── csss/
│   ├── indexstyle.css
│   ├── audio-analyzer.css
│   ├── tunerstyle.css
│   ├── guidestyle.css
│   └── aboutstyle.css
├── htmls/
│   ├── tuner.html
│   ├── guide.html
│   ├── about.html
│   └── offline.html
└── src/
    ├── index.js
    ├── audio-analyzer.js
    └── audio-analyzer.worker.js
```

---

## Running Locally

Do not open `index.html` only through a `file:///` address. Web Workers, microphone permissions, and service-worker behaviour require a local HTTP server.

### Python

From the project directory:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

### Visual Studio Code

Open the project folder and use the **Live Server** extension.

Microphone access is supported on secure origins, including HTTPS and `localhost`.

---

## Deployment on GitHub Pages

1. Upload the project files to the repository.
2. Open the repository settings.
3. Select **Pages**.
4. Deploy from the desired branch, normally `main`.
5. Open the published GitHub Pages address.

After replacing service-worker files, an older version may remain cached. Use an Incognito/Private window or clear the site's service-worker and storage data during testing.

---

## Important Limitations

Automatic scale recognition remains a signal-processing approximation.

Results may be affected by:

- dense polyphony;
- strong bass lines;
- overlapping piano sustain;
- percussion;
- recording noise;
- weak fundamentals;
- strong upper harmonics;
- variable performance intonation;
- modulation;
- very short excerpts;
- missing phrase endings;
- ornament-heavy passages.

Persian modal identity cannot always be determined from pitch collection alone. Finalis, shahed, melodic hierarchy, characteristic phrases, variable tones, gusheh context, modulation, and performance practice may require expert interpretation.

For this reason, the application:

- displays several candidates;
- reports close results as ambiguous;
- permits manual scale and tonic selection;
- provides simplified-melody playback for verification.

---

## Related Project

### Al-Urmawī Advar Atlas

The Al-Urmawī Advar Atlas is a related interactive educational project for exploring concepts associated with Safi al-Din al-Urmawi's musical system.

Both applications are part of a broader effort to create accessible digital tools for hearing, visualizing, and studying historical and contemporary musical systems.

---

## Author

**Pouya Hosseini**

For permissions, collaboration, or other inquiries:

**hoseini.ph@gmail.com**

---

## Proprietary Licence

Copyright © 2024–2026 Pouya Hosseini. All rights reserved.

This project, its source code, interface, visual design, documentation, audio-analysis methods, associated materials, and other contents are the intellectual property of **Seyed Pouya Hosseini Yazdeli**, also professionally known as **Pouya Hosseini**.

No rights are granted except through prior written permission from the copyright holder.

### You may not, without prior written consent:

- use, copy, reproduce, modify, adapt, merge, translate, or create derivative works from the software or its components, in whole or in part;
- publish, distribute, transmit, sublicense, lease, sell, commercialize, or otherwise make the software or its components available to another person or organization;
- copy or reproduce the visual design, musical visualizations, analysis workflows, documentation, branding, or project assets;
- reverse engineer, decompile, disassemble, or otherwise attempt to derive the implementation or underlying methods;
- remove, obscure, or alter copyright, authorship, proprietary, or attribution notices.

Permission for a specific and limited use may be granted at the sole discretion of Pouya Hosseini following a written request.

For permission inquiries, contact:

**hoseini.ph@gmail.com**

### Disclaimer

THE SOFTWARE AND ASSOCIATED MATERIALS ARE PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, RELIABILITY, AVAILABILITY, AND NON-INFRINGEMENT.

IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, LOSS, DAMAGE, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE, ITS OUTPUTS, OR THE USE OR INABILITY TO USE THE SOFTWARE.

Automatic pitch, tonic, scale, and modal-analysis results are provided for educational and exploratory purposes and should not be treated as definitive musicological, academic, or professional determinations.
