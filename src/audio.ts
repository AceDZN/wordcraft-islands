/** Original, locally bundled island score. See AUDIO.md and docs/audio/score.py. */
type Channel = 'music' | 'sfx' | 'voice' | 'master';
type Gains = Record<Channel, number>;
const DEFAULTS: Gains = { music: .48, sfx: .58, voice: .85, master: .75 };
const cueNames = ['notebook', 'page', 'confirm', 'create', 'wood', 'metal', 'rotate', 'bounce', 'splash', 'umbrella', 'fan', 'undo', 'success', 'mistake'] as const;
const aliases: Record<string, string> = { open: 'notebook', type: 'confirm', land: 'wood', place: 'wood', error: 'mistake', wrong: 'mistake', win: 'success', recovery: 'undo', jump: 'bounce', fanStart: 'fan', fanStop: 'fan', 'land-wood': 'wood', 'land-metal': 'metal' };
class IslandAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private effects?: GainNode;
  private hope?: GainNode;
  private analyser?: AnalyserNode;
  private buffers = new Map<string, AudioBuffer>();
  private loops: AudioBufferSourceNode[] = [];
  private voices = new Set<AudioBufferSourceNode>();
  private settings: Gains = { ...DEFAULTS };
  private loading?: Promise<void>;
  private suspendTimer?: number;
  private requested = false;
  private paused = false;
  private hidden = false;
  private solved = false;
  private ducked = false;
  private loadError = '';
  private cueTotal = 0;
  private lastCue = '';
  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem('wordcraft-audio-v1') || '{}');
      for (const channel of Object.keys(DEFAULTS) as Channel[]) if (typeof saved[channel] === 'number') this.settings[channel] = Math.max(0, Math.min(1, saved[channel]));
    } catch { /* An unavailable storage area must not block play. */ }
    document.addEventListener('visibilitychange', () => { this.hidden = document.hidden; this.syncPause(); });
    window.addEventListener('blur', () => { this.hidden = true; this.syncPause(); });
    window.addEventListener('focus', () => { this.hidden = document.hidden; this.syncPause(); });
  }
  async start() {
    this.requested = true;
    this.paused = false;
    this.hidden = document.hidden;
    if (!this.context) {
      const ctx = this.context = new AudioContext({ sampleRate: 22050 });
      this.master = ctx.createGain(); this.music = ctx.createGain(); this.effects = ctx.createGain(); this.hope = ctx.createGain(); this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -6; compressor.knee.value = 9; compressor.ratio.value = 5; compressor.attack.value = .006; compressor.release.value = .12;
      this.music.connect(this.master); this.hope.connect(this.music); this.effects.connect(this.master); this.master.connect(compressor); compressor.connect(this.analyser); this.analyser.connect(ctx.destination);
      this.applyGains(true);
      // resume is called synchronously in the first gesture, before awaiting asset fetches.
      await ctx.resume();
      this.loading = this.load();
    } else if (this.context.state === 'suspended') await this.context.resume();
    await this.loading;
    this.ensureLoops(); this.syncPause();
  }
  private async load() {
    const files: [string, string][] = [['score', 'island-score.ogg'], ['hope', 'hopeful-stem.ogg'], ['ambience', 'water-breeze.ogg'], ...cueNames.map(n => [n, `${n}.wav`] as [string, string])];
    await Promise.all(files.map(async ([name, file]) => {
      try {
        const response = await fetch(`${(import.meta as ImportMeta & { env: { BASE_URL: string } }).env.BASE_URL}audio/${file}`);
        if (!response.ok) throw new Error(`${response.status}: ${file}`);
        const buffer = await this.context!.decodeAudioData(await response.arrayBuffer());
        this.buffers.set(name, buffer);
      } catch (e) { this.loadError = String(e); console.error('Local audio load failed', file, e); }
    }));
  }
  private ensureLoops() {
    if (this.loops.length || !this.context || !this.music || !this.hope) return;
    const when = this.context.currentTime + .04;
    for (const name of ['score', 'hope', 'ambience']) {
      const buffer = this.buffers.get(name); if (!buffer) continue;
      const source = this.context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const gain = this.context.createGain(); gain.gain.value = name === 'ambience' ? .48 : 1;
      source.connect(gain); gain.connect(name === 'hope' ? this.hope : this.music); source.start(when);
      this.loops.push(source);
    }
  }
  cue(name: string) {
    const ctx = this.context; const key = aliases[name] || name; const buffer = this.buffers.get(key);
    if (!ctx || ctx.state !== 'running' || this.paused || this.hidden || !buffer || !this.effects) return;
    if (this.voices.size >= 8) return; // Preserve existing natural decays; drop excess input instead of hard-stopping a voice.
    const source = ctx.createBufferSource(); source.buffer = buffer; source.playbackRate.value = .97 + Math.random() * .06;
    const gain = ctx.createGain(); gain.gain.value = key === 'success' ? .7 : .8;
    source.connect(gain); gain.connect(this.effects); source.onended = () => { this.voices.delete(source); source.disconnect(); gain.disconnect(); };
    this.voices.add(source); source.start(); this.cueTotal++; this.lastCue = key;
  }
  pause(value: boolean) { this.paused = value; this.syncPause(); }
  private syncPause() {
    if (!this.context || !this.master) return;
    window.clearTimeout(this.suspendTimer);
    const stopped = this.paused || this.hidden || !this.requested;
    if (stopped) {
      this.ramp(this.master, 0, .025);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      this.ducked = false;
      this.suspendTimer = window.setTimeout(() => {
        if ((this.paused || this.hidden || !this.requested) && this.context?.state === 'running') {
          this.voices.forEach(source => source.stop()); this.voices.clear(); // Do not replay a stale impact after resume.
          void this.context.suspend();
        }
      }, 90);
    } else {
      void this.context.resume(); this.applyGains();
    }
  }
  setSolved(value: boolean) { this.solved = value; if (this.hope) this.ramp(this.hope, value ? .42 : 0, .75); }
  setGain(channel: Channel, value: number) {
    this.settings[channel] = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : DEFAULTS[channel];
    try { localStorage.setItem('wordcraft-audio-v1', JSON.stringify(this.settings)); } catch { /* optional persistence */ }
    this.applyGains();
  }
  private ramp(node: GainNode, value: number, time = .055) {
    const now = this.context!.currentTime; node.gain.cancelScheduledValues(now); node.gain.setTargetAtTime(value, now, time);
  }
  private applyGains(immediate = false) {
    if (!this.master || !this.music || !this.effects || !this.hope) return;
    const update = (node: GainNode, n: number) => immediate ? node.gain.setValueAtTime(n, this.context!.currentTime) : this.ramp(node, n);
    update(this.master, this.paused || this.hidden ? 0 : this.settings.master);
    update(this.music, this.settings.music * (this.ducked ? .26 : 1)); update(this.effects, this.settings.sfx); update(this.hope, this.solved ? .42 : 0);
  }
  /** Optional platform read-aloud. Browser voices vary; visible mission text is its subtitle. */
  stopVoice() { if ('speechSynthesis' in window) speechSynthesis.cancel(); this.ducked = false; this.applyGains(); }
  speak(text: string) {
    if (!('speechSynthesis' in window) || !this.requested || this.paused || this.hidden || this.settings.voice === 0 || this.settings.master === 0) return false;
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB'; utterance.rate = .88; utterance.volume = this.settings.voice * this.settings.master;
    utterance.onstart = () => { this.ducked = true; this.applyGains(); };
    const end = () => { this.ducked = false; this.applyGains(); }; utterance.onend = end; utterance.onerror = end;
    speechSynthesis.speak(utterance); return true;
  }
  getState() {
    let rms = 0;
    if (this.analyser && this.context?.state === 'running') { const data = new Float32Array(this.analyser.fftSize); this.analyser.getFloatTimeDomainData(data); rms = Math.sqrt(data.reduce((n, x) => n + x*x, 0) / data.length); }
    return { state: this.context?.state || 'locked', sampleRate: this.context?.sampleRate || 0, requested: this.requested, paused: this.paused, hidden: this.hidden, loaded: this.buffers.size, loops: this.loops.length, oneShots: this.voices.size, cueTotal: this.cueTotal, lastCue: this.lastCue, solved: this.solved, ducked: this.ducked, gains: { ...this.settings }, rms: Math.round(rms*100000)/100000, loadError: this.loadError };
  }
  dispose() {
    this.requested = false; window.clearTimeout(this.suspendTimer);
    this.loops.forEach(source => source.stop()); this.loops = []; this.voices.forEach(source => source.stop()); this.voices.clear();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    void this.context?.close(); this.context = undefined; this.loading = undefined; this.buffers.clear();
  }
}
export const audio = new IslandAudio();
