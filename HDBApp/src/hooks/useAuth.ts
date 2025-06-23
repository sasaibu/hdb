import {useState, useEffect} from 'react';
import {User, LoginRequest} from '../types';

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
    // TODO: AsyncStorageから認証状態を復元
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: トークンの有効性チェック
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
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
      
      // TODO: 実際のログインAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
      };

      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return true;
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
      // TODO: ログアウトAPI呼び出し、トークン削除
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
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