import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../src/components/Input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    const { getByTestId } = render(<Input placeholder="Enter text" testID="input-field" />);
    expect(getByTestId('input-field')).toBeTruthy();
  });

  it('displays the correct value', () => {
    const { getByTestId } = render(<Input value="Hello" onChangeText={() => {}} testID="input-field" />);
    const input = getByTestId('input-field');
    expect(input.props.value).toBe('Hello');
  });

  it('calls onChangeText when text is entered', () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = render(
      <Input placeholder="Enter text" onChangeText={mockOnChangeText} testID="input-field" />
    );
    fireEvent.changeText(getByTestId('input-field'), 'New Text');
    expect(mockOnChangeText).toHaveBeenCalledWith('New Text');
  });

  it('handles keyboardType prop', () => {
    const { getByTestId } = render(
      <Input placeholder="Number" keyboardType="numeric" testID="input-field" />
    );
    const input = getByTestId('input-field');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('handles secureTextEntry prop', () => {
    const { getByTestId } = render(
      <Input placeholder="Password" secureTextEntry={true} testID="input-field" />
    );
    const input = getByTestId('input-field');
    expect(input.props.secureTextEntry).toBe(true);
  });
});
