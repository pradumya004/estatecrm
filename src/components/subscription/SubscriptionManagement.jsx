import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Edit3,
  Trash2,
  Crown,
  TrendingUp,
  Users,
  Building,
  BarChart3,
  Zap
} from 'lucide-react';

const SubscriptionManagement = () => {
  const [organization, setOrganization] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // REAL API INTEGRATION
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        
        // Get auth token from Firebase
        const user = window.firebase?.auth()?.currentUser;
        if (!user) {
          throw new Error('Not authenticated');
        }
        
        const token = await user.getIdToken();
        
        // Fetch user profile with organization data
        const profileResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        
        if (profileData.organization) {
          setOrganization(profileData.organization);
          setSubscription(profileData.organization.subscription);
        }

        // Fetch available plans
        const plansResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/organizations/plans`);
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData);
        }

      } catch (error) {
        console.error('Error fetching subscription data:', error);
        alert('Failed to load subscription data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'trial': return <Zap className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'expired': return <AlertTriangle className="w-5 h-5" />;
      case 'suspended': return <AlertTriangle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getCurrentPlan = () => {
    return plans.find(p => p.planId === subscription?.planId);
  };

  const handleUpgradePlan = async (newPlan) => {
    setActionLoading(true);
    try {
      const user = window.firebase?.auth()?.currentUser;
      if (!user) throw new Error('Not authenticated');
      
      const token = await user.getIdToken();
      
      // REAL API CALL
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/organizations/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId: organization._id,
          planId: newPlan.planId,
          billingCycle: 'monthly'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upgrade plan');
      }

      // Update local state
      setSubscription(prev => ({
        ...prev,
        planId: newPlan.planId
      }));
      
      setOrganization(prev => ({
        ...prev,
        features: {
          maxAgents: newPlan.features.maxAgents,
          maxProperties: newPlan.features.maxProperties,
          maxLeads: newPlan.features.maxLeads,
          canExportData: true,
          canUseAPI: true,
          hasAdvancedAnalytics: true,
          hasWhiteLabel: newPlan.planId === 'enterprise'
        }
      }));
      
      setShowUpgradeModal(false);
      alert('Plan upgraded successfully!');
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(error.message || 'Failed to upgrade plan. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setActionLoading(true);
    try {
      const user = window.firebase?.auth()?.currentUser;
      if (!user) throw new Error('Not authenticated');
      
      const token = await user.getIdToken();
      
      // REAL API CALL
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/organizations/${organization._id}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel subscription');
      }

      setSubscription(prev => ({
        ...prev,
        status: 'cancelled'
      }));
      
      setShowCancelModal(false);
      alert('Subscription cancelled successfully. You can continue using the service until your billing period ends.');
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan, billingCycle) => {
    const res = await initializeRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    const pricing = billingCycle === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
    
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: pricing.amount * 100, // Amount in paise
      currency: 'INR',
      name: 'RealEstate CRM',
      description: `${plan.name} Plan - ${billingCycle}`,
      image: '/logo.png',
      handler: function (response) {
        // Handle successful payment
        console.log('Payment successful:', response);
        handleUpgradePlan(plan);
      },
      prefill: {
        name: organization.adminName,
        email: organization.adminEmail,
        contact: organization.phone || ''
      },
      notes: {
        organization_id: organization._id,
        plan_id: plan.planId
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();
  const usagePercentages = {
    agents: (organization.usage.currentAgents / organization.features.maxAgents) * 100,
    properties: (organization.usage.currentProperties / organization.features.maxProperties) * 100,
    leads: (organization.usage.currentLeads / organization.features.maxLeads) * 100
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription, billing, and usage</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Current Plan</h2>
                    <p className="text-blue-100">Active since {formatDate(subscription.startDate)}</p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentPlan?.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        <span className="capitalize">{subscription.status}</span>
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600 capitalize">{subscription.billingCycle} billing</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(subscription.billingCycle === 'yearly' 
                        ? Math.round(currentPlan?.pricing.yearly.amount / 12) 
                        : currentPlan?.pricing.monthly.amount
                      )}
                    </div>
                    <div className="text-gray-600">/month</div>
                  </div>
                </div>

                {/* Next Billing */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Next Billing Date</span>
                    </div>
                    <span className="text-gray-700">{formatDate(subscription.endDate)}</span>
                  </div>
                  
                  {organization.subscriptionDaysRemaining <= 7 && (
                    <div className="mt-3 flex items-center space-x-2 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Expires in {organization.subscriptionDaysRemaining} days
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Upgrade Plan</span>
                  </button>
                  
                  <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Download Receipt</span>
                  </button>
                  
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-6 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
              
              <div className="space-y-6">
                {/* Agents */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Agents</span>
                    </div>
                    <span className="text-gray-600">
                      {organization.usage.currentAgents} / {organization.features.maxAgents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        usagePercentages.agents > 80 ? 'bg-red-500' : 
                        usagePercentages.agents > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentages.agents, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Properties</span>
                    </div>
                    <span className="text-gray-600">
                      {organization.usage.currentProperties.toLocaleString()} / {organization.features.maxProperties.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        usagePercentages.properties > 80 ? 'bg-red-500' : 
                        usagePercentages.properties > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentages.properties, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Leads */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Leads</span>
                    </div>
                    <span className="text-gray-600">
                      {organization.usage.currentLeads.toLocaleString()} / {organization.features.maxLeads.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        usagePercentages.leads > 80 ? 'bg-red-500' : 
                        usagePercentages.leads > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(usagePercentages.leads, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Usage Warnings */}
              {(usagePercentages.agents > 80 || usagePercentages.properties > 80 || usagePercentages.leads > 80) && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-amber-800 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Usage Alert</span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    You're approaching your plan limits. Consider upgrading to avoid service interruptions.
                  </p>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Billing History</h3>
              
              <div className="space-y-4">
                {[
                  { date: '2024-01-15', amount: 7999, status: 'paid', invoice: 'INV-001' },
                  { date: '2023-12-15', amount: 7999, status: 'paid', invoice: 'INV-002' },
                  { date: '2023-11-15', amount: 7999, status: 'paid', invoice: 'INV-003' }
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{formatPrice(bill.amount)}</div>
                        <div className="text-sm text-gray-600">{formatDate(bill.date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Paid
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Organization Name</label>
                  <p className="text-gray-900 font-medium">{organization.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Email</label>
                  <p className="text-gray-900">{organization.adminEmail}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Email</label>
                  <p className="text-gray-900">{organization.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Verified</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900">Update Payment Method</span>
                </button>
                
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">Download Invoices</span>
                </button>
                
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900">Sync Usage Data</span>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help with billing questions and account management.
              </p>
              
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Contact Support
                </button>
                <button className="w-full text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h2>
                    <p className="text-gray-600">Choose a plan that fits your growing business needs</p>
                  </div>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan._id}
                      className={`border-2 rounded-2xl p-6 ${
                        plan.planId === subscription.planId
                          ? 'border-blue-500 bg-blue-50'
                          : plan.isPopular
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {formatPrice(plan.pricing.monthly.amount)}
                        </div>
                        <div className="text-gray-600">/month</div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-3">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">{plan.features.maxAgents} Agents</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">{plan.features.maxProperties.toLocaleString()} Properties</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700">{plan.features.maxLeads.toLocaleString()} Leads</span>
                        </div>
                      </div>

                      {plan.planId === subscription.planId ? (
                        <button
                          disabled
                          className="w-full py-3 px-4 bg-blue-100 text-blue-600 rounded-xl font-medium cursor-not-allowed"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePayment(plan, 'monthly')}
                          disabled={actionLoading}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                            plan.isPopular
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {actionLoading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Subscription</h2>
                  <p className="text-gray-600">
                    Are you sure you want to cancel your subscription? You'll continue to have access until {formatDate(subscription.endDate)}.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;