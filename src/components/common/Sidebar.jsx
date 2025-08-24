// estatecrm/src/components/common/Sidebar.jsx

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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRBAC } from "../../hooks/useRBAC";
import { PERMISSIONS } from "../../utils/rbacConstants";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const rbac = useRBAC(user);
  //   console.log("RBAC:", rbac);

  // Base path based on user role
  const basePath = useMemo(() => {
    if (!user) return "/";
    // We can use the rbac hook here too for consistency!
    return rbac.isAdministrator ? "/admin" : "/agent";
  }, [user, rbac]);

  //   Agent Sidebar
  const agentNav = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "",
      icon: Home,
      accessCheck: () => true,
    },
    {
      id: "profile",
      label: "My Profile",
      path: "/profile",
      icon: User,
      accessCheck: (rbac) => rbac.checkPermission("VIEW_OWN_PROFILE"),
    },
    {
      id: "assigned-leads",
      label: "Assigned Leads",
      path: "/leads",
      icon: Target,
      accessCheck: (rbac) => rbac.checkPermission("VIEW_ASSIGNED_LEADS"),
    },
    {
      id: "assigned-properties",
      label: "Assigned Properties",
      path: "/assigned-properties",
      icon: Building,
      accessCheck: (rbac) => rbac.checkPermission("VIEW_ASSIGNED_PROPERTIES"),
    },
    {
      id: "team-management",
      label: "Team Management",
      path: "/team",
      icon: Users,
      accessCheck: (rbac) => rbac.hasTeamManagementPermissions(),
    },
    {
      id: "create-agents",
      label: "Create Agents",
      path: "/create-agent",
      icon: UserCheck,
      accessCheck: (rbac) => rbac.canCreateAgents, // Use the boolean property
    },
    {
      id: "branch-agents",
      label: "Branch Agents",
      path: "/branch-agents",
      icon: Building2,
      accessCheck: (rbac) => rbac.hasBranchManagementPermissions(),
    },
    {
      id: "team-performance",
      label: "Team Performance",
      path: "/team-performance",
      icon: TrendingUp,
      accessCheck: (rbac) => rbac.hasTeamManagementPermissions(),
    },
    {
      id: "branch-analytics",
      label: "Branch Analytics",
      path: "/branch-analytics",
      icon: BarChart3,
      accessCheck: (rbac) => rbac.hasBranchManagementPermissions(),
    },
    {
      id: "regional-data",
      label: "Regional Data",
      path: "/regional",
      icon: Globe,
      accessCheck: (rbac) => rbac.hasRegionalManagementPermissions(),
    },
  ];

  // Admin Sidebar
  const adminNav = [
    {
      id: "admin-dashboard",
      label: "Admin Dashboard",
      path: "",
      icon: Settings,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "leads-management",
      label: "Leads Management",
      path: "/leads",
      icon: FileText,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "agents-management",
      label: "Agents Management",
      path: "/agents",
      icon: Users,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "role-management",
      label: "Role Management",
      path: "/roles",
      icon: Shield,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "department-management",
      label: "Departments",
      path: "/departments",
      icon: Building2,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "system-settings",
      label: "System Settings",
      path: "/system",
      icon: Settings,
      accessCheck: (rbac) => rbac.isAdministrator,
    },
    {
      id: "company-analytics",
      label: "Company Analytics",
      path: "/company-analytics",
      icon: BarChart3,
      accessCheck: (rbac) => rbac.hasExecutiveManagementPermissions(),
    },
  ];

  // Pick the correct menu based on role
  const navigationItems = useMemo(() => {
    if (!user || !rbac.isAuthenticated) return [];
    if (rbac.isAdministrator) return adminNav;
    return agentNav;
  }, [user, rbac]);

  // Filter navigation items based on user permissions and roles
  const filteredNavigation = useMemo(() => {
    if (!user || !rbac.isAuthenticated) return [];

    const isAdmin = user.role === "admin" || user.role === "founding_member";

    return navigationItems.filter(
      (item) => item.accessCheck && item.accessCheck(rbac)
    );
  }, [user, rbac, navigationItems]);

  // Get icon component
  const getIcon = (IconComponent) => {
    return IconComponent || Home;
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen sticky top-0`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">EstateCRM</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.designation || user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = getIcon(item.icon);
            const fullPath = `${basePath}${item.path}`.replace(/\/$/, "");
            const isActive =
              location.pathname === fullPath ||
              (item.path !== "" && location.pathname.startsWith(fullPath));

            return (
              <NavLink
                key={item.id}
                to={fullPath || basePath}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group relative ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-gray-700"
                  } ${!isCollapsed ? "mr-3" : ""}`}
                />

                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute top-1/2 left-0 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section - Role + Logout */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Role Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  rbac.isAdministrator
                    ? "bg-red-500"
                    : rbac.isManager
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <span className="text-xs text-gray-500">
                {rbac.isAdministrator
                  ? "Administrator"
                  : rbac.isManager
                  ? "Manager"
                  : "Agent"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                // Call your logout method from AuthContext
                if (window.confirm("Are you sure you want to log out?")) {
                  localStorage.clear();
                  window.location.href = "/login"; // or use logout() from context
                }
              }}
              className="text-xs text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
