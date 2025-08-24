// estatecrm/src/components/admin/PropertyForm.jsx
// UPDATED: Uses real user data, permissions, and propertiesAPI

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MapPin,
  DollarSign,
  Upload,
  Settings,
  X,
  Save,
  Eye,
  Image as ImageIcon,
  Bed,
  Bath,
  Car,
  Square,
  Wifi,
  Zap,
  Droplets,
  Shield,
  Camera,
  Star,
  Building,
  Ruler,
  Calendar,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { AdminGate } from "../common/PermissionGate";
import { useAuth } from "../../hooks/useAuth";
import { propertiesAPI, agentsAPI } from "../../services/api";
import { PERMISSIONS } from "../../utils/rbacConstants";
import { formatToTitleCase } from "../../utils/formatters";

const PropertyForm = ({ propertyId = null, onSave, onCancel }) => {
  const { user, hasPermission } = useAuth();
  //   console.log("user:", user);

  const baseRoute = user.role === "admin" ? "/admin" : "/agent";

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "residential",
    subType: "",
    category: "sale",
    status: "available",
    address: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      coordinates: { lat: null, lng: null },
    },
    specifications: {
      area: { value: "", unit: "sqft" },
      bedrooms: "",
      bathrooms: "",
      balconies: "",
      parking: "",
      floorsTotal: "",
      floorNumber: "",
      furnished: "unfurnished",
      facing: "",
      ageOfProperty: "",
    },
    pricing: {
      amount: "",
      negotiable: false,
      maintenanceCharges: "",
      securityDeposit: "",
      brokerageType: "percentage",
      brokerageAmount: "",
    },
    amenities: [],
    features: [],
    documents: [],
    images: [],
    assignedAgents: [],
    featured: false,
    verified: false,
    virtualTour: "",
    contactPreference: "both",
  });

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [errors, setErrors] = useState({});

  // Predefined options
  const propertyTypes = {
    residential: ["apartment", "villa", "house", "penthouse", "studio"],
    commercial: ["office", "shop", "warehouse", "showroom", "mall"],
    industrial: ["factory", "warehouse", "manufacturing", "godown"],
    land: ["residential", "commercial", "industrial", "agricultural"],
  };

  const amenitiesList = [
    "Swimming Pool",
    "Gym",
    "Playground",
    "Clubhouse",
    "Garden",
    "Security",
    "Power Backup",
    "Lift",
    "Parking",
    "Water Supply",
    "Internet",
    "AC",
    "Modular Kitchen",
    "Balcony",
    "Terrace",
    "Study Room",
    "Store Room",
    "Servant Room",
    "Intercom",
  ];

  const featuresList = [
    "Corner Property",
    "Gated Community",
    "Prime Location",
    "New Construction",
    "Ready to Move",
    "Under Construction",
    "Investment Property",
    "Luxury",
    "Budget Friendly",
    "Family Oriented",
    "Bachelor Friendly",
    "Pet Friendly",
  ];

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
    loadAvailableAgents();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getProperty(propertyId);
      setFormData(response.data.property);
    } catch (error) {
      console.error("Error loading property:", error);
      alert("Failed to load property data");
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
      setAvailableAgents(response.data.agents || []);
    } catch (error) {
      console.error("Error loading agents:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.address.area.trim()) newErrors.area = "Area is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.specifications.area.value)
      newErrors.areaValue = "Property area is required";
    if (!formData.pricing.amount) newErrors.amount = "Price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors before submitting");
      return;
    }

    try {
      setLoading(true);

      const propertyData = {
        ...formData,
        specifications: {
          ...formData.specifications,
          area: {
            ...formData.specifications.area,
            value: parseFloat(formData.specifications.area.value),
          },
          bedrooms: formData.specifications.bedrooms
            ? parseInt(formData.specifications.bedrooms)
            : null,
          bathrooms: formData.specifications.bathrooms
            ? parseInt(formData.specifications.bathrooms)
            : null,
          balconies: formData.specifications.balconies
            ? parseInt(formData.specifications.balconies)
            : null,
          parking: formData.specifications.parking
            ? parseInt(formData.specifications.parking)
            : null,
          floorsTotal: formData.specifications.floorsTotal
            ? parseInt(formData.specifications.floorsTotal)
            : null,
          floorNumber: formData.specifications.floorNumber
            ? parseInt(formData.specifications.floorNumber)
            : null,
          ageOfProperty: formData.specifications.ageOfProperty
            ? parseInt(formData.specifications.ageOfProperty)
            : null,
        },
        pricing: {
          ...formData.pricing,
          amount: parseFloat(formData.pricing.amount),
          maintenanceCharges: formData.pricing.maintenanceCharges
            ? parseFloat(formData.pricing.maintenanceCharges)
            : null,
          securityDeposit: formData.pricing.securityDeposit
            ? parseFloat(formData.pricing.securityDeposit)
            : null,
          brokerageAmount: formData.pricing.brokerageAmount
            ? parseFloat(formData.pricing.brokerageAmount)
            : null,
        },
      };

      let response;
      if (propertyId) {
        response = await propertiesAPI.updateProperty(propertyId, propertyData);
      } else {
        response = await propertiesAPI.createProperty(propertyData);
      }

      // Handle agent assignments if any
      if (formData.assignedAgents.length > 0) {
        await propertiesAPI.assignProperty(
          response.data.property._id,
          formData.assignedAgents
        );
      }

      alert(
        propertyId
          ? "Property updated successfully!"
          : "Property created successfully!"
      );
      if (onSave) onSave(response.data.property);
    } catch (error) {
      console.error("Error saving property:", error);
      alert(error.response?.data?.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    if (!propertyId) {
      alert("Please save the property first before uploading images");
      return;
    }

    try {
      setImageUploading(true);
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await propertiesAPI.uploadPropertyImages(
        propertyId,
        formData
      );

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data.images],
      }));

      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (imageIndex) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex),
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const toggleAgentAssignment = (agentId) => {
    setFormData((prev) => ({
      ...prev,
      assignedAgents: prev.assignedAgents.includes(agentId)
        ? prev.assignedAgents.filter((id) => id !== agentId)
        : [...prev.assignedAgents, agentId],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {propertyId ? "Edit Property" : "Create New Property"}
            </h1>
            <p className="text-gray-600 mt-1">
              {propertyId
                ? "Update property details and information"
                : "Add a new property to your portfolio"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${baseRoute}/properties`)}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 font-bold" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Home className="w-5 h-5 mr-2 text-blue-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter property title"
                className={`input-field ${
                  errors.title ? "border-red-300" : ""
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value,
                    subType: "",
                  }));
                }}
                className="input-field"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Type *
              </label>
              <select
                value={formData.subType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subType: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="">Select sub type</option>
                {propertyTypes[formData.type]?.map((subType) => (
                  <option key={subType} value={subType}>
                    {formatToTitleCase(subType)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
                <option value="lease">For Lease</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="input-field"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="under_negotiation">Under Negotiation</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the property in detail"
                rows={4}
                className={`input-field ${
                  errors.description ? "border-red-300" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Address Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value },
                  }))
                }
                placeholder="Enter street address"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area/Locality *
              </label>
              <input
                type="text"
                value={formData.address.area}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, area: e.target.value },
                  }))
                }
                placeholder="Enter area or locality"
                className={`input-field ${errors.area ? "border-red-300" : ""}`}
              />
              {errors.area && (
                <p className="text-red-500 text-xs mt-1">{errors.area}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                placeholder="Enter city"
                className={`input-field ${errors.city ? "border-red-300" : ""}`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value },
                  }))
                }
                placeholder="Enter state"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, pincode: e.target.value },
                  }))
                }
                placeholder="Enter pincode"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Landmark
              </label>
              <input
                type="text"
                value={formData.address.landmark}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, landmark: e.target.value },
                  }))
                }
                placeholder="Enter nearby landmark"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Ruler className="w-5 h-5 mr-2 text-purple-600" />
            Property Specifications
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={formData.specifications.area.value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specifications: {
                        ...prev.specifications,
                        area: {
                          ...prev.specifications.area,
                          value: e.target.value,
                        },
                      },
                    }))
                  }
                  placeholder="1200"
                  className={`flex-1 input-field ${
                    errors.areaValue ? "border-red-300" : ""
                  }`}
                />
                <select
                  value={formData.specifications.area.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specifications: {
                        ...prev.specifications,
                        area: {
                          ...prev.specifications.area,
                          unit: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-20 input-field"
                >
                  <option value="sqft">sqft</option>
                  <option value="sqm">sqm</option>
                  <option value="acres">acres</option>
                </select>
              </div>
              {errors.areaValue && (
                <p className="text-red-500 text-xs mt-1">{errors.areaValue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                value={formData.specifications.bedrooms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      bedrooms: e.target.value,
                    },
                  }))
                }
                placeholder="3"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                value={formData.specifications.bathrooms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      bathrooms: e.target.value,
                    },
                  }))
                }
                placeholder="2"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balconies
              </label>
              <input
                type="number"
                value={formData.specifications.balconies}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      balconies: e.target.value,
                    },
                  }))
                }
                placeholder="2"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parking Spaces
              </label>
              <input
                type="number"
                value={formData.specifications.parking}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      parking: e.target.value,
                    },
                  }))
                }
                placeholder="1"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furnished Status
              </label>
              <select
                value={formData.specifications.furnished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specifications: {
                      ...prev.specifications,
                      furnished: e.target.value,
                    },
                  }))
                }
                className="input-field"
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="semi_furnished">Semi Furnished</option>
                <option value="fully_furnished">Fully Furnished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Pricing Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                value={formData.pricing.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: { ...prev.pricing, amount: e.target.value },
                  }))
                }
                placeholder="5000000"
                className={`input-field ${
                  errors.amount ? "border-red-300" : ""
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Charges
              </label>
              <input
                type="number"
                value={formData.pricing.maintenanceCharges}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      maintenanceCharges: e.target.value,
                    },
                  }))
                }
                placeholder="5000"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit
              </label>
              <input
                type="number"
                value={formData.pricing.securityDeposit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricing: {
                      ...prev.pricing,
                      securityDeposit: e.target.value,
                    },
                  }))
                }
                placeholder="100000"
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.pricing.negotiable}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricing: {
                        ...prev.pricing,
                        negotiable: e.target.checked,
                      },
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Price Negotiable</span>
              </label>
            </div>
          </div>
        </div>

        {/* Amenities and Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Amenities & Features
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {featuresList.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Assignment */}
        {hasPermission(PERMISSIONS.MANAGE_BRANCH_PROPERTIES) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Agent Assignment ({formData.assignedAgents.length} selected)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {availableAgents.map((agent) => (
                <label
                  key={agent._id}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded border"
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedAgents.includes(agent._id)}
                    onChange={() => toggleAgentAssignment(agent._id)}
                    className="mr-3"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {agent.firstName?.[0]}
                        {agent.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatToTitleCase(agent.role)} •{" "}
                        {agent.department?.name}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-pink-600" />
            Property Images
          </h2>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={!propertyId || imageUploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {imageUploading ? "Uploading..." : "Upload Property Images"}
              </p>
              <p className="text-sm text-gray-500">
                {!propertyId
                  ? "Save property first to upload images"
                  : "Click or drag files to upload"}
              </p>
            </label>
          </div>

          {/* Image Preview */}
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {image.isMain && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Additional Options
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Virtual Tour URL
              </label>
              <input
                type="url"
                value={formData.virtualTour}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    virtualTour: e.target.value,
                  }))
                }
                placeholder="https://example.com/virtual-tour"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Preference
              </label>
              <select
                value={formData.contactPreference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactPreference: e.target.value,
                  }))
                }
                className="input-field"
              >
                <option value="both">Phone & Email</option>
                <option value="phone">Phone Only</option>
                <option value="email">Email Only</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Featured Property
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        verified: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Verified Property
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {loading
                ? "Saving..."
                : propertyId
                ? "Update Property"
                : "Create Property"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
