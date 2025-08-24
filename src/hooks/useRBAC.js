// estatecrm/src/hooks/useRBAC.js

// RBAC Permission Checking System - 100% SYNCHRONIZED with Backend
// CRITICAL: All functions match backend rbac.constants.js exactly
// Last Synced: Phase 3.3 - RBAC Migration Complete

import { useMemo, useCallback } from 'react';
import {
    PERMISSIONS,
    ROLE_HIERARCHY,
    PERMISSION_LEVELS,
    BRANCHES,
    REGIONS,
    DEPARTMENTS,
    ROLE_LABELS,
    PERMISSION_GROUPS,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRoleLevel,
    canManageRole,
    getUserPermissions,
    isHigherRole,
    isEqualOrHigherRole,
    getSubordinateRoles,
    getSuperiorRoles,
    getAssignableRoles,
    getDataScope,
    canAccessAgent,
    validateRoleAssignment,
    getRoleContext,
    getPermissionLabel,
    getRoleLabel,
    debugUserPermissions
} from '../utils/rbacConstants.js';

// =============================================================================
// CORE PERMISSION VALIDATION HOOKS - BACKEND SYNCHRONIZED
// =============================================================================

/**
 * Primary RBAC hook providing comprehensive permission checking capabilities
 * Integrates with authentication context to provide real-time permission validation
 * 
 * @param {Object} user - Current authenticated user object
 * @returns {Object} - Complete RBAC interface with memoized functions
 */
export const useRBAC = (user = null) => {
    // Extract user role and info with fallback handling
    const userRole = useMemo(() => {
        if (!user) return null;
        return user.role || user.userRole || null;
    }, [user]);

    const userId = useMemo(() => {
        if (!user) return null;
        return user.id || user._id || user.uid || null;
    }, [user]);

    const userBranch = useMemo(() => {
        if (!user) return null;
        return user.branch || null;
    }, [user]);

    const userRegion = useMemo(() => {
        if (!user) return null;
        return user.region || null;
    }, [user]);

    // =============================================================================
    // MEMOIZED PERMISSION CHECKING FUNCTIONS - BACKEND SYNCHRONIZED
    // =============================================================================

    /**
     * Check single permission with backend-synchronized logic
     */
    const checkPermission = useCallback((permission) => {
        if (!userRole || !permission) {
            console.warn('RBAC: Missing user role or permission for check', { userRole, permission });
            return false;
        }

        try {
            const result = hasPermission(userRole, permission);

            // Debug logging in development
            if (process.env.NODE_ENV === 'development') {
                // Uncomment for detailed debugging
                // console.log(`RBAC Check: ${userRole} -> ${permission} = ${result}`);
            }

            return result;
        } catch (error) {
            console.error('RBAC: Permission check failed', { userRole, permission, error });
            return false;
        }
    }, [userRole]);

    /**
     * Check multiple permissions with OR logic (any permission grants access)
     */
    const checkAnyPermission = useCallback((permissions) => {
        if (!userRole || !permissions || !Array.isArray(permissions)) {
            console.warn('RBAC: Invalid parameters for any permission check', { userRole, permissions });
            return false;
        }

        try {
            const result = hasAnyPermission(userRole, permissions);

            if (process.env.NODE_ENV === 'development') {
                // console.log(`RBAC Any Check: ${userRole} -> [${permissions.join(', ')}] = ${result}`);
            }

            return result;
        } catch (error) {
            console.error('RBAC: Any permission check failed', { userRole, permissions, error });
            return false;
        }
    }, [userRole]);

    /**
     * Check multiple permissions with AND logic (all permissions required)
     */
    const checkAllPermissions = useCallback((permissions) => {
        if (!userRole || !permissions || !Array.isArray(permissions)) {
            console.warn('RBAC: Invalid parameters for all permission check', { userRole, permissions });
            return false;
        }

        try {
            const result = hasAllPermissions(userRole, permissions);

            if (process.env.NODE_ENV === 'development') {
                // console.log(`RBAC All Check: ${userRole} -> [${permissions.join(', ')}] = ${result}`);
            }

            return result;
        } catch (error) {
            console.error('RBAC: All permissions check failed', { userRole, permissions, error });
            return false;
        }
    }, [userRole]);

    // =============================================================================
    // HIERARCHICAL AUTHORIZATION FUNCTIONS - BACKEND SYNCHRONIZED
    // =============================================================================

    /**
     * Check if current user can manage target role
     */
    const checkRoleManagement = useCallback((targetRole) => {
        if (!userRole || !targetRole) {
            return false;
        }

        try {
            const result = canManageRole(userRole, targetRole);

            if (process.env.NODE_ENV === 'development') {
                // console.log(`Role Management: ${userRole} can manage ${targetRole} = ${result}`);
            }

            return result;
        } catch (error) {
            console.error('RBAC: Role management check failed', { userRole, targetRole, error });
            return false;
        }
    }, [userRole]);

    /**
     * Check if current user can access specific agent data
     */
    const checkAgentAccess = useCallback((targetAgentId) => {
        if (!userRole || !targetAgentId) {
            return false;
        }

        try {
            const result = canAccessAgent(userRole, targetAgentId, userId);

            if (process.env.NODE_ENV === 'development') {
                // console.log(`Agent Access: ${userRole} can access agent ${targetAgentId} = ${result}`);
            }

            return result;
        } catch (error) {
            console.error('RBAC: Agent access check failed', { userRole, targetAgentId, error });
            return false;
        }
    }, [userRole, userId]);

    /**
     * Check if user role is higher than target role
     */
    const checkHigherRole = useCallback((targetRole) => {
        if (!userRole || !targetRole) {
            return false;
        }

        try {
            return isHigherRole(userRole, targetRole);
        } catch (error) {
            console.error('RBAC: Higher role check failed', { userRole, targetRole, error });
            return false;
        }
    }, [userRole]);

    /**
     * Check if user role is equal or higher than target role
     */
    const checkEqualOrHigherRole = useCallback((targetRole) => {
        if (!userRole || !targetRole) {
            return false;
        }

        try {
            return isEqualOrHigherRole(userRole, targetRole);
        } catch (error) {
            console.error('RBAC: Equal/higher role check failed', { userRole, targetRole, error });
            return false;
        }
    }, [userRole]);

    // =============================================================================
    // PERMISSION GROUP VALIDATION FUNCTIONS - BACKEND SYNCHRONIZED
    // =============================================================================

    /**
     * Check if user has basic agent permissions
     */
    const hasBasicAgentPermissions = useCallback(() => {
        return checkAllPermissions(PERMISSION_GROUPS.BASIC_AGENT);
    }, [checkAllPermissions]);

    /**
     * Check if user has team management permissions
     */
    const hasTeamManagementPermissions = useCallback(() => {
        return checkAnyPermission(PERMISSION_GROUPS.TEAM_MANAGEMENT);
    }, [checkAnyPermission]);

    /**
     * Check if user has branch management permissions
     */
    const hasBranchManagementPermissions = useCallback(() => {
        return checkAnyPermission(PERMISSION_GROUPS.BRANCH_MANAGEMENT);
    }, [checkAnyPermission]);

    /**
     * Check if user has regional management permissions
     */
    const hasRegionalManagementPermissions = useCallback(() => {
        return checkAnyPermission(PERMISSION_GROUPS.REGIONAL_MANAGEMENT);
    }, [checkAnyPermission]);

    /**
     * Check if user has executive management permissions
     */
    const hasExecutiveManagementPermissions = useCallback(() => {
        return checkAnyPermission(PERMISSION_GROUPS.EXECUTIVE_MANAGEMENT);
    }, [checkAnyPermission]);

    /**
     * Check if user has administrative permissions
     */
    const hasAdministrativePermissions = useCallback(() => {
        return checkAnyPermission(PERMISSION_GROUPS.ADMINISTRATIVE);
    }, [checkAnyPermission]);

    // =============================================================================
    // DATA SCOPE AND CONTEXT FUNCTIONS - BACKEND SYNCHRONIZED
    // =============================================================================

    /**
     * Get data access scope for current user
     */
    const getAccessScope = useCallback((resourceType = 'agent') => {
        if (!userRole) {
            return { type: 'none', description: 'No access' };
        }

        try {
            return getDataScope(userRole, userBranch, userRegion);
        } catch (error) {
            console.error('RBAC: Access scope determination failed', { userRole, resourceType, error });
            return { type: 'none', description: 'Access scope error' };
        }
    }, [userRole, userBranch, userRegion]);

    /**
     * Get all permissions for current user
     */
    const getAllUserPermissions = useCallback(() => {
        if (!userRole) {
            return [];
        }

        try {
            return getUserPermissions(userRole);
        } catch (error) {
            console.error('RBAC: Get user permissions failed', { userRole, error });
            return [];
        }
    }, [userRole]);

    /**
     * Get roles that current user can assign to others
     */
    const getAssignableRolesList = useCallback(() => {
        if (!userRole) {
            return [];
        }

        try {
            return getAssignableRoles(userRole);
        } catch (error) {
            console.error('RBAC: Get assignable roles failed', { userRole, error });
            return [];
        }
    }, [userRole]);

    /**
     * Get subordinate roles for current user
     */
    const getSubordinateRolesList = useCallback(() => {
        if (!userRole) {
            return [];
        }

        try {
            return getSubordinateRoles(userRole);
        } catch (error) {
            console.error('RBAC: Get subordinate roles failed', { userRole, error });
            return [];
        }
    }, [userRole]);

    /**
     * Get superior roles for current user
     */
    const getSuperiorRolesList = useCallback(() => {
        if (!userRole) {
            return [];
        }

        try {
            return getSuperiorRoles(userRole);
        } catch (error) {
            console.error('RBAC: Get superior roles failed', { userRole, error });
            return [];
        }
    }, [userRole]);

    // =============================================================================
    // ROLE INFORMATION AND METADATA - BACKEND SYNCHRONIZED
    // =============================================================================

    /**
     * Get current user role level
     */
    const getUserRoleLevel = useCallback(() => {
        if (!userRole) {
            return 0;
        }

        try {
            return getRoleLevel(userRole);
        } catch (error) {
            console.error('RBAC: Get role level failed', { userRole, error });
            return 0;
        }
    }, [userRole]);

    /**
     * Get role context with full metadata
     */
    const getCurrentRoleContext = useCallback(() => {
        if (!userRole) {
            return null;
        }

        try {
            return getRoleContext(userRole);
        } catch (error) {
            console.error('RBAC: Get role context failed', { userRole, error });
            return null;
        }
    }, [userRole]);

    /**
     * Validate role assignment capability
     */
    const validateRoleAssignmentCapability = useCallback((targetRole, assignmentContext = {}) => {
        if (!userRole) {
            return { isValid: false, errors: ['Current user role not found'] };
        }

        try {
            return validateRoleAssignment(userRole, targetRole, assignmentContext);
        } catch (error) {
            console.error('RBAC: Validate role assignment failed', { userRole, targetRole, error });
            return { isValid: false, errors: ['Role assignment validation failed'] };
        }
    }, [userRole]);

    // =============================================================================
    // STATUS FLAGS - COMPUTED FROM BACKEND LOGIC
    // =============================================================================

    /**
     * Check if current user is in administrative role
     */
    const isAdministrator = useMemo(() => {
        return userRole === 'admin' || userRole === 'founding_member';
    }, [userRole]);

    /**
     * Check if current user is in management role (team leader and above)
     */
    const isManager = useMemo(() => {
        const level = getUserRoleLevel();
        return level >= 4; // team_leader level and above
    }, [getUserRoleLevel]);

    /**
     * Check if current user is in executive role (AVP and above)
     */
    const isExecutive = useMemo(() => {
        const level = getUserRoleLevel();
        return level >= 10; // avp level and above
    }, [getUserRoleLevel]);

    /**
     * Check if current user is authenticated and has valid role
     */
    const isAuthenticated = useMemo(() => {
        return !!(user && userRole);
    }, [user, userRole]);

    /**
     * Check if user can create agents
     */
    const canCreateAgents = useMemo(() => {
        return checkPermission(PERMISSIONS.CREATE_AGENTS);
    }, [checkPermission]);

    /**
     * Check if user can manage team
     */
    const canManageTeam = useMemo(() => {
        return checkPermission(PERMISSIONS.MANAGE_TEAM_MEMBERS);
    }, [checkPermission]);

    /**
     * Check if user can view analytics
     */
    const canViewAnalytics = useMemo(() => {
        return checkAnyPermission([
            PERMISSIONS.VIEW_TEAM_PERFORMANCE,
            PERMISSIONS.VIEW_BRANCH_ANALYTICS,
            PERMISSIONS.REGIONAL_ANALYTICS,
            PERMISSIONS.COMPANY_ANALYTICS
        ]);
    }, [checkAnyPermission]);

    // =============================================================================
    // DEBUG AND DEVELOPMENT UTILITIES
    // =============================================================================

    /**
     * Debug current user permissions (development only)
     */
    const debugPermissions = useCallback((detailed = false) => {
        if (process.env.NODE_ENV === 'development' && userRole) {
            debugUserPermissions(userRole, detailed);
        }
    }, [userRole]);

    /**
     * Get comprehensive RBAC status for debugging
     */
    const getRBACStatus = useCallback(() => {
        if (!userRole) {
            return {
                isAuthenticated: false,
                role: null,
                level: 0,
                permissions: [],
                scope: { type: 'none', description: 'Not authenticated' }
            };
        }

        return {
            isAuthenticated: true,
            role: userRole,
            level: getUserRoleLevel(),
            permissions: getAllUserPermissions(),
            scope: getAccessScope(),
            isManager,
            isExecutive,
            isAdministrator,
            assignableRoles: getAssignableRolesList(),
            subordinateRoles: getSubordinateRolesList(),
            superiorRoles: getSuperiorRolesList(),
            canCreateAgents,
            canManageTeam,
            canViewAnalytics
        };
    }, [
        userRole,
        getUserRoleLevel,
        getAllUserPermissions,
        getAccessScope,
        isManager,
        isExecutive,
        isAdministrator,
        getAssignableRolesList,
        getSubordinateRolesList,
        getSuperiorRolesList,
        canCreateAgents,
        canManageTeam,
        canViewAnalytics
    ]);

    // =============================================================================
    // RETURN COMPREHENSIVE RBAC INTERFACE - BACKEND SYNCHRONIZED
    // =============================================================================

    return useMemo(() => ({
        // Core permission checking
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,

        // Hierarchical authorization
        checkRoleManagement,
        checkAgentAccess,
        checkHigherRole,
        checkEqualOrHigherRole,

        // Permission group validation
        hasBasicAgentPermissions,
        hasTeamManagementPermissions,
        hasBranchManagementPermissions,
        hasRegionalManagementPermissions,
        hasExecutiveManagementPermissions,
        hasAdministrativePermissions,

        // Data scope and context
        getAccessScope,
        getAllUserPermissions,
        getAssignableRolesList,
        getSubordinateRolesList,
        getSuperiorRolesList,
        getUserRoleLevel,
        getCurrentRoleContext,
        validateRoleAssignmentCapability,

        // Role status flags
        isAuthenticated,
        isAdministrator,
        isManager,
        isExecutive,
        canCreateAgents,
        canManageTeam,
        canViewAnalytics,

        // User context
        userRole,
        userId,
        userBranch,
        userRegion,
        user,

        // Debug utilities
        debugPermissions,
        getRBACStatus,

        // Direct access to constants for advanced usage
        PERMISSIONS,
        ROLE_HIERARCHY,
        PERMISSION_LEVELS,
        PERMISSION_GROUPS,
        BRANCHES,
        REGIONS,
        DEPARTMENTS,
        ROLE_LABELS
    }), [
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        checkRoleManagement,
        checkAgentAccess,
        checkHigherRole,
        checkEqualOrHigherRole,
        hasBasicAgentPermissions,
        hasTeamManagementPermissions,
        hasBranchManagementPermissions,
        hasRegionalManagementPermissions,
        hasExecutiveManagementPermissions,
        hasAdministrativePermissions,
        getAccessScope,
        getAllUserPermissions,
        getAssignableRolesList,
        getSubordinateRolesList,
        getSuperiorRolesList,
        getUserRoleLevel,
        getCurrentRoleContext,
        validateRoleAssignmentCapability,
        isAuthenticated,
        isAdministrator,
        isManager,
        isExecutive,
        canCreateAgents,
        canManageTeam,
        canViewAnalytics,
        userRole,
        userId,
        userBranch,
        userRegion,
        user,
        debugPermissions,
        getRBACStatus
    ]);
};

// =============================================================================
// SPECIALIZED RBAC HOOKS FOR SPECIFIC USE CASES - BACKEND SYNCHRONIZED
// =============================================================================

/**
 * Simplified permission checking hook for basic component usage
 */
export const usePermission = (permission, user = null) => {
    const { checkPermission } = useRBAC(user);

    return useMemo(() => {
        return checkPermission(permission);
    }, [checkPermission, permission]);
};

/**
 * Role-based hook for checking if user can manage specific role
 */
export const useRoleManagement = (targetRole, user = null) => {
    const { checkRoleManagement } = useRBAC(user);

    return useMemo(() => {
        return checkRoleManagement(targetRole);
    }, [checkRoleManagement, targetRole]);
};

/**
 * Data scope hook for determining user's data access boundaries
 */
export const useDataScope = (user = null) => {
    const { getAccessScope } = useRBAC(user);

    return useMemo(() => {
        return getAccessScope();
    }, [getAccessScope]);
};

/**
 * Agent access hook for checking access to specific agent data
 */
export const useAgentAccess = (targetAgentId, user = null) => {
    const { checkAgentAccess } = useRBAC(user);

    return useMemo(() => {
        return checkAgentAccess(targetAgentId);
    }, [checkAgentAccess, targetAgentId]);
};

/**
 * Admin status hook for checking administrative permissions
 */
export const useIsAdmin = (user = null) => {
    const { isAdministrator } = useRBAC(user);
    return isAdministrator;
};

/**
 * Management status hook for checking if user has management capabilities
 */
export const useIsManager = (user = null) => {
    const { isManager } = useRBAC(user);
    return isManager;
};

// =============================================================================
// PERMISSION-SPECIFIC HOOKS FOR COMMON OPERATIONS - BACKEND SYNCHRONIZED
// =============================================================================

/**
 * Agent creation permission hook
 */
export const useCanCreateAgents = (user = null) => {
    return usePermission(PERMISSIONS.CREATE_AGENTS, user);
};

/**
 * Agent editing permission hook
 */
export const useCanEditAgents = (user = null) => {
    return usePermission(PERMISSIONS.EDIT_TEAM_AGENTS, user);
};

/**
 * Agent deletion permission hook
 */
export const useCanDeleteAgents = (user = null) => {
    return usePermission(PERMISSIONS.DELETE_AGENTS, user);
};

/**
 * Team management permission hook
 */
export const useCanManageTeam = (user = null) => {
    return usePermission(PERMISSIONS.MANAGE_TEAM_MEMBERS, user);
};

/**
 * Lead assignment permission hook
 */
export const useCanAssignLeads = (user = null) => {
    return usePermission(PERMISSIONS.ASSIGN_LEADS_TO_TEAM, user);
};

/**
 * Analytics viewing permission hook
 */
export const useCanViewAnalytics = (user = null) => {
    const { checkAnyPermission } = useRBAC(user);

    return useMemo(() => {
        return checkAnyPermission([
            PERMISSIONS.VIEW_TEAM_PERFORMANCE,
            PERMISSIONS.VIEW_BRANCH_ANALYTICS,
            PERMISSIONS.REGIONAL_ANALYTICS,
            PERMISSIONS.COMPANY_ANALYTICS
        ]);
    }, [checkAnyPermission]);
};

/**
 * Bulk operations permission hook
 */
export const useCanBulkOperations = (user = null) => {
    return usePermission(PERMISSIONS.BULK_OPERATIONS, user);
};

/**
 * Import/Export data permission hook
 */
export const useCanImportExportData = (user = null) => {
    return usePermission(PERMISSIONS.IMPORT_EXPORT_DATA, user);
};

// Export all hooks and utilities
export {
    PERMISSIONS,
    ROLE_HIERARCHY,
    PERMISSION_GROUPS,
    BRANCHES,
    REGIONS,
    DEPARTMENTS,
    ROLE_LABELS,
    getPermissionLabel,
    getRoleLabel
} from '../utils/rbacConstants.js';