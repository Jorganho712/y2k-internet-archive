import { useEffect, useRef, useState } from 'react';

export interface MenuItem {
  label: string;
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
  shortcut?: string;
  separator?: boolean;
}

export interface Menu {
  label: string;
  items: MenuItem[];
}

/** Barra de menus clássica (Arquivo, Editar...). Todos os itens executam ações reais. */
export function MenuBar({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open === null) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="menubar" ref={ref} role="menubar">
      {menus.map((m, i) => (
        <div key={m.label} className="menubar-item">
          <button
            type="button"
            role="menuitem"
            aria-label={m.label}
            aria-haspopup="true"
            aria-expanded={open === i}
            className={open === i ? 'is-open' : ''}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => open !== null && setOpen(i)}
          >
            <u>{m.label[0]}</u>
            {m.label.slice(1)}
          </button>
          {open === i && (
            <ul className="dropdown" role="menu">
              {m.items.map((it, j) =>
                it.separator ? (
                  <li key={j} className="dropdown-sep" role="separator" />
                ) : (
                  <li key={j} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      disabled={it.disabled}
                      onClick={() => {
                        setOpen(null);
                        it.onClick?.();
                      }}
                    >
                      <span className="dd-check">{it.checked ? '✓' : ''}</span>
                      <span className="dd-label">{it.label}</span>
                      {it.shortcut && <span className="dd-short">{it.shortcut}</span>}
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
