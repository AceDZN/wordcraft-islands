# Wordcraft Islands — איים של מילים

A local, real-3D creation-notebook puzzle adventure for Hebrew-speaking English learners, with one 50-level campaign that grows in difficulty. Inspect a problem, write a noun phrase, summon an object, place or modify it, observe its properties, revise and explore. Original game world inspired by the Scribblenauts creation loop.

## Play

```sh
npm ci
npm run dev
```

Open **http://localhost:5263**. `npm run preview` serves the built version on **4263** after `npm run build`. Both ports are strict. No account, runtime backend, model service or API key is used. All models, the Hebrew/Latin font and audio are bundled locally. There is no production deployment.

Start with Enter or the visible button. The first guided notebook opens with a marked assisted model. Type a noun phrase, create its preview, choose a location and press Place. The preview stays snapped when the pointer moves. Once the physical solution works, the current-action button tries the route to the lighthouse: the courier really walks across the supported object or approaches and boards the ferry. You can also click/tap the ground to walk, or use WASD/arrows relative to the screen. Click an object to select it; visible controls on the left edit/replace, move or remove it. Edits preview without removing the original. Confirm places the change; Cancel and Undo preserve recovery. Player-created objects can change noun and quantity, while story objects retain their referenced identity. Supplied noun/article text earns no production evidence. Movement intentionally leaves a nonmodal inspector/help panel. N opens the notebook, E invokes the current action, Space hops when the canvas is focused and F toggles fullscreen. Escape exits the active interaction. Free placement, rotation, camera orbit and learning records are available on demand. Replaying mirrors source-object/landmark locations and reverses inspection order; identities/history stay authoritative. No movement/fullscreen shortcut runs while typing.

## 50 levels, one continuous journey

There is no grade selection or grade-based limit. Solve an island to open the next; use the 50-node map to see the journey and replay completed islands. Five chapters of 10 introduce useful objects, meaningful adjectives, comparisons, precise multi-property descriptions, then combined festival deliveries. Later puzzles combine cargo, force, object history, light and locks. They remain untimed.

Progress saves locally on level entry and completion. Reload offers the current island. Old nine-puzzle saves preserve the exact islands already won without inventing completion of the new intervening islands. Level 50 ends the campaign with a complete map; it does not wrap to level 1. All authored content and solution witnesses are documented in [CAMPAIGN_CONTENT.md](docs/CAMPAIGN_CONTENT.md).

The finite catalog contains plank, crate, ladder, rope, boat, balloon, umbrella, fan, key, lamp, bucket and sponge. Aliases: box → crate; lantern → lamp. Key, bright lamp and sponge have dedicated and combined chest, light and absorption tasks, as well as exploration uses. Size, length, mass, buoyancy, coverage, capacity, illumination and force have defined local effects. Multiple solutions exist. English changes the valid world action; no literal answer string determines a win.

Bare nouns are editor shorthand. Inferred articles/counts, dictionary/translation, hints and accepted spelling help do not earn unaided-production credit. Only objects that contribute to the world solution can contribute production evidence. Events stay local and are available in `render_game_to_text()`; campaign progress and audio settings persist on this browser. A single completion does not establish retained mastery.

## Verification and evidence

The reported wrong-ladder recovery is reviewed in [RECOVERY_QA.md](docs/RECOVERY_QA.md). `node tests/recovery-browser.mjs` exercises replacement/cancel/move/remove/Undo and native keyboard controls through earned levels1–13, with a simulated host composer. `node docs/recovery/layout-check.mjs` checks portrait touch and landscape controls, including switching from an editor to inventory.

- `npm test`: pure semantic fixtures, alternatives and property predicates.
- `npm run build`: TypeScript and static Vite build.
- `tests/campaign-browser.mjs`: current sequential 50-level UI campaign, progression and recovery checks. Exact evidence is in [CAMPAIGN_PLAYTEST.md](docs/CAMPAIGN_PLAYTEST.md). Earlier 9-puzzle scripts/captures are historical.
- [Campaign map visual review](docs/CAMPAIGN_VISUAL.md); the earlier play-feel rewrite remains in docs/UX_REVIEW.md.
- `window.render_game_to_text()` exposes visible objectives, quantities, item histories, assistance and audio state. `advanceTime(ms)` steps the same simulation without injecting a win.
- [PLAYTEST.md](PLAYTEST.md), [CURRICULUM.md](CURRICULUM.md), [coverage.json](coverage.json), [VISUAL_REVIEW.md](VISUAL_REVIEW.md).
- [Generated design target](docs/visual-targets/gameplay-target.png) is a mockup. Current campaign gameplay/map: [66-second actual playthrough](docs/campaign/campaign-flow.mp4), [50-level map](docs/campaign/map.png), and [recorded states](docs/campaign/record-states.json). The earlier play-feel recording is in docs/ux; older 9-puzzle captures retain historical evidence.
- [Audio preview](docs/audio/mixed-preview.wav), [AUDIO.md](AUDIO.md), [model sources](ASSETS.md), [Tripo search log](ASSET_SEARCH.md).

## Boundaries

Selected chapter-11/12 rules are covered, not all curriculum chapters. Chapter 10 belongs to the complementary games; there is no tense-assessment claim here. No speaking assessment, broad lexical mastery or retained-learning claim. The editor is not a complete English grammar checker. Article sound rules cover the disclosed words, not every English exception. Object mass/buoyancy are explicit toy-world parameters. Movement/collision use bounded deterministic surfaces rather than a general physics solver. Browser speech availability varies; text remains visible. No human musical-quality/learning-gain claim is inferred from automated checks.

Models reuse the user's owned Tripo outputs; four catalog meshes plus a rigged courier total ~3.15MB. No new Tripo models or credits. Scene terrain and exact functional props are procedural. The courier has a real 65-joint skin. Derived aligned idle/jog/single-hop clips correct the original source root mismatch and posture; source GLB stays unchanged. See docs/art/MOTION_REVIEW.md. See provenance and inherited reuse limitations in ASSETS.md.
