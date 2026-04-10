function Amenities({ amenities }) {
  return (
    <section className="amenities" id="amenities">
      <h2>Amenities</h2>
      <ul className="amenities-grid">
        {amenities.map((amenity, index) => (
          <li key={index} className="amenity-item">
            <span aria-hidden="true">🌺</span> {amenity}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Amenities;
