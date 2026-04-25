'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserHeaderActions({ onLogin }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flashi_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {}
  }, []);

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

  if (user) {
    return (
      <div className="header-actions">
        <div 
          className={`user-profile-dropdown ${dropdownOpen ? 'open' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(!dropdownOpen);
          }}
        >
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.full_name || user.email)}&background=6b705c&color=fff`} 
            alt="Profile" 
            className="user-avatar"
          />
          <div className="dropdown-content">
            <div className="dropdown-user-info">
              <strong>{user.full_name || user.name || 'User'}</strong>
              <span>{user.email}</span>
            </div>
            {user.status === 'active' && (
              <div style={{ padding: '8px 16px', background: 'rgba(54, 150, 50, 0.1)', color: '#2d6a28', fontSize: '12px', fontWeight: '600' }}>
                👑 Premium Active
              </div>
            )}
            <Link href="/subscribe">Subscription Plan</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
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
