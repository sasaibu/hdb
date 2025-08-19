import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useAuth} from '../../src/hooks/useAuth';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('initializes with correct default state', () => {
    const {result} = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates loading state after initialization', async () => {
    const {result} = renderHook(() => useAuth());
    
    expect(result.current.isLoading).toBe(true);
    
    // Fast-forward time to complete checkAuthStatus
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles successful login', async () => {
    const {result} = renderHook(() => useAuth());
    
    // Wait for initial loading to complete
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const credentials = {
      username: 'testuser',
      password: 'password123'
    };

    let loginResult: boolean | undefined;
    
    act(() => {
      result.current.login(credentials).then(success => {
        loginResult = success;
      });
    });
    
    // Fast-forward the login mock delay
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(loginResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      // Use the actual API response format
      expect(result.current.user).toEqual({
        id: 'user-001',
        username: 'testuser',
        email: 'tanaka@example.com',
        displayName: '田中太郎',
        avatar: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      });
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles logout', async () => {
    const {result} = renderHook(() => useAuth());
    
    // First login
    act(() => {
      jest.advanceTimersByTime(1000); // Complete initial loading
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const credentials = {
      username: 'testuser',
      password: 'password123'
    };

    let loginResult: boolean | undefined;
    
    act(() => {
      result.current.login(credentials).then(success => {
        loginResult = success;
      });
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(loginResult).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Then logout
    let logoutComplete = false;
    act(() => {
      result.current.logout().then(() => {
        logoutComplete = true;
      });
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(logoutComplete).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  }, 15000);

  it('updates user information', async () => {
    const {result} = renderHook(() => useAuth());
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newUser = {
      id: 'user-002',
      username: 'newuser',
      email: 'newuser@example.com',
      displayName: '新ユーザー',
      avatar: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    };

    act(() => {
      result.current.updateUser(newUser);
    });
    
    expect(result.current.user).toEqual(newUser);
  });

  it('handles refresh/checkAuthStatus', async () => {
    const {result} = renderHook(() => useAuth());
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.refresh();
    });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
