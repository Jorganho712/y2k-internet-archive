import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { getHighScore, submitScore } from './scores';
import { sfx } from '../audio/sfx';

const N = 20;
const CELL = 16;
type Dir = { x: number; y: number };
type P = { x: number; y: number };

/** Cobrinha clássica de celular, em canvas. Teclado, botões na tela e deslize. */
export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => getHighScore('snake'));
  const [status, setStatus] = useState<'ready' | 'playing' | 'paused' | 'over'>('ready');
  const game = useRef({ snake: [{ x: 10, y: 10 }] as P[], dir: { x: 1, y: 0 } as Dir, next: { x: 1, y: 0 } as Dir, food: { x: 15, y: 10 } as P, score: 0 });

  const draw = useCallback(() => {
    const c = canvasRef.current?.getContext('2d');
    if (!c) return;
    const g = game.current;
    c.fillStyle = '#9bbc0f';
    c.fillRect(0, 0, N * CELL, N * CELL);
    c.fillStyle = '#8bac0f';
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) c.fillRect(i * CELL, j * CELL, CELL, CELL);
    c.fillStyle = '#0f380f';
    c.fillRect(g.food.x * CELL + 4, g.food.y * CELL + 4, CELL - 8, CELL - 8);
    c.fillRect(g.food.x * CELL + 6, g.food.y * CELL + 1, CELL - 12, 3);
    g.snake.forEach((s, i) => {
      c.fillStyle = i === 0 ? '#0f380f' : '#306230';
      c.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const placeFood = () => {
    const g = game.current;
    let f: P;
    do f = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    while (g.snake.some((s) => s.x === f.x && s.y === f.y));
    g.food = f;
  };

  const reset = () => {
    game.current = { snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 15, y: 10 }, score: 0 };
    placeFood();
    setScore(0);
    setStatus('playing');
    canvasRef.current?.focus();
  };

  const turn = useCallback((d: Dir) => {
    const g = game.current;
    if (d.x === -g.dir.x && d.y === -g.dir.y) return;
    g.next = d;
  }, []);

  useEffect(draw, [draw]);

  useEffect(() => {
    if (status !== 'playing') return;
    const speed = Math.max(70, 140 - score * 3);
    const id = window.setInterval(() => {
      const g = game.current;
      g.dir = g.next;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || g.snake.some((s) => s.x === head.x && s.y === head.y)) {
        sfx.boom();
        setStatus('over');
        if (submitScore('snake', g.score)) setBest(g.score);
        return;
      }
      g.snake.unshift(head);
      if (head.x === g.food.x && head.y === g.food.y) {
        g.score += 1;
        setScore(g.score);
        sfx.coin();
        placeFood();
      } else g.snake.pop();
      draw();
    }, speed);
    return () => window.clearInterval(id);
  }, [status, score, draw]);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, Dir> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    const d = map[e.key];
    if (d) {
      e.preventDefault();
      if (status === 'ready' || status === 'over') reset();
      turn(d);
    } else if (e.key === ' ' || e.key === 'p') {
      e.preventDefault();
      if (status === 'playing') setStatus('paused');
      else if (status === 'paused') setStatus('playing');
      else reset();
    }
  };

  const touch = useRef<P | null>(null);

  return (
    <div className="game game-snake">
      <div className="game-hud">
        <span>Pontos: <b>{score}</b></span>
        <span>Recorde: <b>{best}</b></span>
      </div>
      <div className="game-screen">
        <canvas
          ref={canvasRef}
          width={N * CELL}
          height={N * CELL}
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Tela do jogo Cobrinha. Use as setas para jogar."
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            if (!touch.current) return;
            const dx = e.changedTouches[0].clientX - touch.current.x;
            const dy = e.changedTouches[0].clientY - touch.current.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
            turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
          }}
        />
        {status !== 'playing' && (
          <div className="game-overlay">
            <p>{status === 'over' ? `Fim de jogo! ${score} pontos` : status === 'paused' ? 'Pausado' : 'COBRINHA'}</p>
            <button type="button" className="retro-btn" onClick={status === 'paused' ? () => setStatus('playing') : reset}>
              {status === 'paused' ? 'Continuar' : status === 'over' ? 'Jogar de novo' : 'Começar'}
            </button>
          </div>
        )}
      </div>
      <div className="dpad" aria-label="Controles">
        <button type="button" aria-label="Cima" onClick={() => turn({ x: 0, y: -1 })}>▲</button>
        <button type="button" aria-label="Esquerda" onClick={() => turn({ x: -1, y: 0 })}>◀</button>
        <button type="button" aria-label="Pausar" onClick={() => setStatus(status === 'playing' ? 'paused' : status === 'paused' ? 'playing' : status)}>❚❚</button>
        <button type="button" aria-label="Direita" onClick={() => turn({ x: 1, y: 0 })}>▶</button>
        <button type="button" aria-label="Baixo" onClick={() => turn({ x: 0, y: 1 })}>▼</button>
      </div>
      <p className="hint">Setas ou WASD para mover · Espaço pausa · No celular, deslize na tela ou use os botões.</p>
    </div>
  );
}
