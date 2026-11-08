import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GALLERY, GALLERY_CATS, type GalleryItem } from '../data/gallery';
import { AnimatedSprite, PixelArt } from '../components/PixelArt';
import { Flames, Hourglass, MailGif, NewBadge, SpinningGlobe, UnderConstruction } from '../components/Retro';
import { WindowFrame } from '../components/Window';
import { Icon } from '../components/Icon';
import { sfx } from '../audio/sfx';

function Art({ item, scale }: { item: GalleryItem; scale: number }) {
  if (item.gif) {
    switch (item.gif) {
      case 'construction':
        return <UnderConstruction small={scale < 8} />;
      case 'globe':
        return <SpinningGlobe size={scale * 14} />;
      case 'flames':
        return <Flames count={scale < 8 ? 8 : 16} />;
      case 'mail':
        return <MailGif />;
      case 'new':
        return <NewBadge>NOVO!</NewBadge>;
      case 'hourglass':
        return <Hourglass />;
    }
  }
  if (!item.sprite) return null;
  return item.animated ? (
    <AnimatedSprite sprite={item.sprite} scale={scale} speed={0.5} label={item.title} />
  ) : (
    <PixelArt sprite={item.sprite} scale={scale} recolor={item.recolor} label={item.title} />
  );
}

export default function Gallery() {
  const [cat, setCat] = useState<(typeof GALLERY_CATS)[number]>('Tudo');
  const [view, setView] = useState<number | null>(null);
  const list = cat === 'Tudo' ? GALLERY : GALLERY.filter((g) => g.cat === cat);
  const current = view !== null ? list[view] : null;

  useEffect(() => {
    if (view === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setView((v) => (v === null ? v : (v + 1) % list.length));
      if (e.key === 'ArrowLeft') setView((v) => (v === null ? v : (v - 1 + list.length) % list.length));
      if (e.key === 'Escape') setView(null);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [view, list.length]);

  return (
    <div className="page">
      <div className="page-title-row">
        <Icon name="picture" size={48} />
        <div>
          <h2 className="page-title">Galeria Nostálgica</h2>
          <p className="page-sub">Aparelhos, memes e GIFs que definiram uma geração — redesenhados pixel a pixel.</p>
        </div>
      </div>

      <div className="filter-row">
        {GALLERY_CATS.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${cat === c ? 'is-active' : ''}`}
            onClick={() => {
              setCat(c);
              setView(null);
            }}
            aria-pressed={cat === c}
          >
            {c} {c !== 'Tudo' && <small>({GALLERY.filter((g) => g.cat === c).length})</small>}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {list.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className="gallery-thumb"
            onClick={() => {
              sfx.open();
              setView(i);
            }}
          >
            <span className="gallery-art">
              <Art item={item} scale={4} />
            </span>
            <span className="gallery-caption">
              {item.title}
              <small>{item.year}</small>
            </span>
          </button>
        ))}
      </div>

      {current && view !== null && createPortal(
        <div className="modal-layer viewer-layer" onClick={(e) => e.target === e.currentTarget && setView(null)}>
          <WindowFrame
            title={`${current.title}.gif - Visualizador de Imagens e Fax`}
            icon={<Icon name="picture" size={16} />}
            onClose={() => setView(null)}
            className="viewer"
          >
            <div className="viewer-stage">
              <Art item={current} scale={12} />
            </div>
            <div className="viewer-info">
              <h4>
                {current.title} <small>({current.year})</small>
              </h4>
              <p>{current.desc}</p>
              <p className="hint">Categoria: {current.cat} · Imagem {view + 1} de {list.length}</p>
            </div>
            <div className="viewer-toolbar">
              <button type="button" className="btn" onClick={() => setView((view - 1 + list.length) % list.length)}>
                ◀ Anterior
              </button>
              <button type="button" className="btn" onClick={() => setView((view + 1) % list.length)}>
                Próxima ▶
              </button>
              <button type="button" className="btn" onClick={() => setView(null)}>
                Fechar
              </button>
            </div>
          </WindowFrame>
        </div>,
        document.body,
      )}
    </div>
  );
}
