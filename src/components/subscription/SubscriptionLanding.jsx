// estatecrm/src/components/subscription/SubscriptionLanding.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Users, 
  Building, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight,
  Globe,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle,
  X
} from 'lucide-react';

const SubscriptionLanding = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState('monthly');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  // Mock plans data (replace with API call)
  const mockPlans = [
    {
      _id: '1',
      planId: 'starter',
      name: 'Starter',
      description: 'Perfect for small real estate teams just getting started',
      pricing: {
        monthly: { amount: 2999, currency: 'INR' },
        yearly: { amount: 29990, currency: 'INR', discount: 17 }
      },
      features: {
        maxAgents: 5,
        maxProperties: 100,
        maxLeads: 500
      },
      featuresList: [
        { name: 'Up to 5 Agents', included: true },
        { name: '100 Properties', included: true },
        { name: '500 Leads', included: true },
        { name: 'Basic Analytics', included: true },
        { name: 'Email Support', included: true },
        { name: '5GB Storage', included: true },
        { name: 'Mobile App', included: true },
        { name: 'Advanced Analytics', included: false },
        { name: 'API Access', included: false },
        { name: 'White Label', included: false }
      ],
      hasFreeTrial: true,
      trialDays: 14
    },
    {
      _id: '2',
      planId: 'professional',
      name: 'Professional',
      description: 'Ideal for growing real estate businesses with advanced needs',
      pricing: {
        monthly: { amount: 7999, currency: 'INR' },
        yearly: { amount: 79990, currency: 'INR', discount: 17 }
      },
      features: {
        maxAgents: 25,
        maxProperties: 1000,
        maxLeads: 5000
      },
      featuresList: [
        { name: 'Up to 25 Agents', included: true },
        { name: '1,000 Properties', included: true },
        { name: '5,000 Leads', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: '50GB Storage', included: true },
        { name: 'API Access', included: true },
        { name: 'Data Export', included: true },
        { name: 'Custom Domain', included: true },
        { name: 'White Label', included: false }
      ],
      isPopular: true,
      badge: 'Most Popular',
      hasFreeTrial: true,
      trialDays: 14
    },
    {
      _id: '3',
      planId: 'enterprise',
      name: 'Enterprise',
      description: 'For large real estate organizations requiring maximum flexibility',
      pricing: {
        monthly: { amount: 19999, currency: 'INR' },
        yearly: { amount: 199990, currency: 'INR', discount: 17 }
      },
      features: {
        maxAgents: 100,
        maxProperties: 10000,
        maxLeads: 50000
      },
      featuresList: [
        { name: 'Up to 100 Agents', included: true },
        { name: '10,000 Properties', included: true },
        { name: '50,000 Leads', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Unlimited Storage', included: true },
        { name: 'API Access', included: true },
        { name: 'Data Export', included: true },
        { name: 'Custom Domain', included: true },
        { name: 'White Label Solution', included: true }
      ],
      badge: 'Best Value',
      hasFreeTrial: true,
      trialDays: 14
    }
  ];
useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Replace with actual API call: const response = await organizationAPI.getPlans();
        // For now, using mock data
        setTimeout(() => {
          setPlans(mockPlans);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans(mockPlans); // Fallback to mock data
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateYearlySavings = (plan) => {
    const monthlyTotal = plan.pricing.monthly.amount * 12;
    const yearlyAmount = plan.pricing.yearly.amount;
    return monthlyTotal - yearlyAmount;
  };

  const handleGetStarted = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const OrganizationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Organization
              </h2>
              <p className="text-gray-600">
                Start your {selectedPlan?.trialDays}-day free trial with {selectedPlan?.name} plan
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <OrganizationRegistrationForm 
            selectedPlan={selectedPlan}
            billingCycle={selectedBilling}
            onClose={() => setShowModal(false)}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RealEstate CRM</h1>
                <p className="text-sm text-gray-600">Professional Edition</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Transform Your Real Estate Business
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Complete 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> CRM Solution</span>
            <br />for Real Estate
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline your lead management, boost conversions, and scale your real estate business 
            with our powerful, intuitive CRM platform trusted by 500+ agencies.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">14-Day Free Trial</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">Cancel Anytime</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Agencies</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-green-600 mb-2">₹2.5Cr</div>
              <div className="text-gray-600">Monthly Revenue Tracked</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start with a 14-day free trial. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setSelectedBilling('monthly')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedBilling === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedBilling('yearly')}
                className={`px-6 py-2 rounded-full font-medium transition-all relative ${
                  selectedBilling === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const pricing = selectedBilling === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
              const monthlyEquivalent = selectedBilling === 'yearly' ? Math.round(pricing.amount / 12) : pricing.amount;
              
              return (
                <div
                  key={plan._id}
                  className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                    plan.isPopular
                      ? 'border-blue-500 transform scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                        plan.isPopular ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-5xl font-bold text-gray-900">
                          {formatPrice(monthlyEquivalent)}
                        </span>
                        <span className="text-gray-600 text-lg">/month</span>
                      </div>

                      {selectedBilling === 'yearly' && (
                        <div className="text-green-600 font-medium">
                          Save {formatPrice(calculateYearlySavings(plan))} yearly
                        </div>
                      )}

                      {plan.hasFreeTrial && (
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mt-4 inline-block">
                          🎉 {plan.trialDays}-Day Free Trial
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.featuresList.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleGetStarted(plan)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                        plan.isPopular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-lg'
                          : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                      }`}
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </button>

                    <p className="text-center text-gray-500 text-sm mt-4">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for real estate professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Lead Management',
                description: 'Capture, track, and convert leads with intelligent scoring and automated follow-ups.'
              },
              {
                icon: Building,
                title: 'Property Management',
                description: 'Organize your listings with detailed information, photos, and virtual tours.'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Get deep insights into your performance with comprehensive reports and dashboards.'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level security with role-based access control and data encryption.'
              },
              {
                icon: Zap,
                title: 'Automation',
                description: 'Automate repetitive tasks and focus on what matters most - closing deals.'
              },
              {
                icon: Globe,
                title: 'Multi-Platform',
                description: 'Access your CRM anywhere with web, mobile, and desktop applications.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Real Estate Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Senior Sales Manager',
                company: 'Premium Properties',
                message: 'This CRM increased our conversion rate by 40% and streamlined our entire sales process. The automation features are game-changing.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                rating: 5
              },
              {
                name: 'Priya Sharma',
                role: 'Real Estate Agent',
                company: 'Elite Realty',
                message: 'The best real estate CRM I\'ve used. The interface is intuitive and the analytics help me make better decisions.',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
                rating: 5
              },
              {
                name: 'Amit Patel',
                role: 'Branch Manager',
                company: 'City Properties',
                message: 'Managing our team of 20 agents became so much easier. The lead distribution and tracking features are excellent.',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.message}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: 'How does the 14-day free trial work?',
                answer: 'You get full access to all features for 14 days without any restrictions. No credit card required to start. You can cancel anytime during the trial period.'
              },
              {
                question: 'Can I change my plan later?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate the billing accordingly.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use bank-level encryption and follow industry best practices for data security. Your data is backed up regularly and stored securely.'
              },
              {
                question: 'Do you offer customer support?',
                answer: 'Yes! All plans include email support. Professional and Enterprise plans get priority support with faster response times.'
              },
              {
                question: 'Can I export my data?',
                answer: 'Professional and Enterprise plans include data export functionality. You can export your leads, properties, and reports in various formats.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Real Estate Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of real estate professionals who trust our platform to grow their business.
          </p>
          <button
            onClick={() => handleGetStarted(plans.find(p => p.isPopular) || plans[0])}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Your Free Trial Today
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
          <p className="text-blue-100 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-white font-bold text-lg">RealEstate CRM</span>
              </div>
              <p className="text-gray-400">
                The complete CRM solution for real estate professionals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RealEstate CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && <OrganizationModal />}
    </div>
  );
};

// Organization Registration Form Component - REAL API INTEGRATION
const OrganizationRegistrationForm = ({ selectedPlan, billingCycle, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    industry: '',
    teamSize: '',
    establishedYear: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email;
      case 2:
        return formData.adminName && formData.adminEmail;
      case 3:
        return true; // Address is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ACTUAL API INTEGRATION
      const organizationData = {
        ...formData,
        planId: selectedPlan.planId,
        billingCycle,
        startTrial: true
      };

      console.log('Submitting organization:', organizationData);

      const response = await fetch(`${ 'http://localhost:5001/api'}/organizations/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create organization');
      }

      console.log('Organization created successfully:', data);
      setSuccess(true);
      
      // Show success for 3 seconds then redirect
      setTimeout(() => {
        onClose();
        window.location.href = '/login';
      }, 3000);
      
    } catch (error) {
      console.error('Organization creation error:', error);
      setError(error.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Organization Created Successfully!
        </h3>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium mb-2">
            Check your email to verify your account
          </p>
          <p className="text-green-700 text-sm">
            We've sent a verification link to <strong>{formData.adminEmail}</strong>
          </p>
        </div>
        <p className="text-gray-600 text-sm">
          Redirecting to login page in 3 seconds...
        </p>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Organization Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Real Estate Company"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@yourcompany.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourcompany.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Type
                </label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed">Mixed</option>
                  <option value="property_management">Property Management</option>
                  <option value="real_estate_development">Real Estate Development</option>
                  <option value="brokerage">Brokerage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <select
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Team Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Admin Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@yourcompany.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This email will be used for admin login via Google Sign-In
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2020"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📧 Important Note</h4>
              <p className="text-blue-800 text-sm">
                The admin email must be a Gmail account as we use Google Sign-In for authentication. 
                You'll receive a verification email at this address to activate your account.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Address & Final Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Business Street"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mumbai"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Maharashtra"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="400001"
                />
              </div>
            </div>

            {/* Plan Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">📋 Plan Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Plan:</span>
                  <span className="font-medium">{selectedPlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Free Trial:</span>
                  <span className="font-medium text-green-600">{selectedPlan?.trialDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Agents:</span>
                  <span className="font-medium">{selectedPlan?.features.maxAgents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Properties:</span>
                  <span className="font-medium">{selectedPlan?.features.maxProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Leads:</span>
                  <span className="font-medium">{selectedPlan?.features.maxLeads}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-900 mb-2">🎉 What happens next?</h4>
              <ol className="text-green-800 text-sm space-y-1 list-decimal list-inside">
                <li>We'll create your organization and send a verification email</li>
                <li>Click the verification link to activate your account</li>
                <li>Sign in with your Gmail account to access your dashboard</li>
                <li>Enjoy your {selectedPlan?.trialDays}-day free trial with full access</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {num}
            </div>
            {num < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > num ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleBack}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            step === 1 
              ? 'invisible' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!validateStep()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !validateStep()}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Organization...</span>
              </>
            ) : (
              <>
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default SubscriptionLanding;