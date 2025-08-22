import React, { useState, useMemo } from 'react';
import { Heart, Users, Clock, UserCheck, LogOut, Plus, Search, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatisticsCard } from './StatisticsCard';
import { BloodRequestForm } from '../requests/BloodRequestForm';
import { DonationForm } from '../donations/DonationForm';
import { RequestsList } from '../requests/RequestsList';
import { DonationsList } from '../donations/DonationsList';
import { User, BloodRequest, Donation } from '../../types';
import { isDonorEligible } from '../../utils/bloodCompatibility';

export const MainDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  // Get data from localStorage
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const requests: BloodRequest[] = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
  const donations: Donation[] = JSON.parse(localStorage.getItem('donations') || '[]');

  const stats = useMemo(() => {
    const donors = users.filter(u => u.role === 'DONOR');
    const receivers = users.filter(u => u.role === 'RECEIVER');
    const openRequests = requests.filter(r => r.status === 'OPEN');

    return {
      totalDonations: donations.length,
      openRequests: openRequests.length,
      registeredDonors: donors.length,
      registeredReceivers: receivers.length
    };
  }, [users, requests, donations]);

  const eligibilityStatus = useMemo(() => {
    if (user?.role === 'DONOR') {
      return isDonorEligible(user);
    }
    return { eligible: false };
  }, [user]);

  const userRequests = requests.filter(r => r.userId === user?.id);
  const userDonations = donations.filter(d => d.donorId === user?.id);

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart },
    { id: 'requests', label: 'Blood Requests', icon: Clock },
    { id: 'donations', label: 'My Donations', icon: UserCheck },
    { id: 'profile', label: 'Profile', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Saviour Blood Donation</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role} • {user?.bloodType}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatisticsCard
                title="Total Donations"
                value={stats.totalDonations}
                icon={Heart}
                color="red"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatisticsCard
                title="Open Requests"
                value={stats.openRequests}
                icon={Clock}
                color="yellow"
                trend={{ value: -5.2, isPositive: false }}
              />
              <StatisticsCard
                title="Registered Donors"
                value={stats.registeredDonors}
                icon={UserCheck}
                color="green"
                trend={{ value: 18.1, isPositive: true }}
              />
              <StatisticsCard
                title="Total Users"
                value={users.length}
                icon={Users}
                color="blue"
                trend={{ value: 23.4, isPositive: true }}
              />
            </div>

            {/* Donor Eligibility Status */}
            {user?.role === 'DONOR' && (
              <div className={`p-6 rounded-xl border-2 ${
                eligibilityStatus.eligible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    eligibilityStatus.eligible 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    <Heart className={`w-6 h-6 ${
                      eligibilityStatus.eligible 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      eligibilityStatus.eligible 
                        ? 'text-green-900' 
                        : 'text-yellow-900'
                    }`}>
                      Donation Eligibility Status
                    </h3>
                    <p className={`${
                      eligibilityStatus.eligible 
                        ? 'text-green-700' 
                        : 'text-yellow-700'
                    }`}>
                      {eligibilityStatus.eligible 
                        ? '✅ You are eligible to donate blood!'
                        : `⏳ ${eligibilityStatus.reason}${eligibilityStatus.daysUntilEligible ? ` (${eligibilityStatus.daysUntilEligible} days remaining)` : ''}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {user?.role === 'RECEIVER' && (
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="w-full flex items-center space-x-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">Post Blood Request</span>
                    </button>
                  )}
                  {user?.role === 'DONOR' && eligibilityStatus.eligible && (
                    <button
                      onClick={() => setShowDonationForm(true)}
                      className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Heart className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">Donate Blood</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">View All Requests</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">Blood Requests</span>
                    </div>
                    <span className="font-bold text-gray-900">{userRequests.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="text-gray-700">Donations Made</span>
                    </div>
                    <span className="font-bold text-gray-900">{userDonations.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blood Requests Tab */}
        {activeTab === 'requests' && (
          <RequestsList 
            requests={requests} 
            users={users}
            currentUser={user!}
            onRequestSubmit={() => setShowRequestForm(true)}
          />
        )}

        {/* My Donations Tab */}
        {activeTab === 'donations' && (
          <DonationsList 
            donations={userDonations} 
            requests={requests}
            users={users}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <p className="text-gray-900">{user?.age} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900">{user?.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <p className="text-gray-900">{user?.bloodType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900">{user?.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900">{user?.gender}</p>
              </div>
              {user?.role === 'DONOR' && user?.lastDonatedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
                  <p className="text-gray-900">{new Date(user.lastDonatedDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showRequestForm && (
        <BloodRequestForm 
          onClose={() => setShowRequestForm(false)} 
          userId={user!.id}
        />
      )}
      
      {showDonationForm && (
        <DonationForm 
          onClose={() => setShowDonationForm(false)} 
          donorId={user!.id}
          requests={requests.filter(r => r.status === 'OPEN')}
          donor={user!}
        />
      )}
    </div>
  );
};