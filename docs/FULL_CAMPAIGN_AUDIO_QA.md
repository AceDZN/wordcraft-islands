# Full-campaign audio and input lifecycle audit

Scope: static audit of the shared 50-level recovery and transition handlers in `src/main.ts`, `src/audio.ts` and `src/flow.ts`; `src/editing.ts` was read to verify replacement semantics. Root owns browser execution. This audit ran no browser, changed no runtime files, created no music/assets and made no Git changes. Findings below are code-path findings, not a claim that a fresh 50-level browser regression passed.


## Source re-read update

Root applied small fixes while this audit was being written. A subsequent read confirmed the changes below; this is **source confirmation only**, and root still owns the browser regressions.

| Finding | Current source observation |
|---|---|
| Preview Ctrl/Cmd+Z | Moved before the pending branch, after typing/modal guards. |
| Removal recovery explanation | `recoverUnsupported()` now returns a flag; `removeSelected()` preserves its shore message. The sibling `place()` path was subsequently guarded too, preserving the same recovery explanation. |
| Completion focus/visibility music | Handlers now use the completion-panel exception consistently with the map state. |
| Nested Settings/Controls | Overlay return state, first-control focus and a Tab trap were added. |
| Old read-aloud after level change | `audio.stopVoice()` now clears speech/ducking and is called by `loadLevel()`. |
| Zero-force fan cue | `fan` is now chosen only for positive force; zero-force placement falls back to metal contact. |
| Partial-batch ready wording | The message now asks the player to finish placing or cancel the group while previews remain. |

The finding narratives below describe the initial source paths so the corresponding regression cases remain explicit. Do not treat the resolved entries as still-open defects, or the source fixes as browser passes.

## Concrete findings

### 1. Preview intercepts keyboard Undo

At the initial read, `keydown` returned from the `if(pending)` branch before reaching the Ctrl/Cmd+Z shortcut. Consequently the visible Undo button works during placement, but the advertised keyboard Undo does nothing there. Focused phrase editing correctly keeps native text undo and should retain that behaviour.

Tiny fix: after the typing and started/paused/modal guards, handle Ctrl/Cmd+Z before the pending-placement branch. Prevent the browser default only when invoking the game's undo.

Root browser check: create a preview, focus the canvas, press Ctrl/Cmd+Z, and verify the preview/history restore exactly as with the Undo button. Then verify Ctrl/Cmd+Z inside the phrase input remains text editing.

### 2. Removing a support overwrites the shore-recovery explanation

At the initial read, `removeSelected()` called `recoverUnsupported()`, which can return an explorer from the gap to a safe bank, play `splash`, and explain that the route changed. `removeSelected()` then immediately replaces that explanation with the generic object-removed message. `place()` can similarly overwrite the recovery explanation with the span-length feedback. The physical recovery and sound can be correct while the visible explanation loses the reason the explorer moved.

Tiny fix: return a `recovered` flag from `recoverUnsupported()` and preserve/merge its explanation when true. A removal plus a real fall/recovery can legitimately have `undo` and `splash`; each describes a different visible event. Do not add a splash for removing an irrelevant rain-island ladder.

Root browser check: remove/replace the only support while the explorer is over the gap. Verify safe-bank recovery, one splash and a visible explanation that mentions the relocation; undo must remain available.

### 3. Completion audio remains suspended after focus returns

`showOverlay('complete')` deliberately keeps music and the completion flourish running. At the initial read, the main focus handler resumed audio only when `!modalOpen()`, and the visibility handler pauses for every modal. After blur/tab-hide, returning to the completion panel therefore leaves audio suspended. `closeCampaign()` already contains the intended completed-panel exception.

Tiny fix: centralise an audio-pause predicate such as `paused || campaignMapOpen || (!overlay.hidden && !won)` and apply it consistently to focus, visibility and overlay transitions. Continue blocking world movement during completion.

Root browser check: complete an island, blur/hide and refocus while the panel remains open. Music should resume without starting another loop set or replaying `success`. Native visibility behaviour still needs real observation; dispatched listener tests alone are narrower evidence.

### 4. Nested Settings/Controls can leave an invisible paused state

At the initial read, `pauseGame()` left keyboard focus on the header pause button and generic overlays did not trap focus. Shift+Tab can reach the header Settings button behind the pause overlay. Its handler only checks `started`, so Enter can open Settings while `paused` remains true. `settings-close` then calls `hideOverlay()`: every overlay becomes hidden, but `paused` is still true and audio remains suspended. Controls has the same close pattern. World input is blocked with no visible pause panel.

Tiny fix: either prevent activation of background controls while a modal is open, or remember the prior overlay and return to Pause when closing nested Settings/Controls. A small focus trap/initial-focus handoff also prevents this specific keyboard route.

Root browser check: Pause → Shift+Tab to Settings → Enter → Close. The result must be a visible Pause panel or an explicitly resumed game, never `paused=true` with all overlays hidden.

### 5. Old read-aloud can continue into another island/restart

At the initial read, `loadLevel()` reset the hopeful stem but did not cancel speech. A long mission read-aloud can still be active when the learner finishes/advances or restarts quickly. The old mission can then speak over the next island and keep its music ducked. Opening a pause/settings/map overlay cancels speech, but direct Next/replay/restart are not equivalent paths.

Tiny fix: add a small `audio.stopVoice()` operation that cancels speech, clears ducking and reapplies gains, then call it from `loadLevel()`. Preserve the existing loop sources. Do not dispose/recreate the whole audio context merely to cancel speech.

Root browser check: start a long mission read-aloud, then use Next/restart/replay while it is speaking. The previous utterance must stop; music should return to its ordinary gain and still have three loops. Actual installed voice availability remains platform-dependent.

## Smaller feedback issues

- **Powerless fan cue:** `place()` selects `fan` for every fan regardless of force. That asset is a motor/wind cue, while safety tasks 37/40 require stopped blades/zero force. Use existing `metal` contact for zero-force placement, or another neutral existing cue; keep `fan` for an operating fan. No new sound is needed.
- **Partially placed plural batch:** one useful instance can make the physical world ready before all previews are placed, such as replacing a level-2 ladder with `two umbrellas`. `updateOutcome()` can then say “now try the lighthouse” while `pending` still blocks travel. Keep the Place instruction, but defer that travel wording until the batch is done or say to finish the remaining placements. The physical-ready cue and completed-goal flourish must remain separate.
- **Repeated identical form submission:** error audio is not fired per render frame or keystroke, which is correct. Repeated Enter submissions of an unchanged invalid phrase can still overlap the same error until the eight-voice cap. Optional audio-only deduplication can suppress repeated identical rejection cues without suppressing visible feedback or attempt recording.
- **Restore versus discovery:** undo or a partial-batch cancellation can restore an earlier valid arrangement and produce `confirm`/“idea works” via the ordinary false-to-true guard. That is a real restored state, but neutral “previous state restored” wording is clearer than implying a newly discovered solution. No `success` should fire merely because a preview was cancelled.

## Shared paths that are correctly guarded in the audited code

| Path | Code-level observation |
|---|---|
| Unsupported noun/property or story-object noun/count restriction | Neutral `page`; no object is committed. Story referents retain their noun/count through `prepareObjectEdit()`. |
| Explicit article/count/word-family form rejection | One `mistake` on submit; no creation or puzzle-success cue. |
| Created-object noun replacement | Valid different nouns are allowed; the original remains until confirmed placement. `create` acknowledges the preview, not puzzle success. |
| Cancel an untouched edit/move preview | History restores the original; there is normally no explicit cancellation sound. Keeping a valid original in place avoids a false temporary readiness loss. |
| Remove/undo | One explicit `undo` cue per action. Readiness and hopeful state are recomputed; actual lost-support recovery is handled separately. |
| Readiness | `confirm` and hopeful music are guarded by `state.ready && !lastReady`, so an idle wrong ladder does not repeat an error/success cue every frame. |
| Goal completion | `won` guards the completion flourish; creating/placing/removing alone does not call `success`. The goal's explicit completion/armed-route logic remains distinct. |
| Pause/map/settings | Motion/keys are cleared on entry and audio fades/suspends; one-shot tails are cleared after the pause delay. Loop creation remains guarded against duplicate sets. |
| Focused typing | Input/textarea/select handling precedes movement, delete and fullscreen shortcuts. Enter/Space on native buttons is left to normal control activation. |
| Touch release/cancellation | Pointer-up, pointer-cancel and lost-pointer-capture clear held movement keys. |
| Level transition | The hopeful layer resets; music buffers/loops are reused. The initial old-speech issue is now addressed by `stopVoice()`; browser voice availability remains platform-dependent. |

## Browser handoff boundary

Root should run the concrete reproductions above in the current recovery build and attach observed state/cue results. Earlier 50-level wins and audio lifecycle records remain useful historical evidence, but they do not by themselves verify every new wrong/replacement/undo branch. No human listening or native tab-hide pass is inferred from this static audit.

## Lead browser verification, final build

The lead completed50 real-time UI wins with three audio loops and17 loaded assets retained at every win. The separate all50 Move/Undo replay pass recorded0 page/console errors, actual tab/focus return at completion resumed the same three loops without replaying success, and native pause/settings/fullscreen round trips passed. Removing support mid-walk retained the shore-recovery explanation. A final island50 exploratory replay paused notebook reading aboard, undid a lamp edit during the voyage, safely returned to shore with its explanation, corrected the lamp and completed through normal travel. These observed checks are recorded in [FULL_CAMPAIGN_PLAYTEST.md](FULL_CAMPAIGN_PLAYTEST.md). Platform speech cancellation remains source-verified; no new human musical audition or physical-device claim is added.
