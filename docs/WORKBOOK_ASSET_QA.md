# Workbook nested-path asset QA

28 October 2026. Source and built-file audit for hosting the static game beneath `/play/wordcraft-islands/version/`. This review changes no runtime code or audio assets and makes no deployment claim.

## Result

No failing origin-root application asset URL was found in the inspected release output. `vite.config.ts` uses `base: './'`. Both `/play/wordcraft-islands/version/?level=42` and `/play/wordcraft-islands/version/index.html?level=42` preserve the expected resource base.

| Resource | Inspected built URL | Check |
| --- | --- | --- |
| Entry JavaScript/CSS | `./assets/index-SbI06xmo.js`, `./assets/index-BRM5rf8f.css` | HTTP 200, appropriate resource MIME type, inside nested mount |
| Bundled Rubik font | `../fonts/Rubik-Variable.ttf` from the CSS URL | HTTP 200 and TrueType signature |
| Music, ambience and effects | `./audio/${filename}` | All 17 runtime files, HTTP 200, Ogg/WAV signatures |
| Settings preview | `./audio/mixed-preview.wav` | HTTP 200 and RIFF/WAVE signature; separate from initial audio loading |
| Featured models | `./models/${name}.glb` | All five, valid GLB v2 header/length/JSON chunk |
| Model dependencies | Embedded buffers and image bufferViews | No external texture/buffer URI in any of the five inspected GLBs |

The source font rule uses `/fonts/Rubik-Variable.ttf`, but Vite rewrites it to the working CSS-relative path above. The source HTML `/src/main.ts` entry is also rewritten at build time. Neither is a release-path defect. The SVG favicon is an inline data URI; its XML namespace is not an external asset request. Three's Meshopt decoder is imported through the bundled module graph rather than fetched from a CDN.

## Regression test

`tests/workbook-assets.test.ts` reads the actual `dist` output and starts a temporary loopback HTTP server that exposes **only** the nested mount. It has no origin-root assets or SPA fallback. The test follows built HTML/CSS references, the built audio/model loader templates and the settings preview link. It also inspects model dependencies and would fetch any relative texture/buffer sidecar from the model's URL.

Run after generating the release build:

```sh
npm run build
npx tsx --test tests/workbook-assets.test.ts
```

Actual execution against the existing build: **5 tests passed, 0 failed, 0 skipped**; 2.54 seconds overall. Root-absolute `/audio/…`, `/models/…`, `/fonts/…` and a missing nested GLB deliberately returned 404. This ensures a fallback HTML page cannot masquerade as a successful asset response. A missing `dist/index.html` skips the built-output test explicitly; an alternate build can be selected with `WORKBOOK_ASSET_DIST`.

## Host contract and limits

- Serve the version directory with its trailing slash, or serve its `index.html` explicitly. A host link without the final slash must redirect before the browser resolves relative resources.
- Keep level deep links in the query string. Adding level path segments changes the base used by relative assets unless the host supplies an explicit compatible base/routing scheme.
- Serve the complete built directory, including `assets`, `fonts`, `models` and `audio`, with appropriate MIME types. A 200 HTML fallback is not a replacement for a missing binary file.
- Rerun the test on the final release artifact after any rebuild. The inspected hashed entry filenames identify this audit's artifact, not a permanent deployment path.

This is HTTP/file-format verification, not a browser listening or rendering claim. Workbook iframe policy, actual host routing, browser audio decoding/autoplay after a gesture, and rendered font/model checks belong to the lead's separate browser verification. Existing composition and score stay unchanged; no paid service or remote runtime asset dependency was added.
