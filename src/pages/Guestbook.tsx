import { useState, type FormEvent } from 'react';
import { usePrefs } from '../lib/prefs';
import { KEYS, loadJSON, saveJSON } from '../lib/storage';
import { emotify, EMOTICONS } from '../data/msn';
import { sfx } from '../audio/sfx';
import { Icon } from '../components/Icon';
import { NewBadge, Panel, RainbowRule } from '../components/Retro';

interface Entry {
  id: string;
  nick: string;
  city: string;
  mood: string;
  message: string;
  date: string;
  mine?: boolean;
}

const MOODS = ['😊 Feliz', '😎 Radical', '😴 Com sono', '🤩 Nostálgico', '😂 Rindo à toa', '💾 Saudades do disquete'];

const SEED: Entry[] = [
  { id: 's1', nick: '~*Paty_Gatinha*~', city: 'Curitiba - PR', mood: '🤩 Nostálgico', message: 'Aiii q site lindoo!! Me lembrou meu fotolog :) Passa no meu flog tbm!!! (L)', date: '2003-11-02T22:14:00' },
  { id: 's2', nick: 'DarkLink2004', city: 'Recife - PE', mood: '😎 Radical', message: 'Muito bom o Campo Minado. Zerei em 47 segundos B)', date: '2004-03-15T19:02:00' },
  { id: 's3', nick: 'Webmaster Carlos', city: 'São Paulo - SP', mood: '😊 Feliz', message: 'Parabéns pelo site! Adicionei vocês no meu webring. Abraços e sucesso!!', date: '2002-08-21T10:40:00' },
  { id: 's4', nick: 'Dona Cida', city: 'Belo Horizonte - MG', mood: '😂 Rindo à toa', message: 'Meu neto me ensinou a usar a internet. Achei muito bonito. COMO FAZ PRA SAIR', date: '2005-01-09T15:33:00' },
  { id: 's5', nick: 'm4theus_hx', city: 'Porto Alegre - RS', mood: '💾 Saudades do disquete', message: 'saudade do tempo em q a gnt baixava 1 musica por noite no kazaa :(', date: '2006-07-30T23:58:00' },
];

const PAGE = 5;

export default function Guestbook() {
  const { prefs } = usePrefs();
  const [entries, setEntries] = useState<Entry[]>(() => loadJSON<Entry[]>(KEYS.guestbook, SEED));
  const [nick, setNick] = useState(prefs.nickname);
  const [city, setCity] = useState('');
  const [mood, setMood] = useState(MOODS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [thanks, setThanks] = useState(false);

  const persist = (list: Entry[]) => {
    setEntries(list);
    saveJSON(KEYS.guestbook, list);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = nick.trim();
    const m = message.trim();
    if (n.length < 2) return fail('Escreva um apelido com pelo menos 2 letras.');
    if (m.length < 3) return fail('A mensagem está muito curtinha!');
    const entry: Entry = { id: `u${Date.now()}`, nick: n.slice(0, 30), city: city.trim().slice(0, 40), mood, message: m.slice(0, 500), date: new Date().toISOString(), mine: true };
    persist([entry, ...entries]);
    setMessage('');
    setError('');
    setPage(0);
    setThanks(true);
    sfx.win();
    window.setTimeout(() => setThanks(false), 4000);
  };

  const fail = (msg: string) => {
    setError(msg);
    sfx.error();
  };

  const remove = (id: string) => {
    persist(entries.filter((x) => x.id !== id));
  };

  const pages = Math.max(1, Math.ceil(entries.length / PAGE));
  const shown = entries.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div className="page guestbook">
      <div className="page-title-row">
        <Icon name="book" size={48} />
        <div>
          <h2 className="page-title">Livro de Visitas</h2>
          <p className="page-sub">Deixe seu recado! As mensagens ficam salvas neste navegador. <NewBadge /></p>
        </div>
      </div>

      <Panel title="✎ Assine o Guestbook" color="#7b2cff">
        <form className="gb-form" onSubmit={submit} noValidate>
          <label htmlFor="gb-nick">Apelido *</label>
          <input id="gb-nick" className="field" value={nick} maxLength={30} onChange={(e) => setNick(e.target.value)} placeholder="ex: xX_Gamer_Xx" required />
          <label htmlFor="gb-city">Cidade</label>
          <input id="gb-city" className="field" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} placeholder="ex: Salvador - BA" />
          <label htmlFor="gb-mood">Humor</label>
          <select id="gb-mood" className="field" value={mood} onChange={(e) => setMood(e.target.value)}>
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <label htmlFor="gb-msg">Mensagem *</label>
          <div>
            <textarea id="gb-msg" className="field" rows={4} value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva algo legal... Emoticons como :) e (L) viram desenhos!" required />
            <div className="gb-emos">
              {EMOTICONS.slice(0, 10).map(([code, em]) => (
                <button key={code} type="button" title={code} onClick={() => setMessage((m) => `${m}${code}`)}>
                  {em}
                </button>
              ))}
              <span className="hint">{500 - message.length} caracteres restantes</span>
            </div>
          </div>
          <span />
          <div className="btn-row">
            <button type="submit" className="retro-btn">
              Assinar!
            </button>
            <button
              type="button"
              className="retro-btn alt"
              onClick={() => {
                setMessage('');
                setCity('');
                setError('');
              }}
            >
              Limpar
            </button>
          </div>
        </form>
        {error && (
          <p className="gb-error" role="alert">
            ⚠ {error}
          </p>
        )}
        {thanks && (
          <p className="gb-thanks" role="status">
            ★ Obrigado por assinar! Volte sempre! ★
          </p>
        )}
      </Panel>

      <RainbowRule />
      <h3 className="h3-retro">{entries.length} mensagens no livro</h3>

      <ol className="gb-list">
        {shown.map((e) => (
          <li key={e.id} className={`gb-entry ${e.mine ? 'is-mine' : ''}`}>
            <div className="gb-entry-head">
              <Icon name="user" size={28} />
              <div>
                <b className="gb-nick">{e.nick}</b>
                {e.city && <span className="gb-city"> de {e.city}</span>}
                <div className="gb-meta">
                  {new Date(e.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Humor: {e.mood}
                </div>
              </div>
              {e.mine && (
                <button type="button" className="btn gb-del" onClick={() => remove(e.id)}>
                  Apagar
                </button>
              )}
            </div>
            <p className="gb-msg">{emotify(e.message)}</p>
          </li>
        ))}
      </ol>
      {entries.length === 0 && <p className="hint">Ninguém assinou ainda. Seja o primeiro!</p>}

      {pages > 1 && (
        <div className="pager">
          <button type="button" className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
            « Mais recentes
          </button>
          <span>
            Página {page + 1} de {pages}
          </span>
          <button type="button" className="btn" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
            Mais antigas »
          </button>
        </div>
      )}
    </div>
  );
}
