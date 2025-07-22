import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import {apiClient} from '../services/api/apiClient';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const NotificationHistoryScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('通知履歴の読み込みに失敗しました:', error);
      Alert.alert('エラー', '通知履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? {...n, read: true} : n)
      );
    } catch (error) {
      console.error('既読処理に失敗しました:', error);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      '確認',
      'すべての通知履歴を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            // ローカルのみクリア（APIにクリアエンドポイントがないため）
            setNotifications([]);
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'reminder':
        return '⏰';
      case 'system':
        return '📢';
      case 'vital':
        return '❤️';
      case 'medication':
        return '💊';
      case 'appointment':
        return '📅';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>読み込み中...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>通知履歴がありません</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => !notification.read && markAsRead(notification.id)}
              activeOpacity={notification.read ? 1 : 0.7}
            >
              <View style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.typeIcon}>
                    {getTypeIcon(notification.type)}
                  </Text>
                  <Text style={[
                    styles.title,
                    !notification.read && styles.unreadTitle
                  ]}>{notification.title}</Text>
                  <Text style={styles.time}>
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
                <Text style={styles.body}>{notification.body}</Text>
                {!notification.read && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </TouchableOpacity>
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
  unreadCard: {
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});

export default NotificationHistoryScreen;