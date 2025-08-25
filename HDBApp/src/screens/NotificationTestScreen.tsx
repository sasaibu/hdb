import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import EnhancedNotificationService from '../services/EnhancedNotificationService';
import PushNotification from 'react-native-push-notification';

const NotificationTestScreen: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const notificationService = EnhancedNotificationService.getInstance();
  
  useEffect(() => {
    // PushNotification設定
    PushNotification.configure({
      onNotification: function(notification) {
        addLog(`通知受信: ${notification.title} - ${new Date().toLocaleString()}`);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: Platform.OS === 'ios',
    });
    
    // Androidチャンネル作成
    if (Platform.OS === 'android') {
      PushNotification.createChannel({
        channelId: 'default-channel',
        channelName: '通知テスト',
        channelDescription: '通知機能のテスト用',
        importance: 4, // HIGH
        vibrate: true,
      }, () => {});
    }
  }, []);
  
  const addLog = (message: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };
  
  // 即座にテスト通知
  const sendTestNotification = () => {
    PushNotification.localNotification({
      channelId: 'default-channel',
      title: '即座テスト通知',
      message: '通知機能が正常に動作しています',
    });
    addLog('即座テスト通知を送信');
  };
  
  // 30秒後にテスト通知
  const scheduleTestNotification = () => {
    const testDate = new Date();
    testDate.setSeconds(testDate.getSeconds() + 30);
    
    PushNotification.localNotificationSchedule({
      channelId: 'default-channel',
      title: '30秒後のテスト通知',
      message: `予定時刻: ${testDate.toLocaleTimeString()}`,
      date: testDate,
    });
    addLog('30秒後にテスト通知をスケジュール');
  };
  
  // ユーザー設定時刻で毎日通知
  const scheduleDailyNotification = async () => {
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    
    await notificationService.updateNotificationTime(hours, minutes);
    
    setNotificationEnabled(true);
    addLog(`毎日 ${hours}:${minutes} に通知を設定`);
    
    Alert.alert(
      '通知設定完了',
      `毎日 ${hours}時${minutes}分 に通知します。\n初回通知まで最大24時間かかる場合があります。`,
      [{ text: 'OK' }]
    );
  };
  
  // 通知をキャンセル
  const cancelNotifications = async () => {
    await notificationService.disableNotifications();
    setNotificationEnabled(false);
    addLog('すべての通知をキャンセル');
  };
  
  // スケジュール済み通知を確認
  const checkScheduledNotifications = () => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      if (notifications.length === 0) {
        addLog('スケジュール済み通知: なし');
      } else {
        notifications.forEach((notif: any) => {
          addLog(`スケジュール済み: ${notif.title} - ${new Date(notif.date).toLocaleString()}`);
        });
      }
    });
  };
  
  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>通知機能テスト画面</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 動作確認</Text>
        <Button title="即座に通知を表示" onPress={sendTestNotification} />
        <View style={styles.spacer} />
        <Button title="30秒後に通知" onPress={scheduleTestNotification} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 毎日通知設定（5日間テスト用）</Text>
        <Text style={styles.timeDisplay}>
          設定時刻: {selectedTime.getHours()}時{selectedTime.getMinutes()}分
        </Text>
        <Button title="時刻を選択" onPress={() => setShowTimePicker(true)} />
        <View style={styles.spacer} />
        <Button 
          title="この時刻で毎日通知を開始" 
          onPress={scheduleDailyNotification}
          disabled={notificationEnabled}
        />
        <View style={styles.spacer} />
        <Button 
          title="通知を停止" 
          onPress={cancelNotifications}
          color="red"
          disabled={!notificationEnabled}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 確認機能</Text>
        <Button title="スケジュール済み通知を確認" onPress={checkScheduledNotifications} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ログ</Text>
        <View style={styles.logContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </View>
      
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeDisplay: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  spacer: {
    height: 10,
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  logText: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default NotificationTestScreen;