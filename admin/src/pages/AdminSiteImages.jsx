import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { resolveImageUrl } from '../utils/imageUrl';

const STORE_URL = (import.meta.env.VITE_STORE_URL || 'http://localhost:5173').replace(/\/$/, '');

const DEFAULT_PROCESS_STEPS = [
  { key: 'sourcing', image: '' },
  { key: 'cold-pressing', image: '' },
  {
    key: 'natural-filtering',
    image: 'https://t4.ftcdn.net/jpg/04/28/39/13/360_F_428391329_rhOO1cHy4gIFlUCvBfq0md0Mzefn0dJi.jpg',
  },
  {
    key: 'lab-testing',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU1jZQpq6-adv87fSgdI7IyvAaSaF_jk9gbxcxQzTnTQ&s=10',
  },
  {
    key: 'sealed-shipped',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUFE0qHUYux6BhcmCn3Mmbj1ZEIOS3KDmbFeU8HEmAoQ&s=10',
  },
];

const PROCESS_STEP_LABELS = {
  sourcing: 'Sourcing',
  'cold-pressing': 'Cold Pressing',
  'natural-filtering': 'Natural Filtering',
  'lab-testing': 'Lab Testing',
  'sealed-shipped': 'Sealed & Shipped',
};

const emptyForm = {
  logo: '',
  heroDesktop: '',
  heroMobile: '',
  aboutImage: '',
  distributorHero: '',
  distributorBanner: '',
  distributorShowcase: [],
  distributorBenefits: [],
  processSteps: DEFAULT_PROCESS_STEPS,
};

function ImageField({ label, hint, value, onChange, uploading, onUpload }) {
  return (
    <div className="admin-form-group">
      <label>{label}</label>
      {hint && <p className="admin-hint" style={{ marginTop: -4 }}>{hint}</p>}
      <div className="admin-file-picker">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e.target.files?.[0])}
          disabled={uploading}
        />
        {uploading && <span style={{ color: '#888', fontSize: '0.85rem' }}>Uploading...</span>}
        {value && <img src={resolveImageUrl(value)} alt="" className="admin-thumb admin-thumb-lg" />}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/logo.jpeg or /uploads/site/..."
        style={{ marginTop: 10 }}
      />
    </div>
  );
}

function AdminSiteImages() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    return adminApi
      .getSiteImages()
      .then((res) => {
        const data = { ...emptyForm, ...res.data };
        data.processSteps = DEFAULT_PROCESS_STEPS.map((step) => {
          const match = data.processSteps?.find((item) => item.key === step.key);
          return {
            key: step.key,
            image: match?.image || step.image || '',
          };
        });
        setForm(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadFor = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setError('');
    try {
      const res = await adminApi.uploadImage(file, 'site');
      setField(key, res.data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingKey('');
    }
  };

  const uploadShowcase = async (index, file) => {
    if (!file) return;
    const uploadKey = `showcase-${index}`;
    setUploadingKey(uploadKey);
    setError('');
    try {
      const res = await adminApi.uploadImage(file, 'site');
      setForm((prev) => {
        const next = [...prev.distributorShowcase];
        next[index] = { ...next[index], image: res.data.url };
        return { ...prev, distributorShowcase: next };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingKey('');
    }
  };

  const uploadProcessStep = async (index, file) => {
    if (!file) return;
    const uploadKey = `process-${index}`;
    setUploadingKey(uploadKey);
    setError('');
    try {
      const res = await adminApi.uploadImage(file, 'site');
      setForm((prev) => {
        const next = [...prev.processSteps];
        next[index] = { ...next[index], image: res.data.url };
        return { ...prev, processSteps: next };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingKey('');
    }
  };

  const uploadBenefit = async (index, file) => {
    if (!file) return;
    const uploadKey = `benefit-${index}`;
    setUploadingKey(uploadKey);
    setError('');
    try {
      const res = await adminApi.uploadImage(file, 'site');
      setForm((prev) => {
        const next = [...prev.distributorBenefits];
        next[index] = { ...next[index], image: res.data.url };
        return { ...prev, distributorBenefits: next };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingKey('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminApi.updateSiteImages(form);
      setForm({ ...emptyForm, ...res.data });
      setSuccess('Site images saved. Refresh the store to see updates.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <p style={{ color: '#888' }}>Loading site images...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Site Images</h1>
          <p className="admin-header-sub">
            Control logo, home banner, about page, and distributor page images —{' '}
            <a href={STORE_URL} target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>
              {STORE_URL}
            </a>
          </p>
        </div>
        <a href={STORE_URL} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline">
          View Store
        </a>
      </div>

      {success && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(76, 175, 80, 0.12)',
            border: '1px solid rgba(76, 175, 80, 0.35)',
            color: '#8fd99a',
            fontSize: '0.9rem',
          }}
        >
          {success}
        </div>
      )}

      {error && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Logo</h2>
          <ImageField
            label="Logo (Navbar & Footer)"
            hint="Shown in the top navigation and footer."
            value={form.logo}
            onChange={(value) => setField('logo', value)}
            uploading={uploadingKey === 'logo'}
            onUpload={(file) => uploadFor('logo', file)}
          />
        </div>

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Hero Section — Home Page</h2>
          <p className="admin-hint" style={{ marginTop: -8, marginBottom: 20 }}>
            Change the top banner image separately for laptop/desktop and mobile screens.
            Upload a file from your computer or paste an image URL.
          </p>
          <ImageField
            label="Laptop / Desktop View"
            hint="This image shows on laptops, desktops, and large tablets."
            value={form.heroDesktop}
            onChange={(value) => setField('heroDesktop', value)}
            uploading={uploadingKey === 'heroDesktop'}
            onUpload={(file) => uploadFor('heroDesktop', file)}
          />
          <ImageField
            label="Mobile View"
            hint="This image shows on phones and small screens only."
            value={form.heroMobile}
            onChange={(value) => setField('heroMobile', value)}
            uploading={uploadingKey === 'heroMobile'}
            onUpload={(file) => uploadFor('heroMobile', file)}
          />
        </div>

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>About Page</h2>
          <ImageField
            label="About Page Image"
            value={form.aboutImage}
            onChange={(value) => setField('aboutImage', value)}
            uploading={uploadingKey === 'aboutImage'}
            onUpload={(file) => uploadFor('aboutImage', file)}
          />
        </div>

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Home — Process Section</h2>
          <p className="admin-hint" style={{ marginTop: -8, marginBottom: 20 }}>
            Change images for the &quot;From field to your kitchen&quot; steps on the home page.
            Upload a file or paste an image URL.
          </p>
          {form.processSteps.map((item, index) => (
            <div
              key={item.key}
              className="admin-form-group"
              style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}
            >
              <ImageField
                label={PROCESS_STEP_LABELS[item.key] || `Step ${index + 1}`}
                hint={`Step ${index + 1} image`}
                value={item.image}
                onChange={(value) => {
                  const next = [...form.processSteps];
                  next[index] = { ...next[index], image: value };
                  setField('processSteps', next);
                }}
                uploading={uploadingKey === `process-${index}`}
                onUpload={(file) => uploadProcessStep(index, file)}
              />
            </div>
          ))}
        </div>

        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Distributor Page</h2>
          <ImageField
            label="Hero Background"
            value={form.distributorHero}
            onChange={(value) => setField('distributorHero', value)}
            uploading={uploadingKey === 'distributorHero'}
            onUpload={(file) => uploadFor('distributorHero', file)}
          />
          <ImageField
            label="Why Join Us Banner"
            value={form.distributorBanner}
            onChange={(value) => setField('distributorBanner', value)}
            uploading={uploadingKey === 'distributorBanner'}
            onUpload={(file) => uploadFor('distributorBanner', file)}
          />

          <h3 style={{ color: '#d4af37', marginTop: 28 }}>Product Showcase Cards</h3>
          {form.distributorShowcase.map((item, index) => (
            <div key={`showcase-${index}`} className="admin-form-group" style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
              <label>Card {index + 1}</label>
              <input
                value={item.label}
                onChange={(e) => {
                  const next = [...form.distributorShowcase];
                  next[index] = { ...next[index], label: e.target.value };
                  setField('distributorShowcase', next);
                }}
                placeholder="Label (e.g. 1 Litre Pack)"
                style={{ marginBottom: 12 }}
              />
              <ImageField
                label="Image"
                value={item.image}
                onChange={(value) => {
                  const next = [...form.distributorShowcase];
                  next[index] = { ...next[index], image: value };
                  setField('distributorShowcase', next);
                }}
                uploading={uploadingKey === `showcase-${index}`}
                onUpload={(file) => uploadShowcase(index, file)}
              />
            </div>
          ))}

          <h3 style={{ color: '#d4af37', marginTop: 28 }}>Why Join Us — Benefit Images</h3>
          {form.distributorBenefits.map((item, index) => (
            <div key={`benefit-${index}`} className="admin-form-group" style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
              <label>Benefit {index + 1}: {item.title}</label>
              <ImageField
                label="Image"
                value={item.image}
                onChange={(value) => {
                  const next = [...form.distributorBenefits];
                  next[index] = { ...next[index], image: value };
                  setField('distributorBenefits', next);
                }}
                uploading={uploadingKey === `benefit-${index}`}
                onUpload={(file) => uploadBenefit(index, file)}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Site Images'}
        </button>
      </form>
    </>
  );
}

export default AdminSiteImages;