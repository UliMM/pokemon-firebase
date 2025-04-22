import React from 'react';
import './Boton.css';

const Boton = ({ texto, onClick, tipo = 'primary' }) => {
  const buttonClass = `neon-button ${tipo}`;
  
  return (
    <button className={buttonClass} onClick={onClick}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      {texto}
    </button>
  );
};

export default Boton;