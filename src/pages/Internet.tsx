import { useState } from 'react';
import { BROWSERS, SITES, TIMELINE, TRIVIA } from '../data/internet';
import { Panel, RainbowRule, SpinningGlobe } from '../components/Retro';
import { sfx } from '../audio/sfx';

type Tab = 'historia' | 'navegadores' | 'sites' | 'curiosidades';

const TABS: { id: Tab; label: string }[] = [
  { id: 'historia', label: 'História da Internet' },
  { id: 'navegadores', label: 'Navegadores Antigos' },
  { id: 'sites', label: 'Sites Famosos' },
  { id: 'curiosidades', label: 'Curiosidades da Web 1.0' },
];

export default function Internet() {
  const [tab, setTab] = useState<Tab>('historia');
  return (
    <div className="page">
      <div className="page-title-row">
        <SpinningGlobe size={48} />
        <div>
          <h2 className="page-title">Internet Antiga</h2>
          <p className="page-sub">Uma viagem pela Web 1.0, dos modems barulhentos às primeiras redes sociais.</p>
        </div>
      </div>

      <div className="web-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`web-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => {
              sfx.click();
              setTab(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="web-tab-panel" role="tabpanel">
        {tab === 'historia' && <History />}
        {tab === 'navegadores' && <Browsers />}
        {tab === 'sites' && <Sites />}
        {tab === 'curiosidades' && <Trivia />}
      </div>
    </div>
  );
}

function History() {
  const [focus, setFocus] = useState(false);
  const events = focus ? TIMELINE.filter((e) => e.year >= 1998 && e.year <= 2010) : TIMELINE;
  return (
    <>
      <label className="check">
        <input type="checkbox" checked={focus} onChange={(e) => setFocus(e.target.checked)} /> Mostrar só a era de ouro (1998–2010)
      </label>
      <ol className="timeline">
        {events.map((e) => (
          <li key={e.year} className={e.year >= 1998 && e.year <= 2010 ? 'is-golden' : ''}>
            <span className="timeline-year">{e.year}</span>
            <div className="timeline-card">
              <h4>{e.title}</h4>
              <p>{e.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

function Browsers() {
  const [open, setOpen] = useState<string | null>(BROWSERS[0].name);
  return (
    <div className="browser-cards">
      {BROWSERS.map((b) => (
        <article key={b.name} className="browser-card" style={{ ['--bc' as string]: b.color }}>
          <div className="browser-card-head">
            <span className="browser-logo" aria-hidden="true">
              {b.name[0]}
            </span>
            <div>
              <h4>{b.name}</h4>
              <small>{b.years}</small>
            </div>
          </div>
          <p>{b.text}</p>
          <button type="button" className="retro-btn small" aria-expanded={open === b.name} onClick={() => setOpen(open === b.name ? null : b.name)}>
            {open === b.name ? '− Esconder detalhes' : '+ Ver detalhes'}
          </button>
          {open === b.name && (
            <ul className="browser-facts">
              {b.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

function Sites() {
  const cats = ['Todos', ...Array.from(new Set(SITES.map((s) => s.category)))];
  const [cat, setCat] = useState('Todos');
  const list = cat === 'Todos' ? SITES : SITES.filter((s) => s.category === cat);
  return (
    <>
      <div className="filter-row">
        <label htmlFor="site-cat">Filtrar por categoria:</label>
        <select id="site-cat" className="field" value={cat} onChange={(e) => setCat(e.target.value)}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span className="hint">{list.length} sites</span>
      </div>
      <table className="retro-table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Período</th>
            <th>Categoria</th>
            <th>Por que era famoso</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.name}>
              <td>
                <b>{s.name}</b>
              </td>
              <td>{s.years}</td>
              <td>{s.category}</td>
              <td>{s.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function Trivia() {
  const [i, setI] = useState(0);
  return (
    <>
      <Panel title="Você sabia?" color="#7b2cff" className="trivia-box">
        <p className="trivia-text">{TRIVIA[i]}</p>
        <div className="btn-row">
          <button type="button" className="retro-btn" onClick={() => setI((i - 1 + TRIVIA.length) % TRIVIA.length)}>
            « Anterior
          </button>
          <button
            type="button"
            className="retro-btn"
            onClick={() => {
              sfx.coin();
              let n = i;
              while (n === i) n = Math.floor(Math.random() * TRIVIA.length);
              setI(n);
            }}
          >
            Sortear curiosidade
          </button>
          <button type="button" className="retro-btn" onClick={() => setI((i + 1) % TRIVIA.length)}>
            Próxima »
          </button>
        </div>
        <p className="hint">
          Curiosidade {i + 1} de {TRIVIA.length}
        </p>
      </Panel>
      <RainbowRule />
      <h3 className="h3-retro">Anatomia de um site pessoal de 2002</h3>
      <div className="anatomy">
        <div className="anatomy-page" aria-hidden="true">
          <div className="anatomy-banner">~*~ MiNhA PáGiNa ~*~</div>
          <div className="anatomy-marquee">Bem-vindos!!! Assinem meu livro de visitas!!!</div>
          <div className="anatomy-body">
            <div className="anatomy-construction">EM CONSTRUÇÃO</div>
            <div className="anatomy-counter">0001337</div>
          </div>
        </div>
        <ul className="anatomy-list">
          <li>
            <b>Fundo estrelado ou com textura</b> repetida que dificultava a leitura.
          </li>
          <li>
            <b>Texto andando</b> com a tag marquee.
          </li>
          <li>
            <b>GIF "em construção"</b> que nunca saía de lá.
          </li>
          <li>
            <b>Contador de visitas</b> no rodapé.
          </li>
          <li>
            <b>Música MIDI</b> tocando sozinha (aqui nunca toca sozinha!).
          </li>
          <li>
            <b>Livro de visitas</b> e botões 88x31 de amigos.
          </li>
        </ul>
      </div>
    </>
  );
}
