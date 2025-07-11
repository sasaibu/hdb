import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import DataMigrationLoginScreen from '../../src/screens/DataMigrationLoginScreen';
import {Alert} from 'react-native';

// Mock dependencies
jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: mockNavigate,
};

describe('DataMigrationLoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データ移行ログイン')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('旧システムへのログイン')).toBeTruthy();
    expect(getByPlaceholderText('ユーザーID')).toBeTruthy();
    expect(getByPlaceholderText('パスワード')).toBeTruthy();
    expect(getByText('ログイン')).toBeTruthy();
  });

  it('displays migration information', () => {
    const {getByText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/旧HDBシステムのアカウント情報/)).toBeTruthy();
    expect(getByText(/データ移行に必要な認証/)).toBeTruthy();
  });

  it('validates empty fields', () => {
    const {getByText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'エラー',
      'ユーザーIDとパスワードを入力してください'
    );
  });

  it('validates password length', () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, '123'); // Too short

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'エラー',
      'パスワードは4文字以上で入力してください'
    );
  });

  it('handles successful login', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        migrationToken: 'test-token-123',
        userData: {
          userId: 'user123',
          hasData: true,
        },
      }),
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('DataMigration', {
        migrationToken: 'test-token-123',
        sourceSystem: 'legacy-hdb',
      });
    });
  });

  it('handles login failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'Invalid credentials',
      }),
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'wronguser');
    fireEvent.changeText(passwordInput, 'wrongpass');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'ログイン失敗',
        'ユーザーIDまたはパスワードが正しくありません'
      );
    });
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ネットワークエラーが発生しました。接続を確認してください。'
      );
    });
  });

  it('shows loading state during login', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    const {getByText, getByPlaceholderText, getByTestId} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(getByTestId('login-loading')).toBeTruthy();
    expect(getByText('ログイン中...')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('masks password input', () => {
    const {getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const passwordInput = getByPlaceholderText('パスワード');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('toggles password visibility', () => {
    const {getByPlaceholderText, getByTestId} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const passwordInput = getByPlaceholderText('パスワード');
    const toggleButton = getByTestId('toggle-password-visibility');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('shows no data warning when user has no data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        migrationToken: 'test-token-123',
        userData: {
          userId: 'user123',
          hasData: false,
        },
      }),
    });

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '確認',
        '移行可能なデータがありません',
        expect.any(Array)
      );
    });
  });

  it('trims whitespace from input fields', () => {
    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, '  testuser  ');
    fireEvent.changeText(passwordInput, '  password123  ');

    expect(userIdInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('disables login button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    const {getByText, getByPlaceholderText} = render(
      <DataMigrationLoginScreen navigation={mockNavigation as any} />
    );

    const userIdInput = getByPlaceholderText('ユーザーID');
    const passwordInput = getByPlaceholderText('パスワード');

    fireEvent.changeText(userIdInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('ログイン');
    fireEvent.press(loginButton);

    expect(loginButton.props.disabled).toBe(true);
  });
});