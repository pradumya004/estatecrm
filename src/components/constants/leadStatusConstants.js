import React from 'react';

// Lead status constants matching your backend exactly
export const LEAD_STATUSES = {
  NEW: 'new',
  CALLBACK: 'callback',
  SCHEDULE_MEETING: 'schedule_meeting',
  SCHEDULE_SITE_VISIT: 'schedule_site_visit', 
  EXPRESSION_OF_INTEREST: 'expression_of_interest',
  NEGOTIATION: 'negotiation',
  BOOK: 'book',
  NOT_INTERESTED: 'not_interested',
  DROP: 'drop'
};

// Status display labels
export const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'callback': 'Callback',
    'schedule_meeting': 'Schedule Meeting',
    'schedule_site_visit': 'Schedule Site Visit',
    'expression_of_interest': 'Expression of Interest', 
    'negotiation': 'Negotiation',
    'book': 'Book',
    'not_interested': 'Not Interested',
    'drop': 'Drop'
  };
  return labels[status] || status;
};

// Status color classes
export const getStatusColor = (status) => {
  const colors = {
    'new': 'bg-blue-100 text-blue-800 border-blue-200',
    'callback': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'schedule_meeting': 'bg-purple-100 text-purple-800 border-purple-200',
    'schedule_site_visit': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'expression_of_interest': 'bg-green-100 text-green-800 border-green-200',
    'negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
    'book': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'not_interested': 'bg-gray-100 text-gray-800 border-gray-200',
    'drop': 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Main status options for dropdowns
export const LEAD_STATUS_OPTIONS = [
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

// Sub-status options based on main status (matching your backend enum)
export const getSubStatusOptions = (status) => {
  const subStatusMap = {
    'callback': [
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
    'schedule_meeting': [
      { value: 're', label: 'RE' },
      { value: 'f2f', label: 'F2F' },
      { value: 'first_f2f', label: 'First F2F' },
      { value: 'cold_client', label: 'Cold Client' },
      { value: 'warm_client', label: 'Warm Client' },
      { value: 'hot_client', label: 'Hot Client' }
    ],
    'schedule_site_visit': [
      { value: 'cold', label: 'Cold' },
      { value: 'warm', label: 'Warm' },
      { value: 'hot', label: 'Hot' },
      { value: 'first_visit', label: 'First Visit' },
      { value: 'revisit', label: 'Revisit' }
    ],
    'not_interested': [
      { value: 'different_location', label: 'Different Location' },
      { value: 'different_requirements', label: 'Different Requirements' },
      { value: 'unmatched', label: 'Unmatched' },
      { value: 'budget', label: 'Budget' }
    ],
    'drop': [
      { value: 'broker', label: 'Broker' },
      { value: 'fake_lead', label: 'Fake Lead' },
      { value: 'already_booked', label: 'Already Booked' },
      { value: 'wrong_invalid_number', label: 'Wrong/Invalid Number' },
      { value: 'not_looking', label: 'Not Looking' },
      { value: 'purchased_from_others', label: 'Purchased from Others' }
    ]
  };
  
  return subStatusMap[status] || [];
};

// Get required fields for each status (matching your backend schema)
export const getRequiredFields = (status) => {
  const requiredFieldsMap = {
    'schedule_meeting': ['scheduleDate'],
    'schedule_site_visit': ['scheduleDate'],
    'book': ['bookingUnderName', 'bookDate', 'agreementValue', 'chooseProperty', 'tokenDone'],
    // Add other status requirements as needed
  };
  
  return requiredFieldsMap[status] || [];
};

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
];

// Source options
export const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk_in', label: 'Walk In' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'other', label: 'Other' }
];

// Property type options
export const PROPERTY_TYPE_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Land' }
];

// Purpose options
export const PURPOSE_OPTIONS = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Lease' }
];

// Utility functions
export const formatBudgetRange = (budget) => {
  if (!budget || !budget.min || !budget.max) return 'Budget not specified';
  
  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount/10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount/100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  return `${formatAmount(budget.min)} - ${formatAmount(budget.max)}`;
};

export const getPriorityColor = (priority) => {
  const option = PRIORITY_OPTIONS.find(p => p.value === priority);
  return option ? option.color : 'text-gray-600';
};

export default {
  LEAD_STATUSES,
  LEAD_STATUS_OPTIONS,
  getStatusLabel,
  getStatusColor,
  getSubStatusOptions,
  getRequiredFields,
  PRIORITY_OPTIONS,
  SOURCE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  formatBudgetRange,
  getPriorityColor
};