import React, {useState} from 'react';
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

  const targets = {
    歩数: 10000,
    体重: 65.0,
    体温: 36.5,
  };

  // Dummy data based on title
  const getDummyData = (): VitalListItem[] => {
    switch (title) {
      case '歩数':
        return [
          {id: '1', date: '2025-07-02', value: '8,456 歩'},
          {id: '2', date: '2025-07-01', value: '7,890 歩'},
          {id: '3', date: '2025-06-30', value: '9,123 歩'},
        ];
      case '体重':
        return [
          {id: '1', date: '2025-07-02', value: '65.2 kg'},
          {id: '2', date: '2025-07-01', value: '65.5 kg'},
          {id: '3', date: '2025-06-30', value: '65.4 kg'},
        ];
      case '体温':
        return [
          {id: '1', date: '2025-07-02', value: '36.5 ℃'},
          {id: '2', date: '2025-07-01', value: '36.6 ℃'},
          {id: '3', date: '2025-06-30', value: '36.4 ℃'},
        ];
      case '血圧':
        return [
          {id: '1', date: '2025-07-02', value: '120/80 mmHg'},
          {id: '2', date: '2025-07-01', value: '122/81 mmHg'},
          {id: '3', date: '2025-06-30', value: '118/79 mmHg'},
        ];
      default:
        return [];
    }
  };

  const [data, setData] = useState(getDummyData());

  const getAchievementRate = () => {
    if (!data.length || !(title in targets)) {
      return null;
    }
    const latestValueStr = data[0].value;
    const latestValue = parseFloat(latestValueStr.replace(/[^0-9.]/g, ''));
    const targetValue = targets[title as keyof typeof targets];

    if (isNaN(latestValue) || !targetValue) {
      return null;
    }

    // 体重の場合は目標値に近いほど達成率が高くなるように計算
    if (title === '体重') {
      const initialDiff = Math.abs(
        parseFloat(getDummyData()[getDummyData().length - 1].value.replace(/[^0-9.]/g, '')) - targetValue
      );
      if (initialDiff === 0) return 100;
      const currentDiff = Math.abs(latestValue - targetValue);
      return Math.max(0, (1 - currentDiff / initialDiff) * 100);
    }

    return (latestValue / targetValue) * 100;
  };

  const achievementRate = getAchievementRate();

  const handleDelete = (id: string) => {
    Alert.alert('削除', 'この項目を削除しますか？', [
      {text: 'キャンセル', style: 'cancel'},
      {
        text: '削除',
        onPress: () => {
          setData(prevData => prevData.filter(item => item.id !== id));
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEdit = (item: VitalListItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleSave = (newValue: string) => {
    if (!selectedItem) return;

    // 歩数のバリデーションチェック
    if (title === '歩数') {
      const originalValue = parseInt(
        selectedItem.value.replace(/[^0-9.]/g, ''),
        10,
      );
      const updatedValue = parseInt(newValue.replace(/[^0-9.]/g, ''), 10);
      if (isNaN(updatedValue) || updatedValue <= originalValue) {
        Alert.alert(
          'エラー',
          '歩数は現在の値より大きい半角数字で入力してください。',
        );
        return;
      }
    }

    setData(prevData =>
      prevData.map(d =>
        d.id === selectedItem.id
          ? {...d, value: `${newValue} ${getUnit(title)}`.trim()}
          : d,
      ),
    );
    setModalVisible(false);
    setSelectedItem(null);
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
        ListEmptyComponent={<Text>データがありません。</Text>}
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
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  achievementContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
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
});

export default VitalDataScreen;
