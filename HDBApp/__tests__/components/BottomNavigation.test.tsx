import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNavigation from '../../src/components/BottomNavigation';

describe('BottomNavigation', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <BottomNavigation activeTab="home" onTabPress={() => {}} />
    );
    expect(getByTestId('bottom-navigation')).toBeDefined();
  });

  it('calls onTabPress with the correct tab key when a tab is pressed', () => {
    const mockOnTabPress = jest.fn();
    const { getByTestId } = render(
      <BottomNavigation activeTab="home" onTabPress={mockOnTabPress} />
    );

    fireEvent.press(getByTestId('tab-home'));
    expect(mockOnTabPress).toHaveBeenCalledWith('home');

    fireEvent.press(getByTestId('tab-record'));
    expect(mockOnTabPress).toHaveBeenCalledWith('record');
  });

  it('disables tabs correctly when isGoalSetting is true', () => {
    // Mock useGoalSafe to return isGoalSetting as true
    jest.mock('../../src/hooks/useGoalSafe', () => ({
      useGoalSafe: () => ({ isGoalSetting: true }),
    }));

    const mockOnTabPress = jest.fn();
    const { getByTestId } = render(
      <BottomNavigation activeTab="home" onTabPress={mockOnTabPress} />
    );

    // Enabled tabs during goal setting: health-check, pulse-survey, home
    fireEvent.press(getByTestId('tab-home'));
    expect(mockOnTabPress).toHaveBeenCalledWith('home');

    // Disabled tabs
    fireEvent.press(getByTestId('tab-record'));
    expect(mockOnTabPress).not.toHaveBeenCalledWith('record');

    fireEvent.press(getByTestId('tab-notifications'));
    expect(mockOnTabPress).not.toHaveBeenCalledWith('notifications');
  });
});
