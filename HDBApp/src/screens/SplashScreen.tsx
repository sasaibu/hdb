import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {mockApi} from '../services/api/mockApi';
import {deviceInfoService} from '../services/DeviceInfoService';

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Splash'
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export default function SplashScreen({navigation}: Props) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [statusMessage, setStatusMessage] = useState('初期化中...');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setStatusMessage('アプリを初期化しています...');
        
        // 1. デバイス情報収集（新ER図対応）
        setStatusMessage('デバイス情報を収集しています...');
        const deviceInfo = await deviceInfoService.collectDeviceInfo();
        
        // 2. 1日1回実行制御チェック
        const canExecute = await deviceInfoService.canExecuteToday();
        if (canExecute) {
          // デバイス情報登録（1日1回）
          setStatusMessage('デバイス情報を登録しています...');
          const registerResponse = await mockApi.registerDevice(deviceInfo);
          
          if (registerResponse.success) {
            console.log('Device registered successfully:', registerResponse.data?.deviceId);
            // 実行カウンター更新
            await deviceInfoService.incrementExecutionCount();
          } else {
            console.warn('Device registration failed:', registerResponse.error);
          }
        } else {
          console.log('Device registration skipped - already executed today');
        }
        
        // 3. デバイストークン期限チェック（270日）
        const isTokenExpired = await deviceInfoService.isTokenExpired();
        if (isTokenExpired) {
          console.warn('Device token expired - requesting new token');
          setStatusMessage('プッシュ通知設定を更新しています...');
          // 実際のプロジェクトでは新しいトークンを取得・更新
        }
        
        // 4. 初期データ取得
        setStatusMessage('設定を読み込んでいます...');
        const initialDataResponse = await mockApi.getInitialData();
        
        if (!initialDataResponse.success) {
          console.warn('Initial data fetch failed:', initialDataResponse.error);
        }
        
        // 5. 認証状態確認
        setStatusMessage('認証状態を確認しています...');
        const authResponse = await mockApi.verifyToken();
        
        if (authResponse.success && authResponse.data?.isValid) {
          // 認証済み → メイン画面へ
          console.log('User authenticated, navigating to Main');
          setStatusMessage('ログイン済みです');
          navigation.replace('Main');
        } else {
          // 未認証 → ログイン画面へ
          console.log('User not authenticated, navigating to Login');
          setStatusMessage('ログインが必要です');
          navigation.replace('Login');
        }
        
      } catch (error) {
        console.error('App initialization failed:', error);
        setStatusMessage('初期化に失敗しました');
        
        // エラー時はログイン画面へフォールバック
        setTimeout(() => {
          navigation.replace('Login');
        }, 1000);
      } finally {
        setIsInitializing(false);
      }
    };

    // 最低2秒は表示してからAPI処理開始
    const timer = setTimeout(() => {
      initializeApp();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>HDB</Text>
        <Text style={styles.subtitle}>Health Data Bank</Text>
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.loader}
        />
        <Text style={styles.status}>{statusMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  status: {
    fontSize: 14,
    color: '#999999',
    marginTop: 20,
    textAlign: 'center',
  },
});
