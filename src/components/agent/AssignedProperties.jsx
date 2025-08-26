// estatecrm/src/components/agent/AssignedProperties.jsx
// UPDATED: Scope-based property management with hierarchy support

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  Eye,
  Heart,
  Share2,
  Edit,
  Star,
  Camera,
  Calendar,
  DollarSign,
  TrendingUp,
  Home,
  Building,
  Award,
  Target,
  Activity,
  ArrowUpRight,
  Bookmark,
  Phone,
  Mail,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  Globe,
  RefreshCw,
  Plus,
  User,
  Map,
  Shield,
  BarChart3,
  Settings,
  Upload,
  Download,
} from "lucide-react";
import { agentsAPI, propertiesAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const AssignedProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Direct permission checks from database
  const userPermissions = user?.permissions || [];
  const canViewProperties = userPermissions.includes(
    PERMISSIONS.VIEW_ASSIGNED_PROPERTIES
  );
  const canManageProperties = userPermissions.includes(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canCreateProperties = userPermissions.includes(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canEditProperties = userPermissions.includes(
    PERMISSIONS.EDIT_PROPERTY_DETAILS
  );
  const canViewTeamProperties = userPermissions.includes(
    PERMISSIONS.VIEW_TEAM_PROPERTIES
  );
  const canViewBranchData = userPermissions.includes(
    PERMISSIONS.VIEW_BRANCH_AGENTS
  );
  const canViewAnalytics = userPermissions.some((p) =>
    [
      PERMISSIONS.VIEW_BRANCH_ANALYTICS,
      PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    ].includes(p)
  );
  const canBulkOperations = userPermissions.includes(
    PERMISSIONS.BULK_OPERATIONS
  );

  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeScope, setActiveScope] = useState("own");
  const [availableScopes, setAvailableScopes] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");

  const [propertyStats, setPropertyStats] = useState({});
  const [teamStats, setTeamStats] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch properties with scope
  const fetchAssignedProperties = useCallback(
    async (scope = activeScope) => {
      try {
        setLoading(true);
        const params = {
          scope,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          page: pagination.page,
          limit: pagination.limit,
          includeStats: true,
          includePermissions: true,
        };

        const response = await agentsAPI.getAssignedProperties(params);

        setProperties(response.data.properties || []);
        setPropertyStats(response.data.summary || {});
        setTeamStats(response.data.teamSummary || null);
        setAvailableScopes(response.data.availableScopes || []);

        if (response.data.totalPages) {
          setPagination((prev) => ({
            ...prev,
            total: response.data.total || 0,
            totalPages: response.data.totalPages,
          }));
        }
      } catch (error) {
        console.error("Error fetching assigned properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [
      activeScope,
      selectedStatus,
      selectedType,
      selectedCategory,
      pagination.page,
      pagination.limit,
    ]
  );

  useEffect(() => {
    if (canViewProperties) {
      fetchAssignedProperties();
    }
  }, [fetchAssignedProperties, canViewProperties]);

  // Handle scope change
  const handleScopeChange = (newScope) => {
    setActiveScope(newScope);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchAssignedProperties(newScope);
  };

  // Client-side filtering and sorting
  const getFilteredAndSortedProperties = () => {
    let filtered = [...properties];

    if (searchQuery) {
      filtered = filtered.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.address?.area
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          property.address?.city
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          property.propertyId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "pricing.amount") {
        aValue = a.pricing?.amount || 0;
        bValue = b.pricing?.amount || 0;
      } else if (sortBy === "createdAt") {
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

  const filteredProperties = getFilteredAndSortedProperties();

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

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800 border-green-200",
      sold: "bg-red-100 text-red-800 border-red-200",
      rented: "bg-blue-100 text-blue-800 border-blue-200",
      under_negotiation: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatPrice = (amount, category) => {
    if (!amount) return "Price on request";

    const suffix =
      category === "rent" ? "/month" : category === "lease" ? "/month" : "";

    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr${suffix}`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L${suffix}`;
    } else {
      return `₹${amount.toLocaleString()}${suffix}`;
    }
  };

  // UI Components
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    trend,
    suffix = "",
  }) => (
    <div className="bg-white rounded-lg p-4 border hover:shadow-md transition-all duration-300">
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
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {change}% this week
            </p>
          )}
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

  const PropertyCard = ({ property }) => {
    const mainImage =
      property.images?.find((img) => img.isMain) || property.images?.[0];

    return (
      <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 group">
        {/* Image */}
        <div className="relative">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={property.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            {property.featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                property.status
              )}`}
            >
              {formatToTitleCase(property.status)}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center space-x-1">
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Property metrics */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              <Eye className="w-3 h-3" />
              <span>{property.views || 0}</span>
            </div>
            <div className="flex items-center space-x-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              <Users className="w-3 h-3" />
              <span>{property.inquiries || 0}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {formatToTitleCase(property.type)} •{" "}
                {formatToTitleCase(property.subType)} •{" "}
                {formatToTitleCase(property.category)}
              </p>
            </div>
          </div>

          {/* Assigned agents - Only for non-own scope */}
          {activeScope !== "own" &&
            property.assignedAgents &&
            property.assignedAgents.length > 0 && (
              <div className="mb-3 text-xs text-gray-500">
                <p>Assigned to:</p>
                <p className="font-medium">
                  {property.assignedAgents
                    .map((agent) => `${agent.firstName} ${agent.lastName}`)
                    .join(", ")}
                </p>
              </div>
            )}

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <span>
              {property.address?.area}, {property.address?.city}
            </span>
          </div>

          {/* Specifications */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
            {property.specifications?.bedrooms && (
              <div className="flex items-center space-x-1">
                <Bed className="w-4 h-4 text-gray-400" />
                <span>{property.specifications.bedrooms}</span>
              </div>
            )}
            {property.specifications?.bathrooms && (
              <div className="flex items-center space-x-1">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.specifications.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Square className="w-4 h-4 text-gray-400" />
              <span>
                {property.specifications?.area?.value}{" "}
                {property.specifications?.area?.unit}
              </span>
            </div>
            {property.specifications?.parking > 0 && (
              <div className="flex items-center space-x-1">
                <Car className="w-4 h-4 text-gray-400" />
                <span>{property.specifications.parking}</span>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-xl font-bold text-green-600">
                {formatPrice(property.pricing?.amount, property.category)}
              </div>
              {property.pricing?.negotiable && (
                <span className="text-xs text-gray-500">Negotiable</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/agent/properties/${property._id}`)}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              {canEditProperties && (
                <button
                  onClick={() =>
                    navigate(`/agent/properties/${property._id}/edit`)
                  }
                  className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Property ID and Date */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span>ID: {property.propertyId || property._id?.slice(-6)}</span>
            <span>
              Listed {new Date(property.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const PropertyListItem = ({ property }) => {
    const mainImage =
      property.images?.find((img) => img.isMain) || property.images?.[0];

    return (
      <div className="bg-white rounded-lg p-4 border hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={property.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {property.address?.area}, {property.address?.city}
                </p>

                {/* Assigned agents - Only for non-own scope */}
                {activeScope !== "own" &&
                  property.assignedAgents &&
                  property.assignedAgents.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned:{" "}
                      {property.assignedAgents
                        .map((agent) => `${agent.firstName} ${agent.lastName}`)
                        .join(", ")}
                    </p>
                  )}

                {/* Specifications */}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {property.specifications?.bedrooms && (
                    <span>{property.specifications.bedrooms} BHK</span>
                  )}
                  <span>
                    {property.specifications?.area?.value}{" "}
                    {property.specifications?.area?.unit}
                  </span>
                  {property.specifications?.parking > 0 && (
                    <span>{property.specifications.parking} Parking</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(property.pricing?.amount, property.category)}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    property.status
                  )}`}
                >
                  {formatToTitleCase(property.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Permission check
  if (!canViewProperties) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to view assigned properties.
          </p>
          <p className="text-sm text-gray-500">
            Required: {PERMISSIONS.VIEW_ASSIGNED_PROPERTIES} permission
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Property Management Dashboard
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>
              {user?.roleLabel || formatToTitleCase(user?.role || "")}
            </span>
            <span className="text-blue-600 ml-2">
              • {filteredProperties.length} properties in view
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4 mr-2" />
            ) : (
              <Grid3X3 className="w-4 h-4 mr-2" />
            )}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>

          {canCreateProperties && (
            <button
              onClick={() => navigate("/agent/properties/new")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Property
            </button>
          )}

          <button
            onClick={() => fetchAssignedProperties()}
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
          title="Total Properties"
          value={propertyStats.total || 0}
          icon={Home}
          color="bg-blue-500"
        />
        <StatCard
          title="Available"
          value={propertyStats.available || 0}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Sold"
          value={propertyStats.sold || 0}
          icon={Target}
          color="bg-red-500"
        />
        <StatCard
          title="Rented"
          value={propertyStats.rented || 0}
          icon={Building}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Value"
          value={Math.round((propertyStats.totalValue || 0) / 10000000)}
          suffix="Cr"
          icon={DollarSign}
          color="bg-indigo-500"
        />
        <StatCard
          title="This Week"
          value={propertyStats.thisWeek || 0}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
      </div>

      {/* Team Stats - Only for managers with team data */}
      {teamStats && canViewTeamProperties && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Team Property Portfolio Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-600">
                {teamStats.total || 0}
              </p>
              <p className="text-xs text-gray-600">Team Properties</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600">
                {teamStats.available || 0}
              </p>
              <p className="text-xs text-gray-600">Available</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-orange-600">
                {teamStats.teamMembers || 0}
              </p>
              <p className="text-xs text-gray-600">Team Members</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-600">
                ₹{Math.round((teamStats.totalValue || 0) / 10000000)}Cr
              </p>
              <p className="text-xs text-gray-600">Portfolio Value</p>
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
                placeholder="Search properties by title, area, city, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="land">Land</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="under_negotiation">Under Negotiation</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Date Added</option>
              <option value="pricing.amount">Price</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center p-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border">
          <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ||
            selectedType !== "all" ||
            selectedStatus !== "all" ||
            selectedCategory !== "all"
              ? "Try adjusting your filters or search terms."
              : "No properties available in this scope."}
          </p>
          {canCreateProperties && activeScope === "own" && (
            <button
              onClick={() => navigate("/agent/properties/new")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Property
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
          {filteredProperties.map((property) =>
            viewMode === "grid" ? (
              <PropertyCard key={property._id} property={property} />
            ) : (
              <PropertyListItem key={property._id} property={property} />
            )
          )}
        </div>
      )}

      {/* Bulk Operations - Only if user has permission */}
      {canBulkOperations && filteredProperties.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Bulk Operations
          </h3>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Users className="w-4 h-4 mr-2" />
              Bulk Assign Agents
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Bulk Status Update
            </button>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Export Properties
            </button>
          </div>
        </div>
      )}

      {/* Analytics - Only if user has permission */}
      {canViewAnalytics && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Property Portfolio Analytics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {(
                  ((propertyStats.available || 0) /
                    (propertyStats.total || 1)) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-gray-600">Availability Rate</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                ₹
                {(
                  (propertyStats.totalValue || 0) /
                  (propertyStats.total || 1) /
                  100000
                ).toFixed(1)}
                L
              </p>
              <p className="text-xs text-gray-600">Average Value</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">
                {(propertyStats.sold || 0) + (propertyStats.rented || 0)}
              </p>
              <p className="text-xs text-gray-600">Total Sales</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
                {(
                  (((propertyStats.sold || 0) + (propertyStats.rented || 0)) /
                    (propertyStats.total || 1)) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-gray-600">Closure Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedProperties;
