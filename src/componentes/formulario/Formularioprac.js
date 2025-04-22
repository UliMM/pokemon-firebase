import React, { useState } from 'react';
import './Formularioprac.css';
import Input from '../common/Input';
import BotonSubmit from '../common/BotonSubmit';

const Formularioprac = ({ 
  nombre, 
  setNombre, 
  apellido, 
  setApellido, 
  agregarPersona,
  personas
}) => {
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!nombre.trim() || !apellido.trim()) {
      setError(true);
      return;
    }

    agregarPersona({
      nombre: nombre.trim(),
      apellido: apellido.trim()
    });
    
    setNombre('');
    setApellido('');
    setError(false);
  };

  return (
    <div className="neon-formulario-container">
      <h2 className="neon-formulario-titulo">FORMULARIO NEON</h2>
      
      <div className="neon-lista-registros">
        <h3 className="neon-titulo-registros">REGISTROS GUARDADOS</h3>
        {personas.map((persona, index) => (
          <div key={index} className="neon-item-registro">
            <span className="neon-numero-registro">{index + 1}.</span>
            {persona.nombre} {persona.apellido}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="neon-formulario">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan"
          required
        />
        
        <Input
          label="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Ej: Pérez"
          required
        />

        {error && <p className="neon-mensaje-error">¡Ambos campos son obligatorios!</p>}
        
        <BotonSubmit onClick={handleSubmit} />
      </form>
    </div>
  );
};

export default Formularioprac;