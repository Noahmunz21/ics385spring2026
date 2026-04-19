import { useState } from 'react';
import ArrivalChart from './components/ArrivalChart';
import OriginChart from './components/OriginChart';
import MetricCards from './components/MetricCards';
import WeatherWidget from './components/WeatherWidget';

const ISLANDS = ['Maui', 'Oahu'];

export default function Dashboard() {
  const [island, setIsland] = useState('Maui');

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7f3' }}>
      {/* Header */}
      <header style={{ background: '#2c7a4b', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🌺 Hana Hideaway B&B</h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>Visitor Statistics Dashboard</p>
        </div>
        <a href="/" style={{ color: 'white', textDecoration: 'underline', fontSize: '0.9rem' }}>← Back to Marketing Page</a>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Island Selector */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label htmlFor="island-select" style={{ fontWeight: 'bold', color: '#2c7a4b', fontSize: '1rem' }}>
            Select Island:
          </label>
          <select
            id="island-select"
            value={island}
            onChange={e => setIsland(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #2c7a4b', fontSize: '1rem', cursor: 'pointer' }}
          >
            {ISLANDS.map(i => <option key={i}>{i}</option>)}
          </select>
          <span style={{ color: '#555', fontSize: '0.9rem' }}>Showing data for: <strong>{island}</strong></span>
        </div>

        {/* Metric Cards */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2c7a4b', marginBottom: '1rem' }}>📊 Key Metrics</h2>
          <MetricCards island={island} />
        </section>

        {/* Charts + Weather Grid */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2c7a4b', marginBottom: '1rem' }}>📈 Visitor Arrivals by Month</h2>
          <ArrivalChart island={island} />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <section>
            <h2 style={{ color: '#2c7a4b', marginBottom: '1rem' }}>🌍 Visitor Origin</h2>
            <OriginChart island={island} />
          </section>
          <section>
            <h2 style={{ color: '#2c7a4b', marginBottom: '1rem' }}>🌤️ Current Weather</h2>
            <WeatherWidget island={island} />
          </section>
        </div>
      </main>
    </div>
  );
}
