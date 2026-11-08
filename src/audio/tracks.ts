/**
 * Faixas originais em estilo chiptune, sintetizadas em tempo real.
 * Nenhum áudio protegido por direitos autorais: tudo é gerado por código.
 */
export interface Cover {
  from: string;
  to: string;
  accent: string;
  shape: 'sun' | 'grid' | 'disc' | 'stars' | 'waves' | 'pixel';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  bpm: number;
  lead: OscillatorType;
  /** Acordes, cada um ocupa 16 passos (semicolcheias). */
  prog: string[];
  /** Índices de notas do acorde por passo (-1 = pausa). 16 valores. */
  arp: number[];
  /** Melodia opcional em colcheias: nota, "." pausa, "_" sustenta. */
  melody?: string;
  /** Baixo por passo: x = fundamental, o = oitava, . = pausa. 16 chars. */
  bass: string;
  /** Bateria por passo: k bumbo, s caixa, h chimbal, K/S com chimbal. 16 chars. */
  drums: string;
  repeats: number;
  cover: Cover;
}

const ARP_UP = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];
const ARP_UPDOWN = [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1];
const ARP_PULSE = [0, -1, 2, -1, 1, -1, 2, -1, 0, -1, 2, -1, 3, -1, 2, -1];
const ARP_SPARSE = [0, -1, -1, 2, -1, -1, 1, -1, 3, -1, -1, 2, -1, -1, 4, -1];

export const TRACKS: Track[] = [
  {
    id: 'conectando',
    title: 'Conectando em 56k',
    artist: 'DJ Modem',
    album: 'Handshake',
    year: 1999,
    bpm: 124,
    lead: 'square',
    prog: ['Am', 'F', 'C', 'G'],
    arp: ARP_UP,
    melody:
      'E5 . A5 . G5 E5 . C5 . A4 C5 . F5 E5 C5 . G4 . C5 E5 . G5 _ E5 D5 . B4 . G4 . D5 B4',
    bass: 'x...x.o.x...x.o.',
    drums: 'K.h.S.h.K.hKS.h.',
    repeats: 6,
    cover: { from: '#0033cc', to: '#00e5ff', accent: '#ccff00', shape: 'grid' },
  },
  {
    id: 'fotolog',
    title: 'Pôr do Sol no Fotolog',
    artist: 'Os Pixels',
    album: 'Flogão Mixtape',
    year: 2004,
    bpm: 98,
    lead: 'triangle',
    prog: ['C', 'G', 'Am', 'Em', 'F', 'C', 'F', 'G'],
    arp: ARP_UPDOWN,
    melody:
      'G5 _ E5 . C5 . E5 G5 D5 _ B4 . G4 . B4 D5 E5 _ C5 . A4 . C5 E5 B4 _ G4 . E4 . G4 B4 ' +
      'A4 _ C5 . F5 . E5 C5 G4 _ C5 . E5 . G5 _ A5 _ F5 . C5 . A4 C5 B4 _ D5 . G5 _ _ .',
    bass: 'x.....x.o.....x.',
    drums: 'k...s...k.k.s...',
    repeats: 3,
    cover: { from: '#ff6ec7', to: '#ffb347', accent: '#7b2cff', shape: 'sun' },
  },
  {
    id: 'disquete',
    title: 'Disquete Azul',
    artist: 'MC Disquete',
    album: '1,44 MB de Amor',
    year: 2001,
    bpm: 138,
    lead: 'sawtooth',
    prog: ['Dm', 'Bb', 'F', 'C'],
    arp: ARP_PULSE,
    melody:
      'D5 . F5 . A5 . F5 . D5 _ _ . C5 . D5 . F5 . D5 . C5 . A4 . C5 _ _ . E5 . G5 .',
    bass: 'x.x.o.x.x.x.o.x.',
    drums: 'K.hhS.hhK.hKS.hh',
    repeats: 6,
    cover: { from: '#000080', to: '#1084d0', accent: '#ffffff', shape: 'disc' },
  },
  {
    id: 'madrugada',
    title: 'Madrugada no MSN',
    artist: 'Banda Larga',
    album: 'Status: Ausente',
    year: 2005,
    bpm: 84,
    lead: 'triangle',
    prog: ['Em', 'C', 'G', 'D'],
    arp: ARP_SPARSE,
    melody: 'B4 _ _ . G4 . A4 B4 C5 _ _ . E5 . D5 C5 B4 _ _ . D5 . G5 _ F#5 _ _ . D5 . A4 .',
    bass: 'x.......o.......',
    drums: 'k.....h.s.....h.',
    repeats: 4,
    cover: { from: '#1a0033', to: '#5b2bd8', accent: '#00ffcc', shape: 'stars' },
  },
  {
    id: 'bonus',
    title: 'Fase Bônus 2003',
    artist: 'Lan House Orquestra',
    album: 'Insert Coin',
    year: 2003,
    bpm: 150,
    lead: 'square',
    prog: ['C', 'Am', 'F', 'G'],
    arp: ARP_UP,
    melody: 'C5 E5 G5 C6 _ . G5 . A5 . E5 . C5 _ . . F5 A5 C6 A5 F5 . C5 . D5 . G5 . B5 _ G5 .',
    bass: 'xoxoxoxoxoxoxoxo',
    drums: 'K.hKS.hhK.hKS.Sh',
    repeats: 7,
    cover: { from: '#00a651', to: '#ccff00', accent: '#ff00aa', shape: 'pixel' },
  },
  {
    id: 'protetor',
    title: 'Protetor de Tela',
    artist: 'Turma do Bitmap',
    album: 'Labirinto 3D',
    year: 1998,
    bpm: 72,
    lead: 'sine',
    prog: ['F', 'Am', 'Dm', 'C'],
    arp: ARP_SPARSE,
    bass: 'x...............',
    drums: '................',
    repeats: 5,
    cover: { from: '#003344', to: '#00b3b3', accent: '#e0ffff', shape: 'waves' },
  },
];

export const AMBIENT_TRACK_INDEX = TRACKS.findIndex((t) => t.id === 'protetor');

export function trackDuration(t: Track): number {
  const stepDur = 60 / t.bpm / 4;
  return t.prog.length * 16 * t.repeats * stepDur;
}
