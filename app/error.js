'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff3333' }}>Something went wrong!</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>An unexpected error occurred.</p>
      <button
        onClick={() => reset()}
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#369632', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Try again
      </button>
    </div>
  );
}
