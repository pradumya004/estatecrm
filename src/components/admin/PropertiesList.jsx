// src/components/admin/PropertiesList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Square, 
  Home as HomeIcon,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  Star,
  Users
} from 'lucide-react';
import { propertiesAPI, agentsAPI } from '../../services/api';

const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    city: '',
    page: 1
  });

  useEffect(() => {
    fetchProperties();
    fetchAgents();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperties(filters);
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAgents({ role: 'agent' });
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleAssignProperty = async (propertyId, agentIds) => {
    try {
      await propertiesAPI.assignProperty(propertyId, agentIds);
      fetchProperties(); // Refresh list
    } catch (error) {
      console.error('Error assigning property:', error);
      alert('Failed to assign property. Please try again.');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertiesAPI.deleteProperty(propertyId);
        fetchProperties(); // Refresh list
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
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

  const formatPrice = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
              <p className="text-gray-600 mt-1">Manage and track your property listings</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchProperties()}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <Link to="/admin/properties/new" className="btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{properties.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {properties.filter(p => p.status === 'available').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rented</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {properties.filter(p => p.status === 'rented').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {properties.filter(p => p.status === 'sold').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-8 shadow-sm">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="under_negotiation">Under Negotiation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                placeholder="Enter city name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ type: '', status: '', city: '', page: 1 })}
                className="w-full px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first property listing.</p>
            <Link to="/admin/properties/new" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                {/* Property Image */}
                <div className="relative">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images.find(img => img.isMain)?.url || property.images[0].url}
                      alt={property.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      <HomeIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(property.status)}`}>
                      {property.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Property Content */}
                <div className="p-6">
                  {/* Title and Price */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(property.pricing.amount)}
                      {property.pricing.negotiable && (
                        <span className="text-sm text-gray-500 font-normal ml-2">(Negotiable)</span>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="line-clamp-1">{property.fullAddress}</span>
                  </div>

                  {/* Property Type */}
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">{property.type}</span> • <span>{property.category}</span>
                  </div>

                  {/* Specifications */}
                  <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
                    {property.specifications.bedrooms && (
                      <div className="flex items-center space-x-1">
                        <Bed className="w-4 h-4 text-gray-400" />
                        <span>{property.specifications.bedrooms} Bed</span>
                      </div>
                    )}
                    {property.specifications.bathrooms && (
                      <div className="flex items-center space-x-1">
                        <Bath className="w-4 h-4 text-gray-400" />
                        <span>{property.specifications.bathrooms} Bath</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Square className="w-4 h-4 text-gray-400" />
                      <span>{property.specifications.area?.value} {property.specifications.area?.unit}</span>
                    </div>
                    {property.specifications.parking > 0 && (
                      <div className="flex items-center space-x-1">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span>{property.specifications.parking}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                    {property.description}
                  </p>

                  {/* Assigned Agents */}
                  <div className="mb-6">
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Assigned to: </span>
                      {property.assignedAgents?.length > 0 ? (
                        <span className="text-gray-900 font-medium">
                          {property.assignedAgents.map(agent => agent.fullName).join(', ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>
                    
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignProperty(property._id, [e.target.value]);
                          e.target.value = '';
                        }
                      }}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Assign to Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <Link
                        to={`/admin/properties/edit/${property._id}`}
                        className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property._id)}
                        className="flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      ID: {property.propertyId || property._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesList;