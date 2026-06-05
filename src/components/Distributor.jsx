import React, { useState } from "react";

function Distributor() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    business: "",
    experience: "",
    investment: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = `
*New Distributor Request*

Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

City: ${formData.city}
State: ${formData.state}

Business Name: ${formData.business}

Experience:
${formData.experience}

Investment Capacity:
${formData.investment}

I want to become a Karyor Distributor.
`;

    const whatsappUrl = `https://wa.me/919999999999?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <style>{`

      *{
        box-sizing:border-box;
      }

      .distributor-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:120px 20px 80px;
        position:relative;
        overflow:hidden;
      }

      .distributor-page::before{
        content:"";
        position:absolute;
        width:500px;
        height:500px;
        border-radius:50%;
        background:rgba(212,175,55,.08);
        top:-200px;
        right:-150px;
        filter:blur(120px);
      }

      .dist-container{
        max-width:1200px;
        margin:auto;
      }

      .dist-header{
        text-align:center;
        margin-bottom:60px;
      }

      .dist-badge{
        display:inline-block;
        color:#d4af37;
        letter-spacing:3px;
        font-size:13px;
        font-weight:700;
        margin-bottom:15px;
      }

      .dist-header h1{
        color:#fff;
        font-size:4rem;
        margin-bottom:20px;
        font-weight:800;
      }

      .dist-header p{
        color:#bdbdbd;
        max-width:750px;
        margin:auto;
        line-height:1.8;
      }

      .dist-wrapper{
        display:grid;
        grid-template-columns:1fr 1.4fr;
        gap:30px;
      }

      .dist-info{
        background:#141414;
        border:1px solid rgba(212,175,55,.15);
        border-radius:30px;
        padding:35px;
      }

      .dist-info h2{
        color:#d4af37;
        margin-bottom:25px;
      }

      .feature{
        display:flex;
        gap:15px;
        margin-bottom:25px;
      }

      .feature-icon{
        width:55px;
        height:55px;
        border-radius:50%;
        background:rgba(212,175,55,.12);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:24px;
      }

      .feature h4{
        color:#fff;
        margin-bottom:5px;
      }

      .feature p{
        color:#bdbdbd;
        margin:0;
      }

      .dist-form{
        background:#141414;
        border:1px solid rgba(212,175,55,.15);
        border-radius:30px;
        padding:35px;
      }

      .dist-form h2{
        color:#d4af37;
        margin-bottom:25px;
      }

      .form-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:15px;
      }

      .dist-input,
      .dist-textarea{
        width:100%;
        background:#1c1c1c;
        border:1px solid rgba(212,175,55,.15);
        color:#fff;
        border-radius:15px;
        padding:16px;
        outline:none;
        margin-bottom:15px;
      }

      .dist-input:focus,
      .dist-textarea:focus{
        border-color:#d4af37;
      }

      .dist-textarea{
        resize:none;
      }

      .submit-btn{
        width:100%;
        border:none;
        padding:16px;
        border-radius:50px;
        font-weight:700;
        font-size:16px;
        cursor:pointer;
        background:linear-gradient(
          135deg,
          #f7d76a,
          #d4af37
        );
        color:#000;
        transition:.3s;
      }

      .submit-btn:hover{
        transform:translateY(-4px);
        box-shadow:0 12px 30px rgba(212,175,55,.35);
      }

      .note{
        text-align:center;
        color:#999;
        margin-top:15px;
        font-size:14px;
      }

      @media(max-width:992px){

        .dist-wrapper{
          grid-template-columns:1fr;
        }

        .dist-header h1{
          font-size:2.7rem;
        }

      }

      @media(max-width:768px){

        .form-grid{
          grid-template-columns:1fr;
        }

        .dist-header h1{
          font-size:2.2rem;
        }

      }

      `}</style>
      

      <div className="distributor-page">


        <div className="dist-container">

          <div className="dist-header">
            <div className="dist-badge">
              BECOME A DISTRIBUTOR
            </div>

            <h1>Join The Karyor Network</h1>

            <p>
              Become an authorized Karyor Mustard Oil distributor and
              grow your business with a trusted premium brand.
            </p>
          </div>

          <div className="dist-wrapper">

            <div className="dist-info">

              <h2>Why Join Us?</h2>

              <div className="feature">
                <div className="feature-icon">🏆</div>
                <div>
                  <h4>Trusted Brand</h4>
                  <p>High quality mustard oil with strong market demand.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">📈</div>
                <div>
                  <h4>Business Growth</h4>
                  <p>Expand your distribution network and profits.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">🤝</div>
                <div>
                  <h4>Full Support</h4>
                  <p>Marketing and business assistance from our team.</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">🚚</div>
                <div>
                  <h4>Reliable Supply</h4>
                  <p>Consistent stock and fast delivery support.</p>
                </div>
              </div>

            </div>

            <form className="dist-form" onSubmit={handleSubmit}>

              <h2>Distributor Application Form</h2>

              <div className="form-grid">

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="dist-input"
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  className="dist-input"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-grid">

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="dist-input"
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="business"
                  placeholder="Business Name"
                  className="dist-input"
                  onChange={handleChange}
                />

              </div>

              <div className="form-grid">

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className="dist-input"
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className="dist-input"
                  onChange={handleChange}
                />

              </div>

              <textarea
                rows="4"
                name="experience"
                placeholder="Business Experience"
                className="dist-textarea"
                onChange={handleChange}
              />

              <textarea
                rows="4"
                name="investment"
                placeholder="Investment Capacity"
                className="dist-textarea"
                onChange={handleChange}
              />

              <button
                type="submit"
                className="submit-btn"
              >
                Apply For Distributorship
              </button>

              <div className="note">
                You will be redirected to WhatsApp after submission.
              </div>

            </form>

          </div>

        </div>

      </div>
    </>
  );
}

export default Distributor;