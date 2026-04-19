import { useState, useEffect } from 'react';

const ISLAND_CITIES = {
  'Maui': 'Kahului,US',
  'Oahu': 'Honolulu,US'
};

export default function WeatherWidget({ island }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const city = ISLAND_CITIES[island] || 'Kahului,US';
    const key = import.meta.env.VITE_WEATHER_KEY;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`)
      .then(res => res.json())
      .then(data => {
        if (data.cod !== 200) throw new Error(data.message);
        setWeather(data);
        setError(null);
      })
      .catch(() => setError('Weather unavailable'));
  }, [island]);

  if (error) return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', color: '#888' }}>
      🌤️ {error}
    </div>
  );

  if (!weather) return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
      Loading weather...
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(135deg, #2c7a4b, #52b788)', borderRadius: '10px', padding: '1.5rem', color: 'white', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Current Weather</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{island}, Hawaii</div>
      <div style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
        {Math.round(weather.main.temp)}°F
      </div>
      <div style={{ textTransform: 'capitalize', fontSize: '1rem' }}>
        {weather.weather[0].description}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>
        Humidity: {weather.main.humidity}% · Wind: {Math.round(weather.wind.speed)} mph
      </div>
    </div>
  );
}
