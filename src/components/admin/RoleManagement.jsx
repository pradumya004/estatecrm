// estatecrm/src/components/admin/RoleManagement.jsx
// UPDATED: Uses real user data and permissions from database

import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  Users,
  Key,
  Crown,
  CheckCircle,
  Circle,
} from "lucide-react";
import { AdminGate } from "../common/PermissionGate";
import { useAuth } from "../../hooks/useAuth";
import { adminAPI } from "../../services/api";
import {
  PERMISSIONS,
  ROLE_LABELS,
  getRoleLevel,
  getRoleLabel,
  canManageRole,
} from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const RoleManagement = () => {
  const { user, isAdmin, roleLevel } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllRoles();
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Failed to load roles:", error);
      alert("Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole({
      name: "",
      description: "",
      level: 1,
      permissions: [],
    });
    setShowCreateModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole({ ...role });
    setShowCreateModal(true);
  };

  const handleSaveRole = async () => {
    try {
      if (!editingRole.name.trim()) {
        alert("Role name is required");
        return;
      }

      if (!editingRole.description?.trim()) {
        alert("Role description is required");
        return;
      }

      if (editingRole.permissions.length === 0) {
        alert("At least one permission is required");
        return;
      }

      const roleData = {
        name: editingRole.name.trim(),
        description: editingRole.description.trim(),
        level: editingRole.level,
        permissions: editingRole.permissions,
      };

      if (editingRole._id) {
        await adminAPI.updateRole(editingRole._id, roleData);
      } else {
        await adminAPI.createRole(roleData);
      }

      setShowCreateModal(false);
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save role. Please try again."
      );
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await adminAPI.deleteRole(roleId);
      setDeleteConfirm(null);
      loadRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete role. Please try again."
      );
    }
  };

  const togglePermission = (permission) => {
    setEditingRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get all permissions as array
  const allPermissions = Object.values(PERMISSIONS);

  // Check if current user can manage target role
  const userCanManageRole = (targetRole) => {
    if (!user || !targetRole) return false;
    return canManageRole(user.role, targetRole.name);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
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
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Role Management
              </h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </div>
          </div>
          <button
            onClick={handleCreateRole}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredRoles.length} of {roles.length} roles
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.map((role) => (
                <tr key={role._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {formatToTitleCase(role.name)}
                          {role.level >= 10 && (
                            <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Level {role.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {formatToTitleCase(permission)}
                        </span>
                      ))}
                      {role.permissions?.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {userCanManageRole(role) ? (
                        <>
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(role)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Cannot manage
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search term"
                  : "Create your first role to get started"}
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && editingRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRole._id ? "Edit Role" : "Create New Role"}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={editingRole.name}
                      onChange={(e) =>
                        setEditingRole((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter role name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hierarchy Level *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="13"
                      value={editingRole.level}
                      onChange={(e) =>
                        setEditingRole((prev) => ({
                          ...prev,
                          level: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editingRole.description}
                    onChange={(e) =>
                      setEditingRole((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe this role's responsibilities"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Permission Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Permissions * ({editingRole.permissions.length} selected)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {allPermissions.map((permission) => {
                      const isSelected =
                        editingRole.permissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center">
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="ml-3 text-sm text-gray-700">
                              {formatToTitleCase(permission)}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Permissions Summary */}
                {editingRole.permissions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Selected Permissions ({editingRole.permissions.length})
                    </h4>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {editingRole.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {formatToTitleCase(permission)}
                          <button
                            onClick={() => togglePermission(permission)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingRole._id ? "Update Role" : "Create Role"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Role
                  </h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "
                    {formatToTitleCase(deleteConfirm.name)}"?
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone and may affect users assigned to
                this role.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRole(deleteConfirm._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
};

export default RoleManagement;