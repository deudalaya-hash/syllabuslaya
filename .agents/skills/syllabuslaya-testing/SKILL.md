---
name: syllabuslaya-testing
description: Test Syllabusलय behavior, search, programme data, persistence, responsive/accessibility behavior, external resources, and GitHub Pages readiness.
---

# Syllabusलय Testing and QA

## Current test setup

- The project uses Node's built-in test runner and tests/index.test.cjs; run it with node --test tests/index.test.cjs.
- The current workspace has no package.json, test framework dependency, or app server configuration. Do not assume React, npm scripts, or a build process.

## Test workflow

1. Inspect the change and write a focused regression assertion before implementation when practical.
2. Run the focused test to confirm it fails for the intended reason.
3. Implement the smallest change, then run the full test suite.
4. Verify inline JavaScript parses, static paths resolve, storage functions handle errors, and search/navigation destinations are correct.
5. When available, use browser automation for desktop and mobile viewports, console errors, keyboard navigation, form submission, menus, nested toggles, storage refresh persistence, and external links.
6. Use accessibility checks for names, roles, focus order, contrast, keyboard support, and reduced motion. Do not claim browser or accessibility validation if it was not performed.

## Regression scope

- Confirm Pre-School–PhD hierarchy and one search bar remain intact.
- Confirm programme-specific search routes, semester/year controls, subjects, chapters/topics, bookmarks, completion, pins, and localStorage behavior still work.
- Confirm every modified programme and unrelated pathways remain present.
- Check relative assets and GitHub Pages project-path compatibility.
- Report exact checks passed and environmental limitations.
