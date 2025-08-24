// estatecrm/src/components/agent/AssignedProperties.jsx
// UPDATED: Uses real user data, permissions, and follows hierarchy

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { agentsAPI, propertiesAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const AssignedProperties = () => {
  const { user, hasPermission, isManager, roleLevel } = useAuth();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    rented: 0,
    totalValue: 0,
    thisWeek: 0,
  });

  // Permission checks
  const canViewProperties = hasPermission(PERMISSIONS.VIEW_ASSIGNED_PROPERTIES);
  const canManageProperties = hasPermission(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );
  const canCreateProperties = hasPermission(
    PERMISSIONS.MANAGE_BRANCH_PROPERTIES
  );

  useEffect(() => {
    if (canViewProperties) {
      fetchAssignedProperties();
    }
  }, [canViewProperties]);

  useEffect(() => {
    filterAndSortProperties();
  }, [
    properties,
    searchQuery,
    selectedType,
    selectedStatus,
    selectedCategory,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    calculateStats();
  }, [properties]);

  const fetchAssignedProperties = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getAssignedProperties({
        includeStats: true,
        includePermissions: true,
      });

      console.log("Properties response:", response);

      setProperties(response.data?.properties || []);
      setPropertyStats(
        response.data?.stats || {
          total: 0,
          available: 0,
          sold: 0,
          rented: 0,
          totalValue: 0,
          thisWeek: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching assigned properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProperties = () => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (property) =>
          property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.address?.area
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          property.address?.city
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((property) => property.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (property) => property.status === selectedStatus
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (property) => property.category === selectedCategory
      );
    }

    // Sort
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

  const calculateStats = () => {
    const stats = properties.reduce(
      (acc, property) => {
        acc.total++;
        if (property.status === "available") acc.available++;
        if (property.status === "sold") acc.sold++;
        if (property.status === "rented") acc.rented++;
        acc.totalValue += property.pricing?.amount || 0;

        const createdDate = new Date(property.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (createdDate > weekAgo) acc.thisWeek++;

        return acc;
      },
      { total: 0, available: 0, sold: 0, rented: 0, totalValue: 0, thisWeek: 0 }
    );

    setPropertyStats((prev) => ({ ...prev, ...stats }));
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

  console.log("filteredProperties:", filteredProperties);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    trend,
    suffix = "",
  }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
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
              <ArrowUpRight className="w-4 h-4 mr-1" />+{change}% this week
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
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 group">
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

          {/* Views and Inquiries */}
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
        <div className="p-6">
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

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="text-xs text-blue-600">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

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
              <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              {property.virtualTour && (
                <button className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors">
                  <Video className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                <Eye className="w-4 h-4" />
              </button>
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
      <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={property.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="w-8 h-8 text-gray-400" />
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
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Assigned Properties
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and showcase your property listings
          </p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Role: {formatToTitleCase(user?.role)}</span>
            <span>•</span>
            <span>
              Scope:{" "}
              {roleLevel >= 8
                ? "Regional"
                : roleLevel >= 6
                ? "Branch"
                : roleLevel >= 4
                ? "Team"
                : "Personal"}{" "}
              Properties
            </span>
          </div>
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

          <button
            onClick={fetchAssignedProperties}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {canCreateProperties && (
            <Link
              to="/agent/properties/new"
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Property
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={propertyStats.total}
          icon={Home}
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
          title="New This Week"
          value={propertyStats.thisWeek}
          icon={Star}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          change={12}
          trend="up"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search properties by title, area, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="pricing.amount">Price</option>
              <option value="title">Title</option>
              <option value="views">Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Display */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="text-gray-400 mb-4 text-5xl">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0
              ? "You don't have any properties assigned yet"
              : "Try adjusting your search or filter criteria"}
          </p>
          {canCreateProperties && (
            <Link
              to="/properties/new"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Property
            </Link>
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

      {/* Performance Summary for Managers */}
      {isManager && properties.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Property Portfolio Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(
                  (propertyStats.available / propertyStats.total) * 100
                )}
                %
              </p>
              <p className="text-sm text-blue-600">Availability Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                ₹
                {(
                  propertyStats.totalValue /
                  propertyStats.total /
                  100000
                ).toFixed(1)}
                L
              </p>
              <p className="text-sm text-blue-600">Average Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {propertyStats.sold + propertyStats.rented}
              </p>
              <p className="text-sm text-blue-600">Closed Deals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {propertyStats.thisWeek}
              </p>
              <p className="text-sm text-blue-600">New This Week</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedProperties;
