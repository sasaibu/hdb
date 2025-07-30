import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {mockApi} from '../services/api/mockApi';
import theme from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // 入場アニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockApi.login(email, password);

      if (response.success) {
        // 初回ログインかチェック
        const isFirstLogin = await AsyncStorage.getItem('isFirstLogin');
        
        if (isFirstLogin === null || isFirstLogin === 'true') {
          // 初回ログインの場合
          Alert.alert('成功', 'ログインしました。', [
            {
              text: 'OK',
              onPress: () => {
                // 退場アニメーション
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  navigation.replace('ServiceTerms'); // サービス利用条件画面へ
                });
              },
            },
          ]);
        } else {
          // 通常ログインの場合
          Alert.alert('成功', 'ログインしました。', [
            {
              text: 'OK',
              onPress: () => {
                // 退場アニメーション
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  navigation.replace('Main');
                });
              },
            },
          ]);
        }
      } else {
        Alert.alert('エラー', response.error || 'ログインに失敗しました。');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('エラー', 'ネットワークエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'パスワードリセット',
      'パスワードリセット機能は開発中です。\n\nテスト用アカウント:\nメール: test@example.com\nパスワード: password123',
    );
  };

  const handleSignUp = () => {
    Alert.alert(
      '新規登録',
      '新規登録機能は開発中です。\n\nテスト用アカウントでログインしてください:\nメール: test@example.com\nパスワード: password123',
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* 背景装飾 */}
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* ヘッダーセクション */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🏥</Text>
              </View>
              <Text style={styles.title}>おかえりなさい</Text>
              <Text style={styles.subtitle}>健康データにアクセスするためにログインしてください</Text>
            </View>

            {/* フォームセクション */}
            <View style={styles.formContainer}>
              {/* メールアドレス入力 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 メールアドレス</Text>
                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="your@example.com"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* パスワード入力 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 パスワード</Text>
                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="パスワードを入力"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.eyeIcon}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* パスワードを忘れた場合 */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  パスワードをお忘れですか？
                </Text>
              </TouchableOpacity>

              {/* ログインボタン */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? '🔄 ログイン中...' : '🚀 ログイン'}
                </Text>
              </TouchableOpacity>

              {/* テスト用アカウント情報 */}
              <View style={styles.testAccountContainer}>
                <Text style={styles.testAccountTitle}>🧪 テスト用アカウント</Text>
                <Text style={styles.testAccountText}>
                  メール: test@example.com{'\n'}
                  パスワード: password123
                </Text>
              </View>
            </View>

            {/* フッターセクション */}
            <View style={styles.footer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>または</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>
                  ✨ 新規アカウント作成
                </Text>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                ログインすることで、
                <Text style={styles.termsLink}>利用規約</Text>
                および
                <Text style={styles.termsLink}>プライバシーポリシー</Text>
                に同意したものとみなされます。
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    position: 'relative',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: theme.colors.primary[100],
    opacity: 0.3,
  },
  circle1: {
    width: 120,
    height: 120,
    top: 50,
    right: -60,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 100,
    left: -40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadow.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    paddingHorizontal: 16,
    ...theme.shadow.sm,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.background.primary,
    ...theme.shadow.md,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadow.md,
  },
  loginButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
    ...theme.shadow.sm,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  testAccountContainer: {
    backgroundColor: theme.colors.accent[50],
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent[400],
  },
  testAccountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  testAccountText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    marginHorizontal: 16,
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
});
