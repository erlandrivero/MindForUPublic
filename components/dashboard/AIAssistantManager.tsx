'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  BarChart3,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Assistant {
  _id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  vapiAssistantId: string;
  isImported?: boolean;
  phoneNumber?: {
    phoneNumber: string;
    status: string;
  };
}

interface ImportResult {
  imported: number;
  skipped: number;
}

interface AssistantStats {
  totalAssistants: number;
  activeAssistants: number;
  totalCallsToday: number;
  avgSuccessRate: number;
}

const AIAssistantManager = () => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [stats, setStats] = useState<AssistantStats>({
    totalAssistants: 0,
    activeAssistants: 0,
    totalCallsToday: 0,
    avgSuccessRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setIsLoading(true);
      
      // Fetch assistants
      const assistantsResponse = await fetch('/api/dashboard/assistants');
      if (!assistantsResponse.ok) {
        throw new Error('Failed to fetch assistants');
      }
      const assistantsData = await assistantsResponse.json();
      setAssistants(assistantsData);
      
      // Fetch call stats directly from Vapi
      const statsResponse = await fetch('/api/vapi/call-stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch call statistics');
      }
      const statsData = await statsResponse.json();
      
      // Update assistants with their stats
      const updatedAssistants = assistantsData.map((assistant: any) => {
        const assistantStats = statsData.assistantStats.find(
          (stats: any) => stats.assistantId === assistant._id
        );
        
        if (assistantStats) {
          return {
            ...assistant,
            statistics: {
              totalCalls: assistantStats.totalCalls,
              callsToday: assistantStats.callsToday,
              avgDuration: assistantStats.avgDuration,
              successRate: assistantStats.successRate,
              lastActiveTimestamp: assistantStats.lastActiveTimestamp
            }
          };
        }
        return assistant;
      });
      
      setAssistants(updatedAssistants);
      
      // Set overall stats
      setStats({
        totalAssistants: assistantsData.length,
        activeAssistants: assistantsData.filter((a: Assistant) => a.status === 'active').length,
        totalCallsToday: statsData.overallStats.callsToday,
        avgSuccessRate: statsData.overallStats.avgSuccessRate
      });
    } catch (err) {
      setError('Error fetching assistants');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to manually refresh call stats
  const refreshCallStats = async () => {
    try {
      toast.loading('Refreshing call statistics...');
      await fetchAssistants();
      toast.dismiss();
      toast.success('Call statistics refreshed');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to refresh call statistics');
      console.error('Error refreshing call stats:', err);
    }
  };

  const importVapiAssistants = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);
      
      const response = await fetch('/api/dashboard/assistants/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import assistants');
      }
      
      const result = await response.json();
      setImportResult(result);
      
      // Refresh the assistants list
      fetchAssistants();
      
      // toast.success(`Successfully imported ${result.imported} assistant(s)`);
    } catch (err: any) {
      setError(err.message || 'Error importing assistants');
      // toast.error('Failed to import assistants');
      console.error(err);
    } finally {
      setIsImporting(false);
      
      // Clear the import result after 5 seconds
      setTimeout(() => {
        setImportResult(null);
      }, 5000);
    }
  };

  const toggleAssistantStatus = async (assistant: Assistant) => {
    try {
      const newStatus = assistant.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/dashboard/assistants/${assistant._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update assistant status');
      }

      // Update local state
      setAssistants(prevAssistants => 
        prevAssistants.map(a => 
          a._id === assistant._id ? { ...a, status: newStatus } : a
        )
      );

      // toast.success(`Assistant ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      // toast.error('Failed to update assistant status');
      console.error(err);
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    if (!confirm('Are you sure you want to delete this assistant?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/assistants/${assistantId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete assistant');
      }

      // Update local state
      setAssistants(prevAssistants => 
        prevAssistants.filter(a => a._id !== assistantId)
      );

      // toast.success('Assistant deleted');
    } catch (err) {
      // toast.error('Failed to delete assistant');
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer_service':
        return 'bg-blue-100 text-blue-800';
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'scheduling':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your AI assistants for optimal performance.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={importVapiAssistants}
            disabled={isImporting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-5 w-5 mr-1" />
            {isImporting ? 'Importing...' : 'Import from Vapi'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Create Assistant
          </button>
        </div>
      </div>
      {/* Import Result Alert */}
      {importResult && (
        <div className={`mb-4 p-4 rounded-md ${importResult.imported > 0 ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
          {importResult.imported > 0 ? (
            <p className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Successfully imported {importResult.imported} assistant{importResult.imported !== 1 ? 's' : ''} from Vapi
            </p>
          ) : (
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              No new assistants found to import from Vapi
            </p>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
          <p className="flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-teal-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Assistants</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeAssistants}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Calls Today</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCallsToday}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assistants</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalAssistants}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assistants List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your AI Assistants</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage your AI assistants and monitor their performance.
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {assistants.length > 0 ? (
            assistants.map((assistant) => (
              <li key={assistant._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center">
                      {getStatusIcon(assistant.status)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{assistant.name}</h3>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(assistant.status)}`}>
                        {assistant.status}
                      </span>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(assistant.type)}`}>
                        {assistant.type}
                      </span>
                      {assistant.isImported && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Imported
                        </span>
                      )}
                    </div>
                    
                    {assistant.phoneNumber && (
                      <div className="mt-2 flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="font-mono font-semibold">{assistant.phoneNumber?.phoneNumber}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          assistant.phoneNumber?.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assistant.phoneNumber?.status}
                        </span>
                        <p className="ml-2 text-xs text-indigo-600">
                          Customers can call this number
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleAssistantStatus(assistant)}
                    className={`p-2 rounded-full ${assistant.status === 'active' ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'}`}
                    title={assistant.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {assistant.status === 'active' ? <Pause className="h-4 w-4 text-red-600" /> : <Play className="h-4 w-4 text-green-600" />}
                  </button>
                  
                  {assistant.vapiAssistantId && (
                    <a
                      href={`https://app.vapi.ai/dashboard/assistants/${assistant.vapiAssistantId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                      title="Open in Vapi"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                    </a>
                  )}
                  
                  <button
                    onClick={() => setSelectedAssistant(assistant)}
                    className="p-2 rounded-full bg-yellow-100 hover:bg-yellow-200"
                    title="Edit Assistant"
                  >
                    <Edit3 className="h-4 w-4 text-yellow-600" />
                  </button>
                  
                  <button
                    onClick={() => deleteAssistant(assistant._id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                    title="Delete Assistant"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-center text-gray-500">
              No assistants found. Import existing assistants from Vapi or create a new one.
            </li>
          )}
        </ul>
      </div>

      {/* Create Assistant Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Create New Assistant</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Assistant creation interface will be implemented here.
                  This will connect to your Vapi configuration.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-teal-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
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
