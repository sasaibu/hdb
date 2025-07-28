import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import VitalInputDialog from '../components/VitalInputDialog';
import {VitalDataService} from '../services/VitalDataService';
import {VitalDataRecord} from '../services/DatabaseService';
import theme from '../styles/theme';

type VitalDataScreenRouteProp = RouteProp<RootStackParamList, 'VitalData'>;
type VitalDataScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VitalData'
>;

interface Props {
  route: VitalDataScreenRouteProp;
  navigation: VitalDataScreenNavigationProp;
}

interface VitalListItem {
  id: string;
  date: string;
  value: string;
}

const VitalDataScreen = ({route}: Props) => {
  const {title} = route.params;
  const [filter, setFilter] = useState('今週');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VitalListItem | null>(null);
  const [data, setData] = useState<VitalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementRate, setAchievementRate] = useState<number | null>(null);
  const [vitalDataService] = useState(() => new VitalDataService());

  // データベースからデータを読み込む
  const loadData = async () => {
    try {
      setLoading(true);
      
      // サービス初期化（初回のみ）
      await vitalDataService.initializeService();
      
      // データが存在しない場合はダミーデータを挿入
      const existingData = await vitalDataService.getVitalDataByType(title);
      if (existingData.length === 0) {
        await vitalDataService.insertDummyData();
      }
      
      // フィルタに応じてデータを取得
      let period: 'today' | 'week' | 'month' | 'all' = 'all';
      switch (filter) {
        case '今週':
          period = 'week';
          break;
        case '今月':
          period = 'month';
          break;
        case '全期間':
          period = 'all';
          break;
      }
      
      const vitalData = await vitalDataService.getVitalDataByPeriod(title, period);
      const formattedData = vitalDataService.convertToLegacyFormat(vitalData);
      setData(formattedData);
      
      // 達成率を計算
      const rate = await vitalDataService.calculateAchievementRate(title);
      setAchievementRate(rate);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込みとフィルタ変更時の処理
  useEffect(() => {
    loadData();
  }, [title, filter]);

  const handleDelete = (id: string) => {
    Alert.alert('削除', 'この項目を削除しますか？', [
      {text: 'キャンセル', style: 'cancel'},
      {
        text: '削除',
        onPress: async () => {
          try {
            await vitalDataService.deleteVitalData(parseInt(id));
            await loadData(); // データを再読み込み
            Alert.alert('成功', 'データを削除しました。');
          } catch (error) {
            console.error('Error deleting data:', error);
            Alert.alert('エラー', 'データの削除に失敗しました。');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEdit = (item: VitalListItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSave = async (newValue: string, newValue2?: string, date?: Date) => {
    if (!selectedItem && !date) return;

    try {
      const numericValue = parseFloat(newValue.replace(/[^0-9.]/g, ''));
      
      if (isNaN(numericValue)) {
        Alert.alert('エラー', '有効な数値を入力してください。');
        return;
      }

      // 歩数のバリデーションチェック
      if (title === '歩数') {
        const originalValue = parseInt(
          selectedItem.value.replace(/[^0-9.]/g, ''),
          10,
        );
        if (numericValue <= originalValue) {
          Alert.alert(
            'エラー',
            '歩数は現在の値より大きい半角数字で入力してください。',
          );
          return;
        }
      }

      // 血圧の場合の処理
      let systolic, diastolic;
      if (title === '血圧') {
        if (newValue2) {
          systolic = numericValue;
          diastolic = parseFloat(newValue2);
        } else {
          const parts = newValue.split('/');
          if (parts.length === 2) {
            systolic = parseInt(parts[0]);
            diastolic = parseInt(parts[1]);
          } else {
            systolic = numericValue;
            diastolic = 80; // デフォルト値
          }
        }
      }

      if (date) {
        // 新規データとして保存（日付指定）
        await vitalDataService.addVitalData(
          title,
          numericValue,
          date,
          systolic,
          diastolic,
          'manual'
        );
        Alert.alert('成功', `${date.toLocaleDateString('ja-JP')}のデータを追加しました。`);
      } else if (selectedItem) {
        // 既存データの更新
        await vitalDataService.updateVitalData(
          parseInt(selectedItem.id),
          numericValue,
          systolic,
          diastolic
        );
        Alert.alert('成功', 'データを更新しました。');
      }
      
      await loadData(); // データを再読み込み
      setModalVisible(false);
      setSelectedItem(null);
      
    } catch (error) {
      console.error('Error updating data:', error);
      Alert.alert('エラー', 'データの更新に失敗しました。');
    }
  };

  const getUnit = (vitalTitle: string) => {
    switch (vitalTitle) {
      case '歩数':
        return '歩';
      case '体重':
        return 'kg';
      case '体温':
        return '℃';
      case '血圧':
        return 'mmHg';
      case '心拍数':
        return 'bpm';
      default:
        return '';
    }
  };

  // グラフ用のデータ処理
  const getChartData = () => {
    return data.map(item => {
      const numericValue = parseFloat(item.value.replace(/[^0-9.]/g, ''));
      return {
        ...item,
        numericValue: isNaN(numericValue) ? 0 : numericValue,
      };
    }).reverse(); // 古い順に並べ替え
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(item => item.numericValue));

  // 棒グラフコンポーネント
  const renderChart = () => {
    if (chartData.length === 0) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 推移グラフ</Text>
        <View style={styles.chartWrapper}>
          {/* Y軸の目盛り */}
          <View style={styles.yAxisContainer}>
            <Text style={styles.yAxisLabel}>{maxValue.toFixed(title === '歩数' ? 0 : 1)}</Text>
            <Text style={styles.yAxisLabel}>{(maxValue * 0.5).toFixed(title === '歩数' ? 0 : 1)}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          <View style={styles.chartContent}>
            {/* グリッドライン */}
            <View style={styles.gridLines}>
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
              <View style={styles.gridLine} />
            </View>
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const barHeight = maxValue > 0 ? (item.numericValue / maxValue) * 140 : 4;
                const isLatest = index === chartData.length - 1;
                return (
                  <View key={item.id} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      {/* 数値を棒の上に表示 */}
                      <Text style={[styles.barValueTop, isLatest && styles.barValueTopLatest]}>
                        {item.numericValue.toFixed(title === '歩数' ? 0 : 1)}
                      </Text>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barHeight, 4),
                            backgroundColor: isLatest ? '#007AFF' : '#4CAF50',
                            shadowColor: isLatest ? '#007AFF' : '#4CAF50',
                          },
                          isLatest && styles.latestBar,
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, isLatest && styles.barLabelLatest]}>
                      {item.date.slice(5).replace('-', '/')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        {/* 単位表示 */}
        <Text style={styles.unitLabel}>単位: {getUnit(title)}</Text>
      </View>
    );
  };

  const renderItem = ({item}: {item: VitalListItem}) => (
    <TouchableOpacity onPress={() => handleEdit(item)}>
      <View style={styles.listItem}>
        <View>
          <Text style={styles.itemDate}>{item.date}</Text>
          <Text style={styles.itemValue}>{item.value}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={[styles.actionText, styles.deleteText]}>削除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title} 一覧</Text>

      {achievementRate !== null && (
        <View style={styles.achievementContainer}>
          <View style={styles.progressLabelContainer}>
            <Text style={styles.achievementTitle}>目標達成率</Text>
            <Text style={styles.achievementRate}>
              {achievementRate.toFixed(1)} %
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {width: `${Math.min(achievementRate, 100)}%`},
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        {['今週', '今月', '全期間'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterActiveText,
              ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderChart()}

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>データがありません。</Text>
          </View>
        }
      />
      {selectedItem && (
        <VitalInputDialog
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          title={title}
          initialValue={selectedItem.value.replace(/[^0-9.]/g, '')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text.primary,
  },
  achievementContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 20,
    ...theme.shadow.md,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#666',
  },
  achievementRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
  },
  filterActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
  },
  filterActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
  },
  actionText: {
    color: '#007AFF',
    marginLeft: 16,
  },
  deleteText: {
    color: '#ff3b30',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxisContainer: {
    height: 160,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingTop: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: 180,
    paddingBottom: 30,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  barWrapper: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  bar: {
    width: 28,
    borderRadius: 6,
    minHeight: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  latestBar: {
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  barValueTop: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  barValueTopLatest: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  barLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  barLabelLatest: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  unitLabel: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default VitalDataScreen;
