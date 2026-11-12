# Third-party notices

The original Persian Music Scales application is proprietary (see [LICENSE](LICENSE)). The following component is a separately licensed third-party work; its copyright and license are not transferred to the author of Persian Music Scales.

## Chromatic tuner implementation

**Copyright (c) 2022 Qiu Xiang <xiang.qiu@qq.com>**

Source: https://github.com/qiuxiang/tuner

The files `src/tuner.js`, `src/notes.js`, `src/meter.js`, and `src/frequency-bars.js` match the upstream tuner implementation. `src/app.js` is adapted from the same project.

The following MIT license applies to these tuner components and should remain with their source when copied or redistributed:

```text
Copyright (c) 2022 Qiu Xiang <xiang.qiu@qq.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Music notation and other dependencies

The Koron/Sori vector outlines and Noto Music glyph outlines have their own attribution and license terms, documented in [the staff notation methodology](docs/dynamic-persian-notation.md). These terms are separate from the proprietary application license.

The browser tuner also uses external SweetAlert2 and aubiojs JavaScript libraries. Those libraries remain the intellectual property of their respective maintainers and are governed by their upstream licenses.
