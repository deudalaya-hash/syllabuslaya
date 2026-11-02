---
name: syllabuslaya-search
description: Build, debug, or extend the unified Syllabusलय education search, including programme, subject, code, unit, topic, and subtopic indexing, suggestions, filters, and direct navigation.
---

# Syllabusलय Search

## Search data and behavior

- Inspect collectSearchResults, flattenTopicText, PROGS, EDU_GROUPS, renderSearchSuggestions, selectSearchResult, and direct-routing helpers before changing search.
- Reuse the existing curriculum data as the source of truth. Do not add search-only invented subjects or curriculum results.
- Search programme aliases, names, subject codes/names, education levels, terms, and nested topic text. Keep result descriptions precise: show level, programme, semester/year, subject/code, and matching topic when available.
- Let a result open the relevant category, programme, semester/year, subject, and matched topic directly.
- Keep the single homepage search bar and category toggle integrated in the existing control. Keep keyboard support for Enter, arrows, Escape, clear, and focus behavior.

## Safety and performance

- Treat query strings as plain text; normalize Unicode/case without modifying stored curriculum text.
- Render result labels using textContent or escaped template values.
- Keep indexing local and fast for the current static data. Avoid network search or new dependencies unless explicitly requested.
- Distinguish actual matching resources from external search links; label search links as searches.

## Verification

- Test empty suggestions, programme aliases, subject name/code, nested topic, level filtering if present, no-result state, keyboard behavior, and direct navigation.
- Run node --test tests/index.test.cjs after search changes.
