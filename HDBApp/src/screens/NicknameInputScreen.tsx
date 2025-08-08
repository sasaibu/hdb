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

type NicknameInputScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NicknameInput'
>;

interface Props {
  navigation: NicknameInputScreenNavigationProp;
}

const NicknameInputScreen: React.FC<Props> = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validateNickname = (text: string) => {
    setNickname(text);
    // 2文字以上20文字以下で有効とする
    setIsValid(text.trim().length >= 2 && text.trim().length <= 20);
  };

  const handleNext = async () => {
    if (isValid) {
      try {
        // ニックネームを保存
        await AsyncStorage.setItem('userNickname', nickname.trim());
        navigation.navigate('LinkedServicesSettings');
      } catch (error) {
        Alert.alert('エラー', 'ニックネームの保存に失敗しました');
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
          <Text style={styles.step}>ステップ 2/4</Text>
          <Text style={styles.title}>ニックネームを入力</Text>
          <Text style={styles.subtitle}>
            アプリ内で表示される名前を設定してください
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ニックネーム</Text>
            <TextInput
              style={[styles.input, isValid && styles.inputValid]}
              placeholder="健康太郎"
              placeholderTextColor="#999"
              value={nickname}
              onChangeText={validateNickname}
              maxLength={20}
              autoCorrect={false}
            />
            <Text style={styles.charCount}>
              {nickname.length}/20文字
            </Text>
            {nickname.length > 0 && !isValid && (
              <Text style={styles.errorText}>
                2文字以上20文字以下で入力してください
              </Text>
            )}
          </View>

          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>ニックネームの例：</Text>
            <View style={styles.suggestionList}>
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => validateNickname('健康マスター')}
              >
                <Text style={styles.suggestionText}>健康マスター</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => validateNickname('ヘルシー太郎')}
              >
                <Text style={styles.suggestionText}>ヘルシー太郎</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => validateNickname('元気一番')}
              >
                <Text style={styles.suggestionText}>元気一番</Text>
              </TouchableOpacity>
            </View>
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
            onPress={() => navigation.navigate('LinkedServicesSettings')}
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
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  suggestionContainer: {
    marginTop: 20,
  },
  suggestionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
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

export default NicknameInputScreen;