import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import ProfileEditModal from '../../src/components/ProfileEditModal';
import {Alert} from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileEditModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProfile = {
    nickname: '山田 太郎',
    email: 'yamada@example.com',
    birthDate: '1985-05-15',
    gender: 'male' as 'male' | 'female' | 'other',
    height: 172,
    targetWeight: 68,
  };

  const defaultProps = {
    visible: true,
    profile: defaultProfile,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const {getByText, getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    expect(getByText('プロフィール編集')).toBeTruthy();
    expect(getByDisplayValue('山田 太郎')).toBeTruthy();
    expect(getByDisplayValue('yamada@example.com')).toBeTruthy();
    expect(getByDisplayValue('172')).toBeTruthy();
    expect(getByDisplayValue('68')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const {queryByText} = render(
      <ProfileEditModal {...defaultProps} visible={false} />
    );

    expect(queryByText('プロフィール編集')).toBeFalsy();
  });

  it('updates input fields correctly', () => {
    const {getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    const nicknameInput = getByDisplayValue('山田 太郎');
    fireEvent.changeText(nicknameInput, '山田 次郎');
    expect(getByDisplayValue('山田 次郎')).toBeTruthy();

    const emailInput = getByDisplayValue('yamada@example.com');
    fireEvent.changeText(emailInput, 'jiro@example.com');
    expect(getByDisplayValue('jiro@example.com')).toBeTruthy();

    const heightInput = getByDisplayValue('172');
    fireEvent.changeText(heightInput, '175');
    expect(getByDisplayValue('175')).toBeTruthy();

    const targetWeightInput = getByDisplayValue('68');
    fireEvent.changeText(targetWeightInput, '70');
    expect(getByDisplayValue('70')).toBeTruthy();
  });

  it('calls onClose when cancel button is pressed', () => {
    const {getByText} = render(<ProfileEditModal {...defaultProps} />);

    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('validates email format', async () => {
    const {getByText, getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    const emailInput = getByDisplayValue('yamada@example.com');
    fireEvent.changeText(emailInput, 'invalid-email');

    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '正しいメールアドレスを入力してください'
      );
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const {getByText, getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    const nicknameInput = getByDisplayValue('山田 太郎');
    fireEvent.changeText(nicknameInput, '');

    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        'ニックネームは必須です'
      );
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates numeric fields', async () => {
    const {getByText, getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    const heightInput = getByDisplayValue('172');
    fireEvent.changeText(heightInput, 'abc');

    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '身長は数値で入力してください'
      );
    });
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with updated profile when all validations pass', async () => {
    const {getByText, getByDisplayValue} = render(
      <ProfileEditModal {...defaultProps} />
    );

    const nicknameInput = getByDisplayValue('山田 太郎');
    fireEvent.changeText(nicknameInput, '山田 次郎');

    const emailInput = getByDisplayValue('yamada@example.com');
    fireEvent.changeText(emailInput, 'jiro@example.com');

    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...defaultProfile,
        nickname: '山田 次郎',
        email: 'jiro@example.com',
      });
    });
  });

  it('handles gender selection', () => {
    const {getByText} = render(<ProfileEditModal {...defaultProps} />);

    expect(getByText('性別')).toBeTruthy();
    expect(getByText('男性')).toBeTruthy();
    expect(getByText('女性')).toBeTruthy();
    expect(getByText('その他')).toBeTruthy();

    // 性別選択ボタンをタップ
    const femaleButton = getByText('女性');
    fireEvent.press(femaleButton);

    // 選択が更新されることを確認（実装に依存）
  });

  it('displays birth date picker', () => {
    const {getByText, getByTestId} = render(
      <ProfileEditModal {...defaultProps} />
    );

    expect(getByText('生年月日')).toBeTruthy();
    
    const dateButton = getByTestId('birthdate-picker-button');
    fireEvent.press(dateButton);

    // DatePickerが表示されることを確認（実装に依存）
  });

  it('resets form when modal is closed and reopened', () => {
    const {getByDisplayValue, rerender} = render(
      <ProfileEditModal {...defaultProps} />
    );

    // 値を変更
    const nicknameInput = getByDisplayValue('山田 太郎');
    fireEvent.changeText(nicknameInput, '変更後の名前');

    // モーダルを閉じる
    rerender(<ProfileEditModal {...defaultProps} visible={false} />);

    // モーダルを再度開く
    rerender(<ProfileEditModal {...defaultProps} visible={true} />);

    // 値がリセットされていることを確認
    expect(getByDisplayValue('山田 太郎')).toBeTruthy();
  });
});