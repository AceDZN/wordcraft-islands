import * as THREE from 'three';

// Existing weighted courier rig; these are derived skeletal clips, not new geometry.
export const COURIER_WALK_SPEED = 2.5;
export const COURIER_WALK_REFERENCE_SPEED = 3.7;
export const COURIER_JUMP_DURATION = .65;
const WALK_START = .44375;
const WALK_END = 1.075;
const JUMP_START = .45639;
const JUMP_END = .95694;
const FPS = 60;
// Audited against this courier's actual 862 sole-region vertices and skin weights.
// Small upward-only root compensation prevents contact penetration while retaining
// the imported jog's brief aerial phase. Re-audit if the GLB or pose weights change.
const WALK_SOLE_LIFT = [0.00262278, 0.00589387, 0.01137638, 0.01454734, 0.01035696, 0.00030781, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00026903, 0.00815654, 0.01178603, 0.01155737, 0.00735917, 0.00092851, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00000000, 0.00262278];
const isHipsPosition = (track: THREE.KeyframeTrack) => /Hips\.position$/i.test(track.name);
const bone = (track: THREE.KeyframeTrack) => track.name.split('.').slice(0, -1).join('.').replace(/.*(?:mixamorig:|mixamorig)/i, '');

/** Sample numeric glTF tracks without requiring a browser or mutating the source. */
function sample(track: THREE.KeyframeTrack, time: number): number[] {
  const count = track.times.length, size = track.getValueSize();
  let lo = 0, hi = count - 1;
  while (lo < hi - 1) { const mid = (lo + hi) >>> 1; if (track.times[mid] <= time) lo = mid; else hi = mid; }
  if (time >= track.times[count - 1]) lo = hi = count - 1;
  const start = lo * size, end = hi * size;
  const u = track.getInterpolation() === THREE.InterpolateDiscrete ? 0 : THREE.MathUtils.clamp((time - track.times[lo]) / (track.times[hi] - track.times[lo] || 1), 0, 1);
  const a = Array.from(track.values.slice(start, start + size));
  if (/\.quaternion$/.test(track.name)) return new THREE.Quaternion().fromArray(a).slerp(new THREE.Quaternion().fromArray(track.values, end), u).normalize().toArray();
  return a.map((v, i) => THREE.MathUtils.lerp(v, track.values[end + i], u));
}
function resampled(track: THREE.KeyframeTrack, duration: number, value: (phase: number) => number[]) {
  const steps = Math.ceil(duration * FPS), times: number[] = [], values: number[] = [];
  for (let i = 0; i <= steps; i++) { times.push(i / steps * duration); values.push(...value(i / steps)); }
  const output = track.clone(); output.times = new Float32Array(times); output.values = new Float32Array(values); output.setInterpolation(THREE.InterpolateLinear); return output;
}
function alignHorizontalRoot(clip: THREE.AnimationClip, baseline: number[]) {
  for (const track of clip.tracks) if (isHipsPosition(track)) for (let i = 0; i < track.values.length; i += 3) { track.values[i] = baseline[0]; track.values[i + 2] = baseline[2]; }
}
function closeCycle(track: THREE.KeyframeTrack) {
  const size = track.getValueSize(), end = track.values.length - size, first = Array.from(track.values.slice(0, size)), last = Array.from(track.values.slice(end));
  const correction = /\.quaternion$/.test(track.name) ? new THREE.Quaternion().fromArray(last).invert().multiply(new THREE.Quaternion().fromArray(first)) : undefined;
  const q = new THREE.Quaternion(), identity = new THREE.Quaternion();
  for (let i = 0; i < track.times.length; i++) {
    const phase = i / (track.times.length - 1), at = i * size;
    if (correction) q.fromArray(track.values, at).multiply(identity.clone().slerp(correction, phase)).normalize().toArray(track.values, at);
    else for (let k = 0; k < size; k++) track.values[at + k] -= (last[k] - first[k]) * phase;
  }
  // Exact endpoint agreement avoids the source run's 11–14cm toe pop at wrap.
  for (let k = 0; k < size; k++) track.values[end + k] = first[k];
}

/** Produce exact named, independently owned clips on the existing Mixamo skeleton. */
export function prepareCourierClips(clips: THREE.AnimationClip[]): {idle: THREE.AnimationClip; walk: THREE.AnimationClip; jump: THREE.AnimationClip} {
  const sourceIdle = clips.find(c => c.name.toLowerCase() === 'idle');
  const sourceRun = clips.find(c => c.name.toLowerCase() === 'run');
  const sourceJump = clips.find(c => c.name.toLowerCase() === 'jump');
  if (!sourceIdle || !sourceRun || !sourceJump) throw new Error('Courier requires exact idle, run and jump skeletal clips.');
  const hips = sourceIdle.tracks.find(isHipsPosition);
  if (!hips) throw new Error('Courier idle has no Hips.position track.');
  const baseline = sample(hips, 0), reference = new Map(sourceIdle.tracks.map(t => [t.name, sample(t, 0)]));
  const idle = sourceIdle.clone(); idle.name = 'idle'; alignHorizontalRoot(idle, baseline);

  const hipsRun = sourceRun.tracks.find(isHipsPosition)!;
  const hipsSamples = Array.from({length: 61}, (_, i) => sample(hipsRun, THREE.MathUtils.lerp(WALK_START, WALK_END, i / 60))[1]);
  const meanY = hipsSamples.reduce((a, b) => a + b, 0) / hipsSamples.length;
  const walkTracks = sourceRun.tracks.map(track => {
    const rest = reference.get(track.name) ?? sample(track, WALK_START), name = bone(track);
    const result = resampled(track, WALK_END - WALK_START, phase => {
      const values = sample(track, THREE.MathUtils.lerp(WALK_START, WALK_END, phase));
      if (isHipsPosition(track)) return [baseline[0], meanY + .034 + (values[1] - meanY) * .7, baseline[2]];
      if (/\.quaternion$/.test(track.name)) {
        // Upright pelvis/spine blend retains all source leg-joint tracks. The root
        // is lifted .034 native units above to offset the changed pelvis tilt.
        const weight = name === 'Hips' ? .55 : name === 'Spine' || name === 'Spine1' ? .12 : name === 'Spine2' ? .2 : /^(Neck|Head)/.test(name) ? .65 : /(Shoulder|Arm|ForeArm)/.test(name) ? .62 : 1;
        if (weight !== 1) return new THREE.Quaternion().fromArray(rest).slerp(new THREE.Quaternion().fromArray(values), weight).normalize().toArray();
      }
      return values;
    });
    closeCycle(result); return result;
  });
  const walkRoot = walkTracks.find(isHipsPosition)!;
  for (let i = 0; i < walkRoot.times.length; i++) walkRoot.values[i * 3 + 1] += WALK_SOLE_LIFT[i];
  closeCycle(walkRoot);
  const walk = new THREE.AnimationClip('walk', WALK_END - WALK_START, walkTracks);

  const jumpTracks = sourceJump.tracks.map(track => {
    const rest = reference.get(track.name) ?? sample(track, JUMP_START);
    return resampled(track, COURIER_JUMP_DURATION, phase => {
      if (isHipsPosition(track)) return baseline.slice(); // The controller owns the entire jump arc.
      const values = sample(track, THREE.MathUtils.lerp(JUMP_START, JUMP_END, phase));
      const weight = Math.sin(Math.PI * phase); // Grounded idle endpoints, one authored hop in between.
      if (/\.quaternion$/.test(track.name)) return new THREE.Quaternion().fromArray(rest).slerp(new THREE.Quaternion().fromArray(values), weight).normalize().toArray();
      return values.map((v, i) => THREE.MathUtils.lerp(rest[i], v, weight));
    });
  });
  const jump = new THREE.AnimationClip('jump', COURIER_JUMP_DURATION, jumpTracks);
  return {idle, walk, jump};
}
