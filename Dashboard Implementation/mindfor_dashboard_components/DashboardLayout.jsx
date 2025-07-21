import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  User,
  LogOut,
  Bell
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab = 'dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'AI Assistants', href: '/assistants', icon: Bot, id: 'assistants' },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, id: 'analytics' },
    { name: 'Billing', href: '/billing', icon: CreditCard, id: 'billing' },
    { name: 'Settings', href: '/settings', icon: Settings, id: 'settings' },
    { name: 'Support', href: '/support', icon: HelpCircle, id: 'support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} activeTab={activeTab} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} activeTab={activeTab} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              {/* Search can be added here */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, activeTab }) => {
  return (
    <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex flex-shrink-0 items-center px-4 py-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-gray-900">MindForU</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-teal-50 border-r-2 border-teal-500 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 h-6 w-6 flex-shrink-0`}
              />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-teal-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                John Doe
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                Starter Plan
              </p>
            </div>
            <LogOut className="ml-auto h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

