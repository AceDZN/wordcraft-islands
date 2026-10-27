# Wordcraft Islands creation loop

Direct source: [Scribblenauts Unlimited](https://store.steampowered.com/app/218680/Scribblenauts_Unlimited/), inspected 27 October 2026. Its official store description describes exploring, solving problems by summoning objects, assigning properties and modifying them. This project implements that creation-and-revision loop with original code, scenery, missions and audio.

1. Explore the island and read a physical problem.
2. Open the creation notebook. Reading and typing pause locomotion; practice has no countdown.
3. Retrieve and type a supported noun phrase, optionally with count and modifiers.
4. Create a tangible 3D object. Move its translucent preview with pointer/touch or keyboard, choose an anchor, rotate and place it.
5. Observe the consequence: unsupported short spans sink, supported spans carry the explorer, separated covers protect different parcels, weight raises a bridge, floating capacity carries cargo, and fan force drives a sail raft.
6. Inspect properties/history, carry or modify an existing object, undo and revise. Valid alternatives are accepted by predicates.
7. Use the solution and physically reach the lighthouse star. Continue to a changed context.

The notebook discloses 12 core nouns, reviewed box/lantern aliases and a small adjective catalog. There is no runtime model, backend or key. Unsupported real English is reported as outside the workshop, never as inherently wrong. This is a finite, deterministic physical toy model, not an unlimited dictionary or a general rigid-body simulation. The camera/controller and geometry are original.

The recording and state sequence in docs/playable-loop show real UI creation, an unsuccessful short span, recovery, alternative ladder, traversal and new-grade property action. They are browser captures, not the imagegen target.
