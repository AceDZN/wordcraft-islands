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
