import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MockHealthPlatformService} from '../services/mockHealthPlatform';
import {VitalDataService} from '../services/VitalDataService';

type LinkedServicesSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LinkedServicesSettings'
>;

interface Props {
  navigation: LinkedServicesSettingsScreenNavigationProp;
}

export default function LinkedServicesSettingsScreen({navigation}: Props) {
  const [newAppEnabled, setNewAppEnabled] = useState(false);
  const [externalServiceEnabled, setExternalServiceEnabled] = useState(false);
  const [healthConnectEnabled, setHealthConnectEnabled] = useState(false);
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const healthPlatformService = MockHealthPlatformService.getInstance();
  const vitalDataService = new VitalDataService();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const healthKit = await AsyncStorage.getItem('healthkit_enabled');
      const googleFit = await AsyncStorage.getItem('googlefit_enabled');
      
      setHealthKitEnabled(healthKit === 'true');
      setHealthConnectEnabled(googleFit === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleHealthKitToggle = async (value: boolean) => {
    if (Platform.OS !== 'ios') {
      Alert.alert('エラー', 'HealthKitはiOSでのみ利用可能です。');
      return;
    }

    setIsLoading(true);
    try {
      if (value) {
        // 権限をリクエスト
        const granted = await healthPlatformService.requestHealthKitPermission();
        if (!granted) {
          Alert.alert('エラー', 'HealthKitへのアクセスが拒否されました。');
          return;
        }
      }

      await healthPlatformService.setHealthKitEnabled(value);
      setHealthKitEnabled(value);
      
      if (value) {
        // ヘルスデータを同期
        Alert.alert(
          '同期確認',
          'HealthKitからヘルスデータを同期しますか？',
          [
            {text: 'キャンセル', style: 'cancel'},
            {
              text: '同期',
              onPress: async () => {
                await syncHealthData();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling HealthKit:', error);
      Alert.alert('エラー', 'HealthKit設定の変更に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthConnectToggle = async (value: boolean) => {
    if (Platform.OS !== 'android') {
      Alert.alert('エラー', 'ヘルスコネクトはAndroidでのみ利用可能です。');
      return;
    }

    setIsLoading(true);
    try {
      if (value) {
        // 権限をリクエスト
        const granted = await healthPlatformService.requestGoogleFitPermission();
        if (!granted) {
          Alert.alert('エラー', 'ヘルスコネクトへのアクセスが拒否されました。');
          return;
        }
      }

      await healthPlatformService.setGoogleFitEnabled(value);
      setHealthConnectEnabled(value);
      
      if (value) {
        // ヘルスデータを同期
        Alert.alert(
          '同期確認',
          'ヘルスコネクトからヘルスデータを同期しますか？',
          [
            {text: 'キャンセル', style: 'cancel'},
            {
              text: '同期',
              onPress: async () => {
                await syncHealthData();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling Health Connect:', error);
      Alert.alert('エラー', 'ヘルスコネクト設定の変更に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const syncHealthData = async () => {
    setIsLoading(true);
    try {
      await vitalDataService.initializeService();
      await vitalDataService.syncHealthPlatformData();
      Alert.alert('成功', 'ヘルスデータの同期が完了しました。');
    } catch (error) {
      console.error('Error syncing health data:', error);
      Alert.alert('エラー', 'ヘルスデータの同期に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHowToUsePress = () => {
    const platform = Platform.OS === 'ios' ? 'HealthKit' : 'ヘルスコネクト';
    Alert.alert(
      `${platform}について`,
      `${platform}を有効にすると、デバイスのヘルスデータを自動的に同期できます。\n\n` +
      '- 歩数、体重、体温、血圧、心拍数のデータを自動取得\n' +
      '- データは1時間ごとに自動同期\n' +
      '- 手動入力データと自動取得データを統合管理',
      [{text: 'OK'}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>連携サービス</Text>

        {Platform.OS === 'ios' && (
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>HealthKit</Text>
              <Text style={styles.settingDescription}>iOSのヘルスデータと連携</Text>
            </View>
            <Switch
              onValueChange={handleHealthKitToggle}
              value={healthKitEnabled}
              disabled={isLoading}
            />
          </View>
        )}

        {Platform.OS === 'android' && (
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>ヘルスコネクト</Text>
              <Text style={styles.settingDescription}>Androidのヘルスデータと連携</Text>
            </View>
            <Switch
              onValueChange={handleHealthConnectToggle}
              value={healthConnectEnabled}
              disabled={isLoading}
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>新アプリ</Text>
          <Switch
            onValueChange={setNewAppEnabled}
            value={newAppEnabled}
            disabled={isLoading}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleHowToUsePress} style={styles.linkButton}>
        <Text style={styles.linkText}>
          {Platform.OS === 'ios' ? 'HealthKit' : 'ヘルスコネクト'}の使い方はこちら
        </Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>処理中...</Text>
        </View>
      )}

      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          ※{Platform.OS === 'ios' ? 'HealthKit' : 'ヘルスコネクト'}と手動入力のデータが重複する場合、より多い値が採用されます。
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.syncButton} 
        onPress={syncHealthData}
        disabled={isLoading || (!healthKitEnabled && !healthConnectEnabled)}
      >
        <Text style={styles.syncButtonText}>今すぐ同期</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#555555',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  loadingContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#1976d2',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
