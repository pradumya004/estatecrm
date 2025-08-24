// src/components/admin/DepartmentManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  Users,
  UserPlus,
  Briefcase,
  Tag,
} from "lucide-react";
import { AdminGate } from "../common/PermissionGate";
import { adminAPI } from "../../services/api";
import {
  DEPARTMENTS,
  DESIGNATIONS_BY_DEPARTMENT,
} from "../../utils/rbacConstants";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Failed to load departments:", error);
      alert("Failed to load departments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = () => {
    setEditingDepartment({
      name: "",
      designations: [],
    });
    setShowCreateModal(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment({ ...department });
    setShowCreateModal(true);
  };

  const handleSaveDepartment = async () => {
    try {
      if (!editingDepartment.name.trim()) {
        alert("Department name is required");
        return;
      }

      if (editingDepartment.designations.length === 0) {
        alert("At least one designation is required");
        return;
      }

      const departmentData = {
        name: editingDepartment.name.trim(),
        designations: editingDepartment.designations.filter((d) => d.trim()),
      };

      if (editingDepartment._id) {
        // Update existing department
        await adminAPI.updateDepartment(editingDepartment._id, departmentData);
      } else {
        // Create new department
        await adminAPI.createDepartment(departmentData);
      }

      setShowCreateModal(false);
      setEditingDepartment(null);
      loadDepartments();
    } catch (error) {
      console.error("Failed to save department:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save department. Please try again."
      );
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await adminAPI.deleteDepartment(departmentId);
      setDeleteConfirm(null);
      loadDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      alert(
        error.response?.data?.message ||
          "Failed to delete department. Please try again."
      );
    }
  };

  const addDesignation = () => {
    setEditingDepartment((prev) => ({
      ...prev,
      designations: [...prev.designations, ""],
    }));
  };

  const updateDesignation = (index, value) => {
    setEditingDepartment((prev) => ({
      ...prev,
      designations: prev.designations.map((d, i) => (i === index ? value : d)),
    }));
  };

  const removeDesignation = (index) => {
    setEditingDepartment((prev) => ({
      ...prev,
      designations: prev.designations.filter((_, i) => i !== index),
    }));
  };

  const addPredefinedDesignations = (departmentName) => {
    const predefinedDesignations =
      DESIGNATIONS_BY_DEPARTMENT[departmentName] || [];
    setEditingDepartment((prev) => ({
      ...prev,
      designations: [
        ...new Set([...prev.designations, ...predefinedDesignations]),
      ],
    }));
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.designations?.some((d) =>
        d.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
            <Building2 className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Department Management
              </h1>
              <p className="text-gray-600">
                Manage organizational departments and designations
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateDepartment}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredDepartments.length} of {departments.length} departments
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <div
              key={department._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {department.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditDepartment(department)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(department)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {department.designations?.length || 0} designations
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Designations:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {department.designations
                      ?.slice(0, 4)
                      .map((designation, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {designation}
                        </span>
                      ))}
                    {department.designations?.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{department.designations.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search term"
                : "Create your first department to get started"}
            </p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && editingDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingDepartment._id
                      ? "Edit Department"
                      : "Create New Department"}
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
                {/* Department Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={editingDepartment.name}
                    onChange={(e) =>
                      setEditingDepartment((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter department name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Predefined Departments Helper */}
                {!editingDepartment._id && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Quick Setup
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Select a predefined department to auto-populate
                      designations:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            setEditingDepartment((prev) => ({
                              ...prev,
                              name: dept,
                            }));
                            addPredefinedDesignations(dept);
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Designations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Designations *
                    </label>
                    <button
                      onClick={addDesignation}
                      className="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Designation</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingDepartment.designations.map(
                      (designation, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={designation}
                            onChange={(e) =>
                              updateDesignation(index, e.target.value)
                            }
                            placeholder="Enter designation"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => removeDesignation(index)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {editingDepartment.designations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Tag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No designations added yet</p>
                      <p className="text-sm">
                        Click "Add Designation" to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Designations Preview */}
                {editingDepartment.designations.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Preview (
                      {
                        editingDepartment.designations.filter((d) => d.trim())
                          .length
                      }{" "}
                      designations)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {editingDepartment.designations
                        .filter((d) => d.trim())
                        .map((designation, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {designation}
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
                  onClick={handleSaveDepartment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingDepartment._id
                      ? "Update Department"
                      : "Create Department"}
                  </span>
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
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Department
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the "{deleteConfirm.name}"
                department? This action cannot be undone and may affect agents
                in this department.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDepartment(deleteConfirm._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Department
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
};

export default DepartmentManagement;