// src/componentes/BotonAD.js
import React from 'react';
import './BotonAD.css';

const BotonAD = ({ textoBoton, toggleSeccion, mostrarContador }) => {
  return (
    <button 
      className={`boton-ad ${mostrarContador ? 'contador-activo' : 'formulario-activo'}`}
      onClick={toggleSeccion}
    >
      {textoBoton}
    </button>
  );
};

export default BotonAD;