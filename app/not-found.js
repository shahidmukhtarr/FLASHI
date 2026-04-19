import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem', color: '#369632' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>Could not find requested resource</p>
      <Link href="/" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#369632', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
        Return Home
      </Link>
    </div>
  );
}
