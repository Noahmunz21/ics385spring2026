import tourismData from '../data/mauiTourism.json';

export default function MetricCards({ island }) {
  const islandKey = island === 'Maui' ? 'Maui' : 'Oahu';
  const metrics = tourismData.metrics[islandKey] || tourismData.metrics['Maui'];

  const cards = [
    { emoji: '💰', label: 'Avg Daily Rate', value: `$${metrics.adr}`, unit: '/ night' },
    { emoji: '🏨', label: 'Occupancy Rate', value: `${metrics.occupancy}%`, unit: 'of rooms filled' },
    { emoji: '📅', label: 'Avg Length of Stay', value: `${metrics.avgStay}`, unit: 'days' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {cards.map(card => (
        <div key={card.label} style={{
          background: 'white', borderRadius: '10px', padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center',
          borderTop: '4px solid #2c7a4b'
        }}>
          <div style={{ fontSize: '2rem' }}>{card.emoji}</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2c7a4b' }}>{card.value}</div>
          <div style={{ fontSize: '0.85rem', color: '#555' }}>{card.unit}</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>{card.label}</div>
        </div>
      ))}
    </div>
  );
}
