import React, { useState } from 'react';
import Auth from './auth/autenticacion';
import InicioAuth from './auth/inicio-auth';
import './menu.css';

export default function Menu({ onLogout, onMenuClick, seccionActual }) {
  const [showLogin, setShowLogin] = useState(true);

  if (onLogout) {
    return (
      <div className="neon-menu-container">
        <div className="neon-menu-tabs">
          <button 
            className={`neon-menu-item ${seccionActual === 'contador' ? 'active' : ''}`}
            onClick={() => onMenuClick('contador')}
          >
            CONTADOR
          </button>
          <button 
            className={`neon-menu-item ${seccionActual === 'formulario' ? 'active' : ''}`}
            onClick={() => onMenuClick('formulario')}
          >
            FORMULARIO
          </button>
          <button 
            className={`neon-menu-item ${seccionActual === 'pokemon' ? 'active' : ''}`}
            onClick={() => onMenuClick('pokemon')}
          >
            POKÉMON
          </button>
          <button 
            className="neon-menu-item logout"
            onClick={onLogout}
          >
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-menu-container">
      <div className="auth-menu-tabs">
        <button 
          className={`auth-tab ${showLogin ? 'active' : ''}`}
          onClick={() => setShowLogin(true)}
        >
          INICIAR SESIÓN
        </button>
        <button 
          className={`auth-tab ${!showLogin ? 'active' : ''}`}
          onClick={() => setShowLogin(false)}
        >
          REGISTRARSE
        </button>
      </div>
      
      <div className="auth-menu-content">
        {showLogin ? <InicioAuth /> : <Auth />}
      </div>
    </div>
  );
}