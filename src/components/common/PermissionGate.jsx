// estatecrm/src/components/common/PermissionGate.jsx
// SIMPLIFIED: Uses user.permissions array directly from database

import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { PERMISSIONS } from "../../utils/rbacConstants";

const PermissionGate = memo(
  ({
    children,
    permissions = null,
    roles = null,
    permissionMode = "any",
    fallback = null,
    showFallback = true,
  }) => {
    const { user, loading, isAuthenticated } = useAuth();

    const hasAccess = useMemo(() => {
      // Loading or not authenticated
      if (loading || !isAuthenticated || !user) return false;

      // Admin override
      if (user.role === "admin" || user.role === "founding_member") return true;

      // Role check
      if (roles) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        if (!roleArray.includes(user.role)) return false;
      }

      // Permission check - SIMPLIFIED
      if (permissions) {
        const permissionArray = Array.isArray(permissions)
          ? permissions
          : [permissions];
        const userPermissions = user.permissions || [];

        return permissionMode === "all"
          ? permissionArray.every((p) => userPermissions.includes(p))
          : permissionArray.some((p) => userPermissions.includes(p));
      }

      return true;
    }, [user, loading, isAuthenticated, permissions, roles, permissionMode]);

    // Loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      );
    }

    // Access granted
    if (hasAccess) return <>{children}</>;

    // Access denied
    if (!showFallback) return null;

    return (
      fallback || (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 font-medium">Access Restricted</p>
          <p className="text-xs text-gray-500 mt-1">Insufficient permissions</p>
        </div>
      )
    );
  }
);

PermissionGate.displayName = "PermissionGate";

// =============================================================================
// SPECIALIZED GATES
// =============================================================================

export const AdminGate = memo(({ children, fallback, ...props }) => (
  <PermissionGate
    roles={["admin", "founding_member"]}
    fallback={fallback}
    {...props}
  >
    {children}
  </PermissionGate>
));

export const FeatureGate = memo(({ children, feature, fallback, ...props }) => {
  const featurePermissions = {
    createAgents: [PERMISSIONS.CREATE_AGENTS],
    editAgents: [PERMISSIONS.EDIT_TEAM_AGENTS],
    deleteAgents: [PERMISSIONS.DELETE_AGENTS],
    manageTeam: [PERMISSIONS.MANAGE_TEAM_MEMBERS],
    viewAnalytics: [
      PERMISSIONS.VIEW_BRANCH_ANALYTICS,
      PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    ],
    bulkOperations: [PERMISSIONS.BULK_OPERATIONS],
    createLeads: [PERMISSIONS.CREATE_LEADS],
    importData: [PERMISSIONS.IMPORT_EXPORT_DATA],
  };

  return (
    <PermissionGate
      permissions={featurePermissions[feature]}
      permissionMode="any"
      fallback={fallback}
      {...props}
    >
      {children}
    </PermissionGate>
  );
});

export const ManagementGate = memo(
  ({ children, level = "team", fallback, ...props }) => {
    const managementRoles = {
      team: [
        "team_leader",
        "sr_team_leader",
        "branch_manager",
        "sr_branch_manager",
        "regional_manager",
        "sr_regional_manager",
        "avp",
        "vp",
        "founding_member",
        "admin",
      ],
      branch: [
        "branch_manager",
        "sr_branch_manager",
        "regional_manager",
        "sr_regional_manager",
        "avp",
        "vp",
        "founding_member",
        "admin",
      ],
      regional: [
        "regional_manager",
        "sr_regional_manager",
        "avp",
        "vp",
        "founding_member",
        "admin",
      ],
      executive: ["avp", "vp", "founding_member", "admin"],
    };

    return (
      <PermissionGate
        roles={managementRoles[level]}
        fallback={fallback}
        {...props}
      >
        {children}
      </PermissionGate>
    );
  }
);

FeatureGate.displayName = "FeatureGate";
ManagementGate.displayName = "ManagementGate";

export default PermissionGate;