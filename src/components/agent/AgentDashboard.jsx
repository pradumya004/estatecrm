// estatecrm/src/components/agent/AgentDashboard.jsx

// Professional Analytics Dashboard - Real Backend Data Integration
// CRITICAL: Complete backend synchronization with advanced analytics and professional UI

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Building,
  Target,
  DollarSign,
  Phone,
  Calendar,
  FileText,
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw,
  BarChart,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
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
} from "recharts";

// Existing Components
import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import AssignedLeads from "./AssignedLeads";
import AssignedProperties from "./AssignedProperties";
import AgentProfile from "./AgentProfile";
import TeamManagement from "./TeamManagement";

// RBAC Components
import { useAuth } from "../../hooks/useAuth.js";
import PermissionGate from "../common/PermissionGate.jsx";
import { PERMISSIONS } from "../../utils/rbacConstants.js";
import { User, Briefcase, Star } from "lucide-react";

// Services
import agentService from "../../services/agent.service.js";

// =============================================================================
// PROFESSIONAL DASHBOARD ANALYTICS COMPONENTS
// =============================================================================

const PersonalMetric = ({
  title,
  value,
  icon: Icon,
  color = "text-gray-700",
}) => (
  <div className="flex flex-col items-center justify-center text-center p-4">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <p className="text-xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
);

/**
 * Professional Metric Card with Trend Analysis
 */
const MetricCard = ({
  title,
  value,
  previousValue,
  format = "number",
  icon: Icon,
  color = "blue",
  loading = false,
  onClick = null,
}) => {
  const formatValue = (val) => {
    if (loading) return "---";
    if (!val && val !== 0) return "--";

    switch (format) {
      case "currency":
        return `₹${(val / 100000).toFixed(1)}L`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
      default:
        return val.toLocaleString();
    }
  };

  const trend = useMemo(() => {
    if (!previousValue || loading) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? "up" : "down",
      isPositive: change >= 0,
    };
  }, [value, previousValue, loading]);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 ${
        onClick ? "cursor-pointer hover:border-gray-200" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend.value.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        <p className="text-sm text-gray-600">{title}</p>
        {trend && <p className="text-xs text-gray-500">vs previous period</p>}
      </div>
    </div>
  );
};

// Generate chart data - history for the last 30 days
const generateChartData = (history = [], periodInDays = 30) => {
  const dataMap = new Map();
  // Map existing data by date for quick lookups
  history.forEach((item) => {
    // Normalize the date to avoid timezone issues
    const date = new Date(item.date);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const normalizedDate = new Date(date.getTime() + userTimezoneOffset)
      .toISOString()
      .split("T")[0];
    dataMap.set(normalizedDate, item);
  });

  const chartData = [];
  const today = new Date();

  // Iterate backwards from today for the specified number of days
  for (let i = 0; i < periodInDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    const dayData = dataMap.get(dateString);

    chartData.push({
      // Format the date for the X-axis label
      name: date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      }),
      leads: dayData?.leadsAssigned || 0,
      deals: dayData?.dealsClosed || 0,
      conversion: dayData?.conversionRate || 0,
    });
  }

  // Reverse the array to display dates in chronological order
  return chartData.reverse();
};

// Performance Chart - Line Chart
const PerformanceChart = ({
  data,
  title,
  height = 300,
  onPeriodChange,
  currentPeriod,
}) => {
  const periods = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "180D", value: "180d" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                currentPeriod === period.value
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              No performance data available for this period.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" name="Leads" />
            <Bar yAxisId="left" dataKey="deals" fill="#10b981" name="Deals" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="conversion"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Conversion %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Lead Distribution Chart - Shows the distribution of leads
const LeadDistributionChart = ({ data }) => {
  const COLORS = {
    new: "#3b82f6",
    contacted: "#f59e0b",
    qualified: "#10b981",
    closed: "#8b5cf6",
    lost: "#ef4444",
  };

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: COLORS[key] || "#6b7280",
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Lead Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Activity Timeline - Shows recent activities
const ActivityTimeline = ({ activities, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === "lead"
                    ? "bg-blue-100"
                    : activity.type === "deal"
                    ? "bg-green-100"
                    : activity.type === "call"
                    ? "bg-orange-100"
                    : "bg-gray-100"
                }`}
              >
                {activity.type === "lead" ? (
                  <Users className="w-4 h-4 text-blue-600" />
                ) : activity.type === "deal" ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : activity.type === "call" ? (
                  <Phone className="w-4 h-4 text-orange-600" />
                ) : (
                  <Activity className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  {activity.title}
                </p>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  {activity.description && (
                    <p className="text-xs text-gray-500">
                      {activity.description} -
                    </p>
                  )}
                  {activity.propertyType && (
                    <span className="text-xs text-gray-800 bg-gray-300 px-1 py-0.5 rounded">
                      {activity.propertyType.toUpperCase()}
                    </span>
                  )}
                </div>

                {activity.address && (
                  <p className="text-xs text-gray-500">{activity.address}</p>
                )}

                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  {activity.timestamp && <p>Created: {activity.timestamp}</p>}
                  {activity.priority && (
                    <div className="bg-red-200 text-red-800 px-1 py-0.5 rounded-sm">
                      {activity.priority}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Dashboard Home
const DashboardHome = () => {
  const navigate = useNavigate();
  const { user, userId, userRole, roleLabel, hasPermission, isManager } =
    useAuth();
  console.log("User:", user);

  const [performancePeriod, setPerformancePeriod] = useState("30d");

  // State Management
  const [dashboardData, setDashboardData] = useState({
    // For the top-level Branch/Scope view
    scopeSummary: {
      totalLeads: 0,
      totalProperties: 0,
      totalDeals: 0,
      totalRevenue: 0,
    },
    // NEW: For the manager's personal stats
    personalSummary: {
      totalLeads: 0,
      totalProperties: 0,
      totalDeals: 0,
      totalRevenue: 0,
    },
    leadDistribution: {},
    performanceChart: [],
    recentActivities: [],
    // For the Team Performance block
    teamMetrics: {
      totalMembers: 0,
      totalLeads: 0,
      totalDeals: 0,
      totalRevenue: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch Real Dashboard Data
  const fetchDashboardData = useCallback(
    async (period) => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const [
          performanceResponse,
          leadsResponse,
          propertiesResponse,
          teamResponse,
        ] = await Promise.all([
          agentService.getAgentPerformance(userId, {
            period,
            includeHistory: true,
          }),
          agentService.getAssignedLeads({ limit: 10 }),
          agentService.getAssignedProperties({ limit: 10 }),
          isManager ? agentService.getTeamHierarchy() : Promise.resolve(null),
        ]);

        // FIX: Destructure the new backend response structure
        const personalPerformance =
          performanceResponse.performance?.personal || {};
        const scopePerformance = performanceResponse.performance?.scope || {};
        const performanceHistory =
          performanceResponse.performance?.history || [];

        const leadsData = leadsResponse || {};
        const leadsSummary = leadsData.summary || {};
        const propertiesData = propertiesResponse || {};
        const propertiesSummary = propertiesData.summary || {};

        // FIX: Get team metrics from the new response structure
        const teamMetrics = teamResponse?.metrics || {
          totalMembers: 0,
          totalLeads: 0,
          totalDeals: 0,
          totalRevenue: 0,
        };

        const periodInDays = parseInt(period.replace("d", ""));
        const performanceChart = generateChartData(
          performanceHistory,
          periodInDays
        );

        const recentActivities = (leadsData.leads || [])
          .slice(0, 5)
          .map((lead) => ({
            type: "lead",
            title: `Lead: ${lead.firstName} ${lead.lastName}`,
            description: `Status: ${lead.statusDisplay}`,
            timestamp: new Date(lead.createdAt).toLocaleDateString(),
          }));

        setDashboardData({
          scopeSummary: {
            totalLeads: leadsSummary.total || 0,
            totalProperties: propertiesSummary.total || 0,
            totalDeals: scopePerformance.totalDeals || 0,
            totalRevenue: scopePerformance.totalDealValue || 0,
          },
          personalSummary: {
            totalLeads: personalPerformance.totalLeadsAssigned || 0,
            totalProperties: 0, // Note: Personal properties not tracked yet
            totalDeals: personalPerformance.totalDeals || 0,
            totalRevenue: personalPerformance.totalDealValue || 0,
            conversionRate: personalPerformance.conversionRate || 0,
          },
          leadDistribution: {
            new: leadsSummary.new || 0,
            contacted: leadsSummary.contacted || 0,
            qualified: leadsSummary.qualified || 0,
            closed: leadsSummary.closed || 0,
            lost: leadsSummary.lost || 0,
          },
          performanceChart,
          recentActivities,
          teamMetrics,
        });

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    [userId, isManager]
  );

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchDashboardData(performancePeriod);
    }
  }, [userId, performancePeriod, fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) fetchDashboardData(performancePeriod);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId, performancePeriod, fetchDashboardData]);

  console.log("Dashboard Data:", dashboardData);

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Dashboard Error
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData(performancePeriod)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-gray-600 mt-1">
              {roleLabel} • Here's your performance overview
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-xs text-gray-400">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}
            <button
              onClick={() => fetchDashboardData(performancePeriod)}
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

      {isManager && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Your Personal Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            <PersonalMetric
              title="My Leads"
              value={dashboardData.personalSummary.totalLeads}
              icon={Briefcase}
              color="text-blue-600"
            />
            <PersonalMetric
              title="My Deals"
              value={dashboardData.personalSummary.totalDeals}
              icon={Star}
              color="text-purple-600"
            />
            <PersonalMetric
              title="My Revenue"
              value={`₹${(
                dashboardData.personalSummary.totalRevenue / 100000
              ).toFixed(1)}L`}
              icon={DollarSign}
              color="text-orange-600"
            />
            <PersonalMetric
              title="My Conversion"
              value={`${dashboardData.personalSummary.conversion || 0}%`}
              icon={TrendingUp}
              color="text-emerald-600"
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">
          {isManager
            ? "Branch Performance Overview"
            : "My Performance Overview"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Leads"
            value={dashboardData.scopeSummary.totalLeads}
            icon={Users}
            color="blue"
            loading={loading}
            onClick={() => navigate("/agent/leads")}
          />
          <MetricCard
            title="Properties"
            value={dashboardData.scopeSummary.totalProperties}
            icon={Building}
            color="green"
            loading={loading}
            onClick={() => navigate("/agent/properties")}
          />
          <MetricCard
            title="Deals Closed"
            value={dashboardData.scopeSummary.totalDeals}
            icon={Target}
            color="purple"
            loading={loading}
          />
          <MetricCard
            title="Total Revenue"
            value={dashboardData.scopeSummary.totalRevenue}
            format="currency"
            icon={DollarSign}
            color="orange"
            loading={loading}
          />
        </div>
      </div>

      {isManager && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Team Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData.teamMetrics.totalMembers}
              </p>
              <p className="text-sm text-blue-600">Team Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData.teamMetrics.totalLeads}
              </p>
              <p className="text-sm text-blue-600">Team Leads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {dashboardData.teamMetrics.totalDeals}
              </p>
              <p className="text-sm text-blue-600">Team Deals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                ₹{(dashboardData.teamMetrics.totalRevenue / 100000).toFixed(1)}L
              </p>
              <p className="text-sm text-blue-600">Team Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          data={dashboardData.performanceChart}
          title="Personal Performance Trends" // Title clarified
          height={350}
          onPeriodChange={setPerformancePeriod}
          currentPeriod={performancePeriod}
        />
        <LeadDistributionChart data={dashboardData.leadDistribution} />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <ActivityTimeline
            activities={dashboardData.recentActivities}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <PermissionGate
              permissions={[PERMISSIONS.CREATE_LEADS]}
              user={user}
            >
              <button
                onClick={() => navigate("/agent/leads/new")}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Lead
              </button>
            </PermissionGate>

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

            <PermissionGate
              permissions={[PERMISSIONS.VIEW_TEAM_HIERARCHY]}
              user={user}
            >
              <button
                onClick={() => navigate("/agent/team")}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </button>
            </PermissionGate>

            <button
              onClick={() => navigate("/agent/profile")}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Agent Dashboard
const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, hasPermission, loading } = useAuth();

  // Generate RBAC-filtered menu items
  const getMenuItems = useCallback(
    (userRole) => {
      const menuItems = [
        {
          path: "/agent/dashboard",
          label: "Dashboard",
          icon: BarChart,
          permission: PERMISSIONS.VIEW_OWN_PROFILE,
        },
        {
          path: "/agent/leads",
          label: "My Leads",
          icon: Users,
          permission: PERMISSIONS.VIEW_ASSIGNED_LEADS,
        },
        {
          path: "/agent/properties",
          label: "Properties",
          icon: Building,
          permission: PERMISSIONS.VIEW_ASSIGNED_PROPERTIES,
        },
      ];

      // Add management features based on permissions
      if (hasPermission(PERMISSIONS.VIEW_TEAM_HIERARCHY)) {
        menuItems.push({
          path: "/agent/team",
          label: "Team Management",
          icon: Users,
          permission: PERMISSIONS.VIEW_TEAM_HIERARCHY,
        });
      }

      if (hasPermission(PERMISSIONS.CREATE_LEADS)) {
        menuItems.push({
          path: "/agent/lead-management",
          label: "Lead Management",
          icon: Target,
          permission: PERMISSIONS.CREATE_LEADS,
        });
      }

      if (hasPermission(PERMISSIONS.REGIONAL_ANALYTICS)) {
        menuItems.push({
          path: "/agent/analytics",
          label: "Analytics",
          icon: BarChart,
          permission: PERMISSIONS.REGIONAL_ANALYTICS,
        });
      }

      menuItems.push({
        path: "/agent/profile",
        label: "Profile",
        icon: Settings,
        permission: PERMISSIONS.VIEW_OWN_PROFILE,
      });

      return menuItems.filter((item) => hasPermission(item.permission));
    },
    [hasPermission]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/agent/dashboard" replace />}
            />
            <Route path="/dashboard" element={<DashboardHome />} />

            {/* Permission-based routes */}
            {hasPermission(PERMISSIONS.VIEW_ASSIGNED_LEADS) && (
              <Route path="/leads" element={<AssignedLeads />} />
            )}

            {hasPermission(PERMISSIONS.VIEW_ASSIGNED_PROPERTIES) && (
              <Route path="/properties" element={<AssignedProperties />} />
            )}

            {hasPermission(PERMISSIONS.VIEW_OWN_PROFILE) && (
              <Route path="/profile" element={<AgentProfile />} />
            )}

            {hasPermission(PERMISSIONS.VIEW_TEAM_HIERARCHY) && (
              <Route path="/team" element={<TeamManagement />} />
            )}

            {/* Access denied fallback */}
            <Route
              path="*"
              element={
                <div className="p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Access Restricted
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have permission to access this section.
                  </p>
                  <button
                    onClick={() => navigate("/agent/dashboard")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
