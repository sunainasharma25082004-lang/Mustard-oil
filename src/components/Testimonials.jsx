function Testimonials() {
  return (
    <section className="testimonial-section">

      <div className="container">

        <div className="section-heading">

          <span style={{color:'#d8bf4e'}}>TESTIMONIALS</span>

          <h2 style={{ color: '#f1c812', fontWeight: 'bold' }}>
            What Customers Say
          </h2>

        </div>

        <div className="row">

          <div className="col-md-4">

            <div className="review-card">

              <h5>
                Excellent Quality
              </h5>

              <p>
                Best mustard oil we have
                used. Pure aroma and
                authentic taste.
              </p>

            </div>

          </div>

          <div className="col-md-4">

            <div className="review-card">

              <h5>
                Highly Recommended
              </h5>

              <p>
                Great packaging and
                premium quality oil.
              </p>

            </div>

          </div>

          <div className="col-md-4">

            <div className="review-card">

              <h5>
                Traditional Taste
              </h5>

              <p>
                Reminds us of village
                extracted mustard oil.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Testimonials;