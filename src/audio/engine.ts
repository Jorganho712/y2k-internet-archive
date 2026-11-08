/** AudioContext compartilhado. Só é criado após um gesto do usuário. */
let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    const len = c.sampleRate;
    noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

export interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slide?: number;
  dest?: AudioNode;
}

/** Toca um tom simples com envelope curto. */
export function tone(c: AudioContext, freq: number, dur: number, o: ToneOptions = {}): void {
  const t = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'square';
  osc.frequency.setValueAtTime(freq, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
  const peak = Math.max(o.gain ?? 0.1, 0.0002);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(o.dest ?? c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

/** Rajada de ruído filtrado (chiado, caixa, chimbal). */
export function noise(
  c: AudioContext,
  dur: number,
  o: { gain?: number; delay?: number; freq?: number; q?: number; type?: BiquadFilterType; dest?: AudioNode } = {},
): void {
  const t = c.currentTime + (o.delay ?? 0);
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.value = o.freq ?? 2000;
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(Math.max(o.gain ?? 0.1, 0.0002), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(o.dest ?? c.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

const NOTE_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A4" -> número MIDI 69 */
export function noteToMidi(note: string): number {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(note);
  if (!m) return 60;
  let n = NOTE_INDEX[m[1]];
  if (m[2] === '#') n += 1;
  if (m[2] === 'b') n -= 1;
  return (Number(m[3]) + 1) * 12 + n;
}

export const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
