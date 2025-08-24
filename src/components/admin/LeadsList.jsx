// estatecrm/src/components/admin/LeadsList.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Download,
  Upload,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Send,
  MessageSquare,
  FileSpreadsheet,
  History,
  ChevronDown,
  X,
  BlocksIcon,
  List,
  Table,
  Rows2,
  Rows3,
  Rows4Icon,
} from "lucide-react";
import { leadsAPI, agentsAPI, importAPI } from "../../services/api";
import { DeleteDialog } from "../ui/DeleteDialog.jsx";
import LeadsImport from "./LeadsImport"; // Import the new component

const LeadsList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // NEW STATES FOR IMPORT
  const [showImport, setShowImport] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
  const [importHistory, setImportHistory] = useState([]);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    source: "",
    assignedAgent: "",
    dateRange: "all",
    minBudget: "",
    maxBudget: "",
    importBatch: "", // NEW: Filter by import batch
    page: 1,
    limit: 20,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");

  // Stats for the leads
  const [leadsStats, setLeadsStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    closed: 0,
    avgDealValue: 0,
    imported: 0, // NEW: Track imported leads
  });

  useEffect(() => {
    fetchLeads();
    fetchAgents();
    if (showImportHistory) {
      fetchImportHistory();
    }
  }, [filters, sortBy, sortOrder, showImportHistory]);

  useEffect(() => {
    calculateStats();
    filterLeads();
  }, [leads, searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const filteredParams = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value !== "all"
        )
      );

      const response = await leadsAPI.getLeads({
        ...filteredParams,
        sortBy,
        sortOrder,
      });
      console.log("Fetched leads:", response);

      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads(getMockLeads());
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAgents();
      console.log("Fetched agents:", response);
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents(getMockAgents());
    }
  };

  // NEW: Fetch import history
  const fetchImportHistory = async () => {
    try {
      const response = await importAPI.getImportHistory({ page: 1, limit: 10 });
      setImportHistory(response.data.imports || []);
    } catch (error) {
      console.error("Error fetching import history:", error);
      setImportHistory([]);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchQuery) {
      filtered = filtered.filter(
        (lead) =>
          lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone.includes(searchQuery)
      );
    }

    setFilteredLeads(filtered);

    // console.log("lead assignedAgent", leads[0].assignedAgent);
    // console.log("agents", agents);
  };

  const calculateStats = () => {
    const stats = leads.reduce(
      (acc, lead) => {
        acc.total++;
        if (lead.status === "new") acc.new++;
        if (lead.status === "qualified") acc.qualified++;
        if (lead.status === "deal_closed") acc.closed++;
        if (lead.deal?.value) acc.avgDealValue += lead.deal.value;
        if (lead.importSource && lead.importSource !== "manual") acc.imported++; // NEW: Count imported leads
        return acc;
      },
      {
        total: 0,
        new: 0,
        qualified: 0,
        closed: 0,
        avgDealValue: 0,
        imported: 0,
      }
    );

    stats.avgDealValue =
      stats.closed > 0 ? stats.avgDealValue / stats.closed : 0;
    setLeadsStats(stats);
  };

  const handleAssignLead = async (leadId, agentId) => {
    try {
      await leadsAPI.assignLead(leadId, agentId);
      fetchLeads();
    } catch (error) {
      console.error("Error assigning lead:", error);
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId
            ? { ...lead, assignedAgent: agents.find((a) => a._id === agentId) }
            : lead
        )
      );
    }
  };

  const handleDeleteLead = async (leadId, e) => {
    try {
      setLoading(true);
      await leadsAPI.deleteLead(leadId);
      setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== leadId));
      console.log("Lead deleted successfully");
    } catch (error) {
      console.error("Error deleting lead:", error);
    } finally {
      setLoading(false);
      setOpenDialog(false);
      setSelectedLeadId(null);
    }
  };

  // NEW: Handle import success
  const handleImportSuccess = () => {
    fetchLeads(); // Refresh the leads list
    setShowImport(false);
    // Show success message or toast notification
    console.log("✅ Leads imported successfully!");
  };

  // NEW: Download sample files
  const handleDownloadSample = async (format) => {
    try {
      const response = await importAPI.downloadSampleExcel(format);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads_sample_${format}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading sample:", error);
      alert("Failed to download sample file");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedLeads.length} lead(s)? This action cannot be undone.`
      )
    ) {
      try {
        setLoading(true);
        await Promise.all(selectedLeads.map((id) => leadsAPI.deleteLead(id)));

        setLeads((prevLeads) =>
          prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
        );
        setSelectedLeads([]);

        console.log(`${selectedLeads.length} leads deleted successfully`);
      } catch (error) {
        console.error("Error deleting leads:", error);
        setLeads((prevLeads) =>
          prevLeads.filter((lead) => !selectedLeads.includes(lead._id))
        );
        setSelectedLeads([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLeadClick = (leadId) => {
    navigate(`/admin/leads/${leadId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      qualified: "bg-green-100 text-green-800 border-green-200",
      site_visit_scheduled: "bg-purple-100 text-purple-800 border-purple-200",
      site_visit_completed: "bg-indigo-100 text-indigo-800 border-indigo-200",
      proposal_sent: "bg-orange-100 text-orange-800 border-orange-200",
      negotiation: "bg-amber-100 text-amber-800 border-amber-200",
      deal_closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      lost: "bg-red-100 text-red-800 border-red-200",
      follow_up: "bg-cyan-100 text-cyan-800 border-cyan-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-gray-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
  };

  const getStatusIcon = (status) => {
    const icons = {
      new: Clock,
      contacted: Phone,
      qualified: CheckCircle,
      deal_closed: Target,
      lost: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  // Mock data functions (keep existing ones)
  const getMockLeads = () => [
    {
      _id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      fullName: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+91 98765 43210",
      status: "qualified",
      priority: "high",
      source: "website",
      importSource: "manual",
      requirements: {
        type: "residential",
        purpose: "buy",
        budget: { min: 5000000, max: 8000000 },
        location: { city: "Mumbai" },
      },
      budgetRange: "₹50,00,000 - ₹80,00,000",
      assignedAgent: null,
      createdAt: "2024-01-15T10:30:00Z",
      interestedProperties: [],
    },
  ];

  const getMockAgents = () => [
    {
      _id: "a1",
      fullName: "Rajesh Kumar",
      firstName: "Rajesh",
      lastName: "Kumar",
    },
    {
      _id: "a2",
      fullName: "Priya Sharma",
      firstName: "Priya",
      lastName: "Sharma",
    },
    { _id: "a3", fullName: "Amit Patel", firstName: "Amit", lastName: "Patel" },
  ];

  const StatsCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {/* {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +{change}% this month
            </p>
          )} */}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const LeadCard = ({ lead }) => (
    <div
      className="bg-gray-100 rounded-xl p-6 border border-gray-300 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={() => handleLeadClick(lead._id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {lead.firstName?.[0]}
            {lead.lastName?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {lead.fullName}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">
                {lead.requirements.type} - {lead.requirements.purpose}
              </p>
              {/* NEW: Import source indicator */}
              {lead.importSource && lead.importSource !== "manual" && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Imported
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              lead.status
            )}`}
          >
            {getStatusIcon(lead.status)}
            <span className="ml-1">{lead.status.replace("_", " ")}</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {lead.email}
        </div> */}

        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {lead.phone}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          {lead.budgetRange}
        </div>

        {lead.requirements.location?.city && (
          <div className="flex items-center text-sm text-gray-600">
            <Target className="w-4 h-4 mr-2" />
            {lead.requirements.location.city}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}
          >
            {lead.priority.toUpperCase()}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">{lead.source}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={!lead.phone}
            className={`p-2 rounded-lg transition-transform transform duration-200 ${
              lead.phone
                ? "hover:bg-blue-50 text-blue-600 hover:scale-125"
                : "text-gray-300 cursor-not-allowed"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${lead.phone}`, "_self"); // opens phone dialer
            }}
          >
            <Phone className="w-4 h-4" />
          </button>

          <Link
            to={`/admin/leads/edit/${lead._id}`}
            className="p-2 rounded-lg text-blue-600 transition-transform transform duration-200 hover:bg-blue-50 hover:scale-125"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-4 h-4" />
          </Link>

          <button
            className="p-2 rounded-lg text-red-600 transition-transform transform duration-200 hover:bg-red-50 hover:scale-125"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLeadId(lead._id);
              setOpenDialog(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <select
          value={lead.assignedAgent?._id || ""}
          onChange={(e) => handleAssignLead(lead._id, e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Assign Agent</option>
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.fullName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // NEW: Import History Modal Component
  const ImportHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Import History
            </h2>
          </div>
          <button
            onClick={() => setShowImportHistory(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {importHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No import history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {importHistory.map((batch) => (
                <div
                  key={batch._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {batch.totalLeads} leads imported
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(batch.createdAt).toLocaleString()} • by{" "}
                        {batch.createdBy?.firstName} {batch.createdBy?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          batch.importSource === "excel_lead"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {batch.importSource === "excel_lead"
                          ? "Lead Format"
                          : "Data Format"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Batch ID: {batch._id}</span>
                    <button
                      onClick={() =>
                        setFilters({ ...filters, importBatch: batch._id })
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Leads
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your potential customers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* NEW: Import dropdown menu */}
          <div className="relative group">
            <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2">
                <button
                  onClick={() => setShowImport(true)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Import from Excel
                    </p>
                    <p className="text-xs text-gray-500">Upload Excel file</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowImportHistory(true)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <History className="w-4 h-4 mr-3 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Import History
                    </p>
                    <p className="text-xs text-gray-500">View past imports</p>
                  </div>
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <button
                  onClick={() => handleDownloadSample("lead")}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-3 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sample (Lead)
                    </p>
                    <p className="text-xs text-gray-500">Download template</p>
                  </div>
                </button>

                <button
                  onClick={() => handleDownloadSample("data")}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-3 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sample (Data)
                    </p>
                    <p className="text-xs text-gray-500">Download template</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          <Link
            to="/admin/leads/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Leads"
          value={leadsStats.total}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change={12.5}
        />
        <StatsCard
          title="New Leads"
          value={leadsStats.new}
          icon={Star}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={8.3}
        />
        <StatsCard
          title="Qualified"
          value={leadsStats.qualified}
          icon={Target}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change={15.2}
        />
        <StatsCard
          title="Closed Deals"
          value={leadsStats.closed}
          icon={CheckCircle}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          change={6.7}
        />
        {/* NEW: Imported leads stat */}
        <StatsCard
          title="Imported"
          value={leadsStats.imported}
          icon={FileSpreadsheet}
          color="bg-gradient-to-r from-cyan-500 to-cyan-600"
          change={25.0}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <BlocksIcon className="w-7 h-7" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Rows4Icon className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <select
                value={filters.source}
                onChange={(e) =>
                  setFilters({ ...filters, source: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook">Facebook</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="walk_in">Walk In</option>
              </select>

              <input
                type="number"
                placeholder="Min Budget"
                value={filters.minBudget}
                onChange={(e) =>
                  setFilters({ ...filters, minBudget: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Max Budget"
                value={filters.maxBudget}
                onChange={(e) =>
                  setFilters({ ...filters, maxBudget: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filters.assignedAgent}
                onChange={(e) =>
                  setFilters({ ...filters, assignedAgent: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.fullName}
                  </option>
                ))}
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="deal_closed">Deal Closed</option>
                <option value="lost">Lost</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <button
                onClick={() =>
                  setFilters({
                    status: "",
                    priority: "",
                    source: "",
                    assignedAgent: "",
                    dateRange: "all",
                    minBudget: "",
                    maxBudget: "",
                    page: 1,
                    limit: 20,
                    importBatch: "",
                  })
                }
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedLeads.length} lead(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("assign")}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Assign
              </button>
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
              >
                Export
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Display */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="text-gray-400 mb-4 text-5xl">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No leads found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Get started by adding your first lead"}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/admin/leads/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Lead
            </Link>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from Excel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredLeads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
          <span className="text-sm text-gray-600">
            Showing{" "}
            {Math.min(
              (filters.page - 1) * filters.limit + 1,
              filteredLeads.length
            )}{" "}
            to {Math.min(filters.page * filters.limit, filteredLeads.length)} of{" "}
            {filteredLeads.length} results
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
              }
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">
              {filters.page}
            </span>

            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filteredLeads.length < filters.limit}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* NEW: Import Modal */}
      {showImport && (
        <LeadsImport
          onClose={() => setShowImport(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* NEW: Import History Modal */}
      {showImportHistory && <ImportHistoryModal />}

      {/* Confirmation Dialog for Deletion */}
      {openDialog && (
        <DeleteDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={() => handleDeleteLead(selectedLeadId)}
          title="Delete Lead"
          description="Are you sure you want to delete this lead? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default LeadsList;
