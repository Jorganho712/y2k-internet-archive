import { useEffect, useRef, useState } from 'react';
import { getHighScore, submitScore } from './scores';
import { sfx } from '../audio/sfx';
import { usePageVisible } from '../lib/hooks';

const W = 360;
const H = 300;
const COLS = 9;
const ROWS = 5;
const COLORS = ['#ff00aa', '#b44dff', '#0044ff', '#00e5ff', '#ccff00'];

interface State {
  px: number;
  bx: number;
  by: number;
  vx: number;
  vy: number;
  bricks: boolean[];
  lives: number;
  score: number;
  stuck: boolean;
}

const fresh = (): State => ({ px: W / 2, bx: W / 2, by: H - 30, vx: 2.6, vy: -3.2, bricks: Array(COLS * ROWS).fill(true), lives: 3, score: 0, stuck: true });

/** Tijolinhos: rebata a bolinha e quebre todos os blocos. */
export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = useRef<State>(fresh());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ score: 0, lives: 3 });
  const [status, setStatus] = useState<'ready' | 'playing' | 'over' | 'won'>('ready');
  const [best, setBest] = useState(() => getHighScore('breakout'));
  const visible = usePageVisible();

  useEffect(() => {
    const c = canvasRef.current?.getContext('2d');
    if (!c) return;
    let raf = 0;
    const bw = W / COLS;
    const bh = 14;

    const draw = () => {
      const st = s.current;
      const grd = c.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#000033');
      grd.addColorStop(1, '#1a0040');
      c.fillStyle = grd;
      c.fillRect(0, 0, W, H);
      st.bricks.forEach((alive, i) => {
        if (!alive) return;
        const x = (i % COLS) * bw;
        const y = 30 + Math.floor(i / COLS) * bh;
        c.fillStyle = COLORS[Math.floor(i / COLS)];
        c.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        c.fillStyle = 'rgba(255,255,255,.45)';
        c.fillRect(x + 1, y + 1, bw - 2, 3);
      });
      c.fillStyle = '#c0c0c0';
      c.fillRect(st.px - 30, H - 16, 60, 8);
      c.fillStyle = '#fff';
      c.fillRect(st.px - 30, H - 16, 60, 2);
      c.fillStyle = '#ccff00';
      c.fillRect(st.bx - 4, st.by - 4, 8, 8);
    };

    const step = () => {
      const st = s.current;
      if (keys.current.left) st.px -= 6;
      if (keys.current.right) st.px += 6;
      st.px = Math.min(W - 30, Math.max(30, st.px));
      if (st.stuck) {
        st.bx = st.px;
        st.by = H - 22;
      } else {
        st.bx += st.vx;
        st.by += st.vy;
        if (st.bx < 4 || st.bx > W - 4) {
          st.vx *= -1;
          st.bx = Math.min(W - 4, Math.max(4, st.bx));
        }
        if (st.by < 4) st.vy = Math.abs(st.vy);
        if (st.by > H - 20 && st.by < H - 8 && Math.abs(st.bx - st.px) < 34 && st.vy > 0) {
          st.vy = -Math.abs(st.vy);
          st.vx = ((st.bx - st.px) / 34) * 4;
          sfx.click();
        }
        const col = Math.floor(st.bx / bw);
        const row = Math.floor((st.by - 30) / bh);
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && st.bricks[row * COLS + col]) {
          st.bricks[row * COLS + col] = false;
          st.vy *= -1;
          st.score += (ROWS - row) * 10;
          sfx.coin();
          setHud({ score: st.score, lives: st.lives });
          if (st.bricks.every((b) => !b)) {
            sfx.win();
            submitScore('breakout', st.score) && setBest(st.score);
            setStatus('won');
            draw();
            return;
          }
        }
        if (st.by > H + 10) {
          st.lives -= 1;
          st.stuck = true;
          sfx.error();
          setHud({ score: st.score, lives: st.lives });
          if (st.lives <= 0) {
            submitScore('breakout', st.score) && setBest(st.score);
            setStatus('over');
            draw();
            return;
          }
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    draw();
    if (status === 'playing' && visible) raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [status, visible]);

  const start = () => {
    if (status !== 'playing') {
      s.current = fresh();
      setHud({ score: 0, lives: 3 });
      setStatus('playing');
    }
    canvasRef.current?.focus();
  };

  const launch = () => {
    if (status === 'playing') s.current.stuck = false;
  };

  const movePointer = (clientX: number) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (r) s.current.px = ((clientX - r.left) / r.width) * W;
  };

  return (
    <div className="game game-breakout">
      <div className="game-hud">
        <span>Pontos: <b>{hud.score}</b></span>
        <span>Vidas: <b>{'♥'.repeat(Math.max(0, hud.lives))}</b></span>
        <span>Recorde: <b>{best}</b></span>
      </div>
      <div className="game-screen">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          tabIndex={0}
          aria-label="Tela do jogo Tijolinhos"
          onPointerMove={(e) => movePointer(e.clientX)}
          onPointerDown={(e) => {
            movePointer(e.clientX);
            launch();
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') keys.current.left = true;
            if (e.key === 'ArrowRight') keys.current.right = true;
            if (e.key === ' ') {
              e.preventDefault();
              if (status === 'playing') launch();
              else start();
            }
            if (e.key.startsWith('Arrow')) e.preventDefault();
          }}
          onKeyUp={(e) => {
            if (e.key === 'ArrowLeft') keys.current.left = false;
            if (e.key === 'ArrowRight') keys.current.right = false;
          }}
          style={{ touchAction: 'none' }}
        />
        {status !== 'playing' && (
          <div className="game-overlay">
            <p>{status === 'won' ? `Você venceu! ${hud.score} pontos` : status === 'over' ? `Fim de jogo! ${hud.score} pontos` : 'TIJOLINHOS'}</p>
            <button type="button" className="retro-btn" onClick={start}>
              {status === 'ready' ? 'Começar' : 'Jogar de novo'}
            </button>
          </div>
        )}
      </div>
      <p className="hint">Mova o mouse ou o dedo para controlar a raquete · Clique/toque ou Espaço para lançar · Setas também funcionam.</p>
    </div>
  );
}
