import { useState } from 'react';
import IslandCard from './IslandCard';

export default function IslandList({ islands }) {
  const [segment, setSegment] = useState("All");

  const displayed = segment === 'All'
    ? islands
    : islands.filter(i => i.segment === segment);

  const segments = ['All', ...new Set(islands.map(i => i.segment))];

  const avgStay = displayed.length
    ? (displayed.reduce((sum, i) => sum + i.avgStay, 0) / displayed.length).toFixed(1)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="segment-filter" style={{ fontWeight: 'bold', color: '#2c7a4b' }}>
          Filter by Visitor Segment:
        </label>
        <select
          id="segment-filter"
          onChange={e => setSegment(e.target.value)}
          style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            border: '2px solid #2c7a4b', fontSize: '1rem', cursor: 'pointer'
          }}
        >
          {segments.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {displayed.map(island => (
          <IslandCard key={island.id} {...island} />
        ))}
      </div>

      <div style={{
        background: '#2c7a4b', color: 'white',
        padding: '1rem 1.5rem', borderRadius: '10px',
        display: 'inline-block', fontSize: '1.1rem'
      }}>
        📊 Average stay for <strong>{segment}</strong> visitors: <strong>{avgStay} days</strong>
      </div>
    </div>
  );
}
