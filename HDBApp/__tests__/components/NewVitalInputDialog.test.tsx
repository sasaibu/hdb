import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import NewVitalInputDialog from '../../src/components/NewVitalInputDialog';
import { apiClient } from '../../src/services/api/apiClient';

// Mock API client
jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    createVital: jest.fn(),
  },
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('NewVitalInputDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.createVital as jest.Mock).mockResolvedValue({ success: true });
  });
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
    const mockOnClose = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <NewVitalInputDialog visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} vitalType="血圧" />
    );

    fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), '120');
    fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '80');

    fireEvent.press(getByText('保存'));
    
    await waitFor(() => {
      expect(apiClient.createVital).toHaveBeenCalledWith({
        type: 'bloodPressure',
        value: 120,
        value2: 80,
        unit: 'mmHg',
        measuredAt: expect.any(String),
        source: 'manual',
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error for invalid input', async () => {
    const mockOnSuccess = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <NewVitalInputDialog visible={true} onClose={() => {}} onSuccess={mockOnSuccess} vitalType="血圧" />
    );

    fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), 'invalid');
    fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '80');

    fireEvent.press(getByText('保存'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('エラー', '有効な数値を入力してください');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(apiClient.createVital).not.toHaveBeenCalled();
    });
  });
});
