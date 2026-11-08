import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';

/** Data/hora atual, atualizada no intervalo informado. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Arrastar janelas pela barra de título (mouse e toque via Pointer Events).
 * A posição é relativa ao elemento pai posicionado.
 */
export function useDrag(initial: Point, disabled = false) {
  const [pos, setPos] = useState<Point>(initial);
  const posRef = useRef(pos);
  posRef.current = pos;

  const onPointerDown = useCallback(
    (e: RPointerEvent<HTMLElement>) => {
      if (disabled || e.button !== 0) return;
      if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;
      const win = (e.currentTarget as HTMLElement).closest('.dwin') as HTMLElement | null;
      const parent = win?.offsetParent as HTMLElement | null;
      const start = { x: e.clientX, y: e.clientY };
      const orig = posRef.current;
      const pw = parent?.clientWidth ?? window.innerWidth;
      const ph = parent?.clientHeight ?? window.innerHeight;
      const ww = win?.offsetWidth ?? 200;
      e.preventDefault();

      const move = (ev: PointerEvent) => {
        const x = Math.min(pw - 60, Math.max(60 - ww, orig.x + ev.clientX - start.x));
        const y = Math.min(ph - 30, Math.max(0, orig.y + ev.clientY - start.y));
        setPos({ x, y });
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [disabled],
  );

  return { pos, setPos, onPointerDown };
}

/** Pausa animações/loops quando a aba não está visível. */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function formatClock(d: Date, seconds = false): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) });
}
