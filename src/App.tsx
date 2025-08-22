import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { MainDashboard } from './components/dashboard/MainDashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Saviour Blood Donation</h1>
            <p className="text-gray-600 text-lg">Connecting donors with those in need</p>
          </div>
          
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  return <MainDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;