import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../utils/api';

const GATEWAYS = [
  { id: 'razorpay', label: 'Razorpay', fields: ['keyId', 'keySecret'] },
  { id: 'paytm', label: 'Paytm', fields: ['merchantId', 'merchantKey', 'website'] },
  { id: 'instamojo', label: 'Instamojo', fields: ['apiKey', 'authToken', 'salt'] },
  { id: 'cashfree', label: 'Cashfree', fields: ['appId', 'secretKey'] },
];

const FIELD_LABELS = {
  keyId: 'Key ID',
  keySecret: 'Key Secret',
  merchantId: 'Merchant ID',
  merchantKey: 'Merchant Key',
  website: 'Website',
  apiKey: 'API Key',
  authToken: 'Auth Token',
  salt: 'Salt',
  appId: 'App ID',
  secretKey: 'Secret Key',
};

const FIELD_HINTS = {
  website: 'Use WEBSTAGING for test, DEFAULT for production',
  salt: 'Optional — required by some Instamojo integrations',
};

const isSecretField = (field) =>
  /secret|key|token|salt/i.test(field) && !['keyId', 'apiKey', 'appId'].includes(field);

const validationBadgeClass = (status) => {
  if (status === 'valid') return 'admin-badge-valid';
  if (status === 'invalid') return 'admin-badge-invalid';
  return 'admin-badge-unknown';
};

function AdminPaymentGateways() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [activeGateway, setActiveGateway] = useState('razorpay');
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingGateway, setSavingGateway] = useState('');
  const [switchingGateway, setSwitchingGateway] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const applySettings = (data) => {
    setSettings(data);
    setActiveGateway(data.activeGateway || 'razorpay');
    const initial = {};
    GATEWAYS.forEach((gw) => {
      initial[gw.id] = {
        enabled: data[gw.id]?.enabled || false,
        environment: data[gw.id]?.environment || 'test',
      };
      gw.fields.forEach((f) => {
        initial[gw.id][f] = '';
      });
    });
    setForms(initial);
  };

  const loadSettings = () => {
    setLoading(true);
    return adminApi
      .getPaymentGateways()
      .then((res) => applySettings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateField = (gateway, field, value) => {
    setForms((prev) => ({
      ...prev,
      [gateway]: { ...prev[gateway], [field]: value },
    }));
  };

  const saveGateway = async (gateway) => {
    setSavingGateway(gateway);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.updatePaymentGateways({
        gateway,
        enabled: forms[gateway].enabled,
        credentials: forms[gateway],
      });
      applySettings(res.data);
      setMessage(`${GATEWAYS.find((g) => g.id === gateway)?.label} credentials validated and saved`);
    } catch (err) {
      setError(err.message);
      await loadSettings();
    } finally {
      setSavingGateway('');
    }
  };

  const toggleGateway = async (gateway, enabled) => {
    setSavingGateway(gateway);
    setError('');
    setMessage('');
    updateField(gateway, 'enabled', enabled);
    try {
      const res = await adminApi.updatePaymentGateways({
        gateway,
        enabled,
        action: 'toggle',
      });
      applySettings(res.data);
      setMessage(`${GATEWAYS.find((g) => g.id === gateway)?.label} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setError(err.message);
      await loadSettings();
    } finally {
      setSavingGateway('');
    }
  };

  const switchActiveGateway = async () => {
    setSwitchingGateway(true);
    setError('');
    setMessage('');
    try {
      const res = await adminApi.updatePaymentGateways({ activeGateway });
      applySettings(res.data);
      const label = GATEWAYS.find((g) => g.id === activeGateway)?.label || activeGateway;
      setMessage(
        activeGateway === 'none'
          ? 'Online payments disabled — no active gateway'
          : `Active gateway switched to ${label}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSwitchingGateway(false);
    }
  };

  const getGatewayOptions = () => {
    const options = GATEWAYS.filter((gw) => {
      const gwSettings = settings?.[gw.id];
      const isReady = gwSettings?.enabled && gwSettings?.validationStatus === 'valid';
      const isCurrent = settings?.activeGateway === gw.id;
      return isReady || isCurrent;
    });

    if (options.length === 0 && settings?.activeGateway && settings.activeGateway !== 'none') {
      const current = GATEWAYS.find((gw) => gw.id === settings.activeGateway);
      if (current) options.push(current);
    }

    return options;
  };

  const gatewayOptions = getGatewayOptions();

  if (!user?.isSuperAdmin) {
    return (
      <>
        <div className="admin-header">
          <h1>Payment Gateway Settings</h1>
        </div>
        <div className="admin-card">
          <div className="admin-empty-state">
            <p>Super Admin access required for payment gateway settings.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Payment Gateway Settings</h1>
          <p className="admin-header-sub">
            Add, validate, and switch payment gateways — credentials are encrypted in the database
          </p>
        </div>
      </div>

      {loading && <p style={{ color: '#888' }}>Loading payment gateway settings...</p>}
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && (
        <>
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <h3 className="admin-section-title">Active Payment Gateway</h3>
            <p className="admin-hint" style={{ marginTop: -12, marginBottom: 16 }}>
              Switch checkout gateway without code changes. Only validated &amp; enabled gateways can be activated.
            </p>
            <div className="admin-toolbar">
              <select
                value={activeGateway}
                onChange={(e) => setActiveGateway(e.target.value)}
                className="admin-select"
                style={{ minWidth: 220 }}
              >
                {gatewayOptions.map((gw) => (
                  <option key={gw.id} value={gw.id}>{gw.label}</option>
                ))}
                <option value="none">None (disable online payments)</option>
              </select>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={switchActiveGateway}
                disabled={switchingGateway}
              >
                {switchingGateway ? 'Switching...' : 'Switch Gateway'}
              </button>
            </div>
            <div className="admin-status-box" style={{ marginTop: 16, marginBottom: 0 }}>
              Currently active:{' '}
              <strong>
                {settings?.activeGateway === 'none'
                  ? 'None'
                  : GATEWAYS.find((g) => g.id === settings?.activeGateway)?.label || settings?.activeGateway}
              </strong>
            </div>
          </div>

          <div className="admin-gateway-stack">
            {GATEWAYS.map((gw) => {
              const gwSettings = settings?.[gw.id] || {};
              const isActive = settings?.activeGateway === gw.id;

              return (
                <div className="admin-card" key={gw.id}>
                  <div className="admin-gateway-header">
                    <div>
                      <h3>{gw.label}</h3>
                      {isActive && (
                        <span className="admin-badge admin-badge-confirmed" style={{ marginTop: 6 }}>
                          Active Gateway
                        </span>
                      )}
                    </div>
                    <label className="admin-checkbox-row" style={{ marginBottom: 0 }}>
                      <input
                        type="checkbox"
                        checked={forms[gw.id]?.enabled || false}
                        disabled={savingGateway === gw.id || !gwSettings.configured || gwSettings.validationStatus !== 'valid'}
                        onChange={(e) => toggleGateway(gw.id, e.target.checked)}
                      />
                      Enabled
                    </label>
                  </div>

                  <div className="admin-gateway-meta">
                    <span className={`admin-badge ${validationBadgeClass(gwSettings.validationStatus)}`}>
                      {gwSettings.validationStatus === 'valid'
                        ? 'Validated'
                        : gwSettings.validationStatus === 'invalid'
                          ? 'Invalid'
                          : 'Not validated'}
                    </span>
                    <span className={`admin-badge ${gwSettings.configured ? 'admin-badge-active' : 'admin-badge-unknown'}`}>
                      {gwSettings.configured ? 'Credentials saved' : 'Not configured'}
                    </span>
                    {gwSettings.lastValidatedAt && (
                      <span>
                        Last validated: {new Date(gwSettings.lastValidatedAt).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="admin-form-grid">
                    {gw.fields.map((field) => (
                      <div className="admin-form-group" key={field}>
                        <label>{FIELD_LABELS[field]}</label>
                        <input
                          type={isSecretField(field) ? 'password' : 'text'}
                          placeholder={
                            gwSettings[field] === '********'
                              ? '******** (leave blank to keep)'
                              : `Enter ${FIELD_LABELS[field]}`
                          }
                          value={forms[gw.id]?.[field] || ''}
                          onChange={(e) => updateField(gw.id, field, e.target.value)}
                        />
                        {FIELD_HINTS[field] && <p className="admin-hint">{FIELD_HINTS[field]}</p>}
                      </div>
                    ))}
                    <div className="admin-form-group">
                      <label>Environment</label>
                      <select
                        className="admin-select"
                        style={{ width: '100%' }}
                        value={forms[gw.id]?.environment || 'test'}
                        onChange={(e) => updateField(gw.id, 'environment', e.target.value)}
                      >
                        <option value="test">Test / Sandbox</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-toolbar" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      onClick={() => saveGateway(gw.id)}
                      disabled={Boolean(savingGateway)}
                    >
                      {savingGateway === gw.id ? 'Validating...' : `Save & Validate ${gw.label}`}
                    </button>
                    {!gwSettings.configured && (
                      <span className="admin-hint" style={{ margin: 0 }}>
                        Credentials are validated with the provider before saving
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default AdminPaymentGateways;