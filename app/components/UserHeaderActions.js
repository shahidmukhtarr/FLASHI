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
    localStorage.setItem('flashi_skip_login', 'true');
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
        <Link href="/dashboard" className="go-home-btn" style={{ background: 'var(--gradient-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '14px', boxShadow: 'var(--shadow-sm)', border: 'none', textDecoration: 'none' }}>
          <span>Dashboard</span>
        </Link>
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
