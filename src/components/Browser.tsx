import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { navigate } from '../lib/router';
import { usePrefs } from '../lib/prefs';
import { useShell } from '../lib/shell';
import { SECTIONS, SITE_HOST, addressToPath, sectionFor } from '../data/sections';
import { sfx } from '../audio/sfx';
import { WindowFrame } from './Window';
import { MenuBar, type Menu } from './MenuBar';
import { Icon } from './Icon';

interface BrowserProps {
  route: string;
  maximized: boolean;
  onToggleMax: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onReload: () => void;
  children: ReactNode;
}

export function urlFor(path: string): string {
  const s = sectionFor(path);
  return `http://${SITE_HOST}/${s ? s.file : `${path.replace(/^\//, '')}.htm`}`;
}

/** Janela de navegador estilo Internet Explorer 6 que contém o portal. */
export function Browser({ route, maximized, onToggleMax, onMinimize, onClose, onReload, children }: BrowserProps) {
  const { prefs, setPref, togglePref } = usePrefs();
  const shell = useShell();
  const [address, setAddress] = useState(urlFor(route));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Concluído');
  const contentRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // "Carregamento" retrô a cada troca de página
  useEffect(() => {
    setAddress(urlFor(route));
    contentRef.current?.scrollTo({ top: 0 });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setLoading(true);
    setStatus(`Abrindo página ${urlFor(route)}...`);
    const id = window.setTimeout(() => {
      setLoading(false);
      setStatus('Concluído');
    }, 550);
    return () => window.clearTimeout(id);
  }, [route]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    sfx.click();
    navigate(addressToPath(address));
  };

  const reload = () => {
    sfx.click();
    setLoading(true);
    setStatus('Atualizando...');
    onReload();
    window.setTimeout(() => {
      setLoading(false);
      setStatus('Concluído');
    }, 500);
  };

  const menus: Menu[] = [
    {
      label: 'Arquivo',
      items: [
        { label: 'Página inicial', onClick: () => navigate('/') },
        { label: 'Imprimir...', shortcut: 'Ctrl+P', onClick: () => window.print() },
        { separator: true, label: '' },
        { label: 'Minimizar janela', onClick: onMinimize },
        { label: 'Fechar', onClick: onClose },
      ],
    },
    {
      label: 'Editar',
      items: [
        {
          label: 'Selecionar tudo',
          shortcut: 'Ctrl+A',
          onClick: () => {
            const el = contentRef.current;
            const sel = window.getSelection();
            if (el && sel) {
              const r = document.createRange();
              r.selectNodeContents(el);
              sel.removeAllRanges();
              sel.addRange(r);
            }
          },
        },
        {
          label: 'Copiar endereço',
          onClick: () => {
            void navigator.clipboard?.writeText(urlFor(route)).then(
              () => setStatus('Endereço copiado para a Área de Transferência'),
              () => setStatus('Não foi possível copiar'),
            );
          },
        },
      ],
    },
    {
      label: 'Exibir',
      items: [
        { label: 'Tema Windows XP', checked: prefs.theme === 'xp', onClick: () => setPref('theme', 'xp') },
        { label: 'Tema Windows 98', checked: prefs.theme === '98', onClick: () => setPref('theme', '98') },
        { separator: true, label: '' },
        { label: 'Efeito monitor CRT', checked: prefs.crt, onClick: () => togglePref('crt') },
        { label: 'Cursor retrô', checked: prefs.cursor, onClick: () => togglePref('cursor') },
        { label: maximized ? 'Restaurar janela' : 'Maximizar janela', onClick: onToggleMax },
        { label: 'Atualizar', shortcut: 'F5', onClick: reload },
      ],
    },
    {
      label: 'Favoritos',
      items: SECTIONS.map((s) => ({ label: s.title, checked: s.path === route, onClick: () => navigate(s.path) })),
    },
    {
      label: 'Ferramentas',
      items: [
        { label: 'Opções da Internet...', onClick: () => shell.openSettings('geral') },
        { label: 'Sons...', onClick: () => shell.openSettings('som') },
        { label: 'Reconectar discada', onClick: shell.reconnect },
      ],
    },
    {
      label: 'Ajuda',
      items: [
        { label: 'Sobre o Y2K Internet Archive', onClick: shell.openAbout },
        { label: 'Mostrar pop-up de exemplo', onClick: shell.showPopup },
      ],
    },
  ];

  const sec = sectionFor(route);
  const title = `${sec ? sec.title : 'Não é possível exibir a página'} - Y2K Internet Archive - Microsoft Internet Explorer`;

  return (
    <div className={`browser-wrap ${maximized ? 'is-max' : ''}`}>
      <WindowFrame
        title={title}
        icon={<Icon name="ie" size={16} />}
        className="browser"
        maximized={maximized}
        onMinimize={onMinimize}
        onMaximize={onToggleMax}
        onClose={onClose}
        role="region"
        ariaLabel="Navegador"
        menu={
          <>
            <MenuBar menus={menus} />
            <div className="ie-toolbar">
              <button type="button" className="ie-tool" onClick={() => window.history.back()} title="Voltar">
                <span className="ie-arrow ie-back" aria-hidden="true" />
                <span>Voltar</span>
              </button>
              <button type="button" className="ie-tool" onClick={() => window.history.forward()} title="Avançar">
                <span className="ie-arrow ie-fwd" aria-hidden="true" />
                <span className="hide-sm">Avançar</span>
              </button>
              <button type="button" className="ie-tool" onClick={reload} title="Atualizar">
                <span className="ie-reload" aria-hidden="true">⟳</span>
                <span className="hide-sm">Atualizar</span>
              </button>
              <button type="button" className="ie-tool" onClick={() => navigate('/')} title="Página inicial">
                <Icon name="home" size={20} />
                <span className="hide-sm">Início</span>
              </button>
              <button type="button" className="ie-tool hide-xs" onClick={() => navigate('/guestbook')} title="Guestbook">
                <Icon name="mail" size={20} />
                <span className="hide-sm">Correio</span>
              </button>
              <span className={`ie-throbber ${loading ? 'is-loading' : ''}`} aria-hidden="true">
                <Icon name="globe" size={22} />
              </span>
            </div>
            <form className="ie-address" onSubmit={submit}>
              <label htmlFor="ie-addr">Endereço</label>
              <span className="ie-addr-field">
                <Icon name="doc" size={14} />
                <input
                  id="ie-addr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  spellCheck={false}
                  autoComplete="off"
                />
              </span>
              <button type="submit" className="btn ie-go">
                <span className="ie-go-arrow" aria-hidden="true">➜</span> Ir
              </button>
            </form>
          </>
        }
        statusBar={
          <>
            <span className="status-cell status-main">
              <Icon name={loading ? 'globe' : 'doc'} size={14} /> {status}
            </span>
            <span className="status-cell status-progress">
              {loading && (
                <span className="progress progress-mini">
                  <span className="progress-fill progress-indeterminate" />
                </span>
              )}
            </span>
            <span className="status-cell status-zone">
              <Icon name="globe" size={14} /> Internet
            </span>
          </>
        }
      >
        <div
          className={`ie-content ${loading ? 'is-loading' : ''}`}
          ref={contentRef}
          onMouseOver={(e) => {
            const a = (e.target as HTMLElement).closest('a');
            if (a && !loading) {
              const href = a.getAttribute('href') ?? '';
              setStatus(href.startsWith('#') ? urlFor(href.slice(1)) : href);
            }
          }}
          onMouseOut={(e) => {
            if ((e.target as HTMLElement).closest('a') && !loading) setStatus('Concluído');
          }}
        >
          {children}
        </div>
      </WindowFrame>
    </div>
  );
}
