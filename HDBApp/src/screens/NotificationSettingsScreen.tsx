import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert, ScrollView, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import NotificationService, {NotificationSettings} from '../services/NotificationService';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import notifee, { TriggerType, RepeatFrequency } from '@notifee/react-native';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const STORAGE_KEY = 'notificationSettings';

const NotificationSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    vitalDataReminder: true,
    medicationReminder: true,
    appointmentReminder: true,
    reminderTime: '09:00',
    // 新仕様追加項目
    newAnnouncementNotification: true,
    unreadExamNotification: true,
    pulseSurveyNotification: true,
    stressCheckNotification: true,
  });
  
  // 時刻選択用の状態
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const notificationService = NotificationService.getInstance();

  // 設定をNotificationServiceから読み込む
  const loadSettings = async () => {
    try {
      const notificationSettings = await notificationService.getSettings();
      
      // 新ER図対応: 各種通知設定フラグをAsyncStorageから読み込み
      const newNoticeEnabled = await AsyncStorage.getItem('new_notice_notification_enabled');
      const unreadExamEnabled = await AsyncStorage.getItem('unread_exam_notification_enabled');
      const pulseSurveyEnabled = await AsyncStorage.getItem('pulse_survey_notification_enabled');
      const stressCheckEnabled = await AsyncStorage.getItem('stress_check_notification_enabled');
      
      // 既存の設定に新しい設定を統合
      const updatedSettings = {
        ...notificationSettings,
        newAnnouncementNotification: newNoticeEnabled !== 'false',
        unreadExamNotification: unreadExamEnabled !== 'false',
        pulseSurveyNotification: pulseSurveyEnabled !== 'false',
        stressCheckNotification: stressCheckEnabled !== 'false',
      };
      
      setSettings(updatedSettings);
      
      // 時刻の初期値を設定
      const [hours, minutes] = updatedSettings.reminderTime.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      setSelectedTime(time);
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  // 設定をNotificationServiceに保存する
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await notificationService.updateSettings(newSettings);
      
      // 新ER図対応: 各種通知設定フラグをAsyncStorageに保存
      await AsyncStorage.setItem('new_notice_notification_enabled', newSettings.newAnnouncementNotification.toString());
      await AsyncStorage.setItem('unread_exam_notification_enabled', newSettings.unreadExamNotification.toString());
      await AsyncStorage.setItem('pulse_survey_notification_enabled', newSettings.pulseSurveyNotification.toString());
      await AsyncStorage.setItem('stress_check_notification_enabled', newSettings.stressCheckNotification.toString());
      
      setSettings(newSettings);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  };

  // コンポーネントマウント時に設定を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSwitch = (key: keyof NotificationSettings) => {
    const newSettings = {...settings, [key]: !settings[key]};
    saveSettings(newSettings);
  };

  const handlePermissionRequest = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      const newSettings = {...settings, enabled: true};
      saveSettings(newSettings);
    }
  };

  const sendTestNotification = async () => {
    await notificationService.sendImmediateNotification({
      id: 'test_' + Date.now(),
      title: 'テスト通知',
      body: 'プッシュ通知のテストです',
      type: 'general',
    });
  };

  const handleTimeChange = (time: string) => {
    const newSettings = {...settings, reminderTime: time};
    saveSettings(newSettings);
  };
  
  // notifeeを使った毎日通知のスケジュール
  const scheduleDailyNotification = async (hour: number, minute: number) => {
    try {
      // 通知権限を要求
      await notifee.requestPermission();
      
      // 通知チャンネルを作成（Android用）
      await notifee.createChannel({
        id: 'default',
        name: 'デフォルト通知',
      });
      
      // 既存の通知をキャンセル
      await notifee.cancelNotification('daily-reminder');
      
      // 通知内容
      const notification = {
        id: 'daily-reminder',
        title: 'バイタルデータ入力',
        body: '今日のバイタルデータを入力してください',
        android: {
          channelId: 'default',
        },
      };
      
      // 毎日の通知をスケジュール
      await notifee.createTriggerNotification(
        notification,
        {
          type: TriggerType.TIMESTAMP,
          timestamp: getNextScheduleTime(hour, minute).getTime(),
          repeatFrequency: RepeatFrequency.DAILY,  // 毎日繰り返し（無期限）
        },
      );
      
      Alert.alert(
        '通知設定完了',
        `毎日${hour}時${minute}分に通知します。\n無期限で毎日通知されます。`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('通知スケジュール設定エラー:', error);
      Alert.alert('エラー', '通知の設定に失敗しました');
    }
  };
  
  // 次の通知時刻を計算
  const getNextScheduleTime = (hour: number, minute: number) => {
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    
    // 今日の時刻を過ぎていたら明日に設定
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    return scheduledDate;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>通知設定</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <Text style={styles.description}>
          プッシュ通知をオンにすると下記のお知らせを受け取ることができます。
        </Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>プッシュ通知を有効にする</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={settings.enabled ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={settings.enabled ? () => toggleSwitch('enabled') : handlePermissionRequest}
            value={settings.enabled}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>バイタルデータ入力リマインダー</Text>
          <Switch
            onValueChange={() => toggleSwitch('vitalDataReminder')}
            value={settings.vitalDataReminder}
            disabled={!settings.enabled}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>服薬リマインダー</Text>
          <Switch
            onValueChange={() => toggleSwitch('medicationReminder')}
            value={settings.medicationReminder}
            disabled={!settings.enabled}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>予約リマインダー</Text>
          <Switch
            onValueChange={() => toggleSwitch('appointmentReminder')}
            value={settings.appointmentReminder}
            disabled={!settings.enabled}
          />
        </View>

        <View style={styles.separator} />
        
        {/* 通知時刻設定 */}
        <View style={styles.timeSettingSection}>
          <Text style={styles.sectionTitle}>通知時刻設定</Text>
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            disabled={!settings.enabled}
          >
            <Icon name="schedule" size={24} color={settings.enabled ? '#007AFF' : '#999'} />
            <Text style={[styles.timeText, !settings.enabled && styles.disabledText]}>
              {selectedTime.getHours().toString().padStart(2, '0')}:
              {selectedTime.getMinutes().toString().padStart(2, '0')}
            </Text>
            <Text style={[styles.timeLabel, !settings.enabled && styles.disabledText]}>
              タップして時刻を変更
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* 新仕様追加項目 */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>新規お知らせ通知</Text>
          <Switch
            onValueChange={() => toggleSwitch('newAnnouncementNotification')}
            value={settings.newAnnouncementNotification}
            disabled={!settings.enabled}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>未閲覧の検診通知</Text>
          <Switch
            onValueChange={() => toggleSwitch('unreadExamNotification')}
            value={settings.unreadExamNotification}
            disabled={!settings.enabled}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>パルスサーベイ通知</Text>
          <Switch
            onValueChange={() => toggleSwitch('pulseSurveyNotification')}
            value={settings.pulseSurveyNotification}
            disabled={!settings.enabled}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>ストレスチェック通知</Text>
          <Switch
            onValueChange={() => toggleSwitch('stressCheckNotification')}
            value={settings.stressCheckNotification}
            disabled={!settings.enabled}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>リマインダー時刻: {settings.reminderTime}</Text>
        </View>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.testButtonText}>テスト通知を送信</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.historyButton} 
          onPress={() => navigation.navigate('NotificationHistory')}
        >
          <Text style={styles.historyButtonText}>通知履歴を見る</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 時刻選択ピッカー */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              setSelectedTime(date);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const timeString = `${hours}:${minutes}`;
              handleTimeChange(timeString);
              
              // PushNotificationで実際にスケジュール
              if (settings.enabled) {
                scheduleDailyNotification(date.getHours(), date.getMinutes());
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  timeSettingSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007AFF',
  },
  timeLabel: {
    fontSize: 14,
    marginLeft: 'auto',
    color: '#666',
  },
  disabledText: {
    color: '#999',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
