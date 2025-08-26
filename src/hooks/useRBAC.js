// estatecrm/src/hooks/useRBAC.js
// SIMPLIFIED: Direct database permission checking only

import { useMemo, useCallback } from 'react';
import { hasPermission, hasAllPermissions, hasAnyPermission, PERMISSIONS, getRoleLevel, getRoleLabel } from '../utils/rbacConstants.js';

export const useRBAC = (user = null) => {
    const userRole = user?.role;
    const roleLevel = user?.roleLevel || 0;
    const roleLabel = getRoleLabel(userRole);

    // Simple permission checking using database permissions
    const checkPermission = useCallback((permission) => {
        return hasPermission(user, permission);
    }, [user]);

    const checkAnyPermission = useCallback((permissions) => {
        return hasAnyPermission(user, permissions);
    }, [user]);

    const checkAllPermissions = useCallback((permissions) => {
        return hasAllPermissions(user, permissions);
    }, [user]);

    // Status flags
    const isAuthenticated = !!user;
    const isAdministrator = userRole === 'admin' || userRole === 'founding_member';
    const isManager = roleLevel >= 4;
    const isExecutive = roleLevel >= 10;

    // Common permission shortcuts
    const canCreateAgents = checkPermission(PERMISSIONS.CREATE_AGENTS);
    const canManageTeam = checkPermission(PERMISSIONS.MANAGE_TEAM_MEMBERS);
    const canViewAnalytics = checkAnyPermission([
        PERMISSIONS.VIEW_TEAM_PERFORMANCE,
        PERMISSIONS.VIEW_BRANCH_ANALYTICS,
        PERMISSIONS.REGIONAL_ANALYTICS,
        PERMISSIONS.COMPANY_ANALYTICS
    ]);

    const getAssignableRolesList = (allRoles = []) => {
        if (!user || !userRole) {
            // console.log('No user or role found');

            return [];
        }

        // console.log("allRoles names:", allRoles.map(r => r.name));
        // console.log("user role name:", userRole);

        const currentUserRole = allRoles.find(r => r.name === userRole);
        // console.log("Current user role:", currentUserRole);

        if (!currentUserRole) return [];

        // ✅ Return only names (strings)
        return allRoles
            .filter(r => r.level <= currentUserRole.level) // can assign roles <= your level
            .map(r => r.name);
    };

    return useMemo(() => ({
        // Core permission checking
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,

        // User context
        userRole,
        roleLabel,
        roleLevel,
        isAuthenticated,
        isAdministrator,
        isManager,
        isExecutive,

        // Common permissions
        canCreateAgents,
        canManageTeam,
        canViewAnalytics,

        // Direct access to user for complex checks
        user,
        getAssignableRolesList
    }), [
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        userRole,
        roleLabel,
        roleLevel,
        isAuthenticated,
        isAdministrator,
        isManager,
        isExecutive,
        canCreateAgents,
        canManageTeam,
        canViewAnalytics,
        user
    ]);
};