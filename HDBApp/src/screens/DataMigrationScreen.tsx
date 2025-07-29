import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockApi } from '../services/api/mockApi';

const DataMigrationScreen = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState('');
  const [migrationData, setMigrationData] = useState<any[]>([]);

  const handleStartMigration = async () => {
    setIsMigrating(true);
    setMigrationProgress('移行データを取得中...');
    
    try {
      // ユーザー情報取得
      const userStr = await AsyncStorage.getItem('current_user');
      if (!userStr) {
        Alert.alert('エラー', 'ユーザー情報が見つかりません');
        setIsMigrating(false);
        return;
      }

      const user = JSON.parse(userStr);
      const migrationId = `migration-${Date.now()}`;
      let index = 0;
      const count = 100;
      let allMigrationData: any[] = [];

      // ページネーション処理でデータを取得
      while (true) {
        setMigrationProgress(`移行データを取得中... (${index + 1}件目から)`);
        
        const response = await mockApi.getMigrationData(user.id, migrationId, index, count);
        
        if (!response.success) {
          throw new Error(response.error || '移行データの取得に失敗しました');
        }

        const { migrationData, hasMoreData, nextIndex, completedPercentage } = response.data;
        
        if (migrationData && migrationData.length > 0) {
          allMigrationData.push(...migrationData);
          console.log(`MockAPI: Retrieved migration data chunk ${index}-${index + count}`);
          console.log(`MockAPI: Response headers:`, response.headers);
        }

        // 進捗パーセンテージ表示
        setMigrationProgress(`移行データを取得中... (${Math.round(completedPercentage)}%完了)`);

        if (!hasMoreData) {
          break;
        }

        index = nextIndex;
        
        // 進捗表示のための短い待機
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setMigrationData(allMigrationData);
      setMigrationProgress(`移行データ取得完了 (${allMigrationData.length}件)`);
      
      // 実際の移行処理実行
      setMigrationProgress('データ移行を実行中...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // 移行処理シミュレート
      
      setMigrationProgress('移行完了');
      Alert.alert(
        '移行完了', 
        `dヘルスケアのデータ移行が完了しました。\n取得データ: ${allMigrationData.length}件`,
        [{ text: 'OK', onPress: () => setIsMigrating(false) }]
      );

    } catch (error) {
      console.error('Migration error:', error);
      Alert.alert('エラー', `データ移行に失敗しました: ${error}`);
      setIsMigrating(false);
    }
  };

  const handleCancelMigration = () => {
    setIsMigrating(false);
    setMigrationProgress('');
    setMigrationData([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>dヘルスケア データ移行</Text>
      </View>
      <ScrollView style={styles.content}>
        {isMigrating ? (
          <>
            <ActivityIndicator size="large" color="#FF3B30" style={styles.loader} />
            <Text style={styles.message}>
              dヘルスケアのデータを移行しています。{'\n'}しばらくお待ちください。
            </Text>
            {migrationProgress ? (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{migrationProgress}</Text>
              </View>
            ) : null}
            {migrationData.length > 0 && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>取得データ概要:</Text>
                <Text style={styles.dataText}>
                  {migrationData.length}件のバイタルデータを取得しました
                </Text>
                <Text style={styles.dataText}>
                  最新IF仕様書No.5準拠のJSON形式
                </Text>
                <Text style={styles.dataText}>
                  測定項目コード: 1000(歩数), 1100(体重), 1200(血圧), 1210(心拍数), 1400(体温)
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelMigration}>
              <Text style={styles.buttonText}>データの移行の中断</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.message}>
              dヘルスケアのデータを移行できます。{'\n'}データ移行を実施しますか？
            </Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>移行データについて:</Text>
              <Text style={styles.infoText}>• CSV形式でバイタルデータを取得</Text>
              <Text style={styles.infoText}>• 最新IF仕様書No.5準拠</Text>
              <Text style={styles.infoText}>• レスポンスヘッダーX-VitalHDB-Result対応</Text>
              <Text style={styles.infoText}>• ページネーション処理で大量データ対応</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleStartMigration}>
              <Text style={styles.buttonText}>データの移行</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginBottom: 20,
  },
  progressContainer: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  dataContainer: {
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#4a7c4a',
    marginBottom: 4,
  },
  infoContainer: {
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#e65100',
    marginBottom: 6,
    paddingLeft: 8,
  },
});

export default DataMigrationScreen;
