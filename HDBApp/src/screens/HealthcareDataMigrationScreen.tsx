import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HealthcareDataMigrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HealthcareDataMigration'
>;

interface Props {
  navigation: HealthcareDataMigrationScreenNavigationProp;
}

const HealthcareDataMigrationScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState<'migrate' | 'skip' | 'later' | null>(null);

  const handleComplete = async () => {
    if (!selectedOption) return;

    try {
      // 選択内容を保存
      await AsyncStorage.setItem('healthcareDataMigration', selectedOption);
      
      // 初回ログイン完了フラグを設定
      await AsyncStorage.setItem('isFirstLogin', 'false');

      if (selectedOption === 'migrate') {
        // データ移行画面へ
        navigation.navigate('DataMigrationLogin');
      } else {
        // ホーム画面へ
        navigation.navigate('Main');
      }
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>ステップ 4/4</Text>
        <Text style={styles.title}>ヘルスケアデータの移行</Text>
        <Text style={styles.subtitle}>
          既存のヘルスケアデータをインポートしますか？
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🏥</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedOption === 'migrate' && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedOption('migrate')}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>📱</Text>
            <Text style={styles.optionTitle}>データを移行する</Text>
          </View>
          <Text style={styles.optionDescription}>
            Apple HealthやGoogle Fitから過去のデータをインポートします
          </Text>
          {selectedOption === 'migrate' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedOption === 'skip' && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedOption('skip')}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>🚫</Text>
            <Text style={styles.optionTitle}>移行しない</Text>
          </View>
          <Text style={styles.optionDescription}>
            新規でデータの記録を開始します
          </Text>
          {selectedOption === 'skip' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedOption === 'later' && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedOption('later')}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>⏰</Text>
            <Text style={styles.optionTitle}>後で実行</Text>
          </View>
          <Text style={styles.optionDescription}>
            設定からいつでもデータ移行を実行できます
          </Text>
          {selectedOption === 'later' && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, !selectedOption && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={!selectedOption}
        >
          <Text style={[styles.completeButtonText, !selectedOption && styles.completeButtonTextDisabled]}>
            {selectedOption === 'migrate' ? 'データ移行へ進む' : '設定を完了'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  optionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  completeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButtonTextDisabled: {
    color: '#999',
  },
});

export default HealthcareDataMigrationScreen;