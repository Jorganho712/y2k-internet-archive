import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import { usePrefs } from '../lib/prefs';
import { useShell, registerVisit, localVisitCount } from '../lib/shell';
import { formatClock, formatDate, useNow } from '../lib/hooks';
import { KEYS, loadJSON, saveJSON } from '../lib/storage';
import { SECTIONS } from '../data/sections';
import { player, usePlayer } from '../audio/player';
import { AMBIENT_TRACK_INDEX } from '../audio/tracks';
import { sfx } from '../audio/sfx';
import {
  AnimatedLogo, Badge88, Blink, Flames, HitCounter, MailGif, Marquee, NewBadge, Panel, RainbowRule, Sparkles,
  SpinningGlobe, UnderConstruction,
} from '../components/Retro';
import { AnimatedSprite } from '../components/PixelArt';
import { Icon } from '../components/Icon';

const NEWS = [
  { date: '07/11/2003', text: 'Inauguramos o Windows simulado com Paint, Campo Minado e Prompt de Comando!' },
  { date: '28/10/2003', text: 'Novo player na seção Música, com 6 faixas chiptune originais.' },
  { date: '15/10/2003', text: 'MSN de demonstração no ar. Cuidado com os "chamar a atenção"!' },
  { date: '02/10/2003', text: 'Guestbook reformulado: agora com emoticons e humor do dia.' },
  { date: '19/09/2003', text: 'Galeria ganhou celulares de flip e o clássico tijolão.' },
];

const POLL_OPTIONS = ['Internet Explorer 6', 'Netscape', 'Mozilla Firefox', 'Opera', 'Eu usava o da lan house'];

/** Página inicial do portal. */
export default function Home() {
  const now = useNow(1000);
  const { prefs } = usePrefs();
  const shell = useShell();
  const music = usePlayer();
  const visits = useMemo(() => registerVisit(), []);
  const mine = useMemo(() => localVisitCount(), []);
  const ambientOn = music.playing && music.index === AMBIENT_TRACK_INDEX;

  const toggleAmbient = () => {
    sfx.click();
    if (ambientOn) player.pause();
    else if (music.index === AMBIENT_TRACK_INDEX) player.play();
    else {
      player.jump(AMBIENT_TRACK_INDEX);
      player.play();
    }
  };

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-gifs" aria-hidden="true">
          <SpinningGlobe />
          <AnimatedSprite sprite="ufo" scale={4} speed={0.4} />
        </div>
        <AnimatedLogo />
        <p className="home-tagline">
          <Sparkles>O museu interativo da internet de 1998 a 2010</Sparkles>
        </p>
        <Flames count={24} />
      </section>

      <Marquee>
        <b>ÚLTIMAS:</b> MSN simulado no ar! ★ Novo jogo: Campo Minado ★ Toque a trilha do Winamp ★ {NEWS[0].text} ★ Você já assinou o Guestbook hoje? ★
      </Marquee>

      <div className="home-grid">
        <aside className="home-side">
          <Panel title="Status da conexão" color="#0044ff">
            <div className="home-clock">
              <span className="home-clock-time">{formatClock(now, true)}</span>
              <span className="home-clock-date">{now.toLocaleDateString('pt-BR', { weekday: 'long' })}, {formatDate(now)}</span>
            </div>
            <p className="home-conn">
              <span className="led" /> Conectado a 53,3 kbps
            </p>
          </Panel>

          <Panel title="Contador de visitas" color="#7b2cff">
            <HitCounter value={visits} />
            <p className="hint">Você já esteve aqui {mine} {mine === 1 ? 'vez' : 'vezes'} neste computador.</p>
          </Panel>

          <Panel title="Música ambiente" color="#00a651">
            <p>Uma trilha calminha de protetor de tela. Só toca se você mandar!</p>
            <button type="button" className={`retro-btn ${ambientOn ? 'is-on' : ''}`} onClick={toggleAmbient} aria-pressed={ambientOn}>
              {ambientOn ? '❚❚ Pausar música' : '♪ Tocar música ambiente'}
            </button>
            <Link to="/musica" className="small-link">
              Abrir o player completo »
            </Link>
          </Panel>

          <Panel title="Enquete" color="#ff6ec7">
            <Poll />
          </Panel>
        </aside>

        <div className="home-main">
          <Panel title={<>Bem-vindo(a){prefs.nickname ? `, ${prefs.nickname}` : ''}! <NewBadge /></>} color="#0044ff">
            <div className="welcome">
              <AnimatedSprite sprite="cat" scale={4} speed={0.5} label="Gatinho em pixel" />
              <div>
                <p>
                  Ligue o modem, desligue o telefone da linha e prepare-se: você acaba de entrar no <b>Y2K Internet Archive</b>, um museu
                  dedicado à época em que a internet era feita de GIFs piscando, contadores de visita, pop-ups e muita criatividade.
                </p>
                <p>
                  Explore a história da Web 1.0, jogue no fliperama, converse no MSN de mentirinha, mexa no Windows simulado e deixe seu
                  recado no livro de visitas. <Blink>Divirta-se!</Blink>
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Navegue pelo museu" color="#00b3c7">
            <div className="badge-grid">
              {SECTIONS.filter((s) => s.path !== '/').map((s) => (
                <Badge88 key={s.path} to={s.path} top={s.title.toUpperCase()} bottom={s.tag} colors={s.badge} />
              ))}
            </div>
            <ul className="section-list">
              {SECTIONS.filter((s) => s.path !== '/').map((s) => (
                <li key={s.path}>
                  <Icon name={s.icon} size={24} />
                  <Link to={s.path}>{s.title}</Link> — {s.desc}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Novidades do site" color="#7b2cff">
            <ul className="news">
              {NEWS.map((n, i) => (
                <li key={n.date}>
                  <b>{n.date}</b> {n.text} {i === 0 && <NewBadge />}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Cantinho interativo" color="#ff8c00">
            <div className="btn-row">
              <button type="button" className="retro-btn" onClick={shell.showPopup}>
                Abrir pop-up clássico
              </button>
              <button type="button" className="retro-btn" onClick={() => shell.openSettings('aparencia')}>
                Mudar tema 98 / XP
              </button>
              <button type="button" className="retro-btn" onClick={shell.reconnect}>
                Ver a discada de novo
              </button>
              <Link to="/essa-pagina-sumiu" className="retro-btn">
                Clicar num link quebrado
              </Link>
            </div>
          </Panel>
        </div>

        <aside className="home-side">
          <Panel title="Recados" color="#ccff00">
            <MailGif />
          </Panel>
          <Panel title="Em construção" color="#ffd400">
            <UnderConstruction small />
            <p className="hint">Este site está sempre em construção. Como todo site que se preze em 2003.</p>
          </Panel>
          <Panel title="Selos" color="#555">
            <div className="stamp-list">
              <span className="stamp stamp-best">
                Best viewed at
                <br />
                <b>1024x768</b>
              </span>
              <span className="stamp stamp-notepad">
                Feito no
                <br />
                <b>Bloco de Notas</b>
              </span>
              <span className="stamp stamp-56k">
                Otimizado para
                <br />
                <b>56k</b>
              </span>
              <span className="stamp stamp-y2k">
                <b>Y2K</b>
                <br />
                Compliant!
              </span>
            </div>
          </Panel>
          <Panel title="Dança do bebê" color="#b44dff">
            <div className="dance-row" aria-hidden="true">
              <AnimatedSprite sprite="baby" scale={3} speed={0.45} />
              <AnimatedSprite sprite="hamster" scale={3} speed={0.3} />
              <AnimatedSprite sprite="banana" scale={3} speed={0.35} />
            </div>
          </Panel>
        </aside>
      </div>

      <RainbowRule />
      <p className="best-viewed-big">
        ⚠ Este site é melhor visualizado em <b>1024x768</b> com <b>Internet Explorer 6</b> ou superior ⚠
      </p>
    </div>
  );
}

function Poll() {
  const [state, setState] = useState(() => loadJSON<{ votes: number[]; voted: number | null }>(KEYS.poll, { votes: [41, 12, 18, 6, 23], voted: null }));
  const total = state.votes.reduce((a, b) => a + b, 0);
  const vote = (i: number) => {
    const votes = state.votes.map((v, j) => (j === i ? v + 1 : v));
    const next = { votes, voted: i };
    setState(next);
    saveJSON(KEYS.poll, next);
    sfx.coin();
  };
  return (
    <div className="poll">
      <p>
        <b>Qual era o seu navegador em 2004?</b>
      </p>
      {state.voted === null ? (
        <ul>
          {POLL_OPTIONS.map((o, i) => (
            <li key={o}>
              <button type="button" className="poll-opt" onClick={() => vote(i)}>
                ○ {o}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul>
            {POLL_OPTIONS.map((o, i) => (
              <li key={o} className={state.voted === i ? 'is-mine' : ''}>
                <span>{o}</span>
                <span className="poll-bar">
                  <span style={{ width: `${(state.votes[i] / total) * 100}%` }} />
                </span>
                <span className="poll-pct">{Math.round((state.votes[i] / total) * 100)}%</span>
              </li>
            ))}
          </ul>
          <button type="button" className="small-link as-button" onClick={() => setState({ ...state, voted: null })}>
            Votar de novo
          </button>
        </>
      )}
    </div>
  );
}
