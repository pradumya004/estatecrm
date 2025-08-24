// estatecrm/src/components/admin/PropertyList.jsx
// UPDATED: Uses real user data, permissions, and propertiesAPI

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Search,
  X,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  MapPin,
  DollarSign,
  Grid3X3,
  List,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  UserPlus,
  UserMinus,
  Star,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Home,
  Bed,
  Bath,
  Car,
  Square,
  Camera,
  Phone,
  Mail,
  Video,
  Settings,
  Target,
  Activity,
  Clock,
  Bookmark,
  Share2,
  Heart,
  Globe,
  Zap,
  AreaChart,
} from "lucide-react";
import { AdminGate } from "../common/PermissionGate";
import { useAuth } from "../../hooks/useAuth";
import { propertiesAPI, agentsAPI } from "../../services/api";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const PropertyList = () => {
  const { user, hasPermission, isAdmin } = useAuth();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalProperty, setAssignModalProperty] = useState(null);
  const [bulkAction, setBulkAction] = useState("");

  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    rented: 0,
    totalValue: 0,
    thisWeek: 0,
    featured: 0,
    verified: 0,
    unassigned: 0,
  });

  // Permission checks
  const canCreateProperties = hasPermission(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canEditProperties = hasPermission(PERMISSIONS.MANAGE_BRANCH_PROPERTIES);
  const canDeleteProperties = hasPermission(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canAssignProperties = hasPermission(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canBulkOperations = hasPermission(PERMISSIONS.BULK_OPERATIONS);
  const canExportData = hasPermission(PERMISSIONS.IMPORT_EXPORT_DATA);

  useEffect(() => {
    fetchProperties();
    loadAvailableAgents();
  }, []);

  useEffect(() => {
    filterAndSortProperties();
  }, [
    properties,
    searchQuery,
    selectedType,
    selectedStatus,
    selectedCategory,
    selectedCity,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    calculateStats();
  }, [properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperties({
        includeStats: true,
        includeAssignments: true,
        limit: 1000,
      });

      setProperties(response.data.properties || []);
      setPropertyStats(
        response.data.stats || {
          total: 0,
          available: 0,
          sold: 0,
          rented: 0,
          totalValue: 0,
          thisWeek: 0,
          featured: 0,
          verified: 0,
          unassigned: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching properties:", error);
      alert("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAgents = async () => {
    try {
      const response = await agentsAPI.getAgents({
        status: "active",
        limit: 100,
      });
      console.log("Available agents:", response.data);

      setAvailableAgents(response.data || []);
    } catch (error) {
      console.error("Error loading agents:", error);
    }
  };

  const calculateStats = () => {
    const stats = properties.reduce(
      (acc, property) => {
        acc.total++;
        if (property.status === "available") acc.available++;
        if (property.status === "sold") acc.sold++;
        if (property.status === "rented") acc.rented++;
        if (property.featured) acc.featured++;
        if (property.verified) acc.verified++;
        if (!property.assignedAgents || property.assignedAgents.length === 0)
          acc.unassigned++;

        acc.totalValue += property.pricing?.amount || 0;

        const createdDate = new Date(property.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (createdDate > weekAgo) acc.thisWeek++;

        return acc;
      },
      {
        total: 0,
        available: 0,
        sold: 0,
        rented: 0,
        totalValue: 0,
        thisWeek: 0,
        featured: 0,
        verified: 0,
        unassigned: 0,
      }
    );

    setPropertyStats((prev) => ({ ...prev, ...stats }));
  };

  const filterAndSortProperties = () => {
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

    if (selectedType !== "all") {
      filtered = filtered.filter((property) => property.type === selectedType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (property) => property.status === selectedStatus
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (property) => property.category === selectedCategory
      );
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(
        (property) => property.address?.city === selectedCity
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "pricing.amount") {
        aValue = a.pricing?.amount || 0;
        bValue = b.pricing?.amount || 0;
      } else if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!canDeleteProperties) {
      alert("You do not have permission to delete properties");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    ) {
      try {
        await propertiesAPI.deleteProperty(propertyId);
        fetchProperties();
        setSelectedProperties(
          selectedProperties.filter((id) => id !== propertyId)
        );
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Failed to delete property");
      }
    }
  };

  const handleAssignAgents = async (propertyId, agentIds) => {
    if (!canAssignProperties) {
      alert("You do not have permission to assign properties");
      return;
    }

    try {
      await propertiesAPI.assignProperty(propertyId, agentIds);
      fetchProperties();
      setShowAssignModal(false);
      setAssignModalProperty(null);
    } catch (error) {
      console.error("Error assigning property:", error);
      alert("Failed to assign property");
    }
  };

  const handleUnassignAgents = async (propertyId, agentIds) => {
    if (!canAssignProperties) {
      alert("You do not have permission to unassign properties");
      return;
    }

    try {
      await propertiesAPI.unassignProperty(propertyId, agentIds);
      fetchProperties();
    } catch (error) {
      console.error("Error unassigning property:", error);
      alert("Failed to unassign property");
    }
  };

  const handleBulkAction = async () => {
    if (!canBulkOperations || selectedProperties.length === 0) return;

    try {
      switch (bulkAction) {
        case "delete":
          if (
            window.confirm(
              `Delete ${selectedProperties.length} selected properties?`
            )
          ) {
            await Promise.all(
              selectedProperties.map((id) => propertiesAPI?.deleteProperty(id))
            );
            fetchProperties();
            setSelectedProperties([]);
          }
          break;
        case "feature":
          await Promise.all(
            selectedProperties.map((id) =>
              propertiesAPI?.updateProperty(id, { featured: true })
            )
          );
          fetchProperties();
          setSelectedProperties([]);
          break;
        case "verify":
          await Promise.all(
            selectedProperties.map((id) =>
              propertiesAPI?.updateProperty(id, { verified: true })
            )
          );
          fetchProperties();
          setSelectedProperties([]);
          break;
        default:
          break;
      }
      setBulkAction("");
    } catch (error) {
      console.error("Error performing bulk action:", error);
      alert("Failed to perform bulk action");
    }
  };

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
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {change}% this week
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

  const PropertyCard = ({ property }) => {
    const mainImage =
      property.images?.find((img) => img.isMain) || property.images?.[0];

    return (
      <div className="bg-gray-100 rounded-xl p-4 border border-gray-300 hover:shadow-lg transition-all duration-300 group cursor-pointer">
        {/* Selection Checkbox */}
        {canBulkOperations && (
          <div className="relative">
            <input
              type="checkbox"
              checked={selectedProperties.includes(property._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedProperties([...selectedProperties, property._id]);
                } else {
                  setSelectedProperties(
                    selectedProperties.filter((id) => id !== property._id)
                  );
                }
              }}
              className="w-4 h-4 text-blue-600 bg-white rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Image */}
        <div className="relative">
          {!mainImage ? (
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

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col space-y-1">
            {property.featured && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            )}
            {property.verified && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Verified
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

          {/* Quick Stats */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
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
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                ID: {property.propertyId || property._id?.slice(-6)}
              </p>
            </div>
          </div>

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
              <AreaChart className="w-4 h-4 text-gray-400" />
              <span>
                {property.specifications?.area?.value}{" "}
                {property.specifications?.area?.unit}
              </span>
            </div>
          </div>

          {/* Assigned Agents */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Assigned Agents
              </span>
              {canAssignProperties && (
                <button
                  onClick={() => {
                    setAssignModalProperty(property);
                    setShowAssignModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Manage
                </button>
              )}
            </div>

            {property.assignedAgents && property.assignedAgents.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {property.assignedAgents.slice(0, 3).map((agent) => (
                  <span
                    key={agent._id}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {agent.firstName} {agent.lastName}
                  </span>
                ))}
                {property.assignedAgents.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{property.assignedAgents.length - 3} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Unassigned
              </span>
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

            <div className="flex items-center space-x-1">
              <button
                onClick={() =>
                  window.open(`/properties/${property._id}`, "_blank")
                }
                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                title="View Property"
              >
                <Eye className="w-4 h-4" />
              </button>

              {canEditProperties && (
                <button
                  onClick={() =>
                    window.open(
                      `/admin/properties/${property._id}/edit`,
                      "_blank"
                    )
                  }
                  className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                  title="Edit Property"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}

              {canDeleteProperties && (
                <button
                  onClick={() => handleDeleteProperty(property._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="Delete Property"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PropertyListItem = ({ property }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-4">
        {canBulkOperations && (
          <input
            type="checkbox"
            checked={selectedProperties.includes(property._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProperties([...selectedProperties, property._id]);
              } else {
                setSelectedProperties(
                  selectedProperties.filter((id) => id !== property._id)
                );
              }
            }}
            className="w-4 h-4 text-blue-600"
          />
        )}

        <div className="flex-shrink-0">
          {property.images?.[0] ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {property.address?.area}, {property.address?.city}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ID: {property.propertyId || property._id?.slice(-6)}
              </p>

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

              {/* Assignment Status */}
              <div className="mt-2">
                {property.assignedAgents &&
                property.assignedAgents.length > 0 ? (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-600">
                      {property.assignedAgents.length} agent(s) assigned
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-red-600">Unassigned</span>
                  </div>
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

              <div className="flex items-center justify-end space-x-1 mt-3">
                <button
                  onClick={() =>
                    window.open(`/properties/${property._id}`, "_blank")
                  }
                  className="p-1 hover:bg-blue-50 rounded text-blue-600"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {canEditProperties && (
                  <button
                    onClick={() =>
                      window.open(
                        `/admin/properties/${property._id}/edit`,
                        "_blank"
                      )
                    }
                    className="p-1 hover:bg-green-50 rounded text-green-600"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canAssignProperties && (
                  <button
                    onClick={() => {
                      setAssignModalProperty(property);
                      setShowAssignModal(true);
                    }}
                    className="p-1 hover:bg-purple-50 rounded text-purple-600"
                    title="Assign Agents"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                )}

                {canDeleteProperties && (
                  <button
                    onClick={() => handleDeleteProperty(property._id)}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Get unique cities for filter
  const uniqueCities = [
    ...new Set(properties.map((p) => p?.address?.city).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Property Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all properties across the organization
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="btn-secondary"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4 mr-2" />
            ) : (
              <Grid3X3 className="w-4 h-4 mr-2" />
            )}
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>

          {canExportData && (
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          )}

          <button
            onClick={fetchProperties}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          {canCreateProperties && (
            <Link to="/admin/properties/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Properties"
          value={propertyStats.total}
          icon={Building}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Available"
          value={propertyStats.available}
          icon={CheckCircle}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change={8}
          trend="up"
        />
        <StatCard
          title="Total Value"
          value={Math.round(propertyStats.totalValue / 10000000)}
          suffix="Cr"
          icon={DollarSign}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Featured"
          value={propertyStats.featured}
          icon={Star}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
        <StatCard
          title="Verified"
          value={propertyStats.verified}
          icon={Shield}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Unassigned"
          value={propertyStats.unassigned}
          icon={AlertCircle}
          color="bg-gradient-to-r from-red-500 to-red-600"
          onClick={() => setSelectedStatus("unassigned")}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        {/* Bulk Actions */}
        {canBulkOperations && selectedProperties.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedProperties.length} properties selected
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="text-sm border border-blue-300 rounded px-3 py-1"
                >
                  <option value="">Choose action</option>
                  <option value="feature">Mark as Featured</option>
                  <option value="verify">Mark as Verified</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedProperties([])}
                  className="btn-secondary text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties by title, area, city, or property ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="pricing.amount">Price</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
              <option value="inquiries">Inquiries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0
              ? "No properties available in the system"
              : "Try adjusting your search or filter criteria"}
          </p>
          {canCreateProperties && properties.length === 0 && (
            <Link to="/admin/properties/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add First Property
            </Link>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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

      {/* Agent Assignment Modal */}
      {showAssignModal && assignModalProperty && canAssignProperties && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Agent Assignment
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">{assignModalProperty.title}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {availableAgents.agents.map((agent) => {
                  console.log("Agent:", agent);
                  const isAssigned = assignModalProperty.assignedAgents?.some(
                    (a) => a._id === agent._id
                  );

                  return (
                    <div
                      key={agent._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {agent.firstName?.[0]}
                            {agent.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {agent.firstName} {agent.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatToTitleCase(agent.role?.name)} •{" "}
                            {agent.department?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {agent.performance.totalLeads || 0} leads •{" "}
                            {agent.properties.length || 0} properties
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isAssigned ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleAssignAgents(assignModalProperty._id, [
                                agent._id,
                              ])
                            }
                            className="btn-primary text-sm"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Assign
                          </button>
                        )}

                        {isAssigned && (
                          <button
                            onClick={() =>
                              handleUnassignAgents(assignModalProperty._id, [
                                agent._id,
                              ])
                            }
                            className="btn-danger text-sm"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;
