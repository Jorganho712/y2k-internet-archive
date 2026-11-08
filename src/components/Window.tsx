import { useEffect, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { useDrag, type Point } from '../lib/hooks';
import { sfx } from '../audio/sfx';

interface FrameProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  active?: boolean;
  maximized?: boolean;
  menu?: ReactNode;
  statusBar?: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onHelp?: () => void;
  onTitlePointerDown?: (e: RPointerEvent<HTMLElement>) => void;
  onMouseDown?: () => void;
  role?: string;
  ariaLabel?: string;
}

/** Moldura clássica de janela (Win98/XP conforme o tema). */
export function WindowFrame({
  title,
  icon,
  children,
  className = '',
  bodyClassName = '',
  style,
  active = true,
  maximized,
  menu,
  statusBar,
  onClose,
  onMinimize,
  onMaximize,
  onHelp,
  onTitlePointerDown,
  onMouseDown,
  role = 'dialog',
  ariaLabel,
}: FrameProps) {
  return (
    <section
      className={`win ${active ? 'is-active' : 'is-inactive'} ${maximized ? 'is-max' : ''} ${className}`}
      style={style}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      role={role}
      aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
    >
      <header
        className="win-title"
        onPointerDown={onTitlePointerDown}
        onDoubleClick={onMaximize}
      >
        {icon && <span className="win-title-icon">{icon}</span>}
        <span className="win-title-text">{title}</span>
        <span className="win-title-btns">
          {onHelp && (
            <button type="button" className="tb tb-help" aria-label="Ajuda" onClick={onHelp}>
              ?
            </button>
          )}
          {onMinimize && (
            <button
              type="button"
              className="tb tb-min"
              aria-label="Minimizar"
              onClick={() => {
                sfx.minimize();
                onMinimize();
              }}
            />
          )}
          {onMaximize && (
            <button
              type="button"
              className={`tb ${maximized ? 'tb-restore' : 'tb-max'}`}
              aria-label={maximized ? 'Restaurar' : 'Maximizar'}
              onClick={onMaximize}
            />
          )}
          {onClose && (
            <button
              type="button"
              className="tb tb-close"
              aria-label="Fechar"
              onClick={() => {
                sfx.close();
                onClose();
              }}
            />
          )}
        </span>
      </header>
      {menu}
      <div className={`win-body ${bodyClassName}`}>{children}</div>
      {statusBar && <footer className="win-status">{statusBar}</footer>}
    </section>
  );
}

interface DraggableProps extends Omit<FrameProps, 'onTitlePointerDown' | 'maximized' | 'onMaximize' | 'style'> {
  initial: Point;
  width?: number | string;
  height?: number | string;
  z?: number;
  minimized?: boolean;
  maximizable?: boolean;
  startMaximized?: boolean;
  shake?: number;
  onFocus?: () => void;
}

/** Janela arrastável: usada em pop-ups, MSN e na área de trabalho simulada. */
export function DraggableWindow({
  initial,
  width,
  height,
  z = 10,
  minimized,
  maximizable = true,
  startMaximized = false,
  shake = 0,
  onFocus,
  className = '',
  ...frame
}: DraggableProps) {
  const [max, setMax] = useState(startMaximized);
  const { pos, onPointerDown } = useDrag(initial, max);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!shake) return;
    setShaking(true);
    const id = window.setTimeout(() => setShaking(false), 700);
    return () => window.clearTimeout(id);
  }, [shake]);

  const style: CSSProperties = max
    ? { zIndex: z }
    : { left: pos.x, top: pos.y, width, height, zIndex: z };

  return (
    <div
      className={`dwin ${max ? 'dwin-max' : ''} ${minimized ? 'dwin-min' : ''} ${shaking ? 'shake' : ''}`}
      style={style}
      onPointerDown={onFocus}
    >
      <WindowFrame
        {...frame}
        className={className}
        maximized={max}
        onMaximize={maximizable ? () => setMax((m) => !m) : undefined}
        onTitlePointerDown={onPointerDown}
      />
    </div>
  );
}

/** Caixa de mensagem estilo MessageBox. */
export function MessageBox({
  title,
  icon = 'info',
  children,
  buttons,
  onClose,
  z = 2000,
}: {
  title: string;
  icon?: 'info' | 'warning' | 'error' | 'help';
  children: ReactNode;
  buttons: { label: string; onClick: () => void; primary?: boolean }[];
  onClose: () => void;
  z?: number;
}) {
  return (
    <div className="modal-layer" style={{ zIndex: z }}>
      <WindowFrame title={title} onClose={onClose} className="msgbox" role="alertdialog">
        <div className="msgbox-content">
          <span className={`msgbox-icon msgbox-${icon}`} aria-hidden="true">
            {icon === 'info' ? 'i' : icon === 'warning' ? '!' : icon === 'error' ? '×' : '?'}
          </span>
          <div className="msgbox-text">{children}</div>
        </div>
        <div className="msgbox-buttons">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              className="btn"
              autoFocus={b.primary}
              onClick={b.onClick}
            >
              {b.label}
            </button>
          ))}
        </div>
      </WindowFrame>
    </div>
  );
}
