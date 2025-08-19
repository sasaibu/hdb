import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {MainDrawerParamList} from '../navigation/types';

type Props = DrawerScreenProps<MainDrawerParamList, 'Points'>;

interface PointHistory {
  id: string;
  date: string;
  type: '獲得' | '使用';
  points: number;
  description: string;
}

const PointsScreen: React.FC<Props> = ({navigation}) => {
  const currentPoints = 2500;
  
  const pointHistory: PointHistory[] = [
    {
      id: '1',
      date: '2025-01-25',
      type: '獲得',
      points: 100,
      description: 'ログインボーナス',
    },
    {
      id: '2',
      date: '2025-01-24',
      type: '使用',
      points: -300,
      description: 'dポイントに交換',
    },
    {
      id: '3',
      date: '2025-01-23',
      type: '獲得',
      points: 50,
      description: '健康データ記録',
    },
    {
      id: '4',
      date: '2025-01-22',
      type: '獲得',
      points: 200,
      description: 'ミッション達成',
    },
  ];

  const renderHistoryItem = ({item}: {item: PointHistory}) => (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <Text style={styles.historyDescription}>{item.description}</Text>
      </View>
      <Text
        style={[
          styles.historyPoints,
          item.type === '獲得' ? styles.pointsPlus : styles.pointsMinus,
        ]}>
        {item.type === '獲得' ? '+' : ''}{item.points}pt
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>現在のポイント</Text>
        <Text style={styles.pointsValue}>{currentPoints.toLocaleString()}pt</Text>
      </View>

      <TouchableOpacity
        style={styles.exchangeButton}
        onPress={() => navigation.navigate('PointsExchange')}
        activeOpacity={0.8}>
        <Text style={styles.exchangeButtonText}>交換はこちら</Text>
      </TouchableOpacity>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>履歴</Text>
        <FlatList
          data={pointHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pointsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  exchangeButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  exchangeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: '#333333',
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: '600',
  },
  pointsPlus: {
    color: '#4CAF50',
  },
  pointsMinus: {
    color: '#F44336',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
});

export default PointsScreen;