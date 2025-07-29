'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  CreditCard as CreditCardIcon,
  X,
  ChevronRight
} from 'lucide-react';
import { toast } from "react-hot-toast";

// Define interfaces for data types
interface Subscription {
  id: string;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  minutesIncluded: number;
  minutesUsed: number;
  nextBillingDate: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
}

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

// Main component
const BillingManagement = () => {
  // State variables
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cardFormData, setCardFormData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: ''
  });
  // Add state to track data loading
  const [dataLoaded, setDataLoaded] = useState({
    subscription: false,
    paymentMethods: false,
    invoices: false
  });
  // Add state for membership management
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [processingPlan, setProcessingPlan] = useState(false);
  
  // Define available plans with exact Stripe product and price IDs
  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      description: 'Perfect for small businesses just getting started',
      price: 99,
      minutes: 80,
      productId: 'prod_SfSSZfwqMQ8ND0',
      priceId: 'price_1Rk7XePolIihCLBaGS6oTCPF'
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      description: 'Ideal for growing businesses with more needs',
      price: 249,
      minutes: 250,
      productId: 'prod_SfSTFmsZX1Vlmj',
      priceId: 'price_1Rk7YcPolIihCLBacMvpJNqS'
    },
    {
      id: 'business',
      name: 'Business Plan',
      description: 'For established businesses with high volume',
      price: 499,
      minutes: 600,
      productId: 'prod_SfSWsI4Fn0vUX0',
      priceId: 'price_1Rk7bFPolIihCLBaollaNxW0'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Custom solution for large organizations',
      price: 999,
      minutes: 1500,
      productId: 'prod_SfSYZBTsFkTDac',
      priceId: 'price_1Rk7dePolIihCLBamIyBPcTm'
    },
    {
      id: 'enterprise-plus',
      name: 'Enterprise Plus Plan',
      description: 'Our most comprehensive solution',
      price: 1999,
      minutes: 3500,
      productId: 'prod_SfSaVy0gKQVkeh',
      priceId: 'price_1Rk7f3PolIihCLBanYQALl0n'
    }
  ];
  
  // Fetch billing data from API - split into separate functions for better error handling
  const fetchBillingData = async () => {
    setLoading(true);
    
    try {
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchUserData(),
        fetchSubscriptionData(),
        fetchPaymentMethods(),
        fetchInvoices()
      ]);
      
      console.log('All billing data loaded successfully');
    } catch (error) {
      console.error('Error in main fetchBillingData:', error);
      // Individual fetch functions handle their own errors
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user data
  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const userResponse = await fetch('/api/user');
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      setUser(userData);
      console.log('User data loaded successfully:', userData.email);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Failed to load user data.");
      return null;
    }
  };
  
  // Fetch subscription data
  const fetchSubscriptionData = async (forceRefresh = false) => {
    try {
      console.log('Fetching subscription data...');
      // Add cache-busting parameter to prevent browser caching
      const timestamp = new Date().getTime();
      console.log(`Using timestamp for cache busting: ${timestamp}`);
      const subResponse = await fetch(`/api/dashboard/subscription?_=${timestamp}`);
      
      if (!subResponse.ok) {
        console.error(`Subscription API error: ${subResponse.status} ${subResponse.statusText}`);
        throw new Error(`Failed to fetch subscription: ${subResponse.status}`);
      }
        
      const subscriptionData = await subResponse.json();
      console.log('===== SUBSCRIPTION DEBUG =====');
      console.log('Raw subscription data received:', JSON.stringify(subscriptionData, null, 2));
      console.log('Plan Name:', subscriptionData.planName);
      console.log('Plan Price:', subscriptionData.planPrice);
      console.log('Status:', subscriptionData.status);
      console.log('Minutes Included:', subscriptionData.minutesIncluded);
      console.log('Data Source:', subscriptionData._metadata?.dataSource);
      console.log('===== END SUBSCRIPTION DEBUG =====');
      
      // If user has no plan, set planName to empty string
      if (subscriptionData && !subscriptionData.planName) {
        console.log('No plan name found, setting to empty string');
        subscriptionData.planName = '';
      }
      
      setSubscription(subscriptionData);
      setDataLoaded(prev => ({ ...prev, subscription: true }));
      console.log('Subscription data loaded successfully:', subscriptionData.planName);
      
      if (forceRefresh) {
        toast.success('Subscription data refreshed successfully');
      }
      
      return subscriptionData;
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error("Failed to load subscription data.");
      return null;
    }
  };
  
  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      console.log('Fetching payment methods...');
      const paymentMethodsResponse = await fetch('/api/dashboard/payment-methods');
      
      if (!paymentMethodsResponse.ok) {
        throw new Error(`Failed to fetch payment methods: ${paymentMethodsResponse.status}`);
      }
      
      const paymentMethodsResponseData = await paymentMethodsResponse.json();
      console.log('Raw payment methods data:', paymentMethodsResponseData);
      
      if (Array.isArray(paymentMethodsResponseData)) {
        const formattedPaymentMethods = paymentMethodsResponseData.map((pm: any) => ({
          id: pm.id || pm.stripePaymentMethodId || `pm-${Math.random().toString(36).substring(2, 10)}`,
          type: pm.type || 'card',
          last4: pm.last4 || '****',
          brand: pm.brand || 'unknown',
          expiryMonth: pm.expiryMonth || 1,
          expiryYear: pm.expiryYear || 2025,
          isDefault: pm.isDefault || false
        }));
        
        setPaymentMethods(formattedPaymentMethods);
        setDataLoaded(prev => ({ ...prev, paymentMethods: true }));
        console.log(`Loaded ${formattedPaymentMethods.length} payment methods from API`);
        return formattedPaymentMethods;
      } else {
        console.log('No payment methods returned or invalid format');
        return [];
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Don't clear existing payment methods on error
      return null;
    }
  };
  
  // Fetch invoices
  const fetchInvoices = async (forceRefresh = false) => {
    try {
      console.log('Fetching invoices...');
      // Use POST to force refresh if requested
      const invoiceMethod = forceRefresh ? 'POST' : 'GET';
      const invoiceResponse = await fetch('/api/dashboard/invoices', {
        method: invoiceMethod,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!invoiceResponse.ok) {
        throw new Error(`Failed to fetch invoices: ${invoiceResponse.status}`);
      }
      
      const responseData = await invoiceResponse.json();
      console.log('Raw invoice data from API:', responseData);
      
      // Handle both array format and {invoices: [...]} format
      const invoicesResponseData = Array.isArray(responseData) 
        ? responseData 
        : (responseData.invoices || []);
      
      console.log('Processed invoices array:', invoicesResponseData);
      
      // Check if we have any invoices
      if (Array.isArray(invoicesResponseData) && invoicesResponseData.length > 0) {
        // Map MongoDB invoices to our Invoice interface
        const formattedInvoices = invoicesResponseData.map((inv: any) => ({
          id: inv.stripeInvoiceId || inv.id || `inv-${Math.random().toString(36).substring(2, 10)}`,
          number: inv.number || `INV-${(inv.stripeInvoiceId || '').substring(3, 10) || 'unknown'}`,
          date: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: parseFloat(inv.amount || 0), // Amount is already in dollars
          status: inv.status || 'paid',
          downloadUrl: inv.invoicePdf || inv.invoiceUrl || '#',
          description: inv.description || `Invoice - ${inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'No date'}`
        }));
        
        console.log('Formatted invoices:', formattedInvoices);
        setInvoices(formattedInvoices);
        setDataLoaded(prev => ({ ...prev, invoices: true }));
        console.log(`Loaded ${formattedInvoices.length} invoices from API`);
        return formattedInvoices;
      } else {
        console.log('No invoices found in API response or invalid format');
        if (forceRefresh) {
          setInvoices([]);
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Don't clear existing invoices on error
      return null;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBillingData();
    
    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing billing data...');
      fetchBillingData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Refresh invoices only
  const handleRefreshInvoices = async () => {
    toast.loading('Refreshing invoices...');
    await fetchInvoices(true);
    toast.dismiss();
    toast.success('Invoices refreshed');
  };
  
  // Refresh subscription data only
  const handleRefreshSubscription = async () => {
    toast.loading('Refreshing subscription data...');
    await fetchSubscriptionData(true);
    toast.dismiss();
    toast.success('Subscription data refreshed');
  };
  
  // Refresh all billing data
  const handleRefreshAll = async () => {
    toast.loading('Refreshing all billing data...');
    await fetchBillingData();
    toast.dismiss();
    toast.success('All billing data refreshed');
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardFormData({
      ...cardFormData,
      [name]: value
    });
  };

  // Handle payment method form submission
  const handleAddPaymentMethod = async (e: FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      // Validate form data
      if (!cardFormData.cardNumber || !cardFormData.cardholderName || 
          !cardFormData.expiryMonth || !cardFormData.expiryYear || !cardFormData.cvc) {
        toast.error("Please fill in all required fields");
        setFormSubmitting(false);
        return;
      }
      
      // Submit payment method to API
      const response = await fetch('/api/dashboard/payment-methods/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment method error details:', errorData);
        throw new Error(`Failed to add payment method: ${errorData.message || response.status}`);
      }
      
      const result = await response.json();
      
      // Update payment methods list
      setPaymentMethods([...paymentMethods, result.paymentMethod]);
      
      // Reset form
      setCardFormData({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: ''
      });
      
      setShowAddPayment(false);
      toast.success("Payment method added successfully");
      
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error("Failed to add payment method. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle removing a payment method
  const handleRemovePaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/payment-methods/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove payment method: ${response.status}`);
      }
      
      // Update payment methods list
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      toast.success("Payment method removed successfully");
      
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error("Failed to remove payment method. Please try again.");
    }
  };

  // Handle setting default payment method
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/payment-methods/${id}/default`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to set default payment method: ${response.status}`);
      }
      
      // Update payment methods list
      setPaymentMethods(paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      })));
      
      toast.success("Default payment method updated");
      
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error("Failed to update default payment method. Please try again.");
    }
  };

  // Handle opening Stripe customer portal
  const handleManageSubscription = async () => {
    if (!user?.stripeCustomerId) {
      toast.error("No Stripe customer ID found");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/subscription/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerId: user.stripeCustomerId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to open customer portal: ${response.status}`);
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe portal
      window.location.href = url;
      
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error("Failed to open customer portal. Please try again.");
      setLoading(false);
    }
  };
  
  // Handle plan selection
  const handleSelectPlan = async () => {
    console.log('handleSelectPlan called, selectedPlan:', selectedPlan);
    
    if (!selectedPlan) {
      console.log('No plan selected');
      toast.error("Please select a plan");
      return;
    }
    
    // Find the selected plan details
    const plan = plans.find(p => p.id === selectedPlan);
    console.log('Selected plan details:', plan);
    
    if (!plan) {
      console.log('Invalid plan selected');
      toast.error("Invalid plan selected");
      return;
    }
    
    try {
      console.log('Setting processingPlan to true');
      setProcessingPlan(true);
      
      // Use the exact price ID from the plan object
      const priceId = plan.priceId;
      console.log('Using exact priceId from plan:', priceId);
      
      if (!priceId) {
        console.error('Price ID not found for plan:', plan.name);
        toast.error(`Could not find pricing for ${plan.name}. Please contact support.`);
        setProcessingPlan(false);
        return;
      }
      
      // Create checkout session
      console.log('Creating checkout session with priceId:', priceId);
      const checkoutResponse = await fetch('/api/dashboard/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          priceId,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`
        })
      });
      
      console.log('Checkout API response status:', checkoutResponse.status);
      if (!checkoutResponse.ok) {
        throw new Error(`Failed to create checkout session: ${checkoutResponse.status}`);
      }
      
      const checkoutData = await checkoutResponse.json();
      console.log('Checkout API response data:', checkoutData);
      
      const { url } = checkoutData;
      console.log('Redirecting to checkout URL:', url);
      
      // Redirect to checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Checkout URL is undefined');
      }
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error("Failed to process plan selection. Please try again.");
      setProcessingPlan(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    console.log('Current subscription data:', subscription);
    
    if (!subscription?.id) {
      console.error('No subscription ID found in subscription data');
      toast.error("No active subscription found");
      return;
    }
    
    console.log('Attempting to cancel subscription with ID:', subscription.id);
    
    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) {
      return;
    }
    
    try {
      setProcessingPlan(true);
      
      const response = await fetch('/api/dashboard/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriptionId: subscription.id })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.status}`);
      }
      
      const result = await response.json();
      
      toast.success("Subscription canceled successfully");
      setShowPlanSelection(false);
      
      // Refresh subscription data
      fetchSubscriptionData();
      
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setProcessingPlan(false);
    }
  };

  // Render subscription status with appropriate icon and color
  const renderSubscriptionStatus = () => {
    if (!subscription) return null;
    
    // If status is empty, return empty status
    if (!subscription.status) {
      return <span>-</span>;
    }
    
    let icon = <Clock className="h-5 w-5 text-yellow-500" />;
    let statusText = "Processing";
    let statusClass = "bg-yellow-100 text-yellow-800";
    
    switch (subscription.status) {
      case 'active':
        icon = <CheckCircle className="h-5 w-5 text-green-500" />;
        statusText = "Active";
        statusClass = "bg-green-100 text-green-800";
        break;
      case 'canceled':
        icon = <AlertCircle className="h-5 w-5 text-red-500" />;
        statusText = "Canceled";
        statusClass = "bg-red-100 text-red-800";
        break;
      case 'past_due':
        icon = <AlertCircle className="h-5 w-5 text-orange-500" />;
        statusText = "Past Due";
        statusClass = "bg-orange-100 text-orange-800";
        break;
    }
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {icon}
        <span className="ml-1">{statusText}</span>
      </div>
    );
  };

  // Render invoice status with appropriate icon and color
  const renderInvoiceStatus = (status: string) => {
    let icon = <Clock className="h-4 w-4 text-yellow-500" />;
    let statusText = "Processing";
    let statusClass = "bg-yellow-100 text-yellow-800";
    
    switch (status) {
      case 'paid':
        icon = <CheckCircle className="h-4 w-4 text-green-500" />;
        statusText = "Paid";
        statusClass = "bg-green-100 text-green-800";
        break;
      case 'pending':
        icon = <Clock className="h-4 w-4 text-yellow-500" />;
        statusText = "Pending";
        statusClass = "bg-yellow-100 text-yellow-800";
        break;
      case 'failed':
        icon = <AlertCircle className="h-4 w-4 text-red-500" />;
        statusText = "Failed";
        statusClass = "bg-red-100 text-red-800";
        break;
    }
    
    return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {icon}
        <span className="ml-1">{statusText}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with refresh buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing Management</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* Subscription Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Subscription Overview
            </h3>
            
            {subscription && subscription.planName ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{subscription.planName}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Status</p>
                  {renderSubscriptionStatus()}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Billing Cycle</p>
                  <p className="font-medium capitalize">{subscription.billingCycle}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${subscription.planPrice.toFixed(2)}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Next Billing Date</p>
                  <p className="font-medium">{subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : '-'}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Minutes Used</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (subscription.minutesUsed / subscription.minutesIncluded) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {subscription.minutesUsed}/{subscription.minutesIncluded}
                    </span>
                  </div>
                </div>
                
                {/* Add Manage Membership button */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4">
                  <button
                    onClick={() => setShowPlanSelection(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Membership
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-4">No active subscription found.</p>
                <button
                  onClick={() => setShowPlanSelection(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select a Membership Plan
                </button>
              </div>
            )}
            
            {/* Plan Selection Modal */}
            {showPlanSelection && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Select a Membership Plan</h3>
                      <button 
                        type="button"
                        onClick={() => {
                          console.log('Close button clicked');
                          setShowPlanSelection(false);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {plans.map((plan) => {
                        // More precise matching to avoid 'enterprise' matching 'enterprise-plus'
                        const isCurrentPlan = subscription?.planName?.toLowerCase() === plan.name.toLowerCase() || 
                          (subscription?.planName?.toLowerCase().includes(plan.id.toLowerCase()) && 
                           !subscription?.planName?.toLowerCase().includes('plus') === !plan.id.toLowerCase().includes('plus'));
                        return (
                          <div 
                            key={plan.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'} ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium text-lg">{plan.name}</h4>
                                <p className="text-gray-600">{plan.description}</p>
                                <div className="mt-2 flex items-center space-x-4">
                                  <span className="inline-flex items-center text-sm text-gray-700">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {plan.minutes} minutes/month
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold">${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                                {isCurrentPlan && (
                                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    Current Plan
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3">

                      <button
                        onClick={() => handleCancelSubscription()}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                        disabled={!subscription?.planName || processingPlan}
                      >
                        {processingPlan ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>Cancel Subscription</>
                        )}
                      </button>
                      
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Direct Continue link clicked');
                          if (selectedPlan && !processingPlan) {
                            handleSelectPlan();
                          } else {
                            console.log('Button would be disabled:', {selectedPlan, processingPlan});
                          }
                        }}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${!selectedPlan || processingPlan ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center`}
                      >
                        {processingPlan ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Continue <ChevronRight className="ml-1 w-4 h-4" />
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Payment Methods
            </h3>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{method.brand} •••• {method.last4}</p>
                        <p className="text-sm text-gray-500">Expires {method.expiryMonth}/{method.expiryYear}</p>
                      </div>
                      {method.isDefault && (
                        <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                          title="Set as default"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Remove payment method"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No payment methods found.</p>
              )}
            </div>
            
            {!showAddPayment ? (
              <button 
                onClick={() => setShowAddPayment(true)}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </button>
            ) : (
              <div className="mt-6 border border-gray-200 rounded-md p-4">
                <h4 className="text-md font-medium mb-4">Add New Payment Method</h4>
                <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={cardFormData.cardholderName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardFormData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">Expiry Month</label>
                      <input
                        type="text"
                        id="expiryMonth"
                        name="expiryMonth"
                        value={cardFormData.expiryMonth}
                        onChange={handleInputChange}
                        placeholder="MM"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700">Expiry Year</label>
                      <input
                        type="text"
                        id="expiryYear"
                        name="expiryYear"
                        value={cardFormData.expiryYear}
                        onChange={handleInputChange}
                        placeholder="YYYY"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                      <input
                        type="text"
                        id="cvc"
                        name="cvc"
                        value={cardFormData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPayment(false)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Invoice History */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Invoice History */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Invoice History
            </h3>
            <button
              onClick={handleRefreshInvoices}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              disabled={loading}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Invoices
            </button>
          </div>
            
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderInvoiceStatus(invoice.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No invoices found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BillingManagement;
