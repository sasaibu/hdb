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
      expect(result.current.user).toEqual({
        id: '1',
        username: 'testuser',
        email: 'testuser@example.com'
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

    await act(async () => {
      await result.current.login(credentials);
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Then logout
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('updates user information', async () => {
    const {result} = renderHook(() => useAuth());
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const newUser = {
      id: '2',
      username: 'newuser',
      email: 'newuser@example.com'
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
