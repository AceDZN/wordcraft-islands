# Actual creation-loop recording

`gameplay-60s.mp4` is a 60-second trim of the actual Playwright browser recording `source-loop.webm`, with no invented frames or rendered game state. `record.mjs` drives real keyboard/pointer/form controls. The final take holds D in real wall-clock playback until the explorer walks across; it does not inject a win or teleport the player. The footage contains an unsupported short plank, Undo, a valid alternative ladder, a walking crossing/completion, and the grade-8 measured gap solved using a long wooden plank. The state sequence preserves the actual observed states and zero page errors.

The recording is silent because Playwright video capture does not record browser audio. Music/ambience/action playback were independently verified; the original mixed26-second audio preview is in docs/audio/mixed-preview.wav. No added soundtrack is falsely represented as captured live audio.

The MP4 only trims initial loading and the final hold and transcodes the original footage for convenient playback. The state-sequence `second` values are relative to the loaded explorer scene. All stills are real gameplay, not the generated design target. The final property screenshot and the state sequence come from this final take.

`regression.mjs` and `g9-final-complete.{png,json}` are separate UI evidence for fullscreen exit, nested Escape, assisted copying, two-component completion counts and replay layout/order variation. `client/` contains inspected skill-client canvas captures and state including the static built preview.
