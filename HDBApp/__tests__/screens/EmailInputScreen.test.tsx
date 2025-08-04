import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmailInputScreen from '../../src/screens/EmailInputScreen';

// Mock navigation
const mockNavigate = jest.fn();
const navigation = {
  navigate: mockNavigate,
} as any;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('EmailInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    expect(getByText('ステップ 1/4')).toBeTruthy();
    expect(getByText('メールアドレスを入力')).toBeTruthy();
    expect(getByText('アカウントの作成と通知の受信に使用します')).toBeTruthy();
    expect(getByText('メールアドレス')).toBeTruthy();
    expect(getByPlaceholderText('your@email.com')).toBeTruthy();
    expect(getByText('次へ')).toBeTruthy();
    expect(getByText('スキップ')).toBeTruthy();
  });

  it('displays info box with correct information', () => {
    const {getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    expect(getByText('ℹ️')).toBeTruthy();
    expect(getByText(/メールアドレスは、パスワードリセットや重要なお知らせの送信に使用されます/)).toBeTruthy();
  });

  it('validates email input correctly', () => {
    const {getByPlaceholderText, getByText, queryByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');

    // Test valid email
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(queryByText('有効なメールアドレスを入力してください')).toBeNull();

    // Test invalid email
    fireEvent.changeText(emailInput, 'invalid-email');
    expect(getByText('有効なメールアドレスを入力してください')).toBeTruthy();

    // Test empty email (should not show error)
    fireEvent.changeText(emailInput, '');
    expect(queryByText('有効なメールアドレスを入力してください')).toBeNull();
  });

  it('enables next button only when email is valid', () => {
    const {getByPlaceholderText, getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    const nextButton = getByText('次へ');

    // Initially disabled
    expect(nextButton.props.style).toContainEqual({color: '#999'});

    // Valid email should enable button
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(nextButton.props.style).toContainEqual({color: '#fff'});

    // Invalid email should disable button
    fireEvent.changeText(emailInput, 'invalid-email');
    expect(nextButton.props.style).toContainEqual({color: '#999'});
  });

  it('saves email and navigates when next button is pressed with valid email', async () => {
    const {getByPlaceholderText, getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    const nextButton = getByText('次へ');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('NicknameInput');
    });
  });

  it('does not navigate when next button is pressed with invalid email', async () => {
    const {getByPlaceholderText, getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    const nextButton = getByText('次へ');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('navigates to NicknameInput when skip is pressed', () => {
    const {getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const skipButton = getByText('スキップ');
    fireEvent.press(skipButton);

    expect(mockNavigate).toHaveBeenCalledWith('NicknameInput');
  });

  it('shows alert when AsyncStorage fails', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const {getByPlaceholderText, getByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');
    const nextButton = getByText('次へ');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', 'メールアドレスの保存に失敗しました');
    });
  });

  it('validates different email formats correctly', () => {
    const {getByPlaceholderText, getByText, queryByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');

    // Test various valid email formats
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@example.org',
      'user123@test-domain.net',
    ];

    validEmails.forEach(email => {
      fireEvent.changeText(emailInput, email);
      expect(queryByText('有効なメールアドレスを入力してください')).toBeNull();
    });

    // Test various invalid email formats
    const invalidEmails = [
      'invalid',
      '@domain.com',
      'user@',
      'user@domain',
      'user.domain.com',
      'user @domain.com',
      'user@domain .com',
    ];

    invalidEmails.forEach(email => {
      fireEvent.changeText(emailInput, email);
      expect(getByText('有効なメールアドレスを入力してください')).toBeTruthy();
    });
  });

  it('applies correct styling based on validation state', () => {
    const {getByPlaceholderText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');

    // Valid email should have green border
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.style).toContainEqual({borderColor: '#4CAF50'});

    // Invalid email should not have green border
    fireEvent.changeText(emailInput, 'invalid-email');
    expect(emailInput.props.style).not.toContainEqual({borderColor: '#4CAF50'});
  });

  it('handles empty email input without showing error', () => {
    const {getByPlaceholderText, queryByText} = render(
      <EmailInputScreen navigation={navigation} />
    );

    const emailInput = getByPlaceholderText('your@email.com');

    // Start with valid email
    fireEvent.changeText(emailInput, 'test@example.com');
    
    // Clear email
    fireEvent.changeText(emailInput, '');
    
    // Should not show error for empty email
    expect(queryByText('有効なメールアドレスを入力してください')).toBeNull();
  });
});