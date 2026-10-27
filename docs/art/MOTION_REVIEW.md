# Courier motion diagnosis and derived clips

27October2026. Requested after the human reported strange running and poor controls. This pass is offline: read the current source and the existing courier GLB, decoded its animation accessors, reconstructed its65-joint hierarchy, then evaluated source and derived clips through the actual Three.js AnimationMixer. No browser run, new generation, rig job, geometry edit, GLB rewrite or Git operation was performed by the art owner in this pass.

## Root cause, measured

The GLB's source `run` is nominally in place, but it is **in place around a different absolute root origin** than `idle`.

| Source clip | Hips first X/Y/Z, native height≈1 | Other findings |
|---|---|---|
| idle,15.333s |.001953 / .531152 / .033203 |Nearly upright: head-to-hips forward lean mean2.51°. |
| run,1.250s |−.029218 / .448576 / .581728 |XZ essentially constant within the clip; head-to-hips lean33.40–39.16°, mean35.98°. Sprint pose. |
| jump_down,3.708s |.001953 / .994684 / .033203 |Landing/fall sequence; pelvis Y spans.214–1.124. Unsuitable as a takeoff loop. |
| jump,2.208s |.001392 / .501920 / .041778 |Five vertical peaks around.210,.707,1.167,1.623,2.043s; not one physical hop. |

At the game's1.7m explorer height, changing idle→run shifts the rendered skeleton **0.9325m forward and5.30cm sideways** inside its stationary controller root. The old.15s fade merely spreads that snap over a few frames. “In place” alone did not establish compatible clip origins. Both axes must be aligned before creating actions.

The source run also has a visible wrap mismatch: left/right ToeBase endpoint displacement11.41/14.11cm at1.7m height. A single source cycle from.44375 to1.075s has much closer endpoints; resampling and distributing a small seam correction closes it exactly.

## Source integration defects found at dispatch

- `World.render` unconditionally set player yaw toπ/2 whenever moving. West, north and south motion therefore still faced east. +Z is the model's forward direction (confirmed by posed toe-chain vectors); use `atan2(actualVelocityX, actualVelocityZ)` and retain the last heading when stopped. Smooth the shortest angle difference, not raw unwrapped yaw.
- `moving` came from requested dx/dz before collision/clamping, so the actor ran when pressing against water or island bounds. Compute it from actual post-collision displacement/elapsed time.
- Ferry translation set moving=true, so the actor ran on the raft. Keep an idle/balanced stance while carried; carrying motion is not locomotion.
- `includes('jump')` selected `jump_down`, because GLB order is idle,run,jump_down,jump. Select exact prepared clip names. A one-shot jump needs LoopOnce/clamp and physical jump-state timing, not a height>.1 threshold or default repeated action.
- World-axis keyboard input was difficult to predict with the elevated/orbit camera. For screen-relative movement, flatten/normalize camera forward, get right=forward×up, combine those basis vectors with input and normalize the resulting velocity. Click-to-walk should route through the same collision/support solver, never teleport across an unsolved gap.

The lead owns the controller/facing/ferry changes. This art pass did not edit world.ts or main.ts.

## Implemented `src/character.ts`

`prepareCourierClips(clips)` returns independently owned `{idle,walk,jump}` exact named clips, each retaining195 real skeletal tracks on the existing weighted rig. Input clips are not mutated.

- All Hips.position X/Z samples use the idle baseline(.001953119,.033203136). Idle keeps its small natural Y motion.
- `walk` is an upright gentle jog derived from the selected.63125s run cycle, resampled at60Hz. Pelvis rotation is blended55% toward the source run from idle; spine weights12%/12%/20%, neck/head65%, arm chains62%. Imported local leg motion and its cadence are retained, apart from the small distributed loop-closing correction. Root Y bob is moderated; a small asset-specific upward-only compensation prevents sole contact penetration. It intentionally retains a brief jog aerial phase, not a newly claimed perfect walking gait.
- Pose correction uses the actual joint rotations. It does not rotate the whole actor backward or deform its mesh as a rigid substitute.
- `jump` uses only one source hop(.45639..95694s), remapped to.65s. Hips XYZ remain constant at idle baseline, so the controller owns the entire vertical arc. Bone poses blend to idle at both endpoints; the source's extra root lift is removed. Use it once, synchronized to the controller's.65s hop.
- Constants exported: `COURIER_WALK_SPEED=2.5`, `COURIER_WALK_REFERENCE_SPEED=3.7`, `COURIER_JUMP_DURATION=.65`. Start with walk.timeScale=actualGroundSpeed/3.7; at2.5m/s this is≈.676. The reference is an estimate from the imported planted ToeBase backward speeds (left3.54/right3.90m/s at1.7m actor height), not a biological claim.

## Actual track/skin audit

Commands executed in the assigned workdir:

```
node work/art-motion-analyze.mjs
npx tsx work/art-motion-audit.ts
npx tsc --noEmit
```

The analysis scripts/intermediate samples remain in ignored work/art-motion* as requested. The runtime implementation is the permanent source. Typecheck passed after the final helper edit.

Each source/derived clip was evaluated at601 times. All derived clips validate; original clip serialization is byte-for-byte unchanged before/after preparation.

| Derived clip | Duration / tracks | Root XZ | Root Y | Pose / loop |
|---|---|---|---|---|
| idle |15.333s /195 |Fixed common baseline |Original slight bob |Source idle retained. |
| walk |.63125s /195 |Fixed common baseline |.490063..525289 native,≈5.99cm bob at1.7m |Head/hips lean13.79–16.69°, mean15.64°. All track endpoints exactly agree; ToeBase world wrap error<.2micrometres in float evaluation. |
| jump |.65s /195 |Fixed common baseline |Exactly.531151652 throughout |No root lift; exact idle endpoints, one authored hop pose between. |

A separate skin audit evaluated **862 actual sole-region vertices** (bind POSITION.y<.045) out of11,485 vertices using the original JOINTS_0, WEIGHTS_0 and inverse bind matrices at601 times. This is stronger than checking bone markers alone, but it remains an offline mesh-contact audit.

| Clip | Minimum/maximum lowest sole vertex, native units | Interpretation |
|---|---|---|
| source idle |−.004862..000821 |Small existing source contact error, up to≈8.3mm at1.7m. |
| source run |−.010930..034799 |Source had≈18.6mm penetration and≈59.2mm aerial clearance. |
| derived walk |.001076..058664 |No below-ground sole vertex in this sample;≈1.8mm minimum clearance and≈9.97cm brief aerial clearance at1.7m. This remains a jog, not a no-flight walking claim. |
| derived jump plus the actual.7m controller sine arc |−.002722..354915 |Grounded idle endpoints inherit≈4.6mm source skin error. Maximum lowest-sole height≈.603m; no second root-driven jump. |

## Remaining validation

The lead must inspect actual integrated clips from the gameplay camera after real movement/facing changes. Test all eight movement directions, orbit-relative controls, stop/start/reversal, blocked input, carried travel, one jump and pause/resume. Recheck foot contact at the final model normalization, material terrain height and chosen cadence. No browser verification of this new helper was claimed in this offline pass; earlier captures predate it. Exact loop closure does not establish perfect world-space planted-foot behavior while turning or accelerating.
