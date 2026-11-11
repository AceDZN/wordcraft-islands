# Dynamic prop gameplay review — 11 November 2026

Independent art check against the frozen production preview at `http://127.0.0.1:4263/`. This scope covers the three new integrated Tripo models and their visible alternatives. The lead's full campaign runner covers the other campaign/game controls.

## QA inventory and method

- New tarp, tent and canoe must load with embedded textures, recognizable silhouettes and no model errors.
- Tarp and tent must visibly cover the parcel and satisfy the same rain objective.
- Canoe must float as the actual passenger carrier, with the courier aligned to its deck, and complete a real crossing.
- Creating, replacing, removing and Undo must preserve the new prop's state and appearance.
- Phone 390×844 must retain a readable tarp silhouette and reachable create/place/travel controls.

Used normal notebook input, target/place, edit/replace, travel, remove and Undo buttons. Started with fresh isolated browser contexts and explicit built-in links to levels2 and6; did not inject wins, saved completion or game state. Real requestAnimationFrame travel, no `advanceTime`.

## Observed results

- **Level2:** typed `a tarp`, placed at parcel, confirmed `covered:1/1` and actual blue overhead shelter. Replaced the same created object with `a tent`; parcel stayed dry and the imported striped tent appeared grounded. Normal travel walked to the lighthouse and completed the island.
- **Level6:** typed `a canoe`, placed at mooring; model was an empty narrow wooden hull with teal stripe and bench seats. Boarding used this created model as the moving passenger vessel. Idle rider feet appeared aligned to the interior deck; no detached or hovering actor observed. Real crossing and walk completed the island.
- All **8** required models loaded without loader/page errors. Result and earned2/6 wins saved in `dynamic-gameplay-result.json`.
- **Phone390×844:** native touch notebook/create/place produced a dry parcel and a visible, recognizable tarp. The create/place/travel controls were reachable. Remove changed ready true→false; Undo restored true. No page scroll (`390×844` document dimensions), no overlapping controls or clipped prop. The phone camera crops peripheral world scenery/lighthouse, while the direct travel action remains reachable; no claim that the full world fits a portrait phone.
- No missing textures, extreme model distortion, wrong-axis canoe, floating canopy poles or visibly misaligned passenger found in the reviewed states.

## Actual reviewed captures

- `dynamic-gameplay-tarp.png` — desktop rain alternative.
- `dynamic-gameplay-tent.png` — same object's alternate shelter after edit.
- `dynamic-gameplay-canoe.png` — empty canoe at mooring.
- `dynamic-gameplay-canoe-riding.png` — real courier aboard moving canoe.
- `dynamic-gameplay-tarp-phone.png` — native touch creation in phone viewport.

## Renderer refinement — resolved

The current canoe rotates the imported holder before nonuniform scale. Because Three.js scale uses local axes, its X/Z dimensions are slightly exchanged from the intended world-space fit: approximately3.07×1.37m for a3.5×1.2m spec. This is not a badly distorted silhouette and did not block boarding/crossing. A parent scale group around the rotated model would make the visual bound match the semantic proxy exactly. Reported to lead; lead corrected the renderer using an outer sizing group. No source edit in this independent pass.

The first headed persistent-browser attempt exceeded30s during other campaign tests and reset the REPL. It produced no result and is excluded. A bounded headless hardware-rendering context recovered and completed the checks above. Playwright contexts and the successful browser were explicitly closed.


## Final corrected-build review and release poster

Rechecked the final frozen4263 build after the outer-size-group correction. At1600×900, the canoe is visibly longer and slimmer, on the expected X axis. Created/placed it through the notebook, boarded with the normal travel control, inspected the courier standing with grounded feet in the moving hull, and completed level6 again through real-time movement. All8 models loaded and zero page errors. On-vessel public `item.screen` AABB was205.69×137.51pixels; semantic dimensions remain3.5×1.2m. No private scene/renderer inspection was used to assert actual world bounds.

Final captures: `dynamic-gameplay-canoe-final.png`, `dynamic-gameplay-canoe-riding-final.png`. Full final states/method/errors: `dynamic-gameplay-final.json`.

**Workbook poster:** `dynamic-poster.png` is an exact1600×900 full-viewport screenshot from the same final build, level2 with the Tripo tarp placed and the parcel dry/ready. No crop, compositing, resize, image manipulation or generated imagery. The entire relevant UI/canopy/player/lighthouse was visually inspected in this actual frame. This is gameplay evidence, distinct from `dynamic-tripo-*` workspace screenshots.

Successful browser/context explicitly closed after final review. ASSETS.md was intentionally not edited during the release freeze.
