import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import NewVitalInputDialog from '../../src/components/NewVitalInputDialog';
import {apiClient} from '../../src/services/api/apiClient';

// Mock dependencies
jest.mock('../../src/services/api/apiClient');
jest.spyOn(Alert, 'alert');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('NewVitalInputDialog', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    vitalType: '体重',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常にレンダリングされる', () => {
    const {getByText, getByPlaceholderText} = render(
      <NewVitalInputDialog {...defaultProps} />
    );

    expect(getByText('体重を入力')).toBeTruthy();
    expect(getByPlaceholderText('例: 65.5')).toBeTruthy();
    expect(getByText('kg')).toBeTruthy();
    expect(getByText('キャンセル')).toBeTruthy();
    expect(getByText('保存')).toBeTruthy();
  });

  it('visibleがfalseの場合は表示されない', () => {
    const {queryByText} = render(
      <NewVitalInputDialog {...defaultProps} visible={false} />
    );

    expect(queryByText('体重を入力')).toBeNull();
  });

  describe('バイタルタイプ別の表示', () => {
    it('歩数の場合', () => {
      const {getByText, getByPlaceholderText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="歩数" />
      );

      expect(getByText('歩数を入力')).toBeTruthy();
      expect(getByPlaceholderText('例: 10000')).toBeTruthy();
      expect(getByText('歩')).toBeTruthy();
    });

    it('体温の場合', () => {
      const {getByText, getByPlaceholderText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="体温" />
      );

      expect(getByText('体温を入力')).toBeTruthy();
      expect(getByPlaceholderText('例: 36.5')).toBeTruthy();
      expect(getByText('℃')).toBeTruthy();
    });

    it('血圧の場合は拡張期血圧の入力欄も表示される', () => {
      const {getByText, getByPlaceholderText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="血圧" />
      );

      expect(getByText('血圧を入力')).toBeTruthy();
      expect(getByPlaceholderText('収縮期 例: 120')).toBeTruthy();
      expect(getByText('拡張期血圧')).toBeTruthy();
      expect(getByPlaceholderText('拡張期 例: 80')).toBeTruthy();
    });

    it('心拍数の場合', () => {
      const {getByText, getByPlaceholderText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="心拍数" />
      );

      expect(getByText('心拍数を入力')).toBeTruthy();
      expect(getByPlaceholderText('例: 72')).toBeTruthy();
      expect(getByText('bpm')).toBeTruthy();
    });
  });

  describe('入力値のバリデーション', () => {
    it('空の値の場合はエラーが表示される', async () => {
      const {getByText} = render(<NewVitalInputDialog {...defaultProps} />);

      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', '値を入力してください');
      });
    });

    it('数値以外の値の場合はエラーが表示される', async () => {
      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), 'abc');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', '有効な数値を入力してください');
      });
    });

    it('体重の範囲外の値の場合はエラーが表示される', async () => {
      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="体重" />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '500');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', '体重は20〜300kgの範囲で入力してください');
      });
    });

    it('血圧の場合、収縮期が拡張期以下だとエラーが表示される', async () => {
      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="血圧" />
      );

      fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), '80');
      fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '90');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', '収縮期血圧は拡張期血圧より大きい値にしてください');
      });
    });
  });

  describe('データ保存', () => {
    it('正常な値の場合、APIが呼び出される', async () => {
      mockApiClient.createVital.mockResolvedValue({success: true});

      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '65.5');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(mockApiClient.createVital).toHaveBeenCalledWith({
          type: 'weight',
          value: 65.5,
          value2: undefined,
          unit: 'kg',
          measuredAt: expect.any(String),
          source: 'manual',
        });
      });

      expect(Alert.alert).toHaveBeenCalledWith('成功', 'データを登録しました');
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('血圧の場合、両方の値がAPIに送信される', async () => {
      mockApiClient.createVital.mockResolvedValue({success: true});

      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} vitalType="血圧" />
      );

      fireEvent.changeText(getByPlaceholderText('収縮期 例: 120'), '120');
      fireEvent.changeText(getByPlaceholderText('拡張期 例: 80'), '80');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(mockApiClient.createVital).toHaveBeenCalledWith({
          type: 'bloodPressure',
          value: 120,
          value2: 80,
          unit: 'mmHg',
          measuredAt: expect.any(String),
          source: 'manual',
        });
      });
    });

    it('API呼び出しが失敗した場合、エラーが表示される', async () => {
      mockApiClient.createVital.mockResolvedValue({
        success: false,
        message: 'サーバーエラー',
      });

      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '65.5');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', 'サーバーエラー');
      });
    });

    it('API呼び出しで例外が発生した場合、エラーが表示される', async () => {
      mockApiClient.createVital.mockRejectedValue(new Error('Network error'));

      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '65.5');
      fireEvent.press(getByText('保存'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('エラー', 'データの登録に失敗しました');
      });
    });
  });

  describe('ユーザーインタラクション', () => {
    it('キャンセルボタンを押すとonCloseが呼び出される', () => {
      const {getByText} = render(<NewVitalInputDialog {...defaultProps} />);

      fireEvent.press(getByText('キャンセル'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('保存中はボタンが無効化される', async () => {
      mockApiClient.createVital.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({success: true}), 100))
      );

      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '65.5');
      fireEvent.press(getByText('保存'));

      expect(getByText('保存中...')).toBeTruthy();
    });

    it('入力値がクリアされてダイアログが閉じられる', () => {
      const {getByPlaceholderText, getByText} = render(
        <NewVitalInputDialog {...defaultProps} />
      );

      fireEvent.changeText(getByPlaceholderText('例: 65.5'), '65.5');
      fireEvent.press(getByText('キャンセル'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
