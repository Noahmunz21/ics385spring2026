function About({ description, targetSegment }) {
  return (
    <section className="about" id="about">
      <h2>About Our Property</h2>
      <p>{description}</p>
      <p className="segment">Perfect for: <strong>{targetSegment}</strong></p>
    </section>
  );
}

export default About;
