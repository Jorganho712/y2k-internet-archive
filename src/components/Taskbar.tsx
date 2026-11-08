import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { usePrefs } from '../lib/prefs';
import { useShell } from '../lib/shell';
import { formatClock, useNow } from '../lib/hooks';
import { SECTIONS } from '../data/sections';
import { player, usePlayer } from '../audio/player';
import { TRACKS } from '../audio/tracks';
import { sfx } from '../audio/sfx';
import { Icon } from './Icon';

export interface TaskItem {
  id: string;
  title: string;
  icon: Parameters<typeof Icon>[0]['name'];
  active: boolean;
  onClick: () => void;
}

/** Barra de tarefas global estilo Windows XP / 98. */
export function Taskbar({ tasks }: { tasks: TaskItem[] }) {
  const { prefs, setPref, togglePref } = usePrefs();
  const shell = useShell();
  const now = useNow(1000);
  const music = usePlayer();
  const [startOpen, setStartOpen] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOpen && !calendar) return;
    const close = (e: Event) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setStartOpen(false);
        setCalendar(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStartOpen(false);
        setCalendar(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', esc);
    };
  }, [startOpen, calendar]);

  const go = (fn: () => void) => () => {
    setStartOpen(false);
    sfx.click();
    fn();
  };

  return (
    <div className="taskbar" ref={barRef}>
      <button
        type="button"
        className={`start-btn ${startOpen ? 'is-pressed' : ''}`}
        aria-expanded={startOpen}
        aria-haspopup="menu"
        onClick={() => {
          sfx.click();
          setStartOpen((o) => !o);
          setCalendar(false);
        }}
      >
        <span className="start-logo" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>Iniciar</span>
      </button>

      <div className="quick-launch">
        <button type="button" title="Página inicial" aria-label="Página inicial" onClick={() => shell.openBrowser('/')}>
          <Icon name="home" size={18} />
        </button>
        <button type="button" title="Abrir player de música" aria-label="Abrir player de música" onClick={() => shell.openBrowser('/musica')}>
          <Icon name="music" size={18} />
        </button>
        <button type="button" title="Abrir MSN" aria-label="Abrir MSN" onClick={() => shell.openBrowser('/msn')}>
          <Icon name="buddy" size={18} />
        </button>
      </div>

      <div className="task-buttons">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`task-btn ${t.active ? 'is-active' : ''}`}
            onClick={t.onClick}
            title={t.title}
          >
            <Icon name={t.icon} size={16} />
            <span>{t.title}</span>
          </button>
        ))}
      </div>

      <div className="tray">
        {music.playing || music.elapsed > 0 ? (
          <button
            type="button"
            className="tray-btn tray-music"
            title={`${music.playing ? 'Pausar' : 'Tocar'}: ${TRACKS[music.index].title}`}
            aria-label={music.playing ? 'Pausar música' : 'Tocar música'}
            onClick={() => player.toggle()}
          >
            {music.playing ? <Pause size={13} /> : <Play size={13} />}
            <span className="tray-music-title">{TRACKS[music.index].title}</span>
          </button>
        ) : null}
        <button
          type="button"
          className="tray-btn"
          title={prefs.sound ? 'Desativar sons' : 'Ativar sons'}
          aria-label={prefs.sound ? 'Desativar sons' : 'Ativar sons'}
          aria-pressed={prefs.sound}
          onClick={() => togglePref('sound')}
        >
          {prefs.sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <button
          type="button"
          className="tray-btn tray-theme"
          title="Alternar tema Windows 98 / XP"
          onClick={() => {
            sfx.click();
            setPref('theme', prefs.theme === 'xp' ? '98' : 'xp');
          }}
        >
          {prefs.theme === 'xp' ? 'XP' : '98'}
        </button>
        <button
          type="button"
          className="tray-clock"
          title={now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          onClick={() => {
            setCalendar((c) => !c);
            setStartOpen(false);
          }}
        >
          {formatClock(now)}
        </button>
      </div>

      {calendar && <CalendarPopup now={now} />}

      {startOpen && (
        <div className="start-menu" role="menu">
          <div className="start-head">
            <Icon name="user" size={40} />
            <span>{prefs.nickname || 'Visitante'}</span>
          </div>
          <div className="start-cols">
            <ul className="start-left">
              {SECTIONS.map((s) => (
                <li key={s.path}>
                  <button type="button" role="menuitem" onClick={go(() => shell.openBrowser(s.path))}>
                    <Icon name={s.icon} size={28} />
                    <span>
                      <b>{s.title}</b>
                      <small>{s.desc}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <ul className="start-right">
              <li>
                <button type="button" role="menuitem" onClick={go(() => shell.openBrowser('/windows'))}>
                  <Icon name="computer" size={22} />
                  <b>Meu Computador</b>
                </button>
              </li>
              <li>
                <button type="button" role="menuitem" onClick={go(() => shell.openSettings('aparencia'))}>
                  <Icon name="gear" size={22} />
                  <b>Painel de Controle</b>
                </button>
              </li>
              <li>
                <button type="button" role="menuitem" onClick={go(() => shell.showPopup())}>
                  <Icon name="warning" size={22} />
                  <span>Abrir pop-up clássico</span>
                </button>
              </li>
              <li>
                <button type="button" role="menuitem" onClick={go(() => shell.openBrowser('/pagina-que-nao-existe'))}>
                  <Icon name="error" size={22} />
                  <span>Ver erro 404</span>
                </button>
              </li>
              <li>
                <button type="button" role="menuitem" onClick={go(() => shell.openAbout())}>
                  <Icon name="help" size={22} />
                  <span>Ajuda e suporte</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="start-foot">
            <button type="button" onClick={go(() => shell.reconnect())}>
              <Icon name="logoff" size={22} /> Reconectar
            </button>
            <button type="button" onClick={go(() => shell.shutdown())}>
              <Icon name="power" size={22} /> Desligar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarPopup({ now }: { now: Date }) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="calendar-pop" role="dialog" aria-label="Calendário">
      <div className="calendar-head">{now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
      <div className="calendar-grid">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <b key={i}>{d}</b>
        ))}
        {cells.map((d, i) => (
          <span key={i} className={d === now.getDate() ? 'is-today' : ''}>
            {d ?? ''}
          </span>
        ))}
      </div>
      <div className="calendar-time">{formatClock(now, true)}</div>
    </div>
  );
}
