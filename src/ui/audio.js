// Every sound is synthesised with WebAudio. No audio files.

let ctx = null;
let muted = false;

function audio() {
  if (muted) return null;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}

function tone(freq, { at = 0, dur = 0.12, type = "square", gain = 0.06, slide = 0 } = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  coin: () => { tone(988, { dur: 0.08 }); tone(1319, { at: 0.07, dur: 0.18 }); },
  move: () => tone(220, { dur: 0.03, type: "triangle", gain: 0.025 }),
  drop: () => tone(520, { dur: 0.5, type: "sawtooth", gain: 0.025, slide: -300 }),
  land: () => tone(140, { dur: 0.1, type: "triangle", gain: 0.08 }),
  grab: () => { tone(330, { dur: 0.06 }); tone(262, { at: 0.06, dur: 0.08 }); },
  miss: () => tone(196, { dur: 0.3, type: "triangle", gain: 0.06, slide: -80 }),
  slip: () => { tone(440, { dur: 0.12, type: "triangle", slide: -200 }); tone(220, { at: 0.12, dur: 0.25, type: "triangle", slide: -100 }); },
  win: () => [523, 659, 784, 1047].forEach((n, i) => tone(n, { at: i * 0.08, dur: 0.16, gain: 0.05 })),
  combo: () => [784, 988, 1175, 1568].forEach((n, i) => tone(n, { at: i * 0.06, dur: 0.12, type: "triangle", gain: 0.06 })),
  over: () => [392, 330, 262].forEach((n, i) => tone(n, { at: i * 0.16, dur: 0.24, type: "triangle", gain: 0.06 })),
  fanfare: () => [523, 659, 784, 659, 784, 1047].forEach((n, i) => tone(n, { at: i * 0.11, dur: 0.2, gain: 0.05 })),
  tick: () => tone(880, { dur: 0.04, type: "sine", gain: 0.04 }),
};
