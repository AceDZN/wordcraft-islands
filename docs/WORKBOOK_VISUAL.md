# Workbook catalog poster

Prepared 28 October 2026 for the Workbook English games catalog. The poster is a packaged **actual gameplay screenshot**, not concept art or a generated scene.

## Source and selection

- Source: `work/full-campaign/20-ready.png`, 1280 × 826 PNG.
- State: island 20, “The rain beacon”, during the lead's actual campaign playthrough. Both parcels are covered, a bright lamp illuminates the cave marker, and the courier, objective, selected-object actions, primary action and toolbar are visible.
- Source SHA-256: `8daf1eafe409b333d660dc3ed16cae6626034f439efbbc3aaea73e162e3f7720`.

Island 20 was chosen over the final-island editor capture because it shows the populated world without an editor obscuring it. Its English task also matches the final content. The older raw island 50 ready capture predates the later disclosure of its width and force caps.

## Exact framing and encoding

- Output: `work/workbook/poster.jpg`, 1280 × 720 (16:9), 149,184 bytes.
- The **entire source frame** is retained. No crop, object removal, HUD removal, new labels or invented scenery.
- Proportional Lanczos fit to 1116 × 720, centered at x82/y0. Integer pixel rounding is the only aspect-ratio approximation.
- Left/right padding: 82 pixels each, solid RGB(92, 184, 167), sampled from the source's top-right water background. This is explicit framing, not generated extension of the island.
- JPEG quality 91, full chroma resolution (4:4:4), optimized progressive encoding.
- Output SHA-256: `575a1f936ff51f9091495ac0399c8570e59558139338f26bb5bd861f52e71be4`.

A 16:9 crop of the original would cut either the top branding/navigation or the bottom recovery toolbar. The proportional fit preserves those controls and the complete English mission. The catalog can display this file at 16:9 without further cropping or stretching.

## Inspection and ownership

The source and encoded JPEG were opened and visually inspected at original detail. The island silhouette, two covers, lamp, courier, English objective and all visible HUD actions remain intact; no editor overlay covers the scene. Existing game asset provenance remains documented in `ASSETS.md` and `ASSET_SEARCH.md`. No new art generation, Tripo generation, browser session, runtime change or Git operation was used for this packaging pass.

The JPEG lives in the ignored work directory for the lead to attach to the release. This document records the exact source and transformation for provenance. The lead owns host integration and release verification.
