# Full campaign English and recovery review

Reviewed on 28 October 2026. Scope: all 50 titles, English missions, Hebrew mission/help text, teaching text, hints, guided models, object histories, and their relationship to `rules.ts`, `flow.ts`, `editing.ts`, the visible main UI, and scene landmarks. This was an independent source and pure-state review. No browser was opened by this reviewer during this assignment; the lead owns the separate fresh-save UI playthrough.

Final source-review status: all reported action, constraint-feedback, semantic and copy defects below have been corrected in the inspected source. **18 focused regressions pass.** This includes the final capture review's discovery of two undisclosed level 50 caps. The remaining count-entry limit is documented in the level 46 note; it is not an impossible puzzle because repeated creation is supported.

## Findings and concrete fixes

| Priority | Finding and newcomer consequence | Suggested correction | Verification status |
| --- | --- | --- | --- |
| P2 | An unlit lamp at the level 17 marker offered a new creation instead of editing the lamp. A correctly described but misplaced umbrella, boat, key, plank, or fan also offered word revision. | Test the same object's properties at a valid marked location/orientation. Offer Move when movement alone helps; revise an existing lamp when its light is off. | Lead patched; focused pure regressions pass. UI verification belongs to lead's run. |
| P2 | Removing an authored target left the flow asking for an unspecified object; a newly created identical noun cannot restore its story identity. | Explicitly offer recovery of the removed story object, with Undo also available. | All authored-target fixtures now return the recovery action in pure tests. |
| P2 | A bridge that physically reached both banks but exceeded its mass bound was told to cover the gap and rotate. A sufficiently long but narrow rope received the same advice. | Distinguish endpoint support from mass/width failures. Name the failed property and bound; do not claim unsupported endpoints when they are supported. | Levels 23 and 24 focused checks pass after lead's fix. |
| P2 | Level 44 rejected a 9 kg mixed wood/metal load, but the message mentioned only more than 0 and at most 9. It omitted both the metal rule and the 7 kg lower bound. | State the 7–9 kg interval and metal-only condition. Identify a material mismatch separately from a weight failure. | Focused mixed-load feedback check passes after lead's fix. |
| P2 | Level 43's 12 N, 4 kg fan was filtered out and reported as 0 N, with no explanation of the 2 kg mass ceiling. | Explain that the fan is excluded because of its weight, rather than implying it has no power. | Focused mass-limit feedback check passes after lead's fix. |
| P2 | `light` originally changed a 0.2 kg balloon into a 1 kg balloon, defeating level 41's 0.5 kg maximum for the opposite of the word's intended meaning. It also increased sponge/key mass. | A light modifier must not increase mass; retain a mass already below the modifier's ceiling. | Monotonicity check across seven nouns and the level 41 case pass after lead's fix. |
| P2 | In level 50, a completed key/lamp station took precedence over the still-unresolved named fan, opening a new notebook. A newly created fan cannot satisfy that identity. | When the primary task still requires an existing named object, offer inspection/selection instead of a generic new creation. | Focused key/lamp selection regression passes after lead's fix. |
| P2 | In level 20, both parcels could be protected while a selected unrelated ladder caused feedback to say the parcel was still getting wet. | Name the remaining dark marker. Selected missing-role objects can be revised; an unrelated object can be replaced or a new missing part created, without contradicting completed coverage. | Focused truthful-remaining-task regression passes after lead's fix. |
| P2 | Ferry feedback retained only “the described properties,” unlike the improved bridge/cargo feedback. Level 18's wide boat received no 1.3 m explanation, and level 41's heavy balloon received no 0.5 kg explanation. | Append the existing property-limits text to ferry rejection feedback. No predicate change is needed. | Updated source includes limits; focused ferry width/mass regression passes. |
| P2 | Final capture review found level 50 enforced a 3 m width ceiling and 16 N force ceiling while its mission omitted width and said only “at least 12 N.” | Disclose a carrier no wider than 3 m and force between 12 and 16 N, keeping the same predicates. | Updated mission inspected. New contract test extracts all five stated numeric bounds and compares them with every numeric goal; it passes. Lead owns targeted level 50/phone verification of visible copy. |
| P3 | Levels 10 and 49 used “then,” although no placement order is required and the flow can start with the carrier. | Use “and” or another statement of simultaneous requirements. Do not add a sequence gate just to preserve this copy. | Non-sequential wording observed in updated source. |
| P3 | Level 31 demanded that the player describe both size and material, although `a boat` is a valid physical solution. | Make the two-description practice optional; keep a valid alternate solution and its narrower evidence attribution. | Updated source says “Try describing.” |
| P3 | Level 36 said Fan A “is on the brass dock,” but its seed begins away from the target dock. | Say it belongs to, or is assigned to, the brass dock. Keep the additional relative clause and explicit name. | Updated source says “belongs to.” |
| P3 | Level 38's title “Three soft sponges” models `soft`, which is not a supported adjective. | Rename the title to “Three sponges at work” or another phrase that does not look like an unsupported editor answer. No parser expansion is necessary. | Updated title observed in source. |
| P3 | Level 33's teaching text says a description changes only its own property, then correctly explains that `small` also shortens a plank. | Say to inspect every value: size can affect several properties, and `small` can shorten a crossing. | Updated teaching text observed in source. |
| P3 | Level 40 said the powered ferry “boards,” instead of the courier boarding it. | Say “before the courier boards the powered ferry.” | Corrected wording observed in source. |
| P3 | A small boat's raw computed capacity can display `4.800000000000001`. Absorption uses “litres” in missions but “units” in feedback. | Format capacity and use a consistent absorption unit in mission, inspector and feedback. | Formatted capacity and litres observed in updated inspector/feedback source. |

## All 50 prompt/help checks

“Consistent” below means the inspected text agrees with the implemented supported properties and intended conditions. It is not a claim that a novice understood it, that this reviewer played the level in a browser, or that its English skill was produced independently. Physical alternatives remain valid even when they demonstrate less language production.

| # | Stable ID | Prompt/help and newcomer check |
| --- | --- | --- |
| 1 | `g7-crossing` | Consistent: a noun becomes an actual spanning object; both ends need support. Plank, ladder and rope alternatives are explained. A correctly typed object placed elsewhere needs Move, now covered by a pure regression. |
| 2 | `wc-02-first-cover` | Consistent: one parcel needs coverage, and `an umbrella` models the next-sound article. A ladder does not cover rain. Persistent 0/1 status and replacement distinguish solving from walking to the lighthouse. |
| 3 | `g7-rain` | Consistent: parcels are 3.3 m apart, beyond one ordinary umbrella's 2.7 m diameter. Two independent placements are meaningful. Larger/alternate covers may legitimately bypass explicit count production. |
| 4 | `wc-04-rope-anchors` | Consistent: a 3.3 m plank does not meet a 2.8 m gap plus 0.3 m support at each end; 3.5 m rope and 3.8 m ladder do. |
| 5 | `wc-05-three-stops` | Consistent: three separated parcels and an explicit plural example. “Before the next shower” is narrative; no timed deadline is implemented or claimed by this review. |
| 6 | `g7-inlet` | Consistent: floating passenger carrier, with a sufficiently long bridge explicitly accepted as an alternate. The toy-world balloon/crate behavior is disclosed. |
| 7 | `wc-07-hold-the-dock` | Consistent: strictly more than 3 kg; the 4 kg crate works. A correctly described load away from the plate needs placement, not a new word. |
| 8 | `wc-08-first-sponge` | Consistent: one ordinary sponge absorbs 4; an umbrella does not absorb a puddle. Unify litres/units across text surfaces. |
| 9 | `wc-09-keepers-key` | Consistent: key at the actual lock; land traversal is already possible. A misplaced key now has a Move regression. |
| 10 | `wc-10-sealed-ferry` | Both key and floating carrier are genuinely required. Updated wording uses “and”; it no longer implies a required placement sequence. Carrier-first remains acceptable. |
| 11 | `g8-length` | Consistent: real 1.8 m short sample is rendered and labelled. Reading “longer than” and entering `long` are correctly distinguished from producing comparative forms. |
| 12 | `wc-12-wide-roof` | Consistent after earlier wording correction: 1.8 m separation; size and placement both matter. A normal umbrella at the midpoint can cover both and remains valid. |
| 13 | `wc-13-light-dock` | Consistent: authored 12 kg crate must be changed and moved to a plate with a 6 kg maximum. Removing `heavy` or using `light` works. Story identity must survive editing and have a clear deletion recovery. |
| 14 | `g8-weight` | Consistent: strictly above 6 kg. A large crate is 5.2 kg and is not enough; heavy crate/bucket is 12 kg. The help does not equate size with adequate weight. |
| 15 | `wc-15-six-parcels` | Consistent: one floating carrier with at least six spaces. Large crate 10 and boat 12 both work; adding weight does not add capacity. |
| 16 | `wc-16-timber-carrier` | Consistent: wooden material, flotation and six spaces belong to one vessel. The metal crate's sinking is framed as a workshop rule, not a claim about every real metal boat. |
| 17 | `wc-17-fog-light` | Consistent vocabulary contrast: `bright` illuminates, `unlit` does not, and mass `light` is different. Editing a placed unlit lamp now has a regression. |
| 18 | `wc-18-narrow-berth` | Consistent: width at most 1.3 m and passenger capacity. Small boat, crate and balloon alternatives fit. Capacity formatting and explicit width feedback are corrected. |
| 19 | `wc-19-four-at-narrow-dock` | Consistent: the same narrow vessel needs four spaces. Ordinary balloon capacity 3 fails; small boat or crate works. |
| 20 | `wc-20-rain-beacon` | Consistent: both separated parcel coverage and illumination are required. A new pure regression confirms completed coverage is not called wet when only illumination remains. |
| 21 | `wc-21-more-than-sample` | Consistent: exactly 4 is not more than 4. Large crate 5.2 and summed loads are valid. The text teaches a relation, not a spelling password. |
| 22 | `wc-22-between-marks` | Consistent: greater than 6 and at most 10; two crates 8 and large metal bucket 7.8 work, one heavy object 12 fails. Feedback must retain both bounds. |
| 23 | `wc-23-light-long-bridge` | Consistent mission/hint: reach both banks with at most 4 kg. A physically spanning heavy object needs mass feedback, now tested. |
| 24 | `wc-24-cart-deck` | Consistent: width at least 1.5 m plus mass at most 6 kg. Long alone does not widen a plank. A narrow spanning rope needs width feedback, now tested. |
| 25 | `wc-25-gentle-breeze` | Consistent: forward force 4–6 N; one ordinary fan works, two or one powerful fan exceed the upper bound. Reversed orientation needs movement/rotation recovery, now tested. |
| 26 | `wc-26-gardeners-crate` | Consistent: two same-looking crates have distinct packing histories; only the gardener's crate counts. Removing `light` returns it to 4 kg, within greater than 3 and at most 6. |
| 27 | `g8-history` | Consistent: helper/fountain history identifies the medicine crate; moving it preserves that history. Wrong-identity feedback must remain separate from adequate total mass. |
| 28 | `wc-28-light-lift` | Consistent: eight spaces, width at most 2.1 m, mass at most 6 kg on one vessel. Boat and large crate fit; large boat is too heavy. |
| 29 | `wc-29-two-fans` | Consistent: 8–10 N; two regular 4 N fans work and 12 N fails. Adjacent positions still contribute to the same wind station. |
| 30 | `wc-30-narrow-harbour` | Consistent: carrier width/capacity and total fan force belong to different roles. Both need clear status; a suitable carrier should lead to adding/selecting fans. |
| 31 | `g9-cargo` | Physical mission is consistent. Updated “Try describing” makes the two-modifier practice optional while retaining valid boat alternatives and narrower evidence attribution. |
| 32 | `wc-32-timber-bulk-mail` | Consistent: wooden carrier, at least 14 spaces, at most 8 kg. Large boat 30/6.5 fits; large crate 10 does not. |
| 33 | `wc-33-rope-restrictions` | Numerical requirements and rope alternatives are consistent. Updated teaching text asks the learner to check all values and explains that `small` also shortens a plank. |
| 34 | `wc-34-light-wooden-load` | Consistent: eight spaces, wood, at most 2 kg. Light boat and large light crate preserve capacity; small is not a substitute for light. |
| 35 | `wc-35-from-power` | Consistent: `power` noun versus fan adjective `powerful`/`powerless`. Two ordinary fans remain a legitimate alternate with no false family-production credit. |
| 36 | `g9-power` | Explicit Fan A and supplementary repaired clause correctly avoid identifying by repair alone. Updated “belongs to” avoids the false claim that the seed is already at the dock. |
| 37 | `wc-37-quiet-nest` | Consistent: exactly 0 N is a safety requirement, and the ferry is independently powered. No implication that zero force propels the sail. |
| 38 | `wc-38-three-sponges` | Consistent absorption/count reasoning: ordinary 4, large 10, required 12. Updated title avoids the unsupported `soft` adjective; three regular or two large sponges remain valid. |
| 39 | `wc-39-wet-lock` | Consistent: absorption and unlocking are different roles. A completed key should lead toward missing absorption, and a sponge cannot replace the key. |
| 40 | `wc-40-quiet-cargo` | Consistent: 0 N named clock fan plus wooden eight-space vessel at most 2 kg. Force belongs to fan; mass/material bounds belong to vessel. Separate powered ferry explains motion at zero wind. Boarding grammar was corrected. |
| 41 | `wc-41-air-invitation` | Consistent numerical invitation to use a balloon. `light` no longer makes it heavier; regression confirms it still meets the 0.5 kg ceiling. Heavy-balloon ferry feedback now names that ceiling. |
| 42 | `wc-42-harbour-boat` | Consistent: borrowed-from direction distinguishes same-looking boats. One named wooden boat needs at least 20 spaces and at most 7 kg. New identical boats must not replace the referent. |
| 43 | `wc-43-light-wind` | Consistent mission: at least 8 N and each contributing fan at most 2 kg. Feedback must explain an overweight fan's exclusion, now tested. |
| 44 | `wc-44-metal-returns` | Consistent mission/hints: all plate items metal, total 7–9 kg. This is material sorting, not universal magnetism. Mixed-load feedback now has a regression. |
| 45 | `g9-storm` | Consistent: known raft with supplementary information, identified tree fan, and eight-space floating vessel. Named-fan selection and carrier progress must remain distinct. |
| 46 | `wc-46-flooded-archive` | Consistent: at least 16 absorption plus light. Four ordinary sponges are physically valid, but entry supports count words only through three; explain repeated creation if the player tries to type `four sponges`. |
| 47 | `wc-47-light-bulk-signal` | Consistent: large/light wooden vessel for 14 plus exact 8–10 N aggregate. One powerful fan is excessive; force constraints must not bind the wooden vessel's material. |
| 48 | `wc-48-original-rope` | Consistent: original helper/fountain rope identity survives length modification. Width and mass bounds are genuine and an identical new rope remains insufficient. |
| 49 | `wc-49-night-mail` | Consistent three roles and quantities. Updated wording removes the sequence requirement; any placement order is valid. |
| 50 | `wc-50-festival-lights` | Four roles and lent-to direction remain consistent. Updated mission explicitly states 20 parcels, width at most 3 m, mass at most 2 kg, and force 12–16 N. A contract test matches all five numbers to the enforced goals. Selected completed key/lamp still offers selection for the named fan. Visible-copy verification belongs to lead's targeted replay and phone check. |

## Evidence and limits

`npx tsx --test tests/full-campaign-feedback.test.ts`: **18 passed, 0 failed** at the final recorded rerun. Earlier runs recorded the specific numeric/material feedback failures, combined-role priority failures, and omitted ferry limits before the lead's corrections. The suite checks counterfactual movement, existing-object revision, missing story-object recovery, the actual reason for numeric/material rejection, meaningful `light` semantics, truthful next actions in combined tasks, and exact agreement between the final mission's stated numeric bounds and all enforced numeric goals.

This review deliberately does not equate model copying, automatically supplied articles, displayed hints, spelling suggestions, or assisted edits with unaided English production. It also does not infer fun, retained learning, successful native input, or all-50 browser completion from pure functions. The lead's new fresh-save playthrough must record those separate UI results and any subsequent defects.
