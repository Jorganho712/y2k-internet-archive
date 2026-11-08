import { memo } from 'react';
import type { Track } from '../audio/tracks';

/** Capa de álbum gerada em SVG a partir da paleta de cada faixa. */
export const AlbumCover = memo(function AlbumCover({ track, size = 120 }: { track: Track; size?: number }) {
  const { from, to, accent, shape } = track.cover;
  const id = `cv-${track.id}`;
  return (
    <svg className="album-cover" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Capa do álbum ${track.album}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id})`} />
      {shape === 'sun' && (
        <>
          <circle cx="50" cy="58" r="24" fill={accent} opacity=".85" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="0" y={62 + i * 6} width="100" height="2.5" fill={from} />
          ))}
        </>
      )}
      {shape === 'grid' && (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={`v${i}`} d={`M${50 + (i - 4) * 4} 55 L${50 + (i - 4) * 22} 100`} stroke={accent} strokeWidth=".8" />
          ))}
          {[60, 67, 76, 88].map((y) => (
            <path key={y} d={`M0 ${y}H100`} stroke={accent} strokeWidth=".8" />
          ))}
          <path d="M0 55H100" stroke="#fff" strokeWidth="1" />
        </>
      )}
      {shape === 'disc' && (
        <>
          <rect x="22" y="18" width="56" height="62" fill="#1a1a2e" stroke={accent} />
          <rect x="34" y="18" width="30" height="20" fill="#c9ccd3" />
          <rect x="54" y="21" width="6" height="14" fill="#1a1a2e" />
          <rect x="30" y="50" width="40" height="28" fill="#fff" />
          <path d="M34 58h30M34 64h22" stroke={from} strokeWidth="2" />
        </>
      )}
      {shape === 'stars' && (
        <>
          {[[15, 20], [70, 15], [40, 40], [85, 55], [25, 70], [60, 80], [50, 25]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={i % 2 ? 2 : 3} height={i % 2 ? 2 : 3} fill={accent} />
          ))}
          <circle cx="72" cy="30" r="12" fill="#fff" opacity=".9" />
          <circle cx="77" cy="26" r="11" fill={from} />
        </>
      )}
      {shape === 'waves' && (
        <>
          {[40, 52, 64, 76].map((y, i) => (
            <path key={y} d={`M0 ${y} Q25 ${y - 8} 50 ${y} T100 ${y}`} stroke={accent} strokeWidth="2" fill="none" opacity={1 - i * 0.2} />
          ))}
        </>
      )}
      {shape === 'pixel' && (
        <>
          {Array.from({ length: 25 }, (_, i) => (
            <rect key={i} x={(i % 5) * 20} y={Math.floor(i / 5) * 20} width="20" height="20" fill={(i * 7) % 3 === 0 ? accent : 'transparent'} opacity=".7" />
          ))}
        </>
      )}
      <text x="6" y="12" fill="#fff" fontSize="8" fontFamily="Arial Black, Arial" fontWeight="bold">
        {track.artist.toUpperCase()}
      </text>
      <text x="6" y="94" fill="#fff" fontSize="7" fontFamily="Verdana, sans-serif">
        {track.album}
      </text>
    </svg>
  );
});
