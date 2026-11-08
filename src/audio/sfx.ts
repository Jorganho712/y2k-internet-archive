import { getAudioContext, noise, tone } from './engine';

/**
 * Efeitos sonoros sintetizados com Web Audio (nenhum arquivo externo).
 * Todos respeitam a preferência "sons ligados" do visitante.
 */
let enabled = false;
let volume = 0.7;

export function setSfxEnabled(on: boolean): void {
  enabled = on;
}
export function setSfxVolume(v: number): void {
  volume = Math.min(1, Math.max(0, v));
}

function run(fn: (c: AudioContext, v: number) => void): () => void {
  return () => {
    if (!enabled || volume === 0) return;
    const c = getAudioContext();
    if (c) fn(c, volume);
  };
}

export const sfx = {
  click: run((c, v) => tone(c, 1100, 0.035, { gain: 0.04 * v })),
  open: run((c, v) => {
    tone(c, 660, 0.08, { type: 'triangle', gain: 0.12 * v });
    tone(c, 990, 0.1, { type: 'triangle', gain: 0.12 * v, delay: 0.06 });
  }),
  close: run((c, v) => {
    tone(c, 740, 0.06, { type: 'triangle', gain: 0.1 * v });
    tone(c, 440, 0.1, { type: 'triangle', gain: 0.1 * v, delay: 0.05 });
  }),
  minimize: run((c, v) => tone(c, 880, 0.12, { type: 'sine', gain: 0.08 * v, slide: 330 })),
  error: run((c, v) => {
    tone(c, 392, 0.16, { type: 'square', gain: 0.08 * v });
    tone(c, 262, 0.28, { type: 'square', gain: 0.08 * v, delay: 0.12 });
  }),
  ding: run((c, v) => {
    tone(c, 1046, 0.3, { type: 'triangle', gain: 0.16 * v });
    tone(c, 1568, 0.45, { type: 'triangle', gain: 0.13 * v, delay: 0.12 });
  }),
  online: run((c, v) => {
    [784, 988, 1175, 1568].forEach((f, i) =>
      tone(c, f, 0.22, { type: 'sine', gain: 0.12 * v, delay: i * 0.07 }),
    );
  }),
  nudge: run((c, v) => {
    for (let i = 0; i < 6; i++) tone(c, i % 2 ? 90 : 120, 0.08, { type: 'sawtooth', gain: 0.1 * v, delay: i * 0.08 });
    noise(c, 0.5, { gain: 0.05 * v, freq: 300, q: 0.7 });
  }),
  startup: run((c, v) => {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99];
    notes.forEach((f, i) => tone(c, f, 1.1, { type: 'sine', gain: 0.1 * v, delay: i * 0.18 }));
    tone(c, 261.63, 1.6, { type: 'triangle', gain: 0.08 * v, delay: 0.1 });
  }),
  shutdown: run((c, v) => {
    [1046.5, 783.99, 659.25, 523.25].forEach((f, i) =>
      tone(c, f, 0.7, { type: 'sine', gain: 0.1 * v, delay: i * 0.16 }),
    );
  }),
  coin: run((c, v) => {
    tone(c, 988, 0.07, { gain: 0.07 * v });
    tone(c, 1319, 0.2, { gain: 0.07 * v, delay: 0.07 });
  }),
  boom: run((c, v) => {
    noise(c, 0.6, { gain: 0.25 * v, freq: 400, q: 0.5, type: 'lowpass' });
    tone(c, 120, 0.5, { type: 'sine', gain: 0.2 * v, slide: 40 });
  }),
  win: run((c, v) => {
    [523, 659, 784, 1046, 1319].forEach((f, i) => tone(c, f, 0.15, { gain: 0.07 * v, delay: i * 0.09 }));
  }),
  key: run((c, v) => noise(c, 0.03, { gain: 0.05 * v, freq: 3000, q: 2 })),
};

const DTMF: Record<string, [number, number]> = {
  '0': [941, 1336], '1': [697, 1209], '2': [697, 1336], '3': [697, 1477], '4': [770, 1209],
  '5': [770, 1336], '6': [770, 1477], '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
};

/**
 * Som de conexão discada (~7 s). Retorna função para interromper.
 * Só toca se os sons estiverem ativados.
 */
export function playDialup(): () => void {
  if (!enabled) return () => undefined;
  const c = getAudioContext();
  if (!c) return () => undefined;
  const master = c.createGain();
  master.gain.value = 0.55 * volume;
  master.connect(c.destination);
  const dest = master;

  // tom de linha
  tone(c, 350, 0.9, { type: 'sine', gain: 0.12, dest });
  tone(c, 440, 0.9, { type: 'sine', gain: 0.12, dest });
  // discagem
  '08007561998'.split('').forEach((d, i) => {
    const [a, b] = DTMF[d];
    tone(c, a, 0.08, { type: 'sine', gain: 0.12, delay: 1 + i * 0.12, dest });
    tone(c, b, 0.08, { type: 'sine', gain: 0.12, delay: 1 + i * 0.12, dest });
  });
  // atendimento
  tone(c, 2100, 0.9, { type: 'sine', gain: 0.08, delay: 2.6, dest });
  // bipes de negociação
  for (let i = 0; i < 8; i++) {
    tone(c, i % 2 ? 1180 : 980, 0.09, { type: 'square', gain: 0.05, delay: 3.6 + i * 0.1, dest });
  }
  // chiado característico
  for (let i = 0; i < 10; i++) {
    noise(c, 0.25, { gain: 0.12, freq: 1200 + (i % 3) * 900, q: 3, delay: 4.5 + i * 0.2, dest });
    tone(c, 1800 + (i % 4) * 150, 0.2, { type: 'sawtooth', gain: 0.025, delay: 4.5 + i * 0.2, dest });
  }
  noise(c, 1.2, { gain: 0.09, freq: 2400, q: 0.6, delay: 6.4, dest });

  return () => {
    try {
      master.gain.setValueAtTime(0, c.currentTime);
      master.disconnect();
    } catch {
      /* já desconectado */
    }
  };
}
