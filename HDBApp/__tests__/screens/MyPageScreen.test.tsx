import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// Mock React Native components completely
jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (name: string) => React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || name,
      'data-component': name
    });
  });

  // Special Text component that preserves children
  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, props.children);
  });

  // Special TouchableOpacity that handles onPress
  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      'data-component': 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  // Special Image component
  const MockImage = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Image', {
      ...props,
      ref,
      testID: props.testID || 'Image',
      'data-component': 'Image'
    });
  });

  // Special ActivityIndicator component
  const MockActivityIndicator = React.forwardRef((props: any, ref: any) => {
    return React.createElement('ActivityIndicator', {
      ...props,
      ref,
      testID: props.testID || 'ActivityIndicator',
      'data-component': 'ActivityIndicator'
    });
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    Image: MockImage,
    SafeAreaView: mockComponent('SafeAreaView'),
    ActivityIndicator: MockActivityIndicator,
    
    // Alert
    Alert: {
      alert: jest.fn(),
    },
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock ProfileEditModal
jest.mock('../../src/components/ProfileEditModal', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    if (!props.visible) return null;
    return React.createElement('View', {
      ref,
      testID: 'ProfileEditModal',
      'data-component': 'ProfileEditModal'
    }, [
      React.createElement('Text', { key: 'title' }, 'プロフィール編集'),
      React.createElement('TouchableOpacity', {
        key: 'save',
        onPress: () => props.onSave({ nickname: 'テストユーザー' }),
        testID: 'save-button'
      }, React.createElement('Text', {}, '保存')),
      React.createElement('TouchableOpacity', {
        key: 'cancel',
        onPress: props.onClose,
        testID: 'cancel-button'
      }, React.createElement('Text', {}, 'キャンセル'))
    ]);
  });
});

// Mock apiClient
const mockApiClient = {
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
};

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: mockApiClient,
}));

// Import MyPageScreen after all mocks are set up
import MyPageScreen from '../../src/screens/MyPageScreen';

describe('MyPageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful API responses
    mockApiClient.getProfile.mockImplementation(() => Promise.resolve({
      success: true,
      data: {
        id: 'USR123456',
        username: 'testuser',
        displayName: 'テストユーザー',
        email: 'test@example.com',
        avatar: 'https://via.placeholder.com/150',
      }
    }));

    mockApiClient.updateProfile.mockImplementation(() => Promise.resolve({
      success: true,
      data: {
        id: 'USR123456',
        displayName: '更新されたユーザー',
      }
    }));
  });

  it('displays loading state initially', () => {
    // API呼び出しを遅延させる
    mockApiClient.getProfile.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    const {getByText, getByTestId} = render(<MyPageScreen />);

    expect(getByText('読み込み中...')).toBeTruthy();
    expect(getByTestId('ActivityIndicator')).toBeTruthy();
  });

  it('loads and displays user profile', async () => {
    const {getByText} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('テストユーザー')).toBeTruthy();
      expect(getByText('ID: USR123456')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    expect(mockApiClient.getProfile).toHaveBeenCalled();
  });

  it('displays user profile with fallback nickname', async () => {
    mockApiClient.getProfile.mockImplementation(() => Promise.resolve({
      success: true,
      data: {
        id: 'USR123456',
        username: 'fallbackuser',
        email: 'fallback@example.com',
        avatar: 'https://via.placeholder.com/150',
      }
    }));

    const {getByText} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('fallbackuser')).toBeTruthy();
      expect(getByText('ID: USR123456')).toBeTruthy();
      expect(getByText('fallback@example.com')).toBeTruthy();
    });
  });

  it('opens profile edit modal when edit button is pressed', async () => {
    const {getByText, queryByTestId} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    // 編集ボタンをクリック
    fireEvent.press(getByText('プロフィールを編集'));

    await waitFor(() => {
      expect(getByText('プロフィール編集')).toBeTruthy();
      expect(queryByTestId('ProfileEditModal')).toBeTruthy();
    });
  });

  it('closes profile edit modal when cancel is pressed', async () => {
    const {getByText, getByTestId, queryByTestId} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    // 編集ボタンをクリック
    fireEvent.press(getByText('プロフィールを編集'));

    await waitFor(() => {
      expect(queryByTestId('ProfileEditModal')).toBeTruthy();
    });

    // キャンセルボタンをクリック
    fireEvent.press(getByTestId('cancel-button'));

    await waitFor(() => {
      expect(queryByTestId('ProfileEditModal')).toBeFalsy();
    });
  });

  it('saves profile changes when save is pressed', async () => {
    const {getByText, getByTestId} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    // 編集ボタンをクリック
    fireEvent.press(getByText('プロフィールを編集'));

    await waitFor(() => {
      expect(getByTestId('ProfileEditModal')).toBeTruthy();
    });

    // 保存ボタンをクリック
    fireEvent.press(getByTestId('save-button'));

    await waitFor(() => {
      expect(mockApiClient.updateProfile).toHaveBeenCalledWith({
        displayName: 'テストユーザー',
      });
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        '成功',
        'プロフィールを更新しました'
      );
    });
  });

  it('handles profile update API error', async () => {
    mockApiClient.updateProfile.mockImplementation(() => Promise.reject(new Error('API Error')));

    const {getByText, getByTestId} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    // 編集ボタンをクリック
    fireEvent.press(getByText('プロフィールを編集'));

    await waitFor(() => {
      expect(getByTestId('ProfileEditModal')).toBeTruthy();
    });

    // 保存ボタンをクリック
    fireEvent.press(getByTestId('save-button'));

    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'プロフィールの更新に失敗しました'
      );
    });
  });

  it('handles profile load API error', async () => {
    mockApiClient.getProfile.mockImplementation(() => Promise.reject(new Error('Load Error')));

    const {getByText} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'プロフィールの読み込みに失敗しました'
      );
    });
  });

  it('displays error message when profile data is not available', async () => {
    mockApiClient.getProfile.mockImplementation(() => Promise.resolve({
      success: false,
      data: null
    }));

    const {getByText} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('ユーザー情報を取得できませんでした')).toBeTruthy();
    });
  });

  it('handles profile without email', async () => {
    mockApiClient.getProfile.mockImplementation(() => Promise.resolve({
      success: true,
      data: {
        id: 'USR123456',
        username: 'testuser',
        displayName: 'テストユーザー',
        avatar: 'https://via.placeholder.com/150',
        // email is missing
      }
    }));

    const {getByText, queryByText} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('テストユーザー')).toBeTruthy();
      expect(getByText('ID: USR123456')).toBeTruthy();
      // Email should not be displayed
      expect(queryByText('@')).toBeFalsy();
    });
  });

  it('validates nickname input', async () => {
    const {getByText, getByTestId} = render(<MyPageScreen />);

    await waitFor(() => {
      expect(getByText('プロフィールを編集')).toBeTruthy();
    });

    // 編集ボタンをクリック
    fireEvent.press(getByText('プロフィールを編集'));

    // モーダルのonSaveを空文字で呼び出し
    const modal = getByTestId('ProfileEditModal');
    const modalProps = modal.props;
    
    // 空のニックネームでバリデーションテスト
    modalProps.onSave({ nickname: '' });

    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ニックネームは空にできません。'
      );
    });

    // 長すぎるニックネームでバリデーションテスト
    modalProps.onSave({ nickname: 'a'.repeat(21) });

    await waitFor(() => {
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ニックネームは20文字以内で入力してください。'
      );
    });
  });

  it('calls API methods correctly', async () => {
    render(<MyPageScreen />);

    await waitFor(() => {
      expect(mockApiClient.getProfile).toHaveBeenCalled();
    });
  });
});
