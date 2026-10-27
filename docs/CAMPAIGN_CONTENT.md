# One continuous Wordcraft campaign

The current user steering replaces the former three grade packs with **one ordered campaign of 50 authored levels**, in five chapters of ten. There is no grade selector, grade lock or curriculum branch. The old grade values remain internal source metadata only. Levels 1–10 draw mainly on the first saved vocabulary/article sources, 11–30 develop properties/comparison/reference, and 31–50 develop precise descriptions and combinations. This metadata is not a test of a child's school grade.

## Campaign shape

- **1–10: המכתבים הראשונים.** Concrete nouns, meaningful count, first carrier, plate, sponge and key uses.
- **11–20: מילים משנות דברים.** Length, coverage, mass, capacity, material, illumination and narrow carriers.
- **21–30: משווים ובוחרים.** Read comparisons against actual quantities; identify histories; combine accurate quantities.
- **31–40: מתארים בדיוק.** Use several modifiers and the power family; distinguish identifying from additional information.
- **41–50: הדרך לחגיגה.** Apply known words and relationships to cumulative festival deliveries.

The campaign introduces one useful idea, lets the player reuse it with less support, and later recombines it. Difficulty labels follow chapters rather than speed or timers. Tutorial breathers can simplify the physical demand while introducing a new language use. The new levels are authored constraints and original situations, not duplicated color/name variants.

## Data and engine contract

- Source: src/campaign-levels.ts exports levels, chapters and solutionActions. Each level has a unique number 1–50 and stable ID.
- guide is an optional, level-specific full phrase. It is a shown model and must count as assistance. Target-identity guides 13/26 require inspecting/modifying existing objects rather than creating a new ID.
- Goals use actual supported span, coverage, buoyancy, capacity, width, mass, force, lock, light and absorption predicates. No victory compares input with a witness phrase.
- Numeric bounds are inclusive. The existing weight reference remains strict “heavier than”. Weight totals are on the plate; a target crate itself must meet its required mass. Carrier bounds apply to the vessel; storm fan mass is not cargo mass. Untargeted fan force sums forward fans; targeted wind uses the named fan.
- A sponge has 4 absorption units, large 10 and small 1.6 in this bounded toy model. Content calls these litres; this is a defined game quantity, not a universal claim about real sponges. Sponges aggregate at the spill area.
- Chest/key and cave/light positions are existing fixed landmarks. The main app appends these overlay targets after primary targets when needed; they are not rain parcels. Secondary wind/spill pads allow distinct visible count instances within the main interaction area.
- Real English outside the finite catalog is unsupported, not bad English. Bare nouns, shown models, dictionary/translation, spelling suggestions and supplied edit scaffolds must not earn unaided article/noun retrieval credit. Valid alternate physical solutions remain wins even when they bypass an intended target form.

## Exact source key

These are the supplied Workbook snapshots, not an assertion that all rules in a page or an annual vocabulary band are covered. V7/V8/V9 support learning a word in context; the game noun set is original and finite. The comparison tasks assess interpretation and property choice, not production of comparative sentences. Relative clauses guide selection/history; the learner does not produce the clauses.

| Code | Saved source | Selected use |
| --- | --- | --- |
| N7 | [G7 nouns, plurals and articles](https://english.workbook.co.il/grade-7/chapter-11/nouns-plurals-and-articles) | a/an by supported next sound; count/plural noun production |
| V7 | [G7 vocabulary and spelling](https://english.workbook.co.il/grade-7/chapter-12/vocabulary-and-spelling-guide) | retrieve/spell a useful noun and revise with feedback |
| A8 | [G8 adjectives and comparison](https://english.workbook.co.il/grade-8/chapter-11/adjectives-and-comparison) | descriptive properties and reading a comparison against actual quantities |
| R8 | [G8 relative clauses](https://english.workbook.co.il/grade-8/chapter-11/relative-clauses-reference) | identify an object from a clause/history |
| V8 | [G8 context and word choice](https://english.workbook.co.il/grade-8/chapter-12/vocabulary-context-and-word-choice) | choose a meaning/property that fits the world need |
| N9 | [G9 noun modifiers](https://english.workbook.co.il/grade-9/chapter-11/nouns-and-noun-modifiers-reference) | multi-modifier meanings, common size/material order, plural phrases |
| R9 | [G9 relative clauses](https://english.workbook.co.il/grade-9/chapter-11/relative-clauses-reference) | known referent versus identifying information; object-relative history |
| W9 | [G9 word formation and spelling](https://english.workbook.co.il/grade-9/chapter-12/word-formation-and-spelling-reference) | the selected power/powerful/powerless family in context |
| V9 | [G9 vocabulary in context](https://english.workbook.co.il/grade-9/chapter-12/vocabulary-in-context-reference) | precise descriptive word choice and changed-context application |

Chapter 10, extended writing, pronunciation/speaking assessment, literature, the whole tense system, the full suffix/prefix system and retained mastery are excluded. A later campaign level can reuse an earlier source; source grade is not a gameplay gate.

## Per-level authorship and source mapping

The source codes identify intended selected practice, not skills automatically credited on every win. Automatic models are assisted; alternatives can legitimately demonstrate a smaller skill set.

| # | Stable ID / title | What changes the valid action | Source modules |
| --- | --- | --- | --- |
| 1 | g7-crossing — The little crossing | Name a rigid crossing; both ends must reach support. | N7, V7 |
| 2 | wc-02-first-cover — One parcel in the rain | One new rain-cover noun; an before the next vowel sound. | N7, V7 |
| 3 | g7-rain — Rain on the post | Two separated coverage points make quantity useful. | N7, V7 |
| 4 | wc-04-rope-anchors — The rope anchors | The ordinary plank now fails reach; rope and ladder remain alternatives. | N7, V7 |
| 5 | wc-05-three-stops — Three delivery stops | Three distant parcels require a count/coverage plan. | N7, V7 |
| 6 | g7-inlet — Across the inlet | Switch from spanning a gap to carrying a passenger afloat. | N7, V7 |
| 7 | wc-07-hold-the-dock — Hold the dock | A familiar noun now operates a pressure plate (more than 3 kg). | N7, V7 |
| 8 | wc-08-first-sponge — A spill by the steps | Absorption changes a puddle; a rain roof does not absorb it. | N7, V7 |
| 9 | wc-09-keepers-key — The keeper's chest | A key opens a tangible lock; crossing construction is not required. | N7, V7 |
| 10 | wc-10-sealed-ferry — The sealed ferry | First cumulative delivery: floating carrier plus unlocked dispatch chest. | N7, V7 |
| 11 | g8-length — Longer than the gap | Long changes geometry; a short sample no longer reaches. | A8, V8 |
| 12 | wc-12-wide-roof — A wider roof | A larger roof reaches both from the first parcel; other valid coverage remains welcome. | A8, V8 |
| 13 | wc-13-light-dock — Too much for the dock | Reduce an existing identified heavy crate below a load limit. | A8, V8 |
| 14 | g8-weight — The counterweight dock | Heavier than 6 differs from merely large; compare actual masses. | A8, V8 |
| 15 | wc-15-six-parcels — Room for six | Increase floating capacity; heavy does not add space. | A8, V8 |
| 16 | wc-16-timber-carrier — Timber at the berth | Material request and buoyancy distinguish wood from the workshop metal crate. | A8, V8 |
| 17 | wc-17-fog-light — A light in the fog | Bright/unlit changes illumination rather than mass. | A8, V8 |
| 18 | wc-18-narrow-berth — The narrow berth | A narrow berth rejects a normal boat while a small boat/other narrow carrier can fit. | A8, V8 |
| 19 | wc-19-four-at-narrow-dock — Four letters, one trip | Add capacity 4 to the narrow berth: the previously valid ordinary balloon is insufficient. | A8, V8 |
| 20 | wc-20-rain-beacon — The rain beacon | Transfer cover vocabulary and illumination into a two-goal night collection. | A8, V8 |
| 21 | wc-21-more-than-sample — More than the sample | Strictly more than 4 kg excludes an exactly 4 kg crate; an actual larger value is needed. | A8, V8 |
| 22 | wc-22-between-marks — Between two marks | A lower and upper mass bound reject both insufficient load and a 12 kg object that is too heavy. | A8, V8 |
| 23 | wc-23-light-long-bridge — Light but long | Long reach and low mass must hold on the same bridge object. | A8, V8 |
| 24 | wc-24-cart-deck — A deck for the cart | A cart requires deck width as well as supported length and a mass limit. | A8, V8 |
| 25 | wc-25-gentle-breeze — A gentle breeze | A gentle force band rejects both no wind and excess wind; larger is not stronger. | A8, V8 |
| 26 | wc-26-gardeners-crate — The gardener's crate | First guided identifying history plus a bounded mass change (remove light). | R8, A8, V8 |
| 27 | g8-history — The medicine crate | History identifies medicine in a new arrangement; the identified crate itself must become heavy. | R8, A8, V8 |
| 28 | wc-28-light-lift — Keep the lift light | Capacity, width and mass constrain one carrier; a larger boat can be the wrong choice. | A8, V8 |
| 29 | wc-29-two-fans — Two fans, one sail | Count changes aggregate force: two ordinary fans provide 8 N, while a powerful fan provides 12 N and exceeds the limit. | N7, A8, V8 |
| 30 | wc-30-narrow-harbour — The narrow harbour express | Transfer narrow cargo and a force band into one departure. | N7, A8, V8 |
| 31 | g9-cargo — The floating store | Formal size/material phrase model; physical alternatives remain valid without false modifier credit. | N9, V9 |
| 32 | wc-32-timber-bulk-mail — Timber for the bulk mail | A 14-parcel minimum excludes an ordinary boat (12) and large crate (10); a large wooden boat works. | N9, V9 |
| 33 | wc-33-rope-restrictions — The narrow rescue line | Width and mass limits eliminate an otherwise long plank; a light narrow line is useful. | N9, V9 |
| 34 | wc-34-light-wooden-load — Light timber, full carrier | Light preserves carrying space while small reduces it; material remains a separate property. | N9, V9 |
| 35 | wc-35-from-power — From power to powerful | Power is a noun; powerful/powerless adjectives change observable fan force. | W9, V9 |
| 36 | g9-power — Power for the sail | A named Fan A is already identified; both candidates satisfy the additional repaired information. | R9, W9, V9 |
| 37 | wc-37-quiet-nest — Quiet by the nest | Negative family meaning: stop the named fan at 0 N before a separately powered ferry leaves. | W9, V9 |
| 38 | wc-38-three-sponges — Three soft sponges | Quantity and size combine for 12 units of absorption; one large sponge supplies only 10. | N9, V9 |
| 39 | wc-39-wet-lock — The wet lock | Absorb water and open a lock; one kind of object cannot satisfy both uses. | N9, V9 |
| 40 | wc-40-quiet-cargo — The quiet cargo departure | Transfer zero-force safety and light wooden cargo into the same departure. | N9, W9, V9 |
| 41 | wc-41-air-invitation — An air-mail invitation | Three physical bounds select an unusually light carrier; new balloon noun has a practical use. | N9, V9 |
| 42 | wc-42-harbour-boat — The boat the helper borrowed | Object relative history reverses lender/borrower roles; enlarge the original identified boat. | R9, N9, V9 |
| 43 | wc-43-light-wind — Leave the heavy fan behind | Force and mass are independent: light powerful or two light ordinary fans are valid alternatives. | N9, W9, V9 |
| 44 | wc-44-metal-returns — Sort the metal returns | A material-sorting request plus 7–9 kg total permits different metal combinations. | A8, N9, V9 |
| 45 | g9-storm — The supply run | Combine a defining fan description with additional information about a known raft. | R9, N9, W9, V9 |
| 46 | wc-46-flooded-archive — The flooded archive | Increase absorption beyond a three-ordinary-sponge plan and add a light source. | N9, V9 |
| 47 | wc-47-light-bulk-signal — The signaller's invitation | Carrier capacity needs large plus low mass; separate fan count must stay within 8–10 N. | A8, N9, V9 |
| 48 | wc-48-original-rope — The original rescue rope | Preserve the described rope identity while changing reach; a new identical rope does not satisfy history. | R9, N9, V9 |
| 49 | wc-49-night-mail — Prepare the night mail | Three distinct uses: open chest, illuminate marker, and provide bulk floating cargo. | N9, V9 |
| 50 | wc-50-festival-lights — Lights for every island | Final synthesis: large/light wooden cargo, identified powerful fan, key and illumination. | R9, N9, W9, V9 |

## Authored witness actions for independent QA

These are one deliberately authored solvable path per level, not a password list or runtime answer oracle. Each plural phrase yields separate tangible objects; the zones show one destination per instance. Independent QA should also try wrong-property, alternate-object and assistance cases against the predicates.

| # | One example path | Support |
| --- | --- | --- |
| 1 | a plank → crossing | Shown guide: a plank |
| 2 | an umbrella → parcel-1 | Shown guide: an umbrella |
| 3 | two umbrellas → parcel-n + parcel-s | No automatic phrase model |
| 4 | a rope → crossing | Shown guide: a rope |
| 5 | three umbrellas → parcel-1 + parcel-2 + parcel-3 | No automatic phrase model |
| 6 | a boat → ferry | Shown guide: a boat |
| 7 | a crate → plate | Shown guide: a crate |
| 8 | a sponge → spill | Shown guide: a sponge |
| 9 | a key → chest | Shown guide: a key |
| 10 | a boat → ferry; a key → chest | No automatic phrase model |
| 11 | a long plank → crossing | Shown guide: a long plank |
| 12 | a large umbrella → parcel-1 | Shown guide: a large umbrella |
| 13 | Modify dock-crate: a light crate → plate | Shown guide: a light crate |
| 14 | a heavy bucket → plate | No automatic phrase model |
| 15 | a large crate → cargo | Shown guide: a large crate |
| 16 | a wooden boat → cargo | Shown guide: a wooden boat |
| 17 | a bright lamp → cave | Shown guide: a bright lamp |
| 18 | a small boat → ferry | Shown guide: a small boat |
| 19 | a small boat → cargo | No automatic phrase model |
| 20 | two umbrellas → parcel-1 + parcel-2; a bright lamp → cave | No automatic phrase model |
| 21 | a large crate → plate | Shown guide: a large crate |
| 22 | two crates → plate + plate-b | No automatic phrase model |
| 23 | a long rope → crossing | Shown guide: a long rope |
| 24 | a large plank → crossing | No automatic phrase model |
| 25 | a fan → wind | Shown guide: a fan |
| 26 | Modify gardener-load: a crate → plate | Shown guide: a crate |
| 27 | Modify medicine: a heavy crate → plate | No automatic phrase model |
| 28 | a boat → cargo | No automatic phrase model |
| 29 | two fans → wind + wind-b | Shown guide: two fans |
| 30 | a small boat → cargo; two fans → wind + wind-b | No automatic phrase model |
| 31 | a large wooden crate → cargo | Shown guide: a large wooden crate |
| 32 | a large wooden boat → cargo | No automatic phrase model |
| 33 | a long rope → crossing | No automatic phrase model |
| 34 | a light wooden boat → cargo | Shown guide: a light wooden boat |
| 35 | a powerful fan → wind | Shown guide: a powerful fan |
| 36 | Modify fan-a: a powerful fan → wind | No automatic phrase model |
| 37 | Modify nest-fan: a powerless fan → wind | No automatic phrase model |
| 38 | three sponges → spill + spill-b + spill-c | No automatic phrase model |
| 39 | two sponges → spill + spill-b; a key → chest | No automatic phrase model |
| 40 | a light wooden boat → cargo; Modify clock-fan: a powerless fan → wind | No automatic phrase model |
| 41 | a balloon → ferry | Shown guide: a balloon |
| 42 | Modify borrowed-boat: a large wooden boat → cargo | No automatic phrase model |
| 43 | two light fans → wind + wind-b | No automatic phrase model |
| 44 | a large metal bucket → plate | No automatic phrase model |
| 45 | a large wooden crate → cargo; Modify tree-fan: a powerful fan → wind | No automatic phrase model |
| 46 | two large sponges → spill + spill-b; a bright lamp → cave | No automatic phrase model |
| 47 | a large light wooden boat → cargo; two fans → wind + wind-b | No automatic phrase model |
| 48 | Modify rescue-rope: a long rope → crossing | No automatic phrase model |
| 49 | a large wooden boat → cargo; a key → chest; a bright lamp → cave | No automatic phrase model |
| 50 | a large light wooden boat → cargo; Modify festival-fan: a powerful fan → wind; a key → chest; a bright lamp → cave | No automatic phrase model |

## Continuity and verification

The former nine IDs are retained at 1, 3, 6, 11, 14, 27, 31, 36, 45 for save migration. Their core original goal predicates remain; the continuous campaign changes their instructional position. In particular, level 6 now introduces the carrier as a guided step; do not describe it as the current campaign's unaided transfer. New checkpoint 10 supplies the first cumulative transfer.

Author smoke check: 50 levels, 50 unique IDs and 50 witnesses; all witness phrases parsed and all 50 property simulations returned ready=true against the current engine. This was a simulation, not browser completion. Independent sequential browser/progression QA is running separately. No learning-gain or enjoyment claim follows from a solver.

Level 12 asks for both parcels dry, with a large roof from the first parcel as an instructional suggestion. An ordinary cover placed between them is a legitimate physical alternative. The revised mission matches the physical coverage predicate.
