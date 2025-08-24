import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield, 
  Check, 
  X, 
  Gift,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const PaymentForm = ({ subscription, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        // Check if Razorpay is already loaded
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve();
        };
        script.onerror = () => {
          setError('Failed to load payment gateway. Please refresh and try again.');
        };
        document.head.appendChild(script);
      });
    };

    loadRazorpay();

    // Cleanup function
    return () => {
      // Remove script if component unmounts
      const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      setError('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Create Razorpay subscription
      const response = await fetch('/api/subscription/create-razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscriptionId: subscription.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      // Get user details from localStorage or API
      const userEmail = localStorage.getItem('userEmail') || '';
      const userPhone = localStorage.getItem('userPhone') || '';
      const userName = localStorage.getItem('userName') || 'User';

      // Initialize Razorpay checkout
      const options = {
        key: data.razorpayKey,
        subscription_id: data.razorpaySubscriptionId,
        name: 'RealEstate CRM',
        description: `${subscription.plan} Plan - ${subscription.billingCycle} billing`,
        image: '/logo.png', // Add your logo URL
        handler: function (response) {
          console.log('Payment successful:', response);
          setLoading(false);
          onSuccess(response);
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateSavings = () => {
    if (subscription.billingCycle === 'yearly') {
      // Assuming the subscription object has both monthly and yearly prices
      const monthlyTotal = subscription.monthlyPrice * 12;
      const yearlySavings = monthlyTotal - subscription.amount;
      return yearlySavings > 0 ? yearlySavings : 0;
    }
    return 0;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Complete Your Setup</h3>
          <p className="text-blue-100">
            Setup payment for after your free trial
          </p>
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Payment Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Trial Information */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">14-Day Free Trial Active</h4>
              <p className="text-green-800 text-sm mt-1">
                Your trial is active until {formatDate(subscription.trialEndDate)}. 
                No charges will be made during the trial period.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Subscription Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium text-gray-900">{subscription.plan}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Billing Cycle:</span>
              <span className="font-medium text-gray-900 capitalize">{subscription.billingCycle}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-2xl text-gray-900">₹{subscription.amount.toLocaleString()}</span>
            </div>

            {calculateSavings() > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">You Save:</span>
                <span className="font-medium text-green-600">₹{calculateSavings().toLocaleString()}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">First Charge:</span>
                <span className="font-medium text-gray-900">{formatDate(subscription.trialEndDate)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today's Charge:</span>
              <span className="font-bold text-green-600">₹0 (Free Trial)</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Supported Payment Methods
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Credit/Debit Cards</p>
                <p className="text-xs text-blue-700">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg border border-green-200">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">UPI Payments</p>
                <p className="text-xs text-green-700">PhonePe, GPay, Paytm</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
              <Building className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Net Banking</p>
                <p className="text-xs text-purple-700">All major banks</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Digital Wallets</p>
                <p className="text-xs text-orange-700">Paytm, Amazon Pay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Bank-Level Security</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>No Card Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Razorpay Secured</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : !razorpayLoaded ? (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Loading Payment Gateway...</span>
              </div>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Setup Payment Method
              </>
            )}
          </button>
          
          <button
            onClick={onCancel}
            className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 transition-colors"
          >
            I'll do this later
          </button>
        </div>

        {/* Footer Information */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Payments processed securely by Razorpay
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-900">Flexible Cancellation</p>
                <p className="text-xs text-blue-700">Cancel anytime during or after your trial period</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;