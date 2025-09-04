import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/schools');

        if (!res.ok) {
          console.error('API error:', res.status, res.statusText);
          setError(`API error: ${res.status}`);
          setSchools([]);
          return;
        }

        let data;
        try {
          data = await res.json();
        } catch (err) {
          console.error('JSON parse failed, response was not JSON:', err);
          setError('Invalid JSON from API');
          setSchools([]);
          return;
        }

        setSchools(data.data || []);
      } catch (err) {
        console.error('Failed to fetch schools:', err);
        setError(err.message);
        setSchools([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = schools.filter((s) => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return [s.name, s.address, s.city].some((v) =>
      (v || '').toLowerCase().includes(term)
    );
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
        <input
          className="input"
          placeholder="Search by name, address or city..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="grid">
        {filtered.map((school) => (
          <article className="card" key={school.id}>
            <img
              src={school.image || '/schoolImages/placeholder.jpg'}
              alt={school.name}
            />
            <div className="body">
              <h3 style={{ margin: '0 0 6px 0' }}>{school.name}</h3>
              <p style={{ margin: 0, color: '#374151' }}>{school.address}</p>
              <p style={{ margin: 0, color: '#6b7280' }}>{school.city}</p>
            </div>
          </article>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <p>No schools found.</p>
      )}
    </main>
  );
}
