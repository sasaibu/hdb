import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import SplashScreen from '../../src/screens/SplashScreen';
import {useAuth} from '../../src/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../src/hooks/useAuth');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
};

describe('SplashScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with logo and app name', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const {getByText} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByText('HDB')).toBeTruthy();
    expect(getByText('Health Data Bank')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('navigates to Login screen when not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    // タイマーを進めて遷移を待つ
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });

  it('navigates to Main screen when authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    // タイマーを進めて遷移を待つ
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });

  it('waits for auth loading to complete before navigation', async () => {
    // 最初はローディング中
    const {rerender} = render(
      <SplashScreen navigation={mockNavigation as any} />
    );
    
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    // タイマーを進める
    jest.advanceTimersByTime(1500);

    // まだナビゲーションは呼ばれていない
    expect(mockReplace).not.toHaveBeenCalled();

    // ローディング完了
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    rerender(<SplashScreen navigation={mockNavigation as any} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });
  });

  it('displays loading indicator', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const {getByTestId} = render(<SplashScreen navigation={mockNavigation as any} />);
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles minimum display time correctly', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<SplashScreen navigation={mockNavigation as any} />);

    // 1秒後にはまだナビゲーションされていない
    jest.advanceTimersByTime(1000);
    expect(mockReplace).not.toHaveBeenCalled();

    // 1.5秒後にナビゲーションされる
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });
});