'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserHeaderActions from '../components/UserHeaderActions';

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('flashi_user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      if (parsedUser.status !== 'active') {
        router.push('/subscribe');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!user) return null;

  return (
    <main>
      <header className="header">
        <div className="container">
          <a href="/" className="logo">
            <span className="logo-icon">
              <img src="/logo.png" alt="FLASHI" width="32" height="32" style={{ borderRadius: '6px', objectFit: 'cover' }} />
            </span>
            <span className="logo-text">FLASHI</span>
          </a>
          <nav className="nav">
            <a href="/" className="nav-link">Home</a>
            <a href="/special-discounts" className="nav-link">Sales</a>
            <a href="/subscribe" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Premium</a>
          </nav>
          <UserHeaderActions />
        </div>
      </header>

      <div className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '60vh' }}>
        <h1 className="section-title" style={{ textAlign: 'left', marginBottom: 'var(--spacing-lg)' }}>My Alerts</h1>
        
        <div style={{ background: 'var(--secondary-bg)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0 }}>
              🎉
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-text)', marginBottom: '4px' }}>Welcome to Premium</h3>
              <p style={{ color: 'var(--secondary-text)', fontSize: '14px', lineHeight: '1.5' }}>
                You are now subscribed to our Premium live alerts. You'll receive instant notifications here when massive price drops occur on top brands!
              </p>
              <span style={{ display: 'block', marginTop: '8px', fontSize: '12px', color: 'var(--muted-text)' }}>Just now</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
