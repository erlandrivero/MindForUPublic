import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Phone, 
  Clock, 
  Users, 
  Star,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('calls');

  // Mock data - replace with real data from your API
  const callVolumeData = [
    { date: '2024-01-15', calls: 45, duration: 180, satisfaction: 4.8 },
    { date: '2024-01-16', calls: 52, duration: 195, satisfaction: 4.6 },
    { date: '2024-01-17', calls: 38, duration: 165, satisfaction: 4.9 },
    { date: '2024-01-18', calls: 61, duration: 220, satisfaction: 4.7 },
    { date: '2024-01-19', calls: 48, duration: 175, satisfaction: 4.8 },
    { date: '2024-01-20', calls: 55, duration: 200, satisfaction: 4.9 },
    { date: '2024-01-21', calls: 42, duration: 160, satisfaction: 4.5 }
  ];

  const assistantPerformance = [
    { name: 'Customer Service', calls: 342, avgDuration: 204, satisfaction: 4.8, efficiency: 92 },
    { name: 'Sales Qualification', calls: 156, avgDuration: 312, satisfaction: 4.6, efficiency: 88 },
    { name: 'E-commerce Support', calls: 89, avgDuration: 165, satisfaction: 4.9, efficiency: 95 },
    { name: 'Appointment Scheduling', calls: 234, avgDuration: 138, satisfaction: 4.7, efficiency: 90 }
  ];

  const callOutcomes = [
    { name: 'Resolved', value: 68, color: '#10B981' },
    { name: 'Transferred', value: 18, color: '#F59E0B' },
    { name: 'Scheduled Callback', value: 10, color: '#3B82F6' },
    { name: 'Escalated', value: 4, color: '#EF4444' }
  ];

  const topMetrics = [
    {
      name: 'Total Calls',
      value: '1,247',
      change: '+12.5%',
      changeType: 'increase',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Avg Call Duration',
      value: '3:24',
      change: '-8.2%',
      changeType: 'decrease',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.3',
      changeType: 'increase',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Resolution Rate',
      value: '92.3%',
      change: '+5.1%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your AI assistant performance and business metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {topMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`${metric.bgColor} p-3 rounded-lg`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm text-gray-500">{metric.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Call Volume Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Call Volume Trend</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="calls">Calls</option>
              <option value="duration">Duration</option>
              <option value="satisfaction">Satisfaction</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={callVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  selectedMetric === 'satisfaction' ? `${value}/5` : value,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#14B8A6" 
                strokeWidth={3}
                dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Call Outcomes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Outcomes</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={callOutcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {callOutcomes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {callOutcomes.map((outcome) => (
              <div key={outcome.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: outcome.color }}
                ></div>
                <span className="text-sm text-gray-600">{outcome.name}</span>
                <span className="ml-auto text-sm font-medium text-gray-900">{outcome.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assistant Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Assistant Performance</h3>
          <p className="text-sm text-gray-500">Detailed metrics for each AI assistant</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assistant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assistantPerformance.map((assistant, index) => (
                <tr key={assistant.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assistant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assistant.calls.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Math.floor(assistant.avgDuration / 60)}:{(assistant.avgDuration % 60).toString().padStart(2, '0')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{assistant.satisfaction}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{ width: `${assistant.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{assistant.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-teal-600 hover:text-teal-900 mr-3">
                      View Details
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Peak Performance</h4>
              <p className="text-sm text-gray-500">Best performing hour: 2-3 PM</p>
              <p className="text-sm text-gray-500">92% resolution rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Customer Insights</h4>
              <p className="text-sm text-gray-500">Most common inquiry: Billing</p>
              <p className="text-sm text-gray-500">Avg satisfaction: 4.8/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-50 p-3 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Growth Metrics</h4>
              <p className="text-sm text-gray-500">Call volume: +12.5% this week</p>
              <p className="text-sm text-gray-500">Efficiency: +5.1% improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

