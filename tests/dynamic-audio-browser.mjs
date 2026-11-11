/** Real controls exercise alternative-object feedback and the existing audio lifecycle. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const url = process.env.DYNAMIC_AUDIO_URL || 'http://127.0.0.1:5263';
const output = 'work/dynamic-audio';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: process.env.HEADED !== '1', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1360, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(20000);
const errors = [], records = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function record(label) { const s = await state(); records.push({ label, mode: s.mode, audio: s.audio }); return s; }
async function closeBook() { if (await page.locator('#notebook').isVisible()) await page.locator('#close-book').click(); }
async function range(channel, value) {
  const slider = page.locator(`#gain-${channel}`);
  await slider.focus();
  await slider.press('Home');
  for (let i = 0; i < Math.round(value * 100); i++) await slider.press('ArrowRight');
}
try {
  await page.goto(url, { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { polling: 100, timeout: 60000 });
  assert.equal((await record('before Start')).audio.state, 'locked');
  await page.locator('#start').click();
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).audio.loaded === 17);
  await delay(400);
  await closeBook();
  let s = await record('three loops after user gesture');
  assert.equal(s.audio.state, 'running'); assert.equal(s.audio.loops, 3); assert.equal(s.audio.loadError, '');
  assert.equal(s.mode, 'explore', 'fresh first island leaves the player in charge');
  assert.equal(s.learning.assisted, false, 'no solution model is shown automatically');
  assert.equal(await page.locator('#guided-example').isVisible(), false);
  assert.equal(await page.locator('#help-details').evaluate(el => el.open), false);
  await page.locator('#book-btn').click();
  assert.equal(await page.locator('#phrase').inputValue(), '');
  assert.equal(await page.locator('#guided-example').isVisible(), false);
  assert.equal(await page.locator('#dictionary').evaluate(el => el.open), false);
  assert.equal((await state()).learning.assisted, false);
  await page.screenshot({ path: `${output}/empty-notebook.png` });
  await closeBook();
  let rms = s.audio.rms;
  for (let i = 0; i < 5; i++) { await delay(160); rms = Math.max(rms, (await state()).audio.rms); }
  assert.ok(rms > .0001, 'real mixed output signal');

  // Keep these off-task on a bridge island so the ready chime cannot mask the object's own sound.
  for (const [phrase, expected] of [['a tarp', 'umbrella'], ['a tent', 'umbrella'], ['a blower', 'fan'], ['a metal barrel', 'metal'], ['a towel', 'page'], ['a rock', 'bounce']]) {
    await page.locator('#book-btn').click();
    await page.locator('#phrase').fill(phrase);
    await page.locator('#create').click();
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === 'placement');
    const before = (await state()).audio.cueTotal;
    await page.locator('#place').click();
    s = await record(`placed ${phrase}`);
    assert.equal(s.audio.lastCue, expected, `audible material/role feedback for ${phrase}`);
    assert.ok(s.audio.cueTotal > before);
    assert.ok(s.audio.oneShots <= 8);
    assert.equal(s.audio.loops, 3);
    await page.screenshot({ path: `${output}/placed-${phrase.replace(/^a /, '').replaceAll(' ', '-')}.png` });
    await page.locator('#undo-btn').click();
    assert.equal((await state()).audio.lastCue, 'undo');
    await delay(500);
  }
  await page.screenshot({ path: `${output}/alternative-feedback.png` });

  await page.locator('#help-details summary').click();
  await page.locator('#hint-btn').click();
  s = await record('help requested explicitly');
  assert.equal(s.learning.assisted, true); assert.equal(s.learning.hints, 1);
  await page.locator('#help-details summary').click();

  await page.locator('#settings-btn').click(); await delay(220);
  assert.equal((await record('settings pauses')).audio.state, 'suspended');
  await range('music', 0); await range('sfx', 0);
  await page.locator('#settings-close').click(); await delay(700);
  s = await record('separate channels muted');
  assert.equal(s.audio.state, 'running'); assert.equal(s.audio.gains.music, 0); assert.equal(s.audio.gains.sfx, 0); assert.ok(s.audio.rms < .00001);
  await page.locator('#settings-btn').click(); await range('music', .48); await range('sfx', .58); await range('master', 0);
  await page.locator('#settings-close').click(); await delay(700);
  assert.ok((await record('master muted')).audio.rms < .00001);
  await page.locator('#settings-btn').click(); await range('master', .75); await page.locator('#settings-close').click();
  await page.locator('#pause-btn').click(); await delay(220);
  assert.equal((await record('pause')).audio.state, 'suspended');
  await page.locator('#resume').click(); await delay(220);
  assert.equal((await record('resume')).audio.state, 'running');
  for (let i = 0; i < 3; i++) { await page.locator('#pause-btn').click(); await page.locator('#restart').click(); await closeBook(); assert.equal((await record(`restart ${i + 1}`)).audio.loops, 3); }
  await page.reload({ waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { polling: 100, timeout: 60000 });
  assert.equal((await record('reload respects gesture lock')).audio.state, 'locked');

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touch = await touchContext.newPage();
  touch.on('pageerror', error => errors.push(String(error)));
  touch.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await touch.goto(url, { waitUntil: 'commit', timeout: 60000 });
  await touch.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { polling: 100, timeout: 60000 });
  await touch.locator('#start').tap();
  await touch.waitForFunction(() => JSON.parse(window.render_game_to_text()).audio.loaded === 17, null, { polling: 100 });
  assert.equal((await touch.evaluate(() => JSON.parse(window.render_game_to_text()))).learning.assisted, false);
  await touch.locator('#book-btn').tap();
  assert.equal(await touch.locator('#phrase').inputValue(), '');
  assert.equal(await touch.locator('#guided-example').isVisible(), false);
  await touch.locator('#phrase').fill('a bridge'); await touch.locator('#create').tap(); await touch.locator('#place').tap();
  assert.equal((await touch.evaluate(() => JSON.parse(window.render_game_to_text()))).world.ready, true);
  await touch.locator('#use-btn').tap();
  await touch.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === 'complete', null, { polling: 100, timeout: 30000 });
  await touch.locator('#next').tap();
  await touch.locator('#book-btn').tap(); await touch.locator('#phrase').fill('a tarp'); await touch.locator('#create').tap(); await touch.locator('#place').tap();
  assert.equal((await touch.evaluate(() => JSON.parse(window.render_game_to_text()))).world.ready, true);
  await touch.screenshot({ path: `${output}/touch-rain-tarp.png` });
  await touch.setViewportSize({ width: 844, height: 390 });
  await touch.screenshot({ path: `${output}/touch-landscape-tarp.png` });
  for (const selector of ['#book-btn', '#undo-btn', '#use-btn', '#edit-selected', '#move-selected', '#remove-selected']) {
    const box = await touch.locator(selector).boundingBox();
    assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= 844 && box.y + box.height <= 390, `landscape ${selector}`);
    const hit = await touch.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.id, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    assert.equal(hit, selector.slice(1), `landscape ${selector} is reachable`);
  }
  records.push({ label: 'touch bridge win; next-island tarp alternative; landscape hit targets', audio: (await touch.evaluate(() => JSON.parse(window.render_game_to_text()))).audio });
  await touchContext.close();
  assert.deepEqual(errors, []);
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ passed: true, browser: browser.version(), maxObservedRms: rms, errors, records }, null, 2));
  console.log(JSON.stringify({ passed: true, records: records.length, maxObservedRms: rms, errors }));
} catch (error) {
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {});
  await fs.writeFile(`${output}/results.json`, JSON.stringify({ passed: false, error: String(error), errors, records }, null, 2));
  throw error;
} finally { await browser.close(); }
