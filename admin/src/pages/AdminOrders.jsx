import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || '';
const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const paymentBadgeClass = (status) => {
  if (status === 'paid') return 'admin-badge admin-badge-delivered';
  if (status === 'failed') return 'admin-badge admin-badge-cancelled';
  return 'admin-badge admin-badge-pending';
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [defaultDays, setDefaultDays] = useState(5);
  const [savingDefault, setSavingDefault] = useState(false);
  const [orderDeliveryDays, setOrderDeliveryDays] = useState({});
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadOrders = () => {
    setLoading(true);
    adminApi
      .getOrders(filter || undefined)
      .then((res) => {
        setOrders(res.data);
        const daysMap = {};
        res.data.forEach((o) => {
          daysMap[o._id] = o.deliveryDays || defaultDays;
        });
        setOrderDeliveryDays(daysMap);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API_URL}/api/settings/delivery`)
      .then((r) => r.json())
      .then((res) => setDefaultDays(res.data?.defaultDeliveryDays || 5))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const saveDefaultDays = async () => {
    setSavingDefault(true);
    setError('');
    try {
      await adminApi.updateDeliverySettings({ defaultDeliveryDays: defaultDays });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDefault(false);
    }
  };

  const updateDeliveryDays = async (orderId) => {
    try {
      await adminApi.updateOrder(orderId, { deliveryDays: orderDeliveryDays[orderId] });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'cancelled') {
      setCancelModal({ orderId: order._id, orderNumber: order.orderNumber });
      setCancelReason('');
      return;
    }
    updateStatus(order._id, newStatus);
  };

  const updateStatus = async (id, status, cancellationReason) => {
    try {
      const body = { status };
      if (cancellationReason) body.cancellationReason = cancellationReason;
      await adminApi.updateOrder(id, body);
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmAdminCancel = async () => {
    if (!cancelReason.trim()) return;
    await updateStatus(cancelModal.orderId, 'cancelled', cancelReason);
    setCancelModal(null);
    setCancelReason('');
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDeliveryDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const totalItems = (order) =>
    order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="admin-header">
        <h1>Orders</h1>
        <select
          className="admin-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Orders</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 12px', fontSize: '1rem' }}>Default Delivery Time</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', margin: '0 0 16px' }}>
          New orders will show this delivery estimate to customers. You can change per order below.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="number"
            min="1"
            max="30"
            className="admin-select"
            style={{ width: 80 }}
            value={defaultDays}
            onChange={(e) => setDefaultDays(Number(e.target.value))}
          />
          <span style={{ color: '#bbb' }}>days</span>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={saveDefaultDays} disabled={savingDefault}>
            {savingDefault ? 'Saving...' : 'Save Default'}
          </button>
        </div>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="orders-list">
        {loading ? (
          <p style={{ color: '#888' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="admin-card">
            <p style={{ color: '#888', margin: 0 }}>No orders found</p>
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedId === order._id;

            return (
              <div className="order-card" key={order._id}>
                <div className="order-card-header" onClick={() => toggleExpand(order._id)}>
                  <div className="order-card-main">
                    <div>
                      <span className="order-number">{order.orderNumber}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="order-customer-brief">
                      <strong>{order.customer.fullName}</strong>
                      <span>{order.customer.phone}</span>
                    </div>
                    {order.deliveryDays && order.status !== 'cancelled' && (
                      <small style={{ color: '#d4af37' }}>
                        Delivery: {order.deliveryDays} days
                        {order.expectedDeliveryDate && ` — by ${formatDeliveryDate(order.expectedDeliveryDate)}`}
                      </small>
                    )}
                  </div>

                  <div className="order-card-meta">
                    <div className="order-meta-item">
                      <span className="label">Items</span>
                      <span className="value">{totalItems(order)} pcs</span>
                    </div>
                    <div className="order-meta-item">
                      <span className="label">Total</span>
                      <span className="value gold">₹{order.totalAmount}</span>
                    </div>
                    <div className="order-meta-item">
                      <span className={`admin-badge admin-badge-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-meta-item">
                      <span className={paymentBadgeClass(order.paymentStatus)}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <span className={`order-expand-icon ${isExpanded ? 'open' : ''}`}>▼</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-card-details">
                    {order.status === 'cancelled' && order.cancellationReason && (
                      <div className="cancel-info-box">
                        <strong>Cancelled by {order.cancelledBy}</strong>
                        <p>{order.cancellationReason}</p>
                        {order.cancelledAt && (
                          <small>Cancelled on {formatDate(order.cancelledAt)}</small>
                        )}
                      </div>
                    )}

                    <div className="order-details-grid">
                      <div className="order-detail-section">
                        <h4>Customer Details</h4>
                        <div className="detail-row">
                          <span>Name</span>
                          <span>{order.customer.fullName}</span>
                        </div>
                        <div className="detail-row">
                          <span>Phone</span>
                          <span>{order.customer.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span>Email</span>
                          <span>{order.customer.email || '—'}</span>
                        </div>
                        {order.user?.name && (
                          <div className="detail-row">
                            <span>Account</span>
                            <span>{order.user.name} ({order.user.email})</span>
                          </div>
                        )}
                      </div>

                      <div className="order-detail-section">
                        <h4>Shipping Address</h4>
                        <div className="detail-row">
                          <span>Address</span>
                          <span>{order.customer.address}</span>
                        </div>
                        <div className="detail-row">
                          <span>City</span>
                          <span>{order.customer.city}</span>
                        </div>
                        <div className="detail-row">
                          <span>Pincode</span>
                          <span>{order.customer.pincode}</span>
                        </div>
                      </div>

                      <div className="order-detail-section">
                        <h4>Delivery & Payment</h4>
                        {order.status !== 'cancelled' && (
                          <>
                            <div className="detail-row">
                              <span>Delivery Days</span>
                              <span>{order.deliveryDays || '—'} days</span>
                            </div>
                            <div className="detail-row">
                              <span>Expected By</span>
                              <span>
                                {order.expectedDeliveryDate
                                  ? formatDeliveryDate(order.expectedDeliveryDate)
                                  : '—'}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="detail-row">
                          <span>Payment</span>
                          <span>{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                        </div>
                        <div className="detail-row">
                          <span>Pay Status</span>
                          <span className={paymentBadgeClass(order.paymentStatus)}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="order-items-section">
                      <h4>Order Items</h4>
                      <table className="order-items-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Unit Price</th>
                            <th>Quantity</th>
                            <th>Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={`${order._id}-item-${index}`}>
                              <td>{index + 1}</td>
                              <td>{item.productName}</td>
                              <td>₹{item.price}</td>
                              <td>
                                <span className="qty-badge">{item.quantity}</span>
                              </td>
                              <td className="gold">₹{item.price * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" className="text-right">Subtotal</td>
                            <td>₹{order.subtotal}</td>
                          </tr>
                          <tr>
                            <td colSpan="4" className="text-right">Delivery Charge</td>
                            <td>₹{order.deliveryCharge}</td>
                          </tr>
                          <tr className="total-row">
                            <td colSpan="4" className="text-right">Grand Total</td>
                            <td>₹{order.totalAmount}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="order-actions">
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <label>
                          Delivery Days:
                          <input
                            type="number"
                            min="1"
                            max="30"
                            className="admin-select"
                            style={{ width: 70, marginLeft: 8 }}
                            value={orderDeliveryDays[order._id] ?? order.deliveryDays ?? 5}
                            onChange={(e) =>
                              setOrderDeliveryDays((prev) => ({
                                ...prev,
                                [order._id]: Number(e.target.value),
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            style={{ marginLeft: 8 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateDeliveryDays(order._id);
                            }}
                          >
                            Update
                          </button>
                        </label>
                      )}

                      <label>
                        Status:
                        <select
                          className="admin-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <span className="order-updated">
                        Last updated: {formatDate(order.updatedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {cancelModal && (
        <div className="admin-modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Order</h2>
            <p style={{ color: '#bbb', marginBottom: 16 }}>
              Order <strong style={{ color: '#d4af37' }}>{cancelModal.orderNumber}</strong> — enter reason for cancellation (visible to customer).
            </p>
            <textarea
              rows="4"
              placeholder="Cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ width: '100%', padding: 12, background: '#1b1b1b', border: '1px solid rgba(212,175,55,.2)', borderRadius: 10, color: '#fff', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="admin-btn admin-btn-danger" onClick={confirmAdminCancel} disabled={!cancelReason.trim()}>
                Confirm Cancel
              </button>
              <button className="admin-btn admin-btn-outline" onClick={() => setCancelModal(null)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminOrders;