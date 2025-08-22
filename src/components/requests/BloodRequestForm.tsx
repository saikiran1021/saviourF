import React, { useState } from 'react';
import { X, Heart, MapPin, Droplet } from 'lucide-react';
import { validateBloodType } from '../../utils/bloodCompatibility';
import { BloodRequest } from '../../types';

interface BloodRequestFormProps {
  onClose: () => void;
  userId: string;
}

export const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onClose, userId }) => {
  const [formData, setFormData] = useState({
    bloodType: '',
    hospitalArea: '',
    unitsNeeded: 1,
    seriousness: 'MODERATE' as 'LOW' | 'MODERATE' | 'HIGH'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'unitsNeeded' ? parseInt(value) || 1 : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateBloodType(formData.bloodType)) {
      newErrors.bloodType = 'Please select a valid blood type';
    }

    if (!formData.hospitalArea.trim()) {
      newErrors.hospitalArea = 'Hospital area is required';
    }

    if (formData.unitsNeeded < 1 || formData.unitsNeeded > 10) {
      newErrors.unitsNeeded = 'Units needed must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const requests: BloodRequest[] = JSON.parse(localStorage.getItem('bloodRequests') || '[]');
      const newRequest: BloodRequest = {
        id: `REQ-${Date.now()}`,
        userId,
        bloodType: formData.bloodType.toUpperCase(),
        hospitalArea: formData.hospitalArea,
        unitsNeeded: formData.unitsNeeded,
        seriousness: formData.seriousness,
        status: 'OPEN',
        createdAt: new Date()
      };

      requests.push(newRequest);
      localStorage.setItem('bloodRequests', JSON.stringify(requests));
      
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to submit request. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Post Blood Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Blood Type
            </label>
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.bloodType ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Area
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="hospitalArea"
                value={formData.hospitalArea}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.hospitalArea ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter hospital area/city"
              />
            </div>
            {errors.hospitalArea && <p className="text-red-500 text-sm mt-1">{errors.hospitalArea}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units Needed
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                name="unitsNeeded"
                value={formData.unitsNeeded}
                onChange={handleChange}
                min="1"
                max="10"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.unitsNeeded ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.unitsNeeded && <p className="text-red-500 text-sm mt-1">{errors.unitsNeeded}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              name="seriousness"
              value={formData.seriousness}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
            </select>
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
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};