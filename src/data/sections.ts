import type { IconName } from '../components/Icon';

export interface Section {
  path: string;
  title: string;
  file: string;
  icon: IconName;
  desc: string;
  badge: [string, string]; // cores do botão 88x31
  tag: string; // texto curto do botão 88x31
}

export const SECTIONS: Section[] = [
  { path: '/', title: 'Início', file: 'index.htm', icon: 'home', desc: 'Página principal do portal', badge: ['#0044ff', '#00e5ff'], tag: 'HOME' },
  { path: '/internet', title: 'Internet Antiga', file: 'internet.htm', icon: 'globe', desc: 'História, navegadores e a Web 1.0', badge: ['#3a00a8', '#b44dff'], tag: 'WEB 1.0' },
  { path: '/jogos', title: 'Jogos', file: 'jogos.htm', icon: 'joystick', desc: 'Fliperama de navegador', badge: ['#007a1f', '#ccff00'], tag: 'JOGUE JÁ!' },
  { path: '/msn', title: 'MSN', file: 'msn.htm', icon: 'buddy', desc: 'Mensageiro instantâneo simulado', badge: ['#0a7d00', '#5ad2ff'], tag: 'ONLINE!' },
  { path: '/windows', title: 'Windows', file: 'windows.htm', icon: 'computer', desc: 'Área de trabalho interativa', badge: ['#003399', '#3a8bff'], tag: 'DESKTOP' },
  { path: '/galeria', title: 'Galeria', file: 'galeria.htm', icon: 'picture', desc: 'Computadores, consoles, celulares e memes', badge: ['#a8006e', '#ff6ec7'], tag: 'FOTOS' },
  { path: '/musica', title: 'Música', file: 'musica.htm', icon: 'music', desc: 'Player estilo anos 2000', badge: ['#a85a00', '#ffcc00'], tag: 'MP3 PLAYER' },
  { path: '/guestbook', title: 'Guestbook', file: 'guestbook.htm', icon: 'book', desc: 'Assine o livro de visitas', badge: ['#555555', '#e0e0e0'], tag: 'ASSINE!' },
];

export const SITE_HOST = 'www.y2karchive.com.br';

export function sectionFor(path: string): Section | undefined {
  return SECTIONS.find((s) => s.path === path);
}

/** Converte o que foi digitado na barra de endereços em uma rota. */
export function addressToPath(input: string): string {
  let v = input.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, '').replace(/^www\./, '');
  v = v.replace(/^y2karchive\.com\.br/, '');
  v = v.replace(/^#/, '').replace(/^\/+/, '').replace(/\.html?$/, '');
  if (v === '' || v === 'index') return '/';
  const byFile = SECTIONS.find((s) => s.file.replace(/\.htm$/, '') === v || s.path === `/${v}`);
  return byFile ? byFile.path : `/${v}`;
}
