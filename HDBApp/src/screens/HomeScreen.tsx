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
import {apiClient} from '../services/api/apiClient';

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
  const [vitalSummary, setVitalSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ランキングデータとバイタルサマリーを並行で取得
        const [rankingResponse, summaryResponse] = await Promise.all([
          apiClient.getRankings('steps'),
          apiClient.getVitalSummary(),
        ]);

        // ランキングデータの処理
        if (rankingResponse.success && rankingResponse.data) {
          const formattedData: RankingData[] = rankingResponse.data.map((item: any) => ({
            rank: item.rank,
            name: item.displayName,
            avatar: `https://randomuser.me/api/portraits/${
              item.rank % 2 === 0 ? 'women' : 'men'
            }/${item.rank}.jpg`,
            steps: item.steps,
          }));
          setRankingData(formattedData);
        }

        // バイタルサマリーの処理
        if (summaryResponse.success && summaryResponse.data) {
          setVitalSummary(summaryResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          value={vitalSummary?.steps?.today?.toLocaleString() || '---'}
          unit="歩"
          onPress={() => handleCardPress('歩数')}
        />
        <DashboardCard
          title="体重"
          value={vitalSummary?.weight?.latest?.toFixed(1) || '---'}
          unit="kg"
          onPress={() => handleCardPress('体重')}
        />
        <DashboardCard
          title="体温"
          value={vitalSummary?.temperature?.latest?.toFixed(1) || '---'}
          unit="℃"
          onPress={() => handleCardPress('体温')}
        />
        <DashboardCard
          title="血圧"
          value={
            vitalSummary?.bloodPressure?.latestSystolic
              ? `${vitalSummary.bloodPressure.latestSystolic}/${vitalSummary.bloodPressure.latestDiastolic}`
              : '---'
          }
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
