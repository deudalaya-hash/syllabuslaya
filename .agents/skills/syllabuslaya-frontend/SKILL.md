---
name: syllabuslaya-frontend
description: Develop or debug the existing Syllabusलय frontend: its static HTML, inline CSS and JavaScript, programme rendering, responsive behavior, and GitHub Pages compatibility. Use for frontend features and fixes in this project.
---

# Syllabusलय Frontend

## Before editing

1. Read the root AGENTS.md and inspect the relevant parts of index.html and tests/index.test.cjs.
2. Treat the current implementation as a static single-page site with inline HTML/CSS/JavaScript. Do not introduce React, Next.js, a bundler, or a backend to solve a local UI issue.
3. Trace current data and event flow before changing it. Reuse PROGS, programme data, render(), progs(), tabs(), search routing, and existing storage helpers where appropriate.

## Implementation standards

- Keep the existing Syllabusलय identity, education hierarchy, content, and features intact.
- Use semantic HTML, responsive CSS, reduced-motion support, keyboard-operable controls, and clear focus states.
- Use relative URLs for project assets so the site works from a GitHub Pages project path.
- Keep JavaScript dependency-free. Handle missing DOM nodes and localStorage exceptions gracefully.
- Do not inject user-provided or external content as raw HTML. Use text nodes or escape values when templating is necessary.
- Keep functions and data changes scoped. Avoid wholesale rewrites or formatting unrelated source regions.

## Verification

- Add a regression test first for changed behavior.
- Run node --test tests/index.test.cjs.
- If an interactive browser is available, verify the affected desktop/mobile behavior; otherwise state that browser validation was unavailable.
