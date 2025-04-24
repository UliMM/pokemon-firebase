import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import './RandomPokemon1.css';

const RandomPokemon = ({ usuarioAutenticado }) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  // Escucha cambios en tiempo real de los favoritos
  useEffect(() => {
    if (!usuarioAutenticado?.uid) {
      setFavoritos([]);
      return;
    }

    setLoadingFavoritos(true);
    const q = query(
      collection(db, 'pokemon_favoritos'),
      where('userId', '==', usuarioAutenticado.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const favs = [];
      querySnapshot.forEach((doc) => {
        favs.push({ id: doc.id, ...doc.data() });
      });
      setFavoritos(favs);
      setLoadingFavoritos(false);

      // Verifica si el pokémon actual está en favoritos
      if (pokemon) {
        const isFavorito = favs.some(fav => fav.pokemonName === pokemon.name);
        setIsLiked(isFavorito);
      }
    }, (error) => {
      console.error("Error en la suscripción:", error);
      setLoadingFavoritos(false);
    });

    return () => unsubscribe();
  }, [usuarioAutenticado?.uid, pokemon?.name]);

  const handleLikeClick = async () => {
    if (!usuarioAutenticado || !pokemon) return;

    try {
      if (!isLiked) {
        // Verificar si ya existe en favoritos
        const existe = favoritos.some(fav => 
          fav.pokemonName === pokemon.name && fav.userId === usuarioAutenticado.uid
        );
        
        if (!existe) {
          await addDoc(collection(db, 'pokemon_favoritos'), {
            pokemonName: pokemon.name,
            pokemonImage: pokemon.image,
            pokemonAbilities: pokemon.abilities,
            pokemonType: pokemon.types,
            pokemonHeight: pokemon.height,
            pokemonWeight: pokemon.weight,
            userId: usuarioAutenticado.uid,
            createdAt: new Date()
          });
        }
      } else {
        // Buscar y eliminar el favorito específico
        const q = query(
          collection(db, 'pokemon_favoritos'),
          where('pokemonName', '==', pokemon.name),
          where('userId', '==', usuarioAutenticado.uid)
        );
        const snapshot = await getDocs(q);
        
        const deletePromises = snapshot.docs.map(async (document) => {
          await deleteDoc(doc(db, 'pokemon_favoritos', document.id));
        });
        
        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const fetchRandomPokemon = async () => {
    setLoading(true);
    const randomId = Math.floor(Math.random() * 898) + 1;
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();

      const pokemonData = {
        name: data.name,
        image: data.sprites.front_default,
        abilities: data.abilities.map((ability) => ability.ability.name).join(', '),
        types: data.types.map((type) => type.type.name).join(', '),
        weight: (data.weight / 10).toFixed(1), // kg con 1 decimal
        height: (data.height / 10).toFixed(1), // m con 1 decimal
      };

      setPokemon(pokemonData);

      // Verificar si está en favoritos (se maneja en onSnapshot)
    } catch (error) {
      console.error('Error fetching the Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorito = async (pokemonId) => {
    try {
      await deleteDoc(doc(db, 'pokemon_favoritos', pokemonId));
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  };

  // Cargar un pokémon al inicio y cuando cambie el usuario
  useEffect(() => {
    fetchRandomPokemon();
  }, [usuarioAutenticado?.uid]);

  return (
    <div className="neon-pokemon-container">
      <h2 className="neon-pokemon-title">POKÉMON ALEATORIO</h2>
      
      <button 
        className="neon-pokemon-button" 
        onClick={fetchRandomPokemon} 
        disabled={loading}
      >
        {loading ? 'CARGANDO...' : 'OBTENER NUEVO POKÉMON'}
      </button>
      
      {pokemon && (
        <div className="neon-pokemon-card">
          <h3 className="neon-pokemon-name">{pokemon.name.toUpperCase()}</h3>
          <img 
            src={pokemon.image} 
            alt={pokemon.name} 
            className="neon-pokemon-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150?text=Pokemon+no+disponible';
            }}
          />
          
          <div className="neon-pokemon-details">
            <p><span className="neon-detail-label">HABILIDADES:</span> {pokemon.abilities}</p>
            <p><span className="neon-detail-label">TIPOS:</span> {pokemon.types}</p>
            <p><span className="neon-detail-label">ALTURA:</span> {pokemon.height} m</p>
            <p><span className="neon-detail-label">PESO:</span> {pokemon.weight} kg</p>
          </div>

          {usuarioAutenticado && (
            <div className="neon-favoritos-section">
              <button
                className={`neon-favorite-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeClick}
                disabled={loadingFavoritos}
              >
                {isLiked ? '❤️ QUITAR DE FAVORITOS' : '♡ AÑADIR A FAVORITOS'}
              </button>
              
              <h3 className="neon-favoritos-title">TUS POKÉMON FAVORITOS</h3>
              
              {loadingFavoritos ? (
                <p className="neon-loading">CARGANDO FAVORITOS...</p>
              ) : favoritos.length === 0 ? (
                <p className="neon-no-favs">No tienes pokémones favoritos aún</p>
              ) : (
                <div className="neon-favoritos-grid">
                  {favoritos.map((fav) => (
                    <div key={fav.id} className="neon-favorito-card">
                      <img 
                        src={fav.pokemonImage} 
                        alt={fav.pokemonName} 
                        className="neon-fav-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=Pokemon';
                        }}
                      />
                      <h4 className="neon-fav-name">{fav.pokemonName.toUpperCase()}</h4>
                      <p className="neon-fav-type">TIPO: {fav.pokemonType}</p>
                      <button 
                        className="neon-remove-fav"
                        onClick={() => handleRemoveFavorito(fav.id)}
                      >
                        ELIMINAR
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RandomPokemon;