// src/components/agent/AssignedProperties.jsx
import React, { useState, useEffect } from 'react';
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
  Globe
} from 'lucide-react';
import { agentsAPI } from '../../services/api';

const AssignedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    rented: 0,
    totalValue: 0,
    thisWeek: 0
  });

  // Mock data for demonstration
  const mockProperties = [
    {
      _id: '1',
      title: 'Luxury 3BHK Apartment with Sea View',
      description: 'Beautiful apartment with stunning sea views, modern amenities, and prime location in Bandra West.',
      propertyId: 'RES240001',
      type: 'residential',
      subType: 'Apartment',
      category: 'sale',
      status: 'available',
      featured: true,
      address: {
        street: '15th Floor, Ocean View Towers',
        area: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050'
      },
      specifications: {
        bedrooms: 3,
        bathrooms: 3,
        area: { value: 1250, unit: 'sqft' },
        parking: 2,
        furnishing: 'fully_furnished',
        floor: '15',
        totalFloors: '25',
        facing: 'west',
        balconies: 2,
        age: '2-3',
        possession: 'ready'
      },
      pricing: {
        amount: 12500000,
        negotiable: true,
        maintenance: 8500,
        brokerageType: 'percentage',
        brokerage: 2
      },
      amenities: ['Swimming Pool', 'Gym', 'Security', 'Lift', 'Parking', 'Garden'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', isMain: true },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', isMain: false },
        { url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400', isMain: false }
      ],
      virtualTour: 'https://example.com/virtual-tour',
      createdAt: '2024-01-10T09:00:00Z',
      views: 245,
      inquiries: 18,
      lastViewed: '2024-01-15T14:30:00Z'
    },
    {
      _id: '2',
      title: 'Modern Office Space in Business District',
      description: 'Premium office space in the heart of BKC with modern infrastructure and excellent connectivity.',
      propertyId: 'COM240002',
      type: 'commercial',
      subType: 'Office Space',
      category: 'lease',
      status: 'available',
      featured: false,
      address: {
        street: '12th Floor, Corporate Tower',
        area: 'Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400051'
      },
      specifications: {
        area: { value: 3500, unit: 'sqft' },
        parking: 15,
        furnishing: 'unfurnished',
        floor: '12',
        totalFloors: '30',
        age: 'new',
        possession: 'ready'
      },
      pricing: {
        amount: 350000,
        negotiable: true,
        maintenance: 45000,
        securityDeposit: 1050000,
        brokerageType: 'fixed',
        brokerage: 100000
      },
      amenities: ['Central AC', 'High Speed Internet', 'Security', 'Lift', 'Parking', 'Cafeteria'],
      images: [
        { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', isMain: true },
        { url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400', isMain: false }
      ],
      createdAt: '2024-01-08T11:30:00Z',
      views: 156,
      inquiries: 12,
      lastViewed: '2024-01-14T16:20:00Z'
    },
    {
      _id: '3',
      title: 'Spacious 2BHK for Rent in Koramangala',
      description: 'Well-maintained apartment in prime Koramangala location with all modern amenities.',
      propertyId: 'RES240003',
      type: 'residential',
      subType: 'Apartment',
      category: 'rent',
      status: 'available',
      featured: true,
      address: {
        street: '5th Cross, 4th Block',
        area: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034'
      },
      specifications: {
        bedrooms: 2,
        bathrooms: 2,
        area: { value: 950, unit: 'sqft' },
        parking: 1,
        furnishing: 'semi_furnished',
        floor: '4',
        totalFloors: '8',
        facing: 'east',
        balconies: 1,
        age: '5-10',
        possession: 'ready'
      },
      pricing: {
        amount: 45000,
        negotiable: false,
        maintenance: 3500,
        securityDeposit: 135000,
        brokerageType: 'no-brokerage',
        brokerage: 0
      },
      amenities: ['Gym', 'Security', 'Lift', 'Parking', 'Power Backup'],
      images: [
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400', isMain: true },
        { url: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=400', isMain: false }
      ],
      createdAt: '2024-01-12T15:45:00Z',
      views: 89,
      inquiries: 7,
      lastViewed: '2024-01-15T10:15:00Z'
    }
  ];

  useEffect(() => {
    fetchAssignedProperties();
  }, []);

  useEffect(() => {
    filterAndSortProperties();
  }, [properties, searchQuery, selectedType, selectedStatus, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    calculateStats();
  }, [properties]);

  const fetchAssignedProperties = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getAssignedProperties();
      setProperties(response.data.properties || mockProperties);
    } catch (error) {
      console.error('Error fetching assigned properties:', error);
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProperties = () => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(property => property.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(property => property.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'pricing.amount') {
        aValue = a.pricing.amount;
        bValue = b.pricing.amount;
      } else if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProperties(filtered);
  };

  const calculateStats = () => {
    const stats = properties.reduce((acc, property) => {
      acc.total++;
      if (property.status === 'available') acc.available++;
      if (property.status === 'sold') acc.sold++;
      if (property.status === 'rented') acc.rented++;
      acc.totalValue += property.pricing.amount;
      
      const createdDate = new Date(property.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      if (createdDate > weekAgo) acc.thisWeek++;
      
      return acc;
    }, { total: 0, available: 0, sold: 0, rented: 0, totalValue: 0, thisWeek: 0 });

    setPropertyStats(stats);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      sold: 'bg-red-100 text-red-800 border-red-200',
      rented: 'bg-blue-100 text-blue-800 border-blue-200',
      under_negotiation: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatPrice = (amount, category) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr${category === 'rent' ? '/month' : ''}`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L${category === 'rent' ? '/month' : ''}`;
    } else {
      return `₹${amount.toLocaleString()}${category === 'rent' ? '/month' : ''}`;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change, trend, suffix = '' }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}{suffix}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +{change}% this week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const PropertyCard = ({ property }) => {
    const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];
    
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
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
              {property.status.replace('_', ' ')}
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
              <span>{property.views}</span>
            </div>
            <div className="flex items-center space-x-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              <Users className="w-3 h-3" />
              <span>{property.inquiries}</span>
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
                {property.type} • {property.subType} • {property.category}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <span>{property.address.area}, {property.address.city}</span>
          </div>

          {/* Specifications */}
          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
            {property.specifications.bedrooms && (
              <div className="flex items-center space-x-1">
                <Bed className="w-4 h-4 text-gray-400" />
                <span>{property.specifications.bedrooms}</span>
              </div>
            )}
            {property.specifications.bathrooms && (
              <div className="flex items-center space-x-1">
                <Bath className="w-4 h-4 text-gray-400" />
                <span>{property.specifications.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Square className="w-4 h-4 text-gray-400" />
              <span>{property.specifications.area.value} {property.specifications.area.unit}</span>
            </div>
            {property.specifications.parking > 0 && (
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
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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
                {formatPrice(property.pricing.amount, property.category)}
              </div>
              {property.pricing.negotiable && (
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
            <span>ID: {property.propertyId}</span>
            <span>Listed {new Date(property.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const PropertyListItem = ({ property }) => {
    const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];
    
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
                  {property.address.area}, {property.address.city}
                </p>
                
                {/* Specifications */}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {property.specifications.bedrooms && (
                    <span>{property.specifications.bedrooms} BHK</span>
                  )}
                  <span>{property.specifications.area.value} {property.specifications.area.unit}</span>
                  {property.specifications.parking > 0 && (
                    <span>{property.specifications.parking} Parking</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(property.pricing.amount, property.category)}
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
                  {property.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Assigned Properties</h1>
          <p className="text-gray-600 mt-1">Manage and showcase your property listings</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="btn-secondary"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button className="btn-primary">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Visit
          </button>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0 
              ? "You don't have any properties assigned yet" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredProperties.map((property) => (
            viewMode === 'grid' ? (
              <PropertyCard key={property._id} property={property} />
            ) : (
              <PropertyListItem key={property._id} property={property} />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedProperties;