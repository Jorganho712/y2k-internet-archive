import { KEYS, loadJSON, saveJSON } from '../lib/storage';

export function getHighScore(game: string): number {
  return loadJSON<Record<string, number>>(KEYS.scores, {})[game] ?? 0;
}

/** Salva se for recorde; retorna true quando bateu o recorde. */
export function submitScore(game: string, score: number): boolean {
  const all = loadJSON<Record<string, number>>(KEYS.scores, {});
  if (score > (all[game] ?? 0)) {
    all[game] = score;
    saveJSON(KEYS.scores, all);
    return true;
  }
  return false;
}
