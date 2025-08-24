// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Home,
  DollarSign,
  Filter,
  Download,
  Target,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  FileWarning,
  Search,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Import your actual services and hooks
import { useAuth } from "../../hooks/useAuth.js";
import { useAgentsList } from "../../hooks/useAgent.js";
import { leadsAPI } from "../../services/api.js";
import agentService from "../../services/agent.service.js";

import LeadsList from "./LeadsList";
import LeadDetail from "./LeadDetail";
import AgentsList from "./AgentsList";
import PropertiesList from "./PropertiesList";
import LeadForm from "./LeadForm";
import AgentForm from "./AgentForm";
import PropertyForm from "./PropertyForm";
import Analytics from "./Analytics";

// Admin Specific
import AdminSettings from "./AdminSettings";
import RoleManagement from "./RoleManagement";
import DepartmentManagement from "./DepartmentManagement";
import LoadingSpinner from "../common/LoadingSpinner";

// const StatCard = ({
//   title,
//   value,
//   growth,
//   icon: Icon,
//   color,
//   prefix = "",
//   suffix = "",
// }) => (
//   <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
//     <div className="flex items-center justify-between mb-4">
//       <div className={`p-2.5 rounded-lg bg-${color}-100`}>
//         <Icon className={`w-6 h-6 text-${color}-600`} />
//       </div>
//       {growth !== null && (
//         <div
//           className={`flex items-center text-sm font-medium ${
//             growth >= 0 ? "text-green-500" : "text-red-500"
//           }`}
//         >
//           {growth >= 0 ? (
//             <ArrowUpRight className="w-4 h-4" />
//           ) : (
//             <ArrowDownRight className="w-4 h-4" />
//           )}
//           {Math.abs(growth)}%
//         </div>
//       )}
//     </div>
//     <div>
//       <p className="text-3xl font-bold text-gray-800">
//         {prefix}
//         {typeof value === "number" ? value.toLocaleString("en-IN") : value}
//         {suffix}
//       </p>
//       <p className="text-gray-500 text-sm mt-1">{title}</p>
//     </div>
//   </div>
// );

const StatCard = ({
  title,
  value,
  growth,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div
        className={`flex items-center text-sm font-medium ${
          growth >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {growth >= 0 ? (
          <ArrowUpRight className="w-4 h-4 mr-1" />
        ) : (
          <ArrowDownRight className="w-4 h-4 mr-1" />
        )}
        {Math.abs(growth)}%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-gray-900">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "lead":
        return "👥";
      case "deal":
        return "💰";
      case "property":
        return "🏠";
      case "agent":
        return "👤";
      default:
        return "📝";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600";
      case "success":
        return "bg-green-100 text-green-600";
      case "info":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="text-lg">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.message}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
      <span
        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
          activity.priority
        )}`}
      >
        {activity.priority}
      </span>
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState({
    totalLeads: 0,
    totalAgents: 0,
    totalProperties: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setIsLoading(true);
    setTimeout(() => {
      setDashboardStats({
        totalLeads: 2847,
        totalAgents: 24,
        totalProperties: 156,
        totalRevenue: 45678900,
        monthlyGrowth: 12.5,
        conversionRate: 18.4,
      });

      setRecentActivity([
        {
          id: 1,
          type: "lead",
          message: "New lead Sarah Johnson registered",
          time: "2 min ago",
          priority: "high",
        },
        {
          id: 2,
          type: "deal",
          message: "Deal closed: ₹45L Downtown Apartment",
          time: "15 min ago",
          priority: "success",
        },
        {
          id: 3,
          type: "property",
          message: "New property listed in Bandra West",
          time: "1 hour ago",
          priority: "info",
        },
        {
          id: 4,
          type: "agent",
          message: "Agent Priya Sharma joined the team",
          time: "3 hours ago",
          priority: "info",
        },
      ]);

      setTopPerformers([
        {
          id: 1,
          name: "Rajesh Kumar",
          deals: 23,
          revenue: 12500000,
          growth: 15.2,
        },
        {
          id: 2,
          name: "Priya Sharma",
          deals: 19,
          revenue: 9800000,
          growth: 8.7,
        },
        {
          id: 3,
          name: "Amit Patel",
          deals: 17,
          revenue: 8900000,
          growth: 12.1,
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your real estate business today.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-64"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button className="relative p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={dashboardStats.totalLeads}
          growth={dashboardStats.monthlyGrowth}
          icon={Users}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Agents"
          value={dashboardStats.totalAgents}
          growth={8.2}
          icon={Target}
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="Properties Listed"
          value={dashboardStats.totalProperties}
          growth={15.8}
          icon={Home}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={Math.round(dashboardStats.totalRevenue / 100000)}
          growth={dashboardStats.monthlyGrowth}
          icon={DollarSign}
          color="from-orange-500 to-orange-600"
          prefix="₹"
          suffix="L"
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Overview
            </h3>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg">
                7 Days
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                30 Days
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                90 Days
              </button>
            </div>
          </div>

          {/* Simplified Chart Representation */}
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl flex items-end justify-between p-4">
            {[65, 78, 82, 88, 95, 89, 92].map((height, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-1">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            View All Activities
          </button>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Performing Agents
          </h3>
          <Zap className="w-5 h-5 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="relative">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {performer.name}
                  </h4>
                  <span className="text-2xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deals Closed:</span>
                    <span className="font-medium">{performer.deals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">
                      ₹{(performer.revenue / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Growth:</span>
                    <span className="font-medium text-green-600">
                      +{performer.growth}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="system" element={<AdminSettings />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />

        {/* Lead Management */}
        <Route path="leads/" element={<LeadsList />} />
        <Route path="leads/new" element={<LeadForm />} />
        <Route path="leads/edit/:id" element={<LeadForm />} />
        <Route path="leads/:id" element={<LeadDetail />} />

        {/* Agent Management */}
        <Route path="agents" element={<AgentsList />} />
        <Route path="agents/new" element={<AgentForm />} />
        <Route path="agents/:agentId/edit" element={<AgentForm />} />
        {/* <Route path="agents/:id" element={< />} /> */}

        {/* Property Management Routes */}
        <Route path="properties/*" element={<PropertiesList />} />
        {/* Add other admin-specific routes here */}
      </Routes>
    </div>
  );
};

export default AdminDashboard;