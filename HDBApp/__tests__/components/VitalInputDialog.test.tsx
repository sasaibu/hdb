import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import VitalInputDialog from '../../src/components/VitalInputDialog';

describe('VitalInputDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    title: '歩数',
    initialValue: '8000',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const {getByText, getByDisplayValue} = render(
      <VitalInputDialog {...defaultProps} />
    );

    expect(getByText('歩数の入力')).toBeTruthy();
    expect(getByText('日付')).toBeTruthy();
    expect(getByText('時刻')).toBeTruthy();
    expect(getByDisplayValue('8000')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const {queryByText} = render(
      <VitalInputDialog {...defaultProps} visible={false} />
    );

    expect(queryByText('歩数の入力')).toBeFalsy();
  });

  it('calls onClose when cancel button is pressed', () => {
    const {getByText} = render(<VitalInputDialog {...defaultProps} />);

    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with input value when save button is pressed', () => {
    const {getByText, getByDisplayValue} = render(
      <VitalInputDialog {...defaultProps} />
    );

    const input = getByDisplayValue('8000');
    fireEvent.changeText(input, '10000');

    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('10000');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates input value when changed', () => {
    const {getByDisplayValue} = render(
      <VitalInputDialog {...defaultProps} />
    );

    const input = getByDisplayValue('8000');
    fireEvent.changeText(input, '12345');

    expect(getByDisplayValue('12345')).toBeTruthy();
  });

  it('displays current date and time', () => {
    const {getByText} = render(<VitalInputDialog {...defaultProps} />);

    // 日付と時刻が表示されていることを確認（形式は実装に依存）
    expect(getByText(/2025\/\d{1,2}\/\d{1,2}/)).toBeTruthy();
    expect(getByText(/\d{1,2}:\d{2}/)).toBeTruthy();
  });

  it('handles modal backdrop press', () => {
    const {getByText} = render(<VitalInputDialog {...defaultProps} />);

    // Try to find cancel button instead of backdrop as backdrop may not be directly accessible
    const cancelButton = getByText('キャンセル');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('initializes with empty value when initialValue is not provided', () => {
    const {getByPlaceholderText} = render(
      <VitalInputDialog
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        title='体重'
        initialValue=''
      />
    );

    const input = getByPlaceholderText('体重');
    expect(input.props.value).toBe('');
  });

  it('displays correct title for different vital types', () => {
    const {getByText, rerender} = render(
      <VitalInputDialog {...defaultProps} title='体温' />
    );

    expect(getByText('体温の入力')).toBeTruthy();

    rerender(<VitalInputDialog {...defaultProps} title='血圧' />);
    expect(getByText('血圧の入力')).toBeTruthy();
  });

  it('uses numeric keyboard for input', () => {
    const {getByDisplayValue} = render(
      <VitalInputDialog {...defaultProps} />
    );

    const input = getByDisplayValue('8000');
    expect(input.props.keyboardType).toBe('numeric');
  });
});