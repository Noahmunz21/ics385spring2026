import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import About from "./components/About";
import Amenities from "./components/Amenities";
import CallToAction from "./components/CallToAction";
import "./styles.css";

function App() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/properties/69d2e3889bc749cfff67faf1")
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load property data.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading Maui BnB...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main>
      <Hero name={property.name} tagline="Experience Maui like a local — where every stay feels like home." />
      <About description={property.description} targetSegment={property.targetSegment} />
      <Amenities amenities={property.amenities} />
      <CallToAction />
    </main>
  );
}

export default App;
