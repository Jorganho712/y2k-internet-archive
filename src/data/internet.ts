export interface TimelineEvent {
  year: number;
  title: string;
  text: string;
}

export const TIMELINE: TimelineEvent[] = [
  { year: 1969, title: 'Nasce a ARPANET', text: 'A rede militar e acadêmica americana conecta seus primeiros computadores. É a avó da internet.' },
  { year: 1991, title: 'A World Wide Web', text: 'Tim Berners-Lee publica a primeira página da Web no CERN, com hipertexto e links.' },
  { year: 1994, title: 'Netscape e GeoCities', text: 'O Netscape Navigator populariza a navegação. No mesmo ano surge o serviço que daria origem ao GeoCities.' },
  { year: 1995, title: 'Internet comercial no Brasil', text: 'O acesso comercial à internet começa no país. Navegar era caro e lento, mas mágico.' },
  { year: 1998, title: 'Google e o Windows 98', text: 'O Google é fundado em setembro, e o Windows 98 chega aos PCs com o Internet Explorer integrado.' },
  { year: 1999, title: 'Napster e MSN Messenger', text: 'O Napster revoluciona (e assusta) a música. O MSN Messenger é lançado e vira febre no Brasil.' },
  { year: 2000, title: 'Bug do Milênio e bolha', text: 'O temido Bug do Milênio passa quase sem estragos. Em março, a bolha das empresas ponto-com estoura.' },
  { year: 2001, title: 'Windows XP e Wikipédia', text: 'A Wikipédia nasce em janeiro. Em outubro, o Windows XP aparece com seu visual azul e verde.' },
  { year: 2003, title: 'Era dos blogs e fotologs', text: 'Fotologs, blogs e perfis personalizados explodem. Todo mundo tinha uma página com música de fundo.' },
  { year: 2004, title: 'Orkut e Firefox 1.0', text: 'O Orkut chega e o Brasil adota a rede em peso. Em novembro, sai o Firefox 1.0.' },
  { year: 2005, title: 'YouTube', text: 'O primeiro vídeo do YouTube vai ao ar em abril. Vídeos virais começam a mudar a cultura da internet.' },
  { year: 2007, title: 'Internet no bolso', text: 'Smartphones com tela sensível ao toque começam a levar a web para o bolso das pessoas.' },
  { year: 2008, title: 'Google Chrome', text: 'O Chrome é lançado em setembro e inicia uma nova guerra dos navegadores.' },
  { year: 2009, title: 'Adeus, GeoCities', text: 'O GeoCities é fechado nos EUA em outubro. Voluntários correm para arquivar milhões de páginas.' },
  { year: 2010, title: 'Fim de uma era', text: 'Banda larga, redes sociais e celulares tomam conta. A Web 1.0 vira lembrança — e peça de museu.' },
];

export interface BrowserInfo {
  name: string;
  years: string;
  color: string;
  text: string;
  facts: string[];
}

export const BROWSERS: BrowserInfo[] = [
  {
    name: 'Netscape Navigator',
    years: '1994–2008',
    color: '#00897b',
    text: 'O navegador que apresentou a Web para milhões de pessoas. Dominou os anos 90 até perder a guerra dos navegadores.',
    facts: ['Criou o JavaScript (1995)', 'Seu código deu origem ao projeto Mozilla', 'Suporte encerrado em 2008'],
  },
  {
    name: 'Internet Explorer 6',
    years: '2001–2014',
    color: '#1565c0',
    text: 'Vinha junto com o Windows XP e chegou a ter a esmagadora maioria dos usuários no começo dos anos 2000.',
    facts: ['Lançado em agosto de 2001', 'Famoso pelas barras de ferramentas instaladas sem querer', 'Pesadelo dos web designers'],
  },
  {
    name: 'Mozilla Firefox',
    years: '2004–hoje',
    color: '#e65100',
    text: 'Leve, com abas e bloqueador de pop-ups. Virou o queridinho de quem queria fugir do IE.',
    facts: ['Versão 1.0 em novembro de 2004', 'Popularizou as extensões', 'Projeto de código aberto'],
  },
  {
    name: 'Opera',
    years: '1995–hoje',
    color: '#c62828',
    text: 'Pioneiro em recursos como abas e discagem rápida. Muito usado em celulares antigos com o Opera Mini.',
    facts: ['Criado na Noruega', 'Opera Mini rodava em celulares simples', 'Já foi pago, depois virou gratuito'],
  },
  {
    name: 'Safari',
    years: '2003–hoje',
    color: '#5e35b1',
    text: 'O navegador dos computadores da Apple, lançado em 2003. Anos depois chegaria aos celulares.',
    facts: ['Usa o motor WebKit', 'Lançado em janeiro de 2003', 'Base para muitos outros navegadores'],
  },
  {
    name: 'Google Chrome',
    years: '2008–hoje',
    color: '#2e7d32',
    text: 'Chegou em 2008 com foco em velocidade, cada aba em seu próprio processo, e mudou tudo de novo.',
    facts: ['Lançado em setembro de 2008', 'Apresentado com uma história em quadrinhos', 'Barra de endereço que também pesquisava'],
  },
];

export interface FamousSite {
  name: string;
  years: string;
  category: string;
  text: string;
}

export const SITES: FamousSite[] = [
  { name: 'GeoCities', years: '1994–2009', category: 'Hospedagem', text: 'Páginas pessoais organizadas em "bairros" temáticos. Comprado pelo Yahoo! em 1999.' },
  { name: 'Orkut', years: '2004–2014', category: 'Rede social', text: 'Comunidades, depoimentos, scraps e "fãs". O Brasil foi o país que mais usou.' },
  { name: 'MSN / Hotmail', years: '1996–2013', category: 'Comunicação', text: 'O e-mail que todo mundo tinha e o mensageiro que dominou as tardes depois da escola.' },
  { name: 'Fotolog', years: '2002–2016', category: 'Fotos', text: 'Uma foto por dia, muitos comentários e o famoso "flogão". Febre entre adolescentes.' },
  { name: 'Napster', years: '1999–2001', category: 'Música', text: 'Compartilhamento de MP3 entre usuários. Fechou após batalhas judiciais.' },
  { name: 'YouTube', years: '2005–hoje', category: 'Vídeo', text: 'Transformou qualquer pessoa com uma webcam em potencial estrela viral.' },
  { name: 'Wikipédia', years: '2001–hoje', category: 'Enciclopédia', text: 'A enciclopédia livre que qualquer um pode editar. A versão em português surgiu em 2001.' },
  { name: 'MySpace', years: '2003–hoje', category: 'Rede social', text: 'Perfis com HTML personalizado, música tocando sozinha e o "Top 8" de amigos.' },
  { name: 'Habbo', years: '2000–hoje', category: 'Jogo social', text: 'Um hotel em pixel art isométrico onde se conversava e decorava quartos.' },
  { name: 'Newgrounds', years: '1995–hoje', category: 'Animações', text: 'Portal lendário de animações e jogos em Flash feitos por fãs.' },
  { name: 'Blogger', years: '1999–hoje', category: 'Blogs', text: 'Criar um blog virou coisa de minutos. Todo mundo tinha um diário online.' },
  { name: 'Second Life', years: '2003–hoje', category: 'Mundo virtual', text: 'Um mundo 3D onde as pessoas criavam avatares, casas e até negócios.' },
];

export const TRIVIA: string[] = [
  'No Brasil, muita gente só navegava depois da meia-noite ou aos fins de semana, quando a ligação discada era cobrada por um único pulso.',
  'Enquanto você estava na internet discada, ninguém conseguia usar o telefone de casa. E alguém sempre tirava do gancho no meio do download.',
  'Um modem de 56k baixava, no melhor dos casos, cerca de 7 KB por segundo. Uma música em MP3 podia levar mais de 10 minutos.',
  'Contadores de visitas eram motivo de orgulho. Alguns donos de site recarregavam a própria página para aumentar o número.',
  'O GIF "em construção", com um operário e faixas amarelas e pretas, estava em praticamente todo site pessoal.',
  'Webrings eram correntes de sites sobre o mesmo tema, ligados por botões "anterior" e "próximo".',
  'Botões de 88x31 pixels eram a forma de divulgar sites amigos: uma espécie de "segue de volta" da época.',
  'Muitos sites avisavam: "melhor visualizado em 1024x768" ou "otimizado para Internet Explorer".',
  'A tag <marquee> fazia texto andar pela tela, e <blink> fazia piscar. Os designers de hoje tremem só de lembrar.',
  'Os emoticons do MSN viravam desenhos automaticamente. Digitar (L) mostrava um coração e (H), um rostinho de óculos escuros.',
  'Lan houses eram o ponto de encontro de quem não tinha internet em casa, e o lugar das partidas de jogos em rede.',
  'O "chamar a atenção" do MSN fazia a janela tremer na tela de quem recebia — e era usado sem moderação.',
];
