import type { SpriteName } from './sprites';

export type GameCategory = 'Arcade' | 'Quebra-cabeça' | 'Estratégia' | 'Ação' | 'Social' | 'Esporte';

export interface GameEntry {
  id: string;
  title: string;
  year: number;
  category: GameCategory;
  sprite: SpriteName;
  color: string;
  desc: string;
  /** Jogo HTML5 embutido no projeto. */
  builtin?: 'snake' | 'breakout' | 'memory' | 'mines';
  /**
   * URL de um jogo HTML5 externo para abrir num iframe isolado.
   * Para incorporar um jogo seu, adicione-o em public/games/ e aponte para "games/seu-jogo/index.html".
   */
  embedUrl?: string;
}

/** Jogáveis: versões originais feitas para este museu. */
export const PLAYABLE: GameEntry[] = [
  { id: 'snake', title: 'Cobrinha', year: 1998, category: 'Arcade', sprite: 'phoneBar', color: '#9bbc0f', builtin: 'snake', desc: 'O passatempo dos celulares monocromáticos: coma, cresça e não morda o próprio rabo.' },
  { id: 'breakout', title: 'Tijolinhos', year: 2001, category: 'Arcade', sprite: 'controller', color: '#7b2cff', builtin: 'breakout', desc: 'Rebata a bolinha e destrua a parede de blocos neon. Viciante como na lan house.' },
  { id: 'memory', title: 'Memória Pixel', year: 2003, category: 'Quebra-cabeça', sprite: 'cat', color: '#ff6ec7', builtin: 'memory', desc: 'Encontre os pares de objetos clássicos dos anos 2000 com o menor número de jogadas.' },
  { id: 'mines', title: 'Campo Minado', year: 2001, category: 'Estratégia', sprite: 'trophy', color: '#808080', builtin: 'mines', desc: 'Lógica pura: descubra todas as casas sem explodir. Clique direito marca bandeira.' },
];

/** Peças de museu: jogos de navegador marcantes da época (informativo). */
export const MUSEUM: GameEntry[] = [
  { id: 'neopets', title: 'Neopets', year: 1999, category: 'Social', sprite: 'hamster', color: '#ffb000', desc: 'Bichinhos virtuais, lojas e minijogos. Um mundo inteiro para cuidar no navegador.' },
  { id: 'runescape', title: 'RuneScape', year: 2001, category: 'Ação', sprite: 'trophy', color: '#8a5a2b', desc: 'Um RPG online gigante que rodava direto no navegador com Java.' },
  { id: 'bejeweled', title: 'Bejeweled', year: 2001, category: 'Quebra-cabeça', sprite: 'mp3', color: '#00b3c7', desc: 'Troque joias de lugar e forme trios. Ajudou a popularizar os jogos casuais.' },
  { id: 'habbo', title: 'Habbo Hotel', year: 2000, category: 'Social', sprite: 'dancer', color: '#ff6ec7', desc: 'Hotel virtual isométrico para conversar, decorar quartos e fazer amigos.' },
  { id: 'clubpenguin', title: 'Club Penguin', year: 2005, category: 'Social', sprite: 'ufo', color: '#3b8bff', desc: 'Pinguins, iglus e minijogos num mundo seguro para crianças.' },
  { id: 'linerider', title: 'Line Rider', year: 2006, category: 'Esporte', sprite: 'laptop', color: '#555', desc: 'Desenhe uma pista e veja o trenó descer. Simples e genial.' },
  { id: 'dtd', title: 'Desktop Tower Defense', year: 2007, category: 'Estratégia', sprite: 'tower', color: '#2e7d32', desc: 'Monte torres e crie labirintos para impedir as criaturinhas de passar.' },
  { id: 'bloons', title: 'Bloons', year: 2007, category: 'Arcade', sprite: 'banana', color: '#e53935', desc: 'Um macaco, dardos e muitos balões para estourar.' },
];

export const CATEGORIES: ('Todas' | GameCategory)[] = ['Todas', 'Arcade', 'Quebra-cabeça', 'Estratégia', 'Ação', 'Social', 'Esporte'];
