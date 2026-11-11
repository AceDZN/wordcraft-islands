# Campaign refresh — 11 November 2026

The 50 existing level IDs and their numeric order are retained, including the nine historical IDs used by saves and Workbook links. The campaign now has 29 different authored object nouns. Its primary solution object changes on every consecutive island. These are QA witnesses: completion is still decided by physical properties, placement and any stated story identity, never by matching a phrase in this document.

## Player-facing changes

Every island now starts with a problem instead of a copyable answer. All `guide` phrases have been removed from the campaign. Missions and Hebrew task text describe the situation and required outcomes. Optional hints explain the relevant physical relationship or strategy; optional teaching notes explain the English contrast without supplying a complete noun phrase to type.

The courier now visits orchards, harbours, ruins, marshes and festival stops. Each island declares an atmosphere, weather and a unique consequence for solving it. Rain accompanies shelter problems, wind accompanies wind stations, and fog accompanies illumination problems. These fields support the live scene changes implemented by the game renderer; they do not add hidden timing requirements.

Situations now include a picnic delivery caught in rain, an orchard gate, the sorting table, fragile cargo, a shared wind station, a flooded print shop and archive, a quiet nest, recycling returns and the final festival invitation route.

## Different ways to solve a problem

Examples exercised by the property tests:

| Situation | Distinct valid approaches |
|---|---|
| First broken crossing | Plank, ladder, rope, log or bridge |
| A letter in the rain | Umbrella, tarp, tent or raincoat |
| Two separated wet parcels | Separate covers or one sufficiently broad tarp |
| Crossing an inlet | Boat, canoe, raft, balloon or a sufficiently long physical bridge |
| Holding a pressure plate | Rock, cart, crate, chest or combined smaller loads |
| Clearing a spill | Sponge or an adequate quantity/size of towels |
| Lighting a marker | Torch, candle or an active lamp |
| Launching a sail | Fan, blower, windmill, or compatible combinations within the force bounds |
| Bulk mail | Different floating carriers, provided the same carrier meets capacity, material, width and mass limits |

Alternative object choices remain subject to all stated restrictions. A heavy floating object cannot bypass a mass cap; rain shelter cannot absorb a puddle; a rock is a useful counterweight but cannot satisfy metal-only recycling; a different look-alike cannot substitute for an identified story object.

The gardener's identified object on island 26 is now a cart, with the same target ID and weight bounds. The nest's identified machine on island 37 is now a blower, with the same target ID and zero-force safety condition. The original boat and rope identity challenges remain intact. Old hardcoded browser playbooks expecting a crate on 26 or a fan on 37 must use the current content; the saved level IDs do not change.

## Verification

`tests/dynamic-campaign.test.ts` checks alternative plans on 38 islands, actual spawned quantities and destination indices, all 50 current witnesses, 29-noun route diversity, no consecutive repeated primary noun, absent prefilled answers, authored mission copy without its QA answer phrase, scene/weather/consequence metadata, and failures across distinct property categories.

At this content checkpoint, `npm test` passed 159 tests, including the original 110 regression tests and the concurrently added vocabulary tests. A TypeScript/Vite build passed after the campaign rewrite. Runtime scene appearance, model integration, the full UI campaign, mobile layout and the final release are verified separately by the lead; these pure tests do not establish subjective enjoyment or retained English mastery.
