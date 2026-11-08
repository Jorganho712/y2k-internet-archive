import { createContext, useContext } from 'react';
import { KEYS, loadJSON, saveJSON } from './storage';

export interface ShellApi {
  openSettings: (tab?: 'aparencia' | 'som' | 'geral') => void;
  openAbout: () => void;
  showPopup: () => void;
  reconnect: () => void;
  shutdown: () => void;
  openBrowser: (path?: string) => void;
}

export const ShellContext = createContext<ShellApi | null>(null);

export function useShell(): ShellApi {
  const c = useContext(ShellContext);
  if (!c) throw new Error('useShell fora do Shell');
  return c;
}

/** Visitas registradas por este navegador, somadas ao acervo histórico simulado. */
const HISTORIC_VISITS = 1_998_204;
let registered = false;

export function registerVisit(): number {
  const data = loadJSON<{ count: number }>(KEYS.visits, { count: 0 });
  if (!registered) {
    registered = true;
    let isNewSession = true;
    try {
      isNewSession = !sessionStorage.getItem('y2k:session');
      sessionStorage.setItem('y2k:session', '1');
    } catch {
      /* sem sessionStorage */
    }
    if (isNewSession) {
      data.count += 1;
      saveJSON(KEYS.visits, data);
    }
  }
  return HISTORIC_VISITS + data.count;
}

export function localVisitCount(): number {
  return loadJSON<{ count: number }>(KEYS.visits, { count: 0 }).count;
}
