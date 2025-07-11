import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
};

// Create a test wrapper with navigation context
const Drawer = createDrawerNavigator();
const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Test" component={() => component} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    expect(getByText('おかえりなさい')).toBeTruthy();
    expect(getByText(/\d{4}\/\d{1,2}\/\d{1,2}/)).toBeTruthy(); // 日付表示
  });

  it('displays dashboard cards with correct values', () => {
    const {getByText} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    // バイタルデータカードの確認
    expect(getByText('歩数')).toBeTruthy();
    expect(getByText('8,456')).toBeTruthy();
    expect(getByText('体重')).toBeTruthy();
    expect(getByText('65.2')).toBeTruthy();
    expect(getByText('体温')).toBeTruthy();
    expect(getByText('36.5')).toBeTruthy();
    expect(getByText('血圧')).toBeTruthy();
    expect(getByText('120/80')).toBeTruthy();
  });

  it('navigates to VitalData screen when card is pressed', () => {
    const {getAllByTestId} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    // Note: TouchableOpacityにtestIDを追加する必要があります
    const cards = getAllByTestId('dashboard-card');
    fireEvent.press(cards[0]); // 歩数カードをタップ
    
    expect(mockNavigate).toHaveBeenCalledWith('VitalData', {title: '歩数'});
  });

  it('displays ranking section', async () => {
    const {getByText, queryByTestId} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    expect(getByText('歩数ランキング')).toBeTruthy();
    
    // ローディング表示の確認
    expect(queryByTestId('activity-indicator')).toBeTruthy();
    
    // ランキングデータの表示を待つ
    await waitFor(() => {
      expect(getByText('田中 太郎')).toBeTruthy();
      expect(getByText('12,345 歩')).toBeTruthy();
    }, {timeout: 3000});
  });

  it('displays notification section', () => {
    const {getByText} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    expect(getByText('お知らせ')).toBeTruthy();
    expect(getByText('システムメンテナンス')).toBeTruthy();
    expect(getByText(/本日23:00〜翌1:00の間/)).toBeTruthy();
  });

  it('navigates to WebView when quick action is pressed', () => {
    const {getByText} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    const quickActionButton = getByText('Yahoo! を開く');
    fireEvent.press(quickActionButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('WebView', {
      url: 'https://yahoo.co.jp',
      title: 'Yahoo! JAPAN',
    });
  });

  it('displays all ranking items after loading', async () => {
    const {getByText, getAllByText} = renderWithNavigation(
      <HomeScreen navigation={mockNavigation as any} />
    );
    
    await waitFor(() => {
      // 5人分のランキングデータが表示されることを確認
      expect(getByText('田中 太郎')).toBeTruthy();
      expect(getByText('鈴木 花子')).toBeTruthy();
      expect(getByText('佐藤 次郎')).toBeTruthy();
      expect(getByText('伊藤 三郎')).toBeTruthy();
      expect(getByText('渡辺 久美子')).toBeTruthy();
      
      // 歩数の表示を確認
      const stepTexts = getAllByText(/\d+,\d+ 歩/);
      expect(stepTexts).toHaveLength(5);
    }, {timeout: 3000});
  });
});