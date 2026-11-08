import { lazy, Suspense, useState, type FormEvent } from 'react';
import { CATEGORIES, MUSEUM, PLAYABLE, type GameEntry } from '../data/games';
import { PixelArt } from '../components/PixelArt';
import { Hourglass, NewBadge, Panel } from '../components/Retro';
import { WindowFrame } from '../components/Window';
import { Icon } from '../components/Icon';
import { sfx } from '../audio/sfx';
import { getHighScore } from '../games/scores';

const BUILTIN = {
  snake: lazy(() => import('../games/Snake')),
  breakout: lazy(() => import('../games/Breakout')),
  memory: lazy(() => import('../games/Memory')),
  mines: lazy(() => import('../games/Minesweeper')),
};

export default function Games() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('Todas');
  const [playing, setPlaying] = useState<GameEntry | null>(null);
  const [info, setInfo] = useState<GameEntry | null>(null);
  const [embed, setEmbed] = useState('');
  const [embedError, setEmbedError] = useState('');

  const filter = (g: GameEntry) => cat === 'Todas' || g.category === cat;
  const play = (g: GameEntry) => {
    sfx.open();
    setPlaying(g);
    setInfo(null);
    window.setTimeout(() => document.getElementById('arcade-cabinet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const loadEmbed = (e: FormEvent) => {
    e.preventDefault();
    try {
      const u = new URL(embed.trim());
      if (u.protocol !== 'https:') throw new Error('protocolo');
      setEmbedError('');
      play({ id: 'custom', title: u.hostname, year: new Date().getFullYear(), category: 'Arcade', sprite: 'controller', color: '#333', desc: 'Jogo HTML5 externo', embedUrl: u.toString() });
    } catch {
      setEmbedError('Digite um endereço completo começando com https://');
      sfx.error();
    }
  };

  const Builtin = playing?.builtin ? BUILTIN[playing.builtin] : null;

  return (
    <div className="page">
      <div className="page-title-row">
        <PixelArt sprite="controller" scale={4} />
        <div>
          <h2 className="page-title">Fliperama de Navegador</h2>
          <p className="page-sub">Os jogos que a gente jogava escondido no computador da escola. <NewBadge>4 JOGÁVEIS!</NewBadge></p>
        </div>
      </div>

      <div className="filter-row">
        <span>Categorias:</span>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={`chip ${cat === c ? 'is-active' : ''}`} onClick={() => setCat(c)} aria-pressed={cat === c}>
            {c}
          </button>
        ))}
      </div>

      {playing && (
        <section id="arcade-cabinet" className="arcade">
          <WindowFrame
            title={`${playing.title} — Fliperama Y2K`}
            icon={<Icon name="joystick" size={16} />}
            onClose={() => setPlaying(null)}
            className="arcade-win"
          >
            <div className="arcade-screen">
              {Builtin ? (
                <Suspense fallback={<div className="page-loading"><Hourglass /> Carregando jogo...</div>}>
                  <Builtin />
                </Suspense>
              ) : playing.embedUrl ? (
                <div className="embed-frame">
                  <iframe
                    src={playing.embedUrl}
                    title={playing.title}
                    sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                    allow="fullscreen; gamepad"
                    loading="lazy"
                  />
                  <p className="hint">Alguns sites não permitem ser exibidos dentro de outras páginas. Se ficar em branco, o site bloqueou a incorporação.</p>
                </div>
              ) : null}
            </div>
          </WindowFrame>
        </section>
      )}

      <h3 className="h3-retro">★ Jogue agora</h3>
      <div className="game-grid">
        {PLAYABLE.filter(filter).map((g) => (
          <GameCard key={g.id} game={g} onPlay={() => play(g)} />
        ))}
        {PLAYABLE.filter(filter).length === 0 && <p className="hint">Nenhum jogo jogável nesta categoria.</p>}
      </div>

      <h3 className="h3-retro">★ Peças de museu</h3>
      <p className="page-sub">Clássicos de navegador que marcaram época. Clique para ler a ficha.</p>
      <div className="game-grid">
        {MUSEUM.filter(filter).map((g) => (
          <GameCard key={g.id} game={g} onInfo={() => setInfo(info?.id === g.id ? null : g)} expanded={info?.id === g.id} />
        ))}
        {MUSEUM.filter(filter).length === 0 && <p className="hint">Nenhuma peça nesta categoria.</p>}
      </div>

      <Panel title="Sala de incorporação HTML5" color="#0044ff">
        <p>
          Esta área está preparada para receber jogos HTML5. Cole o endereço de um jogo que permita incorporação e ele abre no
          fliperama, isolado em um quadro seguro. Para adicionar jogos fixos ao museu, edite <code>src/data/games.ts</code> e preencha{' '}
          <code>embedUrl</code>.
        </p>
        <form className="inline-form" onSubmit={loadEmbed}>
          <input className="field" type="url" placeholder="https://exemplo.com/meu-jogo/" value={embed} onChange={(e) => setEmbed(e.target.value)} aria-label="Endereço do jogo HTML5" />
          <button type="submit" className="btn">
            Carregar
          </button>
        </form>
        {embedError && <p className="hint" style={{ color: '#c00' }}>{embedError}</p>}
      </Panel>
    </div>
  );
}

function GameCard({ game, onPlay, onInfo, expanded }: { game: GameEntry; onPlay?: () => void; onInfo?: () => void; expanded?: boolean }) {
  const best = game.builtin ? getHighScore(game.builtin) : 0;
  return (
    <article className="game-card" style={{ ['--gc' as string]: game.color }}>
      <div className="game-thumb">
        <PixelArt sprite={game.sprite} scale={5} label={game.title} />
        <span className="game-year">{game.year}</span>
      </div>
      <div className="game-info">
        <h4>{game.title}</h4>
        <span className="game-cat">{game.category}</span>
        <p>{game.desc}</p>
        {expanded && (
          <p className="game-museum-note">
            <b>Ficha:</b> lançado em {game.year}, categoria {game.category.toLowerCase()}. Esta é uma peça informativa — o jogo original não está
            hospedado aqui.
          </p>
        )}
        {onPlay && (
          <button type="button" className="retro-btn" onClick={onPlay}>
            ▶ Jogar
          </button>
        )}
        {onInfo && (
          <button type="button" className="retro-btn" onClick={onInfo} aria-expanded={expanded}>
            {expanded ? 'Fechar ficha' : 'Ler ficha'}
          </button>
        )}
        {onPlay && best > 0 && game.builtin === 'snake' && <small className="hint">Seu recorde: {best}</small>}
      </div>
    </article>
  );
}
