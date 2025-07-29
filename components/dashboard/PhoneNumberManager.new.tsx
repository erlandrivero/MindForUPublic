'use client';

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy
} from 'lucide-react';

interface PhoneNumber {
  id: string;
  number: string;
  assistantId?: string;
  status: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Assistant {
  id: string;
  name: string;
  vapiAssistantId: string;
  phoneNumber?: {
    id: string;
    number: string;
    status: string;
    areaCode?: string;
  };
}

const PhoneNumberManager = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [isUnassigning, setIsUnassigning] = useState(false);

  useEffect(() => {
    fetchPhoneNumbers();
    fetchAssistants();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/phone-numbers?t=${timestamp}`);
      if (!response.ok) throw new Error('Failed to fetch phone numbers');
      
      const data = await response.json();
      setPhoneNumbers(data.phoneNumbers || []);
    } catch (err) {
      console.error('Error fetching phone numbers:', err);
      setError('Failed to load phone numbers');
    }
  };

  const fetchAssistants = async () => {
    try {
      const response = await fetch('/api/dashboard/assistants');
      if (!response.ok) throw new Error('Failed to fetch assistants');
      
      const data = await response.json();
      setAssistants(data.assistants || []);
    } catch (err) {
      console.error('Error fetching assistants:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoneNumber = async (phoneNumberId: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return;
    
    try {
      const response = await fetch(`/api/phone-numbers?id=${phoneNumberId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete phone number');
      
      // Remove from state
      setPhoneNumbers(prev => prev.filter(p => p.id !== phoneNumberId));
    } catch (err) {
      console.error('Error deleting phone number:', err);
      alert('Failed to delete phone number');
    }
  };

  const assignPhoneNumber = async () => {
    if (!selectedPhoneNumber || !selectedAssistantId) return;
    
    try {
      setIsAssigning(true);
      setAssignError('');
      
      const assistant = assistants.find(a => a.id === selectedAssistantId);
      if (!assistant) {
        setAssignError('Selected assistant not found');
        return;
      }
      
      const response = await fetch(`/api/phone-numbers/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: selectedPhoneNumber.id,
          assistantId: assistant.vapiAssistantId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign phone number');
      }
      
      // Refresh data
      await fetchPhoneNumbers();
      await fetchAssistants();
      
      // Close modal
      setShowAssignModal(false);
      setSelectedPhoneNumber(null);
      setSelectedAssistantId('');
    } catch (err: any) {
      console.error('Error assigning phone number:', err);
      setAssignError(err.message || 'Failed to assign phone number');
    } finally {
      setIsAssigning(false);
    }
  };

  const unassignPhoneNumber = async (phoneNumberId: string) => {
    try {
      setIsUnassigning(true);
      
      const response = await fetch(`/api/phone-numbers/unassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unassign phone number');
      }
      
      // Add a delay to ensure Vapi API has time to process the unassignment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data with cache-busting
      await fetchPhoneNumbers();
      await fetchAssistants();
      
    } catch (err: any) {
      console.error('Error unassigning phone number:', err);
      alert(err.message || 'Failed to unassign phone number');
    } finally {
      setIsUnassigning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAssistantName = (assistantId?: string) => {
    if (!assistantId) return 'Unassigned';
    const assistant = assistants.find(a => a.vapiAssistantId === assistantId);
    return assistant ? assistant.name : 'Unknown Assistant';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Phone Number Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your phone numbers and assign them to assistants
          </p>
        </div>
        {/* Phone number creation removed completely */}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-teal-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Numbers</dt>
                  <dd className="text-lg font-medium text-gray-900">{phoneNumbers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Numbers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {phoneNumbers.filter(p => p.status === 'active').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Assigned Numbers</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {phoneNumbers.filter(p => p.assistantId).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Numbers List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Phone Numbers</h3>
        <p className="text-sm text-gray-500 mb-6">Manage and assign phone numbers to your AI assistants.</p>
        
        {phoneNumbers.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
            <Phone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No phone numbers</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any phone numbers yet. Contact support to add phone numbers to your account.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden sm:rounded-md">
            {phoneNumbers.map(phoneNumber => (
              <li key={phoneNumber.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Phone className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900 mr-2">{phoneNumber.number}</h4>
                        <button 
                          onClick={() => copyToClipboard(phoneNumber.number)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">{phoneNumber.name || 'Unnamed'}</p>
                      <div className="mt-2 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(phoneNumber.status)}`}>
                          {getStatusIcon(phoneNumber.status)}
                          <span className="ml-1 capitalize">{phoneNumber.status}</span>
                        </span>
                        
                        {phoneNumber.assistantId ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Assigned to: {getAssistantName(phoneNumber.assistantId)}
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {phoneNumber.assistantId ? (
                      <button
                        onClick={() => unassignPhoneNumber(phoneNumber.id)}
                        disabled={isUnassigning}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      >
                        {isUnassigning ? 'Unassigning...' : 'Unassign'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPhoneNumber(phoneNumber);
                          setShowAssignModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Assign
                      </button>
                    )}
                    
                    <button
                      onClick={() => deletePhoneNumber(phoneNumber.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assign Phone Number Modal */}
      {showAssignModal && selectedPhoneNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Assign Phone Number</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPhoneNumber(null);
                  setSelectedAssistantId('');
                  setAssignError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {assignError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{assignError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <p className="font-mono text-gray-900">{selectedPhoneNumber.number}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedPhoneNumber.name || 'Unnamed'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Assistant
                </label>
                {assistants.length === 0 ? (
                  <p className="text-sm text-gray-500">No assistants available</p>
                ) : (
                  <select
                    value={selectedAssistantId}
                    onChange={(e) => setSelectedAssistantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select an assistant...</option>
                    {assistants
                      .filter(assistant => !assistant.phoneNumber?.id)
                      .map(assistant => (
                        <option key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  💡 <strong>Note:</strong> Assigning a phone number to an assistant will allow callers to interact with this assistant when they call this number.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPhoneNumber(null);
                  setSelectedAssistantId('');
                  setAssignError('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                onClick={assignPhoneNumber}
                disabled={isAssigning || !selectedAssistantId}
                className="flex-1 px-4 py-2 bg-teal-500 text-white text-base font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Assign Number'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberManager;
