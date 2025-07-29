import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import NotificationService, {NotificationSettings} from '../services/NotificationService';

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
