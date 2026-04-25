'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const [user, setUser] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const pathname = usePathname();

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

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <>
      <nav className="mobile-bottom-nav">
        <Link href="/" className={`bottom-nav-item ${isActive('/')}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </Link>
        <Link href="/special-discounts" className={`bottom-nav-item ${isActive('/special-discounts')}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>Sales</span>
        </Link>
        <Link href="/subscribe" className={`bottom-nav-item ${isActive('/subscribe')}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Premium</span>
        </Link>
        
        {user?.status === 'active' && (
          <Link href="/notifications" className={`bottom-nav-item ${isActive('/notifications')}`}>
            <div className="nav-icon-badge-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="nav-badge">1</span>
            </div>
            <span>Alerts</span>
          </Link>
        )}

        <button 
          className={`bottom-nav-item ${moreMenuOpen ? 'active' : ''}`}
          onClick={() => setMoreMenuOpen(!moreMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          <span>More</span>
        </button>
      </nav>

      {/* Slide-up More Menu */}
      <div className={`mobile-more-menu ${moreMenuOpen ? 'open' : ''}`}>
        <div className="more-menu-header">
          {user ? (
            <div className="more-user-info">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.full_name || user.email)}&background=6b705c&color=fff`} 
                alt="Profile" 
              />
              <div>
                <strong>{user.full_name || user.name || 'User'}</strong>
                <span>{user.email}</span>
              </div>
            </div>
          ) : (
            <Link href="/?login=true" onClick={() => setMoreMenuOpen(false)} className="more-login-btn">
              Login / Register
            </Link>
          )}
          <button className="close-more-btn" onClick={() => setMoreMenuOpen(false)}>×</button>
        </div>
        
        <div className="more-menu-links">
          <Link href="/about" onClick={() => setMoreMenuOpen(false)}>About Us</Link>
          <Link href="/contact" onClick={() => setMoreMenuOpen(false)}>Contact Us</Link>
          {user && (
            <button onClick={handleLogout} className="more-logout-btn">Logout</button>
          )}
        </div>
      </div>
      
      {moreMenuOpen && <div className="mobile-menu-overlay" onClick={() => setMoreMenuOpen(false)}></div>}
    </>
  );
}
