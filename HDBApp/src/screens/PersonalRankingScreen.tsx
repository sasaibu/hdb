import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type PersonalRankingScreenRouteProp = RouteProp<RootStackParamList, 'PersonalRanking'>;

interface RankingUser {
  rank: number;
  userId: string;
  nickname: string;
  avatar?: string;
  steps: number;
  isCurrentUser?: boolean;
}

const PersonalRankingScreen: React.FC = () => {
  const route = useRoute<PersonalRankingScreenRouteProp>();
  const { eventTitle } = route.params || {};
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const mockRankingData: RankingUser[] = [
    {
      rank: 1,
      userId: '1',
      nickname: '健康太郎',
      avatar: '🏃',
      steps: 15234,
      isCurrentUser: false,
    },
    {
      rank: 2,
      userId: '2',
      nickname: 'ウォーキング花子',
      avatar: '🚶‍♀️',
      steps: 14892,
      isCurrentUser: false,
    },
    {
      rank: 3,
      userId: '3',
      nickname: 'ランナー次郎',
      avatar: '🏃‍♂️',
      steps: 13456,
      isCurrentUser: false,
    },
    {
      rank: 4,
      userId: '4',
      nickname: 'あなた',
      avatar: '😊',
      steps: 12789,
      isCurrentUser: true,
    },
    {
      rank: 5,
      userId: '5',
      nickname: 'フィットネス美子',
      avatar: '💪',
      steps: 11234,
      isCurrentUser: false,
    },
    {
      rank: 6,
      userId: '6',
      nickname: 'ヘルシー三郎',
      avatar: '🥗',
      steps: 10567,
      isCurrentUser: false,
    },
    {
      rank: 7,
      userId: '7',
      nickname: 'スポーツ四郎',
      avatar: '⚽',
      steps: 9876,
      isCurrentUser: false,
    },
    {
      rank: 8,
      userId: '8',
      nickname: 'アクティブ五郎',
      avatar: '🚴',
      steps: 8765,
      isCurrentUser: false,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const renderRankingItem = (user: RankingUser) => (
    <View
      key={user.userId}
      style={[
        styles.rankingItem,
        user.isCurrentUser && styles.currentUserItem,
        user.rank <= 3 && styles.topRankItem,
      ]}
    >
      <View style={styles.rankContainer}>
        {getRankIcon(user.rank) ? (
          <Text style={styles.rankIcon}>{getRankIcon(user.rank)}</Text>
        ) : (
          <Text style={styles.rankNumber}>{user.rank}</Text>
        )}
      </View>

      <View style={styles.userAvatar}>
        <Text style={styles.avatarEmoji}>{user.avatar}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.nickname, user.isCurrentUser && styles.currentUserNickname]}>
          {user.nickname}
        </Text>
        <Text style={styles.steps}>{user.steps.toLocaleString()} 歩</Text>
      </View>

      {user.isCurrentUser && (
        <View style={styles.youBadge}>
          <Text style={styles.youBadgeText}>YOU</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{eventTitle || '全体歩数ランキング'}</Text>
        <Text style={styles.subtitle}>個人ランキング</Text>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'daily' && styles.selectedPeriod]}
          onPress={() => setSelectedPeriod('daily')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'daily' && styles.selectedPeriodText]}>
            日間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'weekly' && styles.selectedPeriod]}
          onPress={() => setSelectedPeriod('weekly')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'weekly' && styles.selectedPeriodText]}>
            週間
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'monthly' && styles.selectedPeriod]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'monthly' && styles.selectedPeriodText]}>
            月間
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.rankingList} showsVerticalScrollIndicator={false}>
        {mockRankingData.map(renderRankingItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  eventTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#FF6B35',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  rankingList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  topRankItem: {
    backgroundColor: '#FFFBF0',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentUserNickname: {
    color: '#FF6B35',
  },
  steps: {
    fontSize: 14,
    color: '#666',
  },
  youBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  youBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PersonalRankingScreen;