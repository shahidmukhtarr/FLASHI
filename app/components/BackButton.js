"use client";

export default function BackButton({ fallbackUrl = '/' }) {
  return (
    <button 
      onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = fallbackUrl} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: 'rgba(46, 125, 50, 0.1)', 
        color: 'var(--primary)',
        border: 'none',
        cursor: 'pointer',
        marginRight: '15px',
        transition: 'all 0.2s'
      }}
      aria-label="Go back"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
  );
}
