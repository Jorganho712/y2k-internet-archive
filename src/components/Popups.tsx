import type { ReactNode } from 'react';
import { DraggableWindow } from './Window';
import { Icon } from './Icon';
import { Blink } from './Retro';
import { navigate } from '../lib/router';

export interface PopupDef {
  id: number;
  kind: number;
  x: number;
  y: number;
}

interface Kind {
  title: string;
  icon: Parameters<typeof Icon>[0]['name'];
  className: string;
  body: ReactNode;
  actions: { label: string; to?: string }[];
}

/** Paródias de pop-ups dos anos 2000 — tudo inofensivo e claramente simulado. */
export const POPUP_KINDS: Kind[] = [
  {
    title: '!!! PARABÉNS !!!',
    icon: 'star',
    className: 'popup-winner',
    body: (
      <>
        <p className="popup-big">
          <Blink>VOCÊ É O VISITANTE Nº 1.000.000!</Blink>
        </p>
        <p>Clique abaixo para resgatar seu prêmio imaginário: um mouse de bolinha usado e muita nostalgia.</p>
      </>
    ),
    actions: [{ label: 'Resgatar prêmio' }, { label: 'Agora não' }],
  },
  {
    title: 'Aviso do Sistema',
    icon: 'warning',
    className: 'popup-ram',
    body: (
      <>
        <p className="popup-big">Seu computador está LENTO?</p>
        <p>Detectamos que você está navegando com apenas 128 MB de RAM. Experimente fechar o Winamp, o MSN e as 14 janelas do Internet Explorer.</p>
      </>
    ),
    actions: [{ label: 'Entendi' }],
  },
  {
    title: 'Nova mensagem no Guestbook',
    icon: 'mail',
    className: 'popup-mail',
    body: <p>Alguém pode ter deixado um recado para você no livro de visitas. Que tal assinar também?</p>,
    actions: [{ label: 'Abrir Guestbook', to: '/guestbook' }, { label: 'Fechar' }],
  },
  {
    title: 'Atualização disponível',
    icon: 'info',
    className: 'popup-update',
    body: (
      <>
        <p>Uma nova versão do <b>Plug-in de Animações</b> está disponível.</p>
        <p className="popup-small">(Relaxa: isso é só uma lembrança. Nada será baixado.)</p>
      </>
    ),
    actions: [{ label: 'Lembrar mais tarde' }],
  },
  {
    title: 'MSN Messenger',
    icon: 'buddy',
    className: 'popup-msn',
    body: <p><b>~*~Juh~*~</b> acabou de entrar e quer conversar com você!</p>,
    actions: [{ label: 'Abrir conversa', to: '/msn' }, { label: 'Ignorar' }],
  },
];

export function PopupLayer({ popups, onClose, baseZ }: { popups: PopupDef[]; onClose: (id: number) => void; baseZ: number }) {
  return (
    <>
      {popups.map((p, i) => {
        const k = POPUP_KINDS[p.kind % POPUP_KINDS.length];
        return (
          <DraggableWindow
            key={p.id}
            title={k.title}
            icon={<Icon name={k.icon} size={16} />}
            initial={{ x: p.x, y: p.y }}
            width={300}
            z={baseZ + i}
            maximizable={false}
            onClose={() => onClose(p.id)}
            className={`popup ${k.className}`}
          >
            <div className="popup-body">
              <Icon name={k.icon} size={40} />
              <div>{k.body}</div>
            </div>
            <div className="dialog-buttons">
              {k.actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="btn"
                  onClick={() => {
                    onClose(p.id);
                    if (a.to) navigate(a.to);
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </DraggableWindow>
        );
      })}
    </>
  );
}
