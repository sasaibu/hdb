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

type Props = DrawerScreenProps<MainDrawerParamList, 'StressCheck'>;

interface StressCheckItem {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  lastCompleted?: string;
  status: 'completed' | 'available' | 'locked';
}

const StressCheckScreen: React.FC<Props> = ({navigation}) => {
  const stressChecks: StressCheckItem[] = [
    {
      id: '1',
      title: '職業性ストレス簡易調査票',
      description: '仕事に関するストレスを測定する標準的な調査です',
      estimatedTime: '約10分',
      lastCompleted: '2025-01-20',
      status: 'completed',
    },
    {
      id: '2',
      title: 'K6（うつ・不安障害）スクリーニング',
      description: '精神的な健康状態を簡易的にチェックします',
      estimatedTime: '約5分',
      status: 'available',
    },
    {
      id: '3',
      title: '睡眠とストレスチェック',
      description: '睡眠の質とストレスの関係を評価します',
      estimatedTime: '約8分',
      lastCompleted: '2025-01-15',
      status: 'completed',
    },
    {
      id: '4',
      title: '生活習慣ストレスチェック',
      description: '日常生活習慣がストレスに与える影響を評価します',
      estimatedTime: '約12分',
      status: 'available',
    },
  ];

  const handleStart = (item: StressCheckItem) => {
    navigation.navigate('StressCheckAnswer', {
      checkId: item.id,
      title: item.title,
    });
  };

  const handleViewResult = (item: StressCheckItem) => {
    navigation.navigate('StressCheckResult', {
      checkId: item.id,
      title: item.title,
    });
  };

  const renderItem = ({item}: {item: StressCheckItem}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.status === 'completed' && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>実施済</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardInfo}>
        <Text style={styles.estimatedTime}>{item.estimatedTime}</Text>
        {item.lastCompleted && (
          <Text style={styles.lastCompleted}>
            最終実施: {item.lastCompleted}
          </Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={() => handleStart(item)}
          activeOpacity={0.8}>
          <Text style={styles.startButtonText}>実施する</Text>
        </TouchableOpacity>
        {item.status === 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.resultButton]}
            onPress={() => handleViewResult(item)}
            activeOpacity={0.8}>
            <Text style={styles.resultButtonText}>結果参照</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ストレスチェック</Text>
        <Text style={styles.headerSubtitle}>
          定期的なストレスチェックで心の健康を管理しましょう
        </Text>
      </View>

      <FlatList
        data={stressChecks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#999999',
  },
  lastCompleted: {
    fontSize: 12,
    color: '#999999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  resultButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StressCheckScreen;