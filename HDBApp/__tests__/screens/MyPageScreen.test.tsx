import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import MyPageScreen from '../../src/screens/MyPageScreen';
import {Alert} from 'react-native';

// Mock dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.spyOn(Alert, 'alert');

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
};

describe('MyPageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with user profile', () => {
    const {getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    expect(getByText('マイページ')).toBeTruthy();
    expect(getByText('山田 太郎')).toBeTruthy();
    expect(getByText('yamada.taro@example.com')).toBeTruthy();
    expect(getByText('ID: USR123456')).toBeTruthy();
  });

  it('displays profile details section', () => {
    const {getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    expect(getByText('プロフィール詳細')).toBeTruthy();
    expect(getByText('生年月日')).toBeTruthy();
    expect(getByText('1985年5月15日')).toBeTruthy();
    expect(getByText('性別')).toBeTruthy();
    expect(getByText('男性')).toBeTruthy();
    expect(getByText('身長')).toBeTruthy();
    expect(getByText('172 cm')).toBeTruthy();
    expect(getByText('目標体重')).toBeTruthy();
    expect(getByText('68 kg')).toBeTruthy();
  });

  it('opens profile edit modal when edit button is pressed', () => {
    const {getByTestId, getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    const editButton = getByTestId('edit-profile-button');
    fireEvent.press(editButton);
    
    // モーダルが表示されることを確認
    expect(getByText('プロフィール編集')).toBeTruthy();
    expect(getByTestId('profile-edit-modal')).toBeTruthy();
  });

  it('closes profile edit modal when cancel is pressed', async () => {
    const {getByTestId, getByText, queryByTestId} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    // モーダルを開く
    const editButton = getByTestId('edit-profile-button');
    fireEvent.press(editButton);
    
    // キャンセルボタンを押す
    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);
    
    await waitFor(() => {
      expect(queryByTestId('profile-edit-modal')).toBeFalsy();
    });
  });

  it('saves profile changes when save is pressed', async () => {
    const {getByTestId, getByText, getByDisplayValue} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    // モーダルを開く
    const editButton = getByTestId('edit-profile-button');
    fireEvent.press(editButton);
    
    // ニックネームを変更
    const nicknameInput = getByDisplayValue('山田 太郎');
    fireEvent.changeText(nicknameInput, '山田 次郎');
    
    // 保存ボタンを押す
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('成功', 'プロフィールを更新しました');
      expect(getByText('山田 次郎')).toBeTruthy();
    });
  });

  it('displays action buttons', () => {
    const {getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    expect(getByText('設定')).toBeTruthy();
    expect(getByText('ヘルプ')).toBeTruthy();
    expect(getByText('ログアウト')).toBeTruthy();
  });

  it('shows logout confirmation when logout button is pressed', () => {
    const {getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    const logoutButton = getByText('ログアウト');
    fireEvent.press(logoutButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      expect.any(Array)
    );
  });

  it('navigates to login screen when logout is confirmed', () => {
    const {getByText} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    const logoutButton = getByText('ログアウト');
    fireEvent.press(logoutButton);
    
    // Alert.alertの3番目の引数（ボタン配列）を取得
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === 'ログアウト');
    
    // ログアウト確認
    confirmButton.onPress();
    
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('displays avatar placeholder when no avatar is set', () => {
    const {getByTestId} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    const avatarPlaceholder = getByTestId('avatar-placeholder');
    expect(avatarPlaceholder).toBeTruthy();
  });

  it('handles avatar upload', () => {
    const {getByTestId} = render(<MyPageScreen navigation={mockNavigation as any} />);
    
    const avatarButton = getByTestId('avatar-upload-button');
    fireEvent.press(avatarButton);
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'プロフィール画像',
      '画像の選択方法を選んでください',
      expect.any(Array)
    );
  });
});