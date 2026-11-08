import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Se uma página falhar, mostra o clássico "operação ilegal" em vez de derrubar o site inteiro. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page ie-error">
        <div className="ie-error-head">
          <span className="msgbox-icon msgbox-error" aria-hidden="true">×</span>
          <div>
            <h2>Este programa executou uma operação ilegal e será fechado.</h2>
            <p>Se o problema persistir, contate o fornecedor do programa. (Ou simplesmente tente de novo.)</p>
            <p className="ie-error-code">
              <code>{this.state.error.message}</code>
            </p>
          </div>
        </div>
        <button type="button" className="retro-btn" onClick={() => this.setState({ error: null })}>
          Tentar novamente
        </button>
      </div>
    );
  }
}
