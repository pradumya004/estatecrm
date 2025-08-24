import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { leadsAPI, agentsAPI } from '../../services/api';
import { 
  LEAD_STATUSES, 
  LEAD_STATUS_OPTIONS, 
  getSubStatusOptions, 
  getRequiredFields 
} from '../constants/leadStatusConstants';

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    // Minimal required fields only
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+91',
    city: '',
    budget: '',
    purpose: 'buy',
    type: 'residential',
    status: LEAD_STATUSES.NEW,
    priority: 'medium',
    source: 'walk_in',
    subStatus: '',
    // Status-specific fields
    scheduleDate: '',
    assignedAgent: '',
    notes: '',
    bookingUnderName: '',
    bookDate: '',
    agreementValue: '',
    chooseProperty: '',
    tokenDone: false
  });

  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAgents();
    fetchProperties();
    if (isEditing) {
      fetchLeadData();
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

  const fetchProperties = async () => {
    try {
      setProperties([
        { _id: '1', title: 'Luxury Apartment in Bandra', location: 'Bandra West' },
        { _id: '2', title: 'Commercial Space in Andheri', location: 'Andheri East' },
        { _id: '3', title: 'Villa in Juhu', location: 'Juhu' },
        { _id: '4', title: 'Office Space in Lower Parel', location: 'Lower Parel' },
        { _id: '5', title: 'Penthouse in Worli', location: 'Worli' }
      ]);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getLead(id);
      const leadData = response.data.lead;
      
      setFormData({
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        phone: leadData.phone || '',
        countryCode: leadData.countryCode || '+91',
        city: leadData.requirements?.location?.city || '',
        budget: leadData.requirements?.budget?.max || '',
        purpose: leadData.requirements?.purpose || 'buy',
        type: leadData.requirements?.type || 'residential',
        status: leadData.status || LEAD_STATUSES.NEW,
        priority: leadData.priority || 'medium',
        source: leadData.source || 'walk_in',
        subStatus: leadData.subStatus || '',
        scheduleDate: leadData.scheduleDate ? new Date(leadData.scheduleDate).toISOString().slice(0, 16) : '',
        assignedAgent: leadData.assignedAgent?._id || '',
        notes: leadData.notes?.length > 0 ? leadData.notes[0].content : '',
        bookingUnderName: leadData.bookingUnderName || '',
        bookDate: leadData.bookDate ? leadData.bookDate.slice(0, 10) : '',
        agreementValue: leadData.agreementValue || '',
        chooseProperty: leadData.chooseProperty || '',
        tokenDone: leadData.tokenDone || false
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear sub-status when status changes
    if (name === 'status') {
      setFormData(prev => ({ ...prev, subStatus: '' }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (!formData.budget) newErrors.budget = 'Budget required';

    // Status-specific validation
    const requiredFields = getRequiredFields(formData.status);
    
    if (requiredFields.includes('assignedTo') && !formData.assignedAgent) {
      newErrors.assignedAgent = 'Agent required for this status';
    }
    if (requiredFields.includes('scheduleDate') && !formData.scheduleDate) {
      newErrors.scheduleDate = 'Schedule date required';
    }
    if (requiredFields.includes('bookingUnderName') && !formData.bookingUnderName.trim()) {
      newErrors.bookingUnderName = 'Booking name required';
    }
    if (requiredFields.includes('bookDate') && !formData.bookDate) {
      newErrors.bookDate = 'Book date required';
    }
    if (requiredFields.includes('agreementValue') && !formData.agreementValue) {
      newErrors.agreementValue = 'Agreement value required';
    }
    if (requiredFields.includes('chooseProperty') && !formData.chooseProperty) {
      newErrors.chooseProperty = 'Property selection required';
    }
    if (requiredFields.includes('notes') && !formData.notes.trim()) {
      newErrors.notes = 'Notes required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        countryCode: formData.countryCode,
        status: formData.status,
        priority: formData.priority,
        source: formData.source,
        subStatus: formData.subStatus,
        requirements: {
          type: formData.type,
          purpose: formData.purpose,
          budget: {
            min: Math.round(Number(formData.budget) * 0.8),
            max: Number(formData.budget),
            currency: 'INR'
          },
          location: {
            city: formData.city.trim()
          }
        }
      };

      // Add status-specific fields
      if (formData.scheduleDate) {
        submitData.scheduleDate = new Date(formData.scheduleDate).toISOString();
      }
      if (formData.assignedAgent) {
        submitData.assignedAgent = formData.assignedAgent;
      }
      if (formData.bookingUnderName?.trim()) {
        submitData.bookingUnderName = formData.bookingUnderName.trim();
      }
      if (formData.bookDate) {
        submitData.bookDate = formData.bookDate;
      }
      if (formData.agreementValue) {
        submitData.agreementValue = Number(formData.agreementValue);
      }
      if (formData.chooseProperty) {
        submitData.chooseProperty = formData.chooseProperty;
      }
      submitData.tokenDone = formData.tokenDone;

      // Add notes if provided
      if (formData.notes && formData.notes.trim()) {
        submitData.notes = formData.notes.trim();
      }

      if (isEditing) {
        await leadsAPI.updateLead(id, submitData);
      } else {
        await leadsAPI.createLead(submitData);
      }
      
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      setErrors({ submit: 'Failed to save lead. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Render sub-status options as buttons/cards
  const renderSubStatusOptions = () => {
    const subStatusOptions = getSubStatusOptions(formData.status);
    if (subStatusOptions.length === 0) return null;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          Choose Sub Status {getRequiredFields(formData.status).includes('notes') && <span className="text-red-500">*</span>}
        </label>
        
        {/* Special layout for Callback status - Grid */}
        {formData.status === LEAD_STATUSES.CALLBACK ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subStatus: option.value }))}
                className={`p-3 text-sm rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.subStatus === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          // Regular layout for other statuses - Vertical buttons
          <div className="space-y-2">
            {subStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subStatus: option.value }))}
                className={`w-full p-3 text-sm rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.subStatus === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render status-specific required fields
  const renderRequiredFields = () => {
    const requiredFields = getRequiredFields(formData.status);
    if (requiredFields.length === 0) return null;

    return (
      <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h4 className="font-medium text-yellow-900 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Required for "{formData.status.replace('_', ' ')}" status
        </h4>

        {requiredFields.includes('assignedTo') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Agent *</label>
            <select
              name="assignedAgent"
              value={formData.assignedAgent}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.assignedAgent ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
            {errors.assignedAgent && (
              <p className="text-red-600 text-sm mt-1">{errors.assignedAgent}</p>
            )}
          </div>
        )}

        {requiredFields.includes('scheduleDate') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
            <input
              type="datetime-local"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.scheduleDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.scheduleDate && (
              <p className="text-red-600 text-sm mt-1">{errors.scheduleDate}</p>
            )}
          </div>
        )}

        {requiredFields.includes('bookingUnderName') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Under Name *</label>
            <input
              type="text"
              name="bookingUnderName"
              value={formData.bookingUnderName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.bookingUnderName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter booking name"
            />
            {errors.bookingUnderName && (
              <p className="text-red-600 text-sm mt-1">{errors.bookingUnderName}</p>
            )}
          </div>
        )}

        {requiredFields.includes('bookDate') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Date *</label>
            <input
              type="date"
              name="bookDate"
              value={formData.bookDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.bookDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.bookDate && (
              <p className="text-red-600 text-sm mt-1">{errors.bookDate}</p>
            )}
          </div>
        )}

        {requiredFields.includes('agreementValue') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agreement Value *</label>
            <input
              type="number"
              name="agreementValue"
              value={formData.agreementValue}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.agreementValue ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter agreement value"
            />
            {errors.agreementValue && (
              <p className="text-red-600 text-sm mt-1">{errors.agreementValue}</p>
            )}
          </div>
        )}

        {requiredFields.includes('chooseProperty') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Property *</label>
            <select
              name="chooseProperty"
              value={formData.chooseProperty}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.chooseProperty ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.title} - {property.location}
                </option>
              ))}
            </select>
            {errors.chooseProperty && (
              <p className="text-red-600 text-sm mt-1">{errors.chooseProperty}</p>
            )}
          </div>
        )}

        {requiredFields.includes('tokenDone') && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="tokenDone"
              checked={formData.tokenDone}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Token Done *</label>
          </div>
        )}

        {requiredFields.includes('notes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes *</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Add notes about this status..."
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/leads')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Lead' : 'Add New Lead'}
          </h1>
          <p className="text-gray-600 mt-1">Quick and simple lead entry</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number *
                </label>
                <div className="flex">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 w-20"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border-t border-r border-b rounded-r-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Mumbai"
                  />
                  {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Budget *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.budget ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 5000000"
                  />
                  {errors.budget && <p className="text-red-600 text-sm mt-1">{errors.budget}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Status Management</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Lead Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub Status Options */}
              {renderSubStatusOptions()}

              {/* Required Fields */}
              {renderRequiredFields()}
            </div>

            {/* Submit */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update Lead' : 'Create Lead'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/leads')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Only essential fields are required for quick lead entry</li>
            <li>• Different statuses will show relevant sub-options automatically</li>
            <li>• Some statuses require additional information (shown in yellow box)</li>
            <li>• You can always edit and add more details later</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;