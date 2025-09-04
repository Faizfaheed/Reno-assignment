import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/schools');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch');
        setSchools(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = schools.filter(s => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return [s.name, s.address, s.city].some(v => (v || '').toLowerCase().includes(term));
  });

  return (
    <main className="container">
      <div className="header">
        <h1>Schools</h1>
        <nav className="nav">
          <Link href="/">Home</Link>{' '}
          <Link href="/addSchool">Add School</Link>
        </nav>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input className="input" placeholder="Search by name, address or city..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {filtered.map((school) => (
          <article className="card" key={school.id}>
            <img src={school.image || '/schoolImages/placeholder.jpg'} alt={school.name} />
            <div className="body">
              <h3 style={{ margin: '0 0 6px 0' }}>{school.name}</h3>
              <p style={{ margin: 0, color: '#374151' }}>{school.address}</p>
              <p style={{ margin: 0, color: '#6b7280' }}>{school.city}</p>
            </div>
          </article>
        ))}
      </div>
      {(!loading && filtered.length === 0) && <p>No schools found.</p>}
    </main>
  );
}