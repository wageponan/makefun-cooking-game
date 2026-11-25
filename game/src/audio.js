// Tiny generated sound kit for Warung Nusantara: every effect is a WebAudio
// tone made on the spot, so the game needs no audio files and stays offline.

let audioContext = null;

function ensureContext() {
  if (audioContext) return audioContext;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioContext = new Ctor();
  } catch {
    audioContext = null;
  }
  return audioContext;
}

function tone(freq, duration, type, volume, delaySeconds, slideTo) {
  const ctx = ensureContext();
  if (!ctx) return;
  const start = ctx.currentTime + (delaySeconds || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(volume || 0.08, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sounds = {
  unlock() { ensureContext(); },
  pick() { tone(520, 0.07, 'triangle', 0.07); },
  layer() { tone(660, 0.08, 'triangle', 0.08); tone(880, 0.06, 'sine', 0.05, 0.04); },
  mistake() { tone(160, 0.16, 'sawtooth', 0.06, 0, 110); },
  serve() { tone(523, 0.09, 'triangle', 0.09); tone(659, 0.09, 'triangle', 0.09, 0.08); tone(784, 0.14, 'triangle', 0.1, 0.16); },
  angry() { tone(220, 0.2, 'square', 0.05, 0, 140); },
  bell() { tone(1175, 0.25, 'sine', 0.07); tone(1568, 0.3, 'sine', 0.04, 0.03); },
  trash() { tone(300, 0.1, 'triangle', 0.06, 0, 150); },
};
