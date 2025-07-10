import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VitalDataScreen from '../../src/screens/VitalDataScreen';
import { VitalDataService } from '../../src/services/VitalDataService';

// VitalDataServiceのモック
jest.mock('../../src/services/VitalDataService');

// Alert.alertのモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute = {
  params: {
    title: '歩数',
  },
};

describe('VitalDataScreen', () => {
  let mockVitalDataService: jest.Mocked<VitalDataService>;

  beforeEach(() => {
    // VitalDataServiceのモックインスタンス作成
    mockVitalDataService = {
      initializeService: jest.fn(),
      getVitalDataByType: jest.fn(),
      getVitalDataByPeriod: jest.fn(),
      calculateAchievementRate: jest.fn(),
      convertToLegacyFormat: jest.fn(),
      insertDummyData: jest.fn(),
      updateVitalData: jest.fn(),
      deleteVitalData: jest.fn(),
    } as any;

    // VitalDataServiceコンストラクタのモック
    (VitalDataService as jest.Mock).mockImplementation(() => mockVitalDataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('画面レンダリング', () => {
    test('画面が正常にレンダリングされる', async () => {
      // モックデータの設定
      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('歩数 一覧')).toBeTruthy();
      });
    });

    test('ローディング状態が表示される', () => {
      // 非同期処理を遅延させる
      mockVitalDataService.initializeService.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      expect(getByText('データを読み込み中...')).toBeTruthy();
    });

    test('達成率が表示される', async () => {
      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(85.5);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('85.5 %')).toBeTruthy();
        expect(getByText('目標達成率')).toBeTruthy();
      });
    });
  });

  describe('データ表示', () => {
    test('バイタルデータが正しく表示される', async () => {
      const mockData = [
        { id: '1', date: '2025-07-08', value: '8,000 歩' },
        { id: '2', date: '2025-07-07', value: '7,500 歩' },
      ];

      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('8,000 歩')).toBeTruthy();
        expect(getByText('7,500 歩')).toBeTruthy();
        expect(getByText('2025-07-08')).toBeTruthy();
        expect(getByText('2025-07-07')).toBeTruthy();
      });
    });

    test('データが存在しない場合の表示', async () => {
      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(null);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('データがありません。')).toBeTruthy();
      });
    });
  });

  describe('フィルタリング機能', () => {
    test('フィルタボタンが表示される', async () => {
      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('今週')).toBeTruthy();
        expect(getByText('今月')).toBeTruthy();
        expect(getByText('全期間')).toBeTruthy();
      });
    });

    test('フィルタボタンをタップするとデータが再読み込みされる', async () => {
      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('今月')).toBeTruthy();
      });

      // 今月ボタンをタップ
      fireEvent.press(getByText('今月'));

      await waitFor(() => {
        expect(mockVitalDataService.getVitalDataByPeriod).toHaveBeenCalledWith('歩数', 'month');
      });
    });
  });

  describe('データ操作', () => {
    test('削除ボタンをタップすると確認ダイアログが表示される', async () => {
      const mockData = [
        { id: '1', date: '2025-07-08', value: '8,000 歩' },
      ];

      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('削除')).toBeTruthy();
      });

      // 削除ボタンをタップ
      fireEvent.press(getByText('削除'));

      // Alert.alertが呼ばれることを確認
      expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
        '削除',
        'この項目を削除しますか？',
        expect.any(Array)
      );
    });
  });

  describe('エラーハンドリング', () => {
    test('データ読み込みエラー時にアラートが表示される', async () => {
      mockVitalDataService.initializeService.mockRejectedValue(new Error('Database error'));

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
          'エラー',
          'データの読み込みに失敗しました。'
        );
      });
    });
  });

  describe('異なるバイタルタイプ', () => {
    test('体重画面が正しく表示される', async () => {
      const weightRoute = {
        params: {
          title: '体重',
        },
      };

      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(95);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue([]);

      const { getByText } = render(
        <VitalDataScreen route={weightRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('体重 一覧')).toBeTruthy();
      });
    });

    test('血圧画面が正しく表示される', async () => {
      const bloodPressureRoute = {
        params: {
          title: '血圧',
        },
      };

      const mockData = [
        { id: '1', date: '2025-07-08', value: '120/80 mmHg' },
      ];

      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(100);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

      const { getByText } = render(
        <VitalDataScreen route={bloodPressureRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('血圧 一覧')).toBeTruthy();
        expect(getByText('120/80 mmHg')).toBeTruthy();
      });
    });
  });

  describe('グラフ表示', () => {
    test('データがある場合にグラフが表示される', async () => {
      const mockData = [
        { id: '1', date: '2025-07-08', value: '8,000 歩' },
        { id: '2', date: '2025-07-07', value: '7,500 歩' },
      ];

      mockVitalDataService.initializeService.mockResolvedValue();
      mockVitalDataService.getVitalDataByType.mockResolvedValue([]);
      mockVitalDataService.getVitalDataByPeriod.mockResolvedValue([]);
      mockVitalDataService.calculateAchievementRate.mockResolvedValue(80);
      mockVitalDataService.convertToLegacyFormat.mockReturnValue(mockData);

      const { getByText } = render(
        <VitalDataScreen route={mockRoute as any} navigation={mockNavigation as any} />
      );

      await waitFor(() => {
        expect(getByText('📊 推移グラフ')).toBeTruthy();
        expect(getByText('単位: 歩')).toBeTruthy();
      });
    });
  });
});
