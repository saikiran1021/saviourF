import React, { useState } from 'react';
import { Clock, MapPin, Droplet, AlertTriangle, Plus, Search } from 'lucide-react';
import { BloodRequest, User } from '../../types';

interface RequestsListProps {
  requests: BloodRequest[];
  users: User[];
  currentUser: User;
  onRequestSubmit: () => void;
}

export const RequestsList: React.FC<RequestsListProps> = ({ 
  requests, 
  users, 
  currentUser, 
  onRequestSubmit 
}) => {
  const [filter, setFilter] = useState<'all' | 'open' | 'my'>('all');
  const [searchBloodType, setSearchBloodType] = useState('');

  const filteredRequests = requests.filter(request => {
    if (filter === 'open' && request.status !== 'OPEN') return false;
    if (filter === 'my' && request.userId !== currentUser.id) return false;
    if (searchBloodType && !request.bloodType.toLowerCase().includes(searchBloodType.toLowerCase())) return false;
    return true;
  });

  const getUrgencyColor = (seriousness: string) => {
    switch (seriousness) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Blood Requests</h2>
        {currentUser.role === 'RECEIVER' && (
          <button
            onClick={onRequestSubmit}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'open' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open Only
            </button>
            <button
              onClick={() => setFilter('my')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'my' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Requests
            </button>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by blood type..."
              value={searchBloodType}
              onChange={(e) => setSearchBloodType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Droplet className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.bloodType} Blood Needed
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested by {getUserName(request.userId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{request.hospitalArea}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplet className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{request.unitsNeeded} units</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        request.status === 'OPEN' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.seriousness)}`}>
                    {request.seriousness === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {request.seriousness}
                  </span>
                  <p className="text-xs text-gray-500">ID: {request.id}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filter === 'my' 
                ? "You haven't posted any requests yet." 
                : "No blood requests match your current filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};