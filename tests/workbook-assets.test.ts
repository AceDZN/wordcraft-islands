import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

// Inspect the actual release output. A source-only test would miss Vite's URL rewriting.
const dist = resolve(process.env.WORKBOOK_ASSET_DIST || fileURLToPath(new URL('../dist', import.meta.url)));
const mount = '/play/wordcraft-islands/version/';
const audioFiles = ['island-score.ogg', 'hopeful-stem.ogg', 'water-breeze.ogg',
  ...['notebook', 'page', 'confirm', 'create', 'wood', 'metal', 'rotate', 'bounce', 'splash', 'umbrella', 'fan', 'undo', 'success', 'mistake'].map(name => `${name}.wav`)];
const models = ['courier', 'boat', 'balloon', 'lamp', 'crate'];
const mime: Record<string, string> = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.glb': 'model/gltf-binary'};

test('release assets work from the nested Workbook mount', {skip: !existsSync(resolve(dist, 'index.html')) && 'Run npm run build before release-asset QA'}, async t => {
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
      // Deliberately no origin-root assets and no SPA fallback that could hide a missing file.
      if (!path.startsWith(mount)) {response.writeHead(404).end(); return;}
      const file = resolve(dist, path.slice(mount.length) || 'index.html');
      if (!file.startsWith(dist + sep)) {response.writeHead(404).end(); return;}
      const data = await readFile(file);
      response.writeHead(200, {'Content-Type': mime[extname(file)] || 'application/octet-stream'}).end(data);
    } catch {response.writeHead(404).end();}
  });
  await new Promise<void>((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  try {
    const address = server.address(); assert(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    const documents = [new URL(`${mount}?level=42`, origin), new URL(`${mount}index.html?level=42`, origin)];
    async function resource(reference: string, base: URL, contentType?: string) {
      const url = new URL(reference, base);
      assert.equal(url.origin, origin, `external dependency: ${url}`);
      assert(url.pathname.startsWith(mount), `escaped the Workbook mount: ${url}`);
      const response = await fetch(url, {signal: AbortSignal.timeout(30_000)});
      assert.equal(response.status, 200, `missing asset: ${url}`);
      if (contentType) assert.equal(response.headers.get('content-type'), contentType, `wrong resource type: ${url}`);
      return {url, bytes: Buffer.from(await response.arrayBuffer())};
    }
    const html = (await resource('index.html', documents[0], 'text/html')).bytes.toString();
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(match => match[1]);
    const styles = [...html.matchAll(/<link\b[^>]*>/g)].filter(match => /\brel=["']stylesheet["']/.test(match[0])).map(match => match[0].match(/\bhref=["']([^"']+)["']/)![1]);
    const bundles: string[] = [];

    await t.test('HTML entries and CSS font resolve inside both supported deep-link document forms', async () => {
      assert(scripts.length > 0 && styles.length > 0, 'missing built JS/CSS entries');
      let fonts = 0;
      for (const document of documents) {
        for (const script of scripts) bundles.push((await resource(script, document, 'text/javascript')).bytes.toString());
        for (const style of styles) {
          const css = await resource(style, document, 'text/css');
          for (const match of css.bytes.toString().matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
            if (match[1].startsWith('data:')) continue;
            const asset = await resource(match[1], css.url);
            if (asset.url.pathname.endsWith('.ttf')) {
              assert([0x00010000, 0x4f54544f].includes(asset.bytes.readUInt32BE()), 'font request returned something other than a TrueType/OpenType file');
              fonts++;
            }
          }
        }
      }
      assert(fonts >= documents.length, 'the bundled Hebrew font was not exercised');
    });

    const bundle = bundles.join('\n');
    function loaderTemplate(method: string, folder: string) {
      const pattern = new RegExp('\\b' + method + '\\(\\s*([`\'\"])([^`\'\"]*' + folder + '/[^`\'\"]*)\\1\\)', 'g');
      const templates = [...bundle.matchAll(pattern)].map(match => match[2]);
      assert(templates.length > 0, `could not find the built ${folder} loader; update this release-output check if bundling changed`);
      return [...new Set(templates)];
    }

    await t.test('all 17 runtime audio buffers and the separate preview have local playable-file signatures', async () => {
      for (const template of loaderTemplate('fetch', 'audio')) {
        assert(/\$\{[^}]+\}/.test(template), 'audio loader must expose its filename substitution');
        for (const file of audioFiles) {
          const asset = await resource(template.replace(/\$\{[^}]+\}/g, file), documents[0], mime[extname(file)]);
          assert.equal(asset.bytes.toString('ascii', 0, 4), file.endsWith('.ogg') ? 'OggS' : 'RIFF', file);
          if (file.endsWith('.wav')) assert.equal(asset.bytes.toString('ascii', 8, 12), 'WAVE', file);
        }
      }
      const previews = [...bundle.matchAll(/href=["']([^"']*mixed-preview\.wav)["']/g)];
      assert(previews.length > 0, 'settings preview link missing from release');
      for (const preview of previews) {
        const {bytes} = await resource(preview[1], documents[1], 'audio/wav');
        assert.equal(bytes.toString('ascii', 0, 4), 'RIFF'); assert.equal(bytes.toString('ascii', 8, 12), 'WAVE');
      }
    });

    await t.test('all five GLBs resolve locally, including any texture or buffer sidecars', async () => {
      for (const template of loaderTemplate('loadAsync', 'models')) {
        assert(/\$\{[^}]+\}/.test(template), 'model loader must expose its name substitution');
        for (const model of models) {
          const asset = await resource(template.replace(/\$\{[^}]+\}/g, model), documents[0], 'model/gltf-binary');
          assert.equal(asset.bytes.toString('ascii', 0, 4), 'glTF', model);
          assert.equal(asset.bytes.readUInt32LE(4), 2, model);
          assert.equal(asset.bytes.readUInt32LE(8), asset.bytes.length, model);
          assert.equal(asset.bytes.readUInt32LE(16), 0x4e4f534a, 'GLB must begin with its JSON chunk');
          const json = JSON.parse(asset.bytes.toString('utf8', 20, 20 + asset.bytes.readUInt32LE(12)));
          for (const entry of [...(json.buffers || []), ...(json.images || [])]) {
            if (entry.uri && !entry.uri.startsWith('data:')) await resource(entry.uri, asset.url);
          }
        }
      }
    });

    await t.test('the fixture cannot conceal origin-root asset regressions with a fallback page', async () => {
      for (const path of ['/audio/island-score.ogg', '/models/courier.glb', '/fonts/Rubik-Variable.ttf', `${mount}missing.glb`]) {
        assert.equal((await fetch(new URL(path, origin), {signal: AbortSignal.timeout(30_000)})).status, 404, path);
      }
    });
  } finally {
    await new Promise<void>((resolve, reject) => {server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();});
  }
});
