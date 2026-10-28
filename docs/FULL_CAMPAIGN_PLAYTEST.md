# Fresh campaign and recovery audit — 28 October 2026

The requested full campaign was completed through the visible game UI: **50/50 earned island wins**, wrong-object/replacement/Cancel/removal/Undo checks on every island, followed by **50/50 replayed movement-recovery checks**. The final TypeScript/Vite build passes, **98 pure tests pass**, and the two full browser passes recorded zero page/console errors.

This is agent-driven browser play and independent content/visual review, not a human novice study or a claim of enjoyment, learning gains, or exhaustive testing of every possible phrase. The UI playbook is handwritten from the displayed missions. It imports no authored solution-witness table. Browser evaluations inspect state; all object creation, selection, modification, placement, movement and completion use ordinary pointer/keyboard/touch controls. These two runners never call `advanceTime`, change the player, inject objects, or fabricate wins.

## What changed

- A misplaced useful object offers **Move**; an unsuitable property offers editing; missing components and named story objects lead to the appropriate creation/inspection action. Completed side stations no longer hide the missing named fan.
- Deleted required story objects have a visible recovery action, even after another creation. Recovery itself is undoable. Noun/count substitutions cannot erase a story object's identity.
- Preview keyboard Undo works. Free placement really returns to the selected station, keyboard movement stays within island bounds, and station buttons retain focus/announced selection.
- Feedback distinguishes actual missing support from width/mass/material failures. Multi-part delivery status distinguishes the carrier, wind and other stations. `light` cannot make an already light object heavier.
- The original task is readable inside all working panels. Plural-created instances have singular labels. Final-island width and upper-force limits are explicitly stated.
- Reading/pause/focus transitions preserve usable controls and audio. Losing support retains its shore-recovery explanation. Zero-force fans use a contact cue; partial useful batches retain placement instructions.
- Protected parcels no longer show falling rain below their cover. Illumination tasks expose the lamp/marker instead of hiding them behind a decorative tree. Landscape feedback leaves the objective and action button clear.

Independent reviews: [English and all 50 prompts](FULL_CAMPAIGN_ENGLISH_QA.md), [visual/input](FULL_CAMPAIGN_VISUAL_QA.md), [audio lifecycle](FULL_CAMPAIGN_AUDIO_QA.md).

## Played matrix

[Per-island results](full-campaign/level-results.md) and [full trace](full-campaign/results.json) record each earned completion and actual travel samples. Every island included:

1. Place an unlit lamp and verify that the task remains unsolved.
2. Preview a noun replacement and Cancel, retaining the exact original.
3. Confirm a different wrong noun, then Undo back to the exact original.
4. Remove and Undo; preview a move and Cancel.
5. Cancel a replacement preview with native Ctrl+Z.
6. Try a useful replacement/batch, Undo, retry, then physically travel to completion.

Required-original tasks additionally reject noun/count substitution, delete the original, perform another action, recover it, and undo recovery/removal. Where multiple originals exist, the wrong lookalike was also edited and rejected. Both relevant multi-component orders were used, including fans before carrier in island 30. Plural umbrellas, fans and sponges were placed individually.

The playthrough started in an empty isolated browser profile. An initial exploratory run earned 1–14, then stopped because the harness requested the wrong station name at 15. After correcting that test, a fresh pass earned 1–18; a second test-only cargo/ferry naming mistake stopped it at 19. The exact profile genuinely earned by that pass resumed at 19 and completed 19–50. These interruptions did not create wins or change game predicates. Island 19's raw log retains the repeated checks. The user's browser storage was never edited.

A late review disclosed existing numeric caps in island 50's mission and moved a landscape toast. The final build then passed a separate real-time island-50 replay with wrong carrier, wrong fan history, unlit-lamp editing, reading aboard, Undo aboard, shore recovery and completion. Final task, completion and touch captures below reflect that build; earlier trace text is retained as actually observed.

## Second pass and controls

[Replay/control results](full-campaign/controls-results.json) record all 50 correct solutions deliberately misplaced. Each became unsolved, offered Move, recovered through that action, undid back to the wrong location, then undid back to the original. Every replay also checked free-placement bounds, actual return to snap and cancellation. Eight additional numerical/material misconceptions were rejected and recovered by Undo.

Additional native checks passed: removing support mid-walk; map Escape during placement; focused-input shortcuts; pause focus/Tab/Escape; audio sliders; orbit; fullscreen entry/exit; actual browser tab/focus return at completion without duplicate loops or a repeated flourish; phone move/cancel/remove/Undo; landscape control hit tests. [Final exploratory results](full-campaign/final-results.json) add manual arrows stopping to idle, jump, notebook reading aboard, mid-voyage Undo, unsolved lighthouse feedback, an unsupported real word, useful partial-batch cancellation and an umbrella-to-bucket alternate solution.

## Visual evidence and final build

The lead inspected contact sheets and key full-size frames; the art reviewer individually opened all 50 ready frames and the dense/editor/responsive states. Updated island 17 and final island 50 are represented in the contact sheets. No remaining observed clipping, overlapping essential controls, hidden marker, or stuck recovery state remained in these checks.

[Islands 1–10](full-campaign/islands-01-10.jpg) · [11–20](full-campaign/islands-11-20.jpg) · [21–30](full-campaign/islands-21-30.jpg) · [31–40](full-campaign/islands-31-40.jpg) · [41–50](full-campaign/islands-41-50.jpg).

[Final task in editor](full-campaign/final-50-task-current.png) · [final completion](full-campaign/final-50-complete-current.png) · [phone task](full-campaign/phone-final-editor-current.png) · [landscape controls](full-campaign/landscape-final-tools-current.png) · [explained shore recovery](full-campaign/shore-recovery.png).

Commands: `npm test`, `npm run build`, `FULL_URL=http://127.0.0.1:4263 node tests/full-campaign-browser.mjs`, then `node tests/full-campaign-controls.mjs`. The optional `--resume-earned` reads only that runner's actually earned checkpoint. The required develop-web-game client also passed against the final static build; its canvas capture was opened and inspected. [Build hashes](full-campaign/build-hashes.json) identify the final bundle.

The existing Vite large-chunk warning remains informational. Native handheld/Safari performance, physical Hebrew keyboard hardware and platform voice availability were not established by desktop Chromium emulation. No new model/audio generation or production deployment was used.
