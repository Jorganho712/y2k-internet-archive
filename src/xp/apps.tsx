import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { KEYS, loadJSON, saveJSON } from '../lib/storage';
import { MenuBar } from '../components/MenuBar';
import { Icon, type IconName } from '../components/Icon';
import { sfx } from '../audio/sfx';
import { navigate } from '../lib/router';

export type AppId = 'computer' | 'docs' | 'recycle' | 'notepad' | 'paint' | 'mines' | 'calc' | 'cmd' | 'ie' | 'winamp' | 'help';

export interface AppDef {
  id: AppId;
  title: string;
  icon: IconName;
  width: number;
  height?: number;
}

export const APPS: Record<AppId, AppDef> = {
  computer: { id: 'computer', title: 'Meu Computador', icon: 'computer', width: 440, height: 330 },
  docs: { id: 'docs', title: 'Meus Documentos', icon: 'folder', width: 420, height: 300 },
  recycle: { id: 'recycle', title: 'Lixeira', icon: 'recycle', width: 420, height: 300 },
  notepad: { id: 'notepad', title: 'Bloco de Notas', icon: 'notepad', width: 440, height: 320 },
  paint: { id: 'paint', title: 'Paint', icon: 'paint', width: 500, height: 400 },
  mines: { id: 'mines', title: 'Campo Minado', icon: 'mine', width: 250 },
  calc: { id: 'calc', title: 'Calculadora', icon: 'calc', width: 240 },
  cmd: { id: 'cmd', title: 'Prompt de Comando', icon: 'cmd', width: 480, height: 300 },
  ie: { id: 'ie', title: 'Internet Explorer', icon: 'ie', width: 0 },
  winamp: { id: 'winamp', title: 'Winamp', icon: 'music', width: 0 },
  help: { id: 'help', title: 'Ajuda e Suporte', icon: 'help', width: 400, height: 300 },
};

export interface AppProps {
  open: (id: AppId, arg?: string) => void;
  close: () => void;
  arg?: string;
}

/* ---------------- Bloco de Notas ---------------- */
const DEFAULT_DOCS: Record<string, string> = {
  'leia-me.txt': 'Bem-vindo ao Windows do Y2K Internet Archive!\r\n\r\n- Arraste as janelas pela barra de título.\r\n- Use o menu Iniciar para abrir programas.\r\n- Este texto pode ser editado e salvo (fica guardado no seu navegador).\r\n\r\nDivirta-se! :)',
  'minha-nota.txt': '',
  'senhas_NAO_ABRIR.txt': 'haha, você abriu! Nunca guarde senhas em arquivos de texto ;)',
};

export function loadDocs(): Record<string, string> {
  return { ...DEFAULT_DOCS, ...loadJSON<Record<string, string>>(KEYS.notepad, {}) };
}

export function Notepad({ arg, close }: AppProps) {
  const [file, setFile] = useState(arg ?? 'minha-nota.txt');
  const [text, setText] = useState(() => loadDocs()[arg ?? 'minha-nota.txt'] ?? '');
  const [wrap, setWrap] = useState(true);
  const [status, setStatus] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const save = () => {
    const docs = loadJSON<Record<string, string>>(KEYS.notepad, {});
    docs[file] = text;
    saveJSON(KEYS.notepad, docs);
    setStatus(`Salvo em C:\\Meus Documentos\\${file}`);
    sfx.ding();
  };

  return (
    <div className="xp-notepad">
      <MenuBar
        menus={[
          {
            label: 'Arquivo',
            items: [
              {
                label: 'Novo',
                onClick: () => {
                  setFile(`nota-${Date.now().toString().slice(-4)}.txt`);
                  setText('');
                  setStatus('Novo documento');
                },
              },
              { label: 'Salvar', shortcut: 'Ctrl+S', onClick: save },
              { separator: true, label: '' },
              { label: 'Sair', onClick: close },
            ],
          },
          {
            label: 'Editar',
            items: [
              { label: 'Selecionar tudo', shortcut: 'Ctrl+A', onClick: () => ref.current?.select() },
              { label: 'Hora/Data', shortcut: 'F5', onClick: () => setText((t) => `${t}${new Date().toLocaleString('pt-BR')}`) },
            ],
          },
          { label: 'Formatar', items: [{ label: 'Quebra automática de linha', checked: wrap, onClick: () => setWrap(!wrap) }] },
        ]}
      />
      <textarea
        ref={ref}
        className="xp-notepad-text"
        value={text}
        spellCheck={false}
        style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre', overflowX: wrap ? 'hidden' : 'auto' }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            save();
          }
        }}
        aria-label={`Conteúdo de ${file}`}
      />
      <div className="xp-app-status">
        {file} {status && `· ${status}`}
      </div>
    </div>
  );
}

/* ---------------- Paint ---------------- */
const PAINT_COLORS = ['#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ccff00', '#7b2cff', '#ff6ec7', '#ff8c00'];

export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'spray'>('pencil');
  const drawing = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current?.getContext('2d');
    if (!c) return;
    c.fillStyle = '#fff';
    c.fillRect(0, 0, 480, 300);
  }, []);

  const pos = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 480, y: ((e.clientY - r.top) / r.height) * 300 };
  };

  const paint = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const c = canvasRef.current?.getContext('2d');
    if (!c) return;
    if (tool === 'spray') {
      c.fillStyle = color;
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * size * 4;
        c.fillRect(to.x + Math.cos(a) * r, to.y + Math.sin(a) * r, 1, 1);
      }
      return;
    }
    c.strokeStyle = tool === 'eraser' ? '#fff' : color;
    c.lineWidth = tool === 'eraser' ? size * 4 : size;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);
    c.stroke();
  };

  const clear = () => {
    const c = canvasRef.current?.getContext('2d');
    if (!c) return;
    c.fillStyle = '#fff';
    c.fillRect(0, 0, 480, 300);
  };

  const download = () => {
    const url = canvasRef.current?.toDataURL('image/png');
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-desenho-y2k.png';
    a.click();
  };

  return (
    <div className="xp-paint">
      <MenuBar
        menus={[
          {
            label: 'Arquivo',
            items: [
              { label: 'Novo (limpar)', onClick: clear },
              { label: 'Salvar como PNG...', onClick: download },
            ],
          },
          {
            label: 'Imagem',
            items: [
              { label: 'Limpar imagem', onClick: clear },
              {
                label: 'Inverter cores',
                onClick: () => {
                  const c = canvasRef.current?.getContext('2d');
                  if (!c) return;
                  const img = c.getImageData(0, 0, 480, 300);
                  for (let i = 0; i < img.data.length; i += 4) {
                    img.data[i] = 255 - img.data[i];
                    img.data[i + 1] = 255 - img.data[i + 1];
                    img.data[i + 2] = 255 - img.data[i + 2];
                  }
                  c.putImageData(img, 0, 0);
                },
              },
            ],
          },
        ]}
      />
      <div className="xp-paint-main">
        <div className="xp-paint-tools" role="toolbar" aria-label="Ferramentas">
          {(
            [
              ['pencil', '✏', 'Lápis'],
              ['spray', '💨', 'Spray'],
              ['eraser', '▭', 'Borracha'],
            ] as const
          ).map(([id, ic, label]) => (
            <button key={id} type="button" title={label} aria-label={label} aria-pressed={tool === id} className={tool === id ? 'is-active' : ''} onClick={() => setTool(id)}>
              {ic}
            </button>
          ))}
          {[2, 4, 8].map((s) => (
            <button key={s} type="button" title={`Tamanho ${s}`} aria-label={`Tamanho ${s}`} className={size === s ? 'is-active' : ''} onClick={() => setSize(s)}>
              <span className="xp-dot" style={{ width: s + 2, height: s + 2 }} />
            </button>
          ))}
        </div>
        <div className="xp-paint-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={480}
            height={300}
            className="xp-paint-canvas"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = pos(e);
              drawing.current = p;
              paint(p, { x: p.x + 0.1, y: p.y + 0.1 });
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const p = pos(e);
              paint(drawing.current, p);
              drawing.current = p;
            }}
            onPointerUp={() => (drawing.current = null)}
            onPointerCancel={() => (drawing.current = null)}
            aria-label="Área de desenho"
          />
        </div>
      </div>
      <div className="xp-paint-palette">
        <span className="xp-current-color" style={{ background: color }} aria-label="Cor atual" />
        {PAINT_COLORS.map((c) => (
          <button key={c} type="button" style={{ background: c }} onClick={() => setColor(c)} aria-label={`Cor ${c}`} className={color === c ? 'is-active' : ''} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Calculadora ---------------- */
export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const compute = (a: number, b: number, o: string) => (o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : b === 0 ? NaN : a / b);
  const fmt = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 1e10) / 1e10) : 'Não é possível dividir por zero');

  const digit = (d: string) => {
    if (fresh || display === '0' || display.startsWith('Não')) {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (!(d === '.' && display.includes('.')) && display.length < 16) setDisplay(display + d);
  };
  const operator = (o: string) => {
    const cur = parseFloat(display);
    if (acc !== null && op && !fresh) {
      const r = compute(acc, cur, op);
      setAcc(r);
      setDisplay(fmt(r));
    } else setAcc(cur);
    setOp(o);
    setFresh(true);
  };
  const equals = () => {
    if (acc === null || !op) return;
    const r = compute(acc, parseFloat(display), op);
    setDisplay(fmt(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };
  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const keys: [string, () => void, string?][] = [
    ['C', clear, 'red'], ['CE', () => setDisplay('0'), 'red'], ['←', () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), 'red'], ['/', () => operator('/'), 'red'],
    ['7', () => digit('7')], ['8', () => digit('8')], ['9', () => digit('9')], ['*', () => operator('*'), 'red'],
    ['4', () => digit('4')], ['5', () => digit('5')], ['6', () => digit('6')], ['-', () => operator('-'), 'red'],
    ['1', () => digit('1')], ['2', () => digit('2')], ['3', () => digit('3')], ['+', () => operator('+'), 'red'],
    ['±', () => setDisplay(fmt(-parseFloat(display)))], ['0', () => digit('0')], [',', () => digit('.')], ['=', equals, 'red'],
  ];

  const onKey = (e: KeyboardEvent) => {
    if (/^[0-9]$/.test(e.key)) digit(e.key);
    else if (['+', '-', '*', '/'].includes(e.key)) operator(e.key);
    else if (e.key === 'Enter' || e.key === '=') equals();
    else if (e.key === 'Escape') clear();
    else if (e.key === '.' || e.key === ',') digit('.');
    else return;
    e.preventDefault();
  };

  return (
    <div className="xp-calc" tabIndex={0} onKeyDown={onKey}>
      <div className="xp-calc-display" aria-live="polite">
        {display.replace('.', ',')}
      </div>
      <div className="xp-calc-keys">
        {keys.map(([label, fn, cls]) => (
          <button key={label} type="button" className={`btn xp-calc-key ${cls ?? ''}`} onClick={fn}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Prompt de Comando ---------------- */
export function Cmd({ open, close }: AppProps) {
  const [lines, setLines] = useState<string[]>(['Microsoft Windows XP [Versão 5.1.2600] (simulado)', '(C) Copyright 1985-2001 — Y2K Internet Archive.', '', 'Digite HELP para ver os comandos.', '']);
  const [input, setInput] = useState('');
  const [color, setColor] = useState('#c0c0c0');
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    const [cmd, ...rest] = raw.trim().split(/\s+/);
    const arg = rest.join(' ');
    const out: string[] = [];
    switch ((cmd ?? '').toLowerCase()) {
      case '':
        break;
      case 'help':
      case 'ajuda':
        out.push('Comandos disponíveis:', '  DIR        Lista arquivos', '  CLS        Limpa a tela', '  VER        Versão do sistema', '  DATE/TIME  Data e hora', '  ECHO texto Repete o texto', '  COLOR x    Cor do texto (a=verde, b=ciano, e=amarelo, f=branco, 7=cinza)', '  IPCONFIG   Configuração de rede', '  PING host  Testa conexão', '  START prog Abre: notepad, paint, calc, mines, winmine', '  EXIT       Fecha o prompt');
        break;
      case 'dir':
        out.push(' O volume na unidade C é Y2K_ARCHIVE', '', ' Pasta de C:\\Meus Documentos', '', ...Object.keys(loadDocs()).map((f) => `07/11/2003  21:04          ${String(loadDocs()[f].length).padStart(6)} ${f}`), `               ${Object.keys(loadDocs()).length} arquivo(s)`);
        break;
      case 'cls':
        setLines([]);
        return;
      case 'ver':
        out.push('Microsoft Windows XP [Versão 5.1.2600] — edição Museu');
        break;
      case 'date':
        out.push(`Data atual: ${new Date().toLocaleDateString('pt-BR')}`);
        break;
      case 'time':
        out.push(`Hora atual: ${new Date().toLocaleTimeString('pt-BR')}`);
        break;
      case 'echo':
        out.push(arg || 'ECHO está ativado.');
        break;
      case 'color': {
        const map: Record<string, string> = { a: '#3cff3c', b: '#00e5ff', e: '#ffff55', f: '#ffffff', '7': '#c0c0c0', d: '#ff6ec7' };
        if (map[arg.toLowerCase()]) setColor(map[arg.toLowerCase()]);
        else out.push('Uso: COLOR a | b | d | e | f | 7');
        break;
      }
      case 'ipconfig':
        out.push('Configuração de IP do Windows', '', 'Adaptador PPP Discada:', '   Endereço IP. . . . . . . : 200.158.42.13', '   Máscara de sub-rede . . .: 255.255.255.255', '   Gateway padrão. . . . . .: 200.158.42.13', '   Velocidade . . . . . . . : 53,3 kbps');
        break;
      case 'ping':
        if (!arg) out.push('Uso: PING nome-do-host');
        else
          out.push(`Disparando contra ${arg} com 32 bytes de dados:`, ...[312, 289, 401, 355].map((t) => `Resposta de ${arg}: bytes=32 tempo=${t}ms TTL=52`), '', 'Média = 339ms (é discada, né?)');
        break;
      case 'start': {
        const m: Record<string, Parameters<typeof open>[0]> = { notepad: 'notepad', paint: 'paint', mspaint: 'paint', calc: 'calc', mines: 'mines', winmine: 'mines' };
        if (m[arg.toLowerCase()]) {
          open(m[arg.toLowerCase()]);
          out.push(`Iniciando ${arg}...`);
        } else out.push(`O sistema não pode encontrar o arquivo '${arg}'.`);
        break;
      }
      case 'exit':
        close();
        return;
      default:
        out.push(`'${cmd}' não é reconhecido como um comando interno`, 'ou externo, um programa operável ou um arquivo em lotes.');
    }
    setLines((l) => [...l, `C:\\Meus Documentos>${raw}`, ...out, '']);
  };

  return (
    <div className="xp-cmd" ref={boxRef} style={{ color }} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      {lines.map((l, i) => (
        <div key={i}>{l || '\u00a0'}</div>
      ))}
      <form
        className="xp-cmd-line"
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          if (input.trim()) setHist((h) => [input, ...h].slice(0, 20));
          setHi(-1);
          setInput('');
        }}
      >
        <span>C:\Meus Documentos&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && hist.length) {
              e.preventDefault();
              const n = Math.min(hist.length - 1, hi + 1);
              setHi(n);
              setInput(hist[n]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              const n = Math.max(-1, hi - 1);
              setHi(n);
              setInput(n === -1 ? '' : hist[n]);
            }
          }}
          style={{ color }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          aria-label="Comando"
        />
      </form>
    </div>
  );
}

/* ---------------- Explorador de arquivos ---------------- */
export function MyComputer({ open }: AppProps) {
  const drives = [
    { name: 'Disquete de 3½ (A:)', icon: 'floppy' as const, used: 0, total: 1.44, unit: 'MB' },
    { name: 'Disco local (C:)', icon: 'drive' as const, used: 14.2, total: 20, unit: 'GB' },
    { name: 'Unidade de CD (D:)', icon: 'cd' as const, used: 0, total: 0, unit: '' },
  ];
  return (
    <div className="xp-explorer">
      <aside className="xp-explorer-side">
        <div className="xp-side-box">
          <b>Tarefas do sistema</b>
          <button type="button" onClick={() => open('help')}>Exibir informações do sistema</button>
          <button type="button" onClick={() => open('cmd')}>Abrir Prompt de Comando</button>
        </div>
        <div className="xp-side-box">
          <b>Outros locais</b>
          <button type="button" onClick={() => open('docs')}>Meus Documentos</button>
          <button type="button" onClick={() => open('recycle')}>Lixeira</button>
        </div>
      </aside>
      <div className="xp-explorer-main">
        <h5>Unidades de disco</h5>
        {drives.map((d) => (
          <button key={d.name} type="button" className="xp-file-row" onDoubleClick={() => d.icon === 'drive' && open('docs')} onClick={(e) => (e.nativeEvent as PointerEvent).pointerType === 'touch' && d.icon === 'drive' && open('docs')}>
            <Icon name={d.icon} size={32} />
            <span>
              <b>{d.name}</b>
              {d.total > 0 ? (
                <>
                  <span className="xp-disk-bar">
                    <span style={{ width: `${(d.used / d.total) * 100}%` }} />
                  </span>
                  <small>
                    {(d.total - d.used).toFixed(1)} {d.unit} livres de {d.total} {d.unit}
                  </small>
                </>
              ) : (
                <small>Nenhum disco inserido</small>
              )}
            </span>
          </button>
        ))}
        <h5>Sistema</h5>
        <p className="xp-sysinfo">Pentium III 733 MHz · 128 MB de RAM · Modem 56k · Placa de vídeo 16 MB · Windows XP (simulado)</p>
      </div>
    </div>
  );
}

export function MyDocuments({ open }: AppProps) {
  const docs = Object.keys(loadDocs());
  const items: { name: string; icon: IconName; action: () => void }[] = [
    ...docs.map((d) => ({ name: d, icon: 'doc' as IconName, action: () => open('notepad', d) })),
    { name: 'desenho.bmp', icon: 'paint', action: () => open('paint') },
    { name: 'campo_minado.exe', icon: 'mine', action: () => open('mines') },
    { name: 'Minhas Músicas', icon: 'folder', action: () => open('winamp') },
  ];
  return (
    <div className="xp-explorer-main xp-grid-files">
      {items.map((it) => (
        <button
          key={it.name}
          type="button"
          className="xp-file-tile"
          onDoubleClick={it.action}
          onClick={(e) => (e.nativeEvent as PointerEvent).pointerType === 'touch' && it.action()}
          onKeyDown={(e) => e.key === 'Enter' && it.action()}
          title="Clique duas vezes para abrir"
        >
          <Icon name={it.icon} size={32} />
          <span>{it.name}</span>
        </button>
      ))}
    </div>
  );
}

const DEFAULT_TRASH = ['trabalho_escola_FINAL_final2.doc', 'foto_formatura_borrada.jpg', 'musica_baixada_errada.mp3', 'nao_abra.exe', 'atalho para Kazaa.lnk'];

export function RecycleBin() {
  const [items, setItems] = useState<string[]>(() => loadJSON(KEYS.recycle, DEFAULT_TRASH));
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState('');
  const update = (next: string[]) => {
    setItems(next);
    saveJSON(KEYS.recycle, next);
  };
  return (
    <div className="xp-recycle">
      <div className="xp-recycle-bar">
        <button type="button" className="btn" disabled={!items.length} onClick={() => setConfirm(true)}>
          Esvaziar Lixeira
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            update(DEFAULT_TRASH);
            setMsg('Itens de exemplo recolocados na Lixeira.');
          }}
        >
          Repor exemplos
        </button>
      </div>
      {confirm && (
        <div className="xp-confirm" role="alertdialog">
          <Icon name="warning" size={32} />
          <p>Tem certeza de que deseja excluir permanentemente estes {items.length} itens?</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              update([]);
              setConfirm(false);
              sfx.boom();
              setMsg('Lixeira esvaziada.');
            }}
          >
            Sim
          </button>
          <button type="button" className="btn" onClick={() => setConfirm(false)}>
            Não
          </button>
        </div>
      )}
      {msg && <p className="hint">{msg}</p>}
      {items.length === 0 ? (
        <p className="xp-empty">A Lixeira está vazia.</p>
      ) : (
        <ul className="xp-trash-list">
          {items.map((it) => (
            <li key={it}>
              <Icon name="doc" size={20} />
              <span>{it}</span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  update(items.filter((x) => x !== it));
                  setMsg(`"${it}" foi restaurado. (Ele volta para o lugar de onde nunca deveria ter saído.)`);
                }}
              >
                Restaurar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Help() {
  return (
    <div className="xp-help">
      <h4>Central de Ajuda e Suporte</h4>
      <ul>
        <li>Arraste as janelas pela barra de título azul.</li>
        <li>Use — □ × para minimizar, maximizar e fechar.</li>
        <li>Janelas minimizadas aparecem na barra de tarefas do simulador.</li>
        <li>No celular, toque uma vez nos ícones para abrir.</li>
        <li>O Bloco de Notas salva textos no seu navegador.</li>
        <li>
          Quer o Internet Explorer de verdade? Ele é a janela onde este museu está aberto!{' '}
          <button type="button" className="small-link as-button" onClick={() => navigate('/')}>
            Ir para o início
          </button>
        </li>
      </ul>
    </div>
  );
}
