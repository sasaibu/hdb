import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import Button from '../../src/components/Button';

describe('Button', () => {
  it('renders correctly with title', () => {
    const {getByText} = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders loading state correctly', () => {
    const {getByTestId, queryByText} = render(
      <Button title="Test Button" onPress={() => {}} loading={true} />
    );
    
    expect(queryByText('Test Button')).toBeNull();
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const {getByText} = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders different variants correctly', () => {
    const {rerender, getByText} = render(
      <Button title="Primary" onPress={() => {}} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <Button title="Secondary" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();

    rerender(
      <Button title="Outline" onPress={() => {}} variant="outline" />
    );
    expect(getByText('Outline')).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const {rerender, getByText} = render(
      <Button title="Small" onPress={() => {}} size="small" />
    );
    expect(getByText('Small')).toBeTruthy();

    rerender(
      <Button title="Medium" onPress={() => {}} size="medium" />
    );
    expect(getByText('Medium')).toBeTruthy();

    rerender(
      <Button title="Large" onPress={() => {}} size="large" />
    );
    expect(getByText('Large')).toBeTruthy();
  });
});
