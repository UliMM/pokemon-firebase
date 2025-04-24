import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import './Contador.css';
import Boton from '../common/Boton';

const Contador = ({ usuarioAutenticado }) => {
  const [contador, setContador] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [tiempoConfig, setTiempoConfig] = useState(15);
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [error, setError] = useState(null);
  const [scoreGuardado, setScoreGuardado] = useState(false); // Nuevo estado para controlar el guardado

  const guardarScore = async () => {
    if (!usuarioAutenticado?.uid || contador === 0 || scoreGuardado) {
      return false; // No guardar si ya se guardó o no hay usuario
    }

    try {
      const scoreData = {
        clicks: contador,
        tiempo: tiempoConfig,
        userId: usuarioAutenticado.uid,
        userName: usuarioAutenticado.displayName || 'Anónimo',
        timestamp: serverTimestamp(),
        cps: parseFloat((contador/tiempoConfig).toFixed(2))
      };

      await addDoc(collection(db, 'click_scores'), scoreData);
      setScoreGuardado(true); // Marcamos que ya se guardó
      return true;
    } catch (error) {
      console.error("Error al guardar score:", error);
      setError("Error al guardar el score");
      return false;
    }
  };

  useEffect(() => {
    if (!usuarioAutenticado?.uid) {
      setScores([]);
      setLoadingScores(false);
      return;
    }

    setLoadingScores(true);
    
    const q = query(
      collection(db, 'click_scores'),
      where('userId', '==', usuarioAutenticado.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const scoresData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            clicks: data.clicks,
            tiempo: data.tiempo,
            cps: data.cps,
            fecha: data.timestamp?.toDate()?.toLocaleString() || 'Fecha no disponible'
          };
        });
        setScores(scoresData);
        setLoadingScores(false);
        setError(null);
      },
      (error) => {
        console.error("Error al cargar scores:", error);
        setError("Error al cargar historial. Por favor recarga la página.");
        setLoadingScores(false);
      }
    );

    return unsubscribe;
  }, [usuarioAutenticado?.uid]);

  useEffect(() => {
    let intervalo;
    
    if (juegoActivo && tiempoRestante > 0) {
      setScoreGuardado(false); // Resetear el estado de guardado al iniciar nuevo juego
      intervalo = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            finalizarJuego();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }


    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [juegoActivo, tiempoRestante]);

  const iniciarJuego = () => {
    if (tiempoConfig <= 0) return;
    
    setContador(0);
    setTiempoRestante(tiempoConfig);
    setJuegoActivo(true);
    setError(null);
    setScoreGuardado(false); // Asegurarse de que no esté marcado como guardado
  };

  const finalizarJuego = async () => {
    setJuegoActivo(false);
    await guardarScore(); // Solo se guarda al finalizar el juego
  };

  const handleClick = () => {
    if (juegoActivo) {
      setContador(prev => prev + 1);
    }
  };

  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <div className="neon-contador-container">
      <h2 className="neon-contador-title">CONTADOR NEON</h2>
      
      {error && <div className="neon-error">{error}</div>}
      
      {!juegoActivo ? (
        <div className="neon-config-section">
          <div className="neon-input-group">
            <label className="neon-label">TIEMPO (SEGUNDOS):</label>
            <input
              type="number"
              min="5"
              max="120"
              value={tiempoConfig}
              onChange={(e) => {
                const val = Number(e.target.value) || 5;
                const clamped = Math.max(5, Math.min(120, val));
                setTiempoConfig(clamped);
              }}
              className="neon-input"
              disabled={juegoActivo}
            />
          </div>
          
          <Boton 
            texto="INICIAR DESAFÍO"
            onClick={iniciarJuego}
            tipo="primary"
            disabled={juegoActivo}
          />
        </div>
      ) : (
        <>
          <div className="neon-tiempo-restante">
            TIEMPO: {formatearTiempo(tiempoRestante)}
          </div>
          <div className="neon-contador-display">{contador}</div>
        </>
      )}

      <Boton 
        texto={juegoActivo ? `CLIC RÁPIDO! (${contador})` : `PREPARADO?`}
        onClick={handleClick}
        tipo={juegoActivo ? "secondary" : "disabled"}
        disabled={!juegoActivo}
      />

      {usuarioAutenticado && (
        <div className="neon-scores-section">
          <h3 className="neon-scores-title">TUS MEJORES SCORES</h3>
          
          {loadingScores ? (
            <p className="neon-loading">CARGANDO HISTORIAL...</p>
          ) : scores.length === 0 ? (
            <p className="neon-no-scores">No tienes registros aún</p>
          ) : (
            <div className="neon-scores-grid">
              {scores.map((score, index) => (
                <div key={score.id} className="neon-score-card">
                  <div className="neon-score-position">#{index + 1}</div>
                  <div className="neon-score-details">
                    <span className="neon-score-clicks">{score.clicks} CLICS</span>
                    <span className="neon-score-time">{score.tiempo} SEGUNDOS</span>
                    <span className="neon-score-cps">{score.cps} CPS</span>
                    <span className="neon-score-date">{score.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Contador;