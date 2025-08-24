import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare,
  Video,
  Star,
  Target,
  TrendingUp,
  DollarSign,
  MapPin,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Timer,
  Zap,
  Activity,
  BarChart3,
  Award,
  ArrowUpRight,
  Heart,
  Share2,
  Archive,
  PhoneCall,
  Send,
  FileText,
  Save,
  X,
  MoreVertical,
  Bell,
  Paperclip,
  Mic,
  History,
  RefreshCw,
  Settings,
  Flag,
  Tag,
  Calendar as CalendarIcon,
  Trophy
} from 'lucide-react';
import { leadsAPI, agentsAPI } from '../../services/api';

const LeadManagementSystem = () => {
  // Core State Management
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    subStatus: 'all',
    priority: 'all',
    source: 'all',
    assignedAgent: 'all',
    dateRange: 'all',
    followUpStatus: 'all'
  });
  
  // View & Interaction State
  const [viewMode, setViewMode] = useState('cards');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal & Form State
  const [showQuickActions, setShowQuickActions] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // Form Data
  const [statusUpdate, setStatusUpdate] = useState({
    leadId: null,
    status: '',
    subStatus: '',
    reason: '',
    nextAction: '',
    followUpDate: ''
  });
  
  const [noteData, setNoteData] = useState({
    leadId: null,
    content: '',
    type: 'general',
    isPrivate: false
  });
  
  const [followUpData, setFollowUpData] = useState({
    leadId: null,
    type: 'call',
    scheduledFor: '',
    description: '',
    priority: 'medium'
  });
  
  const [callData, setCallData] = useState({
    leadId: null,
    duration: '',
    outcome: '',
    notes: '',
    nextAction: ''
  });

  // Stats State
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    hot: 0,
    overdue: 0,
    thisWeek: 0,
    conversion: 0
  });

  // Refs
  const statusModalRef = useRef(null);
  const noteModalRef = useRef(null);

  // Status and SubStatus Definitions
  const statusDefinitions = {
    new: {
      label: 'New',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Star,
      subStatuses: [
        { key: 'fresh', label: 'Fresh Lead' },
        { key: 'callback_requested', label: 'Callback Requested' },
        { key: 'information_requested', label: 'Information Requested' }
      ]
    },
    contacted: {
      label: 'Contacted',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: PhoneCall,
      subStatuses: [
        { key: 'call_answered', label: 'Call Answered' },
        { key: 'call_not_answered', label: 'Call Not Answered' },
        { key: 'callback_scheduled', label: 'Callback Scheduled' },
        { key: 'email_sent', label: 'Email Sent' },
        { key: 'whatsapp_sent', label: 'WhatsApp Sent' }
      ]
    },
    qualified: {
      label: 'Qualified',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      subStatuses: [
        { key: 'requirements_understood', label: 'Requirements Clear' },
        { key: 'budget_confirmed', label: 'Budget Confirmed' },
        { key: 'timeline_confirmed', label: 'Timeline Confirmed' },
        { key: 'decision_maker_identified', label: 'Decision Maker ID' }
      ]
    },
    site_visit_scheduled: {
      label: 'Site Visit Scheduled',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: CalendarIcon,
      subStatuses: [
        { key: 'visit_confirmed', label: 'Visit Confirmed' },
        { key: 'visit_rescheduled', label: 'Visit Rescheduled' },
        { key: 'documents_shared', label: 'Documents Shared' }
      ]
    },
    site_visit_completed: {
      label: 'Site Visit Done',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: MapPin,
      subStatuses: [
        { key: 'very_interested', label: 'Very Interested' },
        { key: 'interested', label: 'Interested' },
        { key: 'thinking', label: 'Thinking' },
        { key: 'not_interested', label: 'Not Interested' }
      ]
    },
    proposal_sent: {
      label: 'Proposal Sent',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: FileText,
      subStatuses: [
        { key: 'proposal_shared', label: 'Proposal Shared' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'feedback_received', label: 'Feedback Received' },
        { key: 'revision_requested', label: 'Revision Requested' }
      ]
    },
    negotiation: {
      label: 'Negotiation',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: DollarSign,
      subStatuses: [
        { key: 'price_negotiation', label: 'Price Negotiation' },
        { key: 'terms_discussion', label: 'Terms Discussion' },
        { key: 'payment_plan_discussion', label: 'Payment Discussion' },
        { key: 'final_approval_pending', label: 'Final Approval' }
      ]
    },
    deal_closed: {
      label: 'Deal Closed',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Trophy,
      subStatuses: [
        { key: 'token_received', label: 'Token Received' },
        { key: 'agreement_signed', label: 'Agreement Signed' },
        { key: 'payment_completed', label: 'Payment Completed' },
        { key: 'possession_given', label: 'Possession Given' }
      ]
    },
    lost: {
      label: 'Lost',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: X,
      subStatuses: [
        { key: 'budget_mismatch', label: 'Budget Mismatch' },
        { key: 'location_issue', label: 'Location Issue' },
        { key: 'timeline_mismatch', label: 'Timeline Issue' },
        { key: 'competitor', label: 'Lost to Competitor' },
        { key: 'not_serious', label: 'Not Serious' }
      ]
    },
    follow_up: {
      label: 'Follow Up',
      color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: Clock,
      subStatuses: [
        { key: 'weekly_followup', label: 'Weekly Follow-up' },
        { key: 'monthly_followup', label: 'Monthly Follow-up' },
        { key: 'quarterly_followup', label: 'Quarterly Follow-up' },
        { key: 'nurturing', label: 'Nurturing' }
      ]
    }
  };

  // Lead Priority Definitions
  const priorityDefinitions = {
    urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50' },
    high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-50' }
  };

  // Initialize data
  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, []);

  // Filter and sort leads when dependencies change
  useEffect(() => {
    filterAndSortLeads();
  }, [leads, searchQuery, filters, sortBy, sortOrder]);

  // Calculate stats when leads change
  useEffect(() => {
    calculateStats();
  }, [leads]);

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getLeads({
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.data.leads) {
        // Enhance leads with calculated fields
        const enhancedLeads = response.data.leads.map(lead => ({
          ...lead,
          score: calculateLeadScore(lead),
          nextActionDue: getNextActionDue(lead),
          isOverdue: isFollowUpOverdue(lead),
          lastActivity: getLastActivity(lead),
          daysSinceCreated: getDaysSince(lead.createdAt),
          daysSinceLastContact: lead.lastContactDate ? getDaysSince(lead.lastContactDate) : null
        }));
        
        setLeads(enhancedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const response = await agentsAPI.getAgents({ role: 'agent' });
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Calculate lead score based on various factors
  const calculateLeadScore = (lead) => {
    let score = 50; // Base score
    
    // Budget factor
    if (lead.requirements?.budget?.max > 5000000) score += 20;
    else if (lead.requirements?.budget?.max > 2000000) score += 10;
    
    // Urgency factor
    if (lead.priority === 'urgent') score += 25;
    else if (lead.priority === 'high') score += 15;
    else if (lead.priority === 'medium') score += 5;
    
    // Engagement factor
    if (lead.status === 'qualified') score += 20;
    else if (lead.status === 'contacted') score += 10;
    
    // Recency factor
    const daysSinceCreated = getDaysSince(lead.createdAt);
    if (daysSinceCreated <= 1) score += 15;
    else if (daysSinceCreated <= 7) score += 10;
    else if (daysSinceCreated <= 30) score += 5;
    
    // Source factor
    if (lead.source === 'referral') score += 15;
    else if (lead.source === 'website') score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  // Get next action due date
  const getNextActionDue = (lead) => {
    if (lead.nextFollowUpDate) return lead.nextFollowUpDate;
    
    // Calculate based on status
    const now = new Date();
    switch (lead.status) {
      case 'new':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'contacted':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'qualified':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  };

  // Check if follow-up is overdue
  const isFollowUpOverdue = (lead) => {
    const nextAction = getNextActionDue(lead);
    return new Date() > new Date(nextAction);
  };

  // Get last activity
  const getLastActivity = (lead) => {
    if (lead.lastContactDate) return lead.lastContactDate;
    return lead.createdAt;
  };

  // Get days since a date
  const getDaysSince = (date) => {
    const now = new Date();
    const target = new Date(date);
    return Math.floor((now - target) / (1000 * 60 * 60 * 24));
  };

  // Filter and sort leads
  const filterAndSortLeads = () => {
    let filtered = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.fullName?.toLowerCase().includes(query) ||
        lead.firstName?.toLowerCase().includes(query) ||
        lead.lastName?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.requirements?.location?.city?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // SubStatus filter
    if (filters.subStatus !== 'all') {
      filtered = filtered.filter(lead => lead.subStatus === filters.subStatus);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(lead => lead.priority === filters.priority);
    }

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === filters.source);
    }

    // Agent filter
    if (filters.assignedAgent !== 'all') {
      filtered = filtered.filter(lead => lead.assignedAgent?._id === filters.assignedAgent);
    }

    // Follow-up status filter
    if (filters.followUpStatus === 'overdue') {
      filtered = filtered.filter(lead => lead.isOverdue);
    } else if (filters.followUpStatus === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(lead => 
        new Date(lead.nextActionDue).toDateString() === today
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(lead => new Date(lead.createdAt) >= cutoffDate);
      }
    }

    // Sort leads
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'lastActivity':
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'budget':
          aValue = a.requirements?.budget?.max || 0;
          bValue = b.requirements?.budget?.max || 0;
          break;
        case 'name':
          aValue = a.fullName || `${a.firstName} ${a.lastName}`;
          bValue = b.fullName || `${b.firstName} ${b.lastName}`;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    setFilteredLeads(filtered);
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = leads.reduce((acc, lead) => {
      acc.total++;
      
      // Status counts
      if (lead.status === 'new') acc.new++;
      if (lead.status === 'contacted') acc.contacted++;
      if (lead.status === 'qualified') acc.qualified++;
      
      // Priority counts
      if (lead.priority === 'urgent' || lead.score > 80) acc.hot++;
      
      // Overdue count
      if (lead.isOverdue) acc.overdue++;
      
      // This week count
      if (lead.daysSinceCreated <= 7) acc.thisWeek++;
      
      return acc;
    }, { 
      total: 0, new: 0, contacted: 0, qualified: 0, 
      hot: 0, overdue: 0, thisWeek: 0 
    });

    // Calculate conversion rate
    const qualified = leads.filter(l => l.status === 'qualified' || l.status === 'deal_closed').length;
    stats.conversion = leads.length > 0 ? Math.round((qualified / leads.length) * 100) : 0;

    setLeadStats(stats);
  };

  // Update lead status
  const handleStatusUpdate = async () => {
    if (!statusUpdate.leadId || !statusUpdate.status) return;

    try {
      setUpdating(true);
      
      await leadsAPI.updateLeadStatus(
        statusUpdate.leadId,
        statusUpdate.status,
        statusUpdate.subStatus,
        statusUpdate.reason
      );

      // Refresh leads
      await fetchLeads();
      
      // Close modal
      setShowStatusModal(false);
      setStatusUpdate({
        leadId: null,
        status: '',
        subStatus: '',
        reason: '',
        nextAction: '',
        followUpDate: ''
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Add note to lead
  const handleAddNote = async () => {
    if (!noteData.leadId || !noteData.content.trim()) return;

    try {
      setUpdating(true);
      
      await leadsAPI.addNoteToLead(noteData.leadId, noteData.content, noteData.type);
      
      // Refresh leads
      await fetchLeads();
      
      // Close modal
      setShowNoteModal(false);
      setNoteData({
        leadId: null,
        content: '',
        type: 'general',
        isPrivate: false
      });
      
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Schedule follow-up
  const handleScheduleFollowUp = async () => {
    if (!followUpData.leadId || !followUpData.scheduledFor) return;

    try {
      setUpdating(true);
      
      await leadsAPI.scheduleFollowUp(
        followUpData.leadId,
        followUpData.type,
        followUpData.scheduledFor,
        followUpData.description
      );
      
      // Refresh leads
      await fetchLeads();
      
      // Close modal
      setShowFollowUpModal(false);
      setFollowUpData({
        leadId: null,
        type: 'call',
        scheduledFor: '',
        description: '',
        priority: 'medium'
      });
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return 'Never';
    const days = getDaysSince(date);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  // Quick action handlers
  const openStatusModal = (lead) => {
    setStatusUpdate({
      leadId: lead._id,
      status: lead.status,
      subStatus: lead.subStatus || '',
      reason: '',
      nextAction: '',
      followUpDate: ''
    });
    setShowStatusModal(true);
  };

  const openNoteModal = (lead) => {
    setNoteData({
      leadId: lead._id,
      content: '',
      type: 'general',
      isPrivate: false
    });
    setShowNoteModal(true);
  };

  const openFollowUpModal = (lead) => {
    setFollowUpData({
      leadId: lead._id,
      type: 'call',
      scheduledFor: '',
      description: '',
      priority: 'medium'
    });
    setShowFollowUpModal(true);
  };

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color, trend, change }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Lead Card Component
  const LeadCard = ({ lead }) => {
    const statusInfo = statusDefinitions[lead.status] || statusDefinitions.new;
    const StatusIcon = statusInfo.icon;
    const priorityInfo = priorityDefinitions[lead.priority] || priorityDefinitions.medium;

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {lead.firstName?.[0]}{lead.lastName?.[0]}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                lead.priority === 'urgent' ? 'bg-red-500' : 
                lead.priority === 'high' ? 'bg-orange-500' : 
                lead.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              {lead.isOverdue && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Bell className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {lead.fullName || `${lead.firstName} ${lead.lastName}`}
              </h3>
              <p className="text-sm text-gray-600">
                {lead.requirements?.type} - {lead.requirements?.purpose}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </span>
                {lead.subStatus && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {statusInfo.subStatuses?.find(s => s.key === lead.subStatus)?.label || lead.subStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              lead.score >= 80 ? 'bg-green-100 text-green-700' :
              lead.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {lead.score}%
            </div>
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(showQuickActions === lead._id ? null : lead._id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showQuickActions === lead._id && (
                <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        openStatusModal(lead);
                        setShowQuickActions(null);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="text-sm font-medium">Update Status</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        openNoteModal(lead);
                        setShowQuickActions(null);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3 text-green-600" />
                      <span className="text-sm font-medium">Add Note</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        openFollowUpModal(lead);
                        setShowQuickActions(null);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                      <span className="text-sm font-medium">Schedule Follow-up</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={() => {
                        window.open(`tel:${lead.phone}`, '_self');
                        setShowQuickActions(null);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-3 text-green-600" />
                      <span className="text-sm font-medium">Call Now</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        window.open(`mailto:${lead.email}`, '_blank');
                        setShowQuickActions(null);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="text-sm font-medium">Send Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span className="flex-1 truncate">{lead.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span className="flex-1">{lead.phone}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="flex-1">
              {lead.requirements?.budget ? 
                `${formatCurrency(lead.requirements.budget.min)} - ${formatCurrency(lead.requirements.budget.max)}` :
                'Budget not specified'
              }
            </span>
          </div>

          {lead.requirements?.location?.city && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="flex-1">{lead.requirements.location.city}</span>
            </div>
          )}
        </div>

        {/* Timeline & Activity */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Created</p>
              <p className="font-medium text-gray-900">{formatRelativeTime(lead.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Contact</p>
              <p className="font-medium text-gray-900">{formatRelativeTime(lead.lastContactDate)}</p>
            </div>
            <div>
              <p className="text-gray-600">Next Action</p>
              <p className={`font-medium ${lead.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {lead.isOverdue ? 'Overdue' : formatRelativeTime(lead.nextActionDue)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Source</p>
              <p className="font-medium text-gray-900 capitalize">{lead.source}</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${priorityInfo.color}`}>
              {priorityInfo.label.toUpperCase()}
            </span>
            {lead.assignedAgent && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">
                  {lead.assignedAgent.firstName} {lead.assignedAgent.lastName}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => window.open(`tel:${lead.phone}`, '_self')}
              className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => openNoteModal(lead)}
              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
              title="Add Note"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => openStatusModal(lead)}
              className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
              title="Update Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => openFollowUpModal(lead)}
              className="p-2 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
              title="Schedule Follow-up"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Status Update Modal
  const StatusUpdateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={statusModalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Update Lead Status</h2>
          <button
            onClick={() => setShowStatusModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              value={statusUpdate.status}
              onChange={(e) => setStatusUpdate({
                ...statusUpdate,
                status: e.target.value,
                subStatus: '' // Reset substatus when status changes
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Status</option>
              {Object.entries(statusDefinitions).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
          </div>

          {/* SubStatus Selection */}
          {statusUpdate.status && statusDefinitions[statusUpdate.status]?.subStatuses?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Status
              </label>
              <select
                value={statusUpdate.subStatus}
                onChange={(e) => setStatusUpdate({...statusUpdate, subStatus: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub-Status</option>
                {statusDefinitions[statusUpdate.status].subStatuses.map((sub) => (
                  <option key={sub.key} value={sub.key}>{sub.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason/Notes
            </label>
            <textarea
              value={statusUpdate.reason}
              onChange={(e) => setStatusUpdate({...statusUpdate, reason: e.target.value})}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain the reason for this status change..."
            />
          </div>

          {/* Next Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Follow-up Date
            </label>
            <input
              type="datetime-local"
              value={statusUpdate.followUpDate}
              onChange={(e) => setStatusUpdate({...statusUpdate, followUpDate: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setShowStatusModal(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || !statusUpdate.status}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
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
  );

  // Note Modal
  const NoteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={noteModalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Note</h2>
          <button
            onClick={() => setShowNoteModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Note Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Type
            </label>
            <select
              value={noteData.type}
              onChange={(e) => setNoteData({...noteData, type: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="call">Call Note</option>
              <option value="meeting">Meeting Note</option>
              <option value="email">Email Note</option>
              <option value="important">Important</option>
            </select>
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content *
            </label>
            <textarea
              value={noteData.content}
              onChange={(e) => setNoteData({...noteData, content: e.target.value})}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your note here..."
            />
          </div>

          {/* Private Note */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="private-note"
              checked={noteData.isPrivate}
              onChange={(e) => setNoteData({...noteData, isPrivate: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="private-note" className="ml-2 text-sm text-gray-700">
              Make this note private
            </label>
          </div>
        </div>

        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setShowNoteModal(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddNote}
            disabled={updating || !noteData.content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Follow-up Modal
  const FollowUpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Follow-up</h2>
          <button
            onClick={() => setShowFollowUpModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Follow-up Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Type *
            </label>
            <select
              value={followUpData.type}
              onChange={(e) => setFollowUpData({...followUpData, type: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="call">Phone Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="site_visit">Site Visit</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={followUpData.scheduledFor}
              onChange={(e) => setFollowUpData({...followUpData, scheduledFor: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={followUpData.priority}
              onChange={(e) => setFollowUpData({...followUpData, priority: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={followUpData.description}
              onChange={(e) => setFollowUpData({...followUpData, description: e.target.value})}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What do you want to discuss or achieve?"
            />
          </div>
        </div>

        <div className="flex justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => setShowFollowUpModal(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleFollowUp}
            disabled={updating || !followUpData.scheduledFor}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your assigned leads</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchLeads()}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={leadStats.total}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend="up"
          change={12}
        />
        <StatCard
          title="Hot Leads"
          value={leadStats.hot}
          icon={Zap}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          trend="up"
          change={8}
        />
        <StatCard
          title="Overdue"
          value={leadStats.overdue}
          icon={AlertCircle}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatCard
          title="Conversion"
          value={`${leadStats.conversion}%`}
          icon={Target}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend="up"
          change={5}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {Object.entries(statusDefinitions).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              {Object.entries(priorityDefinitions).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </select>

            <select
              value={filters.followUpStatus}
              onChange={(e) => setFilters({...filters, followUpStatus: e.target.value})}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Follow-ups</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lastActivity">Last Activity</option>
              <option value="score">Lead Score</option>
              <option value="created">Created Date</option>
              <option value="budget">Budget</option>
              <option value="name">Name</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpRight className={`w-5 h-5 transform transition-transform ${
                sortOrder === 'asc' ? 'rotate-180' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Leads Display */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <div className="text-gray-400 mb-4 text-5xl">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-6">
            {leads.length === 0 
              ? "You don't have any leads assigned yet" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {leads.length === 0 && (
            <button
              onClick={() => fetchLeads()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Leads
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showStatusModal && <StatusUpdateModal />}
      {showNoteModal && <NoteModal />}
      {showFollowUpModal && <FollowUpModal />}

      {/* Click outside handler */}
      {showQuickActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowQuickActions(null)}
        />
      )}
    </div>
  );
};

export default LeadManagementSystem;