// estatecrm/src/components/common/Sidebar.jsx
// UPDATED: Uses real user data and permissions from database

import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Building,
  BarChart3,
  User,
  Settings,
  Database,
  FileText,
  Target,
  MapPin,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  UserCheck,
  Building2,
  Globe,
  Crown,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout, hasPermission, hasAnyPermission, isAdmin, isManager } =
    useAuth();

  // Base path based on user role
  const basePath = useMemo(() => {
    if (!user) return "/";
    return isAdmin ? "/admin" : "/agent";
  }, [user, isAdmin]);

  // Agent Sidebar Navigation - Using real permissions
  const agentNav = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "",
      icon: Home,
    //   accessCheck: () => true, // Everyone can access dashboard
    },
    {
      id: "profile",
      label: "My Profile",
      path: "/profile",
      icon: User,
    //   accessCheck: () => hasPermission(PERMISSIONS.VIEW_OWN_PROFILE),
    },
    {
      id: "assigned-leads",
      label: "Assigned Leads",
      path: "/leads",
      icon: Target,
    //   accessCheck: () => hasPermission(PERMISSIONS.VIEW_ASSIGNED_LEADS),
    },
    {
      id: "assigned-properties",
      label: "Assigned Properties",
      path: "/properties",
      icon: Building,
    //   accessCheck: () => hasPermission(PERMISSIONS.VIEW_ASSIGNED_PROPERTIES),
    },
    {
      id: "team-management",
      label: "Team Management",
      path: "/team",
      icon: Users,
    //   accessCheck: () =>
    //     hasAnyPermission([
    //       PERMISSIONS.MANAGE_TEAM_MEMBERS,
    //       PERMISSIONS.VIEW_TEAM_HIERARCHY,
    //     ]),
    },
    {
      id: "create-agents",
      label: "Create Agents",
      path: "/create-agent",
      icon: UserCheck,
    //   accessCheck: () => hasPermission(PERMISSIONS.CREATE_AGENTS),
    },
    {
      id: "branch-agents",
      label: "Branch Agents",
      path: "/branch-agents",
      icon: Building2,
    //   accessCheck: () =>
        // hasAnyPermission([
        //   PERMISSIONS.VIEW_BRANCH_AGENTS,
        //   PERMISSIONS.EDIT_TEAM_AGENTS,
        // ]),
    },
    {
      id: "team-performance",
      label: "Team Performance",
      path: "/team-performance",
      icon: TrendingUp,
    //   accessCheck: () => hasPermission(PERMISSIONS.VIEW_TEAM_PERFORMANCE),
    },
    {
      id: "branch-analytics",
      label: "Branch Analytics",
      path: "/branch-analytics",
      icon: BarChart3,
    //   accessCheck: () => hasPermission(PERMISSIONS.VIEW_BRANCH_ANALYTICS),
    },
    {
      id: "regional-data",
      label: "Regional Data",
      path: "/regional",
      icon: Globe,
    //   accessCheck: () =>
    //     hasAnyPermission([
    //       PERMISSIONS.VIEW_REGIONAL_DATA,
    //       PERMISSIONS.REGIONAL_ANALYTICS,
    //     ]),
    },
    {
      id: "company-analytics",
      label: "Company Analytics",
      path: "/company-analytics",
      icon: BarChart3,
    //   accessCheck: () => hasPermission(PERMISSIONS.COMPANY_ANALYTICS),
    },
  ];

  // Admin Sidebar Navigation - Using real permissions
  const adminNav = [
    {
      id: "admin-dashboard",
      label: "Admin Dashboard",
      path: "",
      icon: Settings,
    //   accessCheck: () => isAdmin,
    },
    {
      id: "leads-management",
      label: "Leads Management",
      path: "/leads",
      icon: FileText,
    //   accessCheck: () =>
    //     hasAnyPermission([
    //       PERMISSIONS.EDIT_LEADS,
    //       PERMISSIONS.DELETE_LEADS,
    //       PERMISSIONS.BULK_OPERATIONS,
    //     ]),
    },
    {
      id: "agents-management",
      label: "Agents Management",
      path: "/agents",
      icon: Users,
    //   accessCheck: () => hasPermission(PERMISSIONS.MANAGE_ALL_USERS),
    },
    {
      id: "properties-management",
      label: "Properties Management",
      path: "/properties",
      icon: Building2,
    //   accessCheck: () =>
    //     hasAnyPermission([
    //       PERMISSIONS.EDIT_PROPERTIES,
    //       PERMISSIONS.DELETE_PROPERTIES,
    //       PERMISSIONS.BULK_OPERATIONS,
    //     ]),
    },
    // {
    //   id: "role-management",
    //   label: "Role Management",
    //   path: "/roles",
    //   icon: Shield,
    // //   accessCheck: () => hasPermission(PERMISSIONS.MANAGE_ROLES),
    // },
    // {
    //   id: "departments-management",
    //   label: "Departments Management",
    //   path: "/departments",
    //   icon: Building2,
    // //   accessCheck: () => hasPermission(PERMISSIONS.MANAGE_DEPARTMENTS),
    // },
    {
      id: "system-settings",
      label: "System Settings",
      path: "/system",
      icon: Settings,
    //   accessCheck: () => hasPermission(PERMISSIONS.SYSTEM_SETTINGS),
    },
    {
      id: "company-analytics",
      label: "Company Analytics",
      path: "/company-analytics",
      icon: BarChart3,
    //   accessCheck: () => hasPermission(PERMISSIONS.COMPANY_ANALYTICS),
    },
    {
      id: "bulk-operations",
      label: "Bulk Operations",
      path: "/bulk-operations",
      icon: Database,
    //   accessCheck: () =>
    //     hasAnyPermission([
    //       PERMISSIONS.BULK_OPERATIONS,
    //       PERMISSIONS.IMPORT_EXPORT_DATA,
    //     ]),
    },
  ];

  // Pick the correct menu based on role
  const navigationItems = useMemo(() => {
    if (!user) return [];
    return isAdmin ? adminNav : agentNav;
  }, [user, isAdmin]);

  // Filter navigation items based on user permissions
  const filteredNavigation = useMemo(() => {
    if (!user) return [];

    return navigationItems;
  }, [user, navigationItems]);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.name) {
      return user.name;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  // Get user initials
  const getUserInitials = () => {
    const name = getUserDisplayName();
    const nameParts = name.split(" ");

    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }

    return name.charAt(0).toUpperCase();
  };

  // Get role display label
  const getRoleDisplayLabel = () => {
    if (!user?.role) return "User";
    return formatToTitleCase(user.role);
  };

  // Get department display label
  const getDepartmentDisplayLabel = () => {
    if (!user?.department) return "";
    return typeof user.department === "string"
      ? user.department
      : user.department.name || "";
  };

  if (!user) {
    return (
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isCollapsed ? "w-22" : "w-64"
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Estate CRM</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {getUserInitials()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-gray-500 truncate">
                  {getRoleDisplayLabel()}
                </p>
                {isManager && <Crown className="w-3 h-3 text-yellow-500" />}
                {isAdmin && <Shield className="w-3 h-3 text-red-500" />}
              </div>
              {getDepartmentDisplayLabel() && (
                <p className="text-xs text-blue-600 truncate">
                  {getDepartmentDisplayLabel()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon || Home;
          const fullPath = `${basePath}${item.path}`;
          const isActive = location.pathname === fullPath;

          return (
            <NavLink
              key={item.id}
              to={fullPath}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Debug Info (only in development) */}
      {!isCollapsed && process.env.NODE_ENV === "development" && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Role Level: {user?.roleLevel || "N/A"}</div>
            <div>Permissions: {user?.permissions?.length || 0}</div>
            <div>Branch: {user?.branch || "N/A"}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
