import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { usePrefs } from '../lib/prefs';
import { navigate, useRoute } from '../lib/router';
import { ShellContext, type ShellApi } from '../lib/shell';
import { useMediaQuery } from '../lib/hooks';
import { SECTIONS } from '../data/sections';
import { sfx } from '../audio/sfx';
import { player } from '../audio/player';
import { BootScreen, ShutdownScreen } from './BootScreen';
import { Browser } from './Browser';
import { Taskbar, type TaskItem } from './Taskbar';
import { SettingsWindow, type SettingsTab } from './SettingsWindow';
import { PopupLayer, POPUP_KINDS, type PopupDef } from './Popups';
import { SiteLayout } from './SiteLayout';
import { MessageBox } from './Window';
import { Icon } from './Icon';
import { Hourglass } from './Retro';
import { ErrorBoundary } from './ErrorBoundary';

const Home = lazy(() => import('../pages/Home'));
const Internet = lazy(() => import('../pages/Internet'));
const Games = lazy(() => import('../pages/Games'));
const Msn = lazy(() => import('../pages/Msn'));
const WindowsXP = lazy(() => import('../pages/WindowsXP'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Music = lazy(() => import('../pages/Music'));
const Guestbook = lazy(() => import('../pages/Guestbook'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PAGES: Record<string, ComponentType> = {
  '/': Home,
  '/internet': Internet,
  '/jogos': Games,
  '/msn': Msn,
  '/windows': WindowsXP,
  '/galeria': Gallery,
  '/musica': Music,
  '/guestbook': Guestbook,
};

type Power = 'boot' | 'on' | 'off';
type BrowserState = 'open' | 'min' | 'closed';

export function Shell() {
  const { prefs } = usePrefs();
  const route = useRoute();
  const wide = useMediaQuery('(min-width: 1100px)');
  const [power, setPower] = useState<Power>(() => (prefs.skipBoot ? 'on' : 'boot'));
  const [browser, setBrowser] = useState<BrowserState>('open');
  const [maximized, setMaximized] = useState(!wide);
  const [reloadKey, setReloadKey] = useState(0);
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [about, setAbout] = useState(false);
  const [popups, setPopups] = useState<PopupDef[]>([]);
  const popupId = useRef(0);
  const autoPopupShown = useRef(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [topLayer, setTopLayer] = useState<'settings' | 'popups'>('popups');

  useEffect(() => {
    if (!wide) setMaximized(true);
  }, [wide]);

  const showPopup = useCallback(() => {
    sfx.error();
    const w = window.innerWidth;
    const h = window.innerHeight;
    popupId.current += 1;
    setPopups((p) => [
      ...p.slice(-3),
      {
        id: popupId.current,
        kind: Math.floor(Math.random() * POPUP_KINDS.length),
        x: Math.max(4, Math.round(Math.random() * Math.max(10, w - 320))),
        y: Math.max(4, Math.round(Math.random() * Math.max(10, h - 320))),
      },
    ]);
    setTopLayer('popups');
  }, []);

  // um pop-up automático por sessão (se o visitante permitir)
  useEffect(() => {
    if (power !== 'on' || !prefs.popups || autoPopupShown.current) return;
    const id = window.setTimeout(() => {
      autoPopupShown.current = true;
      showPopup();
    }, 45000);
    return () => window.clearTimeout(id);
  }, [power, prefs.popups, showPopup]);

  const openBrowser = useCallback((path?: string) => {
    setBrowser('open');
    if (path) navigate(path);
  }, []);

  const api: ShellApi = useMemo(
    () => ({
      openSettings: (tab = 'aparencia') => {
        sfx.open();
        setSettings(tab);
        setTopLayer('settings');
      },
      openAbout: () => setAbout(true),
      showPopup,
      reconnect: () => {
        player.pause();
        setPower('boot');
      },
      shutdown: () => {
        player.pause();
        sfx.shutdown();
        setPower('off');
      },
      openBrowser,
    }),
    [showPopup, openBrowser],
  );

  const finishBoot = useCallback(() => {
    setPower('on');
    window.setTimeout(() => sfx.startup(), 150);
  }, []);

  if (power === 'boot') return <BootScreen onDone={finishBoot} />;
  if (power === 'off') return <ShutdownScreen onRestart={() => setPower('boot')} />;

  const Page = PAGES[route] ?? NotFound;

  const tasks: TaskItem[] = [];
  if (browser !== 'closed') {
    tasks.push({
      id: 'browser',
      title: 'Y2K Internet Archive - Internet Explorer',
      icon: 'ie',
      active: browser === 'open',
      onClick: () => setBrowser((b) => (b === 'open' ? 'min' : 'open')),
    });
  }
  if (settings) {
    tasks.push({ id: 'settings', title: 'Painel de Controle', icon: 'gear', active: true, onClick: () => setTopLayer('settings') });
  }

  const openIcon = (path: string) => {
    sfx.open();
    openBrowser(path);
  };

  return (
    <ShellContext.Provider value={api}>
      <div className={`desktop wp-${prefs.wallpaper}`}>
        <ul className="desktop-icons" aria-label="Ícones da área de trabalho">
          {SECTIONS.map((s) => (
            <li key={s.path}>
              <button
                type="button"
                className={`desk-icon ${selectedIcon === s.path ? 'is-selected' : ''}`}
                onClick={(e) => {
                  setSelectedIcon(s.path);
                  // toque (celular) abre com um clique; mouse abre com duplo clique
                  if ((e.nativeEvent as PointerEvent).pointerType === 'touch') openIcon(s.path);
                }}
                onDoubleClick={() => openIcon(s.path)}
                onKeyDown={(e) => e.key === 'Enter' && openIcon(s.path)}
                title={`${s.title} — clique duas vezes para abrir`}
              >
                <Icon name={s.path === '/' ? 'ie' : s.icon} size={34} />
                <span>{s.path === '/' ? 'Internet Explorer' : s.title}</span>
              </button>
            </li>
          ))}
        </ul>

        {browser === 'open' && (
          <Browser
            route={route}
            maximized={maximized}
            onToggleMax={() => setMaximized((m) => !m)}
            onMinimize={() => setBrowser('min')}
            onClose={() => setBrowser('closed')}
            onReload={() => setReloadKey((k) => k + 1)}
          >
            <SiteLayout route={route}>
              <Suspense
                fallback={
                  <div className="page-loading">
                    <Hourglass /> Carregando...
                  </div>
                }
              >
                <ErrorBoundary resetKey={`${route}-${reloadKey}`}>
                  <Page key={`${route}-${reloadKey}`} />
                </ErrorBoundary>
              </Suspense>
            </SiteLayout>
          </Browser>
        )}

        {browser !== 'open' && (
          <div className="desktop-hint">
            <Icon name="info" size={20} /> Clique duas vezes em um ícone ou use o menu Iniciar para abrir o navegador.
          </div>
        )}

        {settings && (
          <SettingsWindow
            tab={settings}
            onClose={() => setSettings(null)}
            z={topLayer === 'settings' ? 900 : 700}
            onFocus={() => setTopLayer('settings')}
          />
        )}
        <PopupLayer popups={popups} onClose={(id) => setPopups((p) => p.filter((x) => x.id !== id))} baseZ={topLayer === 'popups' ? 900 : 700} />

        {about && (
          <MessageBox
            title="Sobre o Y2K Internet Archive"
            icon="info"
            onClose={() => setAbout(false)}
            buttons={[{ label: 'OK', primary: true, onClick: () => setAbout(false) }]}
          >
            <p>
              <b>Y2K Internet Archive</b> versão 1.0 (compilação 2003)
            </p>
            <p>Um museu interativo da internet entre 1998 e 2010. Sons, músicas e pixel art são gerados por código; os ícones do sistema seguem o estilo do Windows XP.</p>
            <p>Dicas: use o menu Iniciar, alterne o tema 98/XP na bandeja e abra o Painel de Controle para ajustar sons, cursor e efeito CRT.</p>
          </MessageBox>
        )}

        <Taskbar tasks={tasks} />
        <div className="crt-overlay" aria-hidden="true" />
      </div>
    </ShellContext.Provider>
  );
}
