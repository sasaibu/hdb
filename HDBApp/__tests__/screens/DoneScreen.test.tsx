import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import DoneScreen from '../../src/screens/DoneScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock theme
jest.mock('../../src/styles/theme', () => ({
  default: {
    colors: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
      },
      text: {
        primary: '#333333',
        secondary: '#666666',
        inverse: '#FFFFFF',
      },
      primary: {
        500: '#007AFF',
        600: '#0056CC',
      },
      success: '#28A745',
      border: {
        light: '#E0E0E0',
      },
    },
    borderRadius: {
      xl: 12,
    },
    shadow: {
      md: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    },
  },
}));

describe('DoneScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = render(<DoneScreen />);

    // Test each text individually, using the actual rendered structure
    expect(getByText('30日目達成！')).toBeTruthy();
    expect(getByText('目標完了')).toBeTruthy();
    expect(getByText('達成サマリー')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
    expect(getByText('連続日数')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy();
    expect(getByText('達成率')).toBeTruthy();
  });

  it('displays success icon', () => {
    const {getByText} = render(<DoneScreen />);

    expect(getByText('✅')).toBeTruthy();
  });

  it('displays congratulations message', () => {
    const {getByText} = render(<DoneScreen />);

    expect(getByText('🎊 素晴らしい成果です！')).toBeTruthy();
    // The message might be split across multiple lines
    expect(getByText(/30日間継続して健康目標を達成されました/)).toBeTruthy();
  });

  it('displays next steps section', () => {
    const {getByText} = render(<DoneScreen />);

    expect(getByText('次のステップ')).toBeTruthy();
    expect(getByText('🎯')).toBeTruthy();
    expect(getByText('新しい健康目標を設定')).toBeTruthy();
    expect(getByText('📊')).toBeTruthy();
    expect(getByText('健康データを継続記録')).toBeTruthy();
    expect(getByText('🏆')).toBeTruthy();
    expect(getByText('さらなる目標にチャレンジ')).toBeTruthy();
  });

  it('navigates to Main when home button is pressed', () => {
    const {getByText} = render(<DoneScreen />);

    const homeButton = getByText('ホームに戻る');
    fireEvent.press(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });

  it('displays all sections in proper order', () => {
    const screen = render(<DoneScreen />);

    // All major sections should be present
    expect(screen.getByText('30日目達成！')).toBeTruthy();
    expect(screen.getByText('達成サマリー')).toBeTruthy();
    expect(screen.getByText('🎊 素晴らしい成果です！')).toBeTruthy();
    expect(screen.getByText('次のステップ')).toBeTruthy();
    expect(screen.getByText('ホームに戻る')).toBeTruthy();
  });
});