'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Home, 
  Bot, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  HelpCircle,
  Phone
} from 'lucide-react';
import ButtonAccount from "@/components/ButtonAccount";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab = 'overview' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { name: 'Overview', href: '/dashboard', icon: Home, current: activeTab === 'overview' },
    { name: 'AI Assistants', href: '/dashboard/assistants', icon: Bot, current: activeTab === 'assistants' },
    { name: 'Phone Numbers', href: '/dashboard/phone-numbers', icon: Phone, current: activeTab === 'phone-numbers' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: activeTab === 'analytics' },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard, current: activeTab === 'billing' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: activeTab === 'settings' },
  ];

  // Help & Support section removed
  const secondaryNavigation: { name: string; href: string; icon: any }[] = [];
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <Image 
              src="/Icon_Small-removebg-preview.png" 
              alt="MindForU logo" 
              width={32} 
              height={32} 
              className="mr-1" 
            />
            <h1 className="text-xl font-bold text-teal-600">MindForU</h1>
          </div>
          <nav className="mt-5 flex-shrink-0 h-full divide-y divide-gray-200 overflow-y-auto">
            <div className="px-2 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium border-l-4`}
                  >
                    <IconComponent className="mr-4 flex-shrink-0 h-6 w-6" />
                    {item.name}
                  </a>
                );
              })}
            </div>
            <div className="mt-6 pt-6">
              <div className="px-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium"
                    >
                      <IconComponent className="mr-4 flex-shrink-0 h-6 w-6" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Image 
              src="/Icon_Small-removebg-preview.png" 
              alt="MindForU logo" 
              width={32} 
              height={32} 
              className="mr-1" 
            />
            <h1 className="text-xl font-bold text-teal-600">MindForU</h1>
          </div>
          <nav className="mt-5 flex-1 flex flex-col divide-y divide-gray-200">
            <div className="px-2 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium border-l-4`}
                  >
                    <IconComponent className="mr-4 flex-shrink-0 h-6 w-6" />
                    {item.name}
                  </a>
                );
              })}
            </div>
            <div className="mt-6 pt-6 flex-1">
              <div className="px-2 space-y-1">
                {secondaryNavigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium"
                    >
                      <IconComponent className="mr-4 flex-shrink-0 h-6 w-6" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
            <div className="flex-1 flex">
              {/* Search can be added here if needed */}
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Account button - using your existing ButtonAccount component */}
              <ButtonAccount />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-8">
          <div className="bg-white lg:min-h-full lg:flex lg:flex-col">
            <div className="border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
