import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';

const connectionBadgeClass = (status) => {
  if (status === 'connected') return 'admin-badge-valid';
  if (status === 'failed') return 'admin-badge-invalid';
  return 'admin-badge-unknown';
};

const connectionLabel = (status) => {
  if (status === 'connected') return 'Connected';
  if (status === 'failed') return 'Failed';
  return 'Not tested';
};

function AdminShippingSettings() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    enabled: false,
    pickupLocation: 'Primary',
    pickupPincode: '',
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    companyAddress: '',
    companyCity: '',
    companyState: 'Delhi',
    companyPincode: '',
    defaultWeight: 0.5,
    defaultLength: 20,
    defaultBreadth: 15,
    defaultHeight: 10,
    autoAssignAwb: true,
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const applyStatus = (data) => {
    setStatus(data);
    setForm((prev) => ({
      ...prev,
      email: data.email || '',
      password: '',
      enabled: data.enabled || false,
      pickupLocation: data.pickupLocation || 'Primary',
      pickupPincode: data.pickupPincode || '',
      companyName: data.companyName || '',
      companyPhone: data.companyPhone || '',
      companyEmail: data.companyEmail || '',
      companyAddress: data.companyAddress || '',
      companyCity: data.companyCity || '',
      companyState: data.companyState || 'Delhi',
      companyPincode: data.companyPincode || '',
      defaultWeight: data.defaultWeight ?? 0.5,
      defaultLength: data.defaultLength ?? 20,
      defaultBreadth: data.defaultBreadth ?? 15,
      defaultHeight: data.defaultHeight ?? 10,
      autoAssignAwb: data.autoAssignAwb !== false,
    }));
  };

  const loadSettings = () => {
    setLoading(true);
    return adminApi
      .getShippingSettings()
      .then((res) => applyStatus(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.updateShippingSettings({
        email: form.email,
        password: form.password || undefined,
        pickupLocation: form.pickupLocation,
        pickupPincode: form.pickupPincode,
        companyName: form.companyName,
        companyPhone: form.companyPhone,
        companyEmail: form.companyEmail,
        companyAddress: form.companyAddress,
        companyCity: form.companyCity,
        companyState: form.companyState,
        companyPincode: form.companyPincode,
        defaultWeight: Number(form.defaultWeight),
        defaultLength: Number(form.defaultLength),
        defaultBreadth: Number(form.defaultBreadth),
        defaultHeight: Number(form.defaultHeight),
        autoAssignAwb: form.autoAssignAwb,
      });
      applyStatus(res.data);
      setMessage('Shiprocket settings saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!form.email?.trim()) {
      setError('Shiprocket API email enter karo');
      return;
    }

    const hasSavedPassword = status?.configured;
    if (!form.password?.trim() && !hasSavedPassword) {
      setError('Pehle API password enter karo, phir Test Connection dabao');
      return;
    }

    setTesting(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.testShippingConnection({
        email: form.email,
        password: form.password || undefined,
      });
      applyStatus(res.data);
      setMessage('Shiprocket login successful — email & password verified');
    } catch (err) {
      setError(err.message);
      await loadSettings();
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async (enabled) => {
    setToggling(true);
    setError('');
    setMessage('');
    setForm((prev) => ({ ...prev, enabled }));
    try {
      const res = await adminApi.updateShippingSettings({ enabled, action: 'toggle' });
      applyStatus(res.data);
      setMessage(`Shiprocket integration ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setError(err.message);
      await loadSettings();
    } finally {
      setToggling(false);
    }
  };

  const canEnable =
    status?.configured &&
    status?.connectionStatus === 'connected' &&
    Boolean(form.pickupPincode?.trim() || form.companyPincode?.trim());

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Shipping Settings</h1>
          <p className="admin-header-sub">
            Shiprocket API — credentials encrypted, orders auto-created after payment
          </p>
        </div>
      </div>

      {loading && <p style={{ color: '#888' }}>Loading shipping settings...</p>}
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && (
        <>
          <div className="admin-card" style={{ maxWidth: 720, marginBottom: 20 }}>
            <div className="admin-gateway-header">
              <h3 className="admin-section-title" style={{ marginBottom: 0 }}>
                Shiprocket API Login
              </h3>
              <label className="admin-checkbox-row" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={form.enabled}
                  disabled={toggling || !canEnable}
                  onChange={(e) => handleToggle(e.target.checked)}
                />
                Enabled
              </label>
            </div>

            <div className="admin-gateway-meta">
              <span className={`admin-badge ${connectionBadgeClass(status?.connectionStatus)}`}>
                {connectionLabel(status?.connectionStatus)}
              </span>
              <span className={`admin-badge ${status?.configured ? 'admin-badge-active' : 'admin-badge-unknown'}`}>
                {status?.configured ? 'Credentials saved' : 'Not configured'}
              </span>
              {status?.lastTestedAt && (
                <span>Last tested: {new Date(status.lastTestedAt).toLocaleString('en-IN')}</span>
              )}
            </div>

            {!canEnable && (
              <div className="admin-status-box">
                To enable: save credentials, test connection, and set warehouse pickup pincode.
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Shiprocket Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="api-user@yourcompany.com"
                  autoComplete="username"
                />
                <p className="admin-hint">
                API user email only — Shiprocket panel → <strong>Settings → API → Create API User</strong>.
                Normal shiprocket.in login email/password yahan kaam nahi karte.
              </p>
              </div>

              <div className="admin-form-group">
                <label>Shiprocket Password *</label>
                <input
                  type="password"
                  placeholder={
                    status?.password === '********'
                      ? '******** (leave blank to keep saved password)'
                      : 'Enter Shiprocket API password'
                  }
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>

              <div className="admin-toolbar" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={handleTest}
                  disabled={testing || saving || !form.email}
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  disabled={saving || testing || !form.email || (!form.password && !status?.configured)}
                  onClick={async () => {
                    setSaving(true);
                    setError('');
                    try {
                      const res = await adminApi.updateShippingSettings({
                        email: form.email,
                        password: form.password || undefined,
                      });
                      applyStatus(res.data);
                      setMessage('Credentials saved — ab Test Connection dabao');
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-card" style={{ maxWidth: 720 }}>
            <h3 className="admin-section-title">Warehouse &amp; Shipment Defaults</h3>
            {status?.webhookUrl && (
              <div className="admin-status-box" style={{ marginBottom: 16 }}>
                <strong>Production Webhook URL</strong>
                <p style={{ margin: '8px 0 0', wordBreak: 'break-all', fontSize: '0.88rem' }}>
                  <code style={{ color: '#d4af37' }}>{status.webhookUrl}</code>
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#888' }}>
                  Shiprocket panel → Settings → Webhooks → paste this URL.
                  {status.webhookSecretConfigured
                    ? ' Webhook secret is configured on server.'
                    : ' Set SHIPROCKET_WEBHOOK_SECRET in server env for security.'}
                </p>
              </div>
            )}

            <p className="admin-hint" style={{ marginBottom: 16 }}>
              Pickup location name must match your Shiprocket panel (Settings → Pickup Addresses).
            </p>

            <form onSubmit={handleSave}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Pickup Location Name *</label>
                  <input
                    value={form.pickupLocation}
                    onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                    placeholder="Primary"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Pickup Pincode *</label>
                  <input
                    value={form.pickupPincode}
                    onChange={(e) => setForm({ ...form, pickupPincode: e.target.value })}
                    placeholder="110001"
                    required
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Company / Brand Name</label>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Karyor Mustard Oil"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Company Phone</label>
                  <input
                    value={form.companyPhone}
                    onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Company Email</label>
                  <input
                    type="email"
                    value={form.companyEmail}
                    onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                    placeholder="orders@karyor.com"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Warehouse Address</label>
                <input
                  value={form.companyAddress}
                  onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                  placeholder="Warehouse address line"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>City</label>
                  <input value={form.companyCity} onChange={(e) => setForm({ ...form, companyCity: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>State</label>
                  <input value={form.companyState} onChange={(e) => setForm({ ...form, companyState: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Pincode</label>
                  <input
                    value={form.companyPincode}
                    onChange={(e) => setForm({ ...form, companyPincode: e.target.value })}
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Default Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={form.defaultWeight}
                    onChange={(e) => setForm({ ...form, defaultWeight: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Length (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.defaultLength}
                    onChange={(e) => setForm({ ...form, defaultLength: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Breadth (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.defaultBreadth}
                    onChange={(e) => setForm({ ...form, defaultBreadth: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.defaultHeight}
                    onChange={(e) => setForm({ ...form, defaultHeight: e.target.value })}
                  />
                </div>
              </div>

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={form.autoAssignAwb}
                  onChange={(e) => setForm({ ...form, autoAssignAwb: e.target.checked })}
                />
                Auto-assign AWB after order (recommended)
              </label>

              <div className="admin-toolbar" style={{ marginTop: 16 }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || testing}>
                  {saving ? 'Saving...' : 'Save All Settings'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}

export default AdminShippingSettings;