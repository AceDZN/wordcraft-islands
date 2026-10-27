# Independent asset-camera review

27October2026, local Vite game at5263,1440×900 headless Chromium with Metal rendering. Actual UI command: `node docs/art/review-gameplay.mjs`. The source uses Start, notebook input/Create, Arrow keys to physically position each object and Place. It reads the public render_game_to_text hook for observations; no world/win state is injected.

## Observed first pass

- All5 local models loaded; loader error list empty; no page errors.
- Courier has visible correct teal jacket/backpack and limbs; feet touch path in idle. The Three.js loader normalizes actual model height correctly. No T-pose placeholder was visible.
- Created/placed **a crate**, **a lamp**, **a balloon**, **a boat** in the actual scene. Each visibly uses the acquired textured mesh: fruit crate/lemons, green banker's lamp, canvas/copper balloon/basket, red wooden fishing boat. They cast grounded shadows. That proves four acquired core noun meshes are integrated, beyond preloading them.
- Created **a long wooden plank**; captured the translucent placement state, then placed. The actual support outcome changed to ready/traversable with the plank as contributor; feedback says both ends are supported. This art pass did not walk to the final star or count a campaign win.
- Static `prop-proof.png` is an independent Blender PBR inspection of the four rigid props, **not gameplay**. Quantized boat/crate were decoded to ignored work copies via glTF-Transform for Blender; runtime originals were not altered. `blender-model-bounds.json` records the resulting prop bounds only. A first invalid static courier framing included Blender's hidden bone-shape geometry and was discarded; the actual gameplay camera is authoritative for courier scale.

## Defects sent to lead

1. World-space Sprite labels are nearly unreadable pale gray. CanvasTexture color space and tone mapping make dark text too light; text must become dark/high-contrast and large enough to read from camera.
2. Boat is visually shorter than its declared3m due to scaling by height; normalize X to its semantic length. Crate normalized by height inflates its footprint beyond the declared1.2m; normalize its footprint instead.
3. Generated target is materially richer than first-pass actual terrain: current banks are simple flat rectangles, water is flat color, world has sparse material detail. Rock skirts/shoreline, water ripples and path texture would narrow this gap. The current actual scene is visibly simpler than the target; do not describe the target as achieved realism.

The lead owns gameplay-world changes. Follow-up actual screenshots are required after fixes. Source loop and learning/controls/audio verification are owned by the lead and independent English/QA helper; this review makes no broad learning/fun claims.

Run-cycle follow-up on the same first-pass build: actual ArrowRight was held across two timed captures (`gameplay-run-a.png`, `gameplay-run-b.png`), then released. Both were opened and inspected: limbs/body deform into distinct running poses on the weighted courier rig; actor translates along the path and has a corresponding ground shadow. No frozen T-pose or rigid whole-body-only animation. This is a short camera check, not a quantified foot-sliding audit. Script run reported errors[] and all5 models loaded. Lead subsequently changed label, camera, terrain/water and mesh scale; these first-pass captures remain historical until final review.
