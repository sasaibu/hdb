import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ManualInputButton from '../../src/components/ManualInputButton';

describe('ManualInputButton', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<ManualInputButton title="Manual Input" onPress={() => {}} />);
    expect(getByText('Manual Input')).toBeDefined();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<ManualInputButton title="Manual Input" onPress={mockOnPress} />);
    fireEvent.press(getByText('Manual Input'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
