import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Edit, 
  MapPin, 
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Calendar,
  Target,
  Activity,
  FileText,
  Plus
} from 'lucide-react';
import { leadsAPI, agentsAPI, propertiesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Status constants based on your backend Lead model
const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'callback', label: 'Callback' },
  { value: 'schedule_meeting', label: 'Schedule Meeting' },
  { value: 'schedule_site_visit', label: 'Schedule Site Visit' },
  { value: 'expression_of_interest', label: 'Expression of Interest' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'book', label: 'Book' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'drop', label: 'Drop' }
];

const SUB_STATUS_OPTIONS = {
  callback: [
    { value: 'interested', label: 'Interested' },
    { value: 'called', label: 'Called' },
    { value: 'disconnected', label: 'Disconnected' },
    { value: 'switch_off', label: 'Switch Off' },
    { value: 'call_waiting', label: 'Call Waiting' },
    { value: 'to_schedule_meeting', label: 'To Schedule Meeting' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'plan', label: 'Plan' },
    { value: 'postpone', label: 'Postpone' },
    { value: 'to_schedule_site_visit', label: 'To Schedule Site Visit' },
    { value: 'need_more_info', label: 'Need More Info' },
    { value: 'not_answered', label: 'Not Answered' },
    { value: 'not_reachable', label: 'Not Reachable' },
    { value: 'busy', label: 'Busy' }
  ],
  schedule_meeting: [
    { value: 're', label: 'Re' },
    { value: 'f2f', label: 'F2F' },
    { value: 'first_f2f', label: 'First F2F' },
    { value: 'cold_client', label: 'Cold Client' },
    { value: 'warm_client', label: 'Warm Client' },
    { value: 'hot_client', label: 'Hot Client' }
  ],
  schedule_site_visit: [
    { value: 'cold', label: 'Cold' },
    { value: 'warm', label: 'Warm' },
    { value: 'hot', label: 'Hot' },
    { value: 'first_visit', label: 'First Visit' },
    { value: 'revisit', label: 'Revisit' }
  ],
  not_interested: [
    { value: 'different_location', label: 'Different Location' },
    { value: 'different_requirements', label: 'Different Requirements' },
    { value: 'unmatched', label: 'Unmatched' },
    { value: 'budget', label: 'Budget' }
  ],
  drop: [
    { value: 'broker', label: 'Broker' },
    { value: 'fake_lead', label: 'Fake Lead' },
    { value: 'already_booked', label: 'Already Booked' },
    { value: 'wrong_invalid_number', label: 'Wrong/Invalid Number' },
    { value: 'not_looking', label: 'Not Looking' },
    { value: 'purchased_from_others', label: 'Purchased from Others' }
  ]
};

const getStatusColor = (status) => {
  const colors = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    callback: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    schedule_meeting: 'bg-purple-100 text-purple-800 border-purple-200',
    schedule_site_visit: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    expression_of_interest: 'bg-orange-100 text-orange-800 border-orange-200',
    negotiation: 'bg-amber-100 text-amber-800 border-amber-200',
    book: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    not_interested: 'bg-red-100 text-red-800 border-red-200',
    drop: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusLabel = (status) => {
  const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-gray-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };
  return colors[priority] || 'text-gray-600';
};

const formatBudgetRange = (budget) => {
  if (!budget || (!budget.min && !budget.max)) return 'Budget not specified';
  
  const formatAmount = (amount) => {
    if (!amount) return '0';
    if (amount >= 10000000) return `₹${(amount/10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount/100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  const min = budget.min || 0;
  const max = budget.max || 0;
  
  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  } else if (max) {
    return `Up to ${formatAmount(max)}`;
  } else if (min) {
    return `From ${formatAmount(min)}`;
  }
  
  return 'Budget not specified';
};

const getRequiredFields = (status) => {
  const requiredFieldsMap = {
    schedule_meeting: ['scheduleDate'],
    schedule_site_visit: ['scheduleDate'],
    book: ['bookingUnderName', 'bookDate', 'agreementValue', 'chooseProperty', 'tokenDone']
  };
  return requiredFieldsMap[status] || [];
};

const getSubStatusOptions = (status) => {
  return SUB_STATUS_OPTIONS[status] || [];
};

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');
  
  // Status management
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    subStatus: '',
    notes: '',
    scheduleDate: '',
    bookingUnderName: '',
    bookDate: '',
    agreementValue: '',
    chooseProperty: '',
    tokenDone: false
  });
  
  // Notes 
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
    }
    fetchAgents();
    fetchProperties();
  }, [id]);

  useEffect(() => {
    if (lead) {
      setStatusFormData({
        status: lead.status,
        subStatus: lead.subStatus || '',
        notes: '',
        scheduleDate: lead.scheduleDate ? new Date(lead.scheduleDate).toISOString().slice(0, 16) : '',
        bookingUnderName: lead.bookingUnderName || '',
        bookDate: lead.bookDate ? lead.bookDate.slice(0, 10) : '',
        agreementValue: lead.agreementValue || '',
        chooseProperty: lead.chooseProperty || '',
        tokenDone: lead.tokenDone || false
      });
      
      // Set edit data
      setEditData({
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        requirements: {
          location: {
            city: lead.requirements?.location?.city || ''
          },
          budget: {
            min: lead.requirements?.budget?.min || '',
            max: lead.requirements?.budget?.max || '',
            currency: lead.requirements?.budget?.currency || 'INR'
          },
          type: lead.requirements?.type || 'residential',
          purpose: lead.requirements?.purpose || 'buy'
        },
        priority: lead.priority || 'medium',
        source: lead.source || 'website'
      });
    }
  }, [lead]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching lead details for ID:', id);
      
      const response = await leadsAPI.getLead(id);
      console.log('Lead details response:', response.data);
      
      if (response.data.lead) {
        setLead(response.data.lead);
      } else {
        setError('Lead not found');
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError('Failed to fetch lead details');
      // Don't navigate away immediately, let user see the error
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAgents({ role: 'agent' });
      console.log('Agents response:', response.data);
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };
  
  const fetchProperties = async () => {
    try {
      const response = await propertiesAPI.getProperties();
      console.log('Properties response:', response.data);
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const handleStatusFormChange = (field, value) => {
    setStatusFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear sub-status when status changes
    if (field === 'status') {
      setStatusFormData(prev => ({ ...prev, subStatus: '' }));
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      setError('');
      
      // Validate required fields
      const requiredFields = getRequiredFields(statusFormData.status);
      const missingFields = [];
      
      for (const field of requiredFields) {
        if (field === 'scheduleDate' && !statusFormData.scheduleDate) {
          missingFields.push('Schedule Date');
        } else if (field === 'bookingUnderName' && !statusFormData.bookingUnderName.trim()) {
          missingFields.push('Booking Under Name');
        } else if (field === 'bookDate' && !statusFormData.bookDate) {
          missingFields.push('Book Date');
        } else if (field === 'agreementValue' && !statusFormData.agreementValue) {
          missingFields.push('Agreement Value');
        } else if (field === 'chooseProperty' && !statusFormData.chooseProperty) {
          missingFields.push('Choose Property');
        } else if (field === 'tokenDone' && !statusFormData.tokenDone) {
          missingFields.push('Token Done');
        }
      }

      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      console.log('Updating lead status:', statusFormData);

      // Prepare update data
      const updateData = {
        status: statusFormData.status,
        subStatus: statusFormData.subStatus || undefined,
        scheduleDate: statusFormData.scheduleDate ? new Date(statusFormData.scheduleDate).toISOString() : undefined,
        bookingUnderName: statusFormData.bookingUnderName || undefined,
        bookDate: statusFormData.bookDate || undefined,
        agreementValue: statusFormData.agreementValue ? Number(statusFormData.agreementValue) : undefined,
        chooseProperty: statusFormData.chooseProperty || undefined,
        tokenDone: statusFormData.tokenDone || false
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await leadsAPI.updateLead(id, updateData);

      // Add note if provided
      if (statusFormData.notes.trim()) {
        await leadsAPI.addNoteToLead(id, statusFormData.notes.trim(), 'status_change');
      }
      
      // Refresh lead data
      await fetchLeadDetails();
      
      // Clear notes field after successful update
      setStatusFormData(prev => ({ ...prev, notes: '' }));
      
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update lead status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const submitData = {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        phone: editData.phone.trim(),
        email: editData.email?.trim() || undefined,
        priority: editData.priority,
        source: editData.source,
        requirements: {
          ...editData.requirements,
          budget: {
            min: Number(editData.requirements.budget.min) || 0,
            max: Number(editData.requirements.budget.max) || 0,
            currency: editData.requirements.budget.currency || 'INR'
          }
        }
      };

      console.log('Updating lead with data:', submitData);

      await leadsAPI.updateLead(id, submitData);
      setLead({ ...lead, ...submitData });
      setIsEditing(false);
      
      console.log('Lead updated successfully');
    } catch (error) {
      console.error('Error saving lead:', error);
      setError('Failed to update lead. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setUpdating(true);
      setError('');
      
      console.log('Adding note to lead:', newNote);
      
      await leadsAPI.addNoteToLead(id, newNote.trim(), 'general');
      setNewNote('');
      await fetchLeadDetails();
      
      console.log('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Render sub-status options as clickable buttons
  const renderSubStatusOptions = () => {
    const subStatusOptions = getSubStatusOptions(statusFormData.status);
    if (subStatusOptions.length === 0) return null;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Sub Status
        </label>
        
        {statusFormData.status === 'callback' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {subStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusFormChange('subStatus', option.value)}
                className={`p-2 text-sm rounded-lg border-2 transition-all duration-200 text-center ${
                  statusFormData.subStatus === option.value
                    ? 'border-blue-500 bg-blue-100 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {subStatusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusFormChange('subStatus', option.value)}
                className={`w-full p-3 text-sm rounded-lg border-2 transition-all duration-200 text-left ${
                  statusFormData.subStatus === option.value
                    ? 'border-blue-500 bg-blue-100 text-blue-700 font-medium'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
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

  // Render required fields for current status
  const renderRequiredFields = () => {
    const requiredFields = getRequiredFields(statusFormData.status);
    if (requiredFields.length === 0) return null;

    return (
      <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-medium text-amber-900 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Required for "{getStatusLabel(statusFormData.status)}"
        </h4>

        {requiredFields.includes('scheduleDate') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
            <input
              type="datetime-local"
              value={statusFormData.scheduleDate}
              onChange={(e) => handleStatusFormChange('scheduleDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {requiredFields.includes('bookingUnderName') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Under Name *</label>
            <input
              type="text"
              value={statusFormData.bookingUnderName}
              onChange={(e) => handleStatusFormChange('bookingUnderName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter booking name"
            />
          </div>
        )}

        {requiredFields.includes('bookDate') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book Date *</label>
            <input
              type="date"
              value={statusFormData.bookDate}
              onChange={(e) => handleStatusFormChange('bookDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {requiredFields.includes('agreementValue') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agreement Value *</label>
            <input
              type="number"
              value={statusFormData.agreementValue}
              onChange={(e) => handleStatusFormChange('agreementValue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter agreement value"
            />
          </div>
        )}

        {requiredFields.includes('chooseProperty') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Property *</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {properties.map((property) => (
                <button
                  key={property._id}
                  type="button"
                  onClick={() => handleStatusFormChange('chooseProperty', property._id)}
                  className={`w-full p-3 text-sm rounded-lg border-2 transition-all duration-200 text-left ${
                    statusFormData.chooseProperty === property._id
                      ? 'border-blue-500 bg-blue-100 text-blue-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{property.title}</div>
                  <div className="text-xs text-gray-500">{property.address?.city}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {requiredFields.includes('tokenDone') && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={statusFormData.tokenDone}
              onChange={(e) => handleStatusFormChange('tokenDone', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">Token Done *</label>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Lead</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex space-x-4">
          <button
            onClick={fetchLeadDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link
            to={user?.role === 'admin' ? '/admin/leads' : '/agent/leads'}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Not Found</h2>
        <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed.</p>
        <Link
          to={user?.role === 'admin' ? '/admin/leads' : '/agent/leads'}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(user?.role === 'admin' ? '/admin/leads' : '/agent/leads')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {lead.firstName?.[0]}{lead.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.firstName} {lead.lastName}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                  {lead.subStatus && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {lead.subStatus.replace('_', ' ')}
                    </span>
                  )}
                  <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Lead'}
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
                      <input
                        type="number"
                        value={editData.requirements?.budget?.min || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          requirements: {
                            ...editData.requirements,
                            budget: {
                              ...editData.requirements.budget,
                              min: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
                      <input
                        type="number"
                        value={editData.requirements?.budget?.max || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          requirements: {
                            ...editData.requirements,
                            budget: {
                              ...editData.requirements.budget,
                              max: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={editData.requirements?.location?.city || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          requirements: {
                            ...editData.requirements,
                            location: {
                              ...editData.requirements.location,
                              city: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({...editData, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={handleSaveEdit}
                      disabled={updating}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">{lead.phone}</p>
                        <p className="text-sm text-gray-500">Primary Phone</p>
                      </div>
                    </div>
                    
                    {lead.email && (
                      <div className="flex items-center text-gray-900">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">{lead.email}</p>
                          <p className="text-sm text-gray-500">Email Address</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-gray-900">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">{lead.requirements?.location?.city || 'Not specified'}</p>
                        <p className="text-sm text-gray-500">Preferred City</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-900">
                      <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">{formatBudgetRange(lead.requirements?.budget)}</p>
                        <p className="text-sm text-gray-500">Budget Range</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-900">
                      <Target className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium capitalize">{lead.requirements?.type} - {lead.requirements?.purpose}</p>
                        <p className="text-sm text-gray-500">Property Requirement</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-900">
                      <User className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {lead.assignedAgent ? `${lead.assignedAgent.firstName} ${lead.assignedAgent.lastName}` : 'Not assigned'}
                        </p>
                        <p className="text-sm text-gray-500">Assigned Agent</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes ({lead.notes?.length || 0})</h3>
              
              {/* Add Note */}
              <div className="space-y-3 mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this lead..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={updating || !newNote.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {updating ? 'Adding...' : 'Add Note'}
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {lead.notes?.map((note, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{note.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>By {note.createdBy?.firstName} {note.createdBy?.lastName}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {(!lead.notes || lead.notes.length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href={`tel:${lead.phone}`}
                  className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-3 text-green-600" />
                  <span>Call {lead.firstName}</span>
                </a>
                
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-3 text-blue-600" />
                    <span>Send Email</span>
                  </a>
                )}
                
                <button className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Status Management
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Current Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Current Status</label>
                  <select
                    value={statusFormData.status}
                    onChange={(e) => handleStatusFormChange('status', e.target.value)}
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

                {/* Add Note Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Note</label>
                  <textarea
                    value={statusFormData.notes}
                    onChange={(e) => handleStatusFormChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Add notes about this status change..."
                  />
                </div>

                {/* Update Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Status...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Contact</span>
                  <span className="text-sm font-medium">
                    {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Source</span>
                  <span className="text-sm font-medium capitalize">
                    {lead.source}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Notes</span>
                  <span className="text-sm font-medium">
                    {lead.notes?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;