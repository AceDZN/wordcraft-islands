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

Run against the actual running game at `http://localhost:5263` using `node docs/audio/browser-qa.mjs` and `AUDIO_HEADED=1 node docs/audio/browser-qa.mjs`. The script drives real Start, notebook, phrase creation, placement, undo, settings, pause/resume and restart controls. It also supports `AUDIO_QA_URL` for a static preview. Evidence: `browser-qa.json`, `browser-qa-headed.json` and actual gameplay captures in this folder.

Verified in Chromium 156: locked/no audio before Start; 17 successfully decoded assets; running 22,050 Hz context and exactly three loop sources; nonzero browser output; notebook/create/wood/undo cues; hopeful state after a physically valid crossing; independent music/SFX/voice/master UI gains; music+SFX mute and master mute give zero measured output; pause suspends and resume runs; four restarts retain exactly three loops; settings survive reload while playback waits for a fresh Start gesture; preview returns HTTP 200. The first clean headless run observed output RMS up to .028 in the sampled music windows. Settings values matched `getState().gains`.

A code review found that the completion overlay initially paused the success flourish. The lead corrected that integration. `node docs/audio/flourish-qa.mjs` then actually created/placed a plank, crossed with the movement control and deterministic time hook, reached completion, verified the success source and hopeful layer still running after 250 ms, verified the flourish ended naturally, and advanced to the next island with the hopeful layer reset. Evidence: `flourish-qa.json`, `completion-flourish.png` (visually inspected).

Earlier headed runs were interrupted by Vite full reload while source integration was changing, and a later run surfaced a missing favicon. These were integration/test-environment issues; the lead added the favicon and a stable final run followed. Do not treat those interrupted runs as proof of audio failure or success.

**Focus test limit:** opening/foregrounding another tab in both headed and headless Playwright left `document.hidden` false, even after disabling Playwright focus emulation. A native testing-window attempt also did not expose a reliable visibility transition. Therefore actual OS/tab-hide suspension is not marked verified. The actual registered blur/focus event listeners were exercised by dispatched window events and correctly suspended/resumed the context; visibility-change behavior is implemented but remains a manual device check.

No human audition was performed. The headed browser exposed “Audio playing”, and buffer decoding/output/gain/lifecycle checks passed, but waveform/RMS checks are not a listening-quality assessment. Installed read-aloud voice availability, pronunciation and real utterance ducking were not independently auditioned; voice gain persistence was tested. Browser/OS voice differences and non-Chromium Ogg Opus support remain compatibility checks.
