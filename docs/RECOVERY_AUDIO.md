# Recovery feedback and existing audio

Static code audit for the reported level-2 ladder dead end, 27 October 2026. Lead owns the recovery UI/runtime changes. This document adds no sounds, services, paid generation or runtime code. No post-change browser pass is claimed here.

## Exact reported path

A ladder is supported English and a supported workshop object. Creating it plays `create`; committing it plays `wood`. On the rain puzzle its coverage is zero, so `world.ready` remains false. The existing ready guard correctly withholds `confirm`, the hopeful stem and `success`.

The dead end is the editing mode. The generic recovery CTA opens `openBook(true)`, which preserves the ladder's noun. Because level 2 is guided, that editor can simultaneously show the model `an umbrella`. Entering that valid phrase then hits the same-noun guard in `create()`: it shows a mode-constraint message and returns without a cue or direct replacement action. A grammar-error sound would misclassify the learner's valid English; a sound alone would not fix the trapped action.

Provide the replacement action beside that message, where it remains visible while typing. The actual-user screenshot shows why relying on the distant bottom-right toolbar is insufficient when the host app's composer obscures it. Audio must reinforce an accessible visible action, rather than make an obscured control the only recovery route.

## Cue policy using the existing assets

| Event | Existing cue | Meaning and guard |
|---|---|---|
| New noun entered in same-object edit mode | `page` once, or silence | A neutral workshop/mode limitation. Show a direct Replace action; do not use `mistake` for this valid English. |
| Open replacement notebook | `notebook` | A new-object mode that accepts a different noun. No readiness or completion sound. |
| Valid replacement produces its preview | `create` | Creation accepted. This does not say that the puzzle is solved. Keep the normal specific contact cue when it is placed (`umbrella` for the new cover). |
| Remove/delete an object | `undo` once | A reversible world change. Do not stack a second `recovery` cue: that alias also maps to `undo`. |
| Undo removal/replacement | `undo` once | The prior object/state visibly returns. Keep the ordinary music loops. |
| Cancel an untouched editor/preview | Silence | No committed world action. If cancellation actually restores a temporarily removed object, an optional single `undo` cue is enough. |
| Explicit article/count/word-family form conflict | `mistake` once | Pair it with the exact source phrase explanation. This is different from changing a noun in the wrong editor mode. |
| The replacement genuinely makes the physical solution ready | `confirm`, then hopeful layer | For level 2 this is coverage becoming valid after the umbrella is placed. Only a false-to-true readiness transition qualifies. |
| Courier reaches the goal | `success` once | The sole completion flourish. Opening a recovery panel, deleting a ladder, or cancelling must not trigger it. |

There are no loaded cue buffers named `delete`, `remove`, `replace` or `cancel`. Use the names above; an unknown name is silently ignored by the current audio module.

## Repetition and optimistic feedback audit

- Parse/form rejection cues currently occur on submit, not every keystroke or render frame. However, repeatedly submitting the identical invalid phrase can overlap the same cue until the eight-voice cap. Optional polish: suppress only repeated identical error audio until the input changes or a short interval passes; keep the visible response and attempt recording. Do not disable editing or require the learner to wait.
- The wrong ladder on level 2 does **not** produce a success hint in the audited code. `updateOutcome()` gates the short confirmation and hopeful layer with `state.ready && !lastReady`; coverage remains zero.
- Any replacement/removal that temporarily removes a previously useful object must immediately recompute readiness, hide the stale travel action/optimistic message, and call `setSolved(false)` if the route is no longer valid. No new loop set should start.
- Existing `cancelPlacement()` can restore an earlier valid arrangement and call `updateOutcome()`; a restored false-to-true state can therefore emit the generic “idea works” confirmation. For a simple cancellation, consider a quiet state-restoration path so it does not sound like a newly discovered solution. The exact wrong-ladder case stays unready and does not have that issue.
- Do not implement delete by calling a cue-producing undo routine and then playing another removal cue. One action should have one recovery cue.
- `support-lost-recovery` already plays a splash when loss of an actual crossing returns the explorer to a bank. Keep that physical event separate. Removing an irrelevant ladder on the rain island should not play a splash.

## Focused verification to run after integration

1. Level 2: create/place a ladder, follow the recovery CTA, enter `an umbrella`, and use the visible Replace action. Expect neutral mode guidance, not a grammar-error sound.
2. Cancel replacement before committing: original state returns; no success flourish and no stale travel hint. Retry replacement, place the cover, and observe one real-ready confirmation.
3. Remove the wrong ladder, undo, then remove it again. Each committed action has one recovery cue; no sound repeats while idle or typing.
4. Remove a genuinely useful support/cover: readiness and hopeful music clear immediately; restoring it does not fabricate a new goal completion.
5. Verify the new recovery buttons remain reachable in the reported narrow/composer-obscured layout and with the keyboard. Sound is supplementary; the visible recovery path must work with SFX muted.

These are pending checks for the new recovery implementation, not passed results. Existing music, gains, pause behaviour, licensing and the no-human-audition limit remain unchanged.
