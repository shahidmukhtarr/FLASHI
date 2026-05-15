'use client';

import { useState, useEffect } from 'react';

export default function FavoriteButton({ product }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('flashi_favorites') || '[]');
      setIsFav(favs.some(f => f.url === product.url));
    } catch (e) {}

    const handleFavChange = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('flashi_favorites') || '[]');
        setIsFav(favs.some(f => f.url === product.url));
      } catch (e) {}
    };

    window.addEventListener('favorites_changed', handleFavChange);
    return () => window.removeEventListener('favorites_changed', handleFavChange);
  }, [product.url]);

  const toggleFav = (e) => {
    e.preventDefault(); // prevent triggering the card click
    e.stopPropagation();
    
    try {
      let favs = JSON.parse(localStorage.getItem('flashi_favorites') || '[]');
      const idx = favs.findIndex(f => f.url === product.url);
      
      if (idx > -1) {
        favs.splice(idx, 1);
        setIsFav(false);
      } else {
        favs.unshift(product);
        setIsFav(true);
      }
      
      localStorage.setItem('flashi_favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('favorites_changed'));
    } catch (err) {
      console.error('Failed to save favorite', err);
    }
  };

  return (
    <button
      onClick={toggleFav}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: '50%',
        width: '34px',
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        zIndex: 10,
        transition: 'all 0.2s ease',
        padding: 0
      }}
      aria-label="Toggle favorite"
      title={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isFav ? "#ef4444" : "none"} 
        stroke={isFav ? "#ef4444" : "#9ca3af"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ transform: isFav ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
