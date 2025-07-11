import {useState, useEffect} from 'react';
import {User, LoginRequest} from '../types';
import {apiClient} from '../services/api/apiClient';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiClient.verifyToken();
      
      if (response.success && response.data?.user) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setAuthState(prev => ({...prev, isLoading: true}));
      
      const response = await apiClient.login(credentials.username, credentials.password);
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return false;
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // エラーがあってもローカルの状態はクリア
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
    refresh: checkAuthStatus,
  };
}