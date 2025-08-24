// estatecrm/src/services/api.js

// API Service - 100% SYNCHRONIZED with Backend Routes
// CRITICAL: All endpoints must match backend exactly
// Last Synced: Phase 3.3 - RBAC Migration Complete

import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5001/api'; // FIXED: Was 5001, now 5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling with RBAC support
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle RBAC permission errors
        if (error.response?.status === 403) {
            console.warn('RBAC Access Denied:', error.response?.data);
            // Could show permission denied modal here
        }

        return Promise.reject(error);
    }
);

// =============================================================================
// AUTHENTICATION API - BACKEND SYNCHRONIZED
// =============================================================================

export const authAPI = {
    login: (userData = {}) => api.post('/auth/login', userData),
    getProfile: () => api.get('/auth/profile'),
};

// =============================================================================
// LEADS API - BACKEND SYNCHRONIZED  
// =============================================================================

export const leadsAPI = {
    // Basic CRUD operations
    getLeads: (params) => api.get('/leads', { params }),
    getLead: (id) => api.get(`/leads/${id}`),
    createLead: (data) => {
        console.log('Creating lead with data:', data);
        return api.post('/leads', data);
    },
    updateLead: (id, data) => {
        console.log('Updating lead:', id, 'with data:', data);
        return api.put(`/leads/${id}`, data);
    },
    deleteLead: (id) => api.delete(`/leads/${id}`),

    // Lead assignment operations
    assignLead: (id, agentId) => {
        console.log('Assigning lead:', id, 'to agent:', agentId);
        return api.post(`/leads/${id}/assign`, { agentId });
    },

    // Status management operations
    updateLeadStatus: (id, status, subStatus = '', note = '') => {
        const updateData = { status };
        if (subStatus) updateData.subStatus = subStatus;
        if (note) updateData.note = note;

        console.log('Updating lead status:', id, updateData);
        return api.put(`/leads/${id}/status`, updateData);
    },

    // Notes management
    addNoteToLead: (id, content, type = 'general') => {
        console.log('Adding note to lead:', id, content);
        return api.post(`/leads/${id}/notes`, { content, type });
    },

    updateLeadTags: (id, tags) => api.put(`/leads/${id}/tags`, { tags }),

    // Follow-up management
    scheduleFollowUp: (id, action, scheduledFor, reason) => api.put(`/leads/${id}/schedule-followup`, {
        action,
        scheduledFor,
        reason
    }),
    getOverdueFollowUps: () => api.get('/leads/overdue-followups'),

    // Analytics and stats
    getDashboardStats: () => api.get('/leads/dashboard-stats'),

    // Export functionality
    exportLeads: (params) => api.get('/leads/export', {
        params,
        responseType: 'blob'
    }),
};

// =============================================================================
// AGENTS API - BACKEND SYNCHRONIZED (MAJOR FIXES)
// =============================================================================

export const agentsAPI = {
    // RBAC-filtered agent operations
    getAgents: (params) => api.get('/agents', { params }),
    getAgent: (id) => api.get(`/agents/${id}`),

    // FIXED: Removed /agents/me - doesn't exist in backend
    // Current agent info comes from /auth/profile

    createAgent: (data) => api.post('/agents', data),
    updateAgent: (id, data) => api.put(`/agents/${id}`, data),
    deleteAgent: (id) => api.delete(`/agents/${id}`),

    // Role management - FIXED: Correct endpoint
    updateAgentRole: (id, role) => api.put(`/agents/${id}/role`, { role }),

    // Image upload - FIXED: Correct path with agent ID
    uploadAgentImage: (id, formData) => api.post(`/agents/${id}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Assignment operations - BACKEND SYNCHRONIZED
    getAssignedLeads: (params) => {
        console.log('Fetching assigned leads with params:', params);
        return api.get('/agents/assigned-leads', { params });
    },
    getAssignedProperties: (params) => api.get('/agents/assigned-properties', { params }),

    // Performance and analytics
    getAgentPerformance: (id, params) => api.get(`/agents/${id}/performance`, { params }),

    // Team hierarchy
    getTeamHierarchy: (params) => api.get('/agents/team-hierarchy', { params }),
};

// =============================================================================
// PROPERTIES API - BACKEND SYNCHRONIZED
// =============================================================================

export const propertiesAPI = {
    getProperties: (params) => api.get('/properties', { params }),
    getProperty: (id) => api.get(`/properties/${id}`),
    createProperty: (data) => api.post('/properties', data),
    updateProperty: (id, data) => api.put(`/properties/${id}`, data),
    deleteProperty: (id) => api.delete(`/properties/${id}`),

    // Image upload
    uploadPropertyImages: (id, formData) => api.post(`/properties/${id}/upload-images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Assignment operations
    assignProperty: (id, agentIds) => api.post(`/properties/${id}/assign`, { agentIds }),
    unassignProperty: (id, agentIds) => api.post(`/properties/${id}/unassign`, { agentIds }),
};

// =============================================================================
// ADMIN API - ADDED (WAS COMPLETELY MISSING)
// =============================================================================

export const adminAPI = {
    // Role management
    createRole: (data) => api.post('/admin/roles', data),
    getAllRoles: () => api.get('/admin/roles'),
    updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
    deleteRole: (id) => api.delete(`/admin/roles/${id}`),

    // Department management
    createDepartment: (data) => api.post('/admin/departments', data),
    getAllDepartments: () => api.get('/admin/departments'),
    updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
    deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
};

// =============================================================================
// BULK IMPORT API - BACKEND SYNCHRONIZED (FIXED ENDPOINTS)
// =============================================================================

export const bulkImportAPI = {
    // Import leads from Excel - FIXED: Correct endpoint
    importLeadsFromExcel: (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Importing leads from Excel:', file.name, 'Size:', file.size);

        return api.post('/bulk-import/leads/excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });
    },

    // Test Excel file endpoint
    testExcelFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/bulk-import/test-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Download sample Excel template
    downloadSampleExcel: (format = 'lead') => api.get('/bulk-import/leads/sample-excel', {
        params: { format },
        responseType: 'blob',
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    }),

    // Import history
    getImportHistory: (params) => api.get('/bulk-import/history', { params }),
};

// =============================================================================
// IMPORT API - BACKEND SYNCHRONIZED (SEPARATE FROM BULK IMPORT)
// =============================================================================

export const importAPI = {
    // Enhanced import functionality
    importLeadsFromExcel: (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/import/leads/excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });
    },

    // Validate Excel file before import
    validateExcelFile: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post('/import/leads/validate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Download sample Excel templates
    downloadSampleExcel: (format = 'lead') => api.get('/import/leads/sample-excel', {
        params: { format },
        responseType: 'blob',
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    }),

    // Import history
    getImportHistory: (params) => api.get('/import/history', { params }),

    // Get leads from specific import batch
    getImportBatchLeads: (batchId, params) => api.get(`/import/batch/${batchId}/leads`, { params }),

    // Delete import batch
    deleteImportBatch: (batchId) => api.delete(`/import/batch/${batchId}`),
};

// =============================================================================
// UTILITY FUNCTIONS FOR FILE HANDLING
// =============================================================================

export const fileUtils = {
    // Download file from blob response
    downloadFile: (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // Validate file type
    validateFileType: (file, allowedTypes) => {
        return allowedTypes.some(type =>
            file.type.includes(type) || file.name.toLowerCase().includes(type)
        );
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Read Excel file client-side for preview
    readExcelFile: (file) => {
        return new Promise((resolve, reject) => {
            if (typeof window.XLSX === 'undefined') {
                reject(new Error('XLSX library not loaded'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    resolve({
                        sheets: workbook.SheetNames,
                        data: jsonData,
                        headers: jsonData[0] || [],
                        rowCount: jsonData.length - 1
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    },

    // Check if XLSX library is loaded
    isXLSXAvailable: () => {
        return typeof window.XLSX !== 'undefined';
    }
};

// =============================================================================
// ENHANCED ERROR HANDLING UTILITIES
// =============================================================================

export const errorHandler = {
    // Get user-friendly error message
    getErrorMessage: (error) => {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        switch (error.response?.status) {
            case 400:
                return 'Invalid request. Please check your data and try again.';
            case 401:
                return 'Authentication failed. Please login again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'Requested resource not found.';
            case 409:
                return 'Conflict: This resource already exists.';
            case 422:
                return 'Validation error. Please check your input.';
            case 429:
                return 'Too many requests. Please try again later.';
            default:
                if (error.response?.status >= 500) {
                    return 'Server error. Please try again later.';
                }
        }

        if (error.code === 'NETWORK_ERROR') {
            return 'Network error. Please check your internet connection.';
        }

        return error.message || 'An unexpected error occurred.';
    },

    // Handle API errors with console logging
    handleError: (error, context = '') => {
        const message = errorHandler.getErrorMessage(error);
        console.error(`API Error ${context}:`, error);
        console.error('Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                method: error.config?.method,
                url: error.config?.url,
                data: error.config?.data
            }
        });

        return message;
    }
};

// =============================================================================
// LEAD UTILITIES - BACKEND SYNCHRONIZED
// =============================================================================

export const leadUtils = {
    // Format budget range matching backend virtual
    formatBudgetRange: (budget, currency = 'INR') => {
        if (!budget || (!budget.min && !budget.max)) return 'Budget not specified';

        const formatAmount = (amount) => {
            if (!amount) return '0';
            if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
            if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
            return `₹${amount.toLocaleString('en-IN')}`;
        };

        const min = budget.min || 0;
        const max = budget.max || 0;

        if (min && max) {
            return `${formatAmount(min)} - ${formatAmount(max)}`;
        } else if (max) {
            return `Up to ${formatAmount(max)}`;
        } else if (min) {
            return `From ${formatAmount(min)}`;
        }

        return 'Budget not specified';
    },

    // Parse name utility matching backend
    parseName: (fullName) => {
        if (!fullName) return { firstName: '', lastName: '' };

        const cleanedName = fullName.toString().trim().replace(/\s+/g, ' ');
        const nameParts = cleanedName.split(' ');

        if (nameParts.length === 1) {
            return { firstName: nameParts[0], lastName: '' };
        }

        return {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ')
        };
    },

    // Validate lead data matching backend requirements
    validateLeadData: (leadData) => {
        const errors = {};

        if (!leadData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!leadData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!leadData.phone?.trim()) errors.phone = 'Phone number is required';

        // Email is optional but must be valid if provided
        if (leadData.email && !/\S+@\S+\.\S+/.test(leadData.email)) {
            errors.email = 'Invalid email format';
        }

        if (leadData.requirements?.budget) {
            if (!leadData.requirements.budget.max) errors.budgetMax = 'Maximum budget is required';
            if (leadData.requirements.budget.min && leadData.requirements.budget.max &&
                leadData.requirements.budget.min >= leadData.requirements.budget.max) {
                errors.budgetMax = 'Maximum budget must be greater than minimum budget';
            }
        }

        if (!leadData.requirements?.location?.city?.trim()) {
            errors.city = 'City is required';
        }

        if (!leadData.source) errors.source = 'Lead source is required';
        if (!leadData.requirements?.type) errors.type = 'Property type is required';
        if (!leadData.requirements?.purpose) errors.purpose = 'Property purpose is required';

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Get priority color
    getPriorityColor: (priority) => {
        const colors = {
            low: 'text-gray-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            urgent: 'text-red-600'
        };
        return colors[priority] || 'text-gray-600';
    },

    // Get activity icon
    getActivityIcon: (action) => {
        const icons = {
            created: '🎯',
            assigned: '👤',
            status_changed: '🔄',
            substatus_changed: '🔄',
            note_added: '📝',
            call_made: '📞',
            email_sent: '📧',
            meeting_scheduled: '📅',
            site_visit_completed: '🏠',
            proposal_sent: '📋',
            deal_closed: '🎉',
            follow_up_scheduled: '⏰',
            deleted: '🗑️'
        };
        return icons[action] || '📝';
    }
};

// =============================================================================
// DATE UTILITIES
// =============================================================================

export const dateUtils = {
    // Format date for display
    formatDate: (date, options = {}) => {
        try {
            return new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                ...options
            });
        } catch (error) {
            return 'Invalid Date';
        }
    },

    // Format date with time
    formatDateTime: (date) => {
        try {
            return new Date(date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    },

    // Get relative time
    getRelativeTime: (date) => {
        try {
            const now = new Date();
            const targetDate = new Date(date);
            const diffMs = now - targetDate;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes} min ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

            return `${Math.floor(diffDays / 365)} years ago`;
        } catch (error) {
            return 'Unknown';
        }
    },

    // Check if date is overdue
    isOverdue: (date) => {
        try {
            return new Date(date) < new Date();
        } catch (error) {
            return false;
        }
    }
};

// Console logging for debugging
console.log('API Service initialized with base URL:', API_BASE_URL);
console.log('RBAC-enabled API endpoints ready');

export default api;