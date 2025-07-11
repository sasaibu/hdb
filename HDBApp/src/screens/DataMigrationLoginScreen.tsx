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
import {apiClient} from '../services/api/apiClient';

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
      const response = await apiClient.migrationAuth(userId, password);
      
      if (response.success && response.data) {
        if (response.data.userData.hasData) {
          Alert.alert(
            '成功',
            `データ移行ログインに成功しました。\n移行可能なデータ: ${response.data.userData.vitalsCount}件`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.replace('DataMigration', {
                    migrationToken: response.data.migrationToken,
                    sourceSystem: 'legacy-hdb',
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert('確認', '移行可能なデータがありません');
        }
      } else {
        Alert.alert('エラー', response.message || 'ユーザーIDまたはパスワードが異なります');
      }
    } catch (error) {
      console.error('Migration login error:', error);
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
