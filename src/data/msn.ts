export type Status = 'online' | 'ocupado' | 'ausente' | 'offline';

export interface Contact {
  id: string;
  nick: string;
  email: string;
  status: Status;
  message: string;
  color: string;
  history: { from: 'them' | 'me'; text: string; time: string }[];
  replies: string[];
}

/** Contatos 100% fictícios para a demonstração. */
export const CONTACTS: Contact[] = [
  {
    id: 'juh',
    nick: '~*~Juh~*~ (L)',
    email: 'juh_fofinha@exemplo.com',
    status: 'online',
    message: '♪ Ouvindo: Madrugada no MSN - Banda Larga',
    color: '#ff6ec7',
    history: [
      { from: 'them', text: 'oieee :D', time: '21:02' },
      { from: 'them', text: 'vc viu o fotolog novo da Camila??', time: '21:02' },
    ],
    replies: ['kkkkkkk sério?', 'nossa, mto bom :P', 'peraí q minha mãe ta me chamando', 'vc vai na festa sábado?', 'me add no orkut!! (L)', 'BRB', 'aiii q fofo :$'],
  },
  {
    id: 'lukinhas',
    nick: 'xXx_LuKiNhAs_xXx',
    email: 'lukinhas.gamer@exemplo.com',
    status: 'ocupado',
    message: 'jogando na lan, n chama',
    color: '#3b8bff',
    history: [{ from: 'them', text: 'vem pra lan hj? 2 hrs por 3 reais', time: '18:40' }],
    replies: ['to no meio da partida', 'q isso mano B)', 'perdi tudo pq caiu a net', 'amanhã eu te passo o save', 'gg', 'vo jogar mais 1 e saio'],
  },
  {
    id: 'mae',
    nick: 'Mãe',
    email: 'mae.da.familia@exemplo.com',
    status: 'online',
    message: 'Desliga esse computador e vem jantar',
    color: '#00a651',
    history: [{ from: 'them', text: 'FILHO(A) SAI DA INTERNET Q EU PRECISO USAR O TELEFONE', time: '20:15' }],
    replies: ['JÁ FALEI PRA SAIR', 'a conta de telefone vai vir altíssima', 'comeu?', 'beijo da mãe', 'Como faz pra mandar foto aqui?', 'desliga e vem jantar'],
  },
  {
    id: 'camila',
    nick: 'Camila ☆ www.fotolog/camilinha',
    email: 'camilinha@exemplo.com',
    status: 'ausente',
    message: 'atualizei o flog!! comenta lá',
    color: '#ff8c00',
    history: [],
    replies: ['comenta no meu flog!', 'brigadaaa', 'tirei a foto com a câmera nova de 2 megapixels', 'vc sabe fazer aqueles nicks coloridos?'],
  },
  {
    id: 'rafa',
    nick: '[Rafa] Pagode 4ever',
    email: 'rafa.pagode@exemplo.com',
    status: 'online',
    message: 'vendo CDs gravados, chama no PVT',
    color: '#7b2cff',
    history: [],
    replies: ['tem esse cd sim, 5 reais', 'gravo na hora', 'vc tem kazaa? tem tudo lá', 'abraço!!', 'tô sem crédito no celular, fala por aqui'],
  },
  {
    id: 'bia',
    nick: 'Prima Bia ♥',
    email: 'bia.prima@exemplo.com',
    status: 'offline',
    message: '',
    color: '#00b3c7',
    history: [],
    replies: [],
  },
  {
    id: 'tio',
    nick: 'Tio do Pavê',
    email: 'tio.piadas@exemplo.com',
    status: 'offline',
    message: 'é pavê ou pacomê?',
    color: '#8a5a2b',
    history: [],
    replies: [],
  },
];

export const STATUS_LABEL: Record<Status, string> = {
  online: 'Online',
  ocupado: 'Ocupado',
  ausente: 'Ausente',
  offline: 'Offline',
};

/** Emoticons em texto que viram desenhos, como no mensageiro original. */
export const EMOTICONS: [string, string][] = [
  [':)', '😊'],
  [':D', '😁'],
  [';)', '😉'],
  [':P', '😛'],
  [':(', '😞'],
  [':O', '😮'],
  [':$', '😳'],
  ['B)', '😎'],
  ['(L)', '❤️'],
  ['(U)', '💔'],
  ['(K)', '💋'],
  ['(F)', '🌹'],
  ['(*)', '⭐'],
  ['(8)', '🎵'],
  ['(Y)', '👍'],
  ['(N)', '👎'],
];

export function emotify(text: string): string {
  let out = text;
  for (const [code, emoji] of EMOTICONS) out = out.split(code).join(emoji);
  return out;
}
