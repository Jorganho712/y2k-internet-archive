import { useState, type ReactNode } from 'react';

export type IconName =
  | 'computer' | 'globe' | 'ie' | 'folder' | 'notepad' | 'paint' | 'mine' | 'calc' | 'cmd' | 'recycle'
  | 'recycleFull' | 'music' | 'joystick' | 'buddy' | 'picture' | 'book' | 'home' | 'gear' | 'help'
  | 'power' | 'user' | 'doc' | 'drive' | 'floppy' | 'cd' | 'search' | 'warning' | 'error' | 'info'
  | 'speaker' | 'mute' | 'network' | 'star' | 'mail' | 'logoff';

/** Ícones vetoriais desenhados à mão no estilo Windows 98/XP (sem arquivos externos). */
const ICONS: Record<IconName, ReactNode> = {
  computer: (
    <>
      <rect x="4" y="3" width="24" height="18" rx="1.5" fill="#e8e4d4" stroke="#6b6553" />
      <rect x="7" y="6" width="18" height="12" fill="url(#gScreen)" stroke="#333" strokeWidth=".6" />
      <path d="M9 8h6M9 10h4" stroke="#bff" strokeWidth="1" />
      <rect x="12" y="21" width="8" height="3" fill="#cfc9b4" />
      <rect x="6" y="24" width="20" height="5" rx="1" fill="#e8e4d4" stroke="#6b6553" />
      <rect x="20" y="26" width="4" height="1" fill="#2a2" />
    </>
  ),
  globe: (
    <>
      <circle cx="16" cy="16" r="12" fill="url(#gGlobe)" stroke="#0a3d91" />
      <path d="M9 9c3 2 4 1 6 3s-1 4 1 6 4 0 5 3M20 6c-1 2 0 3 2 4s3 3 2 5" stroke="#6c3" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="16" rx="12" ry="5" fill="none" stroke="#bfefff" strokeOpacity=".6" />
      <path d="M3 22c8-6 18-12 27-11" stroke="#ffd400" strokeWidth="2" fill="none" />
    </>
  ),
  ie: (
    <>
      <circle cx="16" cy="16" r="12" fill="url(#gGlobe)" stroke="#0a3d91" />
      <path d="M3 22c8-6 18-12 27-11" stroke="#ffd400" strokeWidth="2" fill="none" />
    </>
  ),
  folder: (
    <>
      <path d="M3 8h9l3 3h14v15H3z" fill="#e8b830" stroke="#9a7413" />
      <path d="M3 13h26v13H3z" fill="#ffd968" stroke="#9a7413" />
    </>
  ),
  notepad: (
    <>
      <rect x="6" y="4" width="20" height="25" fill="#fff" stroke="#556" />
      <rect x="6" y="4" width="20" height="4" fill="#4aa3ff" />
      {[12, 16, 20, 24].map((y) => (
        <path key={y} d={`M9 ${y}h14`} stroke="#9ab" />
      ))}
      {[9, 13, 17, 21].map((x) => (
        <circle key={x} cx={x} cy="4" r="1.3" fill="#888" />
      ))}
    </>
  ),
  paint: (
    <>
      <path d="M16 4C8 4 3 9 3 15c0 5 4 6 7 5 3-1 4 2 3 4-1 3 1 5 5 5 7 0 11-6 11-13S23 4 16 4z" fill="#f6e7c1" stroke="#8a6d3b" />
      <circle cx="10" cy="11" r="2" fill="#e22" />
      <circle cx="16" cy="9" r="2" fill="#2a2" />
      <circle cx="22" cy="12" r="2" fill="#22e" />
      <circle cx="23" cy="19" r="2" fill="#fc0" />
      <path d="M27 2L15 20l2 2L29 4z" fill="#a05a2c" stroke="#5a2e10" strokeWidth=".6" />
    </>
  ),
  mine: (
    <>
      <rect x="2" y="2" width="28" height="28" fill="#c0c0c0" stroke="#808080" />
      <path d="M16 5v22M5 16h22M8 8l16 16M24 8L8 24" stroke="#000" strokeWidth="2" />
      <circle cx="16" cy="16" r="7" fill="#000" />
      <rect x="12" y="12" width="3" height="3" fill="#fff" />
    </>
  ),
  calc: (
    <>
      <rect x="6" y="3" width="20" height="26" rx="2" fill="#d4d0c8" stroke="#555" />
      <rect x="9" y="6" width="14" height="5" fill="#cfe8c8" stroke="#555" strokeWidth=".6" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={9 + c * 5} y={14 + r * 4.5} width="4" height="3.5" fill={c === 2 && r === 2 ? '#e44' : '#fff'} stroke="#777" strokeWidth=".5" />),
      )}
    </>
  ),
  cmd: (
    <>
      <rect x="3" y="5" width="26" height="22" fill="#000" stroke="#888" />
      <rect x="3" y="5" width="26" height="4" fill="#0a246a" />
      <path d="M6 14l4 3-4 3" stroke="#ccc" strokeWidth="1.6" fill="none" />
      <path d="M12 21h7" stroke="#ccc" strokeWidth="1.6" />
    </>
  ),
  recycle: (
    <>
      <path d="M8 9h16l-2 20H10z" fill="#d8e8f0" stroke="#5a7a8a" />
      <rect x="6" y="6" width="20" height="3" rx="1" fill="#b8cfda" stroke="#5a7a8a" />
      <path d="M13 13v12M16 13v12M19 13v12" stroke="#8aa" />
    </>
  ),
  recycleFull: (
    <>
      <path d="M8 9h16l-2 20H10z" fill="#d8e8f0" stroke="#5a7a8a" />
      <path d="M9 6l6-3 4 4 5-1v4H8z" fill="#fff" stroke="#999" strokeWidth=".6" />
      <rect x="11" y="4" width="6" height="5" fill="#ffd968" transform="rotate(-15 14 6)" />
      <path d="M13 13v12M16 13v12M19 13v12" stroke="#8aa" />
    </>
  ),
  music: (
    <>
      <rect x="3" y="3" width="26" height="26" rx="4" fill="url(#gAmp)" stroke="#222" />
      <path d="M13 22V10l10-2v12" stroke="#ffcc00" strokeWidth="2" fill="none" />
      <circle cx="11" cy="22" r="3" fill="#ffcc00" />
      <circle cx="21" cy="20" r="3" fill="#ffcc00" />
    </>
  ),
  joystick: (
    <>
      <path d="M5 22h22l2 6H3z" fill="#333" stroke="#000" />
      <rect x="15" y="9" width="2.5" height="13" fill="#666" />
      <circle cx="16.2" cy="8" r="5" fill="#e22" stroke="#900" />
      <circle cx="14.5" cy="6.5" r="1.4" fill="#fff" fillOpacity=".7" />
      <circle cx="24" cy="24" r="1.8" fill="#ccff00" />
    </>
  ),
  buddy: (
    <>
      <circle cx="11" cy="10" r="5" fill="#3cba3c" stroke="#196619" />
      <path d="M3 27c0-7 4-11 8-11s8 4 8 11z" fill="#3cba3c" stroke="#196619" />
      <circle cx="21" cy="12" r="5" fill="#3b8bff" stroke="#14468f" />
      <path d="M13 29c0-7 4-11 8-11s8 4 8 11z" fill="#3b8bff" stroke="#14468f" />
    </>
  ),
  picture: (
    <>
      <rect x="3" y="5" width="26" height="22" fill="#8b5a2b" />
      <rect x="6" y="8" width="20" height="16" fill="#9ad8ff" />
      <circle cx="21" cy="12" r="2.5" fill="#ffe14d" />
      <path d="M6 24l6-8 4 5 3-3 7 6z" fill="#3a9a3a" />
    </>
  ),
  book: (
    <>
      <path d="M5 5h18a3 3 0 013 3v20H8a3 3 0 01-3-3z" fill="#7b2cff" stroke="#3b0f85" />
      <path d="M8 25h18v3H8a1.5 1.5 0 010-3z" fill="#fff" stroke="#3b0f85" strokeWidth=".6" />
      <path d="M11 10h11M11 14h8" stroke="#ccff00" strokeWidth="1.6" />
    </>
  ),
  home: (
    <>
      <path d="M3 16L16 4l13 12h-4v12H7V16z" fill="#fff3d6" stroke="#8a5a2b" />
      <path d="M3 16L16 4l13 12" stroke="#c0392b" strokeWidth="3" fill="none" />
      <rect x="13" y="19" width="6" height="9" fill="#2a6bd1" />
    </>
  ),
  gear: (
    <>
      <circle cx="16" cy="16" r="9" fill="#9aa" stroke="#455" strokeWidth="5" strokeDasharray="3.5 3.5" />
      <circle cx="16" cy="16" r="8" fill="#c8d0d8" stroke="#455" />
      <circle cx="16" cy="16" r="3" fill="#fff" stroke="#455" />
    </>
  ),
  help: (
    <>
      <circle cx="16" cy="16" r="12" fill="url(#gHelp)" stroke="#0a3d91" />
      <text x="16" y="22" textAnchor="middle" fontSize="17" fontWeight="bold" fill="#fff" fontFamily="Georgia, serif">?</text>
    </>
  ),
  power: (
    <>
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#e0472b" stroke="#8a1f0c" />
      <path d="M11 10a8 8 0 1010 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M16 7v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
  logoff: (
    <>
      <rect x="3" y="3" width="26" height="26" rx="5" fill="#f2b632" stroke="#8a5a0c" />
      <path d="M12 9h-3v14h3M14 16h10M20 12l4 4-4 4" stroke="#fff" strokeWidth="2.4" fill="none" />
    </>
  ),
  user: (
    <>
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#ffcf5c" stroke="#fff" strokeWidth="2" />
      <circle cx="16" cy="13" r="5" fill="#d1495b" />
      <path d="M6 28c1-6 5-8 10-8s9 2 10 8z" fill="#2f7ed8" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h13l6 6v20H7z" fill="#fff" stroke="#556" />
      <path d="M20 3v6h6" fill="#dde" stroke="#556" />
      {[13, 17, 21, 25].map((y) => (
        <path key={y} d={`M10 ${y}h13`} stroke="#7a8aa0" />
      ))}
    </>
  ),
  drive: (
    <>
      <rect x="3" y="11" width="26" height="12" rx="2" fill="#d4d0c8" stroke="#555" />
      <rect x="6" y="15" width="12" height="3" fill="#888" />
      <circle cx="24" cy="17" r="1.5" fill="#2c2" />
    </>
  ),
  floppy: (
    <>
      <path d="M4 4h21l3 3v21H4z" fill="#2b3a67" stroke="#111" />
      <rect x="9" y="4" width="13" height="8" fill="#c9ccd3" />
      <rect x="17" y="5" width="3" height="6" fill="#2b3a67" />
      <rect x="7" y="16" width="18" height="12" fill="#fff" />
    </>
  ),
  cd: (
    <>
      <circle cx="16" cy="16" r="12" fill="url(#gCd)" stroke="#777" />
      <circle cx="16" cy="16" r="3" fill="#fff" stroke="#999" />
    </>
  ),
  search: (
    <>
      <circle cx="13" cy="13" r="8" fill="#cfefff" stroke="#246" strokeWidth="2.5" />
      <path d="M19 19l9 9" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  warning: (
    <>
      <path d="M16 3l14 25H2z" fill="#ffd400" stroke="#7a6200" />
      <rect x="14.5" y="11" width="3" height="9" fill="#000" />
      <rect x="14.5" y="22" width="3" height="3" fill="#000" />
    </>
  ),
  error: (
    <>
      <circle cx="16" cy="16" r="13" fill="#e02020" stroke="#7a0000" />
      <path d="M10 10l12 12M22 10L10 22" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  info: (
    <>
      <circle cx="16" cy="16" r="13" fill="#fff" stroke="#1450c8" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1450c8" fontFamily="Georgia, serif">i</text>
    </>
  ),
  speaker: (
    <>
      <path d="M5 12h5l7-6v20l-7-6H5z" fill="#ddd" stroke="#333" />
      <path d="M21 11c2 2 2 8 0 10M24 8c4 4 4 12 0 16" stroke="#333" strokeWidth="2" fill="none" />
    </>
  ),
  mute: (
    <>
      <path d="M5 12h5l7-6v20l-7-6H5z" fill="#ddd" stroke="#333" />
      <path d="M21 12l7 8M28 12l-7 8" stroke="#d00" strokeWidth="2.6" />
    </>
  ),
  network: (
    <>
      <rect x="2" y="6" width="13" height="10" fill="#cde" stroke="#345" />
      <rect x="17" y="16" width="13" height="10" fill="#cde" stroke="#345" />
      <path d="M8 16v6h9" stroke="#345" strokeWidth="2" fill="none" />
    </>
  ),
  star: <path d="M16 2l4 9 10 1-7.5 7 2.5 10-9-5.5L7 29l2.5-10L2 12l10-1z" fill="#ffd400" stroke="#a07800" />,
  mail: (
    <>
      <rect x="3" y="7" width="26" height="18" fill="#fffbe6" stroke="#8a6d3b" />
      <path d="M3 7l13 10L29 7" stroke="#8a6d3b" fill="none" />
    </>
  ),
};

/** Ícones que têm imagem em public/icons/<nome>.png. Os demais usam o desenho SVG. */
const IMAGE_ICONS = new Set<IconName>([
  'computer', 'globe', 'ie', 'folder', 'notepad', 'paint', 'calc', 'cmd', 'recycle', 'recycleFull', 'music',
  'joystick', 'buddy', 'picture', 'book', 'home', 'gear', 'help', 'power', 'logoff', 'doc', 'drive', 'floppy',
  'cd', 'search', 'warning', 'error', 'info', 'speaker', 'mute', 'network', 'star', 'mail',
]);

export function Icon({ name, size = 32, title }: { name: IconName; size?: number; title?: string }) {
  const [failed, setFailed] = useState(false);
  if (IMAGE_ICONS.has(name) && !failed) {
    return (
      <img
        className="icon icon-img"
        src={`${import.meta.env.BASE_URL}icons/${name}.png`}
        width={size}
        height={size}
        alt={title ?? ''}
        title={title}
        draggable={false}
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {ICONS[name]}
    </svg>
  );
}

/** Gradientes compartilhados por todos os ícones (montado uma vez no App). */
export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a8bff" />
          <stop offset="1" stopColor="#002f8f" />
        </linearGradient>
        <radialGradient id="gGlobe" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#9fe3ff" />
          <stop offset=".6" stopColor="#2a7de1" />
          <stop offset="1" stopColor="#0a3d91" />
        </radialGradient>
        <linearGradient id="gAmp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a5a" />
          <stop offset="1" stopColor="#111118" />
        </linearGradient>
        <radialGradient id="gHelp" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#7fb8ff" />
          <stop offset="1" stopColor="#1450c8" />
        </radialGradient>
        <linearGradient id="gCd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0e0ff" />
          <stop offset=".3" stopColor="#ffd6f5" />
          <stop offset=".5" stopColor="#c8fff0" />
          <stop offset=".7" stopColor="#fff6c8" />
          <stop offset="1" stopColor="#d0d0d8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
