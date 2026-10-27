# Wordcraft Islands audio

Original music and sound design composed locally for this game on 27 October 2026. No commercial music, external samples, paid generation, accounts or runtime network audio. The composition source is `docs/audio/score.py`; it deterministically renders every bundled asset with NumPy and FFmpeg. Project-generated music and cues are released under CC0-1.0 for redistribution with this game.

## Score

92 BPM, 4/4, D major with B-minor colour. **32 bars, ABAC**, eight bars per section, approximately 83.478 seconds per loop. The A phrase begins D5–F♯5–A5–F♯5, answers E5–D5, and returns through C♯5 to D5. B reaches D6 and uses shorter answering phrases; C opens more space, then resolves to D5. The second A uses a quieter melody. Harmony moves D–G–Bm–A–D–G–A–D in each eight-bar block. Root/fifth bass, staggered chord plucks, sparse high mallet answers, offbeat shakers, wooden percussion and section-ending mallet fills form separate voices.

`island-score.ogg` is a stereo rendered score, with a nylon-like harmonic pluck and soft decaying upper partials rather than a single oscillator beep. `hopeful-stem.ogg` adds higher mallet arpeggios after a puzzle is solved; it is synchronised to the score and fades in over 750 ms. `water-breeze.ogg` supplies quiet wave wash with filtered-noise breeze and cloth/leaf motion. Ambience follows the music gain. All three are local Ogg Opus files, decoded once to Web Audio buffers in a requested 22,050 Hz context (about 44.2 MB for all three stereo loops; devices choosing another rate may use more). Assets need a browser with Ogg Opus decoding (tested Chromium; other engines remain a compatibility check).

The loop render uses an exact bar duration, circular room taps and 15 ms edge fades. Numeric boundary measurements are in `docs/audio/metrics.json`. These checks detect discontinuity and clipping; they do not establish perceived musical quality.

## Action cues

Fourteen separate locally rendered WAV cues: notebook paper/cover, page brush, typing confirmation mallet, rising creation swirl, wood impact, inharmonic metal impact, rotation tick, elastic bounce, water splash, cloth umbrella unfurl, fan motor/wind, descending undo, resolved puzzle flourish, and a soft descending mistake pair. Physics wood and metal use different spectra and decays. Each playback has a small ±3% rate variation. At most eight one-shots can overlap; extra cues are dropped when the cap is reached so existing decays are not cut off. All correctness information also needs visible mission/feedback text.

## Integration

`src/audio.ts` exports `audio`:

- `start()` unlocks/resumes from a user gesture, fetches/decode assets and starts one synchronised loop set.
- `cue(name)` plays a cue; `setSolved(boolean)` controls the hopeful layer.
- `pause(boolean)` fades the master, then clears one-shot tails and suspends the context; tab hide and window blur apply the same pause. Focus resumes only previously requested playback.
- `setGain('music' | 'sfx' | 'voice' | 'master', 0..1)` persists independently to local storage and uses gain ramps. Zero is mute.
- `speak(text)` optionally uses an installed English browser voice at the voice/master gain, ducking music/ambience to 26%. The visible mission is the subtitle. Voice availability and pronunciation depend on the platform; no speaking/listening assessment is claimed.
- `getState()` reports context state, asset/loop counts, one-shot counts, latest cue, gains, ducking and measured output RMS. `dispose()` ends the audio session.

Default gains: master .75, music .48, SFX .58, voice .85. A dynamics compressor keeps output headroom. Restarting gameplay should call `setSolved(false)` and reuse this singleton; repeated `start()` calls do not create another loop set.

## Preview and checks

[26-second mixed preview](docs/audio/mixed-preview.wav) (also bundled at `public/audio/mixed-preview.wav` for the in-game link; it is not loaded during play) combines music, water/breeze, notebook, creation, wood, rotation, splash, undo, success, umbrella, metal and fan cues. The hopeful stem enters at 13 seconds. `metrics.json` records decoded duration, peak, RMS and sample boundary differences. Source and decoding were checked locally; actual browser integration checks are recorded below when the running build is available. No human listening/audition claim is made.

### Browser QA

Pending integration: Start gesture, gain controls and persistence, pause/resume, repeated restart, focus changes, output signal and asset decoding will be checked against the running game. This pending section must not be reported as passed.
