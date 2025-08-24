// estatecrm/src/components/common/PermissionGate.jsx

import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { useRBAC } from "../../hooks/useRBAC";
import { PERMISSIONS, PERMISSION_GROUPS } from "../../utils/rbacConstants";

// PermissionGate Component
const PermissionGate = memo(
  ({
    children,
    permissions = null,
    roles = null,
    permissionMode = "any", // "any" or "all"
    targetAgentId = null,
    requireAuthentication = true,
    fallback = null,
    loadingComponent = null,
    onAccessDenied = null,
    userOverride = null,
    showFallback = true,
    className = "",
    style = {},
    strict = false,
  }) => {
    const { user: contextUser, loading, isAuthenticated } = useAuth();
    const user = userOverride || contextUser;
    const rbac = useRBAC(user);

    // console.log("User override:", userOverride);
    // console.log("User:", user);
    // console.log("RBAC:", rbac);

    // Permission validation logic
    const validation = useMemo(() => {
      try {
        if (user?.role === "admin" || user?.role === "founding_member") {
          return {
            granted: true,
            reason: "admin_override",
            message: "Access granted via admin override",
          };
        }

        // Authentication check
        if (requireAuthentication && !isAuthenticated) {
          return {
            granted: false,
            reason: "authentication_required",
            message: "Authentication required",
          };
        }

        // Role-based validation
        if (roles) {
          const roleArray = Array.isArray(roles) ? roles : [roles];
          const hasRequiredRole = roleArray.includes(user?.role);

          if (!hasRequiredRole) {
            return {
              granted: false,
              reason: "insufficient_role",
              message: `Role '${
                user?.role
              }' insufficient. Required: ${roleArray.join(", ")}`,
            };
          }
        }

        // Permission-based validation
        if (permissions) {
          const permissionArray = Array.isArray(permissions)
            ? permissions
            : [permissions];
            // console.log("Permission Array:", permissionArray);
            
          const hasAccess =
            permissionMode === "all"
              ? rbac.checkAllPermissions(permissionArray)
              : rbac.checkAnyPermission(permissionArray);

          if (!hasAccess) {
            return {
              granted: false,
              reason: "insufficient_permissions",
              message: `Missing required permissions: ${permissionArray.join(
                ", "
              )}`,
            };
          }
        }

        // Agent access validation
        if (targetAgentId) {
          const hasAgentAccess = rbac.checkAgentAccess(targetAgentId);
          if (!hasAgentAccess) {
            return {
              granted: false,
              reason: "agent_access_denied",
              message: "Cannot access this agent's data",
            };
          }
        }

        return {
          granted: true,
          reason: "authorized",
          message: "Access granted",
        };
      } catch (error) {
        console.error("PermissionGate validation error:", error);

        if (strict) {
          return {
            granted: false,
            reason: "validation_error",
            message: "Permission validation failed",
          };
        }

        // Graceful degradation in non-strict mode
        return {
          granted: true,
          reason: "error_fallback",
          message: "Access granted (validation error)",
        };
      }
    }, [
      requireAuthentication,
      isAuthenticated,
      roles,
      user?.role,
      permissions,
      permissionMode,
      rbac,
      targetAgentId,
      strict,
    ]);

    // Handle access denied callback
    useMemo(() => {
      if (!validation.granted && onAccessDenied) {
        try {
          onAccessDenied({
            reason: validation.reason,
            message: validation.message,
            user,
            permissions,
            roles,
          });
        } catch (error) {
          console.error("Access denied callback error:", error);
        }
      }
    }, [
      validation.granted,
      onAccessDenied,
      validation.reason,
      validation.message,
      user,
      permissions,
      roles,
    ]);

    // Loading state
    if (loading || (requireAuthentication && !user)) {
      if (loadingComponent) {
        return typeof loadingComponent === "function"
          ? loadingComponent({ permissions, roles })
          : loadingComponent;
      }

      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking permissions...</span>
        </div>
      );
    }

    // Access granted
    if (validation.granted) {
      if (className || Object.keys(style).length > 0) {
        return (
          <div className={className} style={style}>
            {children}
          </div>
        );
      }
      return <>{children}</>;
    }

    // Access denied
    if (!showFallback) {
      return null;
    }

    // Custom fallback
    if (fallback) {
      return typeof fallback === "function"
        ? fallback({
            reason: validation.reason,
            message: validation.message,
            user,
            permissions,
            roles,
          })
        : fallback;
    }

    // Default fallback UI
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-8V9a2 2 0 10-4 0v2m6 0h-6"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 font-medium">Access Restricted</p>
        <p className="text-xs text-gray-500 mt-1">
          {validation.message || "Insufficient permissions"}
        </p>
      </div>
    );
  }
);

PermissionGate.displayName = "PermissionGate";

PermissionGate.propTypes = {
  children: PropTypes.node.isRequired,
  permissions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  permissionMode: PropTypes.oneOf(["any", "all"]),
  targetAgentId: PropTypes.string,
  requireAuthentication: PropTypes.bool,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  loadingComponent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onAccessDenied: PropTypes.func,
  userOverride: PropTypes.object,
  showFallback: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  strict: PropTypes.bool,
};

// =============================================================================
// SPECIALIZED PERMISSION GATES
// =============================================================================

// Admin-only access gate
export const AdminGate = memo(({ children, fallback, ...props }) => (
  <PermissionGate
    roles={["admin", "founding_member"]}
    fallback={
      fallback || (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-red-600 font-medium">
            Administrator Access Required
          </p>
          <p className="text-xs text-red-500 mt-1">
            This feature requires admin privileges
          </p>
        </div>
      )
    }
    {...props}
  >
    {children}
  </PermissionGate>
));

AdminGate.displayName = "AdminGate";

// Management access gate
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
        fallback={
          fallback || (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-600 font-medium">
                Management Access Required
              </p>
              <p className="text-xs text-yellow-500 mt-1">
                This feature requires {level}-level management permissions
              </p>
            </div>
          )
        }
        {...props}
      >
        {children}
      </PermissionGate>
    );
  }
);

ManagementGate.displayName = "ManagementGate";

// Feature-specific permission gate
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
    systemSettings: [PERMISSIONS.SYSTEM_SETTINGS],
  };

  return (
    <PermissionGate
      permissions={featurePermissions[feature]}
      permissionMode="any"
      fallback={
        fallback || (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 font-medium">
              Feature Access Required
            </p>
            <p className="text-xs text-blue-500 mt-1">
              You don't have permission to use this feature
            </p>
          </div>
        )
      }
      {...props}
    >
      {children}
    </PermissionGate>
  );
});

FeatureGate.displayName = "FeatureGate";

// Agent access gate for viewing specific agent data
export const AgentAccessGate = memo(
  ({ children, agentId, allowSelfAccess = true, fallback, ...props }) => {
    const { user } = useAuth();

    return (
      <PermissionGate
        targetAgentId={agentId}
        permissions={
          allowSelfAccess && user?.id === agentId
            ? [PERMISSIONS.VIEW_OWN_PROFILE]
            : [PERMISSIONS.VIEW_BRANCH_AGENTS]
        }
        fallback={
          fallback || (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-600 font-medium">
                Agent Access Restricted
              </p>
              <p className="text-xs text-purple-500 mt-1">
                You don't have permission to access this agent's information
              </p>
            </div>
          )
        }
        {...props}
      >
        {children}
      </PermissionGate>
    );
  }
);

AgentAccessGate.displayName = "AgentAccessGate";

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Higher-order component for wrapping components with permissions
export const withPermissions = (Component, permissionConfig = {}) => {
  const WrappedComponent = memo((props) => (
    <PermissionGate {...permissionConfig}>
      <Component {...props} />
    </PermissionGate>
  ));

  WrappedComponent.displayName = `withPermissions(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

export default PermissionGate;
