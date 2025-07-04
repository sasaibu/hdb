import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Switch, SafeAreaView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notificationSettings';

const NotificationSettingsScreen = () => {
  const [settings, setSettings] = useState({
    all: false,
    news: true,
    unread: true,
    stressCheck: false,
  });

  // 設定をAsyncStorageから読み込む
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  };

  // 設定をAsyncStorageに保存する
  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  };

  // コンポーネントマウント時に設定を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSwitch = (key: keyof typeof settings) => {
    const newSettings = {...settings, [key]: !settings[key]};
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAllSwitch = (value: boolean) => {
    const newSettings = {
      all: value,
      news: value,
      unread: value,
      stressCheck: value,
    };
    setSettings(newSettings);
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
          <Text style={styles.settingLabel}>プッシュ通知をすべて受け取る</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={settings.all ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={handleAllSwitch}
            value={settings.all}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>新規お知らせ</Text>
          <Switch
            onValueChange={() => toggleSwitch('news')}
            value={settings.news}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>未閲覧の受信</Text>
          <Switch
            onValueChange={() => toggleSwitch('unread')}
            value={settings.unread}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>ストレスチェック</Text>
          <Switch
            onValueChange={() => toggleSwitch('stressCheck')}
            value={settings.stressCheck}
          />
        </View>
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
});

export default NotificationSettingsScreen;
