// estatecrm/src/services/agent.service.js

// Agent API Service - 100% SYNCHRONIZED with Backend RBAC Routes
// CRITICAL: All endpoints match backend exactly, uses correct auth flow
// Last Synced: Phase 3.3 - RBAC Migration Complete

import api, { authAPI, errorHandler } from './api.js';

// =============================================================================
// AGENT API ENDPOINTS - BACKEND SYNCHRONIZED WITH RBAC
// =============================================================================

export const agentService = {

    // =============================================================================
    // CURRENT AGENT PROFILE OPERATIONS (FIXED - USES CORRECT ENDPOINTS)
    // =============================================================================

    /**
     * Get current authenticated agent profile
     * FIXED: Uses /auth/profile instead of non-existent /agents/me
     */
    getCurrentAgent: async () => {
        try {
            const response = await authAPI.getProfile();
            return {
                agent: response.data, // Backend returns user data directly
                success: true
            };
        } catch (error) {
            console.error('Get current agent error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Update current agent profile  
     * Uses agent ID from current user context to call correct endpoint
     */
    updateCurrentAgent: async (profileData, currentUserId) => {
        if (!currentUserId) {
            throw new Error('Current user ID is required to update profile');
        }

        try {
            const response = await api.put(`/agents/${currentUserId}`, profileData);
            return response.data;
        } catch (error) {
            console.error('Update current agent error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Upload agent profile image
     * FIXED: Uses correct path with agent ID
     */
    uploadAgentImage: async (agentId, imageFile, onProgress = null) => {
        if (!agentId) {
            throw new Error('Agent ID is required for image upload');
        }

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: onProgress ? (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                } : undefined
            };

            const response = await api.post(`/agents/${agentId}/upload-image`, formData, config);
            return response.data;
        } catch (error) {
            console.error('Upload agent image error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    // =============================================================================
    // AGENT MANAGEMENT OPERATIONS (RBAC-CONTROLLED)
    // =============================================================================

    /**
     * Get list of agents with RBAC filtering
     * Backend applies scope filtering based on user role automatically
     */
    getAgents: async (params = {}) => {
        try {
            const response = await api.get('/agents', { params });
            console.log("Get agents response in agent.service:", response);

            return response.data;
        } catch (error) {
            console.error('Get agents error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Get specific agent by ID with RBAC validation
     */
    getAgent: async (agentId) => {
        if (!agentId) {
            throw new Error('Agent ID is required');
        }

        try {
            const response = await api.get(`/agents/${agentId}`);
            return response.data;
        } catch (error) {
            console.error(`Get agent ${agentId} error:`, error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Create new agent with RBAC validation
     */
    createAgent: async (agentData) => {
        try {
            const response = await api.post('/agents', agentData);
            return response.data;
        } catch (error) {
            console.error('Create agent error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message,
                validationErrors: error.response?.data?.errors || {}
            };
        }
    },

    /**
     * Update agent information with RBAC validation
     */
    updateAgent: async (agentId, updateData) => {
        if (!agentId) {
            throw new Error('Agent ID is required');
        }

        try {
            const response = await api.put(`/agents/${agentId}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Update agent ${agentId} error:`, error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message,
                validationErrors: error.response?.data?.errors || {}
            };
        }
    },

    /**
     * Delete agent with RBAC validation
     */
    deleteAgent: async (agentId) => {
        if (!agentId) {
            throw new Error('Agent ID is required');
        }

        try {
            const response = await api.delete(`/agents/${agentId}`);
            return response.data;
        } catch (error) {
            console.error(`Delete agent ${agentId} error:`, error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    // =============================================================================
    // AGENT ASSIGNMENT AND RELATIONSHIP OPERATIONS
    // =============================================================================

    /**
     * Get assigned leads for agent with RBAC filtering
     * Backend applies appropriate scope based on user role
     */
    getAssignedLeads: async (params = {}) => {
        try {
            const response = await api.get('/agents/assigned-leads', { params });
            return response.data;
        } catch (error) {
            console.error('Get assigned leads error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Get assigned properties for agent with RBAC filtering
     */
    getAssignedProperties: async (params = {}) => {
        try {
            const response = await api.get('/agents/assigned-properties', { params });
            return response.data;
        } catch (error) {
            console.error('Get assigned properties error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    // =============================================================================
    // PERFORMANCE AND ANALYTICS OPERATIONS
    // =============================================================================

    /**
     * Get agent performance metrics with RBAC filtering
     */
    getAgentPerformance: async (agentId, params = {}) => {
        if (!agentId) {
            throw new Error('Agent ID is required for performance metrics');
        }

        try {
            const response = await api.get(`/agents/${agentId}/performance`, { params });
            return response.data;
        } catch (error) {
            console.error(`Get agent performance ${agentId} error:`, error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    /**
     * Get team hierarchy with RBAC filtering
     */
    getTeamHierarchy: async (params = {}) => {
        try {
            const response = await api.get('/agents/team-hierarchy', { params });
            return response.data;
        } catch (error) {
            console.error('Get team hierarchy error:', error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    // =============================================================================
    // ROLE MANAGEMENT OPERATIONS  
    // =============================================================================

    /**
     * Update agent role with RBAC validation
     * FIXED: Uses correct endpoint path
     */
    updateAgentRole: async (agentId, newRole, additionalData = {}) => {
        if (!agentId) {
            throw new Error('Agent ID is required');
        }
        if (!newRole) {
            throw new Error('New role is required');
        }

        try {
            const payload = {
                role: newRole,
                ...additionalData
            };
            const response = await api.put(`/agents/${agentId}/role`, payload);
            return response.data;
        } catch (error) {
            console.error(`Update agent role ${agentId} error:`, error);
            throw {
                message: errorHandler.getErrorMessage(error),
                error: error.response?.data || error.message
            };
        }
    },

    // =============================================================================
    // UTILITY AND HELPER FUNCTIONS
    // =============================================================================

    /**
     * Validate agent data before submission
     */
    validateAgentData: (agentData) => {
        const errors = {};

        // Required fields validation
        if (!agentData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        }
        if (!agentData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        }
        if (!agentData.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(agentData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!agentData.role) {
            errors.role = 'Role is required';
        }
        if (!agentData.department) {
            errors.department = 'Department is required';
        }

        // Phone validation (optional)
        if (agentData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(agentData.phone)) {
            errors.phone = 'Invalid phone number format';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Format agent data for display
     */
    formatAgentData: (agent) => {
        if (!agent) return null;

        return {
            ...agent,
            fullName: `${agent.firstName} ${agent.lastName}`,
            roleLabel: agent.role?.name || agent.role || 'Unknown Role',
            departmentLabel: agent.department?.name || agent.department || 'Unknown Department',
            statusLabel: agent.status ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1) : 'Unknown',
            joiningDateFormatted: agent.joiningDate ? new Date(agent.joiningDate).toLocaleDateString('en-IN') : 'Unknown',
            lastLoginFormatted: agent.lastLogin ? new Date(agent.lastLogin).toLocaleDateString('en-IN') : 'Never'
        };
    },

    /**
     * Get agent permissions for UI display
     */
    getAgentPermissions: (agent, currentUser) => {
        if (!agent || !currentUser) {
            return {
                canView: false,
                canEdit: false,
                canDelete: false,
                canChangeRole: false,
                canUploadImage: false
            };
        }

        const currentRoleLevel = currentUser.roleLevel || 1;
        const targetRoleLevel = agent.role?.level || agent.roleLevel || 1;
        const isSelf = agent.id === currentUser.id || agent._id === currentUser.id;

        return {
            canView: true, // If they can see the agent, they can view details
            canEdit: isSelf || currentRoleLevel > targetRoleLevel,
            canDelete: !isSelf && currentRoleLevel > targetRoleLevel && currentRoleLevel >= 6,
            canChangeRole: currentRoleLevel >= 13, // Only admin
            canUploadImage: isSelf || currentRoleLevel > targetRoleLevel,
            canViewPerformance: isSelf || currentRoleLevel >= 4, // Team Leader+
            canAssignLeads: currentRoleLevel >= 4,
            canManageTeam: currentRoleLevel >= 4
        };
    },

    /**
     * Filter agents based on current user permissions
     */
    filterAgentsForUser: (agents, currentUser) => {
        if (!currentUser || !Array.isArray(agents)) {
            return [];
        }

        const currentRoleLevel = currentUser.roleLevel || 1;
        const currentUserId = currentUser.id || currentUser._id;

        // Admin can see all
        if (currentRoleLevel >= 13) {
            return agents;
        }

        return agents.filter(agent => {
            // Can always see self
            if (agent.id === currentUserId || agent._id === currentUserId) {
                return true;
            }

            // Can see subordinates
            const targetRoleLevel = agent.role?.level || agent.roleLevel || 1;
            return currentRoleLevel > targetRoleLevel;
        });
    },

    /**
     * Check if current user can perform action on target agent
     */
    canPerformAction: (action, targetAgent, currentUser) => {
        if (!targetAgent || !currentUser) {
            return false;
        }

        const permissions = agentService.getAgentPermissions(targetAgent, currentUser);
        return permissions[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] || false;
    }
};

export default agentService;