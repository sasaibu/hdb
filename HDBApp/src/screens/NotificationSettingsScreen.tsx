import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Switch, SafeAreaView, TouchableOpacity, Alert} from 'react-native';
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
      setSettings(notificationSettings);
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  // 設定をNotificationServiceに保存する
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await notificationService.updateSettings(newSettings);
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
