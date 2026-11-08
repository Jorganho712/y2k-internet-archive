/** Leitura/escrita segura no localStorage (pode falhar em janelas anônimas). */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
}

export const KEYS = {
  prefs: 'y2k:prefs',
  visits: 'y2k:visits',
  guestbook: 'y2k:guestbook',
  poll: 'y2k:poll',
  notepad: 'y2k:notepad',
  scores: 'y2k:scores',
  msn: 'y2k:msn',
  recycle: 'y2k:recycle',
} as const;
