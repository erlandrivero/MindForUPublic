'use client';

import React, { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Phone,
  Clock,
  TrendingUp,
  Users,
  Edit3,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// Type definitions
type AssistantType = 'customer_service' | 'appointment_scheduling' | 'sales_qualification' | 'general_assistant' | 'technical_support';

interface Assistant {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'paused';
  description: string;
  lastActive: string;
  callsToday: number;
  successRate: number;
  avgCallDuration: number;
  totalCalls: number;
}

const AIAssistantManager = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [testAssistant, setTestAssistant] = useState<any>(null);

  // Description templates for each assistant type
  const descriptionTemplates = {
    customer_service: "Customer service representative for [YOUR COMPANY] in [YOUR INDUSTRY]. Specializes in handling customer inquiries, resolving issues, and providing product support. Maintains a friendly and professional tone while helping customers with questions, complaints, and general assistance. Can escalate complex issues to human agents when needed. Cannot process payments or access sensitive account information.",
    
    appointment_scheduling: "Appointment scheduling assistant for [YOUR BUSINESS] in [YOUR INDUSTRY]. Specializes in booking, rescheduling, and managing appointments with customers. Maintains a professional and efficient approach while checking availability, confirming details, and sending appointment reminders. Can handle time zone conversions and basic scheduling conflicts. Cannot access medical records or process payments.",
    
    sales_qualification: "Sales qualification specialist for [YOUR COMPANY] in [YOUR INDUSTRY]. Specializes in qualifying leads using BANT criteria (Budget, Authority, Need, Timeline) and gathering prospect information. Maintains a consultative and professional approach while identifying sales opportunities and scheduling follow-up meetings. Can handle initial objections and provide basic product information. Cannot make pricing commitments or close deals without human approval.",
    
    general_assistant: "General business assistant for [YOUR COMPANY] in [YOUR INDUSTRY]. Specializes in handling general inquiries, providing company information, and directing calls to appropriate departments. Maintains a helpful and knowledgeable tone while assisting with basic customer needs and information requests. Can provide business hours, location details, and general service information. Cannot access confidential information or make business commitments.",
    
    technical_support: "Technical support specialist for [YOUR COMPANY] in [YOUR INDUSTRY]. Specializes in troubleshooting technical issues, providing product guidance, and resolving customer problems. Maintains a patient and knowledgeable approach while walking customers through solutions and escalating complex issues when needed. Can provide step-by-step instructions and basic technical information. Cannot access customer accounts or perform system modifications without proper authorization."
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: descriptionTemplates.customer_service, // Default to customer service template
    type: 'customer_service' as AssistantType,
    voice: 'alloy', // Add voice property directly to formData
    language: 'en', // Add language property directly to formData
    configuration: {
      voice: 'alloy',
      language: 'en'
    }
  });

  // Handle assistant type change and update description template
  const handleTypeChange = (newType: AssistantType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      description: descriptionTemplates[newType] // Auto-update description template
    }));
  };
  const [settingsData, setSettingsData] = useState({
    name: '',
    description: '',
    voice: 'alloy',
    language: 'en'
  });

  // Fetch assistants from API
  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/assistants');
      
      if (!response.ok) {
        throw new Error('Failed to fetch assistants');
      }
      
      const data = await response.json();
      setAssistants(data.assistants || []);
      setStats(data.stats || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching assistants:', err);
      setError('Failed to load assistants');
      // Fallback to mock data for development
      setAssistants([
        {
          id: '1',
          name: 'Customer Service AI Assistant',
          type: 'customer-service',
          status: 'active',
          description: 'Handles customer inquiries and support requests',
          lastActive: '2 minutes ago',
          callsToday: 23,
          successRate: 94.2,
          avgCallDuration: 4.5,
          totalCalls: 1247
        },
        {
          id: '2',
          name: 'Sales Assistant',
          type: 'sales',
          status: 'active',
          description: 'Qualifies leads and schedules appointments',
          lastActive: '15 minutes ago',
          callsToday: 18,
          successRate: 87.3,
          avgCallDuration: 6.2,
          totalCalls: 892
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  // Toggle assistant status
  const toggleAssistantStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/dashboard/assistants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAssistants(prev => 
          prev.map(assistant => 
            assistant.id === id ? { ...assistant, status: newStatus as any } : assistant
          )
        );
        alert(`Assistant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Failed to update assistant status. This feature is still in development.');
      }
    } catch (error) {
      console.error('Error updating assistant status:', error);
      alert('Failed to update assistant status. This feature is still in development.');
    }
  };

  // Handle settings button click
  const handleSettingsClick = (assistant: any) => {
    setSelectedAssistant(assistant);
    setSettingsData({
      name: assistant.name,
      description: assistant.description || '',
      voice: assistant.configuration?.voice || 'alloy',
      language: assistant.configuration?.language || 'en'
    });
    setShowSettingsModal(true);
  };

  // Handle test button click
  const handleTestClick = (assistant: any) => {
    if (assistant.status !== 'active') {
      alert('Assistant must be active to test. Please activate it first using the Play button.');
      return;
    }
    setTestAssistant(assistant);
    setShowTestModal(true);
  };

  // Vapi Web SDK client (same pattern as working demos)
  const [vapiClient] = useState(() => new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''));
  const [callActive, setCallActive] = useState(false);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);

  // Set up Vapi event listeners (same as working demos)
  useEffect(() => {
    const handleCallStart = () => {
      console.log('Vapi call started successfully');
      setCallActive(true);
      setVapiError(null);
    };

    const handleCallEnd = () => {
      console.log('Vapi call ended');
      setCallActive(false);
      setTranscript([]);
    };

    const handleError = (error: any) => {
      console.error('Vapi call error:', error);
      console.error('Vapi error details:', JSON.stringify(error, null, 2));
      
      // Extract meaningful error message
      let errorMessage = 'Unknown error';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }
      
      setVapiError(errorMessage);
      setCallActive(false);
    };

    const handleTranscript = (transcriptData: any) => {
      console.log('Vapi transcript:', transcriptData);
      setTranscript(prev => [...prev, transcriptData]);
    };

    vapiClient.on('call-start', handleCallStart);
    vapiClient.on('call-end', handleCallEnd);
    vapiClient.on('error', handleError);
    vapiClient.on('transcript', handleTranscript);

    return () => {
      vapiClient.off('call-start', handleCallStart);
      vapiClient.off('call-end', handleCallEnd);
      vapiClient.off('error', handleError);
      vapiClient.off('transcript', handleTranscript);
    };
  }, [vapiClient]);

  // Start call function (same pattern as working demos)
  const startCall = async (assistantId: string) => {
    try {
      console.log('Starting Vapi call with assistant ID:', assistantId);
      console.log('Assistant ID type:', typeof assistantId);
      console.log('Assistant ID length:', assistantId?.length);
      console.log('Is assistant ID valid format?', assistantId?.startsWith('vapi_') || assistantId?.length > 10);
      
      if (!assistantId || assistantId.trim() === '') {
        throw new Error('Assistant ID is empty or invalid');
      }
      
      setVapiError(null);
      await vapiClient.start(assistantId);
      console.log('Vapi call start request sent successfully');
    } catch (error) {
      console.error('Failed to start Vapi call:', error);
      setVapiError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  // End call function (same pattern as working demos)
  const endCall = async () => {
    try {
      console.log('Ending Vapi call...');
      await vapiClient.stop();
      console.log('Vapi call stop request sent successfully');
    } catch (error) {
      console.error('Error stopping Vapi call:', error);
    }
    setCallActive(false);
    setTranscript([]);
  };

  // Handle test call with real Vapi integration
  const handleStartTestCall = async () => {
    if (!testAssistant) return;
    
    setTestLoading(true);
    
    try {
      // Check microphone permissions first
      console.log('Checking microphone permissions...');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permError) {
        console.error('Microphone permission denied:', permError);
        alert('Microphone access is required for voice calls.\n\nPlease:\n1. Click the microphone icon in your browser address bar\n2. Allow microphone access\n3. Refresh the page and try again');
        setTestLoading(false);
        return;
      }
      
      console.log('Starting Vapi call with assistant ID:', testAssistant.vapiAssistantId);
      
      // Use the assistant's real Vapi ID for the call
      await startCall(testAssistant.vapiAssistantId);
      
      console.log('Vapi call initiated, vapiError:', vapiError);
      
      // Don't show success alert immediately - let the call status show instead
      
    } catch (error) {
      console.error('Test call error:', error);
      alert(`Failed to start test call: ${error}\n\nTroubleshooting:\n• Check microphone permissions\n• Ensure assistant is properly configured\n• Check browser console for details`);
    } finally {
      setTestLoading(false);
    }
  };

  // Handle ending test call
  const handleEndTestCall = () => {
    endCall();
    alert('Test call ended.');
  };

  // Handle settings form submission
  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssistant) return;
    
    setSettingsLoading(true);
    
    try {
      const updateData = {
        name: settingsData.name,
        description: settingsData.description,
        configuration: {
          voice: settingsData.voice,
          language: settingsData.language
        }
      };

      const response = await fetch(`/api/dashboard/assistants/${selectedAssistant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedAssistant = await response.json();
        // Update the assistant in the list
        setAssistants(prev => 
          prev.map(assistant => 
            assistant.id === selectedAssistant.id 
              ? { ...assistant, ...updateData, configuration: updateData.configuration }
              : assistant
          )
        );
        setShowSettingsModal(false);
        setSelectedAssistant(null);
        alert('Assistant settings updated successfully!');
      } else {
        const errorData = await response.text();
        alert(`Failed to update settings: ${errorData}`);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Delete assistant
  const deleteAssistant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assistant?')) return;
    
    try {
      const response = await fetch(`/api/dashboard/assistants/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAssistants(prev => prev.filter(assistant => assistant.id !== id));
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
    }
  };

  // Create new assistant
  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    
    try {
      // Format data for API - put voice and language in configuration
      const requestData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        configuration: {
          voice: formData.voice, // Now properly typed
          language: formData.language // Now properly typed
        }
      };

      const response = await fetch('/api/dashboard/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const newAssistant = await response.json();
        console.log('Assistant created successfully:', newAssistant);
        setAssistants(prev => [...prev, newAssistant]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          type: 'customer_service',
          description: '',
          voice: 'alloy',
          language: 'en'
        });
        // Refresh the data to update stats
        fetchAssistants();
      } else {
        // Get detailed error information
        const errorData = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        alert(`Failed to create assistant. Error: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Network/Request Error:', error);
      alert(`Network error creating assistant: ${error}`);
    } finally {
      setCreateLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Assistants</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistants</h1>
          <p className="text-gray-600">Manage your voice assistants and monitor their performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Assistant
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assistants</p>
              <p className="text-2xl font-bold text-gray-900">{assistants.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {assistants.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {assistants.reduce((sum, a) => sum + a.callsToday, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-teal-500">
              <Phone className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {assistants.length > 0 
                  ? Math.round(assistants.reduce((sum, a) => sum + a.successRate, 0) / assistants.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Assistants List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Assistants</h2>
        </div>
        
        {assistants.length === 0 ? (
          <div className="p-12 text-center">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assistants yet</h3>
            <p className="text-gray-600 mb-4">Create your first AI assistant to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Create Assistant
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-teal-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{assistant.name}</h3>
                          <p className="text-sm text-teal-600 font-medium capitalize">
                            {assistant.type.replace('_', ' ')} Assistant
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assistant.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : assistant.status === 'training'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assistant.status === 'active' && <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />}
                            {assistant.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600">{assistant.description}</p>
                      <p className="text-sm text-gray-500">Last active: {assistant.lastActive}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{assistant.callsToday}</p>
                      <p className="text-xs text-gray-500">Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{assistant.successRate}%</p>
                      <p className="text-xs text-gray-500">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{assistant.avgCallDuration}m</p>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAssistantStatus(assistant.id, assistant.status)}
                        className={`p-2 rounded-full transition-colors ${
                          assistant.status === 'active' 
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={assistant.status === 'active' ? 'Pause Assistant' : 'Activate Assistant'}
                      >
                        {assistant.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleTestClick(assistant)}
                        className={`p-2 rounded-full transition-colors ${
                          assistant.status === 'active'
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={assistant.status === 'active' ? 'Test Assistant' : 'Activate assistant first to test'}
                        disabled={assistant.status !== 'active'}
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleSettingsClick(assistant)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                        title="Assistant Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteAssistant(assistant.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                        title="Delete Assistant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assistant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New AI Assistant</h3>
            
            <form onSubmit={handleCreateAssistant} className="space-y-4">
              {/* Assistant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Customer Service AI Assistant"
                  required
                />
              </div>

              {/* Assistant Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value as AssistantType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="customer_service">Customer Service</option>
                  <option value="appointment_scheduling">Appointment Scheduling</option>
                  <option value="sales_qualification">Sales Qualification</option>
                  <option value="general_assistant">General Assistant</option>
                  <option value="technical_support">Technical Support</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  💡 This description trains your AI assistant. Replace [YOUR COMPANY] and [YOUR INDUSTRY] with your details. The template updates automatically when you change the assistant type.
                </p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="This will be auto-filled with a professional template based on your assistant type..."
                  rows={4}
                  required
                />
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={formData.voice}
                  onChange={(e) => setFormData({...formData, voice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Warm)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      type: 'customer-service',
                      description: '',
                      voice: 'alloy',
                      language: 'en'
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Assistant'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Assistant Settings</h3>
            
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              {/* Assistant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant Name *
                </label>
                <input
                  type="text"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({...settingsData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={settingsData.description}
                  onChange={(e) => setSettingsData({...settingsData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={settingsData.voice}
                  onChange={(e) => setSettingsData({...settingsData, voice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Male)</option>
                  <option value="fable">Fable (British)</option>
                  <option value="onyx">Onyx (Deep)</option>
                  <option value="nova">Nova (Female)</option>
                  <option value="shimmer">Shimmer (Warm)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={settingsData.language}
                  onChange={(e) => setSettingsData({...settingsData, language: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>

              {/* Current Type (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assistant Type
                </label>
                <input
                  type="text"
                  value={selectedAssistant.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Assistant type cannot be changed after creation</p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSelectedAssistant(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={settingsLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={settingsLoading}
                >
                  {settingsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && testAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Test Assistant</h3>
            
            <div className="space-y-4">
              {/* Assistant Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{testAssistant.name}</h4>
                    <p className="text-sm text-teal-600 capitalize">
                      {testAssistant.type.replace('_', ' ')} Assistant
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Voice:</strong> {testAssistant.configuration?.voice || 'Default'}</p>
                  <p><strong>Language:</strong> {testAssistant.configuration?.language || 'English'}</p>
                  <p><strong>Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
                </div>
              </div>

              {/* Test Options */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900">Test Options:</h5>
                
                {/* Call Status */}
                {callActive && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">Call Active</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">You are now connected to {testAssistant.name}</p>
                  </div>
                )}
                
                {/* Vapi Error Display */}
                {vapiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">Call Error: {vapiError}</p>
                  </div>
                )}
                
                {/* Call Controls */}
                <div className="flex space-x-2">
                  {!callActive ? (
                    <button
                      onClick={handleStartTestCall}
                      disabled={testLoading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Starting Call...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Start Voice Call</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleEndTestCall}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>End Call</span>
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  {callActive 
                    ? 'Speak naturally - your assistant will respond with voice.'
                    : 'This will start a live voice call with your assistant. Microphone access required.'
                  }
                </div>
                
                {/* Live Transcript */}
                {transcript.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-medium text-gray-900 mb-2">Live Transcript:</h6>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {transcript.slice(-5).map((msg, index) => (
                        <div key={index} className="text-xs mb-1">
                          <span className={`font-medium ${
                            msg.role === 'user' ? 'text-blue-600' : 'text-teal-600'
                          }`}>
                            {msg.role === 'user' ? 'You' : testAssistant.name}:
                          </span>
                          <span className="text-gray-700 ml-1">{msg.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setTestAssistant(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={testLoading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantManager;
