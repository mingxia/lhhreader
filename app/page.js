import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f2e6cf' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>连环画阅读器</h1>
        <p>已按 Next.js + React 实现阅读器界面。</p>
        <Link href="/reader">进入阅读器</Link>
      </div>
    </main>
  );
}
