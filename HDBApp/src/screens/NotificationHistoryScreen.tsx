import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import NotificationService, {NotificationData} from '../services/NotificationService';

const NotificationHistoryScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const notificationService = NotificationService.getInstance();

  const loadNotifications = async () => {
    try {
      const history = await notificationService.getNotificationHistory();
      setNotifications(history);
    } catch (error) {
      console.error('通知履歴の読み込みに失敗しました:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const clearHistory = async () => {
    try {
      await notificationService.clearNotificationHistory();
      setNotifications([]);
    } catch (error) {
      console.error('通知履歴のクリアに失敗しました:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vital':
        return '❤️';
      case 'medication':
        return '💊';
      case 'appointment':
        return '📅';
      default:
        return '📢';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>通知履歴</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>クリア</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>通知履歴がありません</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.typeIcon}>
                  {getTypeIcon(notification.type)}
                </Text>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.time}>
                  {notification.scheduledTime && formatTime(notification.scheduledTime)}
                </Text>
              </View>
              <Text style={styles.body}>{notification.body}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default NotificationHistoryScreen;