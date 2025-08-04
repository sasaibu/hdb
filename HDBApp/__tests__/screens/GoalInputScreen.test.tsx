import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import GoalInputScreen from '../../src/screens/GoalInputScreen';
import {GoalProvider} from '../../src/contexts/GoalContext';

// Mock navigation
const mockNavigate = jest.fn();
const navigation = {
  navigate: mockNavigate,
} as any;

const route = {
  params: {},
} as any;

// Mock the ScreenWithBottomNav component
jest.mock('../../src/components/ScreenWithBottomNav', () => {
  const {View} = require('react-native');
  return ({children}: any) => <View>{children}</View>;
});

// Mock GoalContext
const mockSetIsGoalSetting = jest.fn();
jest.mock('../../src/contexts/GoalContext', () => ({
  useGoal: () => ({
    setIsGoalSetting: mockSetIsGoalSetting,
  }),
  GoalProvider: ({children}: any) => <>{children}</>,
}));

describe('GoalInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const screen = render(
      <GoalProvider>
        <GoalInputScreen navigation={navigation} route={route} />
      </GoalProvider>
    );
    expect(screen).toBeTruthy();
  });

  it('sets goal setting mode on mount', () => {
    render(
      <GoalProvider>
        <GoalInputScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    expect(mockSetIsGoalSetting).toHaveBeenCalledWith(true);
  });

  it('contains interactive elements', () => {
    const {getAllByTestId} = render(
      <GoalProvider>
        <GoalInputScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    // Should contain TouchableOpacity elements
    const touchableElements = getAllByTestId('TouchableOpacity');
    expect(touchableElements.length).toBeGreaterThan(0);
  });

  it('can trigger navigation', () => {
    const {getAllByTestId} = render(
      <GoalProvider>
        <GoalInputScreen navigation={navigation} route={route} />
      </GoalProvider>
    );

    const touchableElements = getAllByTestId('TouchableOpacity');
    if (touchableElements.length > 0) {
      fireEvent.press(touchableElements[0]);
      expect(mockNavigate).toHaveBeenCalled();
    }
  });
});