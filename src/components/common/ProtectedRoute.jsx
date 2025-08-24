// estatecrm/src/components/common/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useRBAC } from "../../hooks/useRBAC.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredRoles,
  requiredPermissions,
  permissionMode = "any",
  fallbackPath = "/login",
  showFallback = true,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const rbac = useRBAC(user);

  //   Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is an admin or founding member, grant access immediately.
  const isAdmin =
    user && (user.role === "admin" || user.role === "founding_member");
  if (isAdmin) {
    return children;
  }

  // Single role requirement check
  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = fallbackPath || getDefaultRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Multiple roles requirement check
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    const redirectPath = fallbackPath || getDefaultRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Permission-based access check
  if (requiredPermissions) {
    const hasAccess =
      permissionMode === "all"
        ? rbac.checkAllPermissions(requiredPermissions)
        : rbac.checkAnyPermission(requiredPermissions);

    if (!hasAccess) {
      if (!showFallback) {
        const redirectPath = fallbackPath || getDefaultRedirectPath(user.role);
        return <Navigate to={redirectPath} replace />;
      }

      // Show access denied UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You don't have the required permissions to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

// Helper function to get default redirect path based on user role
const getDefaultRedirectPath = (userRole) => {
  switch (userRole) {
    case "admin":
    case "founding_member":
      return "/admin";
    case "regional_manager":
    case "sr_regional_manager":
    case "avp":
    case "vp":
      return "/regional";
    case "branch_manager":
    case "sr_branch_manager":
      return "/branch";
    case "team_leader":
    case "sr_team_leader":
      return "/team";
    default:
      return "/agent";
  }
};

export default ProtectedRoute;
