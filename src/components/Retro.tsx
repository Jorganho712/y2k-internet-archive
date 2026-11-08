import type { CSSProperties, ReactNode } from 'react';
import { Link } from '../lib/router';
import { AnimatedSprite } from './PixelArt';

/* "GIFs" decorativos recriados em CSS/SVG: leves e nunca quebram. */

export function UnderConstruction({ small }: { small?: boolean }) {
  return (
    <div className={`gif-construction ${small ? 'is-small' : ''}`} role="img" aria-label="Página em construção">
      <span className="gif-construction-stripes" />
      <span className="gif-construction-text">
        <span className="gif-construction-worker" aria-hidden="true">
          <AnimatedSprite sprite="dancer" scale={2} speed={0.5} />
        </span>
        EM CONSTRUÇÃO
      </span>
      <span className="gif-construction-stripes" />
    </div>
  );
}

export function SpinningGlobe({ size = 56 }: { size?: number }) {
  return (
    <span className="gif-globe" style={{ width: size, height: size }} role="img" aria-label="Globo girando">
      <span className="gif-globe-map" />
      <span className="gif-globe-shine" />
    </span>
  );
}

export function MailGif() {
  return (
    <Link to="/guestbook" className="gif-mail" aria-label="Assine o guestbook">
      <span className="gif-mail-env" aria-hidden="true">
        <span className="gif-mail-flap" />
      </span>
      <span className="gif-mail-text">Assine meu livro!</span>
    </Link>
  );
}

export function NewBadge({ children = 'NOVO!' }: { children?: ReactNode }) {
  return <span className="gif-new">{children}</span>;
}

export function Flames({ count = 12 }: { count?: number }) {
  return (
    <div className="gif-flames" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ animationDelay: `${(i * 0.13) % 0.6}s` }} />
      ))}
    </div>
  );
}

export function Marquee({ children, speed = 22 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="marquee" role="marquee">
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </div>
    </div>
  );
}

export function RainbowRule() {
  return <hr className="rainbow-rule" />;
}

export function Hourglass() {
  return <span className="gif-hourglass" role="img" aria-label="Carregando" />;
}

export function Blink({ children }: { children: ReactNode }) {
  return <span className="blink">{children}</span>;
}

export function Sparkles({ children }: { children: ReactNode }) {
  return <span className="sparkles">{children}</span>;
}

/** Logo animada em estilo "WordArt" com letras ondulando. */
export function AnimatedLogo({ size = 'big' }: { size?: 'big' | 'small' }) {
  const line1 = 'Y2K';
  const line2 = 'INTERNET ARCHIVE';
  return (
    <h1 className={`logo logo-${size}`} aria-label="Y2K Internet Archive">
      <span className="logo-y2k" aria-hidden="true">
        {line1.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>
            {c}
          </span>
        ))}
      </span>
      <span className="logo-sub" aria-hidden="true">
        {line2.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </span>
    </h1>
  );
}

/** Contador estilo odômetro. */
export function HitCounter({ value, digits = 7 }: { value: number; digits?: number }) {
  const str = String(value).padStart(digits, '0');
  return (
    <span className="hit-counter" aria-label={`${value} visitas`}>
      {str.split('').map((d, i) => (
        <span key={i} className="hit-digit">
          {d}
        </span>
      ))}
    </span>
  );
}

/** Botão 88x31 dos sites antigos — sempre um link interno real. */
export function Badge88({
  to,
  top,
  bottom,
  colors,
  onClick,
}: {
  to?: string;
  top: string;
  bottom: string;
  colors: [string, string];
  onClick?: () => void;
}) {
  const style = { ['--b1' as string]: colors[0], ['--b2' as string]: colors[1] } as CSSProperties;
  const content = (
    <>
      <span className="badge88-top">{top}</span>
      <span className="badge88-bottom">{bottom}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className="badge88" style={style}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className="badge88" style={style} onClick={onClick}>
      {content}
    </button>
  );
}

export function Panel({ title, children, className = '', color }: { title: ReactNode; children: ReactNode; className?: string; color?: string }) {
  return (
    <section className={`panel ${className}`} style={color ? ({ ['--panel' as string]: color } as CSSProperties) : undefined}>
      <h3 className="panel-title">{title}</h3>
      <div className="panel-body">{children}</div>
    </section>
  );
}
