import React, { useState } from 'react';
import { X, Heart, Droplet, MapPin, AlertTriangle } from 'lucide-react';
import { BloodRequest, User, Donation } from '../../types';
import { canDonateTo } from '../../utils/bloodCompatibility';

interface DonationFormProps {
  onClose: () => void;
  donorId: string;
  requests: BloodRequest[];
  donor: User;
}

export const DonationForm: React.FC<DonationFormProps> = ({ 
  onClose, 
  donorId, 
  requests, 
  donor 
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter requests that are compatible with donor's blood type and in same location
  const compatibleRequests = requests.filter(request => 
    canDonateTo(donor.bloodType, request.bloodType) &&
    request.hospitalArea.toLowerCase() === donor.location.toLowerCase() &&
    request.status === 'OPEN'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      setErrors({ request: 'Please select a blood request' });
      return;
    }

    setLoading(true);

    try {
      const donations: Donation[] = JSON.parse(localStorage.getItem('donations') || '[]');
      const bloodRequests: BloodRequest[] = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
      
      const selectedRequest = bloodRequests.find(r => r.id === selectedRequestId);
      if (!selectedRequest) {
        setErrors({ general: 'Selected request not found' });
        return;
      }

      // Create donation record
      const newDonation: Donation = {
        id: `DON-${Date.now()}`,
        donorId,
        requestId: selectedRequestId,
        donationDate: new Date(),
        unitsContributed: 1
      };

      donations.push(newDonation);
      localStorage.setItem('donations', JSON.stringify(donations));

      // Update request units needed
      selectedRequest.unitsNeeded -= 1;
      if (selectedRequest.unitsNeeded <= 0) {
        selectedRequest.status = 'FULFILLED';
      }
      localStorage.setItem('bloodRequests', JSON.stringify(bloodRequests));

      // Update donor's last donation date
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === donorId);
      if (userIndex !== -1) {
        users[userIndex].lastDonatedDate = new Date();
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }

      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to record donation. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (seriousness: string) => {
    switch (seriousness) {
      case 'HIGH': return 'border-red-200 bg-red-50';
      case 'MODERATE': return 'border-yellow-200 bg-yellow-50';
      case 'LOW': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Record Blood Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.general}
            </div>
          )}

          {compatibleRequests.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Compatible Requests</h3>
              <p className="text-gray-500">
                There are currently no open blood requests in your area that match your blood type ({donor.bloodType}).
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select a Blood Request to Fulfill
                </label>
                {errors.request && <p className="text-red-500 text-sm mb-3">{errors.request}</p>}
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {compatibleRequests.map((request) => (
                    <label
                      key={request.id}
                      className={`block cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                        selectedRequestId === request.id
                          ? 'border-red-500 bg-red-50'
                          : `border-gray-200 hover:${getUrgencyColor(request.seriousness)}`
                      } ${getUrgencyColor(request.seriousness)}`}
                    >
                      <input
                        type="radio"
                        name="request"
                        value={request.id}
                        checked={selectedRequestId === request.id}
                        onChange={(e) => setSelectedRequestId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{request.bloodType}</span>
                              <span className="text-gray-600">•</span>
                              <span className="text-gray-600">{request.unitsNeeded} units needed</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{request.hospitalArea}</span>
                              </div>
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.seriousness === 'HIGH' ? 'bg-red-100 text-red-800' :
                            request.seriousness === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.seriousness === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {request.seriousness}
                          </span>
                          <span className="text-xs text-gray-400">{request.id}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Donation Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You will be donating 1 unit of {donor.bloodType} blood. After donation, you will need to wait{' '}
                      {donor.gender === 'MALE' ? '90' : '120'} days before your next donation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedRequestId}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Recording...' : 'Confirm Donation'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};