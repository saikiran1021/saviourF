import React, { useState } from 'react';
import { User, Mail, Lock, MapPin, Calendar, Droplet, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateName, validateAge } from '../../utils/validation';
import { validateBloodType } from '../../utils/bloodCompatibility';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    location: '',
    bloodType: '',
    role: 'DONOR' as 'DONOR' | 'RECEIVER',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    lastDonatedDate: '',
    isDrunk: false,
    isSmoker: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.name)) {
      newErrors.name = 'Name must contain only letters and spaces';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format (must be @gmail.com)';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message!;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const age = parseInt(formData.age);
    if (!validateAge(age)) {
      newErrors.age = 'Age must be between 18 and 65 years';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!validateBloodType(formData.bloodType)) {
      newErrors.bloodType = 'Please select a valid blood type';
    }

    if (formData.role === 'DONOR') {
      if (formData.isDrunk) {
        newErrors.general = 'Donors who are currently drunk cannot register';
      }
      if (formData.isSmoker) {
        newErrors.general = 'Smokers cannot register as blood donors';
      }
      if (formData.lastDonatedDate) {
        const lastDonationDate = new Date(formData.lastDonatedDate);
        if (lastDonationDate > new Date()) {
          newErrors.lastDonatedDate = 'Last donation date cannot be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      password: formData.password,
      age: parseInt(formData.age),
      location: formData.location,
      bloodType: formData.bloodType.toUpperCase(),
      role: formData.role,
      gender: formData.gender,
      ...(formData.role === 'DONOR' && {
        lastDonatedDate: formData.lastDonatedDate ? new Date(formData.lastDonatedDate) : undefined,
        isDrunk: formData.isDrunk,
        isSmoker: formData.isSmoker
      })
    };

    const result = await signup(userData);
    setLoading(false);

    if (!result.success) {
      setErrors({ general: result.message });
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our blood donation community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@gmail.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Age"
                  min="18"
                  max="65"
                />
              </div>
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
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
                  <option value="">Select</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your city"
              />
            </div>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="DONOR"
                  checked={formData.role === 'DONOR'}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Blood Donor</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="RECEIVER"
                  checked={formData.role === 'RECEIVER'}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Blood Receiver</span>
              </label>
            </div>
          </div>

          {formData.role === 'DONOR' && (
            <div className="bg-red-50 p-6 rounded-lg space-y-4 border border-red-200">
              <h4 className="font-medium text-red-900 mb-4">Donor Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Donation Date (Optional)
                </label>
                <input
                  type="date"
                  name="lastDonatedDate"
                  value={formData.lastDonatedDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.lastDonatedDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.lastDonatedDate && <p className="text-red-500 text-sm mt-1">{errors.lastDonatedDate}</p>}
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDrunk"
                    checked={formData.isDrunk}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I am currently under the influence of alcohol</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isSmoker"
                    checked={formData.isSmoker}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">I am a smoker</span>
                </label>
              </div>

              {(formData.isDrunk || formData.isSmoker) && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">⚠️ Note: Donors who are drunk or smoke are not eligible for blood donation.</p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};