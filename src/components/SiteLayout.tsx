import type { ReactNode } from 'react';
import { Link } from '../lib/router';
import { SECTIONS } from '../data/sections';
import { AnimatedLogo, Marquee, RainbowRule } from './Retro';
import { Icon } from './Icon';

/** Moldura do "portal 2003": cabeçalho, navegação, rodapé e webring. */
export function SiteLayout({ route, children }: { route: string; children: ReactNode }) {
  const idx = SECTIONS.findIndex((s) => s.path === route);
  const prev = SECTIONS[(Math.max(idx, 0) - 1 + SECTIONS.length) % SECTIONS.length];
  const next = SECTIONS[(Math.max(idx, 0) + 1) % SECTIONS.length];

  return (
    <div className="site">
      {route !== '/' && (
        <header className="site-header">
          <Link to="/" className="site-header-logo" aria-label="Voltar para o início">
            <AnimatedLogo size="small" />
          </Link>
          <Marquee speed={28}>
            ★ Bem-vindo ao Y2K Internet Archive ★ Atualizado toda semana (quase) ★ Assine o Guestbook! ★ Melhor visualizado em 1024x768 ★ Não esqueça de desligar o telefone da linha ★
          </Marquee>
        </header>
      )}
      <nav className="site-nav" aria-label="Seções">
        {SECTIONS.map((s) => (
          <Link key={s.path} to={s.path} className={`nav-btn ${s.path === route ? 'is-current' : ''}`} aria-current={s.path === route ? 'page' : undefined}>
            <Icon name={s.icon} size={18} />
            <span>{s.title}</span>
          </Link>
        ))}
      </nav>

      <main className="site-main page-enter">{children}</main>

      <footer className="site-footer">
        <RainbowRule />
        <div className="webring">
          <Link to={prev.path} className="webring-btn">
            « {prev.title}
          </Link>
          <span className="webring-label">
            <Icon name="globe" size={16} /> WebRing Nostalgia BR
          </span>
          <Link to={next.path} className="webring-btn">
            {next.title} »
          </Link>
        </div>
        <p className="footer-best">
          <span className="best-viewed">Best viewed at 1024x768</span> · Feito com muito Bloco de Notas · © 1998-2010 Y2K Internet Archive
        </p>
        <p className="footer-small">Museu de fã sem fins lucrativos. Marcas citadas pertencem a seus donos. Ícones do Windows XP © Microsoft, usados apenas como homenagem nostálgica.</p>
      </footer>
    </div>
  );
}
