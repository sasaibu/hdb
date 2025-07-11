import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import DatabaseTestScreen from '../../src/screens/DatabaseTestScreen';
import {Alert} from 'react-native';
import {DatabaseService} from '../../src/services/DatabaseService';
import {VitalDataService} from '../../src/services/VitalDataService';

// Mock dependencies
jest.mock('../../src/services/DatabaseService');
jest.mock('../../src/services/VitalDataService');
jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
};

describe('DatabaseTestScreen', () => {
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockVitalDataService: jest.Mocked<VitalDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockVitalDataService = new VitalDataService() as jest.Mocked<VitalDataService>;
    
    (DatabaseService as jest.Mock).mockImplementation(() => mockDatabaseService);
    (VitalDataService as jest.Mock).mockImplementation(() => mockVitalDataService);
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データベーステスト')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
    expect(getByText('開発用デバッグ画面')).toBeTruthy();
  });

  it('displays database operation buttons', () => {
    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    expect(getByText('データベース初期化')).toBeTruthy();
    expect(getByText('テストデータ挿入')).toBeTruthy();
    expect(getByText('全データ表示')).toBeTruthy();
    expect(getByText('データベースクリア')).toBeTruthy();
    expect(getByText('エクスポート')).toBeTruthy();
    expect(getByText('インポート')).toBeTruthy();
  });

  it('initializes database when button is pressed', async () => {
    mockDatabaseService.initDatabase.mockResolvedValue(undefined);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const initButton = getByText('データベース初期化');
    fireEvent.press(initButton);

    await waitFor(() => {
      expect(mockDatabaseService.initDatabase).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データベースを初期化しました'
      );
    });
  });

  it('inserts test data when button is pressed', async () => {
    mockVitalDataService.insertDummyData.mockResolvedValue(undefined);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const insertButton = getByText('テストデータ挿入');
    fireEvent.press(insertButton);

    await waitFor(() => {
      expect(mockVitalDataService.insertDummyData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'テストデータを挿入しました'
      );
    });
  });

  it('displays all data when button is pressed', async () => {
    const mockData = [
      {id: 1, type: 'steps', value: 8000, measuredAt: '2025-07-11'},
      {id: 2, type: 'weight', value: 65.5, measuredAt: '2025-07-11'},
    ];
    
    mockVitalDataService.getAllVitalData.mockResolvedValue(mockData);

    const {getByText, getByTestId} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const displayButton = getByText('全データ表示');
    fireEvent.press(displayButton);

    await waitFor(() => {
      expect(mockVitalDataService.getAllVitalData).toHaveBeenCalled();
      expect(getByTestId('data-display')).toBeTruthy();
      expect(getByText(/steps: 8000/)).toBeTruthy();
      expect(getByText(/weight: 65.5/)).toBeTruthy();
    });
  });

  it('shows confirmation before clearing database', () => {
    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const clearButton = getByText('データベースクリア');
    fireEvent.press(clearButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      '確認',
      'すべてのデータを削除しますか？',
      expect.any(Array)
    );
  });

  it('clears database when confirmed', async () => {
    mockDatabaseService.clearAllData.mockResolvedValue(undefined);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const clearButton = getByText('データベースクリア');
    fireEvent.press(clearButton);

    // Confirm clear
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = alertButtons.find((btn: any) => btn.text === '削除');
    confirmButton.onPress();

    await waitFor(() => {
      expect(mockDatabaseService.clearAllData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データベースをクリアしました'
      );
    });
  });

  it('exports database data', async () => {
    const mockExportData = {
      vitals: [{id: 1, type: 'steps', value: 8000}],
      settings: {notifications: true},
      exportDate: '2025-07-11T10:00:00Z',
    };

    mockDatabaseService.exportData.mockResolvedValue(mockExportData);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const exportButton = getByText('エクスポート');
    fireEvent.press(exportButton);

    await waitFor(() => {
      expect(mockDatabaseService.exportData).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        expect.stringContaining('データをエクスポートしました')
      );
    });
  });

  it('handles database operation errors', async () => {
    mockDatabaseService.initDatabase.mockRejectedValue(new Error('DB Error'));

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const initButton = getByText('データベース初期化');
    fireEvent.press(initButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        expect.stringContaining('DB Error')
      );
    });
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows database statistics', async () => {
    const mockStats = {
      totalRecords: 150,
      tableCount: 5,
      databaseSize: 1024 * 1024, // 1MB
    };

    mockDatabaseService.getStatistics.mockResolvedValue(mockStats);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('データベース統計')).toBeTruthy();
      expect(getByText(/総レコード数: 150/)).toBeTruthy();
      expect(getByText(/テーブル数: 5/)).toBeTruthy();
      expect(getByText(/サイズ: 1.0 MB/)).toBeTruthy();
    });
  });

  it('runs query test', async () => {
    const {getByText, getByPlaceholderText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const queryInput = getByPlaceholderText('SQLクエリを入力');
    fireEvent.changeText(queryInput, 'SELECT * FROM vitals LIMIT 10');

    const executeButton = getByText('実行');
    fireEvent.press(executeButton);

    await waitFor(() => {
      expect(mockDatabaseService.executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM vitals LIMIT 10'
      );
    });
  });

  it('displays query results', async () => {
    const mockResults = [
      {id: 1, type: 'steps', value: 8000},
      {id: 2, type: 'weight', value: 65.5},
    ];

    mockDatabaseService.executeQuery.mockResolvedValue(mockResults);

    const {getByText, getByPlaceholderText, getByTestId} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const queryInput = getByPlaceholderText('SQLクエリを入力');
    fireEvent.changeText(queryInput, 'SELECT * FROM vitals');

    const executeButton = getByText('実行');
    fireEvent.press(executeButton);

    await waitFor(() => {
      expect(getByTestId('query-results')).toBeTruthy();
      expect(getByText(/結果: 2件/)).toBeTruthy();
    });
  });

  it('shows warning for production use', () => {
    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/⚠️ 開発用画面/)).toBeTruthy();
    expect(getByText(/本番環境では使用しないでください/)).toBeTruthy();
  });

  it('tests connection to database', async () => {
    mockDatabaseService.testConnection.mockResolvedValue(true);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    const testButton = getByText('接続テスト');
    fireEvent.press(testButton);

    await waitFor(() => {
      expect(mockDatabaseService.testConnection).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功',
        'データベース接続OK'
      );
    });
  });

  it('displays table list', async () => {
    const mockTables = ['vitals', 'settings', 'notifications', 'backups'];
    mockDatabaseService.getTables.mockResolvedValue(mockTables);

    const {getByText} = render(
      <DatabaseTestScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText('テーブル一覧')).toBeTruthy();
      mockTables.forEach(table => {
        expect(getByText(table)).toBeTruthy();
      });
    });
  });
});