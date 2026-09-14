# Anatomy Atlas source code

This is the static source for the interactive Anatomy Atlas included with the Anatomy & Physiology Notes site.

## Run on Windows
1. Extract this ZIP.
2. Open the Anatomy-Atlas folder in VS Code or a terminal.
3. With Python installed, run: py -m http.server 8000 --bind 127.0.0.1
4. Open http://localhost:8000 in your browser.
5. Press Ctrl+C in the terminal to stop the server.

No package installation or build step is required. On macOS/Linux use python3 instead of py.
A local web server is recommended so browsers can load the SVG worksheet image consistently.

## Edit
- index.html: page structure and controls
- style.css: appearance, animations, and responsive layouts
- app.js: markers, answers, grading, and quiz controls
- study.js: study mode and labels
- learning.js: spelling tips and memory aids
- worksheet.png: the supplied blank worksheet

Google Fonts loads optional fonts online; system fonts are used if unavailable.
Quiz answers and the current position are saved in browser storage on the current device. “Start over” clears that saved attempt.
The header logo returns to the main Anatomy & Physiology Notes page when the atlas is hosted in its repository folder.

The worksheet adapts Figure 1.12, “Regions of the Human Body,” from J. Gordon Betts and colleagues, *Anatomy and Physiology 2e*, OpenStax (2022). The illustration has been converted into a numbered worksheet and supplemented with original interactive markers, quiz behavior, answer matching, spelling guidance, and memory aids.

- Original section and Figure 1.12: https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology
- Textbook access: https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction
- License: CC BY-NC-SA 4.0 — https://creativecommons.org/licenses/by-nc-sa/4.0/

Hosting credentials and deployment-specific account identifiers are not included.
