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
  Dimensions,
} from 'react-native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  MainDrawerParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import {apiClient} from '../services/api/apiClient';
import theme from '../styles/theme';

const {width} = Dimensions.get('window');

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
  color: string;
  icon: string;
  onPress: () => void;
}

interface RankingData {
  rank: number;
  name: string;
  avatar: string;
  steps: number;
}

function DashboardCard({title, value, unit, color, icon, onPress}: DashboardCardProps) {
  return (
    <TouchableOpacity style={[styles.card, {borderLeftColor: color}]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, {backgroundColor: color + '20'}]}>
          <Text style={[styles.cardIconText, {color}]}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardValue, {color}]}>{value}</Text>
        <Text style={styles.cardUnit}>{unit}</Text>
      </View>
    </TouchableOpacity>
  );
}

function WelcomeHeader() {
  const currentHour = new Date().getHours();
  let greeting = 'おはようございます';
  let greetingIcon = '🌅';
  
  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'こんにちは';
    greetingIcon = '☀️';
  } else if (currentHour >= 18) {
    greeting = 'こんばんは';
    greetingIcon = '🌙';
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingIcon}>{greetingIcon}</Text>
          <Text style={styles.welcomeText}>{greeting}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
      </View>
    </View>
  );
}

function QuickStats({vitalSummary}: {vitalSummary: any}) {
  if (!vitalSummary) return null;

  return (
    <View style={styles.quickStatsContainer}>
      <Text style={styles.quickStatsTitle}>今日の健康状況 💪</Text>
      <View style={styles.quickStatsGrid}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{vitalSummary?.steps?.today?.toLocaleString() || '0'}</Text>
          <Text style={styles.quickStatLabel}>歩数</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{vitalSummary?.weight?.latest?.toFixed(1) || '--'}</Text>
          <Text style={styles.quickStatLabel}>体重 (kg)</Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{vitalSummary?.heartRate?.latest || '--'}</Text>
          <Text style={styles.quickStatLabel}>心拍数</Text>
        </View>
      </View>
    </View>
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
    navigation.navigate('WebView', {
      url: 'https://yahoo.co.jp',
      title: 'Yahoo! JAPAN',
    });
  };

  const renderRankingItem = ({item}: {item: RankingData}) => (
    <View style={styles.rankingItemContainer}>
      <View style={[styles.rankingRankBadge, {
        backgroundColor: item.rank <= 3 ? theme.colors.accent[400] : theme.colors.gray[200]
      }]}>
        <Text style={[styles.rankingRank, {
          color: item.rank <= 3 ? theme.colors.text.inverse : theme.colors.text.secondary
        }]}>{item.rank}</Text>
      </View>
      <Image source={{uri: item.avatar}} style={styles.rankingAvatar} />
      <View style={styles.rankingUserInfo}>
        <Text style={styles.rankingName}>{item.name}</Text>
      </View>
      <View style={styles.rankingStepsContainer}>
        <Text style={styles.rankingSteps}>{item.steps.toLocaleString()}</Text>
        <Text style={styles.rankingStepsUnit}>歩</Text>
      </View>
    </View>
  );

  const vitalCards = [
    {
      title: '歩数',
      value: vitalSummary?.steps?.today?.toLocaleString() || '---',
      unit: '歩',
      color: theme.health.vitals.steps,
      icon: '👟',
    },
    {
      title: '体重',
      value: vitalSummary?.weight?.latest?.toFixed(1) || '---',
      unit: 'kg',
      color: theme.health.vitals.weight,
      icon: '⚖️',
    },
    {
      title: '体温',
      value: vitalSummary?.temperature?.latest?.toFixed(1) || '---',
      unit: '℃',
      color: theme.health.vitals.temperature,
      icon: '🌡️',
    },
    {
      title: '血圧',
      value: vitalSummary?.bloodPressure?.latestSystolic
        ? `${vitalSummary.bloodPressure.latestSystolic}/${vitalSummary.bloodPressure.latestDiastolic}`
        : '---',
      unit: 'mmHg',
      color: theme.health.vitals.bloodPressure,
      icon: '💓',
    },
    {
      title: '心拍数',
      value: vitalSummary?.heartRate?.latest?.toString() || '---',
      unit: 'bpm',
      color: theme.health.vitals.heartRate,
      icon: '💗',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <WelcomeHeader />
      
      <QuickStats vitalSummary={vitalSummary} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>バイタルデータ 📊</Text>
        <View style={styles.dashboardGrid}>
          {vitalCards.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              unit={card.unit}
              color={card.color}
              icon={card.icon}
              onPress={() => handleCardPress(card.title)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>歩数ランキング 🏆</Text>
        <View style={styles.rankingContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
              <Text style={styles.loadingText}>ランキングを読み込み中...</Text>
            </View>
          ) : (
            <FlatList
              data={rankingData}
              renderItem={renderRankingItem}
              keyExtractor={item => item.rank.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>お知らせ 📢</Text>
        <View style={styles.notificationCard}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationIcon}>🔧</Text>
            <Text style={styles.notificationTitle}>システムメンテナンス</Text>
          </View>
          <Text style={styles.notificationText}>
            本日23:00〜翌1:00の間、システムメンテナンスを実施いたします。
            ご利用の皆様にはご不便をおかけいたしますが、ご理解のほどよろしくお願いいたします。
          </Text>
          <Text style={styles.notificationDate}>📅 2025-06-23</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クイックアクション ⚡</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleWebViewDemo}>
          <Text style={styles.actionButtonIcon}>🌐</Text>
          <Text style={styles.actionButtonText}>Yahoo! を開く</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary[500],
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  quickStatsContainer: {
    margin: 16,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadow.md,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  dashboardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...theme.shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 16,
    color: theme.colors.text.tertiary,
    marginLeft: 8,
  },
  rankingContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadow.md,
    minHeight: 120,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  rankingItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  rankingRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankingRank: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary[200],
  },
  rankingUserInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  rankingStepsContainer: {
    alignItems: 'flex-end',
  },
  rankingSteps: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
  },
  rankingStepsUnit: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  notificationCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadow.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  notificationText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  actionButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    ...theme.shadow.md,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
