import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const { toast } = useToast();

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState({ user: null, isAuthenticated: false, token: null });
      return;
    }

    try {
      const user = await apiRequest<User>('/auth/me');
      if (user.status !== 'approved') {
        setAuthState({ user: null, isAuthenticated: false, token: null });
        localStorage.removeItem('token');
        toast({
          title: 'Account Pending',
          description: 'Your account is pending approval. Please wait for admin approval.',
          variant: 'destructive',
        });
        return;
      }
      setAuthState({ user, isAuthenticated: true, token });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({ user: null, isAuthenticated: false, token: null });
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.user.status !== 'approved') {
        toast({
          title: 'Account Pending',
          description: 'Your account is pending approval. Please wait for admin approval.',
          variant: 'destructive',
        });
        return;
      }

      localStorage.setItem('token', response.token);
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        token: response.token,
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      toast({
        title: 'Signup Successful',
        description: 'Your account has been created and is pending admin approval.',
      });
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, isAuthenticated: false, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
