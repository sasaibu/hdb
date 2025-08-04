import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../src/components/Input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />);
    expect(getByPlaceholderText('Enter text')).toBeDefined();
  });

  it('displays the correct value', () => {
    const { getByDisplayValue } = render(<Input value="Hello" onChangeText={() => {}} />);
    expect(getByDisplayValue('Hello')).toBeDefined();
  });

  it('calls onChangeText when text is entered', () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={mockOnChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'New Text');
    expect(mockOnChangeText).toHaveBeenCalledWith('New Text');
  });

  it('handles keyboardType prop', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Number" keyboardType="numeric" />
    );
    const input = getByPlaceholderText('Number');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('handles secureTextEntry prop', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Password" secureTextEntry={true} />
    );
    const input = getByPlaceholderText('Password');
    expect(input.props.secureTextEntry).toBe(true);
  });
});
