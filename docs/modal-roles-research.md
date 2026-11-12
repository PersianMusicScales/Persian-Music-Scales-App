# Shahed and Finalis: evidence and limits of the educational models

**Scope:** educational reference annotations, using the Mirza Abdollah / Nur-Ali Boroumand instrumental-radif tradition as an organizing framework. Research sources from other traditions do not necessarily prove direct correspondence to each exact Mirza Abdollah gusheh. Distinctions between `documented`, `partial` and `provisional` must remain visible in the interface.

## Interpretation

- **Shahed (شاهد):** a characteristic emphasized/reciting pitch, not necessarily equivalent to a Western major/minor tonic.
- **Finalis (نت پایان / خاتمه):** the pitch where a modal performance or phrase characteristically concludes; not identical by definition to **Ist (ایست)**, a temporary resting or stopping tone.
- **Darāmad:** introductory modal context used for the present default. **Gushehs have their own modal roles** and should not inherit the same markers without evidence.
- **Pitch collection vs modal identity:** seven equalized (50-cent-resolution) positions are a visualization and transposition tool. Microtonal intonation and melodic function in a performed radif are more nuanced.
- **Scale degree:** indices stored in `src/modal-roles.js` are zero-based; degree numbers in this document are one-based and independent of absolute transposition.

## Curated role table

| UI context | Shahed | Finalis | Status | Caution |
| --- | --- | --- | --- | --- |
| Shur darāmad | 1 | 1 | documented model | Some gushehs require variable tones |
| Nava darāmad | 1 | 1 | provisional | Check the actual Mirza Abdollah darāmad transcription |
| Segah darāmad | 3 | 3 | documented model | Third pitch is E-koron in the C-referenced display |
| Homayoun darāmad | 2 | 1 | documented model | Only the introductory modal context |
| Bayat-e Esfahan darāmad | 1 | 5 | documented model | The ending can differ across historical renditions |
| Chahargah darāmad | 1 | 1 | provisional | Tonal prominence does not alone prove Shahed |
| Mahur darāmad | 1 | 1 | provisional | Dād/Goshāyesh prominently use degree 2; scholarly terminology varies |
| Rast-Panjgah darāmad | 1 | 1 | provisional | Particularly the Shahed needs direct transcription confirmation; not the later Panjgāh gusheh |
| Abu Ata introductory mode | 4 | 1 | documented model | Second degree also functions as temporary Ist in the cited model |
| Bayat-e Tork | 3 | unassigned | partial | Different concluding contexts; no one universal Finalis |
| Afshari | 1 | 4 | partial | Shur shared seven-note model misses E-koron Ist and variable A degrees in Farhat's example |
| Dashti | 5 | 1 | provisional | The variable pitch and modal context are not fully modeled |
| Natural minor | tonic 1 | n/a | documented comparison | Western terminology only |

These assignments are educational crosswalks from cited modal examples, **not a critical edition of Mirza Abdollah's radif**. The displayed notes are transposition-dependent. The chosen first-degree markers in Mahur and Rast-Panjgah remain explicitly provisional.

## Shared collections do not entail identical melodic systems

**Nava vs Shur:** cyclically rotating the app's Shur pitch collection from degree four produces the same *interval sequence* as the Nava data. This numerical property does not establish the same musical identity or an authoritative Shahed.

**Mahur vs Rast-Panjgah:** both use the same current seven-note pitch collection. They have separate modal contexts, descriptive notes and role settings. Automated classification from this pitch collection **cannot uniquely distinguish them**, so Rast-Panjgah is selectable in manual analyzer interpretation but not offered as a separate automatically proven label. A future classifier would require source-validated modal gestures and forūd/cadence features.

**Abu Ata / Bayat-e Tork / Afshari / Dashti:** these share the visible Shur scaffold in this release; that scaffold is *not* claimed to reproduce each complete modal collection. Afshari's reference E-koron Ist and Dashti variable pitches are explained, not silently synthesized as if already in the current scale.

## Sources / further verification

1. *Encyclopaedia Iranica*, [Mirza Abdollah](https://www.iranicaonline.org/articles/abdallah-mirza/), [Dastgah](https://www.iranicaonline.org/articles/dastgah/), [Shur modal system](https://www.iranicaonline.org/articles/shur-modal-system/), [Darāmad](https://www.iranicaonline.org/articles/daramad/). These establish useful concepts; check each actual transcription for exact note roles.
2. Gen’ichi Tsuge, [Abu Ata](https://www.iranicaonline.org/articles/abu-ata/), *Encyclopaedia Iranica*.
3. Margaret Caton, [Bayat-e Tork](https://www.iranicaonline.org/articles/bayat-e-tork/) and [Bayat-e Esfahan](https://www.iranicaonline.org/articles/bayat-e-esfahan/), *Encyclopaedia Iranica*.
4. Hormoz Farhat, [Afshari](https://www.iranicaonline.org/articles/afsari/), *Encyclopaedia Iranica*; *The Dastgah Concept in Persian Music* (Cambridge University Press, 1990).
5. Bruno Nettl, [Chahargah](https://www.iranicaonline.org/articles/cahargah/), *Encyclopaedia Iranica*.
6. [Homayun](https://www.iranicaonline.org/articles/homayun/), *Encyclopaedia Iranica*.
7. Laudan Nooshin, [doctoral thesis on Persian music, volume II](https://openaccess.city.ac.uk/id/eprint/4149/2/Nooshin_PhD_thesis_volume_2.pdf), Segah modal functions.
8. Owen Wright, *The Peregrinations of panjgāh* (2019), for distinguishing the Panjgāh gusheh from the introductory Rast modal context.

## Curated notes and preserved historical annotations

The public interface is **reference-only**. The manual Shahed/Finalis editor has been removed. Historical edits saved under `persianMusicScales.modalRoles.v1` are **left untouched** in the browser but are neither read for display nor modified; the curated scholarly profile always determines the symbols and legend. The marker Show/Hide preference remains browser-local.

## Outstanding scholarship (do not invent answers)

- Read a critical transcription of Mirza Abdollah's **Nava**, **Mahur**, **Chahargah** and **Rast-Panjgah** darāmads note by note, defining how each source labels Shahed and Finalis.
- Reconcile Mahur's alternative uses of tonic, recitation tone and dominant.
- Introduce **gusheh-specific** datasets before claiming the current Shahed or Finalis applies to every gusheh.
- Model Afshari and Dashti tunings/variable pitches independently if the app should perform or classify their *full* modal material.
