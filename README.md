# Persian Music Scales

**An interactive, multilingual web application for exploring Persian musical scales, microtones, transposition, pitch detection, predominant-melody extraction, and scale recognition.**

Created by **Pouya Hosseini**.

[Open the live application](https://persianmusicscales.github.io/Persian-Music-Scales-App/) · [View the repository](https://github.com/PersianMusicScales/Persian-Music-Scales-App)

---

## About the Project

Persian Music Scales combines an interactive circular scale explorer with browser-based audio analysis.

The application is designed for musicians, students, teachers, researchers, and listeners who want to:

- explore Persian scales visually;
- hear and transpose scales;
- study koron, sori, and quarter-tone relationships;
- record or upload a musical phrase;
- extract a simplified predominant melody;
- estimate the closest matching scale and tonic;
- compare alternative interpretations;
- follow detected notes dynamically around the scale circle;
- view a radial spectrum visualizer synchronized with playback;
- use a chromatic tuner;
- install the project as a Progressive Web App.

Automatic results are presented as **best-matching interpretations**, not as definitive musicological classifications.

---

## Try It

The application offers three ways to analyse music:

### 1. Record a phrase

Use the floating microphone control on the main page.

On first use:

1. Tap the microphone once.
2. Allow microphone access.
3. Wait for **Microphone ready**.
4. Hold the microphone button to record.
5. Release it to stop and analyse.

After recording, the application automatically:

- normalizes the recording when needed;
- extracts the predominant melody;
- estimates the scale and tonic;
- applies the leading interpretation to the circle;
- begins playback;
- animates the detected notes and radial spectrum.

### 2. Upload a track

Open **Analyze Track** and choose a browser-supported audio file.

The application decodes and analyses the audio locally in the browser.

### 3. Try the built-in example

Select **Try example recording — Jane Oshagh** from the analyser.

The example is loaded from the published application, analysed with the default settings, and played with the same note and spectrum visualization.

---

## Main Features

### Interactive circular scale explorer

The main interface represents pitch relationships around a 24-position quarter-tone circle.

Users can:

- rotate and transpose the selected scale;
- view dynamic note names;
- explore koron and sori alterations;
- hear the selected scale;
- inspect interval relationships visually;
- explore the principal avaz branches associated with Shur.

### Included scales

The application currently includes:

- Shur
- Nava
- Segah
- Homayoun
- Esfahan
- Chahargah
- Mahur / Rast Panjgah
- Natural Minor

Each scale can be transposed to different tonic positions.

### Predominant-melody extraction

For polyphonic and accompanied recordings, the analyser attempts to follow one coherent melodic line similar to what a listener might hum.

The current implementation combines:

- multi-resolution pitch analysis;
- short-window onset sensitivity;
- longer-window tuning estimation;
- multiple pitch candidates per frame;
- continuity-aware melodic tracking;
- upper-, neutral-, and lower-register path comparison;
- structural-note and ornament classification;
- phrase-ending and tonic evidence;
- modal compatibility scoring.

The result is a simplified melodic contour used for scale comparison and synchronized visualization.

### Short notes and ornaments

Fast notes are retained through a separate high-temporal-resolution analysis layer.

Detected events can be treated differently as:

- structural notes;
- passing notes;
- ornaments;
- uncertain events.

Short notes remain visible and audible, but receive less weight than stable structural notes during scale matching.

### Selectable scale candidates

The analyser does not force the user to accept only the highest-ranked result.

The strongest candidates are displayed with estimated match values. Selecting a candidate immediately:

- changes the scale;
- changes the tonic;
- rotates the circle;
- updates the outer note labels;
- remaps the detected melody;
- updates playback animation;
- recalculates supporting evidence.

When top candidates are very close, the application reports the result as ambiguous and encourages the user to compare interpretations.

### Manual interpretation

Users can manually select any available scale and tonic when:

- the correct interpretation is not the top result;
- the excerpt is too short;
- the recording is modally ambiguous;
- specialist knowledge suggests a better reading.

### Simplified melody playback

The extracted melody can be replayed as a neutral synthesized monophonic line.

This allows the user to check whether the analyser followed:

- the intended melody;
- the bass;
- a chord tone;
- a strong harmonic;
- another instrument.

Playback options include:

- original recording;
- simplified melody;
- pause;
- stop;
- timeline seeking.

### Radial spectrum visualizer

A circular spectrum halo surrounds the outer note ring.

Each bar:

- is anchored to the circumference;
- follows its local radius;
- expands outward with increasing energy;
- contracts inward as energy falls;
- remains aligned with the geometry of the circle.

The visualizer combines:

- a subtle full-spectrum background;
- pitch-class emphasis;
- stronger activity near the detected melodic note;
- synchronized highlighting of the corresponding outer note label.

The note label, timeline, candidate interpretation, and radial emphasis use the same pitch-to-angle mapping.

### Automatic playback and looping

Microphone recordings are automatically analysed and replayed in a loop until the user interrupts playback.

Uploaded tracks and the built-in example use the application’s persistent Web Audio playback path. This improves first-play reliability in installed iPhone Home Screen mode.

When iOS still requires a direct playback gesture, the application keeps the analyser visible and asks the user to tap once to hear the result.

### Chromatic tuner

The project includes a microphone-based chromatic tuner for identifying pitch and tuning deviation.

### Multilingual interface

The application supports:

- English
- French
- Persian

Persian content includes right-to-left layout support.

### Progressive Web App

The application can be installed on compatible desktop and mobile devices.

After the initial visit, the service worker provides offline access to the application shell and cached assets.

The built-in example audio is fetched and cached only when selected, avoiding an unnecessary large initial download.

---

## Recommended Recording Practice

For the most reliable result:

- record one clear melodic phrase;
- use a solo voice or melodic instrument where possible;
- keep the microphone reasonably close;
- avoid excessive background noise;
- avoid speech, applause, or long silence;
- record at least a few seconds;
- include a phrase ending or return to the tonic when possible;
- avoid clipping or very low recording levels.

A short passage that does not contain characteristic modal behaviour may remain genuinely ambiguous.

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

The **Reset defaults** control restores the recommended analysis and visualizer settings.

---

## How the Analysis Works

The current browser-based pipeline is approximately:

```text
Audio input
    ↓
Decoding and level normalization
    ↓
Multi-resolution pitch analysis
    ↓
Multiple pitch candidates per frame
    ↓
Predominant-melody tracking
    ↓
Structural-note and ornament classification
    ↓
24-bin pitch-class profile
    ↓
Scale and tonic comparison
    ↓
Tonic, phrase-ending, interval, and resolution evidence
    ↓
Ranked candidate interpretations
    ↓
Circle mapping, playback, and visualization
```

The analysis runs in a Web Worker to reduce blocking of the main interface.

---

## Privacy

Audio analysis is performed locally in the browser.

Recorded and uploaded audio does not need to be transferred to a remote analysis server.

Microphone access is requested only after user interaction and remains under the browser’s permission controls.

The built-in example is downloaded from the public GitHub Pages application when selected.

---

## Browser and Device Notes

### iPhone and installed Home Screen app

iOS applies stricter rules to delayed audio playback.

The application therefore:

- prepares a persistent Web Audio context from a user gesture;
- reuses the decoded audio buffer for playback;
- verifies that the audio context is running;
- keeps the analyser visible when sound is still blocked;
- provides a one-tap playback fallback when required.

For the first microphone use, iOS interrupts the original touch while showing the permission dialog. The application uses a two-stage flow:

```text
Tap once to enable microphone
        ↓
Allow access
        ↓
Microphone ready
        ↓
Hold to record
```

### Supported formats

Supported audio formats depend on the browser and operating system.

Commonly supported formats include MP3, WAV, M4A/AAC, and OGG, but compatibility is not identical across browsers.

---

## Running Locally

Do not open `index.html` only through a `file:///` address.

Web Workers, microphone permissions, and service-worker behaviour require a local HTTP server.

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
2. Open **Settings**.
3. Select **Pages**.
4. Deploy from the desired branch, normally `main`.
5. Open the published GitHub Pages address.

After a service-worker update, an older version may remain cached.

During testing, use one of the following:

- open the site in a Private or Incognito window;
- unregister the old service worker;
- clear site data;
- remove and reinstall the Home Screen app on iPhone when necessary.

---

## Project Structure

```text
Persian-Music-Scales-App/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── audio/
│   │   └── jane-oshagh.mp3
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

## Important Limitations

Automatic scale recognition remains a signal-processing approximation.

Results can be affected by:

- dense polyphony;
- strong bass lines;
- overlapping piano sustain;
- percussion;
- background noise;
- weak fundamentals;
- strong upper harmonics;
- variable performance intonation;
- modulation;
- very short excerpts;
- missing phrase endings;
- ornament-heavy passages;
- poor-quality or heavily compressed recordings.

Persian modal identity cannot always be determined from pitch collection alone.

Finalis, shahed, melodic hierarchy, characteristic phrases, variable tones, gusheh context, modulation, and performance practice may require expert interpretation.

For this reason, the application:

- displays several candidates;
- reports close results as ambiguous;
- permits manual scale and tonic selection;
- provides simplified-melody playback;
- allows the user to inspect the detected timeline.

The output should be treated as an educational and exploratory interpretation rather than a definitive academic determination.

---

## Related Project

### Al-Urmawī Advar Atlas

The [Al-Urmawī Advar Atlas](https://persianmusicscales.github.io/urmawi-advar-atlas/) is a related interactive educational project for exploring interval, scale, modal, geometric, and theoretical concepts associated with Safi al-Din al-Urmawi’s musical system.

[View the Al-Urmawī Advar Atlas repository](https://github.com/PersianMusicScales/urmawi-advar-atlas)

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
