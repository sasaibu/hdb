import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {mockApi} from '../services/api/mockApi';
import {deviceInfoService} from '../services/DeviceInfoService';
import theme from '../styles/theme';

const {width, height} = Dimensions.get('window');

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
  
  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入場アニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // プログレスバーアニメーション
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    ).start();

    const initializeApp = async () => {
      try {
        setStatusMessage('🚀 アプリを初期化しています...');
        
        // 1. デバイス情報収集（新ER図対応）
        setStatusMessage('📱 デバイス情報を収集しています...');
        const deviceInfo = await deviceInfoService.collectDeviceInfo();
        
        // 2. 1日1回実行制御チェック
        const canExecute = await deviceInfoService.canExecuteToday();
        if (canExecute) {
          // デバイス情報登録（1日1回）
          setStatusMessage('🔐 デバイス情報を登録しています...');
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
          setStatusMessage('🔔 プッシュ通知設定を更新しています...');
          // 実際のプロジェクトでは新しいトークンを取得・更新
        }
        
        // 4. 初期データ取得
        setStatusMessage('⚙️ 設定を読み込んでいます...');
        const initialDataResponse = await mockApi.getInitialData();
        
        if (!initialDataResponse.success) {
          console.warn('Initial data fetch failed:', initialDataResponse.error);
        }
        
        // 5. 認証状態確認
        setStatusMessage('🔍 認証状態を確認しています...');
        const authResponse = await mockApi.verifyToken();
        
        if (authResponse.success && authResponse.data?.isValid) {
          // 認証済み → メイン画面へ
          console.log('User authenticated, navigating to Main');
          setStatusMessage('✅ ログイン済みです');
          
          // 退場アニメーション
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.replace('Main');
          });
        } else {
          // 未認証 → ログイン画面へ
          console.log('User not authenticated, navigating to Login');
          setStatusMessage('🔑 ログインが必要です');
          
          // 退場アニメーション
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.replace('Login');
          });
        }
        
      } catch (error) {
        console.error('App initialization failed:', error);
        setStatusMessage('❌ 初期化に失敗しました');
        
        // エラー時はログイン画面へフォールバック
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            navigation.replace('Login');
          });
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
  }, [navigation, fadeAnim, scaleAnim, slideAnim, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary[600]} />
      <View style={styles.container}>
        {/* 背景グラデーション効果 */}
        <View style={styles.backgroundGradient} />
        
        {/* 装飾的な円 */}
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* ロゴセクション */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>💊</Text>
            </View>
            <Text style={styles.title}>HDB</Text>
            <Text style={styles.subtitle}>Health Data Bank</Text>
            <Text style={styles.tagline}>あなたの健康を、データで支える</Text>
          </View>

          {/* ローディングセクション */}
          <View style={styles.loadingContainer}>
            {/* カスタムプログレスバー */}
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]} 
              />
            </View>
            
            {/* ローディングドット */}
            <View style={styles.loadingDots}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primary[300]}
                style={styles.loader}
              />
            </View>
            
            <Animated.Text 
              style={[
                styles.status,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {statusMessage}
            </Animated.Text>
          </View>
        </Animated.View>

        {/* フッター */}
        <Animated.View 
          style={[
            styles.footer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.footerText}>Powered by HDB Team</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary[500],
    opacity: 0.8,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: theme.colors.primary[400],
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    left: -50,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadow.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.primary[100],
    marginBottom: 12,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.primary[200],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBarContainer: {
    width: 200,
    height: 4,
    backgroundColor: theme.colors.primary[400],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.accent[400],
    borderRadius: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  loader: {
    marginHorizontal: 5,
  },
  status: {
    fontSize: 16,
    color: theme.colors.primary[100],
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.primary[200],
    marginBottom: 4,
  },
  version: {
    fontSize: 10,
    color: theme.colors.primary[300],
  },
});
