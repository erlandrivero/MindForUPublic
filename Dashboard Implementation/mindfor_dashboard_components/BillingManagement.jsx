import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Mock data - replace with real data from your API
  const currentPlan = {
    name: 'Professional Plan',
    price: 249,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    status: 'active'
  };

  const usage = {
    minutes: {
      used: 342,
      total: 500,
      percentage: 68
    },
    apiCalls: {
      used: 8247,
      total: 10000,
      percentage: 82
    },
    storage: {
      used: 2.1,
      total: 5.0,
      percentage: 42,
      unit: 'GB'
    }
  };

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: 249.00,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-15',
      amount: 249.00,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-15',
      amount: 249.00,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    },
    {
      id: 'INV-2023-010',
      date: '2023-10-15',
      amount: 99.00,
      status: 'paid',
      description: 'Starter Plan - October 2023'
    }
  ];

  const plans = [
    {
      name: 'Starter Plan',
      price: 99,
      features: ['Basic voice AI', 'Standard support', '80 minutes', '30-day usage window'],
      current: false
    },
    {
      name: 'Professional Plan',
      price: 249,
      features: ['Advanced voice AI', 'Priority support', '250 minutes', 'Basic analytics'],
      current: true
    },
    {
      name: 'Business Plan',
      price: 499,
      features: ['Premium voice AI', 'Dedicated support', '600 minutes', 'Advanced analytics'],
      current: false
    },
    {
      name: 'Enterprise Plan',
      price: 999,
      features: ['Enterprise voice AI', '24/7 support', '1,500 minutes', 'Custom integrations'],
      current: false
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'usage', name: 'Usage' },
    { id: 'payment', name: 'Payment Methods' },
    { id: 'invoices', name: 'Invoices' },
    { id: 'plans', name: 'Plans' }
  ];

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
            <p className="text-teal-100 mt-1">
              ${currentPlan.price}/{currentPlan.billingCycle}
            </p>
            <div className="mt-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Active subscription</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-teal-100">Next billing</p>
            <p className="text-lg font-semibold">
              {new Date(currentPlan.nextBilling).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">$747</h4>
              <p className="text-sm text-gray-500">Total spent this year</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">68%</h4>
              <p className="text-sm text-gray-500">Usage this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">6 months</h4>
              <p className="text-sm text-gray-500">Customer since</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Billing Activity</h3>
        <div className="space-y-4">
          {invoices.slice(0, 3).map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="bg-green-50 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.description}</p>
                  <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">${invoice.amount}</p>
                <p className="text-sm text-green-600 capitalize">{invoice.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UsageTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Usage</h3>
        <div className="space-y-6">
          {/* Voice Minutes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Voice Minutes</span>
              <span className="text-sm text-gray-500">{usage.minutes.used} / {usage.minutes.total} minutes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-teal-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${usage.minutes.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{usage.minutes.percentage}% used</p>
          </div>

          {/* API Calls */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">API Calls</span>
              <span className="text-sm text-gray-500">{usage.apiCalls.used.toLocaleString()} / {usage.apiCalls.total.toLocaleString()} calls</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${usage.apiCalls.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{usage.apiCalls.percentage}% used</p>
          </div>

          {/* Storage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm text-gray-500">{usage.storage.used} / {usage.storage.total} {usage.storage.unit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${usage.storage.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{usage.storage.percentage}% used</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              You're approaching your monthly limits. Consider upgrading your plan to avoid service interruption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentMethodsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <button
          onClick={() => setShowAddPaymentMethod(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gray-50 p-3 rounded-lg mr-4">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {method.brand} ending in {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                  {method.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-1">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const InvoicesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                    <div className="text-sm text-gray-500">{invoice.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-teal-600 hover:text-teal-900 mr-3">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PlansTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Plans</h3>
        <p className="text-sm text-gray-500">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-lg border-2 p-6 ${
            plan.current 
              ? 'border-teal-500 bg-teal-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>
              {plan.current && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mt-2">
                  Current Plan
                </span>
              )}
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-teal-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {plan.current ? (
                <button className="w-full py-2 px-4 border border-teal-500 text-teal-500 rounded-md text-sm font-medium">
                  Current Plan
                </button>
              ) : (
                <button className="w-full py-2 px-4 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 flex items-center justify-center">
                  {plan.price > 249 ? 'Upgrade' : 'Downgrade'}
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'usage' && <UsageTab />}
      {activeTab === 'payment' && <PaymentMethodsTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
      {activeTab === 'plans' && <PlansTab />}
    </div>
  );
};

export default BillingManagement;

