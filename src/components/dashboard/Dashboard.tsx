import React, { useMemo } from 'react';
import { Users, Heart, Clock, UserCheck } from 'lucide-react';
import { StatisticsCard } from './StatisticsCard';
import { User, BloodRequest, Donation, AppStats } from '../../types';

interface DashboardProps {
  users: User[];
  requests: BloodRequest[];
  donations: Donation[];
}

export const Dashboard: React.FC<DashboardProps> = ({ users, requests, donations }) => {
  const stats: AppStats = useMemo(() => {
    const donors = users.filter(user => user.role === 'DONOR');
    const receivers = users.filter(user => user.role === 'RECEIVER');
    const openRequests = requests.filter(request => request.status === 'OPEN');

    return {
      totalDonations: donations.length,
      openRequests: openRequests.length,
      registeredDonors: donors.length,
      registeredReceivers: receivers.length
    };
  }, [users, requests, donations]);

  const recentActivity = useMemo(() => {
    const recent = [...donations]
      .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
      .slice(0, 5);

    return recent.map(donation => {
      const donor = users.find(u => u.id === donation.donorId);
      const request = requests.find(r => r.id === donation.requestId);
      return {
        ...donation,
        donorName: donor?.name || 'Unknown',
        bloodType: request?.bloodType || 'Unknown'
      };
    });
  }, [donations, users, requests]);

  const urgentRequests = useMemo(() => {
    return requests
      .filter(request => request.status === 'OPEN' && request.seriousness === 'HIGH')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 3);
  }, [requests]);

  return (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-sm">
                        {activity.bloodType}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.donorName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.donationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.unitsContributed} {activity.unitsContributed === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No donations recorded yet</p>
            </div>
          )}
        </div>

        {/* Urgent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Requests</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          
          {urgentRequests.length > 0 ? (
            <div className="space-y-4">
              {urgentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold text-sm">
                        {request.bloodType}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.hospitalArea}</p>
                      <p className="text-sm text-gray-500">
                        {request.unitsNeeded} {request.unitsNeeded === 1 ? 'unit' : 'units'} needed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      HIGH
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No urgent requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};