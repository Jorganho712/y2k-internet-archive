import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CONTACTS, EMOTICONS, STATUS_LABEL, emotify, type Contact, type Status } from '../data/msn';
import { usePrefs } from '../lib/prefs';
import { KEYS, loadJSON, saveJSON } from '../lib/storage';
import { useMediaQuery } from '../lib/hooks';
import { sfx } from '../audio/sfx';
import { DraggableWindow, WindowFrame } from '../components/Window';
import { Icon } from '../components/Icon';

interface Msg {
  from: 'them' | 'me' | 'system';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  msgs: Msg[];
  typing: boolean;
  shake: number;
  z: number;
  minimized: boolean;
}

interface Toast {
  id: number;
  contact: string;
  text: string;
}

interface MsnSave {
  signedIn: boolean;
  status: Status;
  personal: string;
}

const hhmm = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function Msn() {
  const { prefs, setPref } = usePrefs();
  const [save, setSave] = useState<MsnSave>(() => loadJSON(KEYS.msn, { signedIn: false, status: 'online', personal: 'Saudades de 2004...' }));
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => Object.fromEntries(CONTACTS.map((c) => [c.id, c.status])));
  const [chats, setChats] = useState<Chat[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const zTop = useRef(20);
  const toastId = useRef(0);
  const pendingRef = useRef<Record<string, Msg[]>>({});
  const chatsRef = useRef(chats);
  chatsRef.current = chats;
  const narrow = useMediaQuery('(max-width: 760px)');

  useEffect(() => saveJSON(KEYS.msn, save), [save]);

  const toast = (contact: string, text: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t.slice(-2), { id, contact, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  };

  // eventos simulados depois de entrar
  useEffect(() => {
    if (!save.signedIn) return;
    const timers = [
      window.setTimeout(() => {
        setStatuses((s) => ({ ...s, bia: 'online' }));
        sfx.online();
        toast('bia', 'acabou de entrar.');
      }, 9000),
      window.setTimeout(() => {
        const juh = CONTACTS[0];
        if (!chatsRef.current.some((c) => c.id === juh.id)) {
          sfx.ding();
          toast(juh.id, 'diz: tá aí?? :P');
          setUnread((u) => ({ ...u, [juh.id]: (u[juh.id] ?? 0) + 1 }));
          pendingRef.current[juh.id] = [...(pendingRef.current[juh.id] ?? []), { from: 'them', text: 'tá aí?? :P', time: hhmm() }];
        }
      }, 16000),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [save.signedIn]);

  const openChat = (id: string) => {
    sfx.open();
    zTop.current += 1;
    const z = zTop.current;
    setUnread((u) => ({ ...u, [id]: 0 }));
    setChats((cs) => {
      const existing = cs.find((c) => c.id === id);
      if (existing) return cs.map((c) => (c.id === id ? { ...c, z, minimized: false } : c));
      const contact = CONTACTS.find((c) => c.id === id)!;
      const msgs: Msg[] = [...contact.history, ...(pendingRef.current[id] ?? [])];
      if (statuses[id] === 'offline') msgs.push({ from: 'system', text: `${contact.nick} está offline. As mensagens serão entregues quando entrar.`, time: hhmm() });
      pendingRef.current[id] = [];
      return [...(narrow ? [] : cs.slice(-2)), { id, msgs, typing: false, shake: 0, z, minimized: false }];
    });
  };

  const focusChat = (id: string) => {
    zTop.current += 1;
    const z = zTop.current;
    setChats((cs) => cs.map((c) => (c.id === id && c.z !== z ? { ...c, z } : c)));
  };

  const send = (id: string, text: string) => {
    const contact = CONTACTS.find((c) => c.id === id)!;
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, msgs: [...c.msgs, { from: 'me', text, time: hhmm() }] } : c)));
    sfx.key();
    if (statuses[id] === 'offline' || contact.replies.length === 0) return;
    const typingDelay = 700 + Math.random() * 900;
    window.setTimeout(() => setChats((cs) => cs.map((c) => (c.id === id ? { ...c, typing: true } : c))), typingDelay);
    window.setTimeout(
      () => {
        const reply = contact.replies[Math.floor(Math.random() * contact.replies.length)];
        setChats((cs) => cs.map((c) => (c.id === id ? { ...c, typing: false, msgs: [...c.msgs, { from: 'them', text: reply, time: hhmm() }] } : c)));
        sfx.ding();
      },
      typingDelay + 1200 + Math.random() * 1500,
    );
  };

  const nudge = (id: string) => {
    sfx.nudge();
    setChats((cs) =>
      cs.map((c) => (c.id === id ? { ...c, shake: c.shake + 1, msgs: [...c.msgs, { from: 'system', text: 'Você chamou a atenção!', time: hhmm() }] } : c)),
    );
    const contact = CONTACTS.find((c) => c.id === id)!;
    if (statuses[id] !== 'offline' && contact.replies.length) {
      window.setTimeout(() => {
        sfx.nudge();
        setChats((cs) =>
          cs.map((c) => (c.id === id ? { ...c, shake: c.shake + 1, msgs: [...c.msgs, { from: 'system', text: `${contact.nick} chamou a sua atenção de volta!`, time: hhmm() }] } : c)),
        );
      }, 2500);
    }
  };

  if (!save.signedIn) {
    return (
      <div className="page">
        <MsnHeader />
        <div className="msn-area msn-signin-area">
          <WindowFrame title="Mensageiro Y2K" icon={<Icon name="buddy" size={16} />} className="msn-signin">
            <SignIn
              initialNick={prefs.nickname}
              onSignIn={(nick, status) => {
                if (nick && nick !== prefs.nickname) setPref('nickname', nick);
                sfx.online();
                setSave((s) => ({ ...s, signedIn: true, status }));
              }}
            />
          </WindowFrame>
        </div>
      </div>
    );
  }

  const online = CONTACTS.filter((c) => statuses[c.id] !== 'offline');
  const offline = CONTACTS.filter((c) => statuses[c.id] === 'offline');

  return (
    <div className="page">
      <MsnHeader />
      <div className="msn-area">
        <WindowFrame title="Mensageiro Y2K" icon={<Icon name="buddy" size={16} />} className="msn-list" role="region">
          <div className="msn-me">
            <span className="msn-avatar" style={{ ['--av' as string]: '#3b8bff' }}>
              <Icon name="user" size={44} />
            </span>
            <div className="msn-me-info">
              <b>{prefs.nickname || 'Visitante'}</b>
              <select
                className="msn-status-select"
                value={save.status}
                onChange={(e) => setSave((s) => ({ ...s, status: e.target.value as Status }))}
                aria-label="Seu status"
              >
                {(['online', 'ocupado', 'ausente'] as Status[]).map((s) => (
                  <option key={s} value={s}>
                    ({STATUS_LABEL[s]})
                  </option>
                ))}
                <option value="offline">(Aparecer offline)</option>
              </select>
              <input
                className="msn-personal"
                value={save.personal}
                maxLength={60}
                onChange={(e) => setSave((s) => ({ ...s, personal: e.target.value }))}
                aria-label="Mensagem pessoal"
                placeholder="<Digite uma mensagem pessoal>"
              />
            </div>
          </div>
          <div className="msn-groups">
            <ContactGroup title={`Online (${online.length})`} list={online} statuses={statuses} unread={unread} onOpen={openChat} />
            <ContactGroup title={`Offline (${offline.length})`} list={offline} statuses={statuses} unread={unread} onOpen={openChat} />
          </div>
          <div className="msn-list-foot">
            <button type="button" className="btn" onClick={() => setSave((s) => ({ ...s, signedIn: false }))}>
              Sair
            </button>
            <span className="hint">Clique duas vezes num contato para conversar</span>
          </div>
        </WindowFrame>

        <div className="msn-chats">
          {chats.length === 0 && (
            <div className="msn-empty">
              <Icon name="buddy" size={48} />
              <p>Escolha um contato para abrir uma conversa.</p>
            </div>
          )}
          {chats.map((chat, i) => {
            const contact = CONTACTS.find((c) => c.id === chat.id)!;
            return (
              <ChatWindow
                key={chat.id}
                chat={chat}
                contact={contact}
                status={statuses[chat.id]}
                myNick={prefs.nickname || 'Visitante'}
                index={i}
                startMax={narrow}
                onFocus={() => focusChat(chat.id)}
                onClose={() => setChats((cs) => cs.filter((c) => c.id !== chat.id))}
                onSend={(t) => send(chat.id, t)}
                onNudge={() => nudge(chat.id)}
              />
            );
          })}
        </div>

        <div className="msn-toasts" aria-live="polite">
          {toasts.map((t) => {
            const c = CONTACTS.find((x) => x.id === t.contact)!;
            return (
              <button key={t.id} type="button" className="msn-toast" onClick={() => openChat(t.contact)}>
                <Icon name="buddy" size={24} />
                <span>
                  <b>{c.nick}</b> {t.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MsnHeader() {
  return (
    <div className="page-title-row">
      <Icon name="buddy" size={48} />
      <div>
        <h2 className="page-title">MSN Messenger (simulação)</h2>
        <p className="page-sub">Contatos fictícios, conversas de demonstração e muitos "chamar a atenção". Nada é enviado pela internet.</p>
      </div>
    </div>
  );
}

function SignIn({ initialNick, onSignIn }: { initialNick: string; onSignIn: (nick: string, status: Status) => void }) {
  const [nick, setNick] = useState(initialNick);
  const [status, setStatus] = useState<Status>('online');
  const [signing, setSigning] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSigning(true);
    window.setTimeout(() => onSignIn(nick.trim().slice(0, 24), status), 1400);
  };
  return (
    <form className="msn-signin-form" onSubmit={submit}>
      <div className="msn-signin-logo" aria-hidden="true">
        <Icon name="buddy" size={72} />
      </div>
      {signing ? (
        <p className="msn-signing">
          <span className="msn-spin" aria-hidden="true">
            <Icon name="buddy" size={28} />
          </span>
          Entrando...
        </p>
      ) : (
        <>
          <label htmlFor="msn-nick">Nome de exibição:</label>
          <input id="msn-nick" className="field" value={nick} maxLength={24} onChange={(e) => setNick(e.target.value)} placeholder="~*Seu nick aqui*~" />
          <label htmlFor="msn-status">Status:</label>
          <select id="msn-status" className="field" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="online">Online</option>
            <option value="ocupado">Ocupado</option>
            <option value="ausente">Ausente</option>
          </select>
          <button type="submit" className="btn btn-primary msn-signin-btn">
            Entrar
          </button>
          <p className="hint">Simulação: não pedimos e-mail nem senha.</p>
        </>
      )}
    </form>
  );
}

function ContactGroup({
  title,
  list,
  statuses,
  unread,
  onOpen,
}: {
  title: string;
  list: Contact[];
  statuses: Record<string, Status>;
  unread: Record<string, number>;
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="msn-group">
      <button type="button" className="msn-group-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? '▼' : '▶'} {title}
      </button>
      {open && (
        <ul>
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`msn-contact ${unread[c.id] ? 'has-unread' : ''}`}
                onDoubleClick={() => onOpen(c.id)}
                onClick={(e) => (e.nativeEvent as PointerEvent).pointerType !== 'mouse' && onOpen(c.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(c.id)}
                title="Clique duas vezes para conversar"
              >
                <span className={`msn-dot st-${statuses[c.id]}`} aria-label={STATUS_LABEL[statuses[c.id]]} />
                <span className="msn-contact-text">
                  <span className="msn-contact-nick">{emotify(c.nick)}</span>
                  {statuses[c.id] !== 'online' && statuses[c.id] !== 'offline' && <span className="msn-contact-st"> ({STATUS_LABEL[statuses[c.id]]})</span>}
                  {c.message && <span className="msn-contact-msg"> - {c.message}</span>}
                </span>
                {unread[c.id] ? <span className="msn-badge">{unread[c.id]}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChatWindow({
  chat,
  contact,
  status,
  myNick,
  index,
  startMax,
  onFocus,
  onClose,
  onSend,
  onNudge,
}: {
  chat: Chat;
  contact: Contact;
  status: Status;
  myNick: string;
  index: number;
  startMax: boolean;
  onFocus: () => void;
  onClose: () => void;
  onSend: (t: string) => void;
  onNudge: () => void;
}) {
  const [text, setText] = useState('');
  const [emo, setEmo] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [chat.msgs.length, chat.typing]);

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <DraggableWindow
      title={`${contact.nick} - Conversa`}
      icon={<Icon name="buddy" size={16} />}
      initial={{ x: 20 + index * 36, y: 10 + index * 30 }}
      width={420}
      height={440}
      z={chat.z}
      shake={chat.shake}
      startMaximized={startMax}
      onFocus={onFocus}
      onClose={onClose}
      className="msn-chat"
    >
      <div className="msn-chat-to">
        Para: <b>{emotify(contact.nick)}</b> &lt;{contact.email}&gt;
        <span className={`msn-dot st-${status}`} /> {STATUS_LABEL[status]}
      </div>
      <div className="msn-chat-body">
        <div className="msn-log" ref={logRef} aria-live="polite">
          {chat.msgs.map((m, i) =>
            m.from === 'system' ? (
              <p key={i} className="msn-sys">
                — {m.text}
              </p>
            ) : (
              <div key={i} className="msn-msg">
                <span className="msn-msg-who">
                  {m.from === 'me' ? myNick : emotify(contact.nick)} diz ({m.time}):
                </span>
                <span className="msn-msg-text" style={m.from === 'them' ? { color: contact.color } : undefined}>
                  {emotify(m.text)}
                </span>
              </div>
            ),
          )}
        </div>
        <span className="msn-chat-avatar" style={{ ['--av' as string]: contact.color }} aria-hidden="true">
          <Icon name="user" size={56} />
        </span>
      </div>
      <div className="msn-typing">{chat.typing ? `${contact.nick} está digitando uma mensagem...` : ' '}</div>
      <div className="msn-tools">
        <button type="button" className="msn-tool" onClick={() => setEmo(!emo)} aria-expanded={emo}>
          😊 Emoticons
        </button>
        <button type="button" className="msn-tool" onClick={onNudge}>
          📳 Chamar a atenção
        </button>
      </div>
      {emo && (
        <div className="msn-emo-grid">
          {EMOTICONS.map(([code, e]) => (
            <button
              key={code}
              type="button"
              title={code}
              onClick={() => {
                setText((t) => `${t}${code}`);
                setEmo(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <form className="msn-input" onSubmit={submit}>
        <textarea
          className="field"
          value={text}
          rows={2}
          maxLength={400}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
          aria-label="Mensagem"
          placeholder="Digite sua mensagem... (L) vira coração!"
        />
        <button type="submit" className="btn msn-send" disabled={!text.trim()}>
          Enviar
        </button>
      </form>
    </DraggableWindow>
  );
}
