import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../../src/screens/LoginScreen';

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

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      replace: mockReplace,
    }),
  };
});

const Stack = createStackNavigator();

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const {getByPlaceholderText, getByText} = renderWithNavigation(<LoginScreen />);
    
    expect(getByText('Health Data Bank')).toBeTruthy();
    expect(getByText('ログイン')).toBeTruthy();
    expect(getByPlaceholderText('ユーザー名')).toBeTruthy();
    expect(getByPlaceholderText('パスワード')).toBeTruthy();
    expect(getByText('ログイン')).toBeTruthy();
  });

  it('updates input values when typing', () => {
    const {getByPlaceholderText} = renderWithNavigation(<LoginScreen />);
    
    const usernameInput = getByPlaceholderText('ユーザー名');
    const passwordInput = getByPlaceholderText('パスワード');
    
    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpass');
    
    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('testpass');
  });

  it('shows validation errors for empty fields', async () => {
    const {getByText} = renderWithNavigation(<LoginScreen />);
    
    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(getByText('ユーザー名を入力してください')).toBeTruthy();
      expect(getByText('パスワードを入力してください')).toBeTruthy();
    });
  });

  it('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValue(true);
    
    const {getByPlaceholderText, getByText} = renderWithNavigation(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('ユーザー名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'testpass');
    
    fireEvent.press(getByText('ログイン'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });
  });

  it('navigates to Main screen on successful login', async () => {
    mockLogin.mockResolvedValue(true);
    
    const {getByPlaceholderText, getByText} = renderWithNavigation(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('ユーザー名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'testpass');
    
    fireEvent.press(getByText('ログイン'));
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Main');
    });
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue(false);
    
    const {getByPlaceholderText, getByText} = renderWithNavigation(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('ユーザー名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('パスワード'), 'wrongpass');
    
    fireEvent.press(getByText('ログイン'));
    
    await waitFor(() => {
      expect(getByText('ユーザー名またはパスワードが間違っています')).toBeTruthy();
    });
  });

  it('shows loading state during login', async () => {
    // Mock loading state
    mockAuthState.isLoading = true;
    
    const {getByTestId} = renderWithNavigation(<LoginScreen />);
    
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
