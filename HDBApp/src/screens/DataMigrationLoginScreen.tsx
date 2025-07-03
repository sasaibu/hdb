import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type DataMigrationLoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DataMigrationLogin'
>;

interface Props {
  navigation: DataMigrationLoginScreenNavigationProp;
}

export default function DataMigrationLoginScreen({navigation}: Props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = () => {
    if (!userId.trim()) {
      Alert.alert('エラー', 'ユーザーIDを入力してください');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('エラー', 'パスワードを入力してください');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    setIsLoading(true);
    try {
      // データ移行用の簡易的な認証ロジック
      // 実際のアプリケーションでは、データ移行専用のAPI認証などが必要になります
      if (userId === 'migrationUser' && password === 'migrationPass') {
        Alert.alert('成功', 'データ移行ログインに成功しました');
        navigation.replace('DataMigration'); // データ移行画面へ遷移
      } else {
        Alert.alert('エラー', 'ユーザーIDまたはパスワードが異なります');
      }
    } catch (error) {
      Alert.alert('エラー', 'ログイン中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>データ移行ログイン</Text>
        <Text style={styles.subtitle}>データ移行を行うにはログインが必要です</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ユーザーID</Text>
            <TextInput
              style={styles.input}
              value={userId}
              onChangeText={setUserId}
              placeholder="データ移行用ユーザーIDを入力"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>パスワード</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="データ移行用パスワードを入力"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>ログイン</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
