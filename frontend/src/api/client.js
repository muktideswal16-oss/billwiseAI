const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  // Attach authenticated Bearer token from localStorage
  const token = localStorage.getItem('billwise_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return response;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  demoLogin: () => request('/auth/demo-login', {
    method: 'POST'
  }),
  getMe: () => request('/auth/me'),

  // Documents
  getDocuments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.document_type) query.append('document_type', params.document_type);
    if (params.approval_status) query.append('approval_status', params.approval_status);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    return request(`/documents?${query.toString()}`);
  },
  getDocumentById: (id) => request(`/documents/${id}`),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  uploadDocument: (formData) => request('/documents/upload', {
    method: 'POST',
    body: formData
  }),
  loadSample: (sampleKey) => request(`/documents/load-sample/${sampleKey}`, {
    method: 'POST'
  }),

  // Extraction
  getExtraction: (docId) => request(`/documents/${docId}/extraction`),
  updateExtraction: (docId, data) => request(`/documents/${docId}/extraction`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Validation
  validateDocument: (docId) => request(`/documents/${docId}/validate`, {
    method: 'POST'
  }),
  resolveValidationIssue: (issueId) => request(`/validation-issues/${issueId}/resolve`, {
    method: 'POST'
  }),
  markReviewed: (docId) => request(`/documents/${docId}/mark-reviewed`, {
    method: 'POST'
  }),

  // Approval
  approveDocument: (docId, comments = 'Approved after review', reviewerName = 'Alex Rivera') => 
    request(`/documents/${docId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action: 'Approved', comments, reviewer_name: reviewerName })
    }),
  rejectDocument: (docId, comments = 'Rejected by reviewer', reviewerName = 'Alex Rivera') => 
    request(`/documents/${docId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ action: 'Rejected', comments, reviewer_name: reviewerName })
    }),

  // Duplicates
  getDuplicates: (statusFilter = null) => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return request(`/duplicates${query}`);
  },
  resolveDuplicate: (matchId, resolution, notes = '') => 
    request(`/duplicates/${matchId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution, notes })
    }),

  // Analytics
  getAnalytics: (range = 'all') => request(`/analytics?range=${range}`),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Exports
  getExportUrl: (type, onlyApproved = true, docIds = null) => {
    const query = new URLSearchParams();
    query.append('only_approved', onlyApproved);
    if (docIds && docIds.length > 0) {
      query.append('doc_ids', docIds.join(','));
    }
    return `${API_BASE}/export/${type}?${query.toString()}`;
  },

  // Reset Demo
  resetDemo: () => request('/demo/reset', { method: 'POST' })
};
