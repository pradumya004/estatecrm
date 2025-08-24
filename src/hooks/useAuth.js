// estatecrm/src/hooks/useAuth.js

import { useMemo, useCallback } from 'react';
import { useAuth as useExistingAuth } from '../context/AuthContext';
import { useRBAC } from './useRBAC.js';
import { getRoleLevel, ROLE_LABELS } from '../utils/rbacConstants.js';

export const useAuth = () => {
    const existingAuth = useExistingAuth();
    const { user, loading, isAuthenticated, isAdmin, isAgent, firebaseUser } = existingAuth;

    const rbac = useRBAC(user);

    // =============================================================================
    // ENHANCED USER PROPERTIES
    // =============================================================================

    const userRole = useMemo(() => user?.role || null, [user?.role]);
    const userId = useMemo(() => user?.id || user?._id || user?.uid || null, [user]);

    const roleLevel = useMemo(() => {
        if (!userRole) return 0;
        return getRoleLevel(userRole);
    }, [userRole]);

    const roleLabel = useMemo(() => {
        if (!userRole) return '';
        return ROLE_LABELS[userRole] || userRole;
    }, [userRole]);

    // =============================================================================
    // RBAC STATUS FLAGS
    // =============================================================================

    const isManager = useMemo(() => roleLevel >= 4, [roleLevel]);
    const isExecutive = useMemo(() => roleLevel >= 10, [roleLevel]);

    // =============================================================================
    // PERMISSION FUNCTIONS
    // =============================================================================

    const hasPermission = useCallback((permission) => {
        return rbac.checkPermission(permission);
    }, [rbac]);

    const hasAnyPermission = useCallback((permissions) => {
        return rbac.checkAnyPermission(permissions);
    }, [rbac]);

    const hasAllPermissions = useCallback((permissions) => {
        return rbac.checkAllPermissions(permissions);
    }, [rbac]);

    const canManageRole = useCallback((targetRole) => {
        return rbac.checkRoleManagement(targetRole);
    }, [rbac]);

    // =============================================================================
    // RETURN ENHANCED INTERFACE
    // =============================================================================

    return useMemo(() => ({
        ...existingAuth,
        userRole,
        userId,
        roleLevel,
        roleLabel,
        isManager,
        isExecutive,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canManageRole,
        rbac
    }), [
        existingAuth,
        userRole,
        userId,
        roleLevel,
        roleLabel,
        isManager,
        isExecutive,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canManageRole,
        rbac
    ]);
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export const usePermission = (permission) => {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
};

export const useIsManager = () => {
    const { isManager } = useAuth();
    return isManager;
};

export const useIsAdmin = () => {
    const { isAdmin } = useAuth();
    return isAdmin;
};

export default useAuth;