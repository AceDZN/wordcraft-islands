# Feedback and audio pacing review

Status: revised-flow playback/control checks completed on 27 October 2026; results and remaining limits are recorded below. This review responds to the user's report that the game flow and controls are confusing and boring. It does not claim that sound alone solves those problems. Lead owns the new gameplay, controls and animation; the audio helper changed no runtime files.

## Make the result of each action understandable

The current score already provides an island identity. Keep it. The next improvement should make the creation loop legible: see a concrete need, open the notebook, summon something, see where/how it can be used, commit the placement, observe a property consequence, then act on the opened route. Sound should mark those changes, with the same meanings in every grade.

The current implementation plays a material sound at placement and `confirm` when `world.ready` changes to true. Those are two different events, but firing them at the same instant makes them harder to distinguish. Pair the material impact with visible contact. If a listening review finds the impact and confirmation blend together, a short stagger (roughly 120–250 ms) is an optional polish step, provided the same object/world state is still current. Cancel any delayed confirmation on undo, restart or level change. The revised build keeps the two cues synchronous and uses separate visible readiness and destination states. No sound should announce a future result before it has happened.

The destination is a separate event. A physically useful object opens an action; it is not the completed adventure. Keep the short `confirm` for “your solution works”, the hopeful stem for the opened opportunity, and the longer `success` flourish only when the learner actually reaches/completes the goal.

## Existing cue map

| Actual event | Existing cue | Visible counterpart and pacing |
|---|---|---|
| Open notebook | `notebook` | Notebook opens and text caret becomes visible. Once per open, no cue for each keypress. |
| Successful phrase creates a preview | `create` | Tangible object appears, then a single placement instruction points to the next action. This cue acknowledges creation, not puzzle correctness. |
| Commit object to a surface | `wood` / `metal` | Contact/settle animation and readable object name. Exactly one material impact per commit. |
| Open an umbrella | `umbrella` | Canopy unfurls and a coverage circle/area becomes clear. Do not layer the wood impact over this specialised cue. |
| Start a fan or commit its changed force | `fan` | Fan blades/wind and a force/target response become visible. Do not play continuously from the render loop. |
| Rotate a placement | `rotate` | One discrete orientation step. Target selection and pointer hover are silent in the revised integration. |
| Object actually bounces | `bounce` | A single visible bounce, only once for that collision event. |
| Object actually falls into water / boarding starts | `splash` | Water consequence or boat movement is visible. A failed dry placement should not sound like a splash. |
| Sufficient physical solution becomes ready | `confirm` + `setSolved(true)` | One brief confirmation, followed by a clear contextual action: cross, board, move cargo, or use the opened route. The hopeful stem fades in once. |
| Valid object is insufficient | Material cue, then optionally one `mistake` | State the precise cause: span too short, mass below the platform threshold, force too low, wrong identified object, insufficient cover. Keep the object available for modification or undo. |
| Unsupported catalogue noun/property | `page` or silence | “Not in this workshop yet” with the finite catalogue/help option. This is not a grammar-error sound or a claim that the English word is wrong. |
| Explicit article/count/form conflict | `mistake` | One short Hebrew explanation tied to the actual phrase. No repeated tone while the learner edits. |
| Learner undoes an action | `undo` | Object/state visibly restores. If the route is no longer valid, fade the hopeful stem out without another error flourish. |
| Read a hint / new explanation | `page` | Text appears; no solution fanfare or success credit. Assistance recording remains independent. |
| Actual level goal completed | `success` | Goal reacts, completion panel follows, and flourish ends naturally. Keep the music running through this panel. |
| Move to next island / restart | No success cue | Reset the hopeful layer and any pending delayed cues; reuse the same three loop sources. |

`page` is an existing soft paper cue, so this mapping needs no new audio assets or services. The score, assets, licences and gains remain unchanged.

## Keep control discovery quiet and concrete

A persistent “next action” message should be easier to find than a row of equally weighted controls. Each message needs one action and one reason. Examples of the intended relationship:

- Creation preview: “Place the plank across both edges” while the two required supports are visible.
- Physical success: “The plank reaches both edges. Cross to the courier” while the route and destination react.
- Recovery: “This plank is 1.6 m; the gap is 2.4 m. Change its length or try another object” while the short span is visible.
- Boat: “Walk to the dock, then Board” with the dock/boarding affordance in view.

These are feedback examples, not a requirement to reveal the correct English phrase in independent or transfer tasks. Preserve the English mission and the actual source/context evidence. The Hebrew prompt should explain what the player can do, without silently solving the English task.

Do not add chimes to every control or pointer movement. Avoid automatic read-aloud on level entry; language audio remains replayable and initiated by the learner. Opening a dictionary or help panel should pause movement pressure while the calm soundtrack may continue. Pause/settings should retain their existing fade/suspend behaviour.

## Avoid duplicate or stale rewards

Use an explicit transition guard for the physical-ready cue and the existing `won` guard for completion. Do not play `success` from both the goal animation and panel opening. Do not queue another flourish on pressing Continue. If a valid solution is undone and rebuilt, the physical confirmation can replay once for the new false→true transition; completion still happens once for that visit. Cancel any delayed cue on undo, restart, switching grade/island, or a new placement that invalidates it. Generic audio pause already clears faded one-shot tails before suspension.

The existing soundtrack should remain calm during reading. The hopeful stem gives enough lift when a solution works. Additional intensity or faster playback would make the three grades feel different without teaching different semantics, so it is not recommended.

## Revised-flow regression plan

The following plan guided the revised-flow checks. The evidence below comes from the new run, not the baseline results.

1. First-minute path: Start → one clear objective → notebook → create → placement → observe property effect → contextual travel/use action → goal. Check that the music starts only after Start and that each meaningful action produces the intended cue once.
2. Wrong placement → visible consequence → precise cause → modification/undo → valid placement. Check a neutral catalogue miss separately from a form misconception; neither should repeat audio while typing.
3. Compare physical-ready and completed states. Count one short confirmation at ready, one flourish at the goal, no duplicate flourish on panel/Continue, and no stale delayed cue after undo or restart.
4. Preserve gain/mute settings, pause/resume and three-loop count across the revised UI. Check that instruction reading and focused typing do not move the character.
5. Check one more complex context (weighted platform or identified fan) so the same cue meanings apply to semantics beyond the first bridge.

A new human listening claim requires an actual audition. Measured output and state changes can verify playback/pacing, but cannot establish that the experience is engaging.


## Revised-flow results

Command: `node docs/audio/ux-browser-qa.mjs` against `http://localhost:5263`. Final result: **passed, 35 records, zero page/console errors**, Chromium 156. Reproducible observations are in `ux-browser-qa.json`. The browser closed after the run. No runtime/audio assets were changed by this QA.

- **Start and initial playback:** a passive observation after the Start handler saw the welcome overlay hidden and mode `explore` with **0 decoded audio buffers**. The handler event turn took about 321 ms in this run; the complete Playwright round trip was 935 ms and is not a user-device latency benchmark. The guided notebook then opened with a usable input. After decode, the context ran at 22,050 Hz with **17 buffers, 3 loop sources and RMS .02532**. The small notebook cue also played. Editing with an arrow key while typing left the courier still.
- **First crossing cadence:** creation produced one `create` cue and a tangible placement preview without rewarding the puzzle. Placing the supported plank produced one wood contact and one short physical-ready confirmation. The hopeful layer became active, the primary action changed to travel, and the player waited for Try. Waiting did not repeat the ready cue. The contextual route then reached the actual goal, playing **one success flourish**. At completion it was running with one one-shot; after a real 2,250 ms wait it had ended naturally with no additional cue. Continue reset the hopeful layer, kept three loops and played no reward again.
- **Specific recovery:** `a violin` stayed in the notebook and played one neutral `page` cue. `an plank` showed the article-sound explanation and one `mistake` cue, with no repeat while editing. A short plank failed the 4.2 m crossing with a visible **1.8 m** cause, one wood contact and no readiness reward. The contextual revision opened the selected object directly. A long plank opened the route; undo restored the insufficient state, played `undo`, removed the hopeful layer and produced no stale confirmation.
- **Complex context:** the test selected Fan A through the object UI, changed it to `a powerful fan`, placed it at the wind dock and observed one fan cue plus one readiness confirmation. Try approached/boarded the vessel and recorded actual carried states. The sail route reached the goal with **one boarding splash and one completion flourish**. The flourish ended naturally and the following island reset the hopeful layer without another reward.
- **Lifecycle and gains:** pause suspended playback; resume returned to the same loop set. Three restarts retained exactly three loops and cleared solved state. Music, SFX, voice and master controls changed independently. Music+SFX mute and master mute each produced measured zero output. Settings survived reload while audio returned to `locked`; a fresh Start again loaded 17 buffers and started exactly three loops.

The ready and completion screenshots (`ux-ready.png`, `ux-complete.png`) were opened and visually inspected. They show the supported crossing with a clear contextual travel action and then the actual goal panel. These are captures from the working revised game.

### Timing and scope limits

The final audio run uses **160 ms calls to the game's deterministic `advanceTime` hook** during travel. It does not set player positions, inject wins, or bypass any solution predicate. The crossing logged 15 intermediate position samples; the sail logged 22 and observed the carried state. This verifies the UI action → physical route → goal → cue relationship, rather than ordinary wall-clock locomotion speed. The flourish checks use actual elapsed time, not the simulation hook. Set `AUDIO_REALTIME_TRAVEL=1` to attempt ordinary wall-clock travel; `AUDIO_HEADED=1` opens a headed test browser.

An earlier software-rendered headless route exceeded a 20-second wall-clock limit; its final route was not captured, so the cause could not be classified. A fresh diagnostic then advanced from x −3.7 to −1.40 over 2.5 wall-clock seconds with ten RAF frames, and advanced further through normal simulation steps. The lead subsequently adjusted low-frame-rate handling and reduced scene overhead. Independent headed gameplay is reported separately by the lead; this script does not claim a device performance benchmark.

Material contact and short ready confirmation still occur in the same placement commit. The script verifies distinct event counts and visible states; whether their mix should be staggered remains a listening-polish question. There was **no human audition**, no subjective engagement claim, and no new claim about native tab-hide or platform speech. Earlier focus and speech limitations in `AUDIO.md` remain.
