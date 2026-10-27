# First-release QA log (historical)

The human subsequently rejected the play feel and controls. These functional results did not establish usability or enjoyment. The current revision is reviewed in docs/UX_REVIEW.md; earlier screenshots and runner assumptions remain historical evidence, not a claim that the user experience was good.

Date: 27 October 2026. Reviewer: English/QA helper. This log distinguishes unit simulation, actual browser input and listening. No learning gains or subjective fun claims are inferred from automated tests.

## Initial review

Read COMMON.md, BUILD_HANDOFF.md, GRADES.md, COVERAGE.md, progress.md and all nine listed curriculum snapshots. Required three tracks and nine authored puzzles remain acceptance requirements. Initial semantic acceptance is recorded in CURRICULUM.md.

## Original acceptance checklist (results below)

- Parser/article/count/alias/support flags and physical predicate unit tests.
- All three grade paths including unaided changed-context transfers.
- Wrong property consequence and recovery, alternative solution, undo.
- Hint and spelling-help evidence.
- Focused typing without movement/fullscreen shortcuts; keyboard-only creation/placement.
- Pause/settings/restart and actual audio context behavior.
- Mobile touch, resize/orientation and cancellation.
- Real gameplay screenshot inspection, model loading and console errors.

Initial status before implementation: no runtime verification had been performed. Final results are recorded below.

## Semantic tests, first run

Command: `npm test` (TypeScript via `tsx --test tests/*.test.ts`). Result: 26 tests, 23 pass, 3 fail. Runtime fixtures for all nine levels have at least one passing pure-predicate solution; this does not establish browser completion.

Defects sent to lead:

1. `the umbrellas` models count1, inconsistent with plural.
2. Order evidence is true with no/tiny modifier sequence; require at least two modifiers.
3. Medicine mission can be bypassed by normal medicine crate plus unrelated heavy bucket. Mission requires the identified crate itself to become heavier than6.

Test file: `tests/semantic.test.ts`. Other checks cover article sound after an adjective, plural agreement, aliases, accepted assistance flags, shorthand, unknown-word limits, proposed spelling help, physical alternatives, support/orientation, actual separated coverage, strict comparative boundaries, stable history, cargo size/material, fan identity/direction and the two-condition transfer.

## Semantic retest and first browser execution

After lead fixes, `npm test` passed all 26 tests (0 failures). The three earlier failures are resolved. Order evidence additionally refuses duplicate/same-category modifiers; definite plural defaults do not claim an explicitly supplied numeric count.

Actual browser command: `node docs/qa-browser.mjs` using local Playwright Chromium with SwiftShader, 1440×900. Inputs used the visible notebook, form, Enter placement, Undo and held movement keys; no world-state injection or win mutation occurred. `advanceTime` advanced simulation while keys were held.

Verified in this first run:

- Focused input containing WASD/F and Hebrew text left player position/jump unchanged and did not enter fullscreen.
- Short plank physically failed the crossing predicate, Undo removed it, ordinary plank provided support, walking reached `mode: complete` at the lighthouse.
- All five model loads reported success (`courier`, `boat`, `balloon`, `lamp`, `crate`), with no model errors or browser console/page errors.
- Actual audio reported running after Start, 17 buffers loaded, 3 loops, nonzero RMS and action cues; completion paused audio. This is playback-state evidence, not an audition of musical quality.
- Opened and visually inspected `docs/qa-captures/g7-crossing-ready.png`: readable playfield, spanning plank and grounded courier. Reported excessive blank water/world scale and faint tiny world labels to lead for polish.

The first browser run ended at a full-page screenshot timeout after the successful G7 crossing. The completed state is retained in `docs/qa-captures/summary.json`; that timeout is not a gameplay failure. Other levels were not yet exercised by that run. Lead was still changing visuals/HMR, so browser work paused until a stable build. The test runner now saves state before captures and has a canvas-image fallback.

Further code-review defects sent to lead: pause movement during inspection/teaching; mark explicit corrected-form feedback as assistance; require reachable departure-dock proximity for ferry use; display sail/raft force consequence. Lead reports these fixed; independent retest remains pending.

## Full campaign browser pass

Command: `node docs/qa-browser.mjs`. All nine authored puzzles were completed by entering phrases, placing/modifying tangible objects and moving/using the resulting route. `g9-transfer-complete.json` contains the completed IDs for all nine, with no hint/dictionary/translation support in the three transfer routes. G8 transfer includes a wrong referent followed by an unaided correction, not a first-try comprehension claim.

| Puzzle | Actual action and checked result |
| --- | --- |
| g7-crossing | Short plank fails; Undo; ordinary plank bridges; explorer walks to lighthouse. |
| g7-rain | Type `two umbrellas`, place two separate instances at the two parcels; actual covered count2; walk to lighthouse. |
| g7-inlet | Type/place `a boat`; approach dock; E ferries explorer; walk to lighthouse; no hints. |
| g8-length | Short plank fails; Undo; `a long ladder` spans the longer gap; walk across. |
| g8-weight | Large crate5.2 kg fails; Undo; heavy bucket12 kg operates plate/bridge; walk across. |
| g8-history | Select garden crate via inspector, modify heavy and place: fails identity. Select medicine crate, modify heavy and place: succeeds; bridge/walk completion. |
| g9-cargo | Large metal crate sinks/fails; Undo; large wooden crate floats/has capacity10; ferry completion. |
| g9-power | Modify/place Fan B as powerful: force exists but identity fails. Modify/place Fan A as powerful: succeeds; ferry completion. |
| g9-storm | Create large wooden boat at supply berth; partial solution remains incomplete. Modify tree fan as powerful and place at wind dock: both predicates pass; ferry completion without hints. |

Hint/spelling path was also exercised: misspelled `a plnak` remains in the notebook; accepting suggestion creates an assisted phrase with spelling evidence false. `a umbrella` receives precise feedback; corrected `an umbrella` is created with article evidence false. Captures: `spelling-assisted`, `article-correction-assisted`.

No console/page errors were collected. Five local model names loaded successfully. Actual screenshots inspected from final campaign: `g7-crossing-ready`, `g7-rain-ready`, `g8-history-ready`, `g9-transfer-ready`, `g9-transfer-complete`. The improved scene shows larger terraces, legible labels, rain covers, a real loaded boat, sail and fan geometry, and the pressure bridge. This is a simpler low-poly scene than the generated target; no screenshot is represented as target artwork.

This run stopped after all campaign assertions at a test expectation for an RTL range: ArrowRight at minimum0 stays0; ArrowLeft increments. That was a harness expectation error. Separate control retest uses native RTL direction. Subsequent lead fixes corrected support endpoints and narrow traversal width, preserved order-warning feedback and made assistance/completion counts more precise. All 30 semantic tests pass after the support fixes; control retest covers the centered bridge after that change.

## Desktop control retest and mobile defect

Command: `node docs/qa-controls.mjs` after the stable support/evidence fixes. Passed: keyboard-only Enter Start → N → typed phrase → Enter creation/placement → held D crossing completion; inspection/teaching movement pause; music/master/voice ranges including RTL increment direction; pause movement and audio pause/resume; order warning visibly retained; R rotation; Esc cancellation; native drag release and pointercancel leaving placement uncommitted; restart clears objects, preserves settings and retains exactly3 audio loops; jump returns to ground.

Headless Chromium tab creation did not produce a native hidden/blur state (`hidden:false`, `paused:false`), so this does not verify an actual OS tab-focus transition. F was initially queried before fullscreen request settlement; a bounded wait is used in the final targeted retest. Mobile navigation in a concurrent-render run exceeded the default load-event wait; mobile-only retest uses DOMContentLoaded and one active page.

Actual mobile-only command: `node docs/qa-mobile.mjs` (390×844, touch-enabled Chromium). Reproduced a product defect without forced taps: `#touch` intercepts the notebook `#create` button. The input-focus Hebrew/WASD isolation assertion passed, but touch creation could not continue. Precise Playwright interception log was sent to lead. Mobile pass remains pending this stacking fix; no console/page errors occurred.

## Final independent mobile and assistance retest

Command: `node docs/qa-mobile.mjs`, one active page at a time, Chromium touch emulation at390×844 and844×390. Result: all mobile/assistance assertions passed; no console/page errors. The prior touch-overlay defect is fixed.

- Native taps create and place two umbrellas; coverage becomes2.
- Native CDP touchStart/touchEnd on directional controls moves the explorer; touchCancel releases movement and a further simulation step leaves position unchanged.
- Hebrew/WASD/F editing and ArrowRight in the focused phrase input preserve player position.
- Native touch boat creation/placement, approach to dock, Use/E button and continued directional movement reach a complete ferry transfer.
- Portrait and landscape have no horizontal document overflow. Opened and inspected `mobile-touch-portrait.png` and `mobile-touch-landscape.png`; controls, notebook access and created cover objects remain visible. Landscape has a compact playfield and denser HUD; this is browser emulation, not a physical-phone usability/performance study.
- Manually retyping an already-visible spelling suggestion (without clicking its button) records assisted=true and spelling=false.
- Manually retyping the modeled adjective order after its warning records assisted=true and order=false.

The settled fullscreen test found a real Esc issue: F entered fullscreen, but Esc opened pause without leaving fullscreen. Lead applied an explicit exit/return fix after this run; root owns the final browser regression. This independent log does not mark that final patch browser-verified until its result is appended.

Final independent semantic command: `npm test` — **32/32 pass, 0 failures**. Added tests verify modeled `a plank` / `an umbrella` / `a large umbrella` / `an unlit lamp` and plural models without article/count production credit, plus distinct modifier meanings rather than duplicate/synonymous token counting.

## Aggregate status and limits

Nine authored puzzles, three different grade tracks and all three transfer routes have actual UI completion evidence. Failure/recovery, hint/spelling assistance, keyboard-only core interaction, reading pause, settings/pause/restart, rotation, drag/touch cancellation and touch ferry completion were exercised. Pure tests separately cover alternative solutions, paired semantic fixtures and the post-review endpoint/width rules. Captures and states are in `docs/qa-captures`; the campaign ends with all nine completed IDs in `g9-transfer-complete.json`.

Later replay mirroring/inventory-order variation and the final fullscreen fix are root-owned targeted regressions. Browser captures preceding completion-count refinements retain the old conservative single-phrase metric; raw counts remain in their JSON. Later keyboard-only capture contains the new `unaidedSolution` and `singlePhraseFirstAttemptUnaided` fields. A two-object solution can be unaided without being a single-phrase solution.

No human musical audition, physical Hebrew hardware keyboard, real handheld browser performance or native OS tab-focus claim comes from this independent QA. Actual playback state and gain/pause behavior were checked; the dedicated audio report covers composition, waveform and further audio tests. No learning gains, retained mastery, full chapter completion, comparative-form production or relative-clause production are claimed.

## Lead final regression

`node docs/playable-loop/regression.mjs` passed after the final fixes, with zero page errors. Actual UI/key actions verified: F enters fullscreen, Escape explicitly exits without opening pause; Escape first closes a pause overlay above the open notebook; a manual retype after a displayed spelling suggestion remains assisted; unusual adjective-order feedback stays visible and later copied order remains assisted; a two-component grade-9 transfer solution completes with two phrases, zero hints/undo/rejected editor entries and `unaidedSolution:true`, with accurate count wording. Screenshot/state: docs/playable-loop/g9-final-complete.{png,json} (visually inspected by lead).

The same run reloaded the grade-8 history puzzle and verified mirrored source-object Z locations, unchanged origin history, alternating layoutVariant, and reversed inspector candidate order. This varies answer location and irrelevant cosmetics without changing the semantic referent.

Final static preview skill-client pass: http://localhost:4263, Enter start plus movement burst, all5 models and17 audio assets/3loops running, no page/console error file; actual canvas capture inspected. Early preview404 raced a build replacing dist and was discarded; the subsequent post-build probe was clean. Two early Start click-selector stability timeouts were avoided by exercising the implemented keyboard Enter start. These are recorded as test-harness history, not claimed as gameplay passes.

Lead keyboard-layout check: `node docs/keyboard-layout-qa.mjs` passed physical KeyN/KeyD handling with synthetic Hebrew key values, key release, and no movement/fullscreen interception inside the focused input. Actual registered handlers were exercised. This does not claim physical Hebrew hardware testing. Final static build passes TypeScript/Vite; the unminified source remains separate from the built bundle.
