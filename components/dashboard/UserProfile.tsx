'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  // Mail, Phone, Edit3, and X imports removed as they're unused
  Shield, 
  Save, 
  Key, 
  AlertCircle, 
  CheckCircle,
  Camera
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  avatar: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  callAlerts: boolean;
  billingAlerts: boolean;
  marketingEmails: boolean;
}

const UserProfile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    callAlerts: true,
    billingAlerts: true,
    marketingEmails: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check localStorage first for saved profile data
        const savedUserData = localStorage.getItem('userProfileData');
        
        if (savedUserData) {
          // Use saved data if it exists
          setUserData(JSON.parse(savedUserData));
          setLoading(false);
          return;
        }
        
        // TODO: Replace with actual API call
        // const response = await fetch('/api/dashboard/profile');
        // const data = await response.json();
        
        // Mock data if no saved data exists
        const mockUserData: UserData = {
          id: 'user_1234567890',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Johnson Dental Practice',
          address: '123 Main Street',
          city: 'San Francisco',
          country: 'United States',
          timezone: 'America/Los_Angeles',
          avatar: '',
          emailVerified: true,
          phoneVerified: false,
          twoFactorEnabled: false
        };

        setUserData(mockUserData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Save to localStorage for persistence
      if (userData) {
        localStorage.setItem('userProfileData', JSON.stringify(userData));
      }
      
      // TODO: Implement actual API call when backend is ready
      // await fetch('/api/dashboard/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      
      // Simulate save delay
      setTimeout(() => {
        setSaving(false);
        alert('Profile updated successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveNotificationSettings = async () => {
    try {
      // TODO: Implement actual API call
      alert('Notification settings updated successfully!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const enableTwoFactor = async () => {
    try {
      // TODO: Implement 2FA setup
      alert('Two-factor authentication setup will be implemented here');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('File is too large. Maximum size is 1MB.');
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Only JPG, PNG, and GIF files are allowed.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && userData) {
        // Update user data with new avatar
        setUserData({
          ...userData,
          avatar: result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User }
    // Notifications and Security tabs removed
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings, notifications, and security preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && userData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Profile Information</h3>
            
            {/* Avatar Section */}
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="h-20 w-20 rounded-full" />
                ) : (
                  <User className="h-10 w-10 text-gray-600" />
                )}
              </div>
              <div className="ml-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-4 w-4 text-gray-600" aria-hidden="true" />
                </button>
                <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
                  />
                  {userData.emailVerified && (
                    <CheckCircle className="absolute right-3 top-2 h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 relative">
                  <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData(prev => prev ? {...prev, phone: e.target.value} : null)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm pr-10"
                  />
                  {!userData.phoneVerified && (
                    <AlertCircle className="absolute right-3 top-2 h-5 w-5 text-yellow-500" />
                  )}
                </div>
                {!userData.phoneVerified && (
                  <p className="mt-1 text-xs text-yellow-600">Phone number not verified</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  value={userData.company}
                  onChange={(e) => setUserData(prev => prev ? {...prev, company: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={userData.address}
                  onChange={(e) => setUserData(prev => prev ? {...prev, address: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={userData.city}
                  onChange={(e) => setUserData(prev => prev ? {...prev, city: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  value={userData.country}
                  onChange={(e) => setUserData(prev => prev ? {...prev, country: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={userData.timezone}
                  onChange={(e) => setUserData(prev => prev ? {...prev, timezone: e.target.value} : null)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                      {key === 'smsNotifications' && 'Receive SMS notifications for urgent matters'}
                      {key === 'callAlerts' && 'Get notified when calls are received or missed'}
                      {key === 'billingAlerts' && 'Receive billing and payment notifications'}
                      {key === 'marketingEmails' && 'Receive marketing emails and product updates'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`${
                      value ? 'bg-teal-600' : 'bg-gray-200'
                    } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                    onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                  >
                    <span
                      className={`${
                        value ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={saveNotificationSettings}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && userData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              {/* Password */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  aria-label="Change password"
                >
                  <Key className="w-4 h-4 mr-2" aria-hidden="true" />
                  Change Password
                </button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">
                    {userData.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={enableTwoFactor}
                  className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                    userData.twoFactorEnabled
                      ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                      : 'border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100'
                  }`}
                  aria-label={userData.twoFactorEnabled ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                >
                  <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
                  {userData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Login Sessions */}
              <div className="py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • San Francisco, CA</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    alert('Password change functionality will be implemented here');
                    setShowPasswordChange(false);
                  }}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
                  aria-label="Update password"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label="Cancel password change"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
