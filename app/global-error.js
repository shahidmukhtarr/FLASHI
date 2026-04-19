'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff3333' }}>Critical Error</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>A critical system error occurred.</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#369632', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
