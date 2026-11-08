import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { KEYS, loadJSON, saveJSON } from './storage';
import { setSfxEnabled, setSfxVolume } from '../audio/sfx';
import { player } from '../audio/player';

export type Theme = 'xp' | '98';

export interface Prefs {
  theme: Theme;
  sound: boolean;
  cursor: boolean;
  crt: boolean;
  skipBoot: boolean;
  popups: boolean;
  volume: number; // efeitos 0..100
  musicVolume: number; // player 0..100
  nickname: string;
  wallpaper: 'colinas' | 'nuvens' | 'classico' | 'matrix';
}

export type BoolPref = 'sound' | 'cursor' | 'crt' | 'skipBoot' | 'popups';

export const DEFAULT_PREFS: Prefs = {
  theme: 'xp',
  sound: false,
  cursor: true,
  crt: false,
  skipBoot: false,
  popups: true,
  volume: 70,
  musicVolume: 70,
  nickname: '',
  wallpaper: 'colinas',
};

interface PrefsCtx {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  togglePref: (key: BoolPref) => void;
  resetPrefs: () => void;
}

const Ctx = createContext<PrefsCtx | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => ({ ...DEFAULT_PREFS, ...loadJSON<Partial<Prefs>>(KEYS.prefs, {}) }));

  useEffect(() => {
    saveJSON(KEYS.prefs, prefs);
    const root = document.documentElement;
    root.dataset.theme = prefs.theme;
    root.classList.toggle('retro-cursor', prefs.cursor);
    root.classList.toggle('crt-on', prefs.crt);
    setSfxEnabled(prefs.sound);
    setSfxVolume(prefs.volume / 100);
  }, [prefs]);

  // volume do player sincronizado com a preferência salva
  useEffect(() => {
    player.setVolume(prefs.musicVolume);
  }, [prefs.musicVolume]);

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);
  const togglePref = useCallback((key: BoolPref) => setPrefs((p) => ({ ...p, [key]: !p[key] })), []);
  const resetPrefs = useCallback(() => setPrefs(DEFAULT_PREFS), []);

  const value = useMemo(() => ({ prefs, setPref, togglePref, resetPrefs }), [prefs, setPref, togglePref, resetPrefs]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): PrefsCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('usePrefs fora do PrefsProvider');
  return c;
}
