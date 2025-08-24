// estatecrm/src/hooks/useAgent.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRBAC } from './useRBAC.js';
import agentService from '../services/agent.service.js';
import { PERMISSIONS } from '../utils/rbacConstants.js';

// =============================================================================
// CORE AGENT MANAGEMENT HOOK
// =============================================================================

export const useAgent = (user = null) => {
    const rbac = useRBAC(user);

    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const [agents, setAgents] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [assignedLeads, setAssignedLeads] = useState([]);
    const [assignedProperties, setAssignedProperties] = useState([]);
    const [teamHierarchy, setTeamHierarchy] = useState(null);
    const [performance, setPerformance] = useState(null);

    const [loading, setLoading] = useState({
        agents: false,
        currentAgent: false,
        selectedAgent: false,
        assignedLeads: false,
        assignedProperties: false,
        teamHierarchy: false,
        performance: false,
        creating: false,
        updating: false,
        deleting: false
    });

    const [errors, setErrors] = useState({});

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [filters, setFilters] = useState({
        search: '',
        role: '',
        department: '',
        status: 'active',
        branch: '',
        region: ''
    });

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    const setLoadingState = useCallback((key, value) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    }, []);

    const setErrorState = useCallback((key, error) => {
        setErrors(prev => ({ ...prev, [key]: error }));
    }, []);

    const clearError = useCallback((key) => {
        setErrors(prev => ({ ...prev, [key]: null }));
    }, []);

    // =============================================================================
    // DATA FETCHING FUNCTIONS
    // =============================================================================

    const fetchCurrentAgent = useCallback(async () => {
        if (!rbac.checkPermission(PERMISSIONS.VIEW_OWN_PROFILE)) {
            setErrorState('currentAgent', 'Permission denied: Cannot view own profile');
            return;
        }

        setLoadingState('currentAgent', true);
        clearError('currentAgent');

        try {
            const response = await agentService.getCurrentAgent();
            setCurrentAgent(response.agent);
        } catch (error) {
            console.error('Failed to fetch current agent:', error);
            setErrorState('currentAgent', error.response?.data?.message || 'Failed to fetch agent profile');
        } finally {
            setLoadingState('currentAgent', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    const fetchAgents = useCallback(async (params = {}) => {
        const hasPermission = rbac.checkAnyPermission([
            PERMISSIONS.VIEW_BRANCH_AGENTS,
            PERMISSIONS.VIEW_TEAM_HIERARCHY,
            PERMISSIONS.MANAGE_TEAM_MEMBERS
        ]);

        if (!hasPermission && !rbac.isAdministrator) {
            setErrorState('agents', 'Permission denied: Cannot view agents list');
            return;
        }

        setLoadingState('agents', true);
        clearError('agents');

        try {
            const queryParams = {
                ...filters,
                ...params,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await agentService.getAgents(queryParams);
            console.log("Response for agents in useAgent:", response);

            setAgents(response.agents || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                totalPages: Math.ceil((response.total || 0) / prev.limit)
            }));
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            setErrorState('agents', error.response?.data?.message || 'Failed to fetch agents list');
            setAgents([]);
        } finally {
            setLoadingState('agents', false);
        }
    }, [rbac, filters, pagination.page, pagination.limit, setLoadingState, setErrorState, clearError]);

    const fetchAgent = useCallback(async (agentId) => {
        if (!rbac.checkAgentAccess(agentId)) {
            setErrorState('selectedAgent', 'Permission denied: Cannot access this agent');
            return;
        }

        setLoadingState('selectedAgent', true);
        clearError('selectedAgent');

        try {
            const response = await agentService.getAgent(agentId);
            setSelectedAgent(response.agent);
        } catch (error) {
            console.error(`Failed to fetch agent ${agentId}:`, error);
            setErrorState('selectedAgent', error.response?.data?.message || 'Failed to fetch agent details');
        } finally {
            setLoadingState('selectedAgent', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    const fetchAssignedLeads = useCallback(async (params = {}) => {
        if (!rbac.checkPermission(PERMISSIONS.VIEW_ASSIGNED_LEADS)) {
            setErrorState('assignedLeads', 'Permission denied: Cannot view assigned leads');
            return;
        }

        setLoadingState('assignedLeads', true);
        clearError('assignedLeads');

        try {
            const response = await agentService.getAssignedLeads(params);
            setAssignedLeads(response.leads || []);
        } catch (error) {
            console.error('Failed to fetch assigned leads:', error);
            setErrorState('assignedLeads', error.response?.data?.message || 'Failed to fetch assigned leads');
            setAssignedLeads([]);
        } finally {
            setLoadingState('assignedLeads', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    const fetchAssignedProperties = useCallback(async (params = {}) => {
        if (!rbac.checkPermission(PERMISSIONS.VIEW_ASSIGNED_PROPERTIES)) {
            setErrorState('assignedProperties', 'Permission denied: Cannot view assigned properties');
            return;
        }

        setLoadingState('assignedProperties', true);
        clearError('assignedProperties');

        try {
            const response = await agentService.getAssignedProperties(params);
            setAssignedProperties(response.properties || []);
        } catch (error) {
            console.error('Failed to fetch assigned properties:', error);
            setErrorState('assignedProperties', error.response?.data?.message || 'Failed to fetch assigned properties');
            setAssignedProperties([]);
        } finally {
            setLoadingState('assignedProperties', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    const fetchTeamHierarchy = useCallback(async (params = {}) => {
        if (!rbac.checkPermission(PERMISSIONS.VIEW_TEAM_HIERARCHY)) {
            setErrorState('teamHierarchy', 'Permission denied: Cannot view team hierarchy');
            return;
        }

        setLoadingState('teamHierarchy', true);
        clearError('teamHierarchy');

        try {
            const response = await agentService.getTeamHierarchy(params);
            setTeamHierarchy(response.hierarchy);
        } catch (error) {
            console.error('Failed to fetch team hierarchy:', error);
            setErrorState('teamHierarchy', error.response?.data?.message || 'Failed to fetch team hierarchy');
            setTeamHierarchy(null);
        } finally {
            setLoadingState('teamHierarchy', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    const fetchPerformance = useCallback(async (params = {}) => {
        const hasAnalyticsPermission = rbac.checkAnyPermission([
            PERMISSIONS.VIEW_TEAM_PERFORMANCE,
            PERMISSIONS.VIEW_BRANCH_ANALYTICS,
            PERMISSIONS.REGIONAL_ANALYTICS,
            PERMISSIONS.COMPANY_ANALYTICS
        ]);

        if (!hasAnalyticsPermission) {
            setErrorState('performance', 'Permission denied: Cannot view performance metrics');
            return;
        }

        setLoadingState('performance', true);
        clearError('performance');

        try {
            const response = await agentService.getAgentPerformance(params);
            setPerformance(response.performance);
        } catch (error) {
            console.error('Failed to fetch performance metrics:', error);
            setErrorState('performance', error.response?.data?.message || 'Failed to fetch performance metrics');
            setPerformance(null);
        } finally {
            setLoadingState('performance', false);
        }
    }, [rbac, setLoadingState, setErrorState, clearError]);

    // =============================================================================
    // CRUD OPERATIONS
    // =============================================================================

    const createAgent = useCallback(async (agentData) => {
        if (!rbac.checkPermission(PERMISSIONS.CREATE_AGENTS)) {
            const error = 'Permission denied: Cannot create agents';
            setErrorState('create', error);
            throw new Error(error);
        }

        setLoadingState('creating', true);
        clearError('create');

        try {
            const response = await agentService.createAgent(agentData);

            if (agents.length > 0) {
                setAgents(prev => [response.agent, ...prev]);
            }

            return response.agent;
        } catch (error) {
            console.error('Failed to create agent:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create agent';
            setErrorState('create', errorMessage);
            throw error;
        } finally {
            setLoadingState('creating', false);
        }
    }, [rbac, agents.length, setLoadingState, setErrorState, clearError]);

    const updateAgent = useCallback(async (agentId, updateData) => {
        const canEdit = rbac.checkAgentAccess(agentId) &&
            rbac.checkAnyPermission([
                PERMISSIONS.EDIT_OWN_PROFILE,
                PERMISSIONS.EDIT_TEAM_AGENTS
            ]);

        if (!canEdit) {
            const error = 'Permission denied: Cannot edit this agent';
            setErrorState('update', error);
            throw new Error(error);
        }

        setLoadingState('updating', true);
        clearError('update');

        try {
            const response = await agentService.updateAgent(agentId, updateData);

            if (currentAgent?._id === agentId) {
                setCurrentAgent(response.agent);
            }

            if (selectedAgent?._id === agentId) {
                setSelectedAgent(response.agent);
            }

            setAgents(prev => prev.map(agent =>
                agent._id === agentId ? response.agent : agent
            ));

            return response.agent;
        } catch (error) {
            console.error(`Failed to update agent ${agentId}:`, error);
            const errorMessage = error.response?.data?.message || 'Failed to update agent';
            setErrorState('update', errorMessage);
            throw error;
        } finally {
            setLoadingState('updating', false);
        }
    }, [rbac, currentAgent, selectedAgent, setLoadingState, setErrorState, clearError]);

    const deleteAgent = useCallback(async (agentId) => {
        if (!rbac.checkPermission(PERMISSIONS.DELETE_AGENTS)) {
            const error = 'Permission denied: Cannot delete agents';
            setErrorState('delete', error);
            throw new Error(error);
        }

        setLoadingState('deleting', true);
        clearError('delete');

        try {
            await agentService.deleteAgent(agentId);

            setAgents(prev => prev.filter(agent => agent._id !== agentId));

            if (selectedAgent?._id === agentId) {
                setSelectedAgent(null);
            }

            return true;
        } catch (error) {
            console.error(`Failed to delete agent ${agentId}:`, error);
            const errorMessage = error.response?.data?.message || 'Failed to delete agent';
            setErrorState('delete', errorMessage);
            throw error;
        } finally {
            setLoadingState('deleting', false);
        }
    }, [rbac, selectedAgent, setLoadingState, setErrorState, clearError]);

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const updatePagination = useCallback((newPagination) => {
        setPagination(prev => ({ ...prev, ...newPagination }));
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const refreshData = useCallback(() => {
        if (currentAgent) fetchCurrentAgent();
        if (agents.length > 0) fetchAgents();
        if (assignedLeads.length > 0) fetchAssignedLeads();
        if (assignedProperties.length > 0) fetchAssignedProperties();
        if (teamHierarchy) fetchTeamHierarchy();
        if (performance) fetchPerformance();
    }, [
        currentAgent,
        agents.length,
        assignedLeads.length,
        assignedProperties.length,
        teamHierarchy,
        performance,
        fetchCurrentAgent,
        fetchAgents,
        fetchAssignedLeads,
        fetchAssignedProperties,
        fetchTeamHierarchy,
        fetchPerformance
    ]);

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    const isLoading = useMemo(() => {
        return Object.values(loading).some(isLoading => isLoading);
    }, [loading]);

    const hasErrors = useMemo(() => {
        return Object.values(errors).some(error => error !== null);
    }, [errors]);

    const filteredAgents = useMemo(() => {
        if (!rbac.isAuthenticated) return [];

        return agents.filter(agent => {
            if (rbac.isAdministrator) return true;
            if (agent._id === rbac.userId) return true;
            return rbac.checkAgentAccess(agent._id);
        });
    }, [agents, rbac]);

    // =============================================================================
    // AUTO-FETCH CURRENT AGENT
    // =============================================================================

    useEffect(() => {
        if (rbac.isAuthenticated && !currentAgent) {
            fetchCurrentAgent();
        }
    }, [rbac.isAuthenticated, currentAgent, fetchCurrentAgent]);

    // =============================================================================
    // RETURN INTERFACE
    // =============================================================================

    return useMemo(() => ({
        // Data state
        agents: filteredAgents,
        currentAgent,
        selectedAgent,
        assignedLeads,
        assignedProperties,
        teamHierarchy,
        performance,

        // Loading states
        loading,
        isLoading,

        // Error states
        errors,
        hasErrors,

        // Pagination and filtering
        pagination,
        filters,

        // Data fetching functions
        fetchCurrentAgent,
        fetchAgents,
        fetchAgent,
        fetchAssignedLeads,
        fetchAssignedProperties,
        fetchTeamHierarchy,
        fetchPerformance,

        // CRUD operations
        createAgent,
        updateAgent,
        deleteAgent,

        // Utility functions
        updateFilters,
        updatePagination,
        clearErrors,
        refreshData,
        setSelectedAgent,

        // Permission context
        rbac
    }), [
        filteredAgents,
        currentAgent,
        selectedAgent,
        assignedLeads,
        assignedProperties,
        teamHierarchy,
        performance,
        loading,
        isLoading,
        errors,
        hasErrors,
        pagination,
        filters,
        fetchCurrentAgent,
        fetchAgents,
        fetchAgent,
        fetchAssignedLeads,
        fetchAssignedProperties,
        fetchTeamHierarchy,
        fetchPerformance,
        createAgent,
        updateAgent,
        deleteAgent,
        updateFilters,
        updatePagination,
        clearErrors,
        refreshData,
        rbac
    ]);
};

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

export const useCurrentAgent = (user = null) => {
    const { currentAgent, fetchCurrentAgent, updateAgent, loading, errors } = useAgent(user);

    const updateCurrentAgent = useCallback(async (updateData) => {
        if (!currentAgent?._id) return;
        return updateAgent(currentAgent._id, updateData);
    }, [currentAgent, updateAgent]);

    return {
        agent: currentAgent,
        loading: loading.currentAgent,
        error: errors.currentAgent,
        fetchAgent: fetchCurrentAgent,
        updateAgent: updateCurrentAgent
    };
};

export const useAgentsList = (user = null) => {
    const {
        agents,
        fetchAgents,
        pagination,
        filters,
        updateFilters,
        updatePagination,
        loading,
        errors
    } = useAgent(user);

    return {
        agents,
        pagination,
        filters,
        loading: loading.agents,
        error: errors.agents,
        fetchAgents,
        updateFilters,
        updatePagination
    };
};

export const useAgentAssignments = (user = null) => {
    const {
        assignedLeads,
        assignedProperties,
        fetchAssignedLeads,
        fetchAssignedProperties,
        loading,
        errors
    } = useAgent(user);

    return {
        leads: assignedLeads,
        properties: assignedProperties,
        loading: {
            leads: loading.assignedLeads,
            properties: loading.assignedProperties
        },
        errors: {
            leads: errors.assignedLeads,
            properties: errors.assignedProperties
        },
        fetchLeads: fetchAssignedLeads,
        fetchProperties: fetchAssignedProperties
    };
};

export default useAgent;