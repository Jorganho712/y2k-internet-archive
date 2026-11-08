import { useState } from 'react';
import { usePrefs, type Prefs } from '../lib/prefs';
import { sfx } from '../audio/sfx';
import { DraggableWindow } from './Window';
import { Icon } from './Icon';

export type SettingsTab = 'aparencia' | 'som' | 'geral';

const WALLPAPERS: { id: Prefs['wallpaper']; label: string }[] = [
  { id: 'colinas', label: 'Colinas Verdes' },
  { id: 'nuvens', label: 'Céu Azul' },
  { id: 'classico', label: 'Verde-azulado clássico' },
  { id: 'matrix', label: 'Chuva de Código' },
];

/** Painel de controle: preferências do visitante (salvas no navegador). */
export function SettingsWindow({ tab: initialTab, onClose, z, onFocus }: { tab: SettingsTab; onClose: () => void; z: number; onFocus: () => void }) {
  const { prefs, setPref, togglePref, resetPrefs } = usePrefs();
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [nick, setNick] = useState(prefs.nickname);
  const [saved, setSaved] = useState(false);

  const apply = () => {
    setPref('nickname', nick.trim().slice(0, 24));
    setSaved(true);
    sfx.ding();
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <DraggableWindow
      title="Painel de Controle - Propriedades"
      icon={<Icon name="gear" size={16} />}
      initial={{ x: Math.max(8, window.innerWidth / 2 - 210), y: 60 }}
      width={420}
      z={z}
      onFocus={onFocus}
      onClose={onClose}
      maximizable={false}
      className="settings-win"
    >
      <div className="tabs" role="tablist">
        {(
          [
            ['aparencia', 'Aparência'],
            ['som', 'Sons'],
            ['geral', 'Geral'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`tab ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        {tab === 'aparencia' && (
          <>
            <div className={`settings-preview wp-${prefs.wallpaper}`} aria-hidden="true">
              <div className="settings-preview-win">
                <span />
              </div>
            </div>
            <fieldset className="groupbox">
              <legend>Tema das janelas</legend>
              <label className="radio">
                <input type="radio" name="theme" checked={prefs.theme === 'xp'} onChange={() => setPref('theme', 'xp')} /> Windows XP (Luna azul)
              </label>
              <label className="radio">
                <input type="radio" name="theme" checked={prefs.theme === '98'} onChange={() => setPref('theme', '98')} /> Windows 98 (clássico)
              </label>
            </fieldset>
            <fieldset className="groupbox">
              <legend>Papel de parede</legend>
              <select className="field" value={prefs.wallpaper} onChange={(e) => setPref('wallpaper', e.target.value as Prefs['wallpaper'])} aria-label="Papel de parede">
                {WALLPAPERS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </fieldset>
            <label className="check">
              <input type="checkbox" checked={prefs.crt} onChange={() => togglePref('crt')} /> Efeito de monitor CRT (linhas de varredura)
            </label>
            <label className="check">
              <input type="checkbox" checked={prefs.cursor} onChange={() => togglePref('cursor')} /> Cursor retrô em pixel
            </label>
          </>
        )}
        {tab === 'som' && (
          <>
            <label className="check">
              <input type="checkbox" checked={prefs.sound} onChange={() => togglePref('sound')} /> Ativar efeitos sonoros e notificações
            </label>
            <fieldset className="groupbox">
              <legend>Volume dos efeitos</legend>
              <div className="slider-row">
                <Icon name="mute" size={18} />
                <input type="range" min={0} max={100} value={prefs.volume} onChange={(e) => setPref('volume', Number(e.target.value))} aria-label="Volume dos efeitos" />
                <Icon name="speaker" size={18} />
                <span className="slider-val">{prefs.volume}%</span>
              </div>
            </fieldset>
            <fieldset className="groupbox">
              <legend>Testar sons</legend>
              <div className="btn-row">
                <button type="button" className="btn" onClick={sfx.startup} disabled={!prefs.sound}>Inicialização</button>
                <button type="button" className="btn" onClick={sfx.ding} disabled={!prefs.sound}>Nova mensagem</button>
                <button type="button" className="btn" onClick={sfx.error} disabled={!prefs.sound}>Erro</button>
                <button type="button" className="btn" onClick={sfx.nudge} disabled={!prefs.sound}>Chamar atenção</button>
              </div>
              {!prefs.sound && <p className="hint">Ative os efeitos sonoros para testar.</p>}
            </fieldset>
          </>
        )}
        {tab === 'geral' && (
          <>
            <fieldset className="groupbox">
              <legend>Seu apelido</legend>
              <div className="inline-form">
                <input className="field" value={nick} maxLength={24} onChange={(e) => setNick(e.target.value)} placeholder="ex: ~*Gatinha_2004*~" aria-label="Apelido" />
                <button type="button" className="btn" onClick={apply}>
                  Aplicar
                </button>
              </div>
              {saved && <p className="hint ok">✓ Apelido salvo!</p>}
            </fieldset>
            <label className="check">
              <input type="checkbox" checked={prefs.skipBoot} onChange={() => togglePref('skipBoot')} /> Pular a conexão discada ao abrir o site
            </label>
            <label className="check">
              <input type="checkbox" checked={prefs.popups} onChange={() => togglePref('popups')} /> Permitir pop-ups automáticos (simulados)
            </label>
            <fieldset className="groupbox">
              <legend>Restaurar</legend>
              <p className="hint">Suas preferências ficam salvas apenas neste navegador.</p>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  resetPrefs();
                  setNick('');
                }}
              >
                Restaurar padrões
              </button>
            </fieldset>
          </>
        )}
      </div>
      <div className="dialog-buttons">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </DraggableWindow>
  );
}
