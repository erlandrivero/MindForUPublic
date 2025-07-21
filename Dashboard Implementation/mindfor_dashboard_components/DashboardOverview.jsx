import React from 'react';
import { 
  Phone, 
  Clock, 
  TrendingUp, 
  Users, 
  PlayCircle,
  Settings,
  BarChart3,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const DashboardOverview = () => {
  // Mock data - replace with real data from your API
  const stats = [
    {
      name: 'Total Calls',
      value: '1,247',
      change: '+12%',
      changeType: 'increase',
      icon: Phone,
      color: 'bg-blue-500'
    },
    {
      name: 'Minutes Used',
      value: '342/500',
      change: '68% used',
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-teal-500'
    },
    {
      name: 'Conversion Rate',
      value: '24.3%',
      change: '+5.2%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: 'Active Assistants',
      value: '4',
      change: 'All running',
      changeType: 'neutral',
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'call',
      title: 'Customer Service Call',
      description: 'Handled billing inquiry for John Smith',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'New appointment booked for Sarah Johnson',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'lead',
      title: 'Lead Qualified',
      description: 'High-value lead identified and forwarded',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Usage Alert',
      description: 'Approaching monthly minute limit',
      time: '2 hours ago',
      status: 'warning'
    }
  ];

  const quickActions = [
    {
      name: 'Start Demo',
      description: 'Test your AI assistants',
      icon: PlayCircle,
      href: '/demo',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      name: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Manage Assistants',
      description: 'Configure AI settings',
      icon: Settings,
      href: '/assistants',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Schedule Meeting',
      description: 'Book consultation call',
      icon: Calendar,
      href: '/support',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your AI assistants.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.href}
                    className={`${action.color} text-white p-4 rounded-lg block hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center">
                      <action.icon className="h-6 w-6 mr-3" />
                      <div>
                        <div className="font-medium">{action.name}</div>
                        <div className="text-sm opacity-90">{action.description}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.status === 'completed' ? 'bg-green-500' :
                              activity.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {activity.type === 'call' && <Phone className="h-4 w-4 text-white" />}
                              {activity.type === 'appointment' && <Calendar className="h-4 w-4 text-white" />}
                              {activity.type === 'lead' && <Users className="h-4 w-4 text-white" />}
                              {activity.type === 'alert' && <AlertCircle className="h-4 w-4 text-white" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 font-medium">
                                {activity.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {activity.description}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Monthly Usage
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Voice Minutes</span>
                  <span>342 / 500 minutes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>API Calls</span>
                  <span>8,247 / 10,000 calls</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Storage</span>
                  <span>2.1 / 5.0 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Usage resets on the 15th of each month. 
              <a href="/billing" className="text-teal-600 hover:text-teal-500 ml-1">
                Upgrade plan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

