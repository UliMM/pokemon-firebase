import React from 'react';
import './BotonSubmit.css';

const BotonSubmit = ({ onClick, disabled }) => {
  return (
    <button 
      className={`neon-submit-button ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      ENVIAR
    </button>
  );
};

export default BotonSubmit;