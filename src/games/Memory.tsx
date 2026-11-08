import { useEffect, useState } from 'react';
import { PixelArt } from '../components/PixelArt';
import type { SpriteName } from '../data/sprites';
import { sfx } from '../audio/sfx';
import { getHighScore, submitScore } from './scores';

const FACES: SpriteName[] = ['crt', 'phoneFlip', 'handheld', 'cat', 'hamster', 'trophy', 'mp3', 'controller'];

interface Card {
  id: number;
  face: SpriteName;
  open: boolean;
  done: boolean;
}

function deal(): Card[] {
  const cards = [...FACES, ...FACES].map((face, id) => ({ id, face, open: false, done: false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/** Jogo da memória com pixel art de objetos dos anos 2000. Recorde = menos jogadas. */
export default function Memory() {
  const [cards, setCards] = useState(deal);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [best, setBest] = useState(() => getHighScore('memory'));
  const won = cards.every((c) => c.done);

  useEffect(() => {
    const open = cards.filter((c) => c.open && !c.done);
    if (open.length !== 2) return;
    setLock(true);
    const [a, b] = open;
    const match = a.face === b.face;
    const id = window.setTimeout(
      () => {
        setCards((cs) => cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, open: match, done: match } : c)));
        setLock(false);
        match ? sfx.coin() : sfx.click();
      },
      match ? 300 : 800,
    );
    return () => window.clearTimeout(id);
  }, [cards]);

  useEffect(() => {
    if (!won) return;
    sfx.win();
    // pontuação: quanto menos jogadas, maior (salva como 100 - jogadas)
    if (submitScore('memory', 100 - moves)) setBest(100 - moves);
  }, [won, moves]);

  const flip = (card: Card) => {
    if (lock || card.open || card.done) return;
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, open: true } : c)));
    if (cards.filter((c) => c.open && !c.done).length === 1) setMoves((m) => m + 1);
  };

  const restart = () => {
    setCards(deal());
    setMoves(0);
    setLock(false);
  };

  return (
    <div className="game game-memory">
      <div className="game-hud">
        <span>Jogadas: <b>{moves}</b></span>
        <span>Melhor: <b>{best ? `${100 - best} jogadas` : '—'}</b></span>
        <button type="button" className="retro-btn small" onClick={restart}>
          Embaralhar
        </button>
      </div>
      <div className="memory-grid">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`memory-card ${c.open || c.done ? 'is-open' : ''} ${c.done ? 'is-done' : ''}`}
            onClick={() => flip(c)}
            aria-label={c.open || c.done ? c.face : 'Carta virada'}
          >
            <span className="memory-back" aria-hidden="true">?</span>
            <span className="memory-face">
              <PixelArt sprite={c.face} scale={3} />
            </span>
          </button>
        ))}
      </div>
      {won && (
        <p className="game-win">
          Parabéns! Você terminou em {moves} jogadas.{' '}
          <button type="button" className="retro-btn small" onClick={restart}>
            Jogar de novo
          </button>
        </p>
      )}
    </div>
  );
}
