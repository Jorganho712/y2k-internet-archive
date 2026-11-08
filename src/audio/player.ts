import { useSyncExternalStore } from 'react';
import { getAudioContext, midiToFreq, noise, noteToMidi, tone } from './engine';
import { TRACKS, type Track, trackDuration } from './tracks';

export interface PlayerState {
  index: number;
  playing: boolean;
  elapsed: number;
  duration: number;
  volume: number; // 0..100
  shuffle: boolean;
  repeat: boolean;
}

type Listener = () => void;

/** Sequenciador chiptune com agendamento antecipado (lookahead). */
class ChipPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private listeners = new Set<Listener>();
  state: PlayerState = {
    index: 0,
    playing: false,
    elapsed: 0,
    duration: trackDuration(TRACKS[0]),
    volume: 70,
    shuffle: false,
    repeat: false,
  };

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };
  getSnapshot = (): PlayerState => this.state;

  private set(patch: Partial<PlayerState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  private get track(): Track {
    return TRACKS[this.state.index];
  }
  private get stepDur(): number {
    return 60 / this.track.bpm / 4;
  }
  private get totalSteps(): number {
    return this.track.prog.length * 16 * this.track.repeats;
  }

  private ensure(): boolean {
    const c = getAudioContext();
    if (!c) return false;
    if (!this.ctx) {
      this.ctx = c;
      this.analyser = c.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.connect(c.destination);
    }
    if (!this.master && this.analyser) {
      this.master = c.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.analyser);
    }
    this.applyVolume();
    return true;
  }

  private applyVolume(): void {
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime((this.state.volume / 100) * 0.9, this.ctx.currentTime, 0.02);
    }
  }

  play(index?: number): void {
    if (!this.ensure() || !this.ctx) return;
    if (index !== undefined && index !== this.state.index) {
      this.step = 0;
      this.set({ index, elapsed: 0, duration: trackDuration(TRACKS[index]) });
    }
    if (this.state.playing) return;
    this.nextTime = this.ctx.currentTime + 0.06;
    this.timer = window.setInterval(this.schedule, 25);
    this.set({ playing: true });
  }

  pause(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    // descarta as notas já agendadas: o próximo play cria um novo nó de saída
    if (this.master) {
      this.master.disconnect();
      this.master = null;
    }
    this.set({ playing: false });
  }

  toggle(): void {
    if (this.state.playing) this.pause();
    else this.play();
  }

  stop(): void {
    this.pause();
    this.step = 0;
    this.set({ elapsed: 0 });
  }

  next(): void {
    const n = this.state.shuffle
      ? (this.state.index + 1 + Math.floor(Math.random() * (TRACKS.length - 1))) % TRACKS.length
      : (this.state.index + 1) % TRACKS.length;
    this.jump(n);
  }

  prev(): void {
    if (this.state.elapsed > 3) {
      this.step = 0;
      this.set({ elapsed: 0 });
      return;
    }
    this.jump((this.state.index - 1 + TRACKS.length) % TRACKS.length);
  }

  jump(index: number): void {
    const wasPlaying = this.state.playing;
    this.pause();
    this.step = 0;
    this.set({ index, elapsed: 0, duration: trackDuration(TRACKS[index]) });
    if (wasPlaying) this.play();
  }

  seek(fraction: number): void {
    this.step = Math.floor(Math.min(0.999, Math.max(0, fraction)) * this.totalSteps);
    this.set({ elapsed: this.step * this.stepDur });
  }

  setVolume(v: number): void {
    this.set({ volume: Math.round(Math.min(100, Math.max(0, v))) });
    this.applyVolume();
  }

  setShuffle(on: boolean): void {
    this.set({ shuffle: on });
  }
  setRepeat(on: boolean): void {
    this.set({ repeat: on });
  }

  private schedule = (): void => {
    const c = this.ctx;
    if (!c) return;
    // Com a aba oculta o navegador roda timers ~1x/s: agenda mais à frente para não picotar.
    const lookahead = document.hidden ? 1.5 : 0.12;
    while (this.nextTime < c.currentTime + lookahead) {
      if (this.step >= this.totalSteps) {
        this.onEnded();
        return;
      }
      this.playStep(this.step, this.nextTime - c.currentTime);
      this.nextTime += this.stepDur;
      this.step++;
      const elapsed = this.step * this.stepDur;
      if (Math.floor(elapsed) !== Math.floor(this.state.elapsed)) this.set({ elapsed });
      else this.state.elapsed = elapsed;
    }
  };

  private onEnded(): void {
    if (this.state.repeat) {
      this.step = 0;
      this.set({ elapsed: 0 });
      return;
    }
    this.pause();
    this.step = 0;
    this.next();
    this.play();
  }

  private chordTones(name: string): number[] {
    const m = /^([A-G](?:#|b)?)(m?)/.exec(name);
    const rootName = m ? m[1] : 'C';
    let root = noteToMidi(`${rootName}4`);
    if (root > 67) root -= 12; // mantém na região média
    const third = m && m[2] === 'm' ? 3 : 4;
    return [root, root + third, root + 7, root + 12, root + 12 + third, root + 19];
  }

  private playStep(step: number, delay: number): void {
    const c = this.ctx;
    const dest = this.master;
    if (!c || !dest) return;
    const t = this.track;
    const sd = this.stepDur;
    const local = step % 16;
    const chord = t.prog[Math.floor(step / 16) % t.prog.length];
    const tones = this.chordTones(chord);

    const ai = t.arp[local];
    if (ai >= 0) {
      tone(c, midiToFreq(tones[ai % tones.length]), sd * 0.9, {
        type: t.lead,
        gain: t.lead === 'sawtooth' ? 0.025 : 0.045,
        delay,
        dest,
      });
    }

    const b = t.bass[local];
    if (b === 'x' || b === 'o') {
      const midi = tones[0] - 24 + (b === 'o' ? 12 : 0);
      tone(c, midiToFreq(midi), sd * 1.8, { type: 'triangle', gain: 0.16, delay, dest });
    }

    if (t.melody && step % 2 === 0) {
      const tokens = t.melody.split(' ');
      const i = (step / 2) % tokens.length;
      const tok = tokens[i];
      if (tok !== '.' && tok !== '_') {
        let len = 1;
        while (tokens[(i + len) % tokens.length] === '_' && len < 8) len++;
        tone(c, midiToFreq(noteToMidi(tok)), sd * 2 * len * 0.92, {
          type: t.lead === 'sine' ? 'triangle' : 'square',
          gain: 0.05,
          delay,
          dest,
        });
      }
    }

    const d = t.drums[local];
    if (d === 'k' || d === 'K') tone(c, 150, 0.16, { type: 'sine', gain: 0.35, delay, slide: 45, dest });
    if (d === 's' || d === 'S') {
      noise(c, 0.12, { gain: 0.14, freq: 1800, q: 0.8, delay, dest });
      tone(c, 190, 0.07, { type: 'triangle', gain: 0.08, delay, dest });
    }
    if (d === 'h' || d === 'K' || d === 'S') noise(c, 0.035, { gain: 0.05, freq: 8000, type: 'highpass', delay, dest });
  }
}

export const player = new ChipPlayer();

export function usePlayer(): PlayerState {
  return useSyncExternalStore(player.subscribe, player.getSnapshot);
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
