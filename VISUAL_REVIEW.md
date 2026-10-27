# Visual review — design target versus working game

The built-in image_gen target at docs/visual-targets/gameplay-target.png was generated and visually inspected before gameplay implementation. Exact prompt: docs/visual-targets/prompt.txt. It is a mockup, never presented as a working-game capture.

## Compared with actual captures

Real browser captures are under docs/qa-captures, docs/art and docs/playable-loop. The skill client canvas captures are retained separately under docs/playable-loop/client. Full-page captures show actual Hebrew/English UI alongside the Three.js canvas.

- Camera: elevated three-quarter view, original small explorer, two readable banks, grounded object preview and supports. First pass left excessive blank water; desktop orthographic view was moved closer (7.9 vertical half-span). Mobile keeps a wider view so both shores remain navigable.
- Composition: the 3D world fills the playfield; notebook opens only while writing and closes for placement. The top-left objective is more verbose than the target because it carries precise English constraints and Hebrew novice help. It is a deliberate instructional tradeoff.
- Materials: warm layered/bevelled sandstone banks, grass edges, shoreline rocks, planted bushes, tactile wood grain, normal-mapped moving turquoise water and coherent warm shadows. First pass was two flat slabs with flat water; that mismatch was corrected.
- Props: four acquired/owned catalog meshes plus a real rigged courier. Boat X length and crate footprint now match their semantic dimension proxies; first pass incorrectly fitted by height. Exact bridges, fan grill/blades, umbrella canopy/ribs, rope, bucket, sponge and colliders are procedural functional geometry.
- Labels: first pass canvas sprites were pale and unreadable under tone mapping. They now use sRGB textures, bold high-contrast lettering and untonemapped sprite material. Missions remain readable HTML, with English LTR and Hebrew support.
- Consequences: invalid short spans visibly tip/sink, supported spans stay at surface, umbrella canopies cover separate rain parcels, loaded pressure plates lower and create the bridge, an explicit raft/sail carries the explorer across when capacity/force conditions hold. No quiz overlay substitutes for these actions.
- Character: a 65-joint skinned courier uses actual idle/run/jump clips. It is a reused original sci-fi courier rather than the rustic explorer in the target. Props use rigid-body movement; they are not falsely claimed to be skeletal characters.

## Intentional remaining differences

The final scene is a compact stylized diorama with simpler low-poly vegetation and terrain. It does not reach the target's dense illustrated rock arches, botanical detail, photorealistic water caustics or hero design. The finite slice prioritizes measurable object geometry, clear supports and readable manipulation over rendering every background flourish. The acquired open crate contains visible lemons, and the balloon is a hot-air basket model; both are disclosed in ASSETS.md.

This review records visible implementation details. Automated screenshots do not establish artistic quality, learner enjoyment or learning gains. See PLAYTEST.md for tested paths and AUDIO.md for separate audio checks and listening limits.

## Play-feel revision

The current notebook and snapped placement/primary action are shown in docs/ux; older images above remain historical. Default controls/text were reduced, the first guided model is explicit, and completion foregrounds the physical payoff. Scene materials and owned models remain; static scenery is batched and the flat-water grid is removed. Derived real skeletal clips correct the root shift/lean/jump selection; character facing uses actual movement and rests aboard vehicles. Created boats/balloons now travel visibly as carriers, and transient location signs hide during travel so they do not cover the actor. The current real-time recording was visually inspected during the new first-two-island flow.
