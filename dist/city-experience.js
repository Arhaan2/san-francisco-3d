import { Vector2 } from 'three';

const neighborhoods = new Set(['mission', 'pacific-heights', 'north-beach', 'chinatown']);

export function readSharedView(hash = location.hash) {
  if (!hash.startsWith('#view=') || hash.length > 240) return null;
  const params = new URLSearchParams(hash.slice(1));
  if (params.getAll('view').length !== 1 || params.getAll('area').length > 1) return null;
  const neighborhood = params.get('area');
  if (neighborhood !== null && !neighborhoods.has(neighborhood)) return null;
  const tokens = params.get('view').split(',');
  if (tokens.some(token => !token.trim())) return null;
  const values = tokens.map(Number);
  if (values.length !== 9 || !values.every(Number.isFinite) || values[0] !== 1) return null;
  const [, hour, fov, ...coordinates] = values;
  if (hour < 0 || hour > 24 || fov < 12 || fov > 75 || coordinates.some(n => Math.abs(n) > 80)) return null;
  if (coordinates[1] < -5 || coordinates[1] > 50 || coordinates[4] < -5 || coordinates[4] > 50) return null;
  const difference = coordinates.slice(0, 3).map((n, i) => n - coordinates[i + 3]);
  const distance = Math.hypot(...difference);
  if (distance < .0249 || distance > 45.01 || difference[1] / distance < Math.cos(Math.PI * .49) - .001) return null;
  return { hour, fov, position: coordinates.slice(0, 3), target: coordinates.slice(3), ...(neighborhood ? { neighborhood } : {}) };
}

export function createViewURL(api, neighborhood) {
  const values = [1, api.getTimeOfDay(), api.camera.fov, ...api.camera.position.toArray(), ...api.controls.target.toArray()];
  const url = new URL(location.href);
  url.hash = 'view=' + values.map(n => Number(n.toFixed(5))).join(',');
  if (neighborhoods.has(neighborhood)) url.hash += '&area=' + neighborhood;
  return url.href;
}

function clockLabel(hour) {
  const minutes = Math.round(hour * 60) % 1440;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// An original, quiet soundscape made in the browser. No audio recording is fetched.
function createHarborAudio() {
  let context, master, enabled = false, timer, suspendTimer;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  function initialize() {
    if (!AudioEngine) throw new Error('Audio is unavailable in this browser.');
    context = new AudioEngine();
    master = context.createGain(); master.gain.value = 0; master.connect(context.destination);
    const buffer = context.createBuffer(2, context.sampleRate * 16, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel); let brown = 0;
      for (let i = 0; i < data.length; i++) {
        brown = (brown + (Math.random() * 2 - 1) * .025) / 1.025;
        data[i] = brown * 3.5;
      }
      const seam = Math.min(4096, data.length / 4);
      for (let i = 0; i < seam; i++) {
        const t = i / seam;
        data[data.length - seam + i] = data[data.length - seam + i] * (1 - t) + data[i] * t;
      }
    }
    const wash = context.createBufferSource(); wash.buffer = buffer; wash.loop = true;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 950;
    const waves = context.createGain(); waves.gain.value = .6;
    wash.connect(filter).connect(waves).connect(master); wash.start();
    const swell = context.createOscillator(); swell.frequency.value = .09;
    const swellDepth = context.createGain(); swellDepth.gain.value = .22;
    swell.connect(swellDepth).connect(waves.gain); swell.start();
    const harbor = context.createOscillator(); harbor.type = 'sine'; harbor.frequency.value = 72;
    const harborGain = context.createGain(); harborGain.gain.value = .018;
    harbor.connect(harborGain).connect(master); harbor.start();
  }
  function bell() {
    if (!enabled || document.hidden || context.state !== 'running') return;
    const now = context.currentTime;
    for (const [ratio, amplitude] of [[1, .12], [2.76, .024], [5.4, .009]]) {
      const tone = context.createOscillator(), envelope = context.createGain();
      tone.frequency.value = 587 * ratio;
      envelope.gain.setValueAtTime(.0001, now);
      envelope.gain.exponentialRampToValueAtTime(amplitude, now + .012);
      envelope.gain.exponentialRampToValueAtTime(.0001, now + 3.4);
      tone.connect(envelope).connect(master); tone.start(now); tone.stop(now + 3.5);
    }
  }
  function gull() {
    if (!enabled || document.hidden || context.state !== 'running') return;
    const now = context.currentTime, call = context.createOscillator(), gain = context.createGain();
    call.type = 'sine'; call.frequency.setValueAtTime(1000, now);
    call.frequency.exponentialRampToValueAtTime(1450, now + .13);
    call.frequency.exponentialRampToValueAtTime(780, now + .55);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.035, now + .1);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .65);
    call.connect(gain).connect(master); call.start(); call.stop(now + .7);
  }
  async function setEnabled(value) {
    clearTimeout(suspendTimer); clearInterval(timer);
    if (value && !context) initialize();
    if (!context) return;
    if (value) {
      await context.resume(); enabled = true;
      master.gain.setTargetAtTime(.11, context.currentTime, .3);
      let count = 0;
      timer = setInterval(() => { count++; if (count % 3 === 0) bell(); else gull(); }, 17000);
    } else {
      enabled = false; master.gain.setTargetAtTime(0, context.currentTime, .08);
      suspendTimer = setTimeout(() => context.suspend().catch(() => {}), 500);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!context || !enabled) return;
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().catch(() => {});
  });
  return { setEnabled, get enabled() { return enabled; } };
}

export function setupExperience(api, { notify, onRestore = () => {}, getNeighborhood = () => null, restoreNeighborhood = async () => {} }) {
  const time = document.getElementById('time-of-day');
  const label = document.getElementById('time-label');
  const motion = document.getElementById('motion-toggle');
  const sound = document.getElementById('ambience-toggle');
  const share = document.getElementById('share-view');
  const postcard = document.getElementById('export-postcard');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const audio = createHarborAudio();
  let audioBusy = false;

  function updateTime() {
    const hour = api.getTimeOfDay(); time.value = hour;
    label.textContent = clockLabel(hour); time.setAttribute('aria-valuetext', clockLabel(hour));
  }
  time.addEventListener('input', () => { api.setTimeOfDay(Number(time.value)); updateTime(); });
  motion.checked = api.setAnimationEnabled(!reduced.matches);
  motion.addEventListener('change', () => {
    const requested = motion.checked;
    motion.checked = api.setAnimationEnabled(requested);
    if (requested && !motion.checked && reduced.matches) {
      // Keep the stored preference consistent with the visible unchecked state.
      api.setAnimationEnabled(false);
      notify('Motion stays paused while Reduce Motion is enabled on your device.');
    }
  });
  reduced.addEventListener('change', event => {
    motion.checked = event.matches ? api.setAnimationEnabled(false) : api.getAnimationEnabled();
  });
  sound.addEventListener('click', async () => {
    if (audioBusy) return; audioBusy = true;
    try {
      await audio.setEnabled(!audio.enabled);
      sound.setAttribute('aria-pressed', String(audio.enabled));
      sound.textContent = audio.enabled ? 'Ambience on' : 'Ambience off';
      notify(audio.enabled ? 'Quiet harbor ambience is on.' : 'Ambience muted.');
    } catch { notify('Audio could not start. Try again after interacting with the page.'); }
    finally { audioBusy = false; }
  });
  share.addEventListener('click', async () => {
    const url = createViewURL(api, getNeighborhood());
    try {
      await navigator.clipboard.writeText(url);
      history.replaceState(null, '', url);
      notify('View copied, including your camera, lighting and neighborhood.');
    } catch {
      // Keep the view recoverable through the browser address when clipboard access is denied.
      history.replaceState(null, '', url);
      notify('Your view is now in the page address. Copy it from the browser to share.');
    }
  });
  postcard.addEventListener('click', async () => {
    if (postcard.disabled) return;
    postcard.disabled = true; const oldText = postcard.textContent; postcard.textContent = 'Preparing postcard…';
    try {
      await document.fonts.ready;
      const size = api.renderer.getSize(new Vector2()), ratio = api.renderer.getPixelRatio(), oldAspect = api.camera.aspect;
      const scale = Math.min(2560 / size.x, 2000 / size.y);
      const width = Math.max(1, Math.round(size.x * scale)), height = Math.max(1, Math.round(size.y * scale));
      const paper = document.createElement('canvas'), margin = Math.round(width * .035), footer = Math.max(100, Math.round(width * .07));
      paper.width = width + margin * 2; paper.height = height + margin * 2 + footer;
      const ctx = paper.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#e9ece9'; ctx.fillRect(0, 0, paper.width, paper.height);
      try {
        api.renderer.setPixelRatio(1); api.renderer.setSize(width, height, false);
        api.camera.aspect = width / height; api.camera.updateProjectionMatrix();
        api.renderer.render(api.scene, api.camera);
        ctx.drawImage(api.renderer.domElement, margin, margin, width, height);
      } finally {
        // Restore synchronously, before PNG encoding or any possible window resize.
        api.renderer.setPixelRatio(ratio); api.renderer.setSize(size.x, size.y, false);
        api.camera.aspect = oldAspect; api.camera.updateProjectionMatrix(); api.renderer.render(api.scene, api.camera);
      }
      ctx.fillStyle = '#111619'; ctx.font = `${Math.max(34, Math.round(width * .027))}px Archivo, sans-serif`;
      ctx.textBaseline = 'middle'; ctx.fillText('San Francisco', margin, height + margin + footer * .5);
      ctx.font = `${Math.max(20, Math.round(width * .012))}px Archivo, sans-serif`; ctx.textAlign = 'right';
      ctx.fillText(`${clockLabel(api.getTimeOfDay())}  ·  Arhaan × Codex`, width + margin, height + margin + footer * .5);
      const blob = await new Promise(resolve => paper.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Export unavailable');
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'San-Francisco-postcard.png'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      notify('Postcard saved as a PNG.');
    } catch (error) {
      console.warn('Postcard export:', error); notify('This device could not export the postcard. Try a smaller browser window.');
    } finally {
      postcard.disabled = false; postcard.textContent = oldText;
    }
  });
  let restoreVersion = 0;
  // A deliberate interaction wins over a shared neighborhood still loading.
  api.controls.addEventListener('start', () => { restoreVersion++; });
  const viewer = document.getElementById('viewer');
  for (const event of ['pointerdown', 'click', 'input', 'change']) viewer.addEventListener(event, () => { restoreVersion++; }, { capture: true });
  api.renderer.domElement.addEventListener('keydown', event => { if (event.key.startsWith('Arrow')) restoreVersion++; });
  async function restore() {
    const state = readSharedView(); if (!state) return false;
    const version = ++restoreVersion;
    onRestore();
    const restored = await restoreNeighborhood(state.neighborhood || null);
    if (version !== restoreVersion) return false;
    api.flyTo(state.position, state.target, state.fov, 0); api.setTimeOfDay(state.hour); updateTime();
    notify(restored === false ? 'Saved camera restored. Extra neighborhood detail could not load.' : 'Shared perspective restored.'); return true;
  }
  window.addEventListener('hashchange', restore);
  updateTime(); restore();
  let lastHour = api.getTimeOfDay();
  api.addTick(() => { if (api.getTimeOfDay() !== lastHour) { lastHour = api.getTimeOfDay(); updateTime(); } });
  return { restore, cancelRestore: () => { restoreVersion++; }, createViewURL: () => createViewURL(api, getNeighborhood()) };
}
