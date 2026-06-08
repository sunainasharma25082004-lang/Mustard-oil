import { useEffect, useState } from 'react';
import { distributorApi } from '../utils/api';

function Distributor() {
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

      .dist-container{ max-width:1200px; margin:auto; }

      .dist-header{ text-align:center; margin-bottom:60px; }

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

      .dist-info,
      .dist-form,
      .dist-status-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.15);
        border-radius:30px;
        padding:35px;
      }

      .dist-info h2,
      .dist-form h2,
      .dist-status-card h2{
        color:#d4af37;
        margin-bottom:25px;
      }

      .feature{ display:flex; gap:15px; margin-bottom:25px; }

      .feature-icon{
        width:55px; height:55px; border-radius:50%;
        background:rgba(212,175,55,.12);
        display:flex; align-items:center; justify-content:center;
        font-size:24px;
      }

      .feature h4{ color:#fff; margin-bottom:5px; }
      .feature p{ color:#bdbdbd; margin:0; }

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
        .dist-header h1{ font-size:2.7rem; }
      }

      @media(max-width:768px){
        .form-grid{ grid-template-columns:1fr; }
        .dist-header h1{ font-size:2.2rem; }
      }
      `}</style>

      <div className="distributor-page">
        <div className="dist-container">
          <div className="dist-header">
            <div className="dist-badge">BECOME A DISTRIBUTOR</div>
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