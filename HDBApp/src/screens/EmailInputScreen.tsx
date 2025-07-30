import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EmailInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailInput'
>;

interface Props {
  navigation: EmailInputScreenNavigationProp;
}

const EmailInputScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmail(text);
    setIsValid(emailRegex.test(text));
  };

  const handleNext = async () => {
    if (isValid) {
      try {
        // メールアドレスを保存
        await AsyncStorage.setItem('userEmail', email);
        navigation.navigate('NicknameInput');
      } catch (error) {
        Alert.alert('エラー', 'メールアドレスの保存に失敗しました');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.step}>ステップ 1/4</Text>
          <Text style={styles.title}>メールアドレスを入力</Text>
          <Text style={styles.subtitle}>
            アカウントの作成と通知の受信に使用します
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              style={[styles.input, isValid && styles.inputValid]}
              placeholder="your@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email.length > 0 && !isValid && (
              <Text style={styles.errorText}>
                有効なメールアドレスを入力してください
              </Text>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              メールアドレスは、パスワードリセットや重要なお知らせの送信に使用されます。
              正確なアドレスを入力してください。
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={[styles.nextButtonText, !isValid && styles.nextButtonTextDisabled]}>
              次へ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('NicknameInput')}
          >
            <Text style={styles.skipButtonText}>スキップ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  step: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  inputValid: {
    borderColor: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
  },
  nextButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
  },
});

export default EmailInputScreen;