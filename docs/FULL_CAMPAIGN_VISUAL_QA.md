# Full campaign: visual, input and recovery audit

28 October 2026. Art helper's isolated pass for the current 50-island campaign. The latest AGENTS.md was read: one sequential campaign, no grade selector, source grades retained only as curriculum metadata. This pass reads current code and the lead's captures; it does not edit src, run Git mutations or start a competing browser. Earlier nine-track/50-win records are history, not evidence for this new run.

## Scope and evidence status

The lead owns the actual full50 newcomer/recovery run. This helper independently reviews visible controls, task context, movement/placement/selection cues and capture evidence as it arrives. Source-traced issues below are distinguished from played UI failures. Agent inspection and scripted completions do not establish human enjoyment or a human novice study.

At initial inspection, work/full-campaign did not yet exist. No screenshot or new browser pass is claimed below until an explicit capture entry is added.

## Early findings sent to the lead

### Free-placement return can mislabel coordinates — source confirmed

The #free-place control offers “חזרה להצמדה למצוף”, but its current handler only toggles freePlacement and calls renderTargets. Returning from a free coordinate does not reset placement to the selected station. data-active can then mark that station while the preview remains elsewhere. Expected: returning to snapped mode calls setTarget(zoneIndex) or equivalent authoritative coordinate update. The lead was notified before the run.

### Keyboard placement has different bounds from pointer placement — source confirmed

Pointer free placement clamps x/z to island limits; Arrow placement increments world coordinates without the same clamps. Repeated arrows can move a preview offscreen/outside the normal manipulation region. Inventory recovery remains available, so this is a recoverable friction issue, not an irreversible object-loss claim. Expected: consistent bounds and visible feedback at a limit.

### Partial storm guidance can contradict a valid component — pure flow diagnostic

A read-only direct TS call on level30 demonstrated both orders:

- Carrier first: a small boat at the cargo station gives capacity4.8 and world reason “המטען צף בכלי מתאים”, force0. objectiveStatus nevertheless says “עדיין צריך כלי מתאים למשלוח”. Current nextAction already correctly asks for wind, so the two UI messages disagree.
- Fans first: two correctly placed ordinary fans give force8 for an8–10N requirement and no carrier. Selecting the second fan returns revise, encouraging edits to an already useful wind component rather than creation of the missing carrier.

These calls evaluate existing predicates/flow only. They are not played UI wins. Expected: carrier, wind and extra-station status remain distinct, and partial solutions are preserved whichever creation order the learner chooses.

### Task context disappears while typing — source confirmed, usability impact awaiting late captures

All editor/placement/inspector modes hide #objective. The notebook supplies generic copy, a prefilled phrase or a guided model, but no persistent mission text. Later tasks combine several conditions; island50 requires20 parcels, a wooden carrier of at most2kg, the named fan at at least12N, a key and an active lamp. Hiding the source while the learner writes adds a memory task and may require closing/reopening the editor.

Expected: an accessible compact task details/copy in the editor, preserving the current input. Original English instructions can remain available without classifying ordinary rereading as assistance; Hebrew translation/model help should retain its truthful assistance record.

### Target-choice focus/state needs checking — source review only

Target buttons use data-active visual styling but do not expose aria-pressed/current. Rebuilding the target list on selection also replaces the focused button. Check native keyboard placement through multiple stations, not just pointer clicks. A label/selected treatment should be perceivable beyond color and should preserve a sensible keyboard focus location.

## Current recovery improvements visible in source

The former wrong-ladder dead end has been addressed in the source under review: wrong created object categories request replacement; created noun edits can replace the noun transactionally; original objects remain during preview; remove/move/Undo controls and a selected phrase strip exist; editors are left/top anchored; thin spans have a screen-space pick fallback; persistent objective status and explicit at-goal completion exist. These are implementation observations, not a fresh assertion that every responsive/recovery case passed.

## Capture review queue

Await lead captures for: first guided notebook, first independent count task, wrong-object recovery, selected-object controls, mixed-component storm partials in both orders, later identifying-description inspection/editor, final multi-condition notebook, partial absorption/force, phone portrait and short landscape. Review visibility, overlap, focus/selection cues, reading context and actual world consequence against each state.

## Browser and visual conclusions

The lead owns browser actions. This helper's evidence is source inspection and the actual captures listed below. Responsive controls, keyboard activation, timing and complete causal paths require the lead's separate traces. No art-owned competing browser was launched.

## Early source fixes rechecked before captures

The lead updated the code during preparation. Read-only reinspection confirms return-to-snap now calls setTarget, Arrow placement uses the same bounds as pointer placement, target buttons expose aria-pressed and restore focus after rebuilding, and all three working panels contain an English task-reference details section reset for each island.

A repeated pure level30 flow diagnostic now reports a valid carrier and0N separately, asks for wind after carrier-first, and asks for a carrier after two valid fans-first. The earlier storm contradictions are resolved in this pure check. Browser visibility and activation are still pending the lead's run; these rechecks are not played wins.

## Actual lead-capture review: opening chapter and first property puzzles

Opened and visually inspected these supplied PNGs under work/full-campaign (not inferred from filenames alone):

- 01-wrong,01-ready: readable objective/status and wrong-category Replace action; visible selected phrase, edit/move/remove and Undo. The ready plank was captured during its growth animation, so apparent endpoint reach is not a settled-mesh measurement.
- 02-wrong: the formerly inaccessible recovery state now has visible left-side object actions and Replace. The selected unlit lamp is barely discernible at this capture instant; a settled frame is needed for prop-readability conclusions.
- 03-ready,05-ready,12-ready:2/2,3/3 and single-large-cover solutions show the correct visible aggregate status and goal action. Newest identical umbrellas are visibly smaller in03/05 because the capture intersects the.35s pop. Source and pictures also show rain continuing its usual below-canopy cycle after protection: a visual-consequence improvement was requested, not labelled a progression failure.
- 04-ready: rope silhouette is fine but very thin; the visible selection footprint and explicit selected phrase provide recovery context. Forgiving pick behavior needs the lead's input trace rather than a still image.
- 06-travelling: explorer and created boat visibly move together; action indicates travel and disables repeat travel. No screenshot-only claim about the complete animation cycle.
- 07-wrong,13-wrong: wrong mass/identity feedback and primary action are legible without the bottom-right toolbar. Some left-bank story geometry sits behind the objective, but the visible inventory/selection action supplies a recovery path.
- 08-ready: absorbed puddle is visibly reduced and sponge/goal are present.
- 09-ready,10-ready: chest lid visibly opens; island10 includes carrier plus opened chest, with readable travel action.
- 11-ready: comparison sample remains visible and distinct from the created long crossing; selected phrase and navigation action are clear.
- 13-ready,14-ready: pressure bridge is visibly present and selection/actions remain visible; capture still intersects creation pop, so do not infer settled crate/bucket dimensions from it.
- 15-failure: screenshot itself shows a usable cargo preview, selected six-parcel station and visible Place button. The accompanying results.json reports `visible zone not found: ferry`; this is the test asking a cargo level for a ferry target, not observed missing game UI.

At1280×826 in these frames, no objective/selected-action/primary-button overlap was found. The secondary toolbar is left-side and clear. No host-composer overlay was present in these captures; the left positioning is consistent with the prior host-overlay fix, but a screenshot does not establish native click hit-testing.

The lead was asked to allow≈450ms real render time after placement before settled-state captures. A screenshot during a deliberate pop is valid action evidence, but not proof that two identical nouns have different sizes or that a completed bridge remains visually short.

### Captures15–17 and completion layout

Opened15-ready,16-ready,17-ready and14-complete. The retried15/16 images now show settled readable crate/boat silhouettes, a tangible cargo placement and an unobstructed left recovery strip.14-complete clearly separates Next15, Replay and optional learning details.

**Visual defect sent to lead:**17-ready's bright lamp/cave marker is almost fully occluded by the foreground decorative tree near(7.8,3). The selection ring and light spill are visible, but the featured semantic prop and dark-marker consequence are not readable. Move/remove that decoration for illumination/cave levels without changing the authoritative station coordinate; check17/20/50 and later marker combinations. This is an actual capture observation, not inferred only from bounds. Resolution/recapture pending.

Opened18-ready and19-failure. Small boat silhouette and selected phrase are visible; station choice and Place remain unobstructed in the19 preview. The19 failure repeats the script's ferry-versus-cargo target-selector mismatch; no separate visual blocker was observed. These failures must remain distinct from a played game soft lock.

### Actual captures 19–30

Opened every ready capture from `19-ready.png` through `30-ready.png`, plus `30-wrong.png` and `30-task-in-editor.png`.

- **20-ready verifies the visual fixes:** the foreground cave tree is absent, the lamp and illuminated marker are clearly visible, and rain drops stop above the protected umbrella rather than continuing through the covered parcel. This resolves the reported illumination occlusion in this scene; it does not retroactively change 17's historical capture.
- 21/22 show one large versus two ordinary crates on the pressure station, with the resulting crossing present. 23/24 distinguish a very thin rope from a wide plank; both retain a visible selected phrase and action strip.
- 25/29 show one versus two fans at the force station. 26/27 show an authored crate moved to the station while the other crate remains; source identity still needs textual inspection, so the inspector/history matters more than identical mesh appearance.
- 28/30 show the carrier distinctly from the sail raft. At 30, fans and cargo are visible simultaneously; wrong-category feedback offers replacement, and the selected phrase still has edit/move/remove beside it.
- **30-task-in-editor verifies task context:** expanded “המשימה באי” keeps the complete English carrier-width and force constraints readable while the notebook input and Create button remain visible. No desktop overlap was observed.

### Actual captures 31–40

Opened every ready capture from `31-ready.png` through `40-ready.png`.

- 31/32/34 show visibly different carrier sizes/forms and readable selected descriptions. 33 shows the thin rope reaching both shores. The larger boat at 32 overlaps the dock as a large carrier would; its cabin and deck remain identifiable.
- 35/36/37 show the force station and selected powerful/powerless descriptions; a single still cannot verify blade cadence or stopped animation, so no animation pass is claimed from these frames.
- 38 shows three separately outlined sponges and no remaining puddle; 39 shows two sponges plus an opened dispatch chest. 40 shows the cargo boat and named fan together without covering the left action strip.
- A suspected left-text cutoff in 27/39/40 was **dismissed** after reopening those same PNGs with `view_image` at `detail: original`: the complete title and mission are present. The lead independently saw complete text in 39. This was a misleading viewer/downsample impression, not an established game defect; no runtime change is requested for it.

Desktop captures through 40 continue to expose the left primary action, edit/move/remove and Undo. They do not prove that a host overlay was physically present or hit-tested in this run.

### Actual captures 41–50 and final editor

Opened every ready capture from `41-ready.png` through `50-ready.png` at original detail, plus `45-task-in-editor.png`, `50-task-in-editor.png`, `50-complete.png`, `42-wrong.png`, `48-wrong.png` and `50-wrong.png`. Also opened 02-ready, 06-ready and 07-ready to close the earlier ready-frame gaps. Together with the earlier entries, **a ready frame from each of all 50 islands has now been independently opened and visually reviewed**. This is a screenshot review, not a second played 50-win run.

- 41's balloon silhouette is clear; 42's large named boat is visible with property-edit controls. 43 presents two fans; 44 presents a visibly metallic bucket and open pressure crossing.
- 45 shows distinct fans at different landmarks and the floating crate. Its expanded notebook reference retains all English task clauses below the input without hiding Create. 48 shows the identified original rope reaching both shores.
- 46/49/50 verify exposed lamp/cave geometry in later combined missions. The lit marker, opened chest and carrier remain legible alongside the selected phrase and recovery controls.
- 50's expanded editor keeps the chest/light, 20-parcel wooden carrier, mass and named-fan clauses readable together. 50-complete clearly announces all 50 unlocked and offers Map plus replay, without implying another numbered island.
- 42/48 wrong-category frames expose Replace and retain edit/move/remove/Undo. 50's unlit-lamp state exposes a property-edit CTA; its feedback names the missing light and closed chest as well as carrier/force. No desktop overlap hides these recovery affordances.

**Source-backed feedback inconsistency, sent to lead and corrected:** 50-wrong demands a carrier width at most 3 m and force between 12 and 16 N, while its original English mission omitted those upper bounds. The lead has now added “no wider than 3 m” and “between 12 and 16 N” to the mission, preserving the predicates and solution. This finding arose from actual rejection text and source comparison; no >16 N played rejection is claimed. Updated desktop task/completion captures are reviewed below.

The two early visual findings are addressed in the newer scene captures: protection blocks below-canopy rain and illumination stations expose their lamp/marker. Screenshot review cannot establish human enjoyment, sustained learning or motion/input quality by itself.

### Actual responsive and recovery-control captures

Opened `final-editor-task-desktop.png`, `final-inventory-desktop.png`, `phone-final-editor.png` (390 × 844), `landscape-final-tools.png` (844 × 390) and `51-all-earned-map.png`. These images still contain the earlier level 50 mission; do not present them as proof of the newly disclosed width/force wording.

- Desktop inspector displays all five current objects, both fan histories and property/move/remove controls. Its long content is scrollable; the task reference sits below the visible fold. The notebook shows a visible input-focus outline and expanded English task.
- Phone notebook fits the phrase input, Create button, dictionary summary and full expanded task without overlap. Keyboard/pointer software-keyboard behavior is not established by this still.
- Landscape keeps edit/move/remove at top-left, navigation at top-right, primary action and secondary toolbar at bottom-left, and D-pad at right. **Minor readability finding sent to lead:** the long feedback toast crosses the lower objective status/instruction and passes behind the primary button. The button remains in front and visible; this is not a blocked click target. A shorter/capped landscape toast would reduce competing text.
- The earned map clearly shows completed nodes, current island 50 and Replay/Resume. It is scrolled to the lower chapters, so the top chapter's circles are intentionally above the scroll viewport, not missing from the map.

Read the lead's `controls-results.json`: it records all 50 misplaced-object Move/repair/Undo checks, resnap/bounds, representative wrong-property recovery, shore recovery, overlay/typing/focus/settings/fullscreen checks and portrait/landscape controls, with `passed: true` and no listed errors. Those are **lead-run interaction results**. This helper's independent contribution is the source/capture review, not a claim to have executed those actions again.

Opened `replay-17-ready-final.png`, `replay-41-ready-final.png` and `replay-50-ready-final.png`. Island 17's formerly occluded lamp and marker are now fully exposed, resolving that exact original scene defect. Balloon and final combined scene remain readable. These replay captures predate the mission-disclosure rebuild.

### Rebuilt final task verification

Opened `final-50-task-current.png`, `final-50-complete-current.png`, `phone-final-editor-current.png` and `landscape-final-tools-current.png` at original detail. The expanded desktop and 390 × 844 phone notebook display the complete updated English task including the 3 m width cap and 12–16 N force interval; input and Create remain visible. The resulting completion again exposes Map and Replay clearly.

The 844 × 390 landscape toast now sits to the right of the objective and primary action, rather than crossing their text. All three object actions, navigation, primary action, toolbar and D-pad remain visible. This resolves the observed landscape text competition. The lead additionally reports the toast measured at x322/y312/w504/h64, clear of objective x18–293/y69–279 and CTA x18–248/y285–328; those DOM measurements come from the lead's live run, not pixel estimates here.

The lead reports the updated final-island replay recovered wrong carrier, wrong fan and unlit lamp, exercised native arrows/jump, paused reading aboard and recovered safely with Undo during the voyage before completing island 50. This report is kept distinct from this helper's independent screenshot review.

## Final disposition

All 50 ready-state images, representative wrong/recovery states, dense task references, final completion/map and desktop/phone/short-landscape captures were independently inspected. The reported source/input issues and visible rain, lamp-occlusion, hidden-final-constraint and landscape-toast issues have corresponding source or capture corrections above. No unresolved visual blocker was found in the supplied final captures. No runtime source, Git state, assets or browser sessions were changed by this helper during this audit; only this document was edited.

Limits: this is an independent art/input-affordance review layered over the lead's actual interaction run. Still images do not prove frame cadence, native software-keyboard/IME behavior, every browser/device combination, human enjoyment or learning gains.
