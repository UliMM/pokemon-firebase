import React from 'react';
import './Contador.css';
import Boton from '../common/Boton';

const Contador = ({ contador, setContador }) => {
  return (
    <div className="neon-contador-container">
      <h2 className="neon-contador-title">CONTADOR NEON</h2>
      <div className="neon-contador-display">{contador}</div>
      <Boton 
        texto={`INCREMENTAR (${contador})`}
        onClick={() => setContador(contador + 1)}
        tipo="primary"
      />
    </div>
  );
};

export default Contador;