import React, { useState, useEffect } from 'react';
import {
  Card, SectionHeader, Badge, Btn, IconBtn,
  SearchBar, DataTable,
} from '../../components/Admin/AdminUI';
import { categoryAPI } from '../../services/api';
import { useTranslation } from '../../lang/i18n';

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="5" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <path d="M6 5V3h4v2M1 5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', synonyms: [], is_active: true });
  const [synonymInput, setSynonymInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryAPI.getAllCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError('failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const filtered = categories.filter((c) => {
    const term = search.toLowerCase();
    return !term ||
      (c.name || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term);
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', synonyms: [], is_active: true });
    setSynonymInput('');
    setNameError('');
    setSaveError('');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      synonyms: Array.isArray(category.synonyms) ? category.synonyms : [],
      is_active: category.is_active ?? true,
    });
    setSynonymInput('');
    setNameError('');
    setSaveError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setNameError(t('category_name_empty', 'Category name cannot be empty.'));
      return;
    }
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === formData.name.trim().toLowerCase() && c.id !== editingId
    );
    if (isDuplicate) {
      setNameError(t('category_name_duplicate', 'Category already exists. Please choose a unique name.'));
      return;
    }
    setNameError('');
    setSaveError('');
    setSaving(true);
    try {
      if (editingId) {
        await categoryAPI.updateCategory(editingId, formData);
      } else {
        await categoryAPI.createCategory(formData);
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      setSaveError(t('connect_error', 'Failed to connect. Please try again later.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryAPI.deleteCategory(id);
      setDeleteConfirm(null);
      await loadCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const columns = [
    {
      key: 'name', label: t('name', 'Name'), width: '25%',
      render: (v) => <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{v}</span>,
    },
    {
      key: 'description', label: t('description', 'Description'), width: '40%',
      render: (v) => <span style={{ color: '#555450' }}>{v || '-'}</span>,
    },
    {
      key: 'is_active', label: t('status', 'Status'), width: '15%',
      render: (v) => v ? <Badge variant="success">{t('active', 'Active')}</Badge> : <Badge variant="gray">{t('inactive', 'Inactive')}</Badge>,
    },
    {
      key: 'actions', label: '', width: '20%',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <IconBtn title={t('edit', 'Edit')} onClick={() => openEdit(row)}><EditIcon /></IconBtn>
          <IconBtn danger title={t('delete', 'Delete')} onClick={() => setDeleteConfirm(row.id)}><TrashIcon /></IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <SectionHeader
          title={t('manage_categories', 'Manage Categories')}
          right={
            <Btn primary onClick={openAdd}>
              {t('add_category', '+ Add Category')}
            </Btn>
          }
        />

        <SearchBar
          placeholder={t('placeholder_search_categories', 'Search categories...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>{t('loading', 'Loading...')}</div>
        ) : error ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: '#dc2626', margin: '0 0 14px', fontSize: 13 }}>
              {t('connect_error', 'Failed to connect. Please try again later.')}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} rows={filtered} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
          <span>{t('showing_of_categories', 'Showing {shown} of {total} categories', { shown: filtered.length, total: categories.length })}</span>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
        }}>
          <Card style={{ width: 420, maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#111827' }}>
              {editingId ? t('edit_category', 'Edit Category') : t('add_category', 'Add Category')}
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  {t('name', 'Name')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (e.target.value.trim()) setNameError(''); }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: nameError ? '1px solid #ef4444' : '1px solid #d1d5db',
                    fontSize: 13, outline: 'none',
                  }}
                />
                {nameError && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{nameError}</p>
                )}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  {t('description', 'Description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    border: '1px solid #d1d5db', fontSize: 13, outline: 'none', resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  {t('synonyms', 'AI Synonyms')}
                </label>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#9ca3af' }}>
                  {t('synonyms_hint', 'Press Enter or comma to add.')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 8, minHeight: 36 }}>
                  {formData.synonyms.map((syn, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                      {syn}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, synonyms: formData.synonyms.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', fontWeight: 700, fontSize: 13, lineHeight: 1, padding: 0 }}
                      >×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={synonymInput}
                    onChange={(e) => setSynonymInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const val = synonymInput.trim().replace(/,$/, '');
                        if (val && !formData.synonyms.includes(val)) {
                          setFormData({ ...formData, synonyms: [...formData.synonyms, val] });
                        }
                        setSynonymInput('');
                      } else if (e.key === 'Backspace' && !synonymInput && formData.synonyms.length) {
                        setFormData({ ...formData, synonyms: formData.synonyms.slice(0, -1) });
                      }
                    }}
                    placeholder={formData.synonyms.length === 0 ? t('synonyms_placeholder', 'e.g. Jalan Rosak, Kerosakan Jalan') : ''}
                    style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, minWidth: 120, background: 'transparent' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" style={{ fontSize: 13, cursor: 'pointer' }}>
                  {t('active', 'Active')}
                </label>
              </div>
              {saveError && (
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#dc2626', background: '#fee2e2', padding: '8px 12px', borderRadius: 8 }}>{saveError}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Btn small onClick={() => setModalOpen(false)}>{t('cancel', 'Cancel')}</Btn>
                <Btn primary small type="submit" disabled={saving}>
                  {saving ? t('saving', 'Saving...') : t('save', 'Save')}
                </Btn>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
        }}>
          <Card style={{ width: 360, maxWidth: '90vw', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>{t('confirm_delete', 'Confirm Delete')}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
              {t('delete_category_warning', 'Are you sure you want to delete this category? This action cannot be undone.')}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Btn small onClick={() => setDeleteConfirm(null)}>{t('cancel', 'Cancel')}</Btn>
              <Btn small onClick={() => handleDelete(deleteConfirm)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {t('delete', 'Delete')}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
