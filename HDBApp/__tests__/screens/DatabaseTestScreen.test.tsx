import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// Mock React Native components completely
jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (name: string) => React.forwardRef((props: any, ref: any) => {
    return React.createElement('View', {
      ...props,
      ref,
      testID: props.testID || name,
      'data-component': name
    });
  });

  // Special Text component that preserves children
  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
      'data-component': 'Text'
    }, props.children);
  });

  // Special TouchableOpacity that handles onPress
  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      'data-component': 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  // Special TextInput that handles text changes
  const MockTextInput = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TextInput', {
      ...props,
      ref,
      testID: props.testID || 'TextInput',
      'data-component': 'TextInput',
      onChangeText: props.onChangeText,
      placeholder: props.placeholder
    });
  });

  // Special ScrollView component
  const MockScrollView = React.forwardRef((props: any, ref: any) => {
    return React.createElement('ScrollView', {
      ...props,
      ref,
      testID: props.testID || 'ScrollView',
      'data-component': 'ScrollView'
    }, props.children);
  });

  return {
    // Basic components
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    TextInput: MockTextInput,
    ScrollView: MockScrollView,
    SafeAreaView: mockComponent('SafeAreaView'),
    
    // Alert
    Alert: {
      alert: jest.fn(),
    },
    
    // StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// Mock dependencies
jest.mock('../../src/utils/DatabaseDebugger');
jest.mock('../../src/services/VitalDataService');
jest.mock('../../src/services/SyncService');

import DatabaseTestScreen from '../../src/screens/DatabaseTestScreen';
import {DatabaseDebugger} from '../../src/utils/DatabaseDebugger';
import {VitalDataService} from '../../src/services/VitalDataService';
import {SyncService} from '../../src/services/SyncService';
import {Alert} from 'react-native';

describe('DatabaseTestScreen', () => {
  let mockDatabaseDebugger: jest.Mocked<DatabaseDebugger>;
  let mockVitalDataService: jest.Mocked<VitalDataService>;
  let mockSyncService: jest.Mocked<SyncService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDatabaseDebugger = {
      checkDatabaseStatus: jest.fn(),
      getAllData: jest.fn(),
      testDataPersistence: jest.fn(),
    } as any;
    
    mockVitalDataService = {
      initializeService: jest.fn(),
      addVitalData: jest.fn(),
      syncHealthPlatformData: jest.fn(),
      uploadToVitalAWS: jest.fn(),
      getVitalDataByPeriod: jest.fn(),
    } as any;
    
    mockSyncService = {
      getSyncStatus: jest.fn(),
      setAutoSyncEnabled: jest.fn(),
    } as any;
    
    (DatabaseDebugger as unknown as jest.Mock).mockImplementation(() => mockDatabaseDebugger);
    (VitalDataService as unknown as jest.Mock).mockImplementation(() => mockVitalDataService);
    (SyncService.getInstance as jest.Mock).mockReturnValue(mockSyncService);
  });

  it('renders correctly with title and components', () => {
    const {getByText, getByPlaceholderText} = render(<DatabaseTestScreen />);

    expect(getByText('SQLiteデータベーステスト')).toBeTruthy();
    expect(getByText('テスト値設定')).toBeTruthy();
    expect(getByPlaceholderText('歩数を入力')).toBeTruthy();
  });

  it('displays database operation buttons', () => {
    const {getByText} = render(<DatabaseTestScreen />);

    expect(getByText('データベース状態確認')).toBeTruthy();
    expect(getByText('テストデータ挿入')).toBeTruthy();
    expect(getByText('データ永続化テスト')).toBeTruthy();
    expect(getByText('ヘルスデータ同期')).toBeTruthy();
    expect(getByText('バイタルAWS同期')).toBeTruthy();
    expect(getByText('自動同期設定')).toBeTruthy();
    expect(getByText('全データ削除')).toBeTruthy();
  });

  it('initializes service on mount', async () => {
    mockVitalDataService.initializeService.mockResolvedValue(undefined);
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      tablesExist: true,
      dataCount: { '歩数': 0, '体重': 0 },
      targets: { '歩数': 10000, '体重': null }
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    render(<DatabaseTestScreen />);

    await waitFor(() => {
      expect(mockVitalDataService.initializeService).toHaveBeenCalled();
      expect(mockDatabaseDebugger.checkDatabaseStatus).toHaveBeenCalled();
      expect(mockDatabaseDebugger.getAllData).toHaveBeenCalled();
    });
  });

  it('handles test value input change', () => {
    const {getByPlaceholderText} = render(<DatabaseTestScreen />);

    const input = getByPlaceholderText('歩数を入力');
    fireEvent.changeText(input, '12000');

    expect(input.props.value).toBe('12000');
  });

  it('checks database status when button is pressed', async () => {
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      tablesExist: true,
      dataCount: { '歩数': 5, '体重': 3 },
      targets: { '歩数': 10000, '体重': null }
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    const statusButton = getByText('データベース状態確認');
    fireEvent.press(statusButton);

    await waitFor(() => {
      expect(mockDatabaseDebugger.checkDatabaseStatus).toHaveBeenCalled();
      expect(mockDatabaseDebugger.getAllData).toHaveBeenCalled();
    });
  });

  it('inserts test data when button is pressed', async () => {
    mockVitalDataService.addVitalData.mockResolvedValue(1);
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      tablesExist: true,
      dataCount: {},
      targets: {}
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    const insertButton = getByText('テストデータ挿入');
    fireEvent.press(insertButton);

    await waitFor(() => {
      expect(mockVitalDataService.addVitalData).toHaveBeenCalledWith('歩数', 8500, expect.any(String));
      expect(mockVitalDataService.addVitalData).toHaveBeenCalledWith('体重', 65.5, expect.any(String));
      expect(mockVitalDataService.addVitalData).toHaveBeenCalledWith('血圧', 120, expect.any(String), 120, 80);
    });
  });

  it('tests data persistence when button is pressed', async () => {
    mockDatabaseDebugger.testDataPersistence.mockResolvedValue({
      success: true,
      testResults: ['テスト1成功', 'テスト2成功'],
      errors: []
    });
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      dataCount: {},
      targets: {}
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    const persistenceButton = getByText('データ永続化テスト');
    fireEvent.press(persistenceButton);

    await waitFor(() => {
      expect(mockDatabaseDebugger.testDataPersistence).toHaveBeenCalled();
    });
  });

  it('syncs health data when button is pressed', async () => {
    mockVitalDataService.syncHealthPlatformData.mockResolvedValue(undefined);
    mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      dataCount: {},
      targets: {}
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    const syncButton = getByText('ヘルスデータ同期');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(mockVitalDataService.syncHealthPlatformData).toHaveBeenCalled();
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('歩数', 'week');
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('体重', 'week');
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('体温', 'week');
      expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('血圧', 'week');
    });
  });

  it('syncs to vital AWS when button is pressed', async () => {
    mockVitalDataService.uploadToVitalAWS.mockResolvedValue(undefined);
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      dataCount: {},
      targets: {}
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    const awsSyncButton = getByText('バイタルAWS同期');
    fireEvent.press(awsSyncButton);

    await waitFor(() => {
      expect(mockVitalDataService.uploadToVitalAWS).toHaveBeenCalled();
    });
  });

  it('tests auto sync settings when button is pressed', async () => {
    mockSyncService.getSyncStatus.mockResolvedValue({
      enabled: false,
      lastSyncTime: new Date('2025-07-17T10:00:00Z'),
      nextSyncTime: new Date('2025-07-17T11:00:00Z')
    });
    mockSyncService.setAutoSyncEnabled.mockResolvedValue(undefined);

    const {getByText} = render(<DatabaseTestScreen />);

    const autoSyncButton = getByText('自動同期設定');
    fireEvent.press(autoSyncButton);

    await waitFor(() => {
      expect(mockSyncService.getSyncStatus).toHaveBeenCalled();
      expect(mockSyncService.setAutoSyncEnabled).toHaveBeenCalledWith(true);
    });
  });

  it('shows confirmation before clearing all data', () => {
    const {getByText} = render(<DatabaseTestScreen />);

    const clearButton = getByText('全データ削除');
    fireEvent.press(clearButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '確認',
      '全てのデータを削除しますか？',
      expect.any(Array)
    );
  });

  it('shows app restart simulation dialog', () => {
    const {getByText} = render(<DatabaseTestScreen />);

    const restartButton = getByText('アプリ再起動テスト');
    fireEvent.press(restartButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'アプリ再起動シミュレーション',
      expect.stringContaining('アプリを完全に終了してから再起動し'),
      expect.any(Array)
    );
  });

  it('displays database status when available', async () => {
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      dataCount: { '歩数': 10, '体重': 5 },
      targets: { '歩数': 10000, '体重': null }
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({});

    const {getByText} = render(<DatabaseTestScreen />);

    await waitFor(() => {
      expect(getByText('データベース状態')).toBeTruthy();
      expect(getByText('初期化: ✅')).toBeTruthy();
      expect(getByText('データ件数:')).toBeTruthy();
      expect(getByText('• 歩数: 10件')).toBeTruthy();
      expect(getByText('• 体重: 5件')).toBeTruthy();
    });
  });

  it('displays saved data when available', async () => {
    mockDatabaseDebugger.checkDatabaseStatus.mockResolvedValue({
      isInitialized: true,
      dataCount: {},
      targets: {}
    });
    mockDatabaseDebugger.getAllData.mockResolvedValue({
      '歩数': [
        { id: 1, value: 8000, unit: '歩', recorded_date: '2025-07-17' },
        { id: 2, value: 9000, unit: '歩', recorded_date: '2025-07-16' }
      ],
      '体重': [
        { id: 3, value: 65.5, unit: 'kg', recorded_date: '2025-07-17' }
      ]
    });

    const {getByText} = render(<DatabaseTestScreen />);

    await waitFor(() => {
      expect(getByText('保存されたデータ')).toBeTruthy();
      expect(getByText('歩数 (2件)')).toBeTruthy();
      expect(getByText('体重 (1件)')).toBeTruthy();
      expect(getByText('ID:1 値:8000歩 日付:2025-07-17')).toBeTruthy();
      expect(getByText('ID:3 値:65.5kg 日付:2025-07-17')).toBeTruthy();
    });
  });

  it('displays test log section', () => {
    const {getByText} = render(<DatabaseTestScreen />);

    expect(getByText('テストログ')).toBeTruthy();
  });

  it('handles service initialization errors', async () => {
    mockVitalDataService.initializeService.mockRejectedValue(new Error('Init failed'));

    render(<DatabaseTestScreen />);

    await waitFor(() => {
      expect(mockVitalDataService.initializeService).toHaveBeenCalled();
    });
  });
});
