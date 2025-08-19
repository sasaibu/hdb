import {useState, useEffect} from 'react';
import {User, LoginRequest} from '../types';
import {apiClient} from '../services/api/apiClient';
import KeychainService from '../services/KeychainService';

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
      const keychainService = KeychainService.getInstance();
      
      // Keychainからアクセストークンを確認
      const isTokenValid = await keychainService.isAccessTokenValid();
      
      if (isTokenValid) {
        const response = await apiClient.verifyToken();
        
        if (response.success && response.data?.user) {
          setAuthState({
            user: response.data.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // トークンが無効な場合はKeychainからクリア
          await keychainService.clearAllTokens();
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
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
        const keychainService = KeychainService.getInstance();
        
        // 認証トークンをKeychainに保存
        if (response.data.accessToken) {
          const expiry = response.data.expiresAt ? new Date(response.data.expiresAt) : undefined;
          await keychainService.saveAccessToken(response.data.accessToken, expiry);
        }
        
        if (response.data.refreshToken) {
          await keychainService.saveRefreshToken(response.data.refreshToken);
        }
        
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
      const keychainService = KeychainService.getInstance();
      
      await apiClient.logout();
      
      // Keychainから全ての認証情報をクリア
      await keychainService.clearAllTokens();
      
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // エラーがあってもローカルの状態とKeychainはクリア
      try {
        const keychainService = KeychainService.getInstance();
        await keychainService.clearAllTokens();
      } catch (keychainError) {
        console.error('Keychain clear error:', keychainError);
      }
      
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
