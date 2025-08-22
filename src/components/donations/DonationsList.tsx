import React from 'react';
import { Heart, Clock, MapPin, Droplet } from 'lucide-react';
import { Donation, BloodRequest, User } from '../../types';

interface DonationsListProps {
  donations: Donation[];
  requests: BloodRequest[];
  users: User[];
}

export const DonationsList: React.FC<DonationsListProps> = ({ 
  donations, 
  requests, 
  users 
}) => {
  const getDonationDetails = (donation: Donation) => {
    const request = requests.find(r => r.id === donation.requestId);
    const requester = request ? users.find(u => u.id === request.userId) : null;
    
    return {
      request,
      requesterName: requester?.name || 'Unknown',
      bloodType: request?.bloodType || 'Unknown',
      location: request?.hospitalArea || 'Unknown'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Donations</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Donations</p>
          <p className="text-2xl font-bold text-red-600">{donations.length}</p>
        </div>
      </div>

      {donations.length > 0 ? (
        <div className="grid gap-4">
          {donations.map((donation) => {
            const details = getDonationDetails(donation);
            return (
              <div key={donation.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {details.bloodType} Blood Donation
                      </h3>
                      <p className="text-sm text-gray-600">
                        Donated to {details.requesterName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{donation.unitsContributed} unit</p>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Type: {details.bloodType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{details.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(donation.donationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Request ID: {donation.requestId} • Donation ID: {donation.id}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
          <p className="text-gray-500">
            When you make your first blood donation, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
};