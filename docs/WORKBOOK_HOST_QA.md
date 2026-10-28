# Workbook host integration

Wordcraft Islands keeps its standalone50-island campaign and ships as an immutable versioned bundle in Workbook's existing English Games app. The catalog owns the game card,50 level links and selected existing lesson links; no new service or backend is required.

`?level=1..50` opens that explicit island ahead of saved progress. Malformed/duplicate parameters preserve ordinary saved entry. An explicit lesson entry and its genuinely earned next island are available for the current visit, including in the map, without unlocking or completing preceding islands. Winning a linked island records only that real win. Ordinary no-query visits still use the saved campaign frontier.

The version1 iframe bridge posts to the exact validated Workbook/local or same-origin Vercel-preview parent. Standalone visits send nothing. Ready follows all five required models and an actual render; entries/completions queue behind ready. Each actual island entry emits start once, actual victory emits completion once, and Restart/replay can begin a new attempt. No stars, language score or mastery is invented. Duration counts active simulation, excluding editor/placement/help/modal/background time. Asset URLs remain relative to the versioned index.

## Observed verification

- `tests/workbook-browser.mjs` passed all50 fresh iframe links at a nested versioned local mount. Every link opened its requested island, loaded all five models, retained0 prior wins/frontier1, and emitted exactly ready→start with the correct level.
- Actual first-island wrong-object/replacement/Undo/travel passed. Placement alone emitted no completion. Restart/replay and Next retained event ordering without duplicate ready messages.
- A profile with genuinely earned island1 opened linked50. Its map exposed only1,2 and50. Actual vessel, named fan, key and lamp actions followed by travel earned50, leaving exactly two wins, frontier2 and unfinished campaign state. Editor waiting did not accrue duration. A duplicate level parameter preserved ordinary saved island2 and sent no false start.
- Seven focused protocol/progress tests passed, including standalone silence, exact parent envelope, deceptive-parent rejection and sparse real wins. The independent built-asset test checks the actual Vite entry/font/audio/model URLs on a server exposing only the nested mount.

[Local iframe trace](workbook/local-bridge-results.json). Public-release and actual Workbook-shell checks are recorded with the app's release ledger after upload; this local fixture alone does not establish a live deployment. Earlier full50 gameplay and recovery evidence remains in [FULL_CAMPAIGN_PLAYTEST.md](FULL_CAMPAIGN_PLAYTEST.md).
