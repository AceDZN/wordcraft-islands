# Campaign progression and browser QA

Status: **GAMEPLAY VERIFIED — 50/50 levels completed.** Additional post-campaign repetition is limited by browser automation timeouts.

Command: `CAMPAIGN_QA_RESUME=1 npx tsx tests/campaign-browser.mjs` at http://localhost:5263.

The fresh run completed levels 1–28. After fixing adjacent-pad placement, the exact recorded 28-win checkpoint was resumed through 29–50, without adding completion IDs. The campaign uses real notebook creation/modification, placement, contextual travel and ordinary progression. Travel advances through 160 ms calls to the same simulation hook; no player position or win state is injected. Map/migration/mobile fixtures are separate and never count as played levels. Source grades are internal metadata, not access gates.

## Sequential campaign

| # | Level | Kind | Objects used | Route samples | Completed / frontier | Audio loops / geometries |
|---|---|---|---|---|---|---|
| 1 | g7-crossing | bridge | a plank @crossing | 17 | 1 / 2 | 3 / 70 |
| 2 | wc-02-first-cover | shelter | an umbrella @parcel-1 | 18 | 2 / 3 | 3 / 109 |
| 3 | g7-rain | shelter | an umbrella @parcel-n; an umbrella @parcel-s | 19 | 3 / 4 | 3 / 149 |
| 4 | wc-04-rope-anchors | bridge | a ladder @crossing | 19 | 4 / 5 | 3 / 77 |
| 5 | wc-05-three-stops | shelter | an umbrella @parcel-1; an umbrella @parcel-2; an umbrella @parcel-3 | 18 | 5 / 6 | 3 / 189 |
| 6 | g7-inlet | ferry | a boat @ferry | 21 | 6 / 7 | 3 / 76 |
| 7 | wc-07-hold-the-dock | weight | a boat @plate | 18 | 7 / 8 | 3 / 82 |
| 8 | wc-08-first-sponge | workshop | a large sponge @spill | 16 | 8 / 9 | 3 / 99 |
| 9 | wc-09-keepers-key | workshop | a key @chest | 16 | 9 / 10 | 3 / 70 |
| 10 | wc-10-sealed-ferry | ferry | a boat @ferry; a key @chest | 19 | 10 / 11 | 3 / 80 |
| 11 | g8-length | bridge | a long plank @crossing | 16 | 11 / 12 | 3 / 72 |
| 12 | wc-12-wide-roof | shelter | an umbrella @parcel-1; an umbrella @parcel-2 | 18 | 12 / 13 | 3 / 150 |
| 13 | wc-13-light-dock | weight | modify dock-crate: a crate @plate | 18 | 13 / 14 | 3 / 82 |
| 14 | g8-weight | weight | a heavy boat @plate | 16 | 14 / 15 | 3 / 85 |
| 15 | wc-15-six-parcels | cargo | a boat @cargo | 20 | 15 / 16 | 3 / 77 |
| 16 | wc-16-timber-carrier | cargo | a boat @cargo | 20 | 16 / 17 | 3 / 77 |
| 17 | wc-17-fog-light | workshop | a bright lamp @cave | 19 | 17 / 18 | 3 / 71 |
| 18 | wc-18-narrow-berth | ferry | a crate @ferry | 17 | 18 / 19 | 3 / 78 |
| 19 | wc-19-four-at-narrow-dock | cargo | a crate @cargo | 17 | 19 / 20 | 3 / 78 |
| 20 | wc-20-rain-beacon | shelter | an umbrella @parcel-1; an umbrella @parcel-2; a bright lamp @cave | 17 | 20 / 21 | 3 / 155 |
| 21 | wc-21-more-than-sample | weight | a boat @plate | 16 | 21 / 22 | 3 / 86 |
| 22 | wc-22-between-marks | weight | a large boat @plate | 16 | 22 / 23 | 3 / 87 |
| 23 | wc-23-light-long-bridge | bridge | a long plank @crossing | 17 | 23 / 24 | 3 / 73 |
| 24 | wc-24-cart-deck | bridge | a large plank @crossing | 17 | 24 / 25 | 3 / 73 |
| 25 | wc-25-gentle-breeze | wind | a fan @wind | 22 | 25 / 26 | 3 / 93 |
| 26 | wc-26-gardeners-crate | weight | modify gardener-load: a crate @plate | 19 | 26 / 27 | 3 / 86 |
| 27 | g8-history | weight | modify medicine: a metal crate @plate | 16 | 27 / 28 | 3 / 89 |
| 28 | wc-28-light-lift | cargo | a boat @cargo | 19 | 28 / 29 | 3 / 78 |
| 29 | wc-29-two-fans | wind | two fans @wind,wind-b | 20 | 29 / 30 | 3 / 105 |
| 30 | wc-30-narrow-harbour | storm | a crate @cargo; a fan @wind; a fan @wind-b | 19 | 30 / 31 | 3 / 107 |
| 31 | g9-cargo | cargo | a boat @cargo | 20 | 31 / 32 | 3 / 77 |
| 32 | wc-32-timber-bulk-mail | cargo | a large boat @cargo | 19 | 32 / 33 | 3 / 77 |
| 33 | wc-33-rope-restrictions | bridge | a long rope @crossing | 16 | 33 / 34 | 3 / 69 |
| 34 | wc-34-light-wooden-load | cargo | a light boat @cargo | 19 | 34 / 35 | 3 / 77 |
| 35 | wc-35-from-power | wind | a powerful fan @wind | 19 | 35 / 36 | 3 / 93 |
| 36 | g9-power | wind | modify fan-a: a powerful fan @wind | 20 | 36 / 37 | 3 / 106 |
| 37 | wc-37-quiet-nest | wind | modify nest-fan: a powerless fan @wind | 21 | 37 / 38 | 3 / 92 |
| 38 | wc-38-three-sponges | workshop | three sponges @spill,spill-b,spill-c | 16 | 38 / 39 | 3 / 165 |
| 39 | wc-39-wet-lock | workshop | a key @chest; a large sponge @spill | 16 | 39 / 40 | 3 / 106 |
| 40 | wc-40-quiet-cargo | storm | a light boat @cargo; modify clock-fan: a powerless fan @wind | 19 | 40 / 41 | 3 / 93 |
| 41 | wc-41-air-invitation | ferry | a balloon @ferry | 17 | 41 / 42 | 3 / 78 |
| 42 | wc-42-harbour-boat | cargo | modify borrowed-boat: a large boat @cargo | 19 | 42 / 43 | 3 / 78 |
| 43 | wc-43-light-wind | wind | a light powerful fan @wind | 19 | 43 / 44 | 3 / 94 |
| 44 | wc-44-metal-returns | weight | a large metal bucket @plate | 18 | 44 / 45 | 3 / 89 |
| 45 | g9-storm | storm | a boat @cargo; modify tree-fan: a powerful fan @wind | 20 | 45 / 46 | 3 / 111 |
| 46 | wc-46-flooded-archive | workshop | a bright lamp @cave; a large sponge @spill; a large sponge @spill-b | 20 | 46 / 47 | 3 / 138 |
| 47 | wc-47-light-bulk-signal | storm | a large light boat @cargo; a fan @wind; a fan @wind-b | 18 | 47 / 48 | 3 / 110 |
| 48 | wc-48-original-rope | bridge | modify rescue-rope: a long rope @crossing | 17 | 48 / 49 | 3 / 75 |
| 49 | wc-49-night-mail | cargo | a large boat @cargo; a key @chest; a bright lamp @cave | 18 | 49 / 50 | 3 / 85 |
| 50 | wc-50-festival-lights | storm | a large light boat @cargo; modify festival-fan: a powerful fan @wind; a key @chest; a bright lamp @cave | 19 | 50 / 50 | 3 / 115 |

## Controls, saves and audio

- Fresh map shows50 nodes, only level1 playable; locked level50 pointer cannot enter
- Initial renderer resource sample: {"stats":{"calls":37,"triangles":29727,"geometries":36}}
- Natural single completion flourish: {"number":1,"loops":3}
- Renderer level1 empty replay after ten wins: {"stats":{"calls":37,"triangles":29727,"geometries":37}}
- Completed map replay and reload Resume preserve ten earned wins/frontier11
- Later numeric misconception and undo recovery: {"number":25,"id":"wc-25-gentle-breeze","note":"12N exceeds declared force maximum"}
- Natural single completion flourish: {"number":25,"loops":3}
- Later identified-object mistake and undo recovery: {"number":26,"id":"wc-26-gardeners-crate","wrong":"helper-load","required":"gardener-load"}
- Continuation restored exact previously earned UI save; no new completion IDs added: {"completed":28,"reason":"Exact captured actual UI save after28 sequential wins; independent planner chose unnecessarily large fans at29; no win or unlocked ID added."}
- UI resumed the exact next incomplete island after saved checkpoint: {"number":29,"completed":28}
- Initial renderer resource sample: {"stats":{"calls":50,"triangles":30752,"geometries":47}}
- Actual plural batch creation and placement: {"number":29,"phrase":"two fans","samples":[{"remaining":1,"force":4,"absorbed":0,"ready":false,"positions":[{"id":"created-1","x":-3.8,"z":-1.3}]},{"remaining":0,"force":8,"absorbed":0,"ready":true,"positions":[{"id":"created-1","x":-3.8,"z":-1.3},{"id":"created-2","x":-3.8,"z":-0.25}]}]}
- Actual plural batch creation and placement: {"number":38,"phrase":"three sponges","samples":[{"remaining":2,"force":0,"absorbed":4,"ready":false,"positions":[{"id":"created-11","x":0,"z":0}]},{"remaining":1,"force":0,"absorbed":8,"ready":false,"positions":[{"id":"created-11","x":0,"z":0},{"id":"created-12","x":1.05,"z":0}]},{"remaining":0,"force":0,"absorbed":12,"ready":true,"positions":[{"id":"created-11","x":0,"z":0},{"id":"created-12","x":1.05,"z":0},{"id":"created-13","x":0,"z":1.05}]}]}
- Later identified-object mistake and undo recovery: {"number":42,"id":"wc-42-harbour-boat","wrong":"returned-boat","required":"borrowed-boat"}
- Later identified-object mistake and undo recovery: {"number":48,"id":"wc-48-original-rope","wrong":"garden-rope","required":"rescue-rope"}
- Natural single completion flourish: {"number":50,"loops":3}
- All50 genuine sequential wins; final Next does not wrap to level1
- Renderer resources sampled throughout50: {"samples":[{"number":29,"calls":108,"triangles":33048,"geometries":105},{"number":30,"calls":111,"triangles":38897,"geometries":107},{"number":31,"calls":68,"triangles":43354,"geometries":77},{"number":32,"calls":68,"triangles":43354,"geometries":77},{"number":33,"calls":68,"triangles":30447,"geometries":69},{"number":34,"calls":68,"triangles":43354,"geometries":77},{"number":35,"calls":94,"triangles":32020,"geometries":93},{"number":36,"calls":106,"triangles":32278,"geometries":106},{"number":37,"calls":92,"triangles":31250,"geometries":92},{"number":38,"calls":166,"triangles":34825,"geometries":165},{"number":39,"calls":107,"triangles":32953,"geometries":106},{"number":40,"calls":88,"triangles":45251,"geometries":93},{"number":41,"calls":68,"triangles":48953,"geometries":78},{"number":42,"calls":69,"triangles":56741,"geometries":78},{"number":43,"calls":94,"triangles":32020,"geometries":94},{"number":44,"calls":89,"triangles":30531,"geometries":89},{"number":45,"calls":105,"triangles":46711,"geometries":111},{"number":46,"calls":139,"triangles":53961,"geometries":138},{"number":47,"calls":104,"triangles":47049,"geometries":110},{"number":48,"calls":72,"triangles":31359,"geometries":75},{"number":49,"calls":77,"triangles":64664,"geometries":85},{"number":50,"calls":111,"triangles":67589,"geometries":115}]}
- Continuation restored exact previously earned UI save; no new completion IDs added: {"completed":50,"reason":"Exact actual UI save after all 50 sequential real-object wins; final map passed, then test helper closed it and tried a blocked header. Restored only for remaining controls; no IDs invented."}

## Limits

This is a mechanical solvability/progression and browser playback check. It does not establish retained English mastery, spontaneous learner comprehension, subjective engagement, or human musical audition. Travel uses deterministic time steps; audio tail/mute checks use real elapsed time. Native tab-hide and platform speech limitations remain in AUDIO.md. No new music, assets, runtime files, debug unlocks, or production wins are added by this harness.

## Additional probe timeout (after all 50 wins)

TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5263/", waiting until "networkidle"


```json
{
  "errors": []
}
```

## Final verification boundary

Observed: all 50 actual UI wins; wrong-identity recovery including named boat 42 and rope 48; final four-object level 50 route; final Next opens the completed map without wrapping; replay/reload at 10 earned wins; 17 decoded audio buffers/3 loops retained throughout; real two-fan batch 4→8N and three-sponge batch 4→8→12. Renderer geometry counts drop between scenes rather than monotonically accumulating.

Separate successful evidence: fresh desktop/mobile 50-node map, locked targets, keyboard/focus/Escape/touch in docs/CAMPAIGN_VISUAL.md; ordinary real-time first-two wins and 2/50 map in docs/campaign/campaign-flow.mp4; final existing skill client on the static build passed (headed 127.0.0.1:4263, 5 models/no errors,17 buffers/3 loops). Root's final restored-profile visual/control replay used visible forced pointer actions and normal 16ms simulation steps: two fans 8N, partial absorption 4, three sponges 12 and ready, 0 errors. Its PNGs/JSON are in docs/campaign and are not counted as played wins.

The final extra post-campaign touch/gain/mute/restart/legacy-UI and same-scene restart repetition was not completed: startup, navigation and Playwright frame-stability waits timed out across retry probes. No runtime/page error or failed physical predicate was observed in these startup/control-only failures. These checks are unverified; earlier observed map/audio controls and 15 pure progression tests stay separate. Browser contexts were isolated from user saves; no production debug unlock or position/win injection was added. No human enjoyment, learning gain or musical-quality claim follows from these checks.
