# Interface and terminology review

This document records the decisions behind the November 2026 interface changes. It is intended to support future maintenance and editorial review.

## Visual system

The three principal pages (Scales, Guide and About) share the same background image, navigation treatment, and foreground surfaces. These rules live in `csss/shared-shell.css`; Scales-specific geometry and overlay behavior live in `csss/scale-polish.css`. The pre-existing scale rotation, tuning and analyzer calculations remain unchanged.

On narrow screens, the Shahed/Finalis and notation panels use viewport-constrained positioning. The āvāz selector opens inward below the reference-note row. The outer-circle labels are measured after rendering and repositioned within the circle’s bounding box. This prevents edge clipping without modifying their pitch values or labels.

The interval legend and copyright are in document flow. A fixed bottom navigation bar is retained, with scroll clearance for the final content.

## Terminology

| Concept | English | French | Persian |
| --- | --- | --- | --- |
| Characteristic focal note | Shahed | Shahed | شاهد |
| Concluding pitch (Finalis) | Finalis | Note finale | نت فرود |
| Temporary resting note (Ist) | Ist | Note d’arrêt | نت ایست |
| Scale identification | Identify the scale | Identifier la gamme | شناسایی گام |
| Audio-file analysis | Analyze audio | Analyser un enregistrement | تحلیل فایل صوتی |
| Tuner | Tuner | Accordeur | کوک‌سنج |
| Dynamic notation | Scale notation | Notation de la gamme | نت‌نویسی گام |

**Finalis and Ist are not interchangeable.** The modal-role data in `src/modal-roles.js` may distinguish a concluding pitch from a temporary resting note. The interface uses «نت فرود» for Finalis rather than treating every Ist as a Finalis.

Pitch spelling remains independent of modal identity. The notes shown on the staff are calculated from the selected educational pitch model; a derived accidental set is not automatically a conventional or historically documented key signature.

## Translation and content

- Visible interface labels, the Guide and About content use consistent Persian technical terminology and direct, reader-focused language.
- The Guide has dedicated English, French and Persian content. Figures link to full-size images so notes and accidentals remain inspectable on narrow devices.
- Locale-specific interval labels use appropriate digits and number formatting.
- The selected language is stored locally, with a browser-language fallback if local storage is unavailable.
- Copyright dates use a consistent 2024–2026 presentation.

## Review checklist

The changes target 27 items discussed with the project creator:

1. Keep expanded notation inside the viewport
2. Prevent the āvāz menu from obscuring Notes
3. Keep RTL menu content on screen
4. Improve dropdown contrast and touch targets
5. Prevent clipping of long circle labels
6. Keep interval legend and copyright accessible above bottom navigation
7. Use a compact, readable notation panel
8. Match staff and microphone visual weight
9. Balance the centered Play Scale button against its flanking controls
10. Reduce unnecessary vertical crowding
11. Align control radii, borders, backgrounds and shadows
12. Maintain foreground/background contrast over patterned artwork
13. Make Guide figures inspectable on mobile
14. Reduce About page padding and link-row height
15. Share page-level visual tokens
16. Localize interval units and digits
17. Handle mixed-direction note labels explicitly
18. Edit Persian explanatory prose
19. Keep a consistent editorial voice
20. Replace generic or repetitive Persian headings
21. Use a consistent copyright period
22. Provide a full-size view of Guide’s transposition example
23. Preserve documented/provisional model status and references
24. Retain āvāz-specific selected-state and explanation
25. Label mathematically derived notation appropriately
26. Use the same background treatment on Scales, Guide and About
27. Favor small, testable UI modules and idiomatic translations over repeated overrides

Items 23–25 depend partly on musicological source data already documented in the repository. The interface can explain uncertainty, but it cannot turn provisional assignments into authoritative statements without source review. For item 24, the active āvāz remains highlighted in its menu, and the Notes panel identifies its modal context.

## Validation

Playwright tests cover the main controls, all 24 pitch transpositions, staff positioning, overlay bounds, dropdown placement, multilingual navigation and major page content. Tests in headless Chromium cannot certify the appearance of native Safari/iOS text metrics, safe areas or accessibility settings. A short manual check in Safari and Android remains appropriate before merging.
