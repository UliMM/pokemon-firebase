import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './RandomPokemon1.css';

const RandomPokemon = ({ usuarioAutenticado }) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);

  const fetchFavoritos = async () => {
    if (!usuarioAutenticado?.uid) {
      setFavoritos([]);
      return;
    }

    setLoadingFavoritos(true);
    try {
      const q = query(
        collection(db, 'pokemon_favoritos'),
        where('userId', '==', usuarioAutenticado.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const favs = [];
      querySnapshot.forEach((doc) => {
        favs.push({ id: doc.id, ...doc.data() });
      });
      
      setFavoritos(favs);
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
    } finally {
      setLoadingFavoritos(false);
    }
  };

  useEffect(() => {
    fetchFavoritos();
  }, [usuarioAutenticado?.uid]);

  const handleLikeClick = async () => {
    if (!usuarioAutenticado || !pokemon) return;

    try {
      if (!isLiked) {
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
      } else {
        const pokemonRef = favoritos.find(fav => fav.pokemonName === pokemon.name);
        if (pokemonRef) {
          await deleteDoc(doc(db, 'pokemon_favoritos', pokemonRef.id));
        }
      }

      setIsLiked(!isLiked);
      await fetchFavoritos();
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const fetchRandomPokemon = async () => {
    setLoading(true);
    setIsLiked(false);
    const randomId = Math.floor(Math.random() * 898) + 1;
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();

      const pokemonData = {
        name: data.name,
        image: data.sprites.front_default,
        abilities: data.abilities.map((ability) => ability.ability.name).join(', '),
        types: data.types.map((type) => type.type.name).join(', '),
        weight: data.weight / 10,
        height: data.height / 10,
      };

      setPokemon(pokemonData);

      if (usuarioAutenticado) {
        const isFavorito = favoritos.some(fav => fav.pokemonName === pokemonData.name);
        setIsLiked(isFavorito);
      }
    } catch (error) {
      console.error('Error fetching the Pokémon:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomPokemon();
  }, [usuarioAutenticado]);

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
          <h3 className="neon-pokemon-name">{pokemon.name}</h3>
          <img src={pokemon.image} alt={pokemon.name} className="neon-pokemon-image" />
          
          <div className="neon-pokemon-details">
            <p><span className="neon-detail-label">HABILIDADES:</span> {pokemon.abilities}</p>
            <p><span className="neon-detail-label">TIPOS:</span> {pokemon.types}</p>
            <p><span className="neon-detail-label">ALTURA:</span> {pokemon.height} decímetros</p>
            <p><span className="neon-detail-label">PESO:</span> {pokemon.weight} hectogramos</p>
          </div>

          {usuarioAutenticado && (
            <div className="neon-favoritos-section">
              <button
                className={`neon-favorite-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeClick}
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
                      <img src={fav.pokemonImage} alt={fav.pokemonName} className="neon-fav-image" />
                      <h4 className="neon-fav-name">{fav.pokemonName}</h4>
                      <p className="neon-fav-type">TIPO: {fav.pokemonType}</p>
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