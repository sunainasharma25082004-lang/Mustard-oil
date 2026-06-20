import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderTracking, {
  USER_CANCELLABLE_STATUSES,
  formatOrderDate,
  formatOrderDateLong,
  getDeliveryEtaText,
} from '../components/OrderTracking';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../utils/api';

function MyOrders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyOrders = async (isRefresh = false) => {
    if (authLoading) return;
    if (!user) {
      navigate('/checkout', { state: { step: 2 } });
      return;
    }

    if (isRefresh) setRefreshing(true);

    try {
      const res = await orderApi.getMyOrders();
      // Safety: only keep orders that belong to current user (backend already filters, this is extra assurance)
      const userId = String(user._id);
      const myOrders = (res.data || []).filter(o => {
        if (!o.user) return true; // in case
        const orderUserId = typeof o.user === 'object' ? String(o.user._id || o.user) : String(o.user);
        return orderUserId === userId;
      });
      setOrders(myOrders);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrders(false);
  }, [user, authLoading, navigate]);

  const handleRefresh = () => {
    loadMyOrders(true);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setCancelling(true);
    try {
      await orderApi.cancel(cancelId, cancelReason);
      setCancelId(null);
      setCancelReason('');
      await loadMyOrders(true); // re-use the loader (with extra filter)
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <style>{`
        .my-orders-page {
          min-height: 100vh;
          background: #0b0b0b;
          padding: 100px 16px 48px;
          color: #fff;
        }
        .my-orders-container { max-width: 960px; margin: auto; }

        .my-orders-page-hero {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 28px 22px;
          margin-bottom: 28px;
          background:
            linear-gradient(135deg, rgba(212,175,55,.18), rgba(212,175,55,.04)),
            #141414;
          border: 1px solid rgba(212,175,55,.28);
          text-align: center;
        }
        .my-orders-page-hero::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -30px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,55,.25), transparent 70%);
          pointer-events: none;
        }
        .my-orders-page-hero h1 {
          position: relative;
          color: #d4af37;
          margin: 0 0 8px;
          font-size: 1.75rem;
        }
        .my-orders-page-hero p {
          position: relative;
          color: #bdbdbd;
          margin: 0;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .order-history-card {
          background: #141414;
          border: 1px solid rgba(212,175,55,.2);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,.25);
        }
        .order-history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .order-num { color: #d4af37; font-weight: 700; font-size: 1.05rem; word-break: break-all; }
        .order-meta { color: #888; font-size: 0.82rem; margin-top: 4px; line-height: 1.45; }
        .order-status {
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .status-pending { background: rgba(255,193,7,.15); color: #ffc107; }
        .status-confirmed { background: rgba(13,202,240,.15); color: #0dcaf0; }
        .status-shipped { background: rgba(111,66,193,.15); color: #a78bfa; }
        .status-delivered { background: rgba(25,135,84,.15); color: #4ade80; }
        .status-cancelled { background: rgba(220,53,69,.15); color: #ff6b6b; }

        .delivery-hero {
          background: linear-gradient(135deg, rgba(212,175,55,.14), rgba(212,175,55,.05));
          border: 1px solid rgba(212,175,55,.3);
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }
        .delivery-hero-main h3 {
          margin: 0 0 6px;
          color: #d4af37;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .delivery-hero-date {
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.35;
        }
        .delivery-hero-sub {
          margin: 6px 0 0;
          color: #aaa;
          font-size: 0.88rem;
        }
        .delivery-eta-badge {
          padding: 10px 18px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .eta-normal { background: rgba(212,175,55,.2); color: #f7d76a; }
        .eta-soon { background: rgba(13,202,240,.2); color: #0dcaf0; }
        .eta-today { background: rgba(74,222,128,.2); color: #4ade80; }
        .eta-overdue { background: rgba(255,107,107,.2); color: #ff8a8a; }

        .tracking-panel {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px;
          padding: 16px 14px;
          margin-bottom: 18px;
        }
        .tracking-panel-title {
          margin: 0 0 14px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #888;
          font-weight: 600;
        }
        .order-tracking { margin-bottom: 0; }
        .tracking-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .tracking-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          padding: 0 6px;
        }
        .tracking-step-marker {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: center;
          margin-bottom: 10px;
          position: relative;
        }
        .tracking-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #333;
          border: 2px solid #555;
          flex-shrink: 0;
          z-index: 1;
          transition: all 0.3s;
        }
        .tracking-line {
          position: absolute;
          top: 50%;
          left: calc(50% + 10px);
          right: calc(-50% + 10px);
          height: 2px;
          background: #333;
          transform: translateY(-50%);
        }
        .tracking-step:last-child .tracking-line { display: none; }
        .tracking-step-completed .tracking-dot {
          background: #d4af37;
          border-color: #d4af37;
          box-shadow: 0 0 8px rgba(212,175,55,.5);
        }
        .tracking-step-completed .tracking-line { background: #d4af37; }
        .tracking-step-active .tracking-dot {
          background: #d4af37;
          border-color: #f7d76a;
          box-shadow: 0 0 0 4px rgba(212,175,55,.25);
          width: 16px;
          height: 16px;
        }
        .tracking-step-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: #666;
        }
        .tracking-step-completed .tracking-step-label,
        .tracking-step-active .tracking-step-label { color: #e0e0e0; }
        .tracking-step-active .tracking-step-label { color: #d4af37; }
        .tracking-step-desc {
          display: block;
          font-size: 0.72rem;
          color: #555;
          margin-top: 3px;
        }
        .tracking-step-active .tracking-step-desc { color: #888; }

        .cancelled-banner {
          background: rgba(220,53,69,.1);
          border: 1px solid rgba(220,53,69,.3);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 20px;
        }
        .cancelled-banner strong { color: #ff8a8a; }
        .cancelled-banner p { margin: 6px 0 0; color: #ccc; font-size: 0.9rem; }

        .order-items-section {
          border-top: 1px solid rgba(255,255,255,.06);
          padding-top: 16px;
        }
        .order-items-section h4 {
          margin: 0 0 12px;
          color: #888;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .order-item-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,.04);
          color: #ccc;
          font-size: 0.9rem;
        }
        .order-total {
          color: #d4af37;
          font-weight: 700;
          font-size: 1.1rem;
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
        }

        .cancel-policy-note {
          margin-top: 14px;
          font-size: 0.8rem;
          color: #666;
        }
        .cancel-btn {
          margin-top: 10px;
          padding: 10px 22px;
          border-radius: 50px;
          border: 1px solid #ff6b6b;
          background: transparent;
          color: #ff6b6b;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .cancel-btn:hover { background: rgba(255,107,107,.15); }

        .no-cancel-note {
          margin-top: 14px;
          padding: 10px 14px;
          background: rgba(255,255,255,.04);
          border-radius: 10px;
          font-size: 0.82rem;
          color: #777;
        }

        .cancel-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.75);
          display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 20px;
        }
        .cancel-modal {
          background: #141414;
          border: 1px solid rgba(212,175,55,.2);
          border-radius: 20px;
          padding: 28px;
          width: 100%; max-width: 450px;
        }
        .cancel-modal h3 { color: #d4af37; margin: 0 0 16px; }
        .cancel-modal textarea {
          width: 100%; padding: 14px; border-radius: 12px;
          border: 1px solid rgba(212,175,55,.2);
          background: #1b1b1b; color: #fff; outline: none;
          margin-bottom: 16px; resize: vertical;
          box-sizing: border-box;
        }
        .modal-actions { display: flex; gap: 12px; }
        .modal-btn {
          flex: 1; padding: 12px; border-radius: 50px;
          border: none; font-weight: 700; cursor: pointer;
        }
        .modal-btn-confirm { background: #ff6b6b; color: #fff; }
        .modal-btn-cancel { background: transparent; color: #d4af37; border: 1px solid #d4af37; }
        .modal-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .my-orders-page {
            padding: 88px 12px 40px;
          }
          .my-orders-page-hero {
            border-radius: 16px;
            padding: 22px 16px;
            margin-bottom: 20px;
          }
          .my-orders-page-hero h1 { font-size: 1.45rem; }
          .my-orders-page-hero p { font-size: 0.86rem; }

          .order-history-card {
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .order-history-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .order-status {
            align-self: flex-start;
            font-size: 0.7rem;
          }
          .delivery-hero {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
          }
          .delivery-hero-date { font-size: 1.05rem; }
          .delivery-eta-badge {
            width: 100%;
            text-align: center;
            padding: 12px 16px;
            font-size: 0.88rem;
          }
          .tracking-panel { padding: 14px 12px; }
          .tracking-steps {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .tracking-step {
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
            padding: 0 0 18px;
            gap: 0;
          }
          .tracking-step:last-child { padding-bottom: 0; }
          .tracking-step-marker {
            width: 28px;
            flex-direction: column;
            margin-bottom: 0;
            margin-right: 12px;
            min-width: 28px;
            align-self: stretch;
          }
          .tracking-line {
            top: 20px;
            left: 50%;
            right: auto;
            bottom: 0;
            width: 2px;
            height: auto;
            transform: translateX(-50%);
          }
          .tracking-step-content { flex: 1; padding-top: 1px; }
          .tracking-step-label { font-size: 0.88rem; }
          .tracking-step-desc { font-size: 0.78rem; margin-top: 2px; }
          .order-item-row {
            font-size: 0.86rem;
            gap: 12px;
          }
          .order-item-row span:first-child { flex: 1; min-width: 0; }
          .cancel-btn { width: 100%; text-align: center; }
          .modal-actions { flex-direction: column; }
          .cancel-modal { padding: 22px 18px; border-radius: 16px; }
        }

        @media (max-width: 380px) {
          .my-orders-page { padding-inline: 10px; }
          .delivery-hero-date { font-size: 0.98rem; }
        }
      `}</style>

      <div className="my-orders-page">
        <div className="my-orders-container">
          <div className="my-orders-page-hero">
            <h1>My Orders</h1>
            <p>Track delivery status and estimated arrival for every order</p>
            {user && (
              <p style={{ marginTop: 8, fontSize: '0.85rem', color: '#d4af37' }}>
                Showing orders placed by you — <strong>{user.name}</strong> ({user.email})
              </p>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              style={{
                marginTop: 10,
                padding: '6px 16px',
                fontSize: '0.75rem',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'transparent',
                color: '#d4af37',
                cursor: 'pointer'
              }}
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh Orders'}
            </button>
          </div>

          {error && <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: 20 }}>{error}</p>}

          {loading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="order-history-card" style={{ textAlign: 'center' }}>
              <p style={{ color: '#888' }}>You haven't placed any orders with this account yet.</p>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '8px 0 16px' }}>
                Only orders you place after signing in will appear here.
              </p>
              <button
                onClick={() => navigate('/products')}
                style={{ marginTop: 8, padding: '12px 24px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#f7d76a,#d4af37)', fontWeight: 700, cursor: 'pointer' }}
              >
                Shop Now &amp; Place Your First Order
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const canCancel = USER_CANCELLABLE_STATUSES.includes(order.status);
              const eta =
                order.expectedDeliveryDate && order.status !== 'cancelled' && order.status !== 'delivered'
                  ? getDeliveryEtaText(order.expectedDeliveryDate)
                  : null;

              return (
                <div className="order-history-card" key={order._id}>
                  <div className="order-history-header">
                    <div>
                      <div className="order-num">{order.orderNumber}</div>
                      <div className="order-meta">Placed on {formatOrderDate(order.createdAt)}</div>
                      {order.paymentMethod && (
                        <div className="order-meta">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                          {order.paymentStatus === 'paid' && ' · Payment received'}
                        </div>
                      )}
                    </div>
                    <span className={`order-status status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {order.status === 'cancelled' ? (
                    <div className="cancelled-banner">
                      <strong>Order Cancelled</strong>
                      {order.cancellationReason && (
                        <p>
                          {order.cancelledBy === 'admin' ? 'Cancelled by admin' : 'Cancelled by you'}:{' '}
                          {order.cancellationReason}
                        </p>
                      )}
                      {order.cancelledAt && (
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 4 }}>
                          on {formatOrderDate(order.cancelledAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      {order.expectedDeliveryDate && (
                        <div className="delivery-hero">
                          <div className="delivery-hero-main">
                            <h3>Expected Delivery</h3>
                            <p className="delivery-hero-date">
                              {formatOrderDateLong(order.expectedDeliveryDate)}
                            </p>
                            <p className="delivery-hero-sub">
                              Within <strong>{order.deliveryDays} business days</strong> from order date
                            </p>
                          </div>
                          {eta && (
                            <span className={`delivery-eta-badge eta-${eta.tone}`}>
                              {eta.label}
                            </span>
                          )}
                          {order.status === 'delivered' && (
                            <span className="delivery-eta-badge eta-today">Delivered</span>
                          )}
                        </div>
                      )}

                      {order.shiprocket?.awb && (
                        <div className="delivery-hero" style={{ marginBottom: 12, padding: '14px 16px' }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#d4af37', textTransform: 'uppercase' }}>
                            Courier Tracking
                          </p>
                          <p style={{ margin: '6px 0 0', fontSize: '0.95rem' }}>
                            AWB:{' '}
                            <a
                              href={order.shiprocket.trackingUrl || `https://shiprocket.co/tracking/${order.shiprocket.awb}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#fff', fontWeight: 700 }}
                            >
                              {order.shiprocket.awb}
                            </a>
                            {order.shiprocket.courierName ? ` · ${order.shiprocket.courierName}` : ''}
                          </p>
                        </div>
                      )}

                      <div className="tracking-panel">
                        <p className="tracking-panel-title">Order Tracking</p>
                        <OrderTracking status={order.status} />
                      </div>
                    </>
                  )}

                  <div className="order-items-section">
                    <h4>Items</h4>
                    {order.items.map((item, i) => (
                      <div className="order-item-row" key={i}>
                        <span>{item.productName} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="order-total">
                      <span>Total</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {canCancel && (
                    <>
                      <p className="cancel-policy-note">
                        You can cancel this order until it is shipped.
                      </p>
                      <button className="cancel-btn" onClick={() => setCancelId(order._id)}>
                        Cancel Order
                      </button>
                    </>
                  )}

                  {!canCancel && order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <p className="no-cancel-note">
                      This order can no longer be cancelled because it has already been confirmed or shipped.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {cancelId && (
        <div className="cancel-modal-overlay" onClick={() => setCancelId(null)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Order</h3>
            <p style={{ color: '#bbb', marginBottom: 16, fontSize: '0.9rem' }}>
              Orders can only be cancelled before shipping. Please tell us why you want to cancel.
            </p>
            <textarea
              rows="4"
              placeholder="Enter cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setCancelId(null)}>
                Go Back
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrders;