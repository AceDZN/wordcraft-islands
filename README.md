# Wordcraft Islands — איים של מילים

A local, real-3D creation-notebook puzzle adventure for Hebrew-speaking English learners in grades 7, 8 and 9. Inspect a problem, write a noun phrase, summon an object, place or modify it, observe its properties, revise and explore. Original game world inspired by the Scribblenauts creation loop.

## Play

```sh
npm ci
npm run dev
```

Open **http://localhost:5263**. `npm run preview` serves the built version on **4263** after `npm run build`. Both ports are strict. No account, runtime backend, model service or API key is used. All models, the Hebrew/Latin font and audio are bundled locally. There is no production deployment.

Start with Enter or the visible button. The first guided notebook opens with a marked assisted model. Type a noun phrase, create its preview, choose a location and press Place. The preview stays snapped when the pointer moves. Once the physical solution works, the current-action button tries the route to the lighthouse: the courier really walks across the supported object or approaches and boards the ferry. You can also click/tap the ground to walk, or use WASD/arrows relative to the screen. Click an object to inspect or modify it; edits keep the existing phrase. Supplied noun/article text earns no production evidence. Movement intentionally leaves a nonmodal inspector/help panel. N opens the notebook, E invokes the current action, Space hops and F toggles fullscreen. Escape exits the active interaction. Free placement, rotation, camera orbit and learning records are available on demand. Replaying mirrors source-object/landmark locations and reverses inspection order; identities/history stay authoritative. No movement/fullscreen shortcut runs while typing.

## Nine authored challenges

| Grade | Guided | Independent | Changed-context transfer |
|---|---|---|---|
| 7 | Create a crossing; singular noun/article | Keep two parcels dry; coverage/count | Choose a floating carrier for a wide inlet |
| 8 | Compare a span with a measured gap | Load a plate above a 6kg reference | Identify a medicine crate from stable history; change its mass |
| 9 | Combine size/material for floating cargo | Restore known Fan A using powerful/powerless | Identify a fan and combine force with an 8-parcel floating container |

The finite catalog contains plank, crate, ladder, rope, boat, balloon, umbrella, fan, key, lamp, bucket and sponge. Aliases: box → crate; lantern → lamp. Key and bright lamp have optional chest/marker uses. Size, length, mass, buoyancy, coverage, capacity, illumination and force have defined local effects. Multiple solutions exist. English changes the valid world action; no literal answer string determines a win.

Bare nouns are editor shorthand. Inferred articles/counts, dictionary/translation, hints and accepted spelling help do not earn unaided-production credit. Only objects that contribute to the world solution can contribute production evidence. Events stay local and are available in `render_game_to_text()`; completion and audio settings persist on this browser. A single completion does not establish retained mastery.

## Verification and evidence

- `npm test`: pure semantic fixtures, alternatives and property predicates.
- `npm run build`: TypeScript and static Vite build.
- `docs/qa-browser.mjs`: historical first-release campaign test. The play-feel revision is reviewed in docs/UX_REVIEW.md with revised tests under tests/ux*. Earlier captures predate this rewrite.
- `window.render_game_to_text()` exposes visible objectives, quantities, item histories, assistance and audio state. `advanceTime(ms)` steps the same simulation without injecting a win.
- [PLAYTEST.md](PLAYTEST.md), [CURRICULUM.md](CURRICULUM.md), [coverage.json](coverage.json), [VISUAL_REVIEW.md](VISUAL_REVIEW.md).
- [Generated design target](docs/visual-targets/gameplay-target.png) is a mockup. Current gameplay is in docs/ux/revised-flow.mp4 and tests/ux-captures; docs/qa-captures, docs/art and docs/playable-loop retain historical first-release evidence.
- [Audio preview](docs/audio/mixed-preview.wav), [AUDIO.md](AUDIO.md), [model sources](ASSETS.md), [Tripo search log](ASSET_SEARCH.md).

## Boundaries

Selected chapter-11/12 rules are covered, not all curriculum chapters. Chapter 10 belongs to the complementary games; there is no tense-assessment claim here. No speaking assessment, broad lexical mastery or retained-learning claim. The editor is not a complete English grammar checker. Article sound rules cover the disclosed words, not every English exception. Object mass/buoyancy are explicit toy-world parameters. Movement/collision use bounded deterministic surfaces rather than a general physics solver. Browser speech availability varies; text remains visible. No human musical-quality/learning-gain claim is inferred from automated checks.

Models reuse the user's owned Tripo outputs; four catalog meshes plus a rigged courier total ~3.15MB. No new Tripo models or credits. Scene terrain and exact functional props are procedural. The courier has a real 65-joint skin. Derived aligned idle/jog/single-hop clips correct the original source root mismatch and posture; source GLB stays unchanged. See docs/art/MOTION_REVIEW.md. See provenance and inherited reuse limitations in ASSETS.md.
