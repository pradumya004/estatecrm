// estatecrm/src/components/admin/AgentsList.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Users,
  Building,
  MapPin,
} from "lucide-react";
import { useAgentsList } from "../../hooks/useAgent.js";
import { useAuth } from "../../hooks/useAuth.js";
import agentService from "../../services/agent.service.js";
import { adminAPI } from "../../services/api.js";
import { formatToTitleCase } from "../../utils/formatters.js";

const AgentsList = () => {
  // --- HOOKS ---
  // Custom hook for authentication and RBAC permissions
  const { user, rbac } = useAuth();

  // Custom hook for managing agent data, including state, fetching, and filters
  const {
    agents,
    pagination,
    loading,
    error,
    fetchAgents,
    filters, // The filters state object from the hook
    updateFilters,
    updatePagination,
  } = useAgentsList(user);

  console.log("Agents List:", agents);
  console.log("Filters:", filters);

  // --- LOCAL COMPONENT STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [selectedAgents, setSelectedAgents] = useState([]);

  // State to hold dynamic data fetched from the backend for UI elements like filters
  const [allRoles, setAllRoles] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  // --- DATA FETCHING ---

  // Effect to fetch dynamic data for UI (roles, departments) on component mount
  useEffect(() => {
    const fetchUiData = async () => {
      try {
        // Fetch roles and departments in parallel for efficiency
        const [rolesResponse, deptsResponse] = await Promise.all([
          adminAPI.getAllRoles(),
          adminAPI.getAllDepartments(),
        ]);
        setAllRoles(rolesResponse.data.roles || []);
        setAllDepartments(deptsResponse.data.departments || []);
      } catch (err) {
        console.error("Failed to fetch UI data (roles/departments):", err);
      }
    };
    fetchUiData();
  }, []);

  // Effect to fetch the list of agents whenever filters, sorting, or pagination change
  useEffect(() => {
    const params = {
      search: searchQuery,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction,
    };
    fetchAgents(params);
  }, [fetchAgents, pagination.page, pagination.limit, sortConfig, searchQuery]);

  // --- MEMOIZED VALUES ---

  // Create efficient lookup maps from fetched roles data to avoid re-computation on every render
  const { roleColorMap, roleLabelMap } = useMemo(() => {
    const colorMap = {};
    const labelMap = {};
    if (Array.isArray(allRoles)) {
      allRoles.forEach((role) => {
        colorMap[role.name] = role.uiColor || "bg-gray-100 text-gray-800";
        labelMap[role.name] = role.label || formatToTitleCase(role.name);
      });
    }
    return { roleColorMap: colorMap, roleLabelMap: labelMap };
  }, [allRoles]);

  // --- CONSTANTS ---

  // Static map for status colors, as statuses are typically fixed
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
  };

  // --- EVENT HANDLERS ---

  const handleFilterChange = (key, value) => {
    updatePagination({ ...pagination, page: 1 }); // Reset to first page on filter change
    updateFilters({ [key]: value });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectAgent = (agentId) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === agents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(agents.map((agent) => agent._id));
    }
  };

  const handleDelete = async (agentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      try {
        await agentService.deleteAgent(agentId);
        fetchAgents(); // Refetch agents to update the list
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert(error.message || "Failed to delete agent");
      }
    }
  };

  // --- RENDER SUB-COMPONENTS ---
  // Moved here to ensure all hooks are initialized before these components are defined.

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortConfig.key === sortKey &&
          (sortConfig.direction === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          ))}
      </div>
    </th>
  );

  const AgentRow = ({ agent }) => (
    <tr
      key={agent._id}
      className={`hover:bg-gray-50 ${
        selectedAgents.includes(agent._id) ? "bg-blue-50" : ""
      }`}
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedAgents.includes(agent._id)}
          onChange={() => handleSelectAgent(agent._id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {agent.profileImage?.url ? (
            <img
              src={agent.profileImage.url}
              alt={`${agent.firstName}`}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
              {agent.firstName?.[0]}
              {agent.lastName?.[0]}
            </div>
          )}
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {agent.firstName} {agent.lastName}
            </div>
            <div className="text-sm text-gray-500">{agent.employeeId}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{agent.email}</div>
        <div className="text-sm text-gray-500">{agent.phone}</div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            roleColorMap[agent.role?.name]
          }`}
        >
          {roleLabelMap[agent.role?.name]}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {agent.department?.name}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {agent.designation}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            statusColors[agent.status]
          }`}
        >
          {formatToTitleCase(agent.status)}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        {agent.branch || "-"}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {agent.canEdit && (
            <Link
              to={`/admin/agents/${agent._id}/edit`}
              className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Link>
          )}
          {agent.canDelete && (
            <button
              onClick={() => handleDelete(agent._id)}
              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  // --- MAIN RENDER ---

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">
            Manage your organization's agents and hierarchy
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchAgents()}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          {rbac.canCreateAgents && (
            <Link
              to="/admin/agents/new"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border flex items-center">
          <Users className="w-8 h-8 text-blue-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Total Agents</p>
            <p className="text-2xl font-semibold text-gray-900">
              {pagination.total}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border flex items-center">
          <Building className="w-8 h-8 text-green-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-900">
              {allDepartments.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border flex items-center">
          <MapPin className="w-8 h-8 text-orange-600 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Branches</p>
            <p className="text-2xl font-semibold text-gray-900">
              {new Set(agents.map((a) => a.branch).filter(Boolean)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search agents by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Roles</option>
            {allRoles.map((role) => (
              <option key={role._id} value={role.name}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Departments</option>
            {allDepartments.map((dept) => (
              <option key={dept._id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      agents.length > 0 &&
                      selectedAgents.length === agents.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                </th>
                <SortableHeader label="Agent" sortKey="firstName" />
                <SortableHeader label="Contact" sortKey="email" />
                <SortableHeader label="Role" sortKey="role" />
                <SortableHeader label="Department" sortKey="department" />
                <SortableHeader label="Designation" sortKey="designation" />
                <SortableHeader label="Status" sortKey="status" />
                <SortableHeader label="Branch" sortKey="branch" />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin inline-block mr-2" />
                    Loading agents...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No agents found for the selected filters.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <AgentRow key={agent._id} agent={agent} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-white px-4 py-3 border rounded-lg flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Page <strong>{pagination.page}</strong> of{" "}
          <strong>{pagination.totalPages}</strong> ({pagination.total} total
          results)
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              updatePagination({ page: Math.max(1, pagination.page - 1) })
            }
            disabled={pagination.page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              updatePagination({
                page: Math.min(pagination.totalPages, pagination.page + 1),
              })
            }
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentsList;
