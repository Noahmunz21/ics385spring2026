import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import About from "./components/About";
import Amenities from "./components/Amenities";
import CallToAction from "./components/CallToAction";
import Dashboard from "./Dashboard";
import "./styles.css";

function App() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/properties/69d2e3889bc749cfff67faf1")
      .then(res => res.json())
      .then(data => { setProperty(data); setLoading(false); })
      .catch(() => { setError("Failed to load property data."); setLoading(false); });
  }, []);

  if (showDashboard) return <Dashboard />;
  if (loading) return <div className="loading">Loading Maui BnB...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main>
      <div style={{ background: '#2c7a4b', textAlign: 'right', padding: '0.5rem 1.5rem' }}>
        <button
          onClick={() => setShowDashboard(true)}
          style={{ background: 'white', color: '#2c7a4b', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📊 View Dashboard
        </button>
      </div>
      <Hero name={property.name} tagline="Experience Maui like a local — where every stay feels like home." />
      <About description={property.description} targetSegment={property.targetSegment} />
      <Amenities amenities={property.amenities} />
      <CallToAction />
    </main>
  );
}

export default App;
