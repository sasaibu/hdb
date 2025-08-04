import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewVitalInputDialog from '../../src/components/NewVitalInputDialog';

describe('NewVitalInputDialog', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <NewVitalInputDialog visible={true} onClose={() => {}} onSuccess={() => {}} vitalType="血圧" />
    );
    expect(getByText('血圧を入力')).toBeDefined();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <NewVitalInputDialog visible={false} onClose={() => {}} onSuccess={() => {}} vitalType="血圧" />
    );
    expect(queryByText('血圧を入力')).toBeNull();
  });

  it('calls onClose when the close button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <NewVitalInputDialog visible={true} onClose={mockOnClose} onSuccess={() => {}} vitalType="血圧" />
    );
    fireEvent.press(getByText('キャンセル'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSuccess when the save button is pressed with valid data', async () => {
    const mockOnSuccess = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <NewVitalInputDialog visible={true} onClose={() => {}} onSuccess={mockOnSuccess} vitalType="血圧" />
    );

    fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), '120');
    fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '80');

    await fireEvent.press(getByText('保存'));
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error for invalid input', async () => {
    const mockOnSuccess = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <NewVitalInputDialog visible={true} onClose={() => {}} onSuccess={mockOnSuccess} vitalType="血圧" />
    );

    fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), 'invalid');
    fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '80');

    await fireEvent.press(getByText('保存'));
    expect(mockOnSuccess).not.toHaveBeenCalled();
    // You might want to assert that an Alert was shown, but that requires mocking Alert.alert
  });
});
