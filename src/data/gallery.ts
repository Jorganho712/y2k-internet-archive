import type { SpriteName } from './sprites';

export type GalleryCat = 'Computadores' | 'Consoles' | 'Celulares' | 'Memes' | 'GIFs';

export interface GalleryItem {
  id: string;
  cat: GalleryCat;
  title: string;
  year: string;
  sprite?: SpriteName;
  recolor?: Record<string, string>;
  /** GIFs animados recriados em CSS (renderizados pela página). */
  gif?: 'construction' | 'globe' | 'flames' | 'mail' | 'new' | 'hourglass';
  animated?: boolean;
  desc: string;
}

/** Ilustrações em pixel art originais, inspiradas nos tipos de aparelho da época (não são fotos de produtos). */
export const GALLERY: GalleryItem[] = [
  { id: 'pc-bege', cat: 'Computadores', title: 'PC bege com monitor CRT', year: '1998', sprite: 'crt', desc: 'Gabinete bege, monitor de tubo de 15 polegadas e um ventilador que parecia turbina. A configuração de quase toda casa.' },
  { id: 'torre', cat: 'Computadores', title: 'Gabinete torre', year: '2000', sprite: 'tower', desc: 'Drive de disquete de 3½", leitor de CD-ROM e o botão "turbo" que ninguém sabia para que servia.' },
  { id: 'aio', cat: 'Computadores', title: 'Computador tudo-em-um translúcido', year: '1998', sprite: 'aio', desc: 'Plástico colorido e transparente virou moda: até mouse e teclado ganharam cores de bala.' },
  { id: 'aio-uva', cat: 'Computadores', title: 'Tudo-em-um cor de uva', year: '1999', sprite: 'aio', recolor: { t: '#7b2cff', l: '#d6b8ff' }, desc: 'A mesma ideia, em outra cor. Cada um escolhia o seu sabor.' },
  { id: 'notebook', cat: 'Computadores', title: 'Notebook dos anos 2000', year: '2004', sprite: 'laptop', desc: 'Pesava uns 3 kg, a bateria durava 1 hora e ele esquentava a perna. Mas tinha Wi-Fi!' },
  { id: 'console-preto', cat: 'Consoles', title: 'Console de mesa preto', year: '2000', sprite: 'console', desc: 'Leitor de DVD, cartão de memória de 8 MB e muita disputa pelo segundo controle.' },
  { id: 'console-roxo', cat: 'Consoles', title: 'Console cubo roxo', year: '2001', sprite: 'console', recolor: { g: '#5b2bd8', s: '#3a1a8a', l: '#9b7bff' }, desc: 'Compacto, colorido e com alça para levar para a casa dos amigos.' },
  { id: 'controle', cat: 'Consoles', title: 'Controle com fio', year: '1999', sprite: 'controller', desc: 'O fio nunca era longo o suficiente para alcançar o sofá.' },
  { id: 'portatil', cat: 'Consoles', title: 'Videogame portátil', year: '2001', sprite: 'handheld', desc: 'Tela sem luz própria: jogar no carro à noite exigia uma lanterninha.' },
  { id: 'portatil-verde', cat: 'Consoles', title: 'Portátil edição limão', year: '2003', sprite: 'handheld', recolor: { p: '#3cba3c', l: '#ccff00' }, desc: 'Edições coloridas eram disputadíssimas nas lojas de shopping.' },
  { id: 'tijolao', cat: 'Celulares', title: 'Celular "tijolão"', year: '2000', sprite: 'phoneBar', desc: 'Bateria que durava uma semana, indestrutível e com o jogo da cobrinha. Um clássico.' },
  { id: 'flip', cat: 'Celulares', title: 'Celular de flip', year: '2004', sprite: 'phoneFlip', desc: 'Fechar o flip para desligar uma ligação era a coisa mais dramática do mundo.' },
  { id: 'flip-rosa', cat: 'Celulares', title: 'Flip metálico rosa', year: '2005', sprite: 'phoneFlip', recolor: { m: '#ff6ec7', l: '#ffd1ec' }, desc: 'Fino, brilhante e com toque polifônico personalizado.' },
  { id: 'smart', cat: 'Celulares', title: 'Celular com tela colorida', year: '2007', sprite: 'smartphone', desc: 'Câmera de 1,3 megapixel, Bluetooth e papel de parede animado.' },
  { id: 'mp3', cat: 'Celulares', title: 'Tocador de MP3', year: '2005', sprite: 'mp3', desc: '512 MB = umas 120 músicas. Passadas uma a uma pelo cabo USB.' },
  { id: 'bebe', cat: 'Memes', title: 'O bebê dançante', year: '1996', sprite: 'baby', animated: true, desc: 'Uma das primeiras animações virais, passada adiante por e-mail antes mesmo das redes sociais.' },
  { id: 'hamster', cat: 'Memes', title: 'A dança dos hamsters', year: '1998', sprite: 'hamster', animated: true, desc: 'Uma página cheia de hamsters dançando ao som de uma música acelerada. Simples e inesquecível.' },
  { id: 'banana', cat: 'Memes', title: 'A banana dançarina', year: '2002', sprite: 'banana', animated: true, desc: 'Uma banana pulando sem parar ao ritmo de uma musiquinha grudenta.' },
  { id: 'gato', cat: 'Memes', title: 'Gatinhos com legenda', year: '2007', sprite: 'cat', animated: true, desc: 'Fotos de gatos com frases escritas "errado" de propósito tomaram a internet.' },
  { id: 'ovni', cat: 'Memes', title: '"Todas as suas bases"', year: '2001', sprite: 'ufo', animated: true, desc: 'Uma frase mal traduzida de um jogo antigo virou piada mundial, estampada em montagens e camisetas.' },
  { id: 'dancarino', cat: 'Memes', title: 'Dancinha na webcam', year: '2004', sprite: 'dancer', animated: true, desc: 'Gente comum dublando músicas na frente da webcam: o começo dos vídeos virais.' },
  { id: 'gif-construction', cat: 'GIFs', title: 'Em construção', year: '1997', gif: 'construction', desc: 'Faixas amarelas e pretas avisando que a página nunca ficaria pronta.' },
  { id: 'gif-globe', cat: 'GIFs', title: 'Globo girando', year: '1998', gif: 'globe', desc: 'Todo site sobre "internet" precisava de um planeta girando.' },
  { id: 'gif-flames', cat: 'GIFs', title: 'Barra de fogo', year: '1999', gif: 'flames', desc: 'Usada como divisória em sites "radicais".' },
  { id: 'gif-mail', cat: 'GIFs', title: 'Envelope animado', year: '1998', gif: 'mail', desc: 'O convite clássico para mandar um e-mail ao dono do site.' },
  { id: 'gif-new', cat: 'GIFs', title: 'NOVO!', year: '1997', gif: 'new', desc: 'Piscava ao lado de qualquer coisa minimamente atualizada.' },
  { id: 'gif-hourglass', cat: 'GIFs', title: 'Ampulheta', year: '1995', gif: 'hourglass', desc: 'A espera mais famosa da informática.' },
];

export const GALLERY_CATS: ('Tudo' | GalleryCat)[] = ['Tudo', 'Computadores', 'Consoles', 'Celulares', 'Memes', 'GIFs'];
