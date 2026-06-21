import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DELIVERY_CHARGE, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentApi, paymentConfigApi, settingsApi, shippingApi } from '../utils/api';
import { loadRazorpayScript, openRazorpayCheckout } from '../utils/razorpay';
import AuthModal from './AuthModal';
import GoogleSignInButton from './GoogleSignInButton';
import OrderTracking, { formatOrderDateLong } from './OrderTracking';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginWithGoogle } = useAuth();
  const { items, subtotal, total, clearCart } = useCart();

  const [step, setStep] = useState(location.state?.step === 2 ? 2 : 1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [paymentConfig, setPaymentConfig] = useState({ activeGateway: 'razorpay', enabled: true, label: 'Razorpay' });
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    settingsApi.getDelivery().then((res) => setDeliveryDays(res.data.defaultDeliveryDays)).catch(() => {});
    paymentConfigApi.getConfig().then((res) => setPaymentConfig(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        pincode: prev.pincode || user.pincode || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'pincode') setPincodeStatus(null);
  };

  const checkPincodeDelivery = async (pincode) => {
    if (!/^\d{6}$/.test(pincode)) return;
    try {
      const qty = items.reduce((sum, item) => sum + item.quantity, 0);
      const res = await shippingApi.checkServiceability(pincode, qty);
      setPincodeStatus(res.data);
    } catch {
      setPincodeStatus(null);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInError = (message) => {
    setError(message || 'Google sign-in failed');
  };

  const goToPayment = (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty. Add products before checkout.');
      return;
    }

    setStep(2);
  };

  const orderPayload = {
    customer: formData,
    items: items.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    })),
  };

  const handleOnlinePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load payment gateway. Please try again.');
    }

    const response = await paymentApi.createRazorpayOrder(orderPayload);

    openRazorpayCheckout({
      orderData: response.data.order,
      razorpayData: response.data.razorpay,
      user,
      onSuccess: async (razorpayResponse) => {
        try {
          setLoading(true);
          const verified = await paymentApi.verifyRazorpayPayment({
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });
          clearCart();
          setSuccess(verified.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      onError: (err) => {
        if (err.message !== 'Payment cancelled') {
          setError(err.message);
        }
        setLoading(false);
      },
    });
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (!user) {
      // Safety net – UI should prevent this
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(true);
      await handleOnlinePayment();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <style>{`
          .checkout-success-tracking .tracking-steps {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            margin-top: 8px;
          }
          .checkout-success-tracking .tracking-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0 4px;
          }
          .checkout-success-tracking .tracking-step-marker {
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: center;
            margin-bottom: 8px;
            position: relative;
          }
          .checkout-success-tracking .tracking-dot {
            width: 12px; height: 12px; border-radius: 50%;
            background: #333; border: 2px solid #555; z-index: 1;
          }
          .checkout-success-tracking .tracking-line {
            position: absolute; top: 50%; left: calc(50% + 8px);
            right: calc(-50% + 8px); height: 2px; background: #333;
            transform: translateY(-50%);
          }
          .checkout-success-tracking .tracking-step:last-child .tracking-line { display: none; }
          .checkout-success-tracking .tracking-step-completed .tracking-dot,
          .checkout-success-tracking .tracking-step-active .tracking-dot {
            background: #d4af37; border-color: #d4af37;
          }
          .checkout-success-tracking .tracking-step-label {
            font-size: 0.72rem; font-weight: 600; color: #666;
          }
          .checkout-success-tracking .tracking-step-active .tracking-step-label { color: #d4af37; }
          @media (max-width: 768px) {
            .checkout-success-page { padding: 88px 12px 32px !important; }
            .checkout-success-card { padding: 24px 18px !important; border-radius: 18px !important; }
            .checkout-success-tracking .tracking-steps {
              grid-template-columns: 1fr;
              gap: 0;
            }
            .checkout-success-tracking .tracking-step {
              flex-direction: row;
              align-items: flex-start;
              text-align: left;
              padding-bottom: 16px;
            }
            .checkout-success-tracking .tracking-step-marker {
              width: 24px;
              margin-right: 12px;
              margin-bottom: 0;
              flex-direction: column;
              align-self: stretch;
            }
            .checkout-success-tracking .tracking-line {
              top: 16px; left: 50%; right: auto; bottom: 0;
              width: 2px; height: auto; transform: translateX(-50%);
            }
            .checkout-success-actions { flex-direction: column !important; }
            .checkout-success-actions button { width: 100%; }
          }
        `}</style>
        <div className="checkout-page checkout-success-page" style={{ minHeight: '100vh', background: '#0b0b0b', padding: '120px 20px', color: 'white', textAlign: 'center' }}>
          <div className="checkout-success-card" style={{ maxWidth: 620, margin: 'auto', background: '#141414', padding: 40, borderRadius: 25, border: '1px solid rgba(212,175,55,.2)' }}>
            <h2 style={{ color: '#d4af37', marginBottom: 20 }}>Order Placed Successfully!</h2>
            <p>Thank you, {success.customer.fullName}!</p>
            <p style={{ marginTop: 15 }}>Order Number: <strong>{success.orderNumber}</strong></p>
            <p style={{ marginTop: 10 }}>Total: ₹{success.totalAmount}</p>
            {success.paymentMethod === 'online' && success.paymentStatus === 'paid' && (
              <p style={{ color: '#4ade80', marginTop: 10 }}>Payment received successfully</p>
            )}

            {success.expectedDeliveryDate && (
              <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,.12), rgba(212,175,55,.04))', border: '1px solid rgba(212,175,55,.3)', borderRadius: 16, padding: '18px 20px', marginTop: 24, textAlign: 'left' }}>
                <p style={{ color: '#d4af37', margin: 0, fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Delivery</p>
                <p style={{ color: '#fff', margin: '8px 0 4px', fontSize: '1.2rem', fontWeight: 700 }}>
                  {formatOrderDateLong(success.expectedDeliveryDate)}
                </p>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.88rem' }}>
                  Within <strong>{success.deliveryDays} business days</strong> from today
                </p>
              </div>
            )}

            <div className="checkout-success-tracking" style={{ marginTop: 24, textAlign: 'left' }}>
              <p style={{ color: '#888', margin: '0 0 4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Tracking</p>
              <OrderTracking status={success.status || 'pending'} compact />
            </div>

            <p style={{ color: '#bdbdbd', marginTop: 20, fontSize: '0.9rem' }}>
              You can cancel from My Orders until your order is shipped.
            </p>
            <div className="checkout-success-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/my-orders')}
                style={{ padding: '14px 30px', borderRadius: 50, border: '1px solid #d4af37', background: 'transparent', color: '#d4af37', fontWeight: 700, cursor: 'pointer' }}
              >
                Track My Order
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{ padding: '14px 30px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg, #f7d76a, #d4af37)', fontWeight: 700, cursor: 'pointer' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
      
      .checkout-page{
        min-height:100vh;
        background:#0b0b0b;
        padding:120px 20px 60px;
        color:white;
      }

      .checkout-container{
        max-width:1200px;
        margin:auto;
        display:grid;
        grid-template-columns:2fr 1fr;
        gap:30px;
      }

      .checkout-card,
      .order-card{
        background:#141414;
        border:1px solid rgba(212,175,55,.2);
        border-radius:25px;
        padding:30px;
      }

      .checkout-title{
        color:#d4af37;
        margin-bottom:25px;
      }

      .checkout-steps{
        display:flex;
        gap:20px;
        margin-bottom:30px;
      }

      .checkout-step{
        flex:1;
        text-align:center;
        padding:12px;
        border-radius:12px;
        background:#1b1b1b;
        color:#888;
        font-size:0.9rem;
        border:1px solid transparent;
      }

      .checkout-step.active{
        color:#d4af37;
        border-color:rgba(212,175,55,.3);
        background:rgba(212,175,55,.08);
      }

      .checkout-step.done{
        color:#4ade80;
      }

      .form-group{
        margin-bottom:18px;
      }

      .form-group label{
        display:block;
        margin-bottom:8px;
      }

      .form-group input,
      .form-group textarea{
        width:100%;
        padding:14px;
        border-radius:12px;
        border:1px solid rgba(212,175,55,.2);
        background:#1b1b1b;
        color:white;
        outline:none;
      }

      .form-row{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:15px;
      }

      .order-item{
        display:flex;
        justify-content:space-between;
        margin-bottom:15px;
      }

      .total{
        border-top:1px solid rgba(255,255,255,.1);
        padding-top:15px;
        margin-top:15px;
        font-size:22px;
        font-weight:700;
        color:#d4af37;
      }

      .place-order-btn{
        width:100%;
        margin-top:25px;
        padding:16px;
        border:none;
        border-radius:50px;
        background:linear-gradient(135deg,#f7d76a,#d4af37);
        color:black;
        font-weight:700;
        cursor:pointer;
      }

      .place-order-btn:disabled{
        opacity:0.6;
        cursor:not-allowed;
      }

      .place-order-btn:hover:not(:disabled){
        transform:translateY(-3px);
      }

      .back-btn{
        width:100%;
        margin-top:12px;
        padding:14px;
        border-radius:50px;
        background:transparent;
        color:#d4af37;
        border:1px solid #d4af37;
        font-weight:600;
        cursor:pointer;
      }

      .checkout-error{
        background:rgba(220,53,69,.15);
        border:1px solid rgba(220,53,69,.4);
        color:#ff6b6b;
        padding:12px 16px;
        border-radius:12px;
        margin-bottom:20px;
      }

      .empty-cart-msg{
        color:#bdbdbd;
        text-align:center;
        padding:20px 0;
      }

      .payment-methods{
        display:flex;
        gap:12px;
        margin-bottom:24px;
      }

      .payment-method{
        flex:1;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(212,175,55,.2);
        background:#1b1b1b;
        color:#fff;
        cursor:pointer;
        text-align:center;
        transition:.2s;
      }

      .payment-method.active{
        border-color:#d4af37;
        background:rgba(212,175,55,.1);
        color:#d4af37;
      }

      .payment-method small{
        display:block;
        color:#888;
        margin-top:4px;
        font-size:0.75rem;
      }

      .logged-in-badge{
        background:rgba(74,222,128,.1);
        border:1px solid rgba(74,222,128,.3);
        color:#4ade80;
        padding:12px 16px;
        border-radius:12px;
        margin-bottom:20px;
        font-size:0.9rem;
      }

      @media(max-width:900px){
        .checkout-container{ grid-template-columns:1fr; }
        .form-row{ grid-template-columns:1fr; }
        .payment-methods{ flex-direction:column; }
      }

      @media(max-width:768px){
        .checkout-page{
          padding:96px 14px 40px;
          padding-top:calc(96px + env(safe-area-inset-top, 0));
        }
        .checkout-card,
        .order-card{
          padding:22px 18px;
          border-radius:18px;
        }
        .checkout-steps{
          flex-direction:column;
          gap:10px;
        }
        .checkout-title{
          font-size:1.35rem;
        }
        .place-order-btn,
        .back-btn{
          min-height:48px;
        }
      }

      `}</style>

      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-card">
            <div className="checkout-steps">
              <div className={`checkout-step ${step === 1 ? 'active' : 'done'}`}>
                1. Shipping
              </div>
              <div className={`checkout-step ${step === 2 ? 'active' : ''}`}>
                2. Payment
              </div>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            {step === 1 ? (
              <form onSubmit={goToPayment}>
                <h2 className="checkout-title">Shipping Details</h2>

                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea rows="4" name="address" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={(e) => checkPincodeDelivery(e.target.value.trim())}
                      required
                      maxLength={6}
                    />
                    {pincodeStatus && (
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: '0.82rem',
                          color: pincodeStatus.serviceable ? '#4ade80' : '#f87171',
                        }}
                      >
                        {pincodeStatus.message}
                        {pincodeStatus.estimatedDeliveryDays
                          ? ` · Est. ${pincodeStatus.estimatedDeliveryDays} days`
                          : ''}
                      </p>
                    )}
                  </div>
                </div>

                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
                  No sign-in required for shipping details. You will be asked to sign in securely before completing payment.
                </p>
                <button type="submit" className="place-order-btn" disabled={items.length === 0}>
                  Continue to Payment
                </button>
              </form>
            ) : (
              <>
                <h2 className="checkout-title">Payment</h2>

                <div style={{ background: 'rgba(212,175,55,.08)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: '0.9rem', color: '#ccc' }}>
                  Estimated delivery within <strong style={{ color: '#d4af37' }}>{deliveryDays} days</strong> after order confirmation
                </div>

                <div className="payment-methods">
                  <div className="payment-method active" style={{ cursor: 'default' }}>
                    Online Payment
                    <small>
                      {paymentConfig.enabled && paymentConfig.label
                        ? `UPI, Card, Netbanking via ${paymentConfig.label}`
                        : 'Online payment is currently unavailable'}
                    </small>
                  </div>
                </div>

                {/* === AUTH REQUIRED (Professional separate flow) === */}
                {!user ? (
                  <div
                    style={{
                      background: '#1b1b1b',
                      border: '1px solid rgba(212,175,55,.25)',
                      borderRadius: 18,
                      padding: '28px 24px',
                      textAlign: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔒</div>
                    <h4 style={{ color: '#d4af37', margin: '0 0 8px', fontSize: '1.1rem' }}>
                      Sign in Required
                    </h4>
                    <p style={{ color: '#bdbdbd', fontSize: '0.93rem', lineHeight: 1.45, margin: '0 0 20px' }}>
                      To place an order and track your purchase, please sign in or create an account.<br />
                      Your shipping details are already saved for this checkout.
                    </p>

                    <div style={{ maxWidth: 320, margin: '0 auto' }}>
                      <GoogleSignInButton
                        onSuccess={handleGoogleSignIn}
                        onError={handleGoogleSignInError}
                        disabled={loading}
                        loading={loading}
                        width={320}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        margin: '18px 0 14px',
                        color: '#666',
                        fontSize: '0.82rem',
                        maxWidth: 320,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                    >
                      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
                      <span>or email</span>
                      <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.1)' }} />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      style={{
                        width: '100%',
                        maxWidth: 320,
                        padding: '15px 24px',
                        borderRadius: 50,
                        border: '1px solid rgba(212,175,55,.45)',
                        background: 'transparent',
                        color: '#d4af37',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                      }}
                    >
                      Sign In / Register with Email
                    </button>

                    <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#777' }}>
                      Sign in ke baad turant payment complete kar sakte ho.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="logged-in-badge">
                      Signed in as <strong>{user.name}</strong> ({user.email})
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        style={{
                          marginLeft: 12,
                          background: 'transparent',
                          border: '1px solid rgba(212,175,55,.4)',
                          color: '#d4af37',
                          borderRadius: 50,
                          padding: '4px 12px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        My Profile
                      </button>
                    </div>

                    <button
                      className="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={loading || items.length === 0 || !paymentConfig.enabled}
                    >
                      {loading ? 'Processing...' : paymentConfig.enabled ? `Pay Online — ₹${total}` : 'Payment Unavailable'}
                    </button>
                  </>
                )}

                <button className="back-btn" onClick={() => setStep(1)}>
                  ← Back to Shipping
                </button>
              </>
            )}
          </div>

          <div className="order-card">
            <h2 className="checkout-title">Order Summary</h2>

            {items.length === 0 ? (
              <p className="empty-cart-msg">No items in cart</p>
            ) : (
              items.map((item) => (
                <div className="order-item" key={item._id}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>
                    {item.originalPrice && item.originalPrice > item.price ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{textDecoration:'line-through', color: '#d4af37', opacity:0.75, fontSize:'0.85em'}}>₹{item.originalPrice * item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </span>
                    ) : (
                      <>₹{item.price * item.quantity}</>
                    )}
                  </span>
                </div>
              ))
            )}

            {items.length > 0 && (
              <>
                <div className="order-item">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {DELIVERY_CHARGE > 0 && (
                  <div className="order-item">
                    <span>Delivery</span>
                    <span>₹{DELIVERY_CHARGE}</span>
                  </div>
                )}
                <div className="total">Total : ₹{total}</div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Auth Modal - clean separate signin flow for checkout */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign in to complete your order"
      />
    </>
  );
}

export default Checkout;