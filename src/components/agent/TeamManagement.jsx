// estatecrm/src/components/agent/TeamManagement.jsx
// UPDATED: Uses real user data, permissions, and follows hierarchy

import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Target,
  DollarSign,
  Phone,
  Mail,
  Eye,
  UserPlus,
  Award,
  Activity,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  MapPin,
  Building,
  Shield,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Download,
  Upload,
  Settings,
  Crown,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  UserX,
  UserCheck,
} from "lucide-react";
import { agentsAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const TeamManagement = () => {
  const {
    user,
    hasPermission,
    hasAnyPermission,
    isManager,
    roleLevel,
    userRole,
  } = useAuth();

  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalLeads: 0,
    totalRevenue: 0,
    avgConversion: 0,
    newThisMonth: 0,
    topPerformers: [],
    departmentBreakdown: {},
  });

  const [selectedMember, setSelectedMember] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [bulkActions, setBulkActions] = useState([]);

  // Check user permissions
  const canViewTeam = hasPermission(PERMISSIONS.VIEW_TEAM_HIERARCHY);
  const canManageTeam = hasPermission(PERMISSIONS.MANAGE_TEAM_MEMBERS);
  const canCreateAgents = hasPermission(PERMISSIONS.CREATE_AGENTS);
  const canEditAgents = hasPermission(PERMISSIONS.EDIT_TEAM_AGENTS);
  const canDeleteAgents = hasPermission(PERMISSIONS.DELETE_AGENTS);
  const canViewPerformance = hasPermission(PERMISSIONS.VIEW_TEAM_PERFORMANCE);
  const canBulkOperations = hasPermission(PERMISSIONS.BULK_OPERATIONS);

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
  };

  const departmentColors = {
    Sales: "bg-blue-100 text-blue-800",
    Operations: "bg-purple-100 text-purple-800",
    Marketing: "bg-pink-100 text-pink-800",
    "Customer Service": "bg-green-100 text-green-800",
    "Business Development": "bg-orange-100 text-orange-800",
    "Strategic Alliances": "bg-indigo-100 text-indigo-800",
    IT: "bg-gray-100 text-gray-800",
    HR: "bg-yellow-100 text-yellow-800",
    Finance: "bg-emerald-100 text-emerald-800",
  };

  useEffect(() => {
    if (canViewTeam) {
      fetchTeamData();
    }
  }, [canViewTeam]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getAgents({
        limit: 100,
        includeTeamData: true,
        includePerformance: canViewPerformance,
      });

      const team = response.data.agents || [];
      setTeamMembers(team);

      // Calculate team stats
      const stats = calculateTeamStats(team);
      setTeamStats(stats);
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = (team) => {
    const stats = team.reduce(
      (acc, member) => {
        acc.totalMembers++;
        if (member.status === "active") acc.activeMembers++;
        acc.totalLeads += member.performance?.totalLeads || 0;
        acc.totalRevenue += member.performance?.totalDealValue || 0;
        acc.avgConversion +=
          parseFloat(member.performance?.conversionRate) || 0;

        // Department breakdown
        const dept = member.department?.name || member.department || "Unknown";
        acc.departmentBreakdown[dept] =
          (acc.departmentBreakdown[dept] || 0) + 1;

        // New members this month
        const joinDate = new Date(member.joiningDate || member.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (joinDate > monthAgo) acc.newThisMonth++;

        return acc;
      },
      {
        totalMembers: 0,
        activeMembers: 0,
        totalLeads: 0,
        totalRevenue: 0,
        avgConversion: 0,
        newThisMonth: 0,
        departmentBreakdown: {},
      }
    );

    stats.avgConversion =
      stats.totalMembers > 0 ? stats.avgConversion / stats.totalMembers : 0;

    // Get top performers
    stats.topPerformers = team
      .sort(
        (a, b) =>
          (b.performance?.totalDealValue || 0) -
          (a.performance?.totalDealValue || 0)
      )
      .slice(0, 5);

    return stats;
  };

  const getFilteredTeamMembers = () => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        !searchQuery ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        selectedDepartment === "all" ||
        member.department?.name === selectedDepartment ||
        member.department === selectedDepartment;
      const matchesRole =
        selectedRole === "all" ||
        member.role?.name === selectedRole ||
        member.role === selectedRole;
      const matchesStatus =
        selectedStatus === "all" || member.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  };

  const handleCreateAgent = () => {
    if (!canCreateAgents) {
      alert("You do not have permission to create agents");
      return;
    }
    setShowCreateForm(true);
  };

  const handleEditAgent = (agent) => {
    if (!canEditAgents) {
      alert("You do not have permission to edit agents");
      return;
    }
    setSelectedMember(agent);
    setShowEditForm(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (!canDeleteAgents) {
      alert("You do not have permission to delete agents");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this agent? This action cannot be undone."
      )
    ) {
      try {
        await agentsAPI.deleteAgent(agentId);
        fetchTeamData();
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert("Failed to delete agent");
      }
    }
  };

  const handleStatusChange = async (agentId, newStatus) => {
    if (!canEditAgents) {
      alert("You do not have permission to change agent status");
      return;
    }

    try {
      await agentsAPI.updateAgent(agentId, { status: newStatus });
      fetchTeamData();
    } catch (error) {
      console.error("Error updating agent status:", error);
      alert("Failed to update agent status");
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    trend,
    suffix = "",
    onClick = null,
  }) => (
    <div
      className={`bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            {suffix}
          </p>
          {change && (
            <p
              className={`text-sm mt-1 flex items-center ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {change}% this month
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const AgentCard = ({ member }) => {
    const canEdit = canEditAgents;
    const canDelete = canDeleteAgents && member._id !== user?.id;
    const canViewDetails = canViewPerformance || member._id === user?.id;

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {member.profileImage?.url ? (
                <img
                  src={member.profileImage.url}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </div>
              )}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.status === "active"
                    ? "bg-green-500"
                    : member.status === "inactive"
                    ? "bg-gray-500"
                    : "bg-red-500"
                }`}
              ></div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {member.firstName} {member.lastName}
                {roleLevel >= 4 && (
                  <Crown className="w-4 h-4 inline ml-2 text-yellow-500" />
                )}
              </h3>
              <p className="text-sm text-gray-600">
                {formatToTitleCase(member.role?.name || member.role)}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                    statusColors[member.status]
                  }`}
                >
                  {formatToTitleCase(member.status)}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                    departmentColors[
                      member.department?.name || member.department
                    ] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.department?.name || member.department}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {canViewDetails && (
              <button
                onClick={() => setSelectedMember(member)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            {canEdit && (
              <button
                onClick={() => handleEditAgent(member)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit Agent"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDeleteAgent(member._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Agent"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {!canEdit && !canViewDetails && (
              <div className="p-2 text-gray-400" title="No Permission">
                <Lock className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Employee Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Employee ID:</span>
            <span className="font-medium">{member.employeeId || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Joined:</span>
            <span className="font-medium">
              {member.joiningDate
                ? new Date(member.joiningDate).toLocaleDateString()
                : member.createdAt
                ? new Date(member.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Branch:</span>
            <span className="font-medium">
              {member.branch || "Not Assigned"}
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        {canViewPerformance && member.performance && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Performance
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {member.performance?.totalLeads || 0}
                </div>
                <div className="text-xs text-gray-600">Leads</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {member.performance?.totalDeals || 0}
                </div>
                <div className="text-xs text-gray-600">Deals</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {member.performance?.conversionRate || 0}%
                </div>
                <div className="text-xs text-gray-600">Conversion</div>
              </div>
            </div>

            <div className="mt-3 p-2 bg-white rounded border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Revenue</span>
                <span className="text-sm font-bold text-green-600">
                  ₹
                  {((member.performance?.totalDealValue || 0) / 100000).toFixed(
                    1
                  )}
                  L
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <a
              href={`tel:${member.phone}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${member.email}`}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {canEditAgents && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  handleStatusChange(
                    member._id,
                    member.status === "active" ? "inactive" : "active"
                  )
                }
                className={`p-2 rounded-lg transition-colors ${
                  member.status === "active"
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={member.status === "active" ? "Deactivate" : "Activate"}
              >
                {member.status === "active" ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Bulk Selection */}
        {canBulkOperations && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bulkActions.includes(member._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setBulkActions([...bulkActions, member._id]);
                  } else {
                    setBulkActions(
                      bulkActions.filter((id) => id !== member._id)
                    );
                  }
                }}
                className="mr-2"
              />
              <span className="text-xs text-gray-600">
                Select for bulk actions
              </span>
            </label>
          </div>
        )}
      </div>
    );
  };

  const TopPerformerCard = ({ member, rank }) => (
    <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            rank === 1
              ? "bg-yellow-100 text-yellow-800"
              : rank === 2
              ? "bg-gray-100 text-gray-800"
              : rank === 3
              ? "bg-orange-100 text-orange-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {rank}
        </div>

        <div className="flex items-center space-x-3 flex-1">
          {member.profileImage?.url ? (
            <img
              src={member.profileImage.url}
              alt={member.firstName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
              {member.firstName?.[0]}
              {member.lastName?.[0]}
            </div>
          )}

          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-xs text-gray-600">
              {formatToTitleCase(member.role?.name || member.role)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-green-600 text-sm">
            ₹{((member.performance?.totalDealValue || 0) / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-gray-600">
            {member.performance?.totalDeals || 0} deals •{" "}
            {member.performance?.conversionRate || 0}%
          </p>
        </div>

        <div className="text-xl">
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏆"}
        </div>
      </div>
    </div>
  );

  // Permission check for accessing team management
  if (!canViewTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access team management.
          </p>
          <p className="text-sm text-gray-500">
            Required: {PERMISSIONS.VIEW_TEAM_HIERARCHY} permission (Team Leader
            or higher)
          </p>
        </div>
      </div>
    );
  }

  const filteredMembers = getFilteredTeamMembers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your team's performance and structure
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Role: {formatToTitleCase(userRole)}</span>
            <span>•</span>
            <span>Level: {roleLevel}</span>
            <span>•</span>
            <span>
              Scope:{" "}
              {roleLevel >= 8
                ? "Regional"
                : roleLevel >= 6
                ? "Branch"
                : roleLevel >= 4
                ? "Team"
                : "Individual"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canCreateAgents && (
            <button
              onClick={handleCreateAgent}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          )}

          {canBulkOperations && (
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </button>
          )}

          <button
            onClick={fetchTeamData}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Your Team Management Permissions
            </h3>
            <div className="text-xs text-blue-700 mt-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <span className="flex items-center">
                {canViewTeam ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                )}
                View Team
              </span>
              <span className="flex items-center">
                {canCreateAgents ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                )}
                Create Agents
              </span>
              <span className="flex items-center">
                {canEditAgents ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                )}
                Edit Agents
              </span>
              <span className="flex items-center">
                {canViewPerformance ? (
                  <CheckCircle className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                )}
                View Performance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={teamStats.totalMembers}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Members"
          value={teamStats.activeMembers}
          icon={Shield}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={8}
          trend="up"
        />
        <StatCard
          title="Total Leads"
          value={teamStats.totalLeads}
          icon={Target}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={15}
          trend="up"
        />
        <StatCard
          title="Team Revenue"
          value={Math.round(teamStats.totalRevenue / 10000000)}
          icon={DollarSign}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
          suffix="Cr"
          change={22}
          trend="up"
        />
      </div>

      {/* Department Breakdown */}
      {Object.keys(teamStats.departmentBreakdown).length > 0 && (
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Department Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(teamStats.departmentBreakdown).map(
              ([dept, count]) => (
                <div key={dept} className="text-center">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      departmentColors[dept] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {dept}
                  </div>
                  <div className="text-xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600">members</div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {canViewPerformance && teamStats.topPerformers.length > 0 && (
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performers This Month
            </h3>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="space-y-4">
            {teamStats.topPerformers.map((member, index) => (
              <TopPerformerCard
                key={member._id}
                member={member}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {Object.keys(departmentColors).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              {viewMode === "grid" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Display */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Team Members ({filteredMembers.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team data...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 mb-6">
              {teamMembers.length === 0
                ? "No team members in your scope"
                : "Try adjusting your search or filter criteria"}
            </p>
            {canCreateAgents && teamMembers.length === 0 && (
              <button onClick={handleCreateAgent} className="btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Team Member
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredMembers.map((member) => (
              <AgentCard key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>

      {/* Team Performance Analytics */}
      {canViewPerformance && teamStats.totalMembers > 0 && (
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Team Performance Analytics
            </h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {teamStats.avgConversion.toFixed(1)}%
                </div>
                <p className="text-gray-600 text-sm">Avg Conversion Rate</p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(teamStats.avgConversion, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(
                    (teamStats.activeMembers / teamStats.totalMembers) *
                    100
                  ).toFixed(0)}
                  %
                </div>
                <p className="text-gray-600 text-sm">Active Members</p>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (teamStats.activeMembers / teamStats.totalMembers) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {teamStats.newThisMonth}
                </div>
                <p className="text-gray-600 text-sm">New This Month</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  Recent Hires
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {teamStats.totalMembers > 0
                    ? (teamStats.totalLeads / teamStats.totalMembers).toFixed(0)
                    : 0}
                </div>
                <p className="text-gray-600 text-sm">Avg Leads per Agent</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                  Workload Distribution
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;