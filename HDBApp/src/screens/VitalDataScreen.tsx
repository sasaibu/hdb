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
    Alert.alert('編集', `「${item.value}」を編集します。`);
  };

  const renderItem = ({item}: {item: VitalListItem}) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemValue}>{item.value}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, styles.deleteText]}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
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

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>データがありません。</Text>}
      />
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
});

export default VitalDataScreen;
