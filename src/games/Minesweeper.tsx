import { useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sfx';
import { getHighScore, submitScore } from './scores';

const SIZE = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  n: number;
}

const empty = (): Cell[] => Array.from({ length: SIZE * SIZE }, () => ({ mine: false, open: false, flag: false, n: 0 }));

function neighbors(i: number): number[] {
  const x = i % SIZE;
  const y = Math.floor(i / SIZE);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE) out.push(ny * SIZE + nx);
    }
  return out;
}

function plant(first: number): Cell[] {
  const cells = empty();
  const safe = new Set([first, ...neighbors(first)]);
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * cells.length);
    if (!cells[i].mine && !safe.has(i)) {
      cells[i].mine = true;
      placed++;
    }
  }
  cells.forEach((c, i) => (c.n = neighbors(i).filter((j) => cells[j].mine).length));
  return cells;
}

const NUM_COLORS = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000', '#808080'];

/** Campo Minado 9x9. Clique direito ou "modo bandeira" para marcar. */
export default function Minesweeper({ compact }: { compact?: boolean }) {
  const [cells, setCells] = useState<Cell[]>(empty);
  const [state, setState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [time, setTime] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [best, setBest] = useState(() => getHighScore('mines'));
  const press = useRef<number | null>(null);
  const longPressed = useRef(false);

  useEffect(() => {
    if (state !== 'playing') return;
    const id = window.setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  const reset = () => {
    setCells(empty());
    setState('idle');
    setTime(0);
  };

  const open = (i: number) => {
    if (state === 'won' || state === 'lost') return;
    let cs = cells;
    if (state === 'idle') {
      cs = plant(i);
      setState('playing');
    }
    if (cs[i].flag || cs[i].open) return;
    const next = cs.map((c) => ({ ...c }));
    if (next[i].mine) {
      next.forEach((c) => c.mine && (c.open = true));
      setCells(next);
      setState('lost');
      sfx.boom();
      return;
    }
    const stack = [i];
    while (stack.length) {
      const k = stack.pop()!;
      if (next[k].open || next[k].flag) continue;
      next[k].open = true;
      if (next[k].n === 0) neighbors(k).forEach((j) => !next[j].open && stack.push(j));
    }
    setCells(next);
    sfx.click();
    if (next.filter((c) => !c.mine).every((c) => c.open)) {
      setState('won');
      sfx.win();
      const score = 1000 - time;
      if (submitScore('mines', score)) setBest(score);
    }
  };

  const toggleFlag = (i: number) => {
    if (state === 'won' || state === 'lost' || cells[i].open) return;
    setCells((cs) => cs.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
    sfx.key();
  };

  const flags = cells.filter((c) => c.flag).length;
  const face = state === 'lost' ? '✖_✖' : state === 'won' ? '■‿■' : '◕‿◕';

  return (
    <div className={`mines ${compact ? 'is-compact' : ''}`}>
      <div className="mines-panel">
        <span className="led-num">{String(Math.max(0, MINES - flags)).padStart(3, '0')}</span>
        <button type="button" className="mines-face" onClick={reset} aria-label="Novo jogo">
          {face}
        </button>
        <span className="led-num">{String(time).padStart(3, '0')}</span>
      </div>
      <div className="mines-grid" role="grid" aria-label="Campo minado" onContextMenu={(e) => e.preventDefault()}>
        {cells.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`mine-cell ${c.open ? 'is-open' : ''} ${c.open && c.mine ? 'is-boom' : ''}`}
            style={c.open && c.n ? { color: NUM_COLORS[c.n] } : undefined}
            aria-label={c.open ? (c.mine ? 'Mina' : `${c.n} minas vizinhas`) : c.flag ? 'Bandeira' : 'Fechado'}
            onClick={() => {
              if (longPressed.current) {
                longPressed.current = false;
                return;
              }
              if (flagMode) toggleFlag(i);
              else open(i);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleFlag(i);
            }}
            onTouchStart={() => {
              longPressed.current = false;
              press.current = window.setTimeout(() => {
                longPressed.current = true;
                toggleFlag(i);
              }, 450);
            }}
            onTouchEnd={() => press.current && window.clearTimeout(press.current)}
            onTouchMove={() => press.current && window.clearTimeout(press.current)}
          >
            {c.open ? (c.mine ? '✹' : c.n || '') : c.flag ? '⚑' : ''}
          </button>
        ))}
      </div>
      <div className="mines-foot">
        <label className="check">
          <input type="checkbox" checked={flagMode} onChange={(e) => setFlagMode(e.target.checked)} /> Modo bandeira ⚑
        </label>
        {!compact && <span className="hint">Recorde: {best ? `${1000 - best}s` : '—'}</span>}
      </div>
      {state === 'won' && <p className="game-win">Você venceu em {time}s!</p>}
      {state === 'lost' && <p className="game-lose">BUM! Clique no rostinho para tentar de novo.</p>}
    </div>
  );
}
