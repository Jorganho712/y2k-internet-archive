import { memo, useMemo } from 'react';
import { SPRITES, type SpriteName } from '../data/sprites';

interface PixelArtProps {
  sprite: SpriteName;
  scale?: number;
  /** Substitui cores da paleta (variações de cor). */
  recolor?: Record<string, string>;
  className?: string;
  label?: string;
}

/** Renderiza pixel art a partir de grades de texto, agrupando pixels em faixas horizontais. */
export const PixelArt = memo(function PixelArt({ sprite, scale = 4, recolor, className, label }: PixelArtProps) {
  const def = SPRITES[sprite];
  const frame = def.frames[0];
  return (
    <svg
      className={`pixel-art ${className ?? ''}`}
      width={def.w * scale}
      height={def.h * scale}
      viewBox={`0 0 ${def.w} ${def.h}`}
      shapeRendering="crispEdges"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Frame rows={frame} palette={{ ...def.palette, ...recolor }} />
    </svg>
  );
});

/** Sprite de 2 quadros alternados via CSS (sem JavaScript por quadro). */
export const AnimatedSprite = memo(function AnimatedSprite({
  sprite,
  scale = 4,
  speed = 0.6,
  className,
  label,
}: {
  sprite: SpriteName;
  scale?: number;
  speed?: number;
  className?: string;
  label?: string;
}) {
  const def = SPRITES[sprite];
  return (
    <span
      className={`anim-sprite ${className ?? ''}`}
      style={{ width: def.w * scale, height: def.h * scale, ['--spd' as string]: `${speed}s` }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {def.frames.map((rows, i) => (
        <svg
          key={i}
          className={`frame frame-${i}`}
          width={def.w * scale}
          height={def.h * scale}
          viewBox={`0 0 ${def.w} ${def.h}`}
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          <Frame rows={rows} palette={def.palette} />
        </svg>
      ))}
    </span>
  );
});

function Frame({ rows, palette }: { rows: string[]; palette: Record<string, string> }) {
  const rects = useMemo(() => {
    const out: { x: number; y: number; w: number; c: string }[] = [];
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === '.' || !palette[ch]) {
          x++;
          continue;
        }
        let w = 1;
        while (row[x + w] === ch) w++;
        out.push({ x, y, w, c: palette[ch] });
        x += w;
      }
    });
    return out;
  }, [rows, palette]);
  return (
    <>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.c} />
      ))}
    </>
  );
}
