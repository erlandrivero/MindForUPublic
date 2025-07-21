import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Phone,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Edit,
  Trash2,
  Plus,
  Volume2,
  Mic,
  Activity
} from 'lucide-react';

const AIAssistantManager = () => {
  const [assistants, setAssistants] = useState([
    {
      id: 1,
      name: 'Customer Service Assistant',
      description: 'Handles customer inquiries, support tickets, and general questions',
      type: 'customer_service',
      status: 'active',
      icon: MessageSquare,
      color: 'bg-blue-500',
      stats: {
        calls: 342,
        avgDuration: '3:24',
        satisfaction: 4.8,
        uptime: '99.2%'
      },
      settings: {
        voice: 'Rachel (Professional Female)',
        language: 'English (US)',
        responseTime: 'Fast',
        personality: 'Professional & Helpful'
      }
    },
    {
      id: 2,
      name: 'Sales Lead Qualification',
      description: 'Qualifies leads, schedules appointments, and handles initial sales inquiries',
      type: 'sales',
      status: 'active',
      icon: Phone,
      color: 'bg-green-500',
      stats: {
        calls: 156,
        avgDuration: '5:12',
        satisfaction: 4.6,
        uptime: '98.8%'
      },
      settings: {
        voice: 'Adam (Confident Male)',
        language: 'English (US)',
        responseTime: 'Balanced',
        personality: 'Consultative & Results-Oriented'
      }
    },
    {
      id: 3,
      name: 'E-commerce Assistant',
      description: 'Handles orders, returns, product inquiries, and shopping assistance',
      type: 'ecommerce',
      status: 'active',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      stats: {
        calls: 89,
        avgDuration: '2:45',
        satisfaction: 4.9,
        uptime: '99.8%'
      },
      settings: {
        voice: 'Bella (Friendly Female)',
        language: 'English (US)',
        responseTime: 'Fast',
        personality: 'Helpful & Customer-Focused'
      }
    },
    {
      id: 4,
      name: 'Appointment Scheduling',
      description: 'Manages calendar, books appointments, and handles scheduling conflicts',
      type: 'scheduling',
      status: 'paused',
      icon: Calendar,
      color: 'bg-orange-500',
      stats: {
        calls: 234,
        avgDuration: '2:18',
        satisfaction: 4.7,
        uptime: '97.5%'
      },
      settings: {
        voice: 'Charlie (Professional Neutral)',
        language: 'English (US)',
        responseTime: 'Balanced',
        personality: 'Efficient & Organized'
      }
    }
  ]);

  const [selectedAssistant, setSelectedAssistant] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleAssistantStatus = (id) => {
    setAssistants(assistants.map(assistant => 
      assistant.id === id 
        ? { ...assistant, status: assistant.status === 'active' ? 'paused' : 'active' }
        : assistant
    ));
  };

  const AssistantCard = ({ assistant }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className={`${assistant.color} p-3 rounded-lg mr-4`}>
            <assistant.icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{assistant.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{assistant.description}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                assistant.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <Activity className="h-3 w-3 mr-1" />
                {assistant.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleAssistantStatus(assistant.id)}
            className={`p-2 rounded-md ${
              assistant.status === 'active'
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {assistant.status === 'active' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setSelectedAssistant(assistant)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assistant.stats.calls}</div>
          <div className="text-xs text-gray-500">Total Calls</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assistant.stats.avgDuration}</div>
          <div className="text-xs text-gray-500">Avg Duration</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assistant.stats.satisfaction}</div>
          <div className="text-xs text-gray-500">Satisfaction</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{assistant.stats.uptime}</div>
          <div className="text-xs text-gray-500">Uptime</div>
        </div>
      </div>
    </div>
  );

  const AssistantSettings = ({ assistant, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Configure {assistant.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Basic Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant Name
                </label>
                <input
                  type="text"
                  defaultValue={assistant.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Voice & Language</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Model
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Rachel (Professional Female)</option>
                  <option>Adam (Confident Male)</option>
                  <option>Bella (Friendly Female)</option>
                  <option>Charlie (Professional Neutral)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish (US)</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Time
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Fast (< 300ms)</option>
                  <option>Balanced (< 500ms)</option>
                  <option>Accurate (< 800ms)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personality
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Professional & Helpful</option>
                  <option>Friendly & Casual</option>
                  <option>Consultative & Results-Oriented</option>
                  <option>Efficient & Direct</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistants</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and configure your AI assistants for different business scenarios.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assistant
        </button>
      </div>

      {/* Assistants Grid */}
      <div className="space-y-6">
        {assistants.map((assistant) => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>

      {/* Quick Test Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Test</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test any of your assistants with a quick voice call to ensure they're working properly.
        </p>
        <div className="flex flex-wrap gap-3">
          {assistants.filter(a => a.status === 'active').map((assistant) => (
            <button
              key={assistant.id}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${assistant.color} hover:opacity-90`}
            >
              <Mic className="h-4 w-4 mr-2" />
              Test {assistant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {selectedAssistant && (
        <AssistantSettings
          assistant={selectedAssistant}
          onClose={() => setSelectedAssistant(null)}
        />
      )}
    </div>
  );
};

export default AIAssistantManager;

