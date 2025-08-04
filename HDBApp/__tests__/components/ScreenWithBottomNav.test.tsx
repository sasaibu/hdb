import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Text} from 'react-native';
import ScreenWithBottomNav from '../../src/components/ScreenWithBottomNav';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

const mockRoute = {
  name: 'TestScreen',
  params: {},
};

// Mock navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

// Mock BottomNavigation component
const mockOnTabPress = jest.fn();
jest.mock('../../src/components/BottomNavigation', () => {
  return ({activeTab, onTabPress}: any) => {
    const {View, TouchableOpacity, Text} = require('react-native');
    return (
      <View testID="bottom-navigation">
        <TouchableOpacity
          testID="tab-home"
          onPress={() => onTabPress('home')}>
          <Text>Home {activeTab === 'home' ? '(active)' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-health-check"
          onPress={() => onTabPress('health-check')}>
          <Text>Health Check {activeTab === 'health-check' ? '(active)' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-pulse-survey"
          onPress={() => onTabPress('pulse-survey')}>
          <Text>Pulse Survey {activeTab === 'pulse-survey' ? '(active)' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-record"
          onPress={() => onTabPress('record')}>
          <Text>Record {activeTab === 'record' ? '(active)' : ''}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-notifications"
          onPress={() => onTabPress('notifications')}>
          <Text>Notifications {activeTab === 'notifications' ? '(active)' : ''}</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('ScreenWithBottomNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with children', () => {
    const {getByText, getByTestId} = render(
      <ScreenWithBottomNav>
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    expect(getByText('Test Content')).toBeTruthy();
    expect(getByTestId('bottom-navigation')).toBeTruthy();
  });

  it('sets default activeTab to home', () => {
    const {getByText} = render(
      <ScreenWithBottomNav>
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('(active)')).toBeTruthy();
  });

  it('uses provided activeTab', () => {
    const {getByText} = render(
      <ScreenWithBottomNav activeTab="health-check">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    expect(getByText('Health Check')).toBeTruthy();
    expect(getByText('(active)')).toBeTruthy();
  });

  it('navigates to Home when home tab is pressed', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="health-check">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const homeTab = getByTestId('tab-home');
    fireEvent.press(homeTab);

    expect(mockNavigate).toHaveBeenCalledWith('Main', {screen: 'Home'});
  });

  it('navigates to WebView for health-check tab', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="home">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const healthCheckTab = getByTestId('tab-health-check');
    fireEvent.press(healthCheckTab);

    expect(mockNavigate).toHaveBeenCalledWith('WebView', {
      url: 'https://example.com/health-check',
      title: '健診',
      screen: 'health-check',
    });
  });

  it('navigates to WebView for pulse-survey tab', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="home">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const pulseSurveyTab = getByTestId('tab-pulse-survey');
    fireEvent.press(pulseSurveyTab);

    expect(mockNavigate).toHaveBeenCalledWith('WebView', {
      url: 'https://example.com/pulse-survey',
      title: 'パルスサーベイ',
      screen: 'pulse-survey',
    });
  });

  it('navigates to Settings for record tab', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="home">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const recordTab = getByTestId('tab-record');
    fireEvent.press(recordTab);

    expect(mockNavigate).toHaveBeenCalledWith('Main', {screen: 'Settings'});
  });

  it('navigates to Notice for notifications tab', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="home">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const notificationsTab = getByTestId('tab-notifications');
    fireEvent.press(notificationsTab);

    expect(mockNavigate).toHaveBeenCalledWith('Main', {screen: 'Notice'});
  });

  it('does not navigate when current tab is pressed', () => {
    const {getByTestId} = render(
      <ScreenWithBottomNav activeTab="home">
        <Text>Test Content</Text>
      </ScreenWithBottomNav>
    );

    const homeTab = getByTestId('tab-home');
    fireEvent.press(homeTab);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles all tab types correctly', () => {
    const tabs = ['home', 'health-check', 'pulse-survey', 'record', 'notifications'];
    
    tabs.forEach(tab => {
      jest.clearAllMocks();
      
      const {getByTestId} = render(
        <ScreenWithBottomNav activeTab="other">
          <Text>Test Content</Text>
        </ScreenWithBottomNav>
      );

      const tabElement = getByTestId(`tab-${tab}`);
      fireEvent.press(tabElement);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});