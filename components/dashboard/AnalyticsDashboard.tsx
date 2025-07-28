'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Phone, 
  Clock, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  callVolume: Array<{
    date: string;
    calls: number;
    successful: number;
    failed: number;
  }>;
  performanceMetrics: Array<{
    assistant: string;
    calls: number;
    successRate: number;
    avgDuration: number;
    satisfaction: number;
  }>;
  callTypes: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    calls: number;
  }>;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Real API integration
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Real API call to your existing analytics endpoint
        const response = await fetch(`/api/dashboard/analytics?range=${timeRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        
        setAnalyticsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        
        // Fallback to mock data if API fails
        const mockData: AnalyticsData = {
          callVolume: [
            { date: '2024-01-15', calls: 45, successful: 42, failed: 3 },
            { date: '2024-01-16', calls: 52, successful: 48, failed: 4 },
            { date: '2024-01-17', calls: 38, successful: 35, failed: 3 },
            { date: '2024-01-18', calls: 61, successful: 57, failed: 4 },
            { date: '2024-01-19', calls: 49, successful: 46, failed: 3 },
            { date: '2024-01-20', calls: 55, successful: 52, failed: 3 },
            { date: '2024-01-21', calls: 67, successful: 63, failed: 4 }
          ],
          performanceMetrics: [
            { assistant: 'Customer Service', calls: 156, successRate: 94.5, avgDuration: 3.4, satisfaction: 4.7 },
            { assistant: 'Sales Assistant', calls: 89, successRate: 87.2, avgDuration: 5.2, satisfaction: 4.3 },
            { assistant: 'Scheduler', calls: 67, successRate: 91.8, avgDuration: 2.8, satisfaction: 4.5 },
            { assistant: 'General Inquiry', calls: 45, successRate: 78.3, avgDuration: 2.1, satisfaction: 4.1 }
          ],
          callTypes: [
            { name: 'Customer Service', value: 45, color: '#14B8A6' },
            { name: 'Sales Inquiries', value: 25, color: '#3B82F6' },
            { name: 'Scheduling', value: 20, color: '#8B5CF6' },
            { name: 'General Info', value: 10, color: '#F59E0B' }
          ],
          hourlyDistribution: [
            { hour: '9 AM', calls: 12 },
            { hour: '10 AM', calls: 19 },
            { hour: '11 AM', calls: 15 },
            { hour: '12 PM', calls: 22 },
            { hour: '1 PM', calls: 18 },
            { hour: '2 PM', calls: 25 },
            { hour: '3 PM', calls: 20 },
            { hour: '4 PM', calls: 16 },
            { hour: '5 PM', calls: 8 }
          ]
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const exportData = () => {
    // TODO: Implement data export functionality
    alert('Export functionality will be implemented here');
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Calls',
      value: analyticsData?.summary?.totalCalls?.toString() || '0',
      change: '+12.3%', // TODO: Calculate from historical data
      changeType: 'increase',
      icon: Phone
    },
    {
      title: 'Success Rate',
      value: `${analyticsData?.summary?.successRate || 0}%`,
      change: '+2.1%', // TODO: Calculate from historical data
      changeType: 'increase',
      icon: TrendingUp
    },
    {
      title: 'Avg Duration',
      value: `${analyticsData?.summary?.avgDuration || 0}m`,
      change: '-0.3m', // TODO: Calculate from historical data
      changeType: 'decrease',
      icon: Clock
    },
    {
      title: 'Unique Callers',
      value: analyticsData?.summary?.uniqueCallers?.toString() || '0',
      change: 'No change', // TODO: Calculate from historical data
      changeType: 'neutral',
      icon: Users
    }
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your AI assistant performance and call analytics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* Time selection dropdown removed */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {/* Export button removed */}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div key={metric.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.changeType === 'increase' ? 'text-green-600' : 
                          metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.changeType === 'increase' ? (
                            <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                          ) : metric.changeType === 'decrease' ? (
                            <TrendingDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                          ) : null}
                          <span className="sr-only">
                            {metric.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                          </span>
                          {metric.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Call Volume Chart */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Call Volume Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.callVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successful" stackId="a" fill="#14B8A6" name="Successful" />
              <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Call Types Distribution */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Call Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.callTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData?.callTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Call Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calls" stroke="#14B8A6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics Table */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assistant Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assistant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData?.performanceMetrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {metric.assistant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.calls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.successRate >= 90 ? 'bg-green-100 text-green-800' :
                        metric.successRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.successRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.avgDuration}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{metric.satisfaction}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
