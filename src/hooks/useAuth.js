// estatecrm/src/hooks/useAuth.js
// SIMPLIFIED: Direct database permission checking

import { useMemo, useCallback } from 'react';
import { useAuth as useExistingAuth } from '../context/AuthContext';
import { hasPermission, hasAllPermissions, hasAnyPermission, getRoleLevel, getRoleLabel } from '../utils/rbacConstants.js';

export const useAuth = () => {
    const auth = useExistingAuth();
    const { user } = auth;

    // Simple permission functions using database permissions
    const checkPermission = useCallback((permission) => {
        return hasPermission(user, permission);
    }, [user]);

    const checkAnyPermission = useCallback((permissions) => {
        return hasAnyPermission(user, permissions);
    }, [user]);

    const checkAllPermissions = useCallback((permissions) => {
        return hasAllPermissions(user, permissions);
    }, [user]);

    // Role info
    const userRole = user?.role;
    const roleLevel = user?.roleLevel || 0;
    const roleLabel = getRoleLabel(userRole);
    const isManager = roleLevel >= 4;
    const isAdmin = userRole === 'admin' || userRole === 'founding_member';

    // Create rbac object for backward compatibility
    const rbac = useMemo(() => ({
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        userRole,
        roleLabel,
        roleLevel,
        isManager,
        isAdmin,
        isAuthenticated: !!user,
        user
    }), [
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        userRole,
        roleLabel,
        roleLevel,
        isManager,
        isAdmin,
        user
    ]);

    return useMemo(() => ({
        ...auth,
        // Direct permission checking
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        // Role info
        userRole,
        roleLevel,
        roleLabel,
        isManager,
        isAdmin,
        // Backward compatibility
        rbac
    }), [
        auth,
        checkPermission,
        checkAnyPermission,
        checkAllPermissions,
        userRole,
        roleLevel,
        roleLabel,
        isManager,
        isAdmin,
        rbac
    ]);
};

export default useAuth;