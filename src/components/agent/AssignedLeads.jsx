// estatecrm/src/components/agent/AssignedLeads.jsx
// SIMPLIFIED: Direct database permission checking

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Save,
  X,
  Target,
  RefreshCw,
  Users,
  Star,
  Calendar,
  Shield,
  Building,
  Plus,
  Upload,
  Download,
  UserPlus,
  TrendingUp,
  BarChart3,
  User,
  Globe,
  Map,
  Zap,
} from "lucide-react";
import { agentsAPI, leadsAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/rbacConstants";
import {
  LEAD_STATUS_OPTIONS,
  getStatusColor,
  getStatusLabel,
  getSubStatusOptions,
  formatBudgetRange,
  getPriorityColor,
  PRIORITY_OPTIONS,
} from "../constants/leadStatusConstants";
import { formatToTitleCase } from "../../utils/formatters";
import PermissionGate, { FeatureGate } from "../common/PermissionGate";

const AssignedLeads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Direct permission checks from database
  const userPermissions = user?.permissions || [];
  const canUpdateStatus = userPermissions.includes(
    PERMISSIONS.UPDATE_LEAD_STATUS
  );
  const canCreateLeads = userPermissions.includes(PERMISSIONS.CREATE_LEADS);
  const canEditLeads = userPermissions.includes(PERMISSIONS.EDIT_LEADS);
  const canViewTeamLeads = userPermissions.includes(
    PERMISSIONS.VIEW_TEAM_LEADS
  );
  const canViewBranchData = userPermissions.includes(
    PERMISSIONS.VIEW_BRANCH_AGENTS
  );
  const canBulkOperations = userPermissions.includes(
    PERMISSIONS.BULK_OPERATIONS
  );
  const canImportData = userPermissions.includes(
    PERMISSIONS.IMPORT_EXPORT_DATA
  );
  const canViewAnalytics = userPermissions.some((p) =>
    [
      PERMISSIONS.VIEW_BRANCH_ANALYTICS,
      PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    ].includes(p)
  );

  // State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeScope, setActiveScope] = useState("own");
  const [availableScopes, setAvailableScopes] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [expandedLead, setExpandedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

  const [leadStats, setLeadStats] = useState({});
  const [teamStats, setTeamStats] = useState(null);

  const [statusFormData, setStatusFormData] = useState({
    status: "",
    subStatus: "",
    notes: "",
    scheduleDate: "",
  });

  // Fetch leads with scope
  const fetchAssignedLeads = useCallback(
    async (scope = activeScope) => {
      try {
        setLoading(true);
        const params = {
          scope,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          priority: selectedPriority !== "all" ? selectedPriority : undefined,
          limit: 50,
        };

        const response = await agentsAPI.getAssignedLeads(params);

        setLeads(response.data.leads || []);
        setLeadStats(response.data.summary || {});
        setTeamStats(response.data.teamSummary || null);
        setAvailableScopes(response.data.availableScopes || []);
      } catch (error) {
        console.error("Error fetching assigned leads:", error);
      } finally {
        setLoading(false);
      }
    },
    [activeScope, selectedStatus, selectedPriority]
  );

  useEffect(() => {
    fetchAssignedLeads();
  }, [fetchAssignedLeads]);

  // Handle scope change
  const handleScopeChange = (newScope) => {
    setActiveScope(newScope);
    setExpandedLead(null);
    setEditingLead(null);
    fetchAssignedLeads(newScope);
  };

  // Client-side filtering and sorting
  const getFilteredAndSortedLeads = () => {
    let filtered = [...leads];

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          (lead.fullName || `${lead.firstName} ${lead.lastName}`)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === "createdAt" || sortBy === "lastContactDate") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  };

  const filteredLeads = getFilteredAndSortedLeads();

  // Status update handlers
  const startEditingLead = (lead) => {
    if (!canUpdateStatus) return;
    setEditingLead(lead._id);
    setStatusFormData({
      status: lead.status,
      subStatus: lead.subStatus || "",
      notes: "",
      scheduleDate: lead.scheduleDate
        ? new Date(lead.scheduleDate).toISOString().slice(0, 16)
        : "",
    });
  };

  const handleStatusUpdate = async (leadId) => {
    if (!canUpdateStatus) return;
    setUpdating(true);
    try {
      await leadsAPI.updateLeadStatus(
        leadId,
        statusFormData.status,
        statusFormData.subStatus,
        statusFormData.notes ||
          `Status updated to ${getStatusLabel(statusFormData.status)}.`
      );
      setEditingLead(null);
      await fetchAssignedLeads();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Get scope icon
  const getScopeIcon = (scope) => {
    const icons = {
      own: User,
      team: Users,
      branch: Building,
      region: Map,
      all: Globe,
    };
    return icons[scope] || User;
  };

  // UI Components
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  const ScopeTab = ({ scope, isActive, onClick }) => {
    const IconComponent = getScopeIcon(scope.key);
    return (
      <button
        onClick={() => onClick(scope.key)}
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        <IconComponent className="w-4 h-4 mr-2" />
        {scope.label}
      </button>
    );
  };

  const LeadCard = ({ lead }) => {
    const isExpanded = expandedLead === lead._id;
    const isEditing = editingLead === lead._id;
    const displayName = lead.fullName || `${lead.firstName} ${lead.lastName}`;

    return (
      <div className="bg-white rounded-lg border hover:shadow-lg transition-all duration-300">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {displayName}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {getStatusLabel(lead.status)}
                </span>
                {lead.priority && (
                  <span
                    className={`text-xs font-medium ${getPriorityColor(
                      lead.priority
                    )}`}
                  >
                    {formatToTitleCase(lead.priority)} Priority
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {activeScope !== "own" && lead.assignedAgent && (
                <div className="text-xs text-gray-500 text-right">
                  <p>Assigned to:</p>
                  <p className="font-medium">
                    {lead.assignedAgent.firstName} {lead.assignedAgent.lastName}
                  </p>
                </div>
              )}
              <button
                onClick={() => setExpandedLead(isExpanded ? null : lead._id)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.requirements?.budget && (
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>{formatBudgetRange(lead.requirements.budget)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/agent/leads/${lead._id}`)}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              {canUpdateStatus && (
                <button
                  onClick={() => startEditingLead(lead)}
                  className="flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Update Status
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700 mb-2">Requirements</p>
                  <p>
                    <span className="text-gray-500">Type:</span>{" "}
                    {formatToTitleCase(
                      lead.requirements?.propertyType || "Not specified"
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Purpose:</span>{" "}
                    {formatToTitleCase(
                      lead.requirements?.purpose || "Not specified"
                    )}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Timeline</p>
                  <p>
                    <span className="text-gray-500">Created:</span>{" "}
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                  {lead.scheduleDate && (
                    <p>
                      <span className="text-gray-500">Scheduled:</span>{" "}
                      {new Date(lead.scheduleDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update Form */}
              {isEditing && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Lead Status
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFormData.status}
                        onChange={(e) =>
                          setStatusFormData((prev) => ({
                            ...prev,
                            status: e.target.value,
                            subStatus: "",
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Status</option>
                        {LEAD_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {statusFormData.status &&
                      getSubStatusOptions(statusFormData.status).length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sub Status
                          </label>
                          <select
                            value={statusFormData.subStatus}
                            onChange={(e) =>
                              setStatusFormData((prev) => ({
                                ...prev,
                                subStatus: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Sub Status</option>
                            {getSubStatusOptions(statusFormData.status).map(
                              (option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={statusFormData.notes}
                      onChange={(e) =>
                        setStatusFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Add notes about this status update..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleStatusUpdate(lead._id)}
                      disabled={!statusFormData.status || updating}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updating ? "Updating..." : "Update Status"}
                    </button>
                    <button
                      onClick={() => setEditingLead(null)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lead Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>
              {user?.roleLabel || formatToTitleCase(user?.role || "")}
            </span>
            <span className="text-blue-600 ml-2">
              • {filteredLeads.length} leads in view
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canCreateLeads && (
            <button
              onClick={() => navigate("/agent/leads/new")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Lead
            </button>
          )}

          {canImportData && (
            <button
              onClick={() => navigate("/agent/import")}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
          )}

          <button
            onClick={() => fetchAssignedLeads()}
            disabled={loading || updating}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                loading || updating ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Scope Tabs - Show if user has multiple scopes available */}
      {availableScopes.length > 1 && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Data Scope</h3>
          <div className="flex flex-wrap gap-2">
            {availableScopes.map((scope) => (
              <ScopeTab
                key={scope.key}
                scope={scope}
                isActive={activeScope === scope.key}
                onClick={handleScopeChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Leads"
          value={leadStats.total || 0}
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="New"
          value={leadStats.new || 0}
          icon={Star}
          color="bg-green-500"
        />
        <StatCard
          title="Callbacks"
          value={leadStats.callback || 0}
          icon={Phone}
          color="bg-yellow-500"
        />
        <StatCard
          title="Meetings"
          value={leadStats.schedule_meeting || 0}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Site Visits"
          value={leadStats.schedule_site_visit || 0}
          icon={MapPin}
          color="bg-indigo-500"
        />
        <StatCard
          title="This Week"
          value={leadStats.thisWeek || 0}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
      </div>

      {/* Team Stats - Only for managers with team data */}
      {teamStats && canViewTeamLeads && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Team Performance Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-600">
                {teamStats.total || 0}
              </p>
              <p className="text-xs text-gray-600">Team Leads</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">
                {teamStats.new || 0}
              </p>
              <p className="text-xs text-gray-600">New</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-600">
                {teamStats.teamMembers || 0}
              </p>
              <p className="text-xs text-gray-600">Team Members</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-600">
                {teamStats.book || 0}
              </p>
              <p className="text-xs text-gray-600">Bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Leads Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ||
            selectedStatus !== "all" ||
            selectedPriority !== "all"
              ? "Try adjusting your filters or search terms."
              : "No leads available in this scope."}
          </p>
          {canCreateLeads && activeScope === "own" && (
            <button
              onClick={() => navigate("/agent/leads/create")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Lead
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
        </div>
      )}

      {/* Bulk Operations - Only if user has permission */}
      {canBulkOperations && filteredLeads.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Bulk Operations
          </h3>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <UserPlus className="w-4 h-4 mr-2" />
              Bulk Assign
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Target className="w-4 h-4 mr-2" />
              Bulk Status Update
            </button>
            {userPermissions.includes(PERMISSIONS.DELETE_LEADS) && (
              <button className="flex items-center px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Bulk Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analytics - Only if user has permission */}
      {canViewAnalytics && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Quick Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {(
                  ((leadStats.book || 0) / (leadStats.total || 1)) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-gray-600">Conversion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {(leadStats.expression_of_interest || 0) +
                  (leadStats.negotiation || 0)}
              </p>
              <p className="text-xs text-gray-600">In Pipeline</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">
                {(leadStats.callback || 0) + (leadStats.schedule_meeting || 0)}
              </p>
              <p className="text-xs text-gray-600">Follow-ups Needed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">
                {(leadStats.not_interested || 0) + (leadStats.drop || 0)}
              </p>
              <p className="text-xs text-gray-600">Closed/Lost</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedLeads;
