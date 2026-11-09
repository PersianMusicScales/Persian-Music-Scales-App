# Dynamic Persian staff notation — proposed educational feature

The feature is a **calculated spelling of the currently selected seven-note pitch collection**, not an independently sourced traditional signature for every dastgāh and transposition.

## Scope and provenance

- Draws a treble-clef staff with accidentals on their written pitch-letter positions.
- Updates when the selected scale, circle rotation or language changes. The original circle labels, sound playback and audio analyzer are unchanged.
- Uses 24 equal steps per octave (50 cents per step), which is **the app's simplified computational grid**. Traditional Koron and Sori intonation varies by context; this is **not** a claim that a Persian performance always equals 50 cents.
- Because the app permits all 24 rotations, some uncommon positions have no established **conventional** Persian key signature. All Persian-mode displays in this first version are expressly labeled **Calculated scale alterations**, not canonical key signatures.
- Conventional Western-key-signature labeling is used for simple ordinary accidental spellings of the Mahur and natural-minor comparison models; the pitches are still independent of the musical mode's finalis/Shahed.
- The displayed staff is anchored beside the Play Scale control. Opening it provides seven spelled notes, the reference spelling, a notation caveat and source/attribution information.
- The Sornaz key-signature examples supplied by the application creator are useful evidence that Iranian notation distinguishes **bemol-koron** and **diez-sori** families and uses written staff positions. They are NOT copied as a generalized transcription table: those diagrams show particular *māyeh* and conventions, while the application must also handle 24 computational transpositions. The source PDF supplied to this conversation was incomplete and was not used as a reliable authority.

## Algorithm and its limits

1. Read the **seven numerical cumulative pitch values** of the currently selected educational scale model.
2. Rotate these values by the same pitch-class shift applied by the app's 15-degree/50-cent rotation interaction.
3. Enumerate seven diatonic spellings (C through B, with one consecutive letter per degree); compute the nearest alteration relative to each natural pitch.
4. Select the least-complex spelling by minimizing alterations and avoiding unnecessary mixed sharp/flat spellings. A user-facing result is always mathematically equivalent to the scale's seven 50-cent-grid pitches.
5. Show standard flats, sharps, Korons and Soris. An exceptional ±150-cent spelling uses a **combined accidental** (flat + Koron or sharp + Sori) and is marked as theoretical, not a proven standard traditional signature.
6. Place every accidental on the treble clef at its **letter's staff position**, and sort by conventional flat/sharp letter order where possible. This is not a universally prescribed Persian key-signature ordering for every dastgāh, so the panel labels it derived.

The frontend does not conflate enharmonic labels on the circle with scored notation. For example, the original C-referenced Shur model yields **C, D-koron, E-flat, F, G, A-flat, B-flat**. The 24 mathematical transpositions do not all correspond to commonly notated radif keys. Neither Shahed/Finalis labels nor the radif models are changed by this feature.

## Required future musicological validation

- Curate source-specific Persian traditional *māyeh* signature spellings and their ordering/positions as a separate dataset, including distinctions between radif, darāmad, gusheh, and temporary alterations.
- Link each **documented traditional signature** to a source and distinguish those from the computed fallback.
- Account for variable scale degrees and contextual intonation in Afshari, Dashti and some other modal situations before claiming to engrave the whole modal system.

## Asset credits and licenses

The original authentic vector symbol paths were supplied by the app creator from these two **Wikimedia Commons** pages:

- **Sori, U+1D1E9:** https://commons.wikimedia.org/wiki/File:U%2B1D1E9.svg
- **Koron, U+1D1EA:** https://commons.wikimedia.org/wiki/File:U%2B1D1EA.svg
- Creator: **Kwamikagami**. License displayed on the source pages: **Creative Commons Attribution–ShareAlike 4.0 International (CC BY-SA 4.0)**. License URL: https://creativecommons.org/licenses/by-sa/4.0/

The files are reproduced without shape modification in `assets/notation/sori.svg` and `assets/notation/koron.svg`. Their attribution and license should be preserved with redistributed copies; the application's code licensing is separate.

The treble clef is an embedded outline extracted from **Google Noto Music** (glyph U+1D11E), distributed under the **SIL Open Font License 1.1**. This is a vector path, not a redistributed font file. License: https://openfontlicense.org/open-font-license-official-text/ . Font source: https://github.com/notofonts/music .

For key-signature conventions see [LilyPond, Persian classical music](https://lilypond.org/doc/v2.26/Documentation/notation/persian-classical-music.html), and the Sornaz examples provided by the app creator at https://sornaz.com/analytics/article-details?id=21 . Those sources inform the principles; the full conventional source-specific tables remain future work.
