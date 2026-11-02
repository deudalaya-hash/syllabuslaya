# Syllabusलय Project Instructions

## Project shape

- This is an existing GitHub Pages website implemented as a static index.html with inline HTML, CSS, and JavaScript. Automated checks are in tests/index.test.cjs and use Node's built-in test runner. There is currently no package.json, framework build, backend, or Git metadata in this workspace.
- Keep the site static and GitHub Pages compatible unless the user explicitly approves an architectural change. Avoid paid services, build dependencies, and external packages when browser APIs can do the job.
- Project-specific skills are in .agents/skills/. Read the relevant skill before specialized work.

## Preservation and scope

- Preserve existing website sections, education levels, programmes, educational content, branding, functionality, stored progress, and navigation. Never delete, replace, or restructure content without the user's permission.
- Make only the changes requested. Explain proposed major architecture, content, or design changes before implementing them.
- Do not rebuild the website as a separate project. Keep all edits in this project folder.
- Maintain mobile and desktop usability, keyboard access, readable contrast, and visible focus states.

## Academic accuracy and resources

- Never invent curriculum details, subject names/codes, marks, credits, term structure, pass rules, learning outcomes, references, or practical work.
- Verify academic information against the applicable official institution or government curriculum. Record institution, curriculum title/version/date, and a working source link with the relevant content.
- Distinguish semester and annual structures and keep different universities/programmes separate. If a detail cannot be verified, label it as unverified or awaiting verification and link the official source when available.
- Never create fake PDF, examination, or YouTube URLs. Use genuine, relevant, legally accessible material. Clearly label search links as searches, and do not imply an unreviewed search result is vetted. Respect copyright; link to lawful materials instead of copying protected works.

## Implementation and data

- Reuse existing search, navigation, programme and subject structures, expand/collapse controls, localStorage helpers, pinned-programme feature, bookmarks, and progress tracking where applicable.
- Use namespaced, versioned localStorage keys and handle blocked or full storage safely. Do not overwrite or migrate user data without a clear, compatible migration.
- Escape untrusted text before inserting HTML. Prefer DOM text APIs for dynamic content and use semantic controls with labels and keyboard support.
- Keep relative asset paths and avoid root-relative assumptions that could break GitHub Pages project-site deployments.

## Verification

- For code changes, add or update a focused regression check before implementation when practical, then run node --test tests/index.test.cjs.
- Use browser, responsive, accessibility, and link checks when the environment supports them. Report checks that could not be run; do not claim browser verification based only on static tests.
- Recheck all affected education pathways and existing interactions after changes. Do not change unrelated content to make a test pass.

## Project skills

- .agents/skills/syllabuslaya-frontend/SKILL.md
- .agents/skills/syllabuslaya-ui-ux/SKILL.md
- .agents/skills/syllabuslaya-search/SKILL.md
- .agents/skills/syllabuslaya-curriculum/SKILL.md
- .agents/skills/syllabuslaya-resource-manager/SKILL.md
- .agents/skills/syllabuslaya-testing/SKILL.md
