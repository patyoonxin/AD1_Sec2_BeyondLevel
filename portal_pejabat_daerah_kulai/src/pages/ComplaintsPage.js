import React, { useState, useEffect } from 'react';
import { complaintAPI, categoryAPI } from '../services/api';
import { useTranslation } from '../lang/i18n';

function ComplaintsPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    attachment: null,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ title: false, category: false, description: false, location: false });
  const [showEmptyBanner, setShowEmptyBanner] = useState(false);

  // Search & filter state for the complaint tracking module
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getActiveCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getMyComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  /*
   * Client-side filtering across the already-loaded complaints.
   * Matches the search term against title, description, category,
   * location, and record_id. Also applies the active status filter.
   */
  const filteredComplaints = complaints.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || [
      c.title,
      c.description,
      c.category,
      c.location,
      c.record_id,
    ].some((field) => (field || '').toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // All-blank guard: show prominent banner if nothing has been entered at all
    const allBlank = !formData.title.trim() && !formData.category.trim()
      && !formData.description.trim() && !formData.location.trim();
    if (allBlank) {
      setShowEmptyBanner(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowEmptyBanner(false);

    // Per-field validation for partially filled submissions
    const errors = {
      title:       !formData.title.trim(),
      category:    !formData.category.trim(),
      description: !formData.description.trim(),
      location:    !formData.location.trim(),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      const response = await complaintAPI.submitComplaint(submitData);

      // Show success message
      setSuccessMessage(`Complaint submitted successfully! Reference #${response.data.record_id || response.data.id}`);

      // Reset form
      setFormData({ title: '', category: '', description: '', location: '', attachment: null });
      setFieldErrors({ title: false, category: false, description: false, location: false });
      setShowEmptyBanner(false);
      setShowForm(false);

      // Refresh complaints list
      await fetchComplaints();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(t('submit_error', 'Unable to submit complaint. Please try again later.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    // Labels come from the active translation dictionary so the badges
    // re-render whenever the language is toggled.
    const statusMap = {
      pending:     { badge: 'badge-warning', label: t('pending', 'Pending') },
      in_progress: { badge: 'badge-primary', label: t('in_progress', 'In Progress') },
      resolved:    { badge: 'badge-success', label: t('resolved', 'Resolved') },
      rejected:    { badge: 'badge-danger',  label: t('rejected', 'Rejected') },
    };
    return statusMap[status] || { badge: 'badge-gray', label: status };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 fade-in">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 fade-in">
            {errorMessage}
          </div>
        )}

        {/* Complaint Status Detail Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{t('complaint_status', 'Complaint Status')}</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Complaint Title and Status */}
                <div className="border-b pb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusBadge(selectedComplaint.status).badge}`}>
                      {getStatusBadge(selectedComplaint.status).label}
                    </span>
                    <span className="text-sm text-gray-500">{t('record_id', 'Record ID')}: {selectedComplaint.record_id || selectedComplaint.id}</span>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('category', 'Category')}</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedComplaint.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{t('location', 'Location')}</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedComplaint.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">{t('description', 'Description')}</p>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded">{selectedComplaint.description}</p>
                </div>

                {/* Attachment */}
                {selectedComplaint.attachment && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">{t('attachment', 'Attachment')}</p>
                    {/\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(selectedComplaint.attachment) ? (
                      <img
                        src={selectedComplaint.attachment}
                        alt={t('attachment', 'Attachment')}
                        onClick={() => window.open(selectedComplaint.attachment, '_blank', 'noopener,noreferrer')}
                        className="rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity object-contain"
                        style={{ maxHeight: 200, maxWidth: '100%' }}
                      />
                    ) : (
                      <a
                        href={selectedComplaint.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {t('view_attachment', 'View Attachment')}
                      </a>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 font-semibold">{t('status_timeline', 'Status Timeline')}</p>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📝</div>
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{t('submitted', 'Submitted')}</p>
                        <p className="text-gray-600">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {selectedComplaint.status !== 'pending' && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedComplaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                            {selectedComplaint.status === 'in_progress' ? '⚙️' : '✅'}
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{selectedComplaint.status === 'in_progress' ? t('in_progress', 'In Progress') : t('resolved', 'Resolved')}</p>
                          <p className="text-gray-600">{new Date(selectedComplaint.updated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Staff Handler - Under Timeline */}
                  {selectedComplaint.handler && (
                    <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2 font-semibold">{t('staff_handler', 'Staff Handler')}</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedComplaint.handler}</p>
                    </div>
                  )}

                  {/* Admin Response Thread - Under Timeline */}
                  {Array.isArray(selectedComplaint.responses) && selectedComplaint.responses.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-3 font-semibold">
                        {t('admin_responses', 'Admin Responses')} ({selectedComplaint.responses.length})
                      </p>
                      <div className="space-y-3">
                        {selectedComplaint.responses.map((r) => (
                          <div key={r.id} className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {r.admin?.name || 'Admin'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(r.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-900 whitespace-pre-wrap">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full btn btn-secondary mt-4"
                >
                  {t('close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('manage_complaints', 'Manage Complaints')}</h1>
            <p className="text-gray-600 mt-2">{t('page_subtitle_complaints', 'Submit, monitor and manage all your complaints here')}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? `✕ ${t('cancel', 'Cancel')}` : t('new_complaint', '+ New Complaint')}
          </button>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <div className="card mb-8 fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('submit_new_complaint', 'Submit New Complaint')}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* All-blank submission banner */}
              {showEmptyBanner && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm font-medium fade-in">
                  {t('all_fields_empty', 'Please enter your complaint details before submitting.')}
                </div>
              )}
              {/* Title */}
              <div className="form-group">
                <label className="form-label">{t('title', 'Title')} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setFieldErrors((p) => ({ ...p, title: false })); setShowEmptyBanner(false); }}
                  className="form-input"
                  placeholder={t('placeholder_title', 'Describe your title')}
                  style={fieldErrors.title ? { borderColor: '#ef4444' } : undefined}
                />
                {fieldErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{t('field_required', 'This field is required')}</p>
                )}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">{t('category', 'Category')} <span className="text-red-500">*</span></label>
                <select
                  value={formData.category}
                  onChange={(e) => { setFormData({ ...formData, category: e.target.value }); setFieldErrors((p) => ({ ...p, category: false })); setShowEmptyBanner(false); }}
                  className="form-select"
                  style={fieldErrors.category ? { borderColor: '#ef4444' } : undefined}
                >
                  <option value="">{t('select_category', 'Select a category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{t('field_required', 'This field is required')}</p>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">{t('description', 'Description')} <span className="text-red-500">*</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setFieldErrors((p) => ({ ...p, description: false })); setShowEmptyBanner(false); }}
                  className="form-textarea"
                  placeholder={t('placeholder_description', 'Describe in detail...')}
                  rows="5"
                  style={fieldErrors.description ? { borderColor: '#ef4444' } : undefined}
                ></textarea>
                {fieldErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{t('field_required', 'This field is required')}</p>
                )}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">{t('location', 'Location')} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFieldErrors((p) => ({ ...p, location: false })); setShowEmptyBanner(false); }}
                  className="form-input"
                  placeholder={t('placeholder_location', 'Enter the location (e.g., Jalan Merdeka, Kulai)')}
                  style={fieldErrors.location ? { borderColor: '#ef4444' } : undefined}
                />
                {fieldErrors.location && (
                  <p className="text-red-500 text-xs mt-1">{t('field_required', 'This field is required')}</p>
                )}
              </div>

              {/* Attachment */}
              <div className="form-group">
                <label className="form-label">{t('attachment', 'Attachment')}</label>
                  <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) setFormData({ ...formData, attachment: file }); }}
                >
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
                    className="hidden"
                    id="file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <div className="text-3xl mb-2">📤</div>
                    <p className="text-sm font-medium text-gray-700">{t('click_to_upload', 'Click to upload or drag and drop')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('attachment_hint', 'PDF, JPG, PNG, DOCX (Max 5MB)')}</p>
                    {formData.attachment && (
                      <p className="text-sm text-blue-600 font-semibold mt-2">✓ {formData.attachment.name}</p>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success btn-lg"
              >
                {loading ? `${t('loading', 'Loading...')}` : t('submit', 'Submit')}
              </button>
            </form>
          </div>
        )}

        {/* Complaints List */}
        {!showForm && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {complaints.length === 0
              ? t('no_records_yet', 'No records yet')
              : t('your_n_complaints', `Your ${complaints.length} Complaint${complaints.length !== 1 ? 's' : ''}`, { count: complaints.length })}
          </h2>

          {/* Search & Filter Controls */}
          {complaints.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              {/* Search input with clear (X) button on the right */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('placeholder_search_user_complaint', 'Search by title, description, category, location, or record ID...')}
                  className="form-input w-full pr-10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg leading-none"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status filter with explicit chevron icon */}
              <div className="relative sm:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select w-full pr-10 appearance-none"
                >
                  <option value="all">{t('all_status', 'All Status')}</option>
                  <option value="pending">{t('pending', 'Pending')}</option>
                  <option value="in_progress">{t('in_progress', 'In Progress')}</option>
                  <option value="resolved">{t('resolved', 'Resolved')}</option>
                  <option value="rejected">{t('rejected', 'Rejected')}</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                  width="14" height="14" viewBox="0 0 20 20" fill="none"
                >
                  <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}

          {complaints.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">{t('no_records_yet', 'No records yet')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('no_complaints_hint', 'Submit a complaint now to get help')}</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">{t('no_search_results', 'No results match your search')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('try_different_keyword', 'Try a different keyword or status filter')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className="card-hover border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                    </div>
                    <div className={`badge ${getStatusBadge(complaint.status).badge}`}>
                      {getStatusBadge(complaint.status).label}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <span>🏷️ {complaint.category}</span>
                    <span>📍 {complaint.location}</span>
                    <span>📅 {new Date(complaint.created_at).toLocaleDateString('en-US')}</span>
                    <span>🔔 {t('record_id', 'Record ID')}: {complaint.record_id || complaint.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintsPage;
