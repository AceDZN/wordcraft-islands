> Current Wordcraft override,27 October: the user replaced selectable grade packs with one 50-level progressive campaign. Grade labels below describe source provenance, never player access. See docs/CAMPAIGN_CONTENT.md and src/campaign-levels.ts. Other historical requirements remain applicable.

# Wordcraft Islands — איים של מילים

Read COMMON.md, COVERAGE.md and GRADES.md. Your new standalone repo: `/Users/acedzn/dev/AceDZN-exp/wordcraft-islands`, public `https://github.com/AceDZN/wordcraft-islands`, dev/preview 5263/4263. Initialize/push main first. Lead the art/assets, audio and independent English/QA helpers.

## Direct source loop

**Scribblenauts Unlimited**, https://store.steampowered.com/app/218680/Scribblenauts_Unlimited/ . Preserve a magical creation notebook: inspect a physical problem → type a noun/adjective phrase → create a tangible object → place/use it → watch properties change the world → revise/modify or discover another valid solution → explore the next problem. This is **not** a sentence-reordering quiz. Original characters, world and assets; don't copy Maxwell, the notebook's branded look, levels or dialogue.

For a feasible offline browser slice, explicitly disclose a finite dictionary, roughly 12 core nouns plus reviewed aliases, property adjectives and a few adjective word-family variants. No runtime model/service. A correct real English word outside the catalog is “not in this workshop yet”, never “wrong English”. The notebook/dictionary teaches useful words first, then supports retrieval with progressively fewer cues. Suggestions, translation and automatically corrected phrases count as assistance.

## Controls and first minute

Elevated 3D island adventure camera with a simple controllable explorer; WASD/arrows move, Space jumps, pointer drag or buttons orbit, E interacts/carries nearby object. **N or a visible button opens the notebook and pauses movement**. Text input gets normal editing keys; no movement, fullscreen or delete shortcut can fire while it has focus. Enter creates a valid supported object and enters a placement preview; pointer/tap places it, R/button rotates, Esc/back cancels. Undo reverses the last creation/modification/placement. Touch has a small stick, jump/interact and notebook/placement actions with sensible targets.

First problem: a small broken crossing. Player learns plank/ladder from a tiny practical demonstration, types “a plank”, sees a real wooden plank appear, places it across the gap and walks over. They can instead use a ladder if it truly bridges the same geometry. Next gap is longer; a short plank falls, and a long plank/long ladder can work. State/physics decide success rather than a literal answer string. Continue into new situations with the same learned words, not a hallway of command-password locks.

If the explorer's locomotion would dominate scope, simplify the camera/controller and retain a complete explore/create/place/use loop; do not remove physical manipulation or replace success with text matching. Character deformation needs an actual rig. A suitable owned rigged courier may save new generations; don't import an entire old game.

## Finite semantic object engine

Suggested core catalog: plank, crate (box alias), ladder, rope, boat, balloon, umbrella, fan, key, lamp, bucket, sponge. Agree the actual supported catalog with the reviewer; each object should have at least one understandable use, not just decorative spawn. Properties: long/short (geometry), large/small (scale), heavy/light (mass), wooden/metal (material, no “all metals are magnetic”), bright/unlit (illumination), powerful/powerless (fan force). Use only combinations that have a coherent defined effect; unsupported combinations explain the limitation without a grammar falsehood.

Phrase parser separates determiner/count, adjective(s), noun and reviewed optional descriptors. Handle a/an by **next spoken sound**, e.g. “an umbrella” but “a large umbrella”; plural agreement for “two crates” versus “a crate”. Accept ordinary aliases, case/whitespace and valid alternatives. Bare nouns are valid editor shorthand, with a modeled full phrase displayed, but that is **not article-production evidence**. If a near-spelling suggestion is accepted, label assisted; do not silently correct then count unaided spelling. Wrong adjective order can prompt a short Hebrew explanation, but a finite parser is not a complete grammar judge.

Actual collision, supported placement, coverage, mass/force or illumination predicates decide each puzzle. An invalid placement/object should cause a clear recoverable visible effect. Do not pretend an imagined scientific property is universal; this is a bounded physical toy model. Keep deterministic snapshots/hooks for tests. Multiple physically and semantically valid solutions count even when they don't demonstrate the target rule; record the observed skill accurately.

## Nine launch puzzles, three grade tracks

**G7:** (1) guided crossing teaches/retrieves plank/ladder and a/an noun phrase; (2) independent rain-shelter puzzle, “an umbrella” or “two umbrellas”, with meaningful count/coverage; (3) transfer moves the same useful objects to a new gap/shelter layout, hides solution prompts and tests recall/spelling. A noun picture that auto-creates the correct object is a demonstration, not independent retrieval.

**G8:** (1) guided long versus short or larger/smaller property contrast; (2) independent weighted-platform puzzle where a heavy crate/bucket holds a platform while the explorer crosses, with a comparative constraint grounded in actual masses; (3) transfer combines a new context and an identifying relative clause in the mission, e.g. select/modify “the crate that the helper placed beside the fountain”, then solve physically. Provide sufficient stable object history and at least two candidates. Sources adjectives-and-comparison, vocabulary-context-and-word-choice and the saved grade-8 relative-clause source if used. Do not equate adjective vocabulary alone with comparative-form production.

**G9:** (1) guided noun modifiers and order, create “a large wooden crate” with a meaningful object need; (2) independent word-family contrast from power → powerful/powerless with a fan's observable force, and an identifying versus additional relative description of an already-known object; (3) transfer uses a new arrangement and a word-family/property contrast plus a multi-modifier phrase to solve a problem creatively. At least two supported solutions are valid. Teach from the exact grade-9 noun-modifier/relative-clause/word-formation/context sources. Do not lock completion to one magic phrase or claim broad vocabulary acquisition from a dozen words.

The final challenge per grade must change the application, not only the color/name. Grade 9 must do new noun-modifier/word-family reasoning; “same three easy puzzles, fewer hints” is insufficient. This game's selected-rule focus is chapters 11/12; Skyport and Manual own chapter 10 coverage. Do not add unrelated tense questions to pad coverage.

## Art and low-cost assets

Airy miniature archipelago: turquoise shallow water, sun-warmed ochre stone, grassy terraces, coral/red notebook accents and cream paper. Tactile wood, painted metal and woven rope; coherent shapes, good silhouettes and lovely grounded shadows, not a scene full of untextured boxes. A readable 3D playfield occupies most of frame, notebook opens only when needed.

Search Tripo gallery/My Assets for ordinary props first: umbrella, wooden crate, ladder, rowboat, fan, lantern, bucket and explorer. At least four featured core catalog meshes should be good acquired/owned models; simple exact planks/ropes/terrain/colliders can be procedural. Material/size variants should reuse one base mesh rather than trigger generations. Owned candidates include `/Users/acedzn/dev/AceDZN-exp/rooftop-radio/public/models/courier.glb` and `/Users/acedzn/dev/AceDZN-exp/critter-safari/public/models/` with their ASSETS.md; inspect provenance/rigs before copying. Do not alter or fork their gameplay. Avoid a bespoke hero requirement; use a suitable already-owned rigged explorer where possible. Generate only after a documented real search miss, under COMMON's limits.

## Music and SFX

Audio helper: original 88–98 BPM light adventure music, an airy plucked-string motif, warm soft bass, wood percussion and sparse mallet countermelody. 32-bar ABAC, restrained island/water atmosphere, a hopeful extra stem after solving a puzzle. Ambient water, breeze and light cloth/leaf movement. Distinct cues: notebook opening/page, typing confirmation, creation swirl, object land wood/metal, rotation tick, bounce, water splash, umbrella unfurl, fan start/stop, undo and puzzle flourish. Do not use one oscillator pitch for all physics materials. Music ducks under read-aloud; all gain/settings/gesture/pause/restart checks and the local mixed preview are required.

## Generate the gameplay target first

Built-in imagegen through the provided skill; save prompt/output as mockup.

> Use case: ui-mockup. Asset type: believable 16:9 browser 3D puzzle-adventure gameplay design target for Wordcraft Islands. Elevated three-quarter camera over a compact sunlit island playground with turquoise water, grassy ochre-stone terraces and a broken gap between two paths. A friendly original small explorer with a simple utility satchel stands at the gap. A newly summoned long wooden plank is in a translucent placement preview spanning the two sides, with clear end supports and grounded shadows. Nearby are a beautifully modeled umbrella, wooden crate and small fan, all in the same tactile hand-painted style. A compact open cream notebook at the bottom right contains the exact typed phrase “a long wooden plank” and a small button “Create”; a tiny top-left objective says “Help the courier cross.” Warm optimistic light, textured wood and coherent polished game-ready meshes, achievable Three.js rendering. The actual 3D world occupies at least 80 percent of frame. Show the action and the physical consequence of the words, not a title screen, marketing artwork, browser chrome, quiz answers, asset grid, copyrighted character or generic card dashboard. Clear navigation and practical readable camera.

## Acceptance

Actual move/create/place/modify/use/revise loop with finite disclosed vocabulary; nine authored challenges, three meaningful grade tracks and transfer per grade. Properties and physical solution predicates matter; at least two alternative solutions across the campaign. Unit tests cover supported grammar/aliases, article sound after adjective, plurals, spelling-support flags, object property outcomes, legitimate alternative solutions and no shortcut masquerading as mastery. Browser all three grade paths, wrong-property consequence/recovery, undo, typing-vs-movement, keyboard/touch, audio/settings/restart and model loading. Actual captures vs target; public main, verified-only coverage.json and truthful limits. Build the playable game, not just a word-to-model catalog.
