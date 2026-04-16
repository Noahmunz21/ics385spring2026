export default function IslandCard({ name, nickname, segment, avgStay, img }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <img
        src={img}
        alt={`${name} — ${nickname} island photo`}
        style={{ width: '100%', height: '160px', objectFit: 'cover' }}
      />
      <div style={{ padding: '1rem' }}>
        <h2 style={{ color: '#2c7a4b', margin: '0 0 4px' }}>{name}</h2>
        <p style={{ color: '#555', margin: '0 0 8px', fontSize: '0.9rem' }}>{nickname}</p>
        <span style={{
          background: '#e8f5e9', color: '#2c7a4b',
          padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
        }}>
          {segment}
        </span>
        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#333' }}>
          Avg Stay: <strong>{avgStay} days</strong>
        </p>
      </div>
    </div>
  );
}
