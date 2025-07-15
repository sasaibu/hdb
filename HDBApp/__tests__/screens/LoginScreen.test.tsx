import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert, TextInput, TouchableOpacity} from 'react-native';
import LoginScreen from '../../src/screens/LoginScreen';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock useAuth hook
const mockLogin = jest.fn();
const mockAuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: mockLogin,
  logout: jest.fn(),
  updateUser: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: jest.fn(),
  canGoBack: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  getId: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
};

const renderLoginScreen = () => {
  return render(<LoginScreen navigation={mockNavigation as any} />);
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.isLoading = false;
  });

  it('renders login form correctly', () => {
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    // Check that there are 2 input fields and 1 button
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    expect(inputs).toHaveLength(2);
    expect(buttons).toHaveLength(1);
  });

  it('updates input values when typing', () => {
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    // Find TextInput components
    const inputs = UNSAFE_getAllByType(TextInput);
    const userIdInput = inputs[0]; // First input is userId
    const passwordInput = inputs[1]; // Second input is password
    
    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');
    
    expect(userIdInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpass');
  });

  it('shows validation errors for empty fields', async () => {
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'ユーザーIDを入力してください');
    });
  });

  it('shows validation error for empty password', async () => {
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.changeText(inputs[0], 'testuser'); // userId input
    
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'パスワードを入力してください');
    });
  });

  it('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValue(true);
    
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.changeText(inputs[0], 'testuser'); // userId input
    fireEvent.changeText(inputs[1], 'testpass'); // password input
    
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });
  });

  it('navigates to Main screen on successful login', async () => {
    mockLogin.mockResolvedValue(true);
    
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.changeText(inputs[0], 'testuser'); // userId input
    fireEvent.changeText(inputs[1], 'testpass'); // password input
    
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue(false);
    
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.changeText(inputs[0], 'testuser'); // userId input
    fireEvent.changeText(inputs[1], 'wrongpass'); // password input
    
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'ログインに失敗しました');
    });
  });


  it('handles login error exception', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    
    const {UNSAFE_getAllByType} = renderLoginScreen();
    
    const inputs = UNSAFE_getAllByType(TextInput);
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.changeText(inputs[0], 'testuser'); // userId input
    fireEvent.changeText(inputs[1], 'testpass'); // password input
    
    const loginButton = buttons[0]; // Login button
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'ログインに失敗しました');
    });
  });
});
