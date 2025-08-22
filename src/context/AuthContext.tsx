import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ user, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (user) {
        setAuthState({ user, isAuthenticated: true });
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some((u: User) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email already registered' };
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      setAuthState({ user: newUser, isAuthenticated: true });
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setAuthState({ user: null, isAuthenticated: false });
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};