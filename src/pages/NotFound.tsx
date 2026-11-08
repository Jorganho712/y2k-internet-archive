import { useEffect, useState } from 'react';
import { Link, navigate, useRoute } from '../lib/router';
import { sfx } from '../audio/sfx';
import { Icon } from '../components/Icon';
import { SECTIONS } from '../data/sections';

/** Erro 404 no estilo "A página não pode ser exibida" do IE + tela azul opcional. */
export default function NotFound() {
  const route = useRoute();
  const [bsod, setBsod] = useState(false);

  useEffect(() => {
    sfx.error();
  }, []);

  useEffect(() => {
    if (!bsod) return;
    const back = () => setBsod(false);
    window.addEventListener('keydown', back);
    return () => window.removeEventListener('keydown', back);
  }, [bsod]);

  if (bsod) {
    return (
      <button type="button" className="bsod" onClick={() => setBsod(false)}>
        <span className="bsod-title">Y2K Archive</span>
        <span>Ocorreu um erro fatal 0E em 0028:C0011E36 no VXD NOSTALGIA(01).</span>
        <span>A página "{route}" foi encerrada.</span>
        <span>* Pressione qualquer tecla ou clique para voltar.</span>
        <span>* Pressione CTRL+ALT+DEL para lembrar de 2001.</span>
        <span className="bsod-blink">Pressione qualquer tecla para continuar _</span>
      </button>
    );
  }

  return (
    <div className="page ie-error">
      <div className="ie-error-head">
        <Icon name="info" size={40} />
        <div>
          <h2>A página não pode ser exibida</h2>
          <p>A página que você está procurando não está disponível no momento. O site pode estar com problemas técnicos, ou você precisa ajustar as configurações do seu navegador.</p>
        </div>
      </div>
      <hr />
      <p className="ie-error-code">
        <b>HTTP 404</b> — Arquivo não encontrado: <code>{route}</code>
      </p>
      <p>Tente o seguinte:</p>
      <ul>
        <li>
          Clique no botão{' '}
          <button type="button" className="small-link as-button" onClick={() => navigate(route)}>
            Atualizar
          </button>{' '}
          ou tente novamente mais tarde.
        </li>
        <li>Se você digitou o endereço na barra de endereços, verifique se ele está escrito corretamente.</li>
        <li>
          Abra a <Link to="/">página inicial</Link> e procure links para as informações desejadas.
        </li>
        <li>
          Clique em{' '}
          <button type="button" className="small-link as-button" onClick={() => window.history.back()}>
            Voltar
          </button>{' '}
          para tentar outro link.
        </li>
      </ul>
      <p>Páginas que existem neste museu:</p>
      <ul className="ie-error-links">
        {SECTIONS.map((s) => (
          <li key={s.path}>
            <Link to={s.path}>{s.title}</Link>
          </li>
        ))}
      </ul>
      <p className="ie-error-foot">
        Não é possível localizar o servidor ou erro de DNS
        <br />
        Internet Explorer
      </p>
      <button type="button" className="retro-btn" onClick={() => setBsod(true)}>
        Ver o erro em tela azul
      </button>
    </div>
  );
}
