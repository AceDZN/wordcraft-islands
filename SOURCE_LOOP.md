# Wordcraft Islands creation loop

Direct source: [Scribblenauts Unlimited](https://store.steampowered.com/app/218680/Scribblenauts_Unlimited/), inspected 27 October 2026. Its official store description describes exploring, solving problems by summoning objects, assigning properties and modifying them. This project implements that creation-and-revision loop with original code, scenery, missions and audio.

1. Explore the island and read a physical problem.
2. Open the creation notebook. Reading and typing pause locomotion; practice has no countdown.
3. Retrieve and type a supported noun phrase, optionally with count and modifiers.
4. Create a tangible 3D object. Move its translucent preview with pointer/touch or keyboard, choose an anchor, rotate and place it.
5. Observe the consequence: unsupported short spans sink, supported spans carry the explorer, separated covers protect different parcels, weight raises a bridge, floating capacity carries cargo, and fan force drives a sail raft.
6. Inspect properties/history, carry or modify an existing object, undo and revise. Valid alternatives are accepted by predicates.
7. Use the solution and physically reach the lighthouse star. Open the next numbered island in a 50-level journey. The map saves progress, permits replay and ends explicitly after island 50.

The notebook discloses 12 core nouns, reviewed box/lantern aliases and a small adjective catalog. There is no runtime model, backend or key. Unsupported real English is reported as outside the workshop, never as inherently wrong. This is a finite, deterministic physical toy model, not an unlimited dictionary or a general rigid-body simulation. The camera/controller and geometry are original.

The current recording/state sequence is docs/ux/revised-flow.mp4 and docs/ux/record-states.json: ordinary real-time pointer/typing shows guided creation, deliberate placement, the current Try action, physical traversal and the rain problem. The older docs/playable-loop recording is historical first-release evidence. Neither is the generated design target. Click/tap walking and the current Try action use the same physical support predicates; they remove steering chores without providing an English solution.

The 50-level conversion is shown in docs/campaign/campaign-flow.mp4 (66.24 seconds, ordinary real-time typing/placement/traversal through the first two levels, then the map with two actual wins). No advanceTime or injected save/win is used in that recording. The silent browser video has a separate original music/SFX preview in docs/audio. Record script and state checkpoints are in docs/campaign.
