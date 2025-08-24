// estatecrm/src/components/admin/AdminSettings.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Building2,
  Users,
  Settings,
  Database,
  FileText,
  Activity,
  Plus,
  ArrowRight,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRBAC } from "../../hooks/useRBAC";
import { AdminGate } from "../common/PermissionGate";
import { adminAPI } from "../../services/api";
import { PERMISSIONS } from "../../utils/rbacConstants";

const AdminSettings = () => {
  const { user } = useAuth();
  const rbac = useRBAC(user);
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalRoles: 0,
    totalDepartments: 0,
    totalAgents: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, departmentsResponse] = await Promise.all([
        adminAPI.getAllRoles(),
        adminAPI.getAllDepartments(),
      ]);

      setDashboardStats({
        totalRoles: rolesResponse.data.roles.length,
        totalDepartments: departmentsResponse.data.departments.length,
        totalAgents: 0, // Will be updated when agents API is added
        recentActivity: [], // Will be populated later
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      id: "roles",
      title: "Role Management",
      description: "Manage user roles and permissions",
      icon: Shield,
      path: "/admin/roles",
      color: "bg-blue-500",
      stats: dashboardStats.totalRoles,
      statsLabel: "Roles",
      permissions: [PERMISSIONS.FULL_SYSTEM_ACCESS],
    },
    {
      id: "departments",
      title: "Department Management",
      description: "Manage organizational departments",
      icon: Building2,
      path: "/admin/departments",
      color: "bg-green-500",
      stats: dashboardStats.totalDepartments,
      statsLabel: "Departments",
      permissions: [PERMISSIONS.MANAGE_DEPARTMENTS],
    },
    {
      id: "agents",
      title: "Agent Management",
      description: "Manage all system agents",
      icon: Users,
      path: "/admin/agents",
      color: "bg-purple-500",
      stats: dashboardStats.totalAgents,
      statsLabel: "Agents",
      permissions: [PERMISSIONS.MANAGE_ALL_USERS],
    },
    {
      id: "system",
      title: "System Settings",
      description: "Configure system-wide settings",
      icon: Settings,
      path: "/admin/system",
      color: "bg-orange-500",
      stats: null,
      statsLabel: null,
      permissions: [PERMISSIONS.SYSTEM_SETTINGS],
    },
    {
      id: "analytics",
      title: "Company Analytics",
      description: "View comprehensive system analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "bg-indigo-500",
      stats: null,
      statsLabel: null,
      permissions: [PERMISSIONS.COMPANY_ANALYTICS],
    },
    {
      id: "bulk-operations",
      title: "Bulk Operations",
      description: "Perform bulk data operations",
      icon: Database,
      path: "/admin/bulk",
      color: "bg-red-500",
      stats: null,
      statsLabel: null,
      permissions: [PERMISSIONS.BULK_OPERATIONS],
    },
  ];

  const filteredModules = adminModules.filter((module) => {
    return rbac.checkAnyPermission(module.permissions);
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminGate>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage system configuration and organizational structure
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.totalRoles}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.totalDepartments}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.id}
                to={module.path}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {module.description}
                </p>

                {module.stats !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{module.statsLabel}</span>
                    <span className="font-semibold text-gray-900">
                      {module.stats}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Current Administrator
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">RBAC Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Role-Based Access
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Permission System
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Role</span>
                  <span className="text-sm font-medium text-blue-600">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/roles")}
              className="flex items-center space-x-3 bg-white rounded-lg p-4 hover:bg-blue-50 transition-colors border border-blue-200"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Create New Role</span>
            </button>
            <button
              onClick={() => navigate("/admin/departments")}
              className="flex items-center space-x-3 bg-white rounded-lg p-4 hover:bg-blue-50 transition-colors border border-blue-200"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Create Department
              </span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-3 bg-white rounded-lg p-4 hover:bg-blue-50 transition-colors border border-blue-200"
            >
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>
    </AdminGate>
  );
};

export default AdminSettings;
