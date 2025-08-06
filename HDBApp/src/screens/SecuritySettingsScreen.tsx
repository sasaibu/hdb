import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SecurityService } from '../services/SecurityService';
import { BiometryTypes } from 'react-native-biometrics';

type Props = NativeStackScreenProps<RootStackParamList, 'SecuritySettings'>;

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [biometryType, setBiometryType] = useState<BiometryTypes | null>(null);
  const [config, setConfig] = useState({
    biometricEnabled: false,
    encryptionEnabled: true,
    autoLockTimeout: 5,
    requireAuthOnResume: true,
    secureStorageEnabled: true,
  });
  const [securityStatus, setSecurityStatus] = useState({
    isSecure: true,
    issues: [] as string[],
  });

  const securityService = SecurityService.getInstance();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      
      // 生体認証の可用性チェック
      const biometry = await securityService.checkBiometricAvailability();
      setBiometryType(biometry);
      
      // 設定の読み込み
      const currentConfig = securityService.getConfig();
      setConfig(currentConfig);
      
      // セキュリティ状態のチェック
      const status = await securityService.performSecurityCheck();
      setSecurityStatus(status);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading security settings:', error);
      setLoading(false);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometryType) {
      Alert.alert(
        'エラー',
        'このデバイスでは生体認証が利用できません'
      );
      return;
    }
    
    if (value) {
      // 生体認証を有効にする前に認証を要求
      const success = await securityService.authenticateWithBiometrics(
        '生体認証を有効にするには認証が必要です'
      );
      
      if (!success) {
        return;
      }
    }
    
    const newConfig = { ...config, biometricEnabled: value };
    setConfig(newConfig);
    await securityService.saveConfig(newConfig);
    
    Alert.alert(
      '設定変更',
      `生体認証を${value ? '有効' : '無効'}にしました`
    );
  };

  const handleEncryptionToggle = async (value: boolean) => {
    Alert.alert(
      '暗号化設定',
      `データの暗号化を${value ? '有効' : '無効'}にしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            const newConfig = { ...config, encryptionEnabled: value };
            setConfig(newConfig);
            await securityService.saveConfig(newConfig);
          },
        },
      ]
    );
  };

  const handleAutoLockTimeoutChange = (minutes: number) => {
    Alert.alert(
      '自動ロック時間',
      `${minutes}分後に自動的にロックするように設定しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            const newConfig = { ...config, autoLockTimeout: minutes };
            setConfig(newConfig);
            await securityService.saveConfig(newConfig);
          },
        },
      ]
    );
  };

  const handleTestBiometric = async () => {
    const success = await securityService.authenticateWithBiometrics(
      'テスト認証'
    );
    
    Alert.alert(
      'テスト結果',
      success ? '認証に成功しました' : '認証に失敗しました'
    );
  };

  const handleExportData = async () => {
    Alert.prompt(
      'データのエクスポート',
      'エクスポート用のパスワードを入力してください',
      async (password) => {
        if (!password) return;
        
        try {
          // ダミーデータのエクスポート
          const data = { test: 'export data' };
          const encrypted = await securityService.exportSecureData(data, password);
          
          Alert.alert(
            'エクスポート完了',
            '暗号化されたデータがクリップボードにコピーされました'
          );
        } catch (error) {
          Alert.alert('エラー', 'エクスポートに失敗しました');
        }
      },
      'secure-text'
    );
  };

  const renderBiometryType = () => {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return '生体認証';
      default:
        return '利用不可';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>セキュリティ設定</Text>
        <View style={styles.backButton} />
      </View>

      {/* セキュリティ状態 */}
      <View style={[styles.statusCard, securityStatus.isSecure ? styles.secureCard : styles.warningCard]}>
        <Text style={styles.statusTitle}>
          {securityStatus.isSecure ? '✅ セキュア' : '⚠️ 注意が必要'}
        </Text>
        {securityStatus.issues.map((issue, index) => (
          <Text key={index} style={styles.issueText}>• {issue}</Text>
        ))}
      </View>

      {/* 生体認証 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>生体認証</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{renderBiometryType()}</Text>
            <Text style={styles.settingDescription}>
              アプリへのアクセスに生体認証を使用
            </Text>
          </View>
          <Switch
            value={config.biometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={!biometryType}
          />
        </View>
        {biometryType && (
          <TouchableOpacity style={styles.testButton} onPress={handleTestBiometric}>
            <Text style={styles.testButtonText}>認証をテスト</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* データ保護 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ保護</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>データ暗号化</Text>
            <Text style={styles.settingDescription}>
              保存データをAES-256で暗号化
            </Text>
          </View>
          <Switch
            value={config.encryptionEnabled}
            onValueChange={handleEncryptionToggle}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>セキュアストレージ</Text>
            <Text style={styles.settingDescription}>
              機密データを暗号化して保存
            </Text>
          </View>
          <Switch
            value={config.secureStorageEnabled}
            onValueChange={async (value) => {
              const newConfig = { ...config, secureStorageEnabled: value };
              setConfig(newConfig);
              await securityService.saveConfig(newConfig);
            }}
          />
        </View>
      </View>

      {/* セッション管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>セッション管理</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>アプリ復帰時の認証</Text>
            <Text style={styles.settingDescription}>
              バックグラウンドから復帰時に認証を要求
            </Text>
          </View>
          <Switch
            value={config.requireAuthOnResume}
            onValueChange={async (value) => {
              const newConfig = { ...config, requireAuthOnResume: value };
              setConfig(newConfig);
              await securityService.saveConfig(newConfig);
            }}
          />
        </View>
        
        <Text style={styles.settingLabel}>自動ロック時間</Text>
        <View style={styles.timeoutOptions}>
          {[1, 5, 15, 30].map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timeoutButton,
                config.autoLockTimeout === minutes && styles.activeTimeoutButton,
              ]}
              onPress={() => handleAutoLockTimeoutChange(minutes)}
            >
              <Text
                style={[
                  styles.timeoutButtonText,
                  config.autoLockTimeout === minutes && styles.activeTimeoutButtonText,
                ]}
              >
                {minutes}分
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* データ管理 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ管理</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Text style={styles.actionButtonText}>暗号化データのエクスポート</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => {
            Alert.alert(
              '認証情報のクリア',
              '保存されている認証情報をすべて削除しますか？',
              [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: async () => {
                    await securityService.clearCredentials();
                    Alert.alert('完了', '認証情報を削除しました');
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.dangerButtonText}>認証情報をクリア</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 50,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  secureCard: {
    backgroundColor: '#e8f5e9',
  },
  warningCard: {
    backgroundColor: '#fff3e0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
  testButton: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeoutOptions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  timeoutButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTimeoutButton: {
    backgroundColor: '#007AFF',
  },
  timeoutButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTimeoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionButton: {
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  dangerButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});