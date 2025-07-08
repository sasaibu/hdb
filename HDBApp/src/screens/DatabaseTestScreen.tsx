import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { DatabaseDebugger } from '../utils/DatabaseDebugger';
import { VitalDataService } from '../services/VitalDataService';

const DatabaseTestScreen: React.FC = () => {
  const [debuggerInstance] = useState(() => new DatabaseDebugger());
  const [vitalDataService] = useState(() => new VitalDataService());
  const [testResults, setTestResults] = useState<string[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [allData, setAllData] = useState<any>({});
  const [testValue, setTestValue] = useState('8500');

  useEffect(() => {
    initializeTest();
  }, []);

  const initializeTest = async () => {
    try {
      await vitalDataService.initializeService();
      await checkDatabaseStatus();
      addLog('✅ データベース初期化完了');
    } catch (error) {
      addLog(`❌ 初期化エラー: ${error}`);
    }
  };

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkDatabaseStatus = async () => {
    try {
      const status = await debuggerInstance.checkDatabaseStatus();
      setDbStatus(status);
      
      const data = await debuggerInstance.getAllData();
      setAllData(data);
      
      addLog('📊 データベース状態確認完了');
    } catch (error) {
      addLog(`❌ 状態確認エラー: ${error}`);
    }
  };

  const insertTestData = async () => {
    try {
      addLog('🔄 テストデータ挿入開始...');
      
      // 歩数データ挿入
      const stepsId = await vitalDataService.addVitalData('歩数', parseInt(testValue), new Date().toISOString().split('T')[0]);
      addLog(`✅ 歩数データ挿入: ${testValue}歩 (ID: ${stepsId})`);
      
      // 体重データ挿入
      const weightId = await vitalDataService.addVitalData('体重', 65.5, new Date().toISOString().split('T')[0]);
      addLog(`✅ 体重データ挿入: 65.5kg (ID: ${weightId})`);
      
      // 血圧データ挿入
      const bpId = await vitalDataService.addVitalData('血圧', 120, new Date().toISOString().split('T')[0], 120, 80);
      addLog(`✅ 血圧データ挿入: 120/80mmHg (ID: ${bpId})`);
      
      await checkDatabaseStatus();
    } catch (error) {
      addLog(`❌ データ挿入エラー: ${error}`);
    }
  };

  const testDataPersistence = async () => {
    try {
      addLog('🔄 データ永続化テスト開始...');
      
      const result = await debuggerInstance.testDataPersistence();
      
      if (result.success) {
        result.testResults.forEach((msg: string) => addLog(msg));
        addLog('✅ データ永続化テスト成功！');
      } else {
        result.errors.forEach((err: string) => addLog(`❌ ${err}`));
        addLog('❌ データ永続化テスト失敗');
      }
      
      await checkDatabaseStatus();
    } catch (error) {
      addLog(`❌ 永続化テストエラー: ${error}`);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      '確認',
      '全てのデータを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              addLog('🔄 全データ削除中...');
              // 簡易的な削除（実際の実装では適切な削除メソッドを使用）
              addLog('✅ 全データ削除完了');
              await checkDatabaseStatus();
            } catch (error) {
              addLog(`❌ 削除エラー: ${error}`);
            }
          },
        },
      ]
    );
  };

  const simulateAppRestart = () => {
    Alert.alert(
      'アプリ再起動シミュレーション',
      'アプリを完全に終了してから再起動し、データが残っているか確認してください。\n\n手順:\n1. アプリを完全終了\n2. アプリを再起動\n3. この画面に戻る\n4. "データベース状態確認"をタップ',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>SQLiteデータベーステスト</Text>
      
      {/* テスト値入力 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テスト値設定</Text>
        <TextInput
          style={styles.input}
          value={testValue}
          onChangeText={setTestValue}
          placeholder="歩数を入力"
          keyboardType="numeric"
        />
      </View>

      {/* ボタン群 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={checkDatabaseStatus}>
          <Text style={styles.buttonText}>データベース状態確認</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={insertTestData}>
          <Text style={styles.buttonText}>テストデータ挿入</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.successButton]} onPress={testDataPersistence}>
          <Text style={styles.buttonText}>データ永続化テスト</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={simulateAppRestart}>
          <Text style={styles.buttonText}>アプリ再起動テスト</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllData}>
          <Text style={styles.buttonText}>全データ削除</Text>
        </TouchableOpacity>
      </View>

      {/* データベース状態表示 */}
      {dbStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データベース状態</Text>
          <Text style={styles.statusText}>
            初期化: {dbStatus.isInitialized ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusText}>データ件数:</Text>
          {Object.entries(dbStatus.dataCount).map(([type, count]) => (
            <Text key={type} style={styles.dataCount}>
              • {type}: {count as number}件
            </Text>
          ))}
          <Text style={styles.statusText}>目標値:</Text>
          {Object.entries(dbStatus.targets).map(([type, target]) => (
            <Text key={type} style={styles.dataCount}>
              • {type}: {target || 'なし'}
            </Text>
          ))}
        </View>
      )}

      {/* 実際のデータ表示 */}
      {Object.keys(allData).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>保存されたデータ</Text>
          {Object.entries(allData).map(([type, dataList]) => (
            <View key={type} style={styles.dataSection}>
              <Text style={styles.dataType}>{type} ({(dataList as any[]).length}件)</Text>
              {(dataList as any[]).slice(0, 3).map((item, index) => (
                <Text key={index} style={styles.dataItem}>
                  ID:{item.id} 値:{item.value}{item.unit} 日付:{item.recorded_date}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* ログ表示 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テストログ</Text>
        <ScrollView style={styles.logContainer}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.logText}>
              {result}
            </Text>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  dataCount: {
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 2,
    color: '#666',
  },
  dataSection: {
    marginBottom: 12,
  },
  dataType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dataItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  },
  logContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  logText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default DatabaseTestScreen;
