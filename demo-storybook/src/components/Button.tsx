import { useState } from 'react';
import './button.css';

export interface ButtonProps {
  /** Texto do botão */
  label: string;
  /** Desabilita o clique */
  disabled?: boolean;
  /** Mostra o estado de envio */
  loading?: boolean;
  /** Mensagem exibida depois do clique */
  feedback?: string;
}

export const Button = ({ label, disabled = false, loading = false, feedback = 'Enviado!' }: ButtonProps) => {
  const [enviado, setEnviado] = useState(false);
  return (
    <div className="demo">
      <button
        type="button"
        className="btn"
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={() => setEnviado(true)}
      >
        {loading && <span className="spin" aria-hidden="true" />}
        {loading ? 'Enviando…' : label}
      </button>
      {enviado && (
        <p className="toast" role="status">
          <span className="ok" aria-hidden="true">✓</span>
          {feedback}
        </p>
      )}
    </div>
  );
};
