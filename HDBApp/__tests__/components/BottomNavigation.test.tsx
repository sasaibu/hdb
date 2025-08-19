import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNavigation from '../../src/components/BottomNavigation';

describe('BottomNavigation', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <BottomNavigation activeTab="home" onTabPress={() => {}} />
    );
    // Check that all tabs are rendered
    expect(getByText('健診')).toBeDefined();
    expect(getByText('パルスサーベイ')).toBeDefined();
    expect(getByText('ホーム')).toBeDefined();
    expect(getByText('記録')).toBeDefined();
    expect(getByText('お知らせ')).toBeDefined();
  });

  it('calls onTabPress with the correct tab key when a tab is pressed', () => {
    const mockOnTabPress = jest.fn();
    const { getByText } = render(
      <BottomNavigation activeTab="home" onTabPress={mockOnTabPress} />
    );

    fireEvent.press(getByText('ホーム'));
    expect(mockOnTabPress).toHaveBeenCalledWith('home');

    fireEvent.press(getByText('記録'));
    expect(mockOnTabPress).toHaveBeenCalledWith('record');
  });

  it('responds to tab presses correctly', () => {
    const mockOnTabPress = jest.fn();
    const { getByText } = render(
      <BottomNavigation activeTab="home" onTabPress={mockOnTabPress} />
    );

    // Test that all tabs can be pressed
    fireEvent.press(getByText('健診'));
    expect(mockOnTabPress).toHaveBeenCalledWith('health-check');

    mockOnTabPress.mockClear();
    fireEvent.press(getByText('パルスサーベイ'));
    expect(mockOnTabPress).toHaveBeenCalledWith('pulse-survey');

    mockOnTabPress.mockClear();
    fireEvent.press(getByText('お知らせ'));
    expect(mockOnTabPress).toHaveBeenCalledWith('notifications');
  });
});
