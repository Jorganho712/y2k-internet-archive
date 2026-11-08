import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { usePrefs } from '../lib/prefs';
import { navigate } from '../lib/router';
import { formatClock, useMediaQuery, useNow } from '../lib/hooks';
import { DraggableWindow, MessageBox } from '../components/Window';
import { Icon } from '../components/Icon';
import { sfx } from '../audio/sfx';
import { APPS, Calculator, Cmd, Help, MyComputer, MyDocuments, Notepad, Paint, RecycleBin, type AppId, type AppProps } from '../xp/apps';
import Minesweeper from '../games/Minesweeper';

interface Win {
  key: number;
  app: AppId;
  arg?: string;
  z: number;
  minimized: boolean;
}

const COMPONENTS: Partial<Record<AppId, ComponentType<AppProps>>> = {
  computer: MyComputer,
  docs: MyDocuments,
  recycle: RecycleBin,
  notepad: Notepad,
  paint: Paint,
  mines: () => <Minesweeper compact />,
  calc: Calculator,
  cmd: Cmd,
  help: Help,
};

const DESKTOP: AppId[] = ['computer', 'docs', 'recycle', 'ie', 'notepad', 'paint', 'mines', 'calc', 'cmd', 'winamp'];
const START_LEFT: AppId[] = ['ie', 'winamp', 'notepad', 'paint', 'mines', 'calc', 'cmd'];
const START_RIGHT: AppId[] = ['docs', 'computer', 'recycle', 'help'];

/** Área de trabalho do Windows XP simulada, com janelas reais. */
export default function WindowsXP() {
  const { prefs } = usePrefs();
  const now = useNow(10000);
  const narrow = useMediaQuery('(max-width: 640px)');
  const [wins, setWins] = useState<Win[]>([]);
  const [start, setStart] = useState(false);
  const [selected, setSelected] = useState<AppId | null>(null);
  const [shutdown, setShutdown] = useState(false);
  const [off, setOff] = useState(false);
  const zTop = useRef(10);
  const keyRef = useRef(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const open = useCallback((app: AppId, arg?: string) => {
    setStart(false);
    if (app === 'ie') return navigate('/');
    if (app === 'winamp') return navigate('/musica');
    sfx.open();
    zTop.current += 1;
    const z = zTop.current;
    setWins((ws) => {
      const existing = ws.find((w) => w.app === app && (app !== 'notepad' || w.arg === arg));
      if (existing) return ws.map((w) => (w === existing ? { ...w, z, minimized: false } : w));
      keyRef.current += 1;
      return [...ws, { key: keyRef.current, app, arg, z, minimized: false }];
    });
  }, []);

  const focus = (key: number) => {
    zTop.current += 1;
    const z = zTop.current;
    setWins((ws) => ws.map((w) => (w.key === key && w.z !== z ? { ...w, z } : w)));
  };

  const close = (key: number) => setWins((ws) => ws.filter((w) => w.key !== key));
  const toggleMin = (key: number) => {
    const w = wins.find((x) => x.key === key);
    const topZ = Math.max(...wins.filter((x) => !x.minimized).map((x) => x.z), 0);
    if (w && !w.minimized && w.z === topZ) setWins((ws) => ws.map((x) => (x.key === key ? { ...x, minimized: true } : x)));
    else {
      setWins((ws) => ws.map((x) => (x.key === key ? { ...x, minimized: false } : x)));
      focus(key);
    }
  };

  // abre o leia-me na primeira visita
  useEffect(() => {
    open('notepad', 'leia-me.txt');
  }, [open]);

  useEffect(() => {
    if (!start) return;
    const close = (e: Event) => {
      if (!(e.target as HTMLElement).closest('.xp-start-menu, .xp-start-btn')) setStart(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [start]);

  const topZ = Math.max(...wins.filter((w) => !w.minimized).map((w) => w.z), 0);

  return (
    <div className="page">
      <div className="page-title-row">
        <Icon name="computer" size={48} />
        <div>
          <h2 className="page-title">Windows Antigo</h2>
          <p className="page-sub">Um computador dentro do computador. Clique duas vezes nos ícones, abra o menu Iniciar e arraste as janelas.</p>
        </div>
      </div>

      <div className={`xp-desktop wp-${prefs.wallpaper === 'classico' ? 'classico' : prefs.wallpaper}`} ref={areaRef} onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
        {off ? (
          <div className="xp-off">
            <p>O computador simulado foi desligado.</p>
            <button
              type="button"
              className="power-btn"
              onClick={() => {
                setOff(false);
                sfx.startup();
              }}
            >
              <span aria-hidden="true">⏻</span> Ligar
            </button>
          </div>
        ) : (
          <>
            <ul className="xp-icons">
              {DESKTOP.map((id) => {
                const a = APPS[id];
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`desk-icon ${selected === id ? 'is-selected' : ''}`}
                      onClick={(e) => {
                        setSelected(id);
                        if ((e.nativeEvent as PointerEvent).pointerType === 'touch') open(id);
                      }}
                      onDoubleClick={() => open(id)}
                      onKeyDown={(e) => e.key === 'Enter' && open(id)}
                    >
                      <Icon name={a.icon} size={32} />
                      <span>{a.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {wins.map((w, i) => {
              const a = APPS[w.app];
              const C = COMPONENTS[w.app];
              if (!C) return null;
              const title = w.app === 'notepad' ? `${w.arg ?? 'Sem título'} - Bloco de Notas` : a.title;
              return (
                <DraggableWindow
                  key={w.key}
                  title={title}
                  icon={<Icon name={a.icon} size={16} />}
                  initial={{ x: 110 + ((i * 28) % 160), y: 12 + ((i * 24) % 120) }}
                  width={a.width}
                  height={a.height}
                  z={w.z}
                  active={w.z === topZ}
                  minimized={w.minimized}
                  startMaximized={narrow}
                  maximizable={w.app !== 'mines' && w.app !== 'calc'}
                  onFocus={() => focus(w.key)}
                  onMinimize={() => toggleMin(w.key)}
                  onClose={() => close(w.key)}
                  className={`xp-app xp-app-${w.app}`}
                >
                  <C open={open} close={() => close(w.key)} arg={w.arg} />
                </DraggableWindow>
              );
            })}

            {start && (
              <div className="start-menu xp-start-menu" role="menu">
                <div className="start-head">
                  <Icon name="user" size={40} />
                  <span>{prefs.nickname || 'Visitante'}</span>
                </div>
                <div className="start-cols">
                  <ul className="start-left">
                    {START_LEFT.map((id) => (
                      <li key={id}>
                        <button type="button" role="menuitem" onClick={() => open(id)}>
                          <Icon name={APPS[id].icon} size={26} />
                          <b>{APPS[id].title}</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <ul className="start-right">
                    {START_RIGHT.map((id) => (
                      <li key={id}>
                        <button type="button" role="menuitem" onClick={() => open(id)}>
                          <Icon name={APPS[id].icon} size={22} />
                          <b>{APPS[id].title}</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="start-foot">
                  <button
                    type="button"
                    onClick={() => {
                      setStart(false);
                      setWins([]);
                    }}
                  >
                    <Icon name="logoff" size={22} /> Fechar tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStart(false);
                      setShutdown(true);
                    }}
                  >
                    <Icon name="power" size={22} /> Desligar
                  </button>
                </div>
              </div>
            )}

            {shutdown && (
              <MessageBox
                title="Desligar o computador"
                icon="help"
                onClose={() => setShutdown(false)}
                buttons={[
                  {
                    label: 'Reiniciar',
                    onClick: () => {
                      setShutdown(false);
                      setWins([]);
                      sfx.startup();
                    },
                  },
                  {
                    label: 'Desligar',
                    primary: true,
                    onClick: () => {
                      setShutdown(false);
                      setWins([]);
                      sfx.shutdown();
                      setOff(true);
                    },
                  },
                  { label: 'Cancelar', onClick: () => setShutdown(false) },
                ]}
              >
                <p>O que você deseja que o computador simulado faça?</p>
              </MessageBox>
            )}
          </>
        )}

        <div className="xp-taskbar taskbar">
          <button
            type="button"
            className={`start-btn xp-start-btn ${start ? 'is-pressed' : ''}`}
            onClick={() => !off && setStart((s) => !s)}
            disabled={off}
            aria-expanded={start}
          >
            <span className="start-logo" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>Iniciar</span>
          </button>
          <div className="task-buttons">
            {wins.map((w) => (
              <button key={w.key} type="button" className={`task-btn ${!w.minimized && w.z === topZ ? 'is-active' : ''}`} onClick={() => toggleMin(w.key)}>
                <Icon name={APPS[w.app].icon} size={16} />
                <span>{w.app === 'notepad' ? w.arg : APPS[w.app].title}</span>
              </button>
            ))}
          </div>
          <div className="tray">
            <span className="tray-clock">{formatClock(now)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
