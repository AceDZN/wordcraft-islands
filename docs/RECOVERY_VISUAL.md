# Recovering from the wrong object

27October2026. Read-only diagnosis from the human's supplied22:39 app screenshot and current main.ts, flow.ts, world.ts and style.css. No runtime, model, Git or browser-state edits were made by this art pass. The screenshot shows campaign island2, a ladder across the rain parcel, the explorer beside the lighthouse, and the host ChatGPT composer covering the game's bottom-right controls.

## What the screenshot establishes

The island is visible and its mission is legible, but the recovery path is not. The primary action says to change the words, while the secondary object/notebook/undo controls occupy the region hidden by the composer. The notebook and inspector are also anchored to that same bottom-right region. The selected ladder has no clear world outline or persistent name badge. Its pale rails blend into the path and parcel surroundings.

The composer is outside the game's own DOM/stacking context. Increasing a game z-index cannot reliably raise controls over host chrome. Essential editing must stay accessible in the upper-left/left working area, without requiring the user to dismiss the composer.

## Source findings

1. **Thin-mesh picking turns a selection attempt into movement.** World.pick raycasts the actual item meshes only. A ladder's empty spaces do not intersect its rails/rungs, and a rope has a thin tube. If the ray misses, the canvas handler immediately calls walkTo. A near miss therefore sends the explorer away instead of explaining how to select the object.
2. **Wrong noun has no useful primary recovery.** nextAction returns revise whenever a failed chosen created object exists. openBook(true) opens property editing, but create rejects a different noun while edit=true. A ladder cannot become a rain cover through a coherent supported adjective. “Change the words” therefore leads into a mode that cannot express the required kind of revision.
3. **No direct remove/replace action is present.** The inspector currently offers property editing and movement. Undo exists only in the bottom-right toolbar; its visibility depends on history. A mistake should not require finding that toolbar or restarting the island.
4. **Distance is not the real blocker.** select(id) accepts an existing item from anywhere; no player-proximity test prevents editing the ladder while the explorer is at the lighthouse. The UI should make this remote editing capability visible.
5. **The goal remains visually inviting before the solution works.** The star is always gold and animated; readiness changes its scale/pulse. On island2 there is no gap, so freely walking to the lighthouse is physically possible while coverage remains0/1. This is valid exploration, but arriving there should clearly say that the parcel still needs protection.

## Recommended recovery layout

The lead's planned direct object strip below the objective is the appropriate anchor:

- Show the selected object's English phrase with a small recognisable icon and a clear selection treatment in the world.
- Keep four explicit actions visible: **שינוי תכונות**, **החלפת חפץ**, **הזזה**, **הסרה**. Use44px targets. Property edit preserves noun/identity; replacement starts a different noun in creation mode.
- Keep a visible **החפצים שלי · 1** selector at the objective so mesh precision is optional. The selector must show actual created/seeded objects, not correct-answer suggestions.
- Place notebook, inspector and placement editor at a stable left/top anchor. Avoid tying their essential actions to the bottom-right edge. Keep the secondary toolbar beside/above the primary dock in the lower-left region, as a convenience only.
- On narrow screens the current objective has max-height:32vh and overflow:auto. Appending the recovery strip at its end can hide it again. Put the actions outside the objective's scrolling body or make the strip sticky within the card; keep panel headers/actions reachable when long help or a keyboard is open.
- Keep selected-object actions available while the explorer is on either bank or beside the goal. Stop travel before beginning edit/move/replace/remove.

Replacement should be reversible and transactional: keep the old object until the new noun is accepted and placement is confirmed; cancellation restores it; one Undo restores the old object and its prior position. Remove should also create an Undo snapshot and clear the selection. Preserve source/identity semantics honestly: a newly created replacement must not silently inherit a seeded referent's identity or mastery evidence.

## Forgiving object selection

Keep precise mesh hits first. For thin spans, add a fallback in **CSS screen pixels**, not renderer/device pixels:

1. Project the actual rendered item's long-axis endpoints through its world matrix and camera, then into canvas.getBoundingClientRect coordinates. Use its visible group transform so a moved/carried/pop-animated object is picked where it is drawn.
2. Measure pointer-to-segment distance. For ladder/plank, include the projected half-width and around8px extra tolerance; for rope use a capsule roughly14px mouse /24px touch around its projected segment. Fill the ladder's negative space deliberately.
3. Choose the nearest eligible candidate, with the exact mesh hit taking precedence. Do not let a large generic box select distant/hidden props or make a dense group impossible to disambiguate. When ambiguous, expose the real-object list.
4. Hover/focus can show a restrained outline and phrase; tap selects. A failed selection attempt near an editable object should not immediately become a long walk request. Keep canvas empty-ground click-to-walk intact away from object hit areas.

A dedicated selection proxy around the ladder footprint is also reasonable. It must be distinct from physical success/collision predicates: making a prop easier to select does not enlarge its valid bridge span or rain coverage.

## Better feedback at the failed parcel

For this actual state, persistent feedback should describe the physical consequence: **החבילה עדיין נרטבת — הסולם לא יוצר מחסה. אפשר להחליף אותו או ליצור רעיון נוסף.** This explains the mismatch without labelling the English noun as wrong. A0/1 protected count near the objective makes the remaining need visible. A guided example may remain available as requested assistance; do not count a shown answer as unaided production.

At the lighthouse before readiness, display the unfinished parcel status or a quiet unavailable-goal treatment. Do not block harmless exploration or mark a win from location alone. After a valid cover is placed, the parcel/status should visibly change and the goal can become the current action.

## Required follow-up checks for the lead

Use the actual level2 state and the same embedded viewport/composer conditions:

- Place a ladder at the parcel, walk to the lighthouse, then recover without restarting and without bottom-right controls.
- Select the centre of the ladder opening and a rope several pixels off its tube; verify selection, not unintended walking. Repeat with touch.
- Replace ladder→umbrella, cancel a replacement, move it away/back, remove it, Undo, and confirm actual coverage/success each time.
- Check seeded identity levels so Replace cannot falsely retain a required old referent.
- Inspect desktop, phone and short-landscape with the editor open; no objective/editor/primary-action overlap, clipped actions or composer dependence.

This document proposes the visual/recovery fix. It does not claim the lead's subsequent implementation or browser playtest has already passed.
