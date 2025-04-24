import React, { useState, useEffect } from 'react';
import { auth } from './componentes/firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import Menu from './componentes/menu';
import Contador from './componentes/contador/Contador';
import Formularioprac from './componentes/formulario/Formularioprac';
import RandomPokemon from './componentes/pokemon/RandomPokemon';

function App() {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [seccionActual, setSeccionActual] = useState('contador');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioAutenticado({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Usuario'
        });
      } else {
        setUsuarioAutenticado(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleMenuClick = (seccion) => {
    setSeccionActual(seccion);
  };

  const agregarPersona = (persona) => {
    setPersonas([...personas, persona]);
  };

  return (
    <div className="App">
      {/* Efectos de pantalla completa */}
      <div className="screen-border"></div>
      
      {/* Esquinas decorativas */}
      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>
      
      {/* Cables decorativos */}
      <div className="cable cable-vertical"></div>
      <div className="cable cable-horizontal"></div>
      
      {usuarioAutenticado ? (
        <div className="main-content">
          <Menu 
            onLogout={handleLogout} 
            onMenuClick={handleMenuClick} 
            seccionActual={seccionActual}
          />
          
          <div className="content-container">
            {seccionActual === 'contador' && (
              <Contador usuarioAutenticado={usuarioAutenticado} />
            )}
            
            {seccionActual === 'formulario' && (
              <Formularioprac
                nombre={nombre}
                setNombre={setNombre}
                apellido={apellido}
                setApellido={setApellido}
                agregarPersona={agregarPersona}
                personas={personas}
              />
            )}
            
            {seccionActual === 'pokemon' && (
              <RandomPokemon usuarioAutenticado={usuarioAutenticado} />
            )}
          </div>
        </div>
      ) : (
        <div className="auth-container">
          <Menu />
        </div>
      )}
    </div>
  );
}

export default App;