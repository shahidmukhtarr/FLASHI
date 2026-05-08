'use client';

import { useEffect, useRef, useState } from 'react';

export default function PullToRefresh({ children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current) return;
      
      const y = e.touches[0].clientY;
      const diff = y - startY.current;

      if (diff > 0 && window.scrollY === 0) {
        setPullY(Math.min(diff * 0.5, 100)); // 0.5 resistance
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      setPullY((currentPullY) => {
        if (currentPullY > 60) {
          setRefreshing(true);
          window.location.reload();
        }
        return 0; // Reset visual pull
      });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <>
      <div
        style={{
          height: refreshing ? '60px' : `${pullY}px`,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontWeight: 'bold',
          transition: isPulling.current ? 'none' : 'height 0.3s ease-out',
        }}
      >
        {refreshing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-dot" style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
            Refreshing...
          </div>
        ) : (
          pullY > 60 ? 'Release to refresh' : 'Pull down to refresh'
        )}
      </div>
      {children}
    </>
  );
}
