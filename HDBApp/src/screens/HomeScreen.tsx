import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  MainDrawerParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface DashboardCardProps {
  title: string;
  value: string;
  unit: string;
  onPress: () => void;
}

interface RankingData {
  rank: number;
  name: string;
  avatar: string;
  steps: number;
}

function DashboardCard({title, value, unit, onPress}: DashboardCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({navigation}: Props) {
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankingData = () => {
      // --- API呼び出しシミュレーション ---
      setLoading(true);
      setTimeout(() => {
        const dummyData: RankingData[] = [
          {
            rank: 1,
            name: '田中 太郎',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            steps: 12345,
          },
          {
            rank: 2,
            name: '鈴木 花子',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
            steps: 11987,
          },
          {
            rank: 3,
            name: '佐藤 次郎',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
            steps: 10567,
          },
          {
            rank: 4,
            name: '伊藤 三郎',
            avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
            steps: 9876,
          },
          {
            rank: 5,
            name: '渡辺 久美子',
            avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
            steps: 8765,
          },
        ];
        setRankingData(dummyData);
        setLoading(false);
      }, 2000);
      // --- ここまで ---
    };

    fetchRankingData();
  }, []);

  const handleCardPress = (type: string) => {
    navigation.navigate('VitalData', {title: type});
  };

  const handleWebViewDemo = () => {
    // Yahooを表示するように修正
    navigation.navigate('WebView', {
      url: 'https://yahoo.co.jp',
      title: 'Yahoo! JAPAN',
    });
  };

  const renderRankingItem = ({item}: {item: RankingData}) => (
    <View style={styles.rankingItemContainer}>
      <Text style={styles.rankingRank}>{item.rank}</Text>
      <Image source={{uri: item.avatar}} style={styles.rankingAvatar} />
      <View style={styles.rankingUserInfo}>
        <Text style={styles.rankingName}>{item.name}</Text>
      </View>
      <Text style={styles.rankingSteps}>{item.steps.toLocaleString()} 歩</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>おかえりなさい</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('ja-JP')}
        </Text>
      </View>

      <View style={styles.dashboardGrid}>
        <DashboardCard
          title="歩数"
          value="8,456"
          unit="歩"
          onPress={() => handleCardPress('歩数')}
        />
        <DashboardCard
          title="体重"
          value="65.2"
          unit="kg"
          onPress={() => handleCardPress('体重')}
        />
        <DashboardCard
          title="体温"
          value="36.5"
          unit="℃"
          onPress={() => handleCardPress('体温')}
        />
        <DashboardCard
          title="血圧"
          value="120/80"
          unit="mmHg"
          onPress={() => handleCardPress('血圧')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>歩数ランキング</Text>
        <View style={styles.rankingContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <FlatList
              data={rankingData}
              renderItem={renderRankingItem}
              keyExtractor={item => item.rank.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>お知らせ</Text>
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>システムメンテナンス</Text>
          <Text style={styles.notificationText}>
            本日23:00〜翌1:00の間、システムメンテナンスを実施いたします。
          </Text>
          <Text style={styles.notificationDate}>2025-06-23</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クイックアクション</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleWebViewDemo}>
          <Text style={styles.actionButtonText}>Yahoo! を開く</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardUnit: {
    fontSize: 14,
    color: '#999999',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999999',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  rankingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  rankingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9500',
    width: 30,
  },
  rankingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  rankingUserInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  rankingSteps: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});
