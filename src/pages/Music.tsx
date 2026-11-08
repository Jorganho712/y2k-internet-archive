import { useEffect, useRef } from 'react';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Square, Volume1, Volume2 } from 'lucide-react';
import { formatTime, player, usePlayer } from '../audio/player';
import { TRACKS, trackDuration } from '../audio/tracks';
import { usePrefs } from '../lib/prefs';
import { usePageVisible } from '../lib/hooks';
import { AlbumCover } from '../components/AlbumCover';
import { Panel } from '../components/Retro';
import { Icon } from '../components/Icon';

/** Visualizador de barras: só anima enquanto há música tocando. */
function Visualizer({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = usePageVisible();
  useEffect(() => {
    const c = ref.current?.getContext('2d');
    if (!c) return;
    const W = 152;
    const H = 40;
    const bars = 19;
    const peaks = new Array(bars).fill(0);
    const data = new Uint8Array(32);
    let raf = 0;
    const draw = () => {
      c.fillStyle = '#000';
      c.fillRect(0, 0, W, H);
      const an = player.analyser;
      if (an && playing) an.getByteFrequencyData(data);
      else data.fill(0);
      for (let i = 0; i < bars; i++) {
        const v = (data[i] ?? 0) / 255;
        const h = Math.round(v * (H - 2));
        peaks[i] = Math.max(h, peaks[i] - 1);
        for (let y = 0; y < h; y += 2) {
          const t = y / H;
          c.fillStyle = t > 0.75 ? '#ff3030' : t > 0.5 ? '#ffd400' : '#29d32a';
          c.fillRect(i * 8, H - y - 2, 6, 1);
        }
        c.fillStyle = '#c0c0c0';
        c.fillRect(i * 8, H - peaks[i] - 2, 6, 1);
      }
      if (playing && visible) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, visible]);
  return <canvas ref={ref} width={152} height={40} className="amp-vis" aria-hidden="true" />;
}

export default function Music() {
  const s = usePlayer();
  const { setPref } = usePrefs();
  const track = TRACKS[s.index];
  const pct = s.duration ? (s.elapsed / s.duration) * 100 : 0;

  const setVolume = (v: number) => {
    player.setVolume(v);
    setPref('musicVolume', v);
  };

  return (
    <div className="page">
      <div className="page-title-row">
        <Icon name="music" size={48} />
        <div>
          <h2 className="page-title">Música</h2>
          <p className="page-sub">Um player inspirado nos tocadores de MP3 de 2001, com trilhas chiptune originais geradas em tempo real. Nada toca sozinho.</p>
        </div>
      </div>

      <div className="music-layout">
        <div className="amp">
          <div className="amp-title">
            <span>Y2K AMP</span>
            <span className="amp-title-dots" aria-hidden="true" />
          </div>
          <div className="amp-main">
            <div className="amp-display">
              <div className="amp-status">
                <span className={`amp-state ${s.playing ? 'is-playing' : ''}`} aria-hidden="true">
                  {s.playing ? '▶' : s.elapsed > 0 ? '❚❚' : '■'}
                </span>
                <span className="amp-time" aria-label="Tempo decorrido">
                  {formatTime(s.elapsed)}
                </span>
              </div>
              <Visualizer playing={s.playing} />
            </div>
            <div className="amp-info">
              <div className="amp-marquee" aria-live="polite">
                <span className={s.playing ? 'is-scrolling' : ''}>
                  {s.index + 1}. {track.artist} - {track.title} ({formatTime(s.duration)}) *** {track.bpm} BPM *** {track.year} ***
                </span>
              </div>
              <div className="amp-specs">
                <span>128 kbps</span>
                <span>44 kHz</span>
                <span className={s.playing ? 'is-lit' : ''}>estéreo</span>
              </div>
            </div>
          </div>
          <input
            type="range"
            className="amp-seek"
            min={0}
            max={1000}
            value={Math.round(pct * 10)}
            onChange={(e) => player.seek(Number(e.target.value) / 1000)}
            aria-label="Posição da música"
          />
          <div className="amp-controls">
            <button type="button" className="amp-btn" onClick={() => player.prev()} aria-label="Anterior" title="Anterior">
              <SkipBack size={14} />
            </button>
            <button type="button" className="amp-btn" onClick={() => player.play()} aria-label="Tocar" title="Tocar">
              <Play size={14} />
            </button>
            <button type="button" className="amp-btn" onClick={() => player.pause()} aria-label="Pausar" title="Pausar">
              <Pause size={14} />
            </button>
            <button type="button" className="amp-btn" onClick={() => player.stop()} aria-label="Parar" title="Parar">
              <Square size={13} />
            </button>
            <button type="button" className="amp-btn" onClick={() => player.next()} aria-label="Próxima" title="Próxima">
              <SkipForward size={14} />
            </button>
            <span className="amp-vol">
              <Volume1 size={14} aria-hidden="true" />
              <input type="range" min={0} max={100} value={s.volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" />
              <Volume2 size={14} aria-hidden="true" />
            </span>
            <button type="button" className={`amp-toggle ${s.shuffle ? 'is-on' : ''}`} aria-pressed={s.shuffle} onClick={() => player.setShuffle(!s.shuffle)} title="Aleatório">
              <Shuffle size={12} /> <span>Aleat.</span>
            </button>
            <button type="button" className={`amp-toggle ${s.repeat ? 'is-on' : ''}`} aria-pressed={s.repeat} onClick={() => player.setRepeat(!s.repeat)} title="Repetir">
              <Repeat size={12} /> <span>Rep.</span>
            </button>
          </div>

          <div className="amp-title amp-pl-title">
            <span>LISTA DE REPRODUÇÃO</span>
          </div>
          <ol className="amp-playlist">
            {TRACKS.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={i === s.index ? 'is-current' : ''}
                  onClick={() => {
                    if (i === s.index) player.toggle();
                    else {
                      player.jump(i);
                      player.play();
                    }
                  }}
                  aria-current={i === s.index}
                >
                  <span>
                    {i + 1}. {t.artist} - {t.title}
                  </span>
                  <span>{formatTime(trackDuration(t))}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="amp-pl-foot">
            {TRACKS.length} faixas · {formatTime(TRACKS.reduce((a, t) => a + trackDuration(t), 0))} no total
          </div>
        </div>

        <div className="music-side">
          <Panel title="Tocando agora" color="#ff8c00">
            <div className="now-playing">
              <AlbumCover track={track} size={140} />
              <div>
                <h4>{track.title}</h4>
                <p>
                  <b>{track.artist}</b>
                  <br />
                  Álbum: {track.album} ({track.year})
                  <br />
                  {track.bpm} BPM · {s.playing ? 'tocando' : s.elapsed > 0 ? 'pausado' : 'parado'}
                </p>
                <button type="button" className="retro-btn" onClick={() => player.toggle()}>
                  {s.playing ? '❚❚ Pausar' : '▶ Tocar'}
                </button>
              </div>
            </div>
          </Panel>
          <Panel title="Discografia" color="#7b2cff">
            <div className="covers-grid">
              {TRACKS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cover-btn ${i === s.index ? 'is-current' : ''}`}
                  onClick={() => {
                    player.jump(i);
                    player.play();
                  }}
                  title={`Tocar ${t.title}`}
                >
                  <AlbumCover track={t} size={84} />
                  <span>{t.album}</span>
                </button>
              ))}
            </div>
          </Panel>
          <p className="hint">Dica: a música continua tocando enquanto você navega pelo museu. Controle pela bandeja da barra de tarefas.</p>
        </div>
      </div>
    </div>
  );
}
