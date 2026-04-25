'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserHeaderActions({ onLogin }) {
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(true);

  useEffect(() => {
    setIsHome(pathname === '/');
    
    try {
      const stored = localStorage.getItem('flashi_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {}
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('flashi_user');
    setUser(null);
    window.location.reload();
  };

  const handleLoginClick = (e) => {
    if (onLogin) {
      e.preventDefault();
      onLogin();
    }
  };

  if (!isHome) {
    return (
      <div className="header-actions">
        <Link href="/" className="go-home-btn" style={{ background: 'var(--gradient-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '14px', boxShadow: 'var(--shadow-sm)' }}>
          <span>Go to Home</span>
        </Link>
      </div>
    );
  }

  if (user) {
    return (
      <div className="header-actions">
        <button className="google-login-btn" onClick={handleLogout} style={{ border: '1px solid var(--accent-error)', color: 'var(--accent-error)' }}>
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="header-actions">
      <Link href="/" className="google-login-btn" onClick={handleLoginClick}>
        <span>Login / Register</span>
      </Link>
    </div>
  );
}
