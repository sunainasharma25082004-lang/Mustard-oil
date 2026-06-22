import { useEffect, useState } from 'react';
import { adminApi } from '../utils/api';
import { DEPARTMENT_PRESET_LABELS } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  adminPermissions: [],
};

function AdminTeam() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [catalog, setCatalog] = useState({ permissions: [], departmentPresets: {} });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getTeam(), adminApi.getPermissionCatalog()])
      .then(([teamRes, catalogRes]) => {
        setStaff(teamRes.data || []);
        setCatalog(catalogRes.data || { permissions: [], departmentPresets: {} });
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

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditing(member.id);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      department: member.department || '',
      adminPermissions: member.adminPermissions || [],
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError('');
  };

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      adminPermissions: prev.adminPermissions.includes(key)
        ? prev.adminPermissions.filter((item) => item !== key)
        : [...prev.adminPermissions, key],
    }));
  };

  const applyPreset = (presetKey) => {
    const preset = catalog.departmentPresets?.[presetKey] || [];
    setForm((prev) => ({
      ...prev,
      department: DEPARTMENT_PRESET_LABELS[presetKey] || prev.department,
      adminPermissions: [...preset],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!editing && !form.password) {
      setError('Password is required for new team members');
      return;
    }
    if (!form.adminPermissions.length) {
      setError('Select at least one section');
      return;
    }

    setSaving(true);
    setError('');
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      adminPermissions: form.adminPermissions,
    };
    if (form.password) body.password = form.password;

    try {
      if (editing) {
        await adminApi.updateTeamMember(editing, body);
        setSuccess('Team member updated.');
      } else {
        await adminApi.createTeamMember(body);
        setSuccess('Team member created.');
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this team member? They will lose admin access.')) return;
    setError('');
    try {
      await adminApi.deleteTeamMember(id);
      setSuccess('Team member removed.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <>
        <div className="admin-header">
          <h1>Team & Access</h1>
        </div>
        <div className="admin-card">
          <div className="admin-empty-state">
            <p>Super Admin access required to manage team permissions.</p>
          </div>
        </div>
      </>
    );
  }

  const groupedPermissions = catalog.permissions.reduce((acc, item) => {
    const group = item.department || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Team & Access</h1>
          <p className="admin-header-sub">
            Create department logins and control which admin sections each person can open.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          + Add Team Member
        </button>
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

      {error && !showModal && <div className="admin-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p style={{ color: '#888' }}>Loading team...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Sections</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name}</strong>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>{member.email}</div>
                  </td>
                  <td>{member.department || '—'}</td>
                  <td style={{ maxWidth: 280 }}>
                    {member.isSuperAdmin
                      ? 'Full access'
                      : member.adminPermissions.join(', ') || 'No sections'}
                  </td>
                  <td>
                    <span className={`admin-badge ${member.isSuperAdmin ? 'admin-badge-active' : 'admin-badge-confirmed'}`}>
                      {member.isSuperAdmin ? 'Super Admin' : 'Staff'}
                    </span>
                  </td>
                  <td>
                    {!member.isSuperAdmin && (
                      <div className="admin-actions">
                        <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(member)}>
                          Edit Access
                        </button>
                        <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(member.id)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal admin-content-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <p className="admin-hint" style={{ marginTop: -8, marginBottom: 16 }}>
              Pick a department preset or manually choose sections.
            </p>
            {error && <div className="admin-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="admin-form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={Boolean(editing)}
                />
              </div>
              <div className="admin-form-group">
                <label>{editing ? 'New Password (optional)' : 'Password *'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                />
              </div>
              <div className="admin-form-group">
                <label>Department Label</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Billing, Marketing"
                />
              </div>

              <div className="admin-form-group">
                <label>Quick Presets</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(catalog.departmentPresets || {}).map((presetKey) => (
                    <button
                      key={presetKey}
                      type="button"
                      className="admin-btn admin-btn-outline admin-btn-sm"
                      onClick={() => applyPreset(presetKey)}
                    >
                      {DEPARTMENT_PRESET_LABELS[presetKey] || presetKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Allowed Sections *</label>
                {Object.entries(groupedPermissions).map(([group, items]) => (
                  <div key={group} style={{ marginBottom: 14 }}>
                    <p style={{ color: '#d4af37', fontSize: '0.85rem', marginBottom: 8 }}>{group}</p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {items.map((item) => (
                        <label key={item.key} className="admin-checkbox-row">
                          <input
                            type="checkbox"
                            checked={form.adminPermissions.includes(item.key)}
                            onChange={() => togglePermission(item.key)}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminTeam;