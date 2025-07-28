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
  RefreshCw
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
  const fetchSubscriptionData = async () => {
    try {
      console.log('Fetching subscription data...');
      const subResponse = await fetch('/api/dashboard/subscription');
      
      if (!subResponse.ok) {
        throw new Error(`Failed to fetch subscription: ${subResponse.status}`);
      }
        
      const subscriptionData = await subResponse.json();
      
      // If user has no plan, set planName to empty string
      if (subscriptionData && !subscriptionData.planName) {
        subscriptionData.planName = '';
      }
      
      setSubscription(subscriptionData);
      setDataLoaded(prev => ({ ...prev, subscription: true }));
      console.log('Subscription data loaded successfully:', subscriptionData.planName);
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
      {/* Header with refresh button */}
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
              </div>
            ) : (
              <p className="text-gray-500">No subscription found.</p>
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
