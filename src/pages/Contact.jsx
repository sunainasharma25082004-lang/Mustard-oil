import { useState } from "react";
import { contactApi } from "../utils/api";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const containsLink = (text) => {
    if (!text) return false;
    // Block common URLs, www, domains, etc.
    const linkRegex = /(https?:\/\/|www\.|[\w-]+\.(com|in|org|net|co|io|gov|edu|uk|us|biz|info))/i;
    return linkRegex.test(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (containsLink(formData.message)) {
      setError("Links, URLs or website addresses are not allowed in the message.");
      return;
    }

    setLoading(true);

    try {
      await contactApi.send(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`

      .lux-contact-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:130px 20px 80px;
        position:relative;
        overflow:hidden;
      }

      .lux-contact-page::before{
        content:"";
        position:absolute;
        width:500px;
        height:500px;
        border-radius:50%;
        background:rgba(212,175,55,.08);
        top:-150px;
        right:-150px;
        filter:blur(120px);
      }

      .contact-heading{
        text-align:center;
        margin-bottom:70px;
      }

      .contact-heading span{
        color:#d4af37;
        letter-spacing:3px;
        font-size:14px;
        font-weight:600;
      }

      .contact-heading h1{
        color:#fff;
        font-size:4rem;
        font-weight:800;
        margin:15px 0;
      }

      .contact-heading p{
        max-width:700px;
        margin:auto;
        color:#bdbdbd;
        line-height:1.8;
      }

      .contact-card,
      .form-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.15);
        border-radius:30px;
        padding:35px;
        height:100%;
        transition:.4s;
      }

      .contact-card:hover,
      .form-card:hover{
        border-color:#d4af37;
        transform:translateY(-6px);
      }

      .contact-card h3,
      .form-card h3{
        color:#d4af37;
        margin-bottom:30px;
      }

      .contact-item{
        display:flex;
        align-items:center;
        gap:15px;
        margin-bottom:25px;
      }

      .contact-icon{
        width:60px;
        height:60px;
        border-radius:50%;
        background:rgba(212,175,55,.15);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:24px;
      }

      .contact-item h5{
        color:#fff;
        margin-bottom:5px;
      }

      .contact-item p{
        color:#cfcfcf;
        margin:0;
      }

      .lux-input{
        width:100%;
        padding:16px 18px;
        margin-bottom:18px;
        border-radius:15px;
        border:1px solid rgba(212,175,55,.15);
        background:#1c1c1c;
        color:#fff;
        outline:none;
      }

      .lux-input:focus{
        border-color:#d4af37;
      }

      .lux-btn{
        width:100%;
        padding:16px;
        border:none;
        border-radius:50px;
        font-weight:700;
        background:linear-gradient(
          135deg,
          #f5d76e,
          #d4af37
        );
        color:#000;
        transition:.3s;
      }

      .lux-btn:hover{
        transform:translateY(-3px);
        box-shadow:0 10px 25px rgba(212,175,55,.35);
      }

      @media(max-width:768px){

        .contact-heading h1{
          font-size:2.5rem;
        }

        .contact-card,
        .form-card{
          padding:25px;
        }

      }

      `}</style>

      <section className="lux-contact-page">

        <div className="container">

          <div className="contact-heading">

            <span>GET IN TOUCH</span>

            <h1>Contact Us</h1>

            <p>
              Have questions about our premium mustard oil products?
              We'd love to hear from you.
            </p>

          </div>

          <div className="row g-4">

            <div className="col-lg-5">

              <div className="contact-card">

                <h3>Contact Information</h3>

                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div>
                    <h5>Phone</h5>
                    <p>+91 87086 21377</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">✉️</div>
                  <div>
                    <h5>Email</h5>
                    <p>karyorfarms@gmail.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div>
                    <h5>Location</h5>
                    <p>Hisar, Haryana</p>
                  </div>
                </div>

              </div>

            </div>

            <div className="col-lg-7">

              <div className="form-card">

                <h3>Send Message</h3>

                <form onSubmit={handleSubmit}>

                  {error && (
                    <p style={{ color: "#ff6b6b", marginBottom: 15 }}>{error}</p>
                  )}

                  {success && (
                    <p style={{ color: "#4ade80", marginBottom: 15 }}>
                      Message sent! We will get back to you soon.
                    </p>
                  )}

                  <div className="row">

                    <div className="col-md-6">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="lux-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="lux-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                  </div>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    className="lux-input"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <textarea
                    rows="6"
                    name="message"
                    placeholder="Write Your Message..."
                    className="lux-input"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <p style={{ fontSize: '0.8rem', color: '#888', margin: '-8px 0 14px 4px' }}>
                    No links or URLs allowed. We will get back to you soon.
                  </p>

                  <button
                    type="submit"
                    className="lux-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
}

export default Contact;