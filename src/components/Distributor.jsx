import { useEffect, useState } from 'react';
import { distributorApi } from '../utils/api';
import { useSiteImages } from '../context/SiteImagesContext';
import distributorHeroImage from '../assets/distributor-hero.jpg';

function Distributor() {
  const {
    logo,
    distributorBanner,
    distributorBenefits,
  } = useSiteImages();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusPhone, setStatusPhone] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    business: '',
    experience: '',
    investment: '',
  });

  const checkStatus = async (phone) => {
    if (!phone?.trim()) return;
    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);
    try {
      const res = await distributorApi.getStatus(phone.trim());
      setStatusResult(res.data);
      localStorage.setItem('karyor_distributor_phone', phone.trim());
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('karyor_distributor_phone');
    if (savedPhone) {
      setStatusPhone(savedPhone);
      checkStatus(savedPhone);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const submittedPhone = formData.phone;
      const res = await distributorApi.apply(formData);
      localStorage.setItem('karyor_distributor_phone', submittedPhone);
      setStatusPhone(submittedPhone);
      setSuccess(res.message);

      setFormData({
        name: '',
        phone: '',
        email: '',
        city: '',
        state: '',
        business: '',
        experience: '',
        investment: '',
      });

      await checkStatus(submittedPhone);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = (e) => {
    e.preventDefault();
    checkStatus(statusPhone);
  };

  return (
    <>
      <style>{`
      *{ box-sizing:border-box; }

      .distributor-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:100px 20px 80px;
        position:relative;
        overflow:hidden;
      }

      .distributor-page::before,
      .distributor-page::after{
        content:"";
        position:absolute;
        width:500px;
        height:500px;
        border-radius:50%;
        filter:blur(120px);
        pointer-events:none;
      }

      .distributor-page::before{
        background:rgba(212,175,55,.08);
        top:-200px;
        right:-150px;
      }

      .distributor-page::after{
        background:rgba(212,175,55,.05);
        bottom:-220px;
        left:-180px;
      }

      .dist-container{ max-width:1200px; margin:auto; position:relative; z-index:1; }

      .dist-hero{
        position:relative;
        border-radius:32px;
        overflow:hidden;
        margin-bottom:40px;
        border:1px solid rgba(212,175,55,.2);
        min-height:340px;
        display:flex;
        align-items:center;
      }

      .dist-hero-bg{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center;
      }

      .dist-hero-overlay{
        position:absolute;
        inset:0;
        background:linear-gradient(105deg,rgba(8,8,8,.92) 0%,rgba(8,8,8,.72) 45%,rgba(8,8,8,.35) 100%);
      }

      .dist-hero-content{
        position:relative;
        z-index:1;
        padding:48px 42px;
        max-width:720px;
      }

      .dist-badge{
        display:inline-block;
        color:#d4af37;
        letter-spacing:3px;
        font-size:13px;
        font-weight:700;
        margin-bottom:15px;
      }

      .dist-hero-content h1{
        color:#fff;
        font-size:3.4rem;
        margin-bottom:18px;
        font-weight:800;
        line-height:1.1;
      }

      .dist-hero-content p{
        color:#e0e0e0;
        line-height:1.8;
        margin-bottom:24px;
      }

      .dist-hero-stats{
        display:flex;
        flex-wrap:wrap;
        gap:14px;
      }

      .dist-hero-stat{
        display:flex;
        align-items:center;
        gap:10px;
        background:rgba(20,20,20,.75);
        border:1px solid rgba(212,175,55,.2);
        border-radius:999px;
        padding:10px 16px;
        color:#f5f5f5;
        font-size:0.88rem;
      }

      .dist-hero-stat img{
        width:28px;
        height:28px;
        border-radius:50%;
        object-fit:cover;
      }

      .dist-wrapper{
        display:grid;
        grid-template-columns:1fr 1.4fr;
        gap:30px;
      }

      .dist-info,
      .dist-form,
      .dist-status-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.15);
        border-radius:30px;
        padding:35px;
      }

      .dist-info-visual{
        position:relative;
        border-radius:22px;
        overflow:hidden;
        margin-bottom:28px;
        border:1px solid rgba(212,175,55,.18);
      }

      .dist-info-visual img{
        width:100%;
        height:auto;
        max-height:280px;
        object-fit:contain;
        object-position:center;
        display:block;
        background:#0a0a0a;
      }

      .dist-info-visual-badge{
        position:absolute;
        top:16px;
        left:16px;
        display:flex;
        align-items:center;
        gap:8px;
        background:rgba(0,0,0,.7);
        border:1px solid rgba(212,175,55,.3);
        border-radius:999px;
        padding:8px 14px;
        color:#fff;
        font-size:0.82rem;
        font-weight:600;
      }

      .dist-info-visual-badge img{
        width:22px;
        height:22px;
        border-radius:50%;
        object-fit:cover;
      }

      .dist-info h2,
      .dist-form h2,
      .dist-status-card h2{
        color:#d4af37;
        margin-bottom:25px;
      }

      .feature{ display:flex; gap:15px; margin-bottom:22px; align-items:center; }

      .feature-thumb{
        width:58px;
        height:58px;
        border-radius:16px;
        overflow:hidden;
        flex-shrink:0;
        border:1px solid rgba(212,175,55,.2);
        background:#1c1c1c;
      }

      .feature-thumb img{
        width:100%;
        height:100%;
        object-fit:cover;
      }

      .feature h4{ color:#fff; margin-bottom:5px; }
      .feature p{ color:#bdbdbd; margin:0; font-size:0.92rem; }

      .form-grid{ display:grid; grid-template-columns:1fr 1fr; gap:15px; }

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
      .dist-textarea:focus{ border-color:#d4af37; }

      .dist-textarea{ resize:none; }

      .submit-btn,
      .status-btn{
        width:100%;
        border:none;
        padding:16px;
        border-radius:50px;
        font-weight:700;
        font-size:16px;
        cursor:pointer;
        background:linear-gradient(135deg,#f7d76a,#d4af37);
        color:#000;
        transition:.3s;
      }

      .submit-btn:hover,
      .status-btn:hover{
        transform:translateY(-4px);
        box-shadow:0 12px 30px rgba(212,175,55,.35);
      }

      .submit-btn:disabled,
      .status-btn:disabled{ opacity:.6; cursor:not-allowed; transform:none; }

      .note{ text-align:center; color:#999; margin-top:15px; font-size:14px; }

      .dist-alert{
        padding:14px 16px;
        border-radius:14px;
        margin-bottom:18px;
        font-size:0.92rem;
        line-height:1.5;
      }

      .dist-alert-success{
        background:rgba(74,222,128,.12);
        border:1px solid rgba(74,222,128,.35);
        color:#8ef0b2;
      }

      .dist-alert-error{
        background:rgba(255,107,107,.12);
        border:1px solid rgba(255,107,107,.35);
        color:#ff9b9b;
      }

      .dist-alert-approved{
        background:linear-gradient(135deg,rgba(212,175,55,.18),rgba(74,222,128,.1));
        border:1px solid rgba(212,175,55,.4);
        color:#f7e7a3;
      }

      .dist-status-card{ margin-top:30px; }

      .status-badge{
        display:inline-block;
        padding:6px 14px;
        border-radius:50px;
        font-size:0.75rem;
        font-weight:700;
        text-transform:uppercase;
        margin-bottom:12px;
      }

      .status-pending{ background:rgba(255,193,7,.15); color:#ffc107; }
      .status-reviewed{ background:rgba(13,202,240,.15); color:#0dcaf0; }
      .status-approved{ background:rgba(74,222,128,.15); color:#4ade80; }
      .status-rejected{ background:rgba(255,107,107,.15); color:#ff8a8a; }

      @media(max-width:992px){
        .dist-wrapper{ grid-template-columns:1fr; }
        .dist-hero-content h1{ font-size:2.7rem; }
      }

      @media(max-width:768px){
        .form-grid{ grid-template-columns:1fr; }
        .dist-hero-content{ padding:34px 24px; }
        .dist-hero-content h1{ font-size:2.2rem; }
        .dist-hero{ min-height:300px; }
      }
      `}</style>

      <div className="distributor-page">
        <div className="dist-container">
          <section className="dist-hero">
            <img
              src={distributorHeroImage}
              alt="Karyor distributor partnership"
              className="dist-hero-bg"
              loading="eager"
            />
            <div className="dist-hero-overlay" />
            <div className="dist-hero-content">
              <div className="dist-badge">BECOME A DISTRIBUTOR</div>
              <h1>Join The Karyor Network</h1>
              <p>
                Become an authorized Karyor Mustard Oil distributor and
                grow your business with a premium brand trusted by Indian kitchens.
              </p>
              <div className="dist-hero-stats">
                <span className="dist-hero-stat">
                  <img src={logo} alt="Karyor" />
                  Authorized Partner Program
                </span>
                <span className="dist-hero-stat">
                  <img src={distributorBenefits[0]?.image} alt="Karyor bottle" />
                  Premium Product Range
                </span>
              </div>
            </div>
          </section>

          <div className="dist-wrapper">
            <div className="dist-info">
              <div className="dist-info-visual">
                <img src={distributorBanner} alt="Karyor mustard oil collection" loading="lazy" />
                <div className="dist-info-visual-badge">
                  <img src={logo} alt="Karyor" />
                  Partner with Karyor
                </div>
              </div>

              <h2>Why Join Us?</h2>
              {distributorBenefits.map((item) => (
                <div className="feature" key={item.title}>
                  <div className="feature-thumb">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="dist-form" onSubmit={handleSubmit}>
              <h2>Distributor Application Form</h2>

              {error && <div className="dist-alert dist-alert-error">{error}</div>}
              {success && <div className="dist-alert dist-alert-success">{success}</div>}

              <div className="form-grid">
                <input type="text" name="name" placeholder="Full Name" className="dist-input" value={formData.name} onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Phone Number" className="dist-input" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="form-grid">
                <input type="email" name="email" placeholder="Email Address" className="dist-input" value={formData.email} onChange={handleChange} />
                <input type="text" name="business" placeholder="Business Name" className="dist-input" value={formData.business} onChange={handleChange} />
              </div>

              <div className="form-grid">
                <input type="text" name="city" placeholder="City" className="dist-input" value={formData.city} onChange={handleChange} />
                <input type="text" name="state" placeholder="State" className="dist-input" value={formData.state} onChange={handleChange} />
              </div>

              <textarea rows="4" name="experience" placeholder="Business Experience" className="dist-textarea" value={formData.experience} onChange={handleChange} />
              <textarea rows="4" name="investment" placeholder="Investment Capacity" className="dist-textarea" value={formData.investment} onChange={handleChange} />

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Apply For Distributorship'}
              </button>

              <div className="note">
                After applying, your request will appear in the admin panel for review.
              </div>
            </form>
          </div>

          <div className="dist-status-card">
            <h2>Check Application Status</h2>
            <p style={{ color: '#aaa', marginBottom: 20, fontSize: '0.92rem' }}>
              Enter your phone number to see if you have been added as a Karyor distributor.
            </p>

            <form onSubmit={handleStatusCheck} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Your phone number"
                className="dist-input"
                style={{ flex: 1, minWidth: 200, marginBottom: 0 }}
                value={statusPhone}
                onChange={(e) => setStatusPhone(e.target.value)}
                required
              />
              <button type="submit" className="status-btn" style={{ width: 'auto', minWidth: 160, padding: '16px 28px' }} disabled={statusLoading}>
                {statusLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {statusError && <div className="dist-alert dist-alert-error" style={{ marginTop: 18 }}>{statusError}</div>}

            {statusResult && (
              <div className={`dist-alert ${statusResult.isApproved ? 'dist-alert-approved' : 'dist-alert-success'}`} style={{ marginTop: 18 }}>
                <span className={`status-badge status-${statusResult.status}`}>{statusResult.status}</span>
                <p style={{ margin: '10px 0 0', fontSize: '1rem' }}>{statusResult.message}</p>
                {statusResult.isApproved && statusResult.approvedAt && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#ccc' }}>
                    Approved on {new Date(statusResult.approvedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Distributor;