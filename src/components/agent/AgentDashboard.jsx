// estatecrm/src/components/agent/AgentDashboard.jsx
// COMPLETE REWRITE: Modern dashboard with real data fetching

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Target,
  DollarSign,
  Phone,
  Calendar,
  Plus,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Crown,
  Shield,
  Calendar as CalendarIcon,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import { useAuth } from "../../hooks/useAuth";
import { agentsAPI, leadsAPI } from "../../services/api";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

import AssignedLeads from "./AssignedLeads";
import AgentProfile from "./AgentProfile";
import AssignedProperties from "./AssignedProperties";
import TeamManagement from "./TeamManagement";
import LeadForm from "../admin/LeadForm";
import PropertyForm from "../admin/PropertyForm";

const DashboardHome = () => {
  const navigate = useNavigate();
  const {
    user,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isManager,
    roleLevel,
    userRole,
  } = useAuth();

  console.log("User:", user);

  // State management
  const [dashboardData, setDashboardData] = useState({
    personalMetrics: {
      totalLeads: 0,
      totalProperties: 0,
      totalDeals: 0,
      totalRevenue: 0,
      conversionRate: 0,
      avgResponseTime: 0,
    },
    scopeMetrics: {
      totalLeads: 0,
      totalProperties: 0,
      totalDeals: 0,
      totalRevenue: 0,
    },
    leadDistribution: {},
    recentLeads: [],
    recentActivities: [],
    performanceHistory: [],
    teamMembers: [],
    upcomingTasks: [],
    notifications: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [quickStats, setQuickStats] = useState({
    todayLeads: 0,
    todayCalls: 0,
    pendingFollowups: 0,
    hotLeads: 0,
  });

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, selectedPeriod, isManager]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    // if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);

      // Parallel API calls for better performance
      const [
        leadsResponse,
        propertiesResponse,
        performanceResponse,
        teamResponse,
      ] = await Promise.allSettled([
        agentsAPI.getAssignedLeads({ limit: 20, includeStats: true }),
        agentsAPI.getAssignedProperties({ limit: 10, includeStats: true }),
        agentsAPI.getAgentPerformance(user.id, {
          period: selectedPeriod,
          includeHistory: true,
        }),
        isManager ? agentsAPI.getTeamHierarchy() : Promise.resolve(null),
      ]);

      console.log("API calls completed");
      console.log("Leads response:", leadsResponse);
      console.log("Properties response:", propertiesResponse);
      console.log("Performance response:", performanceResponse);
      console.log("Team response:", teamResponse);

      // Process leads data
      const leadsData =
        leadsResponse.status === "fulfilled" ? leadsResponse.value.data : {};
      const leads = leadsData.leads || [];
      const leadsSummary = leadsData.summary || {};

      // Process properties data
      const propertiesData =
        propertiesResponse.status === "fulfilled"
          ? propertiesResponse.value.data
          : {};
      const properties = propertiesData.properties || [];
      const propertiesSummary = propertiesData.summary || {};

      // Process performance data
      const performanceData = performanceResponse.value?.data;
      const performance = performanceData.performance || {};
      const personalPerf = performance.personal || {};
      const scopePerf = performance.scope || personalPerf;

      // Process team data
      const teamData = teamResponse.value?.data;
      const team = teamData.team || [];
      const teamMetrics = teamData.metrics || {};

      // Calculate quick stats
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const todayLeads = leads.filter(
        (lead) => new Date(lead.createdAt) >= todayStart
      ).length;

      const pendingFollowups = leads.filter(
        (lead) =>
          lead.nextFollowUpDate &&
          new Date(lead.nextFollowUpDate) <= today &&
          !["book", "drop", "not_interested"].includes(lead.status)
      ).length;

      const hotLeads = leads.filter(
        (lead) => lead.priority === "urgent" || lead.priority === "high"
      ).length;

      // Generate performance chart data
      const chartData = generatePerformanceChart(
        performance.history || [],
        selectedPeriod
      );

      // Recent activities from leads
      const recentActivities = leads.slice(0, 10).map((lead) => ({
        id: lead._id,
        type: "lead",
        title: `${lead.firstName} ${lead.lastName}`,
        action: `Status: ${formatToTitleCase(lead.status)}`,
        timestamp: new Date(
          lead.updatedAt || lead.createdAt
        ).toLocaleDateString(),
        priority: lead.priority,
        status: lead.status,
      }));

      // Update state
      setDashboardData({
        personalMetrics: {
          totalLeads: personalPerf.totalLeadsAssigned || 0,
          totalProperties: properties.length || 0,
          totalDeals: personalPerf.totalDeals || 0,
          totalRevenue: personalPerf.totalDealValue || 0,
          conversionRate: personalPerf.conversionRate || 0,
          avgResponseTime: personalPerf.avgResponseTime || 0,
        },
        scopeMetrics: {
          totalLeads: leadsSummary.total || 0,
          totalProperties: propertiesSummary.total || 0,
          totalDeals: scopePerf.totalDeals || 0,
          totalRevenue: scopePerf.totalDealValue || 0,
        },
        leadDistribution: {
          new: leadsSummary.new || 0,
          callback: leadsSummary.callback || 0,
          schedule_meeting: leadsSummary.schedule_meeting || 0,
          schedule_site_visit: leadsSummary.schedule_site_visit || 0,
          expression_of_interest: leadsSummary.expression_of_interest || 0,
          negotiation: leadsSummary.negotiation || 0,
          book: leadsSummary.book || 0,
          not_interested: leadsSummary.not_interested || 0,
          drop: leadsSummary.drop || 0,
        },
        recentLeads: leads.slice(0, 5),
        recentActivities,
        performanceHistory: chartData,
        teamMembers: team,
        upcomingTasks: generateUpcomingTasks(leads),
        notifications: generateNotifications(leads, pendingFollowups),
      });

      setQuickStats({
        todayLeads,
        todayCalls: Math.floor(todayLeads * 0.6), // Estimated
        pendingFollowups,
        hotLeads,
      });

      setLastUpdated(new Date());

      // Update loading state
      //   setLoading(false);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const generatePerformanceChart = (history, period) => {
    const days = parseInt(period.replace("d", ""));
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = history.find(
        (h) => new Date(h.date).toISOString().split("T")[0] === dateStr
      );

      chartData.push({
        date: date.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
        leads: dayData?.leadsAssigned || 0,
        calls: dayData?.callsMade || 0,
        meetings: dayData?.meetingsScheduled || 0,
        deals: dayData?.dealsCompleted || 0,
      });
    }

    return chartData;
  };

  const generateUpcomingTasks = (leads) => {
    const tasks = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    leads.forEach((lead) => {
      if (lead.nextFollowUpDate) {
        const followUpDate = new Date(lead.nextFollowUpDate);
        if (followUpDate >= today && followUpDate <= tomorrow) {
          tasks.push({
            id: lead._id,
            type: "follow_up",
            title: `Follow up with ${lead.firstName} ${lead.lastName}`,
            time: followUpDate.toLocaleTimeString("default", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            priority: lead.priority || "medium",
            leadId: lead._id,
          });
        }
      }
    });

    return tasks.slice(0, 5);
  };

  const generateNotifications = (leads, pendingCount) => {
    const notifications = [];

    if (pendingCount > 0) {
      notifications.push({
        id: "pending_followups",
        type: "warning",
        message: `You have ${pendingCount} pending follow-ups`,
        action: "View Leads",
        actionUrl: "/agent/leads",
      });
    }

    const newLeadsToday = leads.filter((lead) => {
      const today = new Date();
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === today.toDateString();
    }).length;

    if (newLeadsToday > 0) {
      notifications.push({
        id: "new_leads",
        type: "info",
        message: `${newLeadsToday} new leads assigned today`,
        action: "View Leads",
        actionUrl: "/agent/leads",
      });
    }

    return notifications;
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email?.split("@")[0] || "User";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    const num = Number(value) || 0;
    return `${num.toFixed(1)}%`;
  };

  // Chart colors
  const COLORS = {
    new: "#3b82f6",
    callback: "#f59e0b",
    schedule_meeting: "#10b981",
    schedule_site_visit: "#8b5cf6",
    expression_of_interest: "#06b6d4",
    negotiation: "#f97316",
    book: "#059669",
    not_interested: "#ef4444",
    drop: "#6b7280",
  };

  // Components
  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    onClick,
    loading,
  }) => (
    <div
      className={`bg-white rounded-xl p-6 border hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer hover:border-gray-300" : ""
      } ${loading ? "animate-pulse" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? "---" : value}
          </p>
          {change && (
            <div
              className={`flex items-center mt-1 text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const QuickStatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  );

  const LeadDistributionChart = () => {
    const data = Object.entries(dashboardData.leadDistribution)
      .filter(([key, value]) => value > 0)
      .map(([key, value]) => ({
        name: formatToTitleCase(key.replace("_", " ")),
        value,
        color: COLORS[key] || "#6b7280",
      }));

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No lead data available</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  };

  const PerformanceTrendChart = () => {
    if (!dashboardData.performanceHistory.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No performance data available</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={dashboardData.performanceHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
          <Bar dataKey="calls" fill="#10b981" name="Calls" />
          <Line
            type="monotone"
            dataKey="deals"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Deals"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const RecentActivityItem = ({ activity }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case "lead":
          return <Users className="w-4 h-4 text-blue-600" />;
        case "call":
          return <Phone className="w-4 h-4 text-green-600" />;
        case "meeting":
          return <Calendar className="w-4 h-4 text-purple-600" />;
        default:
          return <Activity className="w-4 h-4 text-gray-600" />;
      }
    };

    const getPriorityColor = () => {
      switch (activity.priority) {
        case "urgent":
          return "border-l-red-500";
        case "high":
          return "border-l-orange-500";
        case "medium":
          return "border-l-blue-500";
        default:
          return "border-l-gray-300";
      }
    };

    return (
      <div
        className={`flex items-center space-x-3 p-3 border-l-4 ${getPriorityColor()} bg-gray-50 rounded-r-lg`}
      >
        {getActivityIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <p className="text-xs text-gray-500">{activity.action}</p>
        </div>
        <span className="text-xs text-gray-400">{activity.timestamp}</span>
      </div>
    );
  };

  //   if (loading) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
  //           <p className="mt-4 text-lg text-gray-600">
  //             Loading your dashboard...
  //           </p>
  //         </div>
  //       </div>
  //     );
  //   }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {getUserDisplayName()}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-gray-600">
                  {formatToTitleCase(userRole)}
                </span>
                {isManager && <Crown className="w-4 h-4 text-yellow-500" />}
                {isAdmin && <Shield className="w-4 h-4 text-red-500" />}
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Level {roleLevel}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {roleLevel >= 8
                    ? "Regional"
                    : roleLevel >= 6
                    ? "Branch"
                    : roleLevel >= 4
                    ? "Team"
                    : "Individual"}{" "}
                  Scope
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-xs text-gray-400">
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {dashboardData.notifications.length > 0 && (
          <div className="mb-8 space-y-2">
            {dashboardData.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.type === "warning"
                    ? "bg-yellow-50 border-yellow-400"
                    : notification.type === "info"
                    ? "bg-blue-50 border-blue-400"
                    : "bg-green-50 border-green-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  {notification.action && (
                    <button
                      onClick={() => navigate(notification.actionUrl)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {notification.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <QuickStatCard
            title="Today's Leads"
            value={quickStats.todayLeads}
            icon={Target}
            color="text-blue-600"
          />
          <QuickStatCard
            title="Calls Made"
            value={quickStats.todayCalls}
            icon={Phone}
            color="text-green-600"
          />
          <QuickStatCard
            title="Pending Follow-ups"
            value={quickStats.pendingFollowups}
            icon={Clock}
            color="text-orange-600"
          />
          <QuickStatCard
            title="Hot Leads"
            value={quickStats.hotLeads}
            icon={Zap}
            color="text-red-600"
          />
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={isManager ? "Scope Leads" : "My Leads"}
            value={dashboardData.scopeMetrics.totalLeads}
            icon={Users}
            color="text-blue-600"
            onClick={() => navigate("/agent/leads")}
            loading={loading}
          />
          <MetricCard
            title="Properties"
            value={dashboardData.personalMetrics.totalProperties}
            icon={Building}
            color="text-green-600"
            onClick={() => navigate("/agent/properties")}
            loading={loading}
          />
          <MetricCard
            title="Deals Closed"
            value={dashboardData.personalMetrics.totalDeals}
            icon={Target}
            color="text-purple-600"
            loading={loading}
          />
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(dashboardData.scopeMetrics.totalRevenue)}
            icon={DollarSign}
            color="text-emerald-600"
            loading={loading}
          />
        </div>

        {/* Personal Performance for Managers */}
        {isManager && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Your Personal Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {dashboardData.personalMetrics.totalLeads}
                </div>
                <div className="text-sm text-blue-600">My Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {dashboardData.personalMetrics.totalDeals}
                </div>
                <div className="text-sm text-blue-600">My Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {formatCurrency(dashboardData.personalMetrics.totalRevenue)}
                </div>
                <div className="text-sm text-blue-600">My Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {formatPercentage(
                    dashboardData.personalMetrics.conversionRate
                  )}
                </div>
                <div className="text-sm text-blue-600">My Conversion</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trends */}
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Trends
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <PerformanceTrendChart />
          </div>

          {/* Lead Distribution */}
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Lead Distribution
              </h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <LeadDistributionChart />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <button
                onClick={() => navigate("/agent/leads")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                dashboardData.recentActivities
                  .slice(0, 6)
                  .map((activity, index) => (
                    <RecentActivityItem key={index} activity={activity} />
                  ))
              )}
            </div>
          </div>

          {/* Quick Actions & Tasks */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {hasPermission(PERMISSIONS.CREATE_LEADS) && (
                  <button
                    onClick={() => navigate("/agent/leads/new")}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Lead
                  </button>
                )}

                <button
                  onClick={() => navigate("/agent/leads")}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Leads
                </button>

                <button
                  onClick={() => navigate("/agent/properties")}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Building className="w-4 h-4 mr-2" />
                  View Properties
                </button>

                {hasPermission(PERMISSIONS.VIEW_TEAM_HIERARCHY) && (
                  <button
                    onClick={() => navigate("/agent/team")}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team Management
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Tasks
              </h3>
              <div className="space-y-3">
                {dashboardData.upcomingTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">All caught up!</p>
                  </div>
                ) : (
                  dashboardData.upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">{task.time}</p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === "urgent"
                            ? "bg-red-500"
                            : task.priority === "high"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentDashboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="profile" element={<AgentProfile />} />
        <Route path="leads" element={<AssignedLeads />} />
        <Route path="leads/new" element={<LeadForm />} />
        <Route path="properties" element={<AssignedProperties />} />
        <Route path="properties/new" element={<PropertyForm />} />
        <Route path="team" element={<TeamManagement />} />
      </Routes>
    </div>
  );
};

export default AgentDashboard;
