# Wrong-object recovery QA

Status: **PASSED** on the final development build at `http://127.0.0.1:5263` on 27 October 2026. The exact ladder-to-umbrella recovery and the separate keyboard defect were reproduced before correction, then retested successfully.

This focused review follows the reported level 2 failure: a player places a ladder over the rain parcel, walks to the lighthouse, and tries to change the ladder into an umbrella. It is separate from the earlier campaign and usability passes.

## Baseline reproduced

On 27 October 2026, `node tests/recovery-browser.mjs --baseline` earned level 2 by completing level 1 through the UI, then used native pointer events and normal editor controls. `advanceTime` advanced travel after those inputs; it did not create objects, select levels, or mark completion.

| Checkpoint | Observed result |
| --- | --- |
| Create and place `a ladder` at the parcel | Selected `created-2`; `ready: false`; `covered: 0` |
| Click the lighthouse ground | Courier reached approximately `(6.700, 0.500)`; level remained unsolved and in exploration mode |
| Click the ladder rail | Object inspector opened with the ladder selected |
| Close inspection and use the primary revise action | Editor opened with `a ladder` prefilled |
| Enter `an umbrella` and submit | Editor remained open; original ladder remained; feedback instructed the player to close the editor and open a new notebook |

There were no page or console errors. The baseline browser closed after the run.

The concrete recovery defect was the mismatch between the offered revise action and the universal noun-change rejection. Walking across this rain courtyard was possible because it has no water gap; reaching the lighthouse did not satisfy the rain predicate. Visual goal and parcel feedback need to distinguish arrival from solving the task.

## Pure edit-policy checks

`npx tsx --test tests/recovery.test.ts`: **11 passed, 0 failed** against `prepareObjectEdit` and the level 2 action/predicate contract.

- Player-created objects can change noun and explicitly requested quantity.
- The offered replacement action can turn the actual level 2 ladder failure into a physically valid umbrella solution.
- Canonical aliases such as `box` and `crate` retain the same noun type.
- Authored story objects reject noun replacement and multiplication, while allowing property changes.
- Preparing an edit mutates neither the live item nor the parsed specification.
- Prefilled article and spelling receive no new production credit. Unchanged modifiers and power-family words receive no repeated credit; a changed power word remains observable evidence.

These tests cover edit policy and the action/predicate contract. Transaction preservation, cancel, undo, object picking, keyboard activation, and completion are covered by the separate browser run below.

## Fixed-build browser regression

The first fixed-build run passed the wrong-object message, native ladder picking, replacement preview with the original object still present, replacement cancel, move cancel, and Delete followed by Undo.

It then found a separate keyboard defect: Space on the focused inventory object button was intercepted by global movement handling. The inspector closed instead of activating the button. The browser closed after reporting this failure. The retained regression now asserts this step immediately, before attempting to type into a hidden editor.

The final `node tests/recovery-browser.mjs` run **passed with exit 0, 15 retained checkpoints, and no page or console errors**. It used headed Chromium with native GPU rendering, a fresh ephemeral browser context, a 1200 × 826 viewport, and ordinary pointer/keyboard actions. No forced clicks, injected wins, player-position writes, or debug unlocks were used. Travel advanced through the normal `advanceTime` simulation hook after UI input.

| Final check | Result |
| --- | --- |
| Wrong ladder over level 2 parcel | Persistent 0/1 dry status and an explicit replacement action explain the rain mismatch |
| Walk to lighthouse before solving | Courier can explore the continuous courtyard; arrival leaves the task unsolved |
| Native pointer pick on ladder | Opens inspection and selects the actual object |
| Replace ladder with umbrella | Enters placement while the original ladder remains live until confirmation |
| Cancel replacement or an arrow-adjusted move | Restores the complete original object and its placement |
| Delete player-created object, then Undo | Restores the original ladder |
| Enter inventory; Space on object; Enter on Modify | Activates the focused controls and opens the editor, without triggering movement |
| Place umbrella; keyboard Ctrl+Z | Exactly one object remains; Undo restores ladder and 0/1 coverage |
| Correct ladder while already at lighthouse | Place updates coverage to 1/1 while leaving the game in exploration mode; explicit “Complete island” action finishes level 2 without a restart |
| Edit one instance from `two umbrellas` | Editor prefills singular `an umbrella`; replacement preview contains one instance; Cancel preserves both original objects |
| Authored dock crate: change noun or multiply | Both requests are rejected; original story object remains unchanged |
| Authored dock crate: Delete then Undo | Restores the exact original object, including its ID and history |
| Authored editor: choose “New creation,” then Cancel | New-object branch works without replacing or losing the story crate |
| Change story crate to `a light crate` | Preserves `dock-crate` and its origin, satisfies level 13; Undo restores the heavy original; repeating the property change completes the island |

The run earned levels 1–13 in order. Levels 3–12 used authored witness actions only to reach the earliest story-object fixture; this is navigation for transaction testing, not an independent campaign-solvability claim. Every browser used for this review was closed after its run.

## Host-composer and visual checks

The final run placed an opaque, fixed **640 × 150** simulated host composer in the bottom-right corner before testing level 2. Native hit tests confirmed the centers of Edit/Replace, Move, and Remove remained reachable to its left; the regression then used those controls normally.

Four screenshots were saved under `work/recovery/` and visually inspected:

- `wrong-ladder.png`: 0/1 coverage, explicit mismatch, selected ladder, and all three object tools remain visible.
- `editor-layout.png`: the field, confirm-change button, and new-creation branch fit on the left beside the composer.
- `replacement-preview.png`: ghost umbrella and original ladder are both visible; Place and Cancel remain accessible.
- `corrected-at-lighthouse.png`: 1/1 coverage and the explicit completion action remain visible while editing is still available.

The simulated composer partly covers the transient center-bottom feedback toast. The same actionable rain mismatch and completion instruction remain visible in the persistent left objective and primary action, so this did not block recovery in the tested desktop layout.

## Limits

This is a focused regression for recoverability and identity protection. It does not replace a fresh learner study, prove enjoyment, or establish curriculum mastery. A valid physical solution and independent language production remain separate observations.

## Final root layout checks

`node docs/recovery/layout-check.mjs` passed desktop 1200×826, touch 390×844 and landscape 844×390. Edit/replace, move, remove, primary action, notebook, level map, settings and pause passed native hit tests. Switching from an open editor to inventory closes the editor. Portrait has no stale toast over the editor title. Landscape controls do not cover the objective or each other; touch ladder→umbrella placement and completion passed. Zero page errors. Captures under docs/recovery were actually opened and inspected. These are separate from the independent 15-checkpoint transaction/identity regression above.

Final `npm test`: 80/80; `npm run build`: passed. The existing skill client ran after gameplay integration (headed), and its latest canvas screenshot was inspected. This fixes the reported recovery path; automated assertions do not establish subjective enjoyment.
