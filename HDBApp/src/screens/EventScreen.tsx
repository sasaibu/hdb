import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type EventScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  imageUrl?: string;
  isActive: boolean;
}

const EventScreen: React.FC = () => {
  const navigation = useNavigation<EventScreenNavigationProp>();

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '春の健康ウォーキングチャレンジ',
      description: '毎日8,000歩を目指そう！',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      participantCount: 1234,
      isActive: true,
    },
    {
      id: '2',
      title: '体重管理マスター',
      description: '3ヶ月で健康的な体重を維持',
      startDate: '2025-03-01',
      endDate: '2025-05-31',
      participantCount: 856,
      isActive: true,
    },
    {
      id: '3',
      title: '早朝ウォーキング部',
      description: '朝6時から7時の間に3,000歩',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      participantCount: 432,
      isActive: false,
    },
  ];

  const activeEvents = mockEvents.filter(event => event.isActive);
  const pastEvents = mockEvents.filter(event => !event.isActive);

  const handleEventPress = (event: Event) => {
    if (event.id === '1') {
      navigation.navigate('PersonalRanking', { eventId: event.id, eventTitle: event.title });
    } else {
      alert(`「${event.title}」の詳細画面は準備中です`);
    }
  };

  const renderEvent = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => handleEventPress(event)}
      activeOpacity={0.8}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>開催中</Text>
            </View>
          )}
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      
      <Text style={styles.eventDescription}>{event.description}</Text>
      
      <View style={styles.eventInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>
            {new Date(event.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(event.endDate).toLocaleDateString('ja-JP')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoText}>{event.participantCount.toLocaleString()}人参加中</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {activeEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>開催中のイベント</Text>
          {activeEvents.map(renderEvent)}
        </View>
      )}

      {pastEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>終了したイベント</Text>
          {pastEvents.map(renderEvent)}
        </View>
      )}

      {mockEvents.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>現在開催中のイベントはありません</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 24,
    color: '#999',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventInfo: {
    flexDirection: 'column',
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default EventScreen;