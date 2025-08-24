import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  X, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Car, 
  Square, 
  DollarSign,
  Star,
  Eye,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Move,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { propertiesAPI, agentsAPI } from '../../services/api';

const PropertyForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'residential',
    subType: '',
    category: 'sale',
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    },
    specifications: {
      bedrooms: '',
      bathrooms: '',
      area: {
        value: '',
        unit: 'sqft'
      },
      parking: 0,
      furnishing: 'unfurnished',
      floor: '',
      totalFloors: '',
      facing: '',
      balconies: 0,
      age: '',
      possession: 'ready'
    },
    pricing: {
      amount: '',
      negotiable: true,
      maintenance: '',
      securityDeposit: '',
      brokerageType: 'percentage',
      brokerage: ''
    },
    amenities: [],
    nearbyFacilities: [],
    status: 'available',
    featured: false,
    virtualTour: '',
    floorPlan: ''
  });

  const [propertyImages, setPropertyImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info },
    { id: 2, title: 'Location', icon: MapPin },
    { id: 3, title: 'Details', icon: Home },
    { id: 4, title: 'Pricing', icon: DollarSign },
    { id: 5, title: 'Media', icon: Camera }
  ];

  const amenitiesList = [
    'Swimming Pool', 'Gym', 'Parking', 'Security', 'Power Backup',
    'Lift', 'Garden', 'Playground', 'Clubhouse', 'Internet',
    'Air Conditioning', 'Modular Kitchen', 'Furnished',
    'Water Supply', 'Sewage Treatment', 'Fire Safety'
  ];

  const nearbyFacilitiesList = [
    'Schools', 'Hospitals', 'Shopping Malls', 'Metro Station',
    'Bus Stop', 'Airport', 'Railway Station', 'Banks',
    'Restaurants', 'Parks', 'Temple', 'Market'
  ];

  useEffect(() => {
    fetchAgents();
    if (isEditing) {
      // Fetch property data for editing
      fetchPropertyData();
    }
  }, [id, isEditing]);

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAgents({ role: 'agent' });
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchPropertyData = async () => {
    // Implementation for fetching existing property data
    // This would typically call propertiesAPI.getProperty(id)
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = finalValue;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (arrayName, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].includes(value)
        ? prev[arrayName].filter(item => item !== value)
        : [...prev[arrayName], value]
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setPropertyImages(prev => [...prev, ...files]);

    // Create previews
    const newPreviews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then(previews => {
      setImagePreviews(prev => [...prev, ...previews]);
    });
  };

  const removeImage = (index) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.subType.trim()) errors.subType = 'Sub type is required';
        break;
      case 2:
        if (!formData.address.street.trim()) errors['address.street'] = 'Street address is required';
        if (!formData.address.area.trim()) errors['address.area'] = 'Area is required';
        if (!formData.address.city.trim()) errors['address.city'] = 'City is required';
        if (!formData.address.pincode.trim()) errors['address.pincode'] = 'Pincode is required';
        break;
      case 3:
                if (formData.type === 'residential' && !formData.specifications.bedrooms) {
          errors['specifications.bedrooms'] = 'Bedrooms is required for residential properties';
        }
        if (!formData.specifications.area.value) {
          errors['specifications.area.value'] = 'Area is required';
        }
        break;
      case 4:
        if (!formData.pricing.amount) errors['pricing.amount'] = 'Price is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= steps.length - 1; i++) {
      if (!validateStep(i)) {
        allValid = false;
        break;
      }
    }
    
    if (!allValid) {
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    try {
      let property;
      if (isEditing) {
        property = await propertiesAPI.updateProperty(id, formData);
      } else {
        property = await propertiesAPI.createProperty(formData);
      }

      // Upload property images if provided
      if (propertyImages.length > 0 && property.data.property._id) {
        const imageFormData = new FormData();
        propertyImages.forEach((image, index) => {
          imageFormData.append('images', image);
          if (index === mainImageIndex) {
            imageFormData.append('mainImageIndex', index);
          }
        });
        await propertiesAPI.uploadPropertyImages(property.data.property._id, imageFormData);
      }

      navigate('/admin/properties');
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Basic Property Information</h3>
              <p className="text-sm text-blue-700">Provide the fundamental details about your property</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`input-field ${validationErrors.title ? 'input-field-error' : ''}`}
                  placeholder="e.g., 3BHK Luxury Apartment in Downtown"
                />
                {validationErrors.title && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
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
                <input
                  type="text"
                  name="subType"
                  value={formData.subType}
                  onChange={handleInputChange}
                  className={`input-field ${validationErrors.subType ? 'input-field-error' : ''}`}
                  placeholder="e.g., Apartment, Villa, Office Space"
                />
                {validationErrors.subType && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.subType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Type *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="under_negotiation">Under Negotiation</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`input-field ${validationErrors.description ? 'input-field-error' : ''}`}
                  placeholder="Provide a detailed description of the property..."
                />
                {validationErrors.description && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Mark as Featured Property
                  </label>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Property Location</h3>
              <p className="text-sm text-green-700">Accurate location helps buyers find your property easily</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className={`input-field ${validationErrors['address.street'] ? 'input-field-error' : ''}`}
                  placeholder="Enter complete street address"
                />
                {validationErrors['address.street'] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors['address.street']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area/Locality *
                </label>
                <input
                  type="text"
                  name="address.area"
                  value={formData.address.area}
                  onChange={handleInputChange}
                  className={`input-field ${validationErrors['address.area'] ? 'input-field-error' : ''}`}
                  placeholder="e.g., Bandra West, Andheri East"
                />
                {validationErrors['address.area'] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors['address.area']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className={`input-field ${validationErrors['address.city'] ? 'input-field-error' : ''}`}
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
                {validationErrors['address.city'] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors['address.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Maharashtra, Delhi, Karnataka"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  pattern="[0-9]{6}"
                  className={`input-field ${validationErrors['address.pincode'] ? 'input-field-error' : ''}`}
                  placeholder="6-digit pincode"
                />
                {validationErrors['address.pincode'] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors['address.pincode']}</p>
                )}
              </div>
            </div>

            {/* Nearby Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nearby Facilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {nearbyFacilitiesList.map((facility) => (
                  <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nearbyFacilities.includes(facility)}
                      onChange={() => handleArrayChange('nearbyFacilities', facility)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{facility}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">Property Specifications</h3>
              <p className="text-sm text-purple-700">Detailed specifications help buyers understand the property better</p>
            </div>

            {/* Basic Specifications */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.type === 'residential' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bed className="w-4 h-4 inline mr-1" />
                        Bedrooms *
                      </label>
                      <input
                        type="number"
                        name="specifications.bedrooms"
                        value={formData.specifications.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        className={`input-field ${validationErrors['specifications.bedrooms'] ? 'input-field-error' : ''}`}
                      />
                      {validationErrors['specifications.bedrooms'] && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors['specifications.bedrooms']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Bath className="w-4 h-4 inline mr-1" />
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="specifications.bathrooms"
                        value={formData.specifications.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                        max="20"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Balconies
                      </label>
                      <input
                        type="number"
                        name="specifications.balconies"
                        value={formData.specifications.balconies}
                        onChange={handleInputChange}
                        min="0"
                        max="10"
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Square className="w-4 h-4 inline mr-1" />
                    Area *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="specifications.area.value"
                      value={formData.specifications.area.value}
                      onChange={handleInputChange}
                      className={`input-field flex-1 ${validationErrors['specifications.area.value'] ? 'input-field-error' : ''}`}
                    />
                    <select
                      name="specifications.area.unit"
                      value={formData.specifications.area.unit}
                      onChange={handleInputChange}
                      className="input-field w-20"
                    >
                      <option value="sqft">Sq Ft</option>
                      <option value="sqm">Sq M</option>
                      <option value="sqyd">Sq Yd</option>
                    </select>
                  </div>
                  {validationErrors['specifications.area.value'] && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors['specifications.area.value']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Car className="w-4 h-4 inline mr-1" />
                    Parking
                  </label>
                  <input
                    type="number"
                    name="specifications.parking"
                    value={formData.specifications.parking}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor
                  </label>
                  <input
                    type="text"
                    name="specifications.floor"
                    value={formData.specifications.floor}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 5, Ground, Basement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    name="specifications.totalFloors"
                    value={formData.specifications.totalFloors}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facing
                  </label>
                  <select
                    name="specifications.facing"
                    value={formData.specifications.facing}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Facing</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                    <option value="north-east">North-East</option>
                    <option value="north-west">North-West</option>
                    <option value="south-east">South-East</option>
                    <option value="south-west">South-West</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Age
                  </label>
                  <select
                    name="specifications.age"
                    value={formData.specifications.age}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Age</option>
                    <option value="new">New/Under Construction</option>
                    <option value="1-2">1-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5-10">5-10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Possession
                  </label>
                  <select
                    name="specifications.possession"
                    value={formData.specifications.possession}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="ready">Ready to Move</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="resale">Resale</option>
                  </select>
                </div>

                {formData.type === 'residential' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Furnishing
                    </label>
                    <select
                      name="specifications.furnishing"
                      value={formData.specifications.furnishing}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi_furnished">Semi Furnished</option>
                      <option value="fully_furnished">Fully Furnished</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleArrayChange('amenities', amenity)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-medium text-yellow-900 mb-2">Pricing Information</h3>
              <p className="text-sm text-yellow-700">Set competitive pricing to attract potential buyers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price *
                </label>
                <input
                  type="number"
                  name="pricing.amount"
                  value={formData.pricing.amount}
                  onChange={handleInputChange}
                  min="0"
                  className={`input-field ${validationErrors['pricing.amount'] ? 'input-field-error' : ''}`}
                  placeholder="Enter amount in ₹"
                />
                {validationErrors['pricing.amount'] && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors['pricing.amount']}</p>
                )}
              </div>

              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="pricing.negotiable"
                  checked={formData.pricing.negotiable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Price Negotiable
                </label>
              </div>

              {formData.category === 'rent' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance (Monthly)
                    </label>
                    <input
                      type="number"
                      name="pricing.maintenance"
                      value={formData.pricing.maintenance}
                      onChange={handleInputChange}
                      min="0"
                      className="input-field"
                      placeholder="Enter maintenance amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit
                    </label>
                    <input
                      type="number"
                      name="pricing.securityDeposit"
                      value={formData.pricing.securityDeposit}
                      onChange={handleInputChange}
                      min="0"
                      className="input-field"
                      placeholder="Enter security deposit"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brokerage Type
                </label>
                <select
                  name="pricing.brokerageType"
                  value={formData.pricing.brokerageType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="no-brokerage">No Brokerage</option>
                </select>
              </div>

              {formData.pricing.brokerageType !== 'no-brokerage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brokerage {formData.pricing.brokerageType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    name="pricing.brokerage"
                    value={formData.pricing.brokerage}
                    onChange={handleInputChange}
                    min="0"
                    className="input-field"
                    placeholder={formData.pricing.brokerageType === 'percentage' ? 'e.g., 1, 2, 3' : 'Enter amount'}
                  />
                </div>
              )}
            </div>

            {/* Price Calculator */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">₹{formData.pricing.amount ? Number(formData.pricing.amount).toLocaleString() : '0'}</span>
                </div>
                {formData.category === 'rent' && formData.pricing.maintenance && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Maintenance:</span>
                    <span className="font-medium">₹{Number(formData.pricing.maintenance).toLocaleString()}</span>
                  </div>
                )}
                {formData.specifications.area.value && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per {formData.specifications.area.unit}:</span>
                    <span className="font-medium">
                      ₹{formData.pricing.amount ? Math.round(formData.pricing.amount / formData.specifications.area.value).toLocaleString() : '0'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h3 className="font-medium text-red-900 mb-2">Property Media</h3>
              <p className="text-sm text-red-700">High-quality images help attract more buyers</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Property Images
              </label>
              
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload images or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB each</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImagesChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className={`w-full h-32 object-cover rounded-lg border-2 ${
                            index === mainImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setMainImageIndex(index)}
                              className="p-1 bg-white rounded text-blue-600 hover:bg-blue-50"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 bg-white rounded text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {index === mainImageIndex && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Virtual Tour & Floor Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Virtual Tour URL
                </label>
                <input
                  type="url"
                  name="virtualTour"
                  value={formData.virtualTour}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">Link to 360° virtual tour or video</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Plan URL
                </label>
                <input
                  type="url"
                  name="floorPlan"
                  value={formData.floorPlan}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">Link to floor plan image or document</p>
              </div>
            </div>

            {/* Media Guidelines */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Media Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Upload at least 5-10 high-quality images</li>
                <li>• Include photos of all rooms, exterior, and common areas</li>
                <li>• Ensure good lighting and clear, uncluttered shots</li>
                <li>• Set the most attractive image as the main image</li>
                <li>• Virtual tours increase engagement by 40%</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/properties')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update property details' : 'Create a comprehensive property listing'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Property' : 'Create Property'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                      'bg-gray-100 border-gray-300 text-gray-600'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 
                      isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4 transition-all duration-200
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                  `}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
       <form onSubmit={(e) => e.preventDefault()}>
          <div className="p-8">
            {renderStepContent()}
          </div>
{/* Navigation - CORRECTED PART */}
          <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {steps.slice(0, -1).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Property' : 'Create Property'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-3">💡 Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-1">Better Listings Get More Views:</p>
            <ul className="space-y-1">
              <li>• Add detailed descriptions</li>
              <li>• Include high-quality photos</li>
              <li>• Set competitive pricing</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Increase Lead Generation:</p>
            <ul className="space-y-1">
              <li>• Mark as featured for premium placement</li>
              <li>• Add virtual tour links</li>
              <li>• Include nearby facilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;