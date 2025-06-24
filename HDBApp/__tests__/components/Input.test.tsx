import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import Input from '../../src/components/Input';

describe('Input', () => {
  it('renders correctly with placeholder', () => {
    const {getByPlaceholderText} = render(
      <Input placeholder="Enter text" />
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders label when provided', () => {
    const {getByText} = render(
      <Input label="Test Label" placeholder="Enter text" />
    );
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    const {getByText} = render(
      <Input error="This field is required" placeholder="Enter text" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const {getByPlaceholderText} = render(
      <Input
        placeholder="Enter text"
        onChangeText={mockOnChangeText}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'test input');
    expect(mockOnChangeText).toHaveBeenCalledWith('test input');
  });

  it('applies error styling when error prop is provided', () => {
    const {getByPlaceholderText} = render(
      <Input error="Error message" placeholder="Enter text" />
    );
    
    const input = getByPlaceholderText('Enter text');
    expect(input.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({borderColor: '#ff4444'})
      ])
    );
  });

  it('passes through additional TextInput props', () => {
    const {getByPlaceholderText} = render(
      <Input
        placeholder="Enter text"
        secureTextEntry={true}
        maxLength={10}
      />
    );
    
    const input = getByPlaceholderText('Enter text');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.maxLength).toBe(10);
  });

  it('applies custom container style', () => {
    const customStyle = {marginBottom: 20};
    const {UNSAFE_root} = render(
      <Input
        containerStyle={customStyle}
        placeholder="Enter text"
      />
    );
    
    const containerView = UNSAFE_root.findByType('View');
    expect(containerView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });
});
