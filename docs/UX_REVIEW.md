# UX review — flow, controls and visible cause

## Trigger and method

The human reports that the game is confusing, boring, too hard because of flow/controls, and that running looks strange. These are product failures even though the nine puzzle predicates and earlier UI scripts passed.

Reviewer owns this document and `tests/ux*`; no runtime or Git changes. Initial review is read-only. Revised-build browser review will begin only when the lead declares it ready. The reviewer already knows the puzzles from earlier semantic QA, so this is not an unbiased first-time learner study. It can establish whether visible affordances and ordinary inputs work without hidden state manipulation; it cannot establish that children find the game fun or easy.

## Baseline friction, prioritized

| Priority | Observed implementation / prior behavior | Effect on a novice | Acceptance for revision |
| --- | --- | --- | --- |
| P0 | Start offers a generic promise and a control list; the actual guided word demonstration lives behind a small optional Help button. Notebook starts with an empty `a …` field and a large closed catalog. | Learner must discover the interface, noun and finite grammar at once before any payoff. | First guided puzzle states one concrete action and gives a small practical word demonstration. Shown phrases count as assistance. One primary next action is obvious. |
| P0 | `pointermove` changes preview position whenever pointer passes over the canvas. The newly created object begins at a valid anchor. | Moving toward Confirm can silently destroy a good placement. Previous QA avoided the problem by pressing Enter. | Default placement is stable at a named target; pointer movement without an explicit placement action does not move it. Free placement can be an explicit advanced mode. |
| P0 | A solved object does not complete the physical goal: every level still demands walking to a small far-bank star. Global success feedback says “go to the star, or E” for every puzzle kind. | Learner cannot tell whether the word worked, what remains, or why a correct shelter still demands a walk. | Visible physical result plus a single contextual next action. If the action is crossing/sailing, it uses the real valid route/predicate. No hidden completion action or contradictory E instruction. |
| P0 | Keys use world X/Z under an angled camera; orbit changes the screen mapping. Starting player Z=.5 is only .02m inside the ordinary plank's .52m support half-width. | Familiar arrows feel diagonal or blocked; trivial steering precision overwhelms the language task. | Ordinary pointer destination action or clearly camera-relative movement; forgiving route alignment. Reading/typing blocks locomotion. The initial crossing is achievable without memorizing coordinates. |
| P1 | Footer exposes notebook, ambiguous Use/sail, objects, Undo, orbit buttons, WASD/Space/F. Objective, feedback, inventory and notebook occupy different screen areas. | User must build a model of many modes before knowing the next action. | Primary action changes with state. Advanced movement/orbit/evidence remains available without competing with the current task. Mode transitions explain themselves in plain Hebrew. |
| P1 | E inspects whichever object is closest in the whole list when no ferry action fires; there is no distance limit for that selection. | “Use” can open an inspector instead of doing what the player expects. | Contextual label and affordance match the actual action. Disabled/unavailable actions explain the necessary condition visibly. |
| P1 | Inspector is a dropdown of similar phrases. Modification clears the input; it demands retyping the full noun phrase even when the target lesson is changing one property. Inspector shows all mass/length/capacity/force/coverage/material fields. | Selection and clerical re-entry compete with the identifying-clause/property reasoning. | Clickable objects plus a clearly named selected object/history. Show relevant properties first. A supplied noun scaffold must not earn noun/article retrieval credit. |
| P1 | Failure uses generic support math, and feedback can be far below the affected object. A correct creation can look like a rejected action if it sinks. | Cause and recovery are difficult to connect. | The short plank visibly fails at the missing end; insufficient mass/material/force points to the relevant local consequence and a clear revise action. |
| P1 | Most authored tasks use the same two-bank view; completion foregrounds counts and evidence in a large modal. | Correct input feels like a form submission followed by traversal rather than a discovered solution. | Brief physical payoff, visible progress and a clear next problem. Learning metadata belongs in optional detail; no false mastery claim. Keep all nine semantic puzzles. |

## Concrete animation findings

Read-only code and GLB inspection identified causes, rather than treating “strange running” as a subjective asset-quality issue:

- `World.render` forces `player.rotation.y = Math.PI/2` for any requested movement, regardless of actual direction.
- `moving` is based on requested dx/dz even when collision prevents displacement. The character can run in place at the bank.
- Ferry progress sets moving=true, so the explorer runs while being carried.
- `animatePlayer` finds the first clip whose name contains `jump`. Actual clip order is `idle`, `run`, `jump_down`, `jump`, so ascent selects `jump_down`.
- Decoded the local meshopt-compressed GLB without modifying it. Idle hip translation Z is about0.033; run hip Z is about0.582, a constant offset of about0.55 model units. This is an idle/run positional lurch, not accumulated root-motion drift.
- `jump_down` hip Y ranges about0.214–1.124, while the controller separately adds its jump trajectory. Two sources of vertical displacement can compound.

Acceptance: face actual displacement, remain idle when blocked or carried, normalize clip root offsets where needed, and select intended clips exactly. Observe start/stop/reverse/diagonal/blocked movement in real time. A still screenshot or a final coordinate assertion cannot establish animation quality.

## Revised-build play protocol

Use the visible UI as the guide. Do not consult source solution strings during play, click hidden controls, force taps through overlays, inject a win state, or replace first-pass real-time movement with `advanceTime`. The reviewer knows prior answers, so record that bias.

1. Cold start: identify what to do next from the screen; attempt the first crossing with ordinary pointer input. Record each uncertainty or recovery and the number of action transitions before a visible payoff.
2. Deliberately move the pointer across the world while heading to placement controls. Confirm that a snapped preview does not move accidentally.
3. Try a wrong physical property and follow only visible recovery actions. Verify that the error is understandable without reading a long help panel.
4. Try one later identification/modification task and the two-condition grade9 transfer. Distinguish language reasoning from interface chores.
5. Observe live animation for movement start, stop, reverse, diagonal direction, blocked movement and being carried; inspect input traces alongside video/captures.
6. Repeat core creation/placement/use on a narrow touch viewport. Check tap interception, visible current action and reading focus.
7. Keep all nine fixtures, predicates, alternatives and assistance boundaries in regression tests. Functional preservation is necessary but does not substitute for this review.

## Revised-build observations

First headed pass completed with ordinary pointer input and real-time requestAnimationFrame updates. No advanceTime was used. Screenshots are under tests/ux-captures and were opened for visual inspection.

Observed sequence: Start automatically opened a small guided notebook with `a plank`; typing and Create exposed a named stable placement; moving the pointer across the world toward controls did not move the preview; Place exposed the contextual lighthouse action; that action walked the explorer across the real plank and reached a short celebratory result. I did not need a controls panel, WASD precision or hidden coordinates. The generated phrase was correctly marked assisted.

The next rain task made incomplete coverage understandable: one umbrella produced “חבילה אחת מוגנת” and the primary “צרו כיסוי לחבילה השנייה”. Creating another umbrella defaulted to the uncovered parcel. The ferry transfer exposed a different primary boarding action and approached/boarded automatically. The three G7 tasks were completed through visible actions, not direct world-state mutation.

Live motion samples showed `walk` during actual crossing displacement, smoothly changing facing toward the final destination, then `idle` at rest. Fifteen voyage samples showed `carried:true`, `moving:false`, `clip:idle` while aboard; walking resumed only after disembarking. Inspected the in-transition screenshots. This addresses the earlier running-in-place/air-running causes in these observed paths; reverse/blocked/keyboard paths remain part of the regression.

The visible flow is materially clearer than the baseline: at each phase I could identify one next action. This observation does not establish that an unfamiliar learner will find the whole game fun. The reviewer already knew the noun solutions.

First-pass defects sent to lead:

1. Shelter Try feedback incorrectly described boarding a ferry despite no ferry in that task. The action correctly walked; its feedback was contradictory.
2. New click routes assume Z=0 and therefore leave the actual floor of valid off-center/rotated bridges. Two pure regression tests reproduce this without changing the physical success predicate.
3. A heavy powerless fan receives Select rather than Revise because its force condition is incorrectly coupled to mass≤6.

Initial pure UX run: 43 total tests, 40 passed, 3 failed (the two route cases and fan-action case). Lead owns corrections. Revised campaign/control browser regression is authored in tests/ux-browser.mjs and waits for those fixes.

## Final aggregate result

**43/43 pure semantic and flow tests pass.** The original32 semantics tests remain;11 new tests cover contextual actions, camera-relative movement and valid click routes. The three initially failing UX cases were corrected: routes now follow the contributing span's actual line, and fan force is independent of irrelevant mass when choosing the next action.

`node tests/ux-browser.mjs` completed all nine revised campaign paths through visible controls before an immediate help-toggle assistance assertion stopped that run. The nine completed IDs are preserved in `tests/ux-captures/regression-all-nine.json`. Source now records help synchronously, with a queued-toggle fallback; the test also waits for the user-visible state transition. This was not a failed puzzle route.

`node tests/ux-browser.mjs --controls-only` then passed all remaining control/mobile assertions, with no console/page errors. Results are in `tests/ux-captures/controls-summary.json`.

| Claim | Actual check / evidence |
| --- | --- |
| Guided entry tells the learner what to do | Headed Start automatically opened a marked example; ordinary pointer input reached the first result. `02-guided-notebook.png` through `06-first-win.png`. |
| Hover cannot ruin snapped placement | Pointer moved over the world and toward controls; preview coordinates/rotation stayed unchanged. `03-stable-placement.png` plus browser assertion. |
| Context progresses through write/place/try | All nine campaign routes used the current primary action; the two-condition transfer switched from cargo creation to fan selection and defaulted fan placement to the wind dock. |
| Mistakes have a recovery action | Short length, insufficient mass, wrong medicine history, sinking metal and wrong fan were attempted and recovered. The first rain attempt visibly prompted the uncovered parcel. |
| English and target identity still matter | All nine original physical/semantic goals remained required. Correctness was not injected. Prefilled edit scaffolds supplied no article/count/spelling production credit. |
| Movement follows the screen | Held screen-right produced the expected projected world direction; pure tests cover camera rotations and equal diagonal speed. |
| Actor stops when motion stops or is blocked | Keyboard regression reached a blocked boundary and reported idle/no displacement; release settled to idle. Headed crossing samples showed walk only during actual displacement. |
| Carrying does not look like running | Headed real-time voyage samples were carried+idle with moving=false; walking resumed after landing. `09-carried-live.png` and `first-pass-voyage.json`. |
| Reading and text input are safe | Hebrew/WASD/F input preserved player position and fullscreen state. Help records assistance and stops route; intentional movement closes help. Pause stops movement/audio. |
| Simple control cycles recover | Carry then Cancel preserved object identity and a valid bridge; controls opened/closed; restart cleared objects, preserved gain settings and retained three loops; Enter advanced the completion screen. |
| Phone entry/placement is usable | Native taps created, selected a target, placed and tried the object. Create was visible without panel scrolling. `regression-mobile-book.png`, `regression-mobile-placement.png`, `regression-mobile-win.png`. |
| Narrow phone layout fits | Portrait and landscape captures inspected; a landscape D-pad overlap was caught visually despite a passing overflow metric and then corrected. |

## Final landscape correction

The initial844×390 capture showed the D-pad covering the left objective's Hebrew instructions/step labels. The lead moved it to the right. A new headed, touch-enabled pass inspected `landscape-final.png`: objective bounds X18–293 and D-pad X683–826 are disjoint; the primary action and footer fit inside the viewport.

Native touch hold moved the courier from (-3.7,0) to about(-2.97,-0.445); release settled to speed0/idle. Native tapping the primary action then aligned with the bridge and completed the route in real time. No advanceTime was used in this final check. Evidence and bounds are in `landscape-final.json`.

Shelter travel feedback now describes walking, and wrong-medicine feedback states that the mass is sufficient without falsely claiming the absent bridge rose. These wording corrections preserve the predicates.

## Judgment and remaining limits

The revised entry and first three tasks no longer required me to discover a control sequence or steer precisely. The next action was explicit, placement stayed stable, incomplete coverage explained the remaining need, and the avatar visibly stopped rather than running while carried. The quieter completion screen foregrounded the physical payoff instead of evidence counters. These are observed improvements tied directly to the reported friction.

This remains a compact nine-puzzle game in a repeated island visual set. A reviewer who already knows the nouns cannot establish that an unfamiliar seventh-grader will find it fun, remember the vocabulary or understand every later clause. Real handheld keyboard/performance and a fresh learner play session remain outside this review. Automated passes are treated as functional preservation; the headed pointer/touch observations and inspected transition captures are the evidence for the flow judgment.

All review browsers were closed. Runtime/Git integration remains lead-owned.

## Lead transport and recovery follow-up

The created boat/balloon now supplies the visible vehicle during the crossing, with the courier standing idle aboard; it no longer stays at the buoy while an unrelated raft passes through it. Floating cargo visibly accompanies the existing sail raft. `docs/ux/transport-check.mjs` verifies those three actual UI cases, carrier render coordinates, idle stance and completion. Placement coordinates remain the local puzzle anchor while `visualX`/`visualZ` and `motion.transport` report the composed moving-vehicle pose. Actual captures are under docs/ux.

Removing the supported crossing during use now returns the courier safely to a shore with one visible splash/recovery message. It cannot leave the actor stranded on an invisible floor. `docs/ux/recovery-check.mjs` cancels a real traversal using Escape, presses Undo and verifies recovery/idle without a position or win injection.

`docs/ux/revised-flow.mp4` records ordinary headed pointer/typing and Enter Next in real time for the first two tasks. No advanceTime was used in that recording. Playwright capture is silent; the separate audio checks verify actual playback. Source video and observed states are preserved alongside it. The reviewer did not claim that these changes prove enjoyment for the human user.

The final root campaign rerun completed all nine after the carrier/recovery changes, with no page/console errors (`regression-all-nine.json`). That combined run later timed out while taking a full-page mobile placement screenshot; its state was saved before capture, and the failure was in capture infrastructure rather than a puzzle assertion. The runner now records capture warnings and saves a canvas fallback instead of treating a screenshot stall as gameplay failure. A separate headed controls-only rerun follows; the existing independent headed portrait/landscape evidence is retained.

Final `UX_HEADED=1 node tests/ux-browser.mjs --controls-only` completed every remaining control/mobile assertion with no page/console errors. The final campaign evidence still contains all nine completed IDs. The carrier/recovery follow-up and initial idle-pose fix are integrated, TypeScript/Vite build and43 pure tests pass, and the skill client capture was inspected after the rewrite.
