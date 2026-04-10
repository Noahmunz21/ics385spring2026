function Hero({ name, tagline }) {
  return (
    <section className="hero">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
        alt="Beautiful Maui beach at sunset with golden light reflecting on the water"
        className="hero-image"
      />
      <div className="hero-content">
        <h1>{name}</h1>
        <p className="tagline">{tagline}</p>
        <a href="#cta" className="hero-btn">Book Your Stay</a>
      </div>
    </section>
  );
}

export default Hero;
