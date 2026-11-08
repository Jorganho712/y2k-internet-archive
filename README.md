# Y2K Internet Archive

Museu interativo da internet de 1998 a 2010: um "computador Windows XP" com um portal de 2003 aberto no Internet Explorer.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (site estático, funciona em qualquer hospedagem gratuita)
```

## O que tem

- **Boot + conexão discada** (BIOS, discador, som de modem opcional), "Desligar" e "Reconectar".
- **Shell global**: área de trabalho, barra de tarefas com menu Iniciar, bandeja (som, tema 98/XP, relógio/calendário), janela do IE com menus, Voltar/Avançar/Atualizar, barra de endereços que navega de verdade, pop-ups simulados e Painel de Controle.
- **Páginas**: Início, Internet Antiga, Jogos (Cobrinha, Tijolinhos, Memória, Campo Minado + área de embed HTML5), MSN simulado, Windows XP simulado (Bloco de Notas, Paint, Calculadora, Prompt, Meu Computador, Lixeira…), Galeria, Música (player chiptune), Guestbook e erro 404.

## Decisões técnicas

- React + TypeScript + Vite, sem backend nem serviços pagos. Roteamento por hash (`#/musica`).
- **Ícones do sistema** em `public/icons/` (estilo Windows XP, © Microsoft — homenagem sem fins lucrativos); se um arquivo faltar, o site usa o desenho SVG de reserva em `src/components/Icon.tsx`.
- **Pixel art** em grades de texto (`src/data/sprites.ts`), GIFs em CSS, sons e músicas sintetizados com Web Audio (`src/audio/`). Nada toca sem clique.
- **Persistência** em `localStorage` (por navegador): preferências, guestbook, notas, recordes, enquete, MSN e lixeira (`src/lib/storage.ts`).
- Páginas e jogos carregados sob demanda (`React.lazy`); animações em CSS; loops de canvas pausam com a aba oculta.

## Adicionar um jogo HTML5

Coloque o jogo em `public/games/meu-jogo/` e adicione à lista `PLAYABLE` em `src/data/games.ts`:

```ts
{ id: 'meu-jogo', title: 'Meu Jogo', year: 2004, category: 'Arcade', sprite: 'controller', color: '#333', desc: '...', embedUrl: 'games/meu-jogo/index.html' }
```
