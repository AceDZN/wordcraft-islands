# Models, font and provenance

This crew reused the human's already commissioned Tripo outputs after searching Chrome's Tripo gallery and My Assets. See ASSET_SEARCH.md. There were **zero new generations, rig jobs or paid downloads**. No asset from another creator's public gallery is bundled.

The earlier asset ledgers document original prompts, normal UI GLB exports and paid-account creation using existing credits. Current account menu was independently checked as Pro on27October2026. [Tripo terms §5.2.2](https://www.tripo3d.ai/terms) states the paid user's rights in their own inputs/outputs, including modification and distribution; this is the basis for reuse of these commissioned outputs. Public gallery visibility was never treated as a license. No commercial game characters, models, logos or textures are used.

## Locally bundled manifest

All paths are relative to the Vite public root. Original/optimized means inherited original UI download and the prior crew's optimized runtime file. This crew's runtime copies are byte-identical to those optimized files; no further optimization or geometry rewriting was performed.

| File / role | Source job / own original prompt | Current bytes / triangles | Runtime SHA256 |
|---|---|---|---|
| `models/courier.glb` — explorer | [342b26e2](https://studio.tripo3d.ai/workspace/generate/342b26e2-b8fc-47b8-8502-4028e939100f), Rooftop Radio: “original adolescent parkour radio courier, stylized polished3D browser game asset, neutral T-pose… compact teal jacket, terracotta shorts… lightweight radio backpack… no text, no logo, no ground plane.” |1,294,924 /19,093 |`391f136e4e3dc638f93ba15a7e5cfaf2a0887592a0ab80c22ccdddcd2c505e95` |
| `models/boat.glb` — catalog boat | [880dbb6c](https://studio.tripo3d.ai/workspace/generate/880dbb6c-3be1-43f1-915f-4517ba7a55a4), Storm Proof: “A small wooden fishing trawler boat, red painted wooden hull with a white waterline stripe, a little white wheelhouse cabin with windows, one wooden mast with a lantern on top… single object, no water, no ground plane, stylized-realistic, game-ready, clean readable silhouette.” |245,256 /13,387 |`08ae2c1260638b41a90b9f2cee4c644c831f038c4c26b520d6628f850df80a5a` |
| `models/balloon.glb` — catalog balloon | [91d86147](https://studio.tripo3d.ai/workspace/generate/91d86147-3f26-43e2-a7d9-74d9d25197e4), Frost & Flame: original reference-image commissioned steam balloon lift; cream envelope, copper ribs, chains and wooden basket/platform. |819,528 /18,986 |`87f0c8064f2d295bbc99bd30b2fbaa51433dde4e0880dd097c75c0bb89cd1d68` |
| `models/lamp.glb` — catalog lamp | [047a19d7](https://studio.tripo3d.ai/workspace/generate/047a19d7-0f27-4926-8640-736b16b2559e), Matter Customs exact prompt: “classic green glass banker's desk lamp with brass base and pull chain, single object” |586,004 /19,450 |`64d76119944d93d214640ad210e831459919834faecbb61e6265603769e186fa` |
| `models/crate.glb` — catalog crate | [ed90e50b](https://studio.tripo3d.ai/workspace/generate/ed90e50b-f90e-40fb-997e-687a8ea6626c), Ph Rangers: original tipped rustic honey-brown slatted fruit crate, nails, faded label, lemons and leaves, flat base, no ground plane. |206,804 /5,079 |`318ceb8efe87339ea0b726061802eb19abc0416777386a24027c94dc974fb94a` |

Total models **3,152,516bytes** (about3.01MiB); each stays below3MB. All contain locally embedded texture maps. Detailed independently parsed GLB metadata is saved in `docs/art/model-inspection.json`. Four core catalog prop meshes are reused, in addition to the explorer.

### Original export and optimization audit

| Model | Inherited original bytes / SHA256 | Earlier processing |
|---|---|---|
| Courier |1,971,568 /`042cab2c1fe934edaecf85b1ae711068657a7ed2ddec73892352da8c588f62db` |glTF-Transform dedup/weld/resample/prune/sparse, WebP1024; geometry simplification and quantization disabled. Source ledger: `rooftop-radio/ASSETS.md`. |
| Boat |1,086,048 /`bab0ba46e55c93a8b2bb61b3334e566f293bd3312c2225b2a67fa66b99d3a88d` |glTF-Transform optimize, simplify ratio0.75/error0.0005, WebP; source ledger `storm-proof/ASSETS.md`. |
| Balloon |1,370,472 /`9c8712c48b4574cba0740f15b2b5c79551e901d9f0a9ac4ffa9257ffcc92f401` |WebP85 texture re-encode; geometry unchanged. Source ledger `frost-and-flame/ASSETS.md`. |
| Lamp |917,140 /`4974537ed7948e075776e6dbe7ce644c8c3c1b993f5cda5eeb8a237d72eaf5bd` |glTF-Transform WebP1024; source ledger `matter-customs/ASSETS.md`. |
| Crate |797,144 /original hash not preserved in the inherited ledger |glTF-Transform optimize, WebP1024. Source ledger `ph-rangers/ASSETS.md`. Current copied optimized hash independently verified above; no invented original hash. |

The original UI files remain in their prior source locations; they are not duplicated into this runtime. Prior projects were read and copied from, never edited.

## Loader, dimensions and rig status

- All models are Y-up. Courier, balloon and lamp use `EXT_texture_webp` only. Boat and crate additionally use `EXT_meshopt_compression` and `KHR_mesh_quantization`: Three.js GLTFLoader must receive `MeshoptDecoder` from `three/addons/libs/meshopt_decoder.module.js`. Quantized POSITION accessor min/max are not metres; use loaded world bounds with node transforms.
- Courier: one actual skinned mesh,65-joint Humanoid/Mixamo skeleton and four skeletal clips: `idle`15.333s, `run`1.250s, `jump_down`3.708s, `jump`2.208s. Each has195 skeletal channels. [Rig](https://studio.tripo3d.ai/workspace/rigging/342b26e2-b8fc-47b8-8502-4028e939100f) and [animate/export](https://studio.tripo3d.ai/workspace/animate/342b26e2-b8fc-47b8-8502-4028e939100f) were completed by Rooftop Radio. Export used skeleton on, four selected clips and in-place motion. Geometry bind bounds y≈0..1, x±0.4816/z±0.1501; normalize height and keep transforms on a parent wrapper. Front convention+Z, visually check during gameplay. Use real AnimationMixer; no fake deformation claim or facial rig.
- Boat: rigid static prop, longest dimension X≈1; source says bow points−X. Normalize by length and place the waterline deliberately. Whole-boat bob/turn is rigid motion; it has no skeletal animation.
- Balloon: rigid single mesh, y0..1/x,z±0.297. Basket/platform deck y≈0.10–0.15, envelope y≈0.45–1.0. Whole-model lift/scale is possible; separate envelope inflation is not claimed. This is a hot-air-style balloon with a basket, not a rubber party balloon.
- Lamp: rigid, y0..1, x±0.491/z±0.427 (cord expands footprint). Pull chain and green shade face+Z. Light/illumination comes from the game's explicit bright/unlit state and a Three.js light, not baked pixels.
- Crate: rigid tipped wooden fruit crate with visible lemons/leaves; y0..0.620, x±0.384/z±0.5. Open face/lemons face+Z. The contents are visible context; no empty sealed-box claim. The engine's mass and size are declared toy properties; exact triangle-mesh dynamics are not claimed.

Imported props use semantic collision proxies rather than mesh-triangle physics. Property variants reuse meshes; no generation per adjective. The authored planks, ladders, rope, umbrella, fan, key, bucket and sponge remain original code geometry. Those need recognizable silhouettes and material cues, not cube placeholders. Featured imported meshes have approximately5k–19.5k triangles; instancing/reuse and one embedded PBR material per model keep draw/memory costs bounded. Three1024² color/normal/metal-rough maps per typical prop can consume roughly12MiB decoded RGBA before mipmaps; compressed file bytes are not GPU memory.

## Font

`fonts/Rubik-Variable.ttf`, Hebrew and Latin,359,804bytes; SHA256`1b3a7437ba2af80e465e773ed60c5036d1ba6ace492d89046dbcf18fb31e4e88`. Unmodified copy of the previously licensed local Rooftop Radio font. Upstream [Google Fonts Rubik](https://github.com/google/fonts/tree/main/ofl/rubik). SIL Open Font License1.1 bundled at `fonts/OFL-Rubik.txt` (4,384bytes; SHA256`472cbe7c25441df63e9c7864b43eb3c0f4b3df950c66a76224e6cfe1eae843fb`). No runtime font request or account is required.

## Verification scope

GLB parsing independently verified bytes, hashes, mesh/material/triangle counts, texture-extension requirements and actual courier skin/animation channel counts. Actual Three.js gameplay-camera review is recorded separately after integration, not inferred from these metadata checks. No new character rigging was needed; rigid props require no rig.

### Actual integration inspection

An independent art UI pass loaded all5 models with no page/loader errors, created and placed all four catalog prop meshes, and observed the courier grounded on the path. It also placed a long wooden plank across the gap and saw the supported-world result. Actual captures are `docs/art/gameplay-{courier,catalog,placement,bridge}.png`; procedure/findings/remaining corrections in `docs/art/REVIEW.md`. `docs/art/prop-proof.png` is a static Blender PBR proof of the four props, explicitly not gameplay. Read the lead's final VISUAL_REVIEW.md for later changes and target comparison.

Lead rechecked the current official Tripo terms on 27 October 2026: §5.2.2 lists paid users' own-output modification/distribution rights, subject to its stated conditions. Source: https://www.tripo3d.ai/terms . This ledger relies on the commissioned-output provenance above; it does not grant rights in public gallery creators' work.

## Play-feel revision

The source courier GLB is unchanged. `src/character.ts` derives aligned idle/upright jog/single-hop skeletal clips, correcting a measured ~0.93m idle/run root-origin mismatch and the earlier jump_down selection. All motion remains on the original65-joint skin. Offline audit and browser-check boundaries are in docs/art/MOTION_REVIEW.md. No additional models, generations, credits or rig jobs were used.


## Dynamic vocabulary release — 11 November 2026

This release adds three rigid Tripo props, **1,454,480 bytes** combined (about 1.39 MiB). The October release's zero-new-generation totals above remain historical. All three are paid-user commissioned outputs; no public-gallery creator model is redistributed. Account **Pro** was confirmed through Chrome's visible account menu, and [official terms §5.2.2](https://www.tripo3d.ai/terms) were rechecked on 11 November. Search and decisions are in [ASSET_SEARCH.md](ASSET_SEARCH.md). Exact new prompts are in [dynamic-prompts.md](docs/art/dynamic-prompts.md).

| Runtime file | Tripo own task | Original export → runtime bytes | Runtime triangles | Runtime SHA256 |
|---|---|---|---|---|
| `models/tarp.glb` | [8eeb723f](https://studio.tripo3d.ai/workspace/generate/8eeb723f-9da0-4c01-97bb-3a22c8ab41a8) | 1,037,884 → 472,276 | 18,832 | `f2a36f7a233f942f950a5ffcdc6ea23ab171899fefd6fb32dfb26ec8876224d7` |
| `models/canoe.glb` | [f61c3af1](https://studio.tripo3d.ai/workspace/generate/f61c3af1-d75f-4670-8851-455ac55e9401) | 1,205,620 → 536,872 | 18,778 | `90d3ffd81133ee19f9802c0a5a18ec2a22a4ada733b982bb28917c1f111a41de` |
| `models/tent.glb` | [8a43d20c](https://studio.tripo3d.ai/workspace/generate/8a43d20c-6265-4303-be2f-c6a4b4b37d57), reused own Clumpus output | 923,176 inherited UI export → 445,332 | 19,009 | `6f606c51302aaaeada6eb832c5ef85b1c1810cfd7795443231b084ac9a8ee8f9` |

New model generation: HD Model, H3.1 text-to-3D, geometry/texture with the saved ~20k geometry setting, 2K source texture. The Generate button displayed **30 credits** each. Two jobs used **60 existing credits**, balance **1585 → 1525**. No purchase, upgrade or rig job. Both exported normally with **GLB / 1k textures**, no export charge. Source UI downloads remain in Downloads; copies are not committed as extra runtime payloads.

Original new export hashes:

- Tarp `cf63d8a36dbcfb8403c9eb7b95524f7a0a12cada926ec92f1f484f3eaf7656c2`.
- Canoe `0e10ec599e75165b48b4647dacddd207fdcdcf9bf0bbd38984e4a29c2348207e`.
- Tent inherited original `5b53c756946d5584364a26bd2f0a4cfbca149fa1a234e68433984c248d0f8f0d`; current local copy byte-identical to the Clumpus optimized file.

New files were processed using pinned glTF Transform CLI 4.5.1 `optimize --compress quantize --texture-compress webp --texture-size 1024 --simplify false`: dedup/weld/prune, quantized attributes and WebP maps. No intentional mesh simplification, skeleton edit or image-content edit. Tiny triangle-count changes (canoe 18,780→18,778; tarp 18,836→18,832) come from pruning/welding degenerates. Tent bytes were copied unchanged from the read-only prior repo after inspecting its own Tripo workspace.

All three use **Y-up**, embedded PBR maps, `EXT_texture_webp` and `KHR_mesh_quantization`, no external decoder, no skin and no animation clips. They are intentionally rigid props. Loaded world bounds, including node transforms (quantized integer accessor values are not meters):

- **Canoe:** X≈±0.1957, Y≈0..0.3165, Z≈±0.5. Longest axis **Z**; rotate Y by π/2 to align with an X-axis crossing. Empty narrow timber hull, teal band, bench seats and rope trim. Side-view screenshot inspected.
- **Tarp:** X≈±0.5, Y≈0..0.8049, Z≈±0.2603. Wide blue overhead canvas on four timber poles, open underside. Generation also added a hanging cloth sling below the roof; this is retained rather than claiming exact prompt fidelity.
- **Tent:** X≈±0.5, Y≈0..0.9047, Z≈±0.4039, front +Z. Round yellow/white carnival pavilion with open arched front/table and benches inside, rather than an empty four-pole camping tent. Scale to its actual cover footprint.

`gltf-transform validate` returned **zero errors** on all three. Each retains the common normal-map warning `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE` because Tripo's mesh has no authored tangents; Three.js generates tangent space at runtime. No unsupported-extension error. Detailed original/runtime hashes/counts/node transforms: [dynamic-model-inspection.json](docs/art/dynamic-model-inspection.json).

Actual Chrome workspace evidence: [canoe](docs/art/dynamic-tripo-canoe.png), [tarp](docs/art/dynamic-tripo-tarp.png). These are genuine Tripo model screenshots, not gameplay or design mockups. Final integrated camera/scale/coverage checks belong to the lead's gameplay validation.
