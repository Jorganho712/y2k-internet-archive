import { useEffect, useRef, useState } from 'react';
import { playDialup, sfx } from '../audio/sfx';
import { usePrefs } from '../lib/prefs';
import { WindowFrame } from './Window';
import { Icon } from './Icon';

type Phase = 'power' | 'bios' | 'dial' | 'connecting';

const STEPS = [
  { at: 0, text: 'Inicializando o modem...' },
  { at: 900, text: 'Discando 0800-756-1998...' },
  { at: 2600, text: 'Aguardando resposta do provedor...' },
  { at: 3800, text: 'Negociando protocolo V.90...' },
  { at: 5200, text: 'Verificando nome de usuário e senha...' },
  { at: 6300, text: 'Registrando o computador na rede...' },
  { at: 7200, text: 'Conectado a 53.333 bps!' },
];
const TOTAL = 8000;

const BIOS_LINES = [
  'Y2K BIOS v4.51PG, Um Ótimo BIOS de Verdade',
  'Copyright (C) 1998-2010, Y2K Internet Archive',
  '',
  'Processador: Pentium III 733 MHz',
  'Teste de memória: 131072K OK',
  'Detectando IDE Primário Mestre ... HD 20 GB',
  'Detectando IDE Primário Escravo ... CD-ROM 52x',
  'Modem US Robotics 56K ... OK',
  '',
  'Iniciando Windows...',
];

/** Tela de inicialização + conexão discada simulada. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const { prefs, setPref } = usePrefs();
  const [phase, setPhase] = useState<Phase>('power');
  const [biosCount, setBiosCount] = useState(0);
  const [mem, setMem] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stopSound = useRef<() => void>(() => undefined);

  // BIOS: imprime linhas progressivamente
  useEffect(() => {
    if (phase !== 'bios') return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setBiosCount(i);
      if (i > BIOS_LINES.length + 2) {
        window.clearInterval(id);
        setPhase('dial');
      }
    }, 170);
    let m = 0;
    const memId = window.setInterval(() => {
      m = Math.min(131072, m + 8192);
      setMem(m);
      if (m >= 131072) window.clearInterval(memId);
    }, 40);
    return () => {
      window.clearInterval(id);
      window.clearInterval(memId);
    };
  }, [phase]);

  // Conexão: avança o tempo
  useEffect(() => {
    if (phase !== 'connecting') return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const e = performance.now() - start;
      setElapsed(e);
      if (e >= TOTAL) {
        onDone();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, onDone]);

  useEffect(() => () => stopSound.current(), []);

  const powerOn = (withSound: boolean) => {
    setPref('sound', withSound);
    setPhase('bios');
  };

  const dial = () => {
    stopSound.current = playDialup();
    setPhase('connecting');
  };

  const skip = () => {
    stopSound.current();
    onDone();
  };

  const currentStep = [...STEPS].reverse().find((s) => elapsed >= s.at) ?? STEPS[0];
  const progress = Math.min(100, (elapsed / TOTAL) * 100);

  return (
    <div className={`boot boot-${phase}`}>
      {phase === 'power' && (
        <div className="boot-power">
          <div className="boot-monitor-led" aria-hidden="true" />
          <p className="boot-power-title">Y2K INTERNET ARCHIVE</p>
          <p className="boot-power-sub">Um museu interativo da internet de 1998 a 2010</p>
          <div className="boot-power-buttons">
            <button type="button" className="power-btn" onClick={() => powerOn(true)}>
              <span aria-hidden="true">⏻</span> Ligar com som
            </button>
            <button type="button" className="power-btn is-mute" onClick={() => powerOn(false)}>
              <span aria-hidden="true">⏻</span> Ligar sem som
            </button>
          </div>
          <p className="boot-hint">Os sons podem ser ligados ou desligados a qualquer momento na bandeja da barra de tarefas.</p>
          <button type="button" className="boot-skip-link" onClick={skip}>
            Pular introdução »
          </button>
        </div>
      )}

      {phase === 'bios' && (
        <div className="boot-bios" onClick={() => setPhase('dial')}>
          <div className="bios-energy" aria-hidden="true">
            <span>★</span> Energy Star
          </div>
          {BIOS_LINES.slice(0, biosCount).map((l, i) => (
            <div key={i}>{l.startsWith('Teste de memória') ? `Teste de memória: ${mem}K ${mem >= 131072 ? 'OK' : ''}` : l || ' '}</div>
          ))}
          <div className="bios-cursor">_</div>
          <div className="bios-foot">Pressione DEL para entrar no SETUP · Clique para pular</div>
        </div>
      )}

      {(phase === 'dial' || phase === 'connecting') && (
        <div className="boot-dial">
          <WindowFrame
            title={phase === 'dial' ? 'Conectar a Internet Discada' : 'Conectando a Internet Discada...'}
            icon={<Icon name="network" size={16} />}
            className="dial-window"
            onClose={skip}
          >
            <div className="dial-art" aria-hidden="true">
              <span className="dial-pc">
                <Icon name="computer" size={40} />
              </span>
              <span className={`dial-dots ${phase === 'connecting' ? 'is-on' : ''}`}>
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="dial-pc">
                <Icon name="globe" size={40} />
              </span>
            </div>
            {phase === 'dial' ? (
              <>
                <div className="form-grid">
                  <label htmlFor="dial-user">Nome de usuário:</label>
                  <input id="dial-user" className="field" readOnly value={prefs.nickname || 'visitante'} />
                  <label htmlFor="dial-pass">Senha:</label>
                  <input id="dial-pass" className="field" readOnly value="••••••••" aria-label="Senha simulada" />
                  <label htmlFor="dial-number">Discar:</label>
                  <input id="dial-number" className="field" readOnly value="0800-756-1998" />
                </div>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={prefs.sound}
                    onChange={(e) => setPref('sound', e.target.checked)}
                  />
                  Reproduzir o som do modem
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={prefs.skipBoot}
                    onChange={(e) => setPref('skipBoot', e.target.checked)}
                  />
                  Não mostrar esta conexão na próxima visita
                </label>
                <div className="dialog-buttons">
                  <button
                    type="button"
                    className="btn btn-primary"
                    autoFocus
                    onClick={() => {
                      sfx.click();
                      dial();
                    }}
                  >
                    Discar
                  </button>
                  <button type="button" className="btn" onClick={skip}>
                    Pular
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="dial-status" aria-live="polite">
                  {currentStep.text}
                </p>
                <div className="progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="dial-speed">
                  Velocidade: {Math.min(53333, Math.round((elapsed / TOTAL) * 56000)).toLocaleString('pt-BR')} bps · Bytes recebidos:{' '}
                  {Math.round(elapsed * 0.8).toLocaleString('pt-BR')}
                </p>
                <div className="dialog-buttons">
                  <button type="button" className="btn" onClick={skip}>
                    Pular
                  </button>
                </div>
              </>
            )}
          </WindowFrame>
        </div>
      )}
    </div>
  );
}

/** Tela "Agora é seguro desligar o computador". */
export function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div className="shutdown">
      {ready ? (
        <>
          <p className="shutdown-text">Agora é seguro desligar o computador.</p>
          <button type="button" className="power-btn" onClick={onRestart}>
            <span aria-hidden="true">⏻</span> Ligar novamente
          </button>
        </>
      ) : (
        <p className="shutdown-wait">Salvando suas configurações...</p>
      )}
    </div>
  );
}
