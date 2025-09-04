import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <h1>Reno Platforms – School Directory</h1>
        <nav className="nav">
          <Link href="/addSchool">Add School</Link>{' '}
          <Link href="/showSchools">Show Schools</Link>
        </nav>
      </div>
      <p>Use the navigation above to add new schools or view the list.</p>
    </main>
  );
}
