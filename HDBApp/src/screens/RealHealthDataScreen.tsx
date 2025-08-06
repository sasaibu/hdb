import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RealHealthConnectService from '../services/RealHealthConnectService';

const RealHealthDataScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const getRealHealthData = async () => {
    setIsLoading(true);
    setHealthData([]);
    setLogs([]);
    
    addLog('🔥 実際のHealth Connectから生データ取得開始');
    
    const healthService = RealHealthConnectService.getInstance();
    
    // データ種別
    const dataTypes = [
      'Steps', 'HeartRate', 'BloodPressure', 'Weight', 'Sleep'
    ];

    try {
      // Health Connect可用性チェック
      const isAvailable = await healthService.isHealthConnectAvailable();
      addLog(`Health Connect可用性: ${isAvailable ? '✅ 利用可能' : '❌ 利用不可'}`);

      if (!isAvailable) {
        Alert.alert('エラー', 'Health Connectが利用できません');
        setIsLoading(false);
        return;
      }

      // 権限リクエスト（既に権限がある場合はスキップ）
      const permissionGranted = await healthService.requestPermissions();
      addLog(`権限取得: ${permissionGranted ? '✅ 許可' : '❌ 拒否'}`);

      if (!permissionGranted) {
        Alert.alert('エラー', 'Health Connectの権限が必要です');
        setIsLoading(false);
        return;
      }

      // 実際のデータ取得
      const allData: any[] = [];
      
      for (const dataType of dataTypes) {
        try {
          addLog(`📊 ${dataType}データ取得中...`);
          
          const data = await healthService.getRealHealthData(dataType);
          
          if (data.length > 0) {
            addLog(`✅ ${dataType}: ${data.length}件の実際のデータを取得`);
            
            // 最初の3件の詳細ログ
            data.slice(0, 3).forEach((record, index) => {
              addLog(`${dataType} 実データ${index + 1}: ${JSON.stringify(record, null, 2)}`);
            });
            
            allData.push({
              dataType,
              count: data.length,
              data: data,
              success: true
            });
          } else {
            addLog(`⚠️ ${dataType}: データなし`);
            allData.push({
              dataType,
              count: 0,
              data: [],
              success: true
            });
          }
        } catch (error: any) {
          addLog(`❌ ${dataType}: エラー - ${error.message}`);
          allData.push({
            dataType,
            count: 0,
            data: [],
            success: false,
            error: error.message
          });
        }
      }

      setHealthData(allData);
      
      // サマリー
      const totalRecords = allData.reduce((sum, item) => sum + item.count, 0);
      const successCount = allData.filter(item => item.success).length;
      
      addLog('📋 取得結果サマリー');
      addLog(`成功: ${successCount}/${dataTypes.length} データ種別`);
      addLog(`総レコード数: ${totalRecords}件`);
      addLog('🎉 実際の生データ取得完了！');

    } catch (error: any) {
      addLog(`❌ 全体エラー: ${error.message}`);
      Alert.alert('エラー', `データ取得に失敗しました: ${error.message}`);
    }

    setIsLoading(false);
  };

  const shareRealData = async () => {
    if (healthData.length === 0) {
      Alert.alert('エラー', '共有するデータがありません');
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `real_health_data_${timestamp}.json`;
      
      // 完全なレポート生成
      const report = {
        executedAt: new Date().toISOString(),
        dataSource: 'REAL_HEALTH_CONNECT',
        platform: 'Android',
        summary: {
          totalDataTypes: healthData.length,
          successfulDataTypes: healthData.filter(item => item.success).length,
          totalRecords: healthData.reduce((sum, item) => sum + item.count, 0),
          successRate: `${((healthData.filter(item => item.success).length / healthData.length) * 100).toFixed(1)}%`
        },
        healthData: healthData,
        logs: logs
      };

      // AsyncStorageに保存
      await AsyncStorage.setItem(`real_health_data_${timestamp}`, JSON.stringify(report, null, 2));

      // 共有メッセージ作成
      const shareMessage = `🔥 実際のHealth Connect生データ取得結果

実行日時: ${report.executedAt}
データソース: 実際のHealth Connect API

=== サマリー ===
${JSON.stringify(report.summary, null, 2)}

=== 取得データ詳細 ===
${healthData.map(item => 
  `${item.dataType}: ${item.success ? `${item.count}件取得` : 'エラー'}`
).join('\n')}

=== 実際の生データサンプル ===
${healthData.filter(item => item.count > 0).slice(0, 2).map(item => 
  `${item.dataType}:\n${JSON.stringify(item.data[0], null, 2)}`
).join('\n\n')}

=== 実行ログ（最後の10件） ===
${logs.slice(-10).join('\n')}

完全なレポート: ${filename}`;

      await Share.share({
        message: shareMessage,
        title: '🔥 実際のHealth Connect生データレポート',
      });

      // コンソールにも出力
      console.log('=== REAL HEALTH CONNECT DATA REPORT ===');
      console.log(JSON.stringify(report, null, 2));
      console.log('=== END REAL DATA REPORT ===');

      Alert.alert('成功', `実際の生データレポートを共有しました\nファイル名: ${filename}`);

    } catch (error: any) {
      Alert.alert('エラー', `共有に失敗しました: ${error.message}`);
    }
  };

  const clearData = () => {
    setHealthData([]);
    setLogs([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 実際のHealth Connect生データ取得</Text>
        <Text style={styles.subtitle}>本物の生データ専用画面</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={getRealHealthData}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔥 実データ取得中...' : '🔥 実際の生データを取得'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={shareRealData}
          disabled={healthData.length === 0}
        >
          <Text style={styles.buttonText}>📤 実データ共有</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearData}
        >
          <Text style={styles.buttonText}>🗑️ クリア</Text>
        </TouchableOpacity>
      </View>

      {healthData.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📊 実データ取得結果</Text>
          <Text style={styles.summaryText}>
            成功: {healthData.filter(item => item.success).length}/{healthData.length} データ種別
          </Text>
          <Text style={styles.summaryText}>
            総レコード数: {healthData.reduce((sum, item) => sum + item.count, 0)}件
          </Text>
          <Text style={styles.realDataBadge}>🔥 実際のHealth Connectデータ</Text>
        </View>
      )}

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>🔥 実行ログ（実データ取得）</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
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
    padding: 20,
    backgroundColor: '#FF6B35',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: '48%',
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
  },
  shareButton: {
    backgroundColor: '#4ECDC4',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  realDataBadge: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 8,
  },
  logContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FF6B35',
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
    color: '#333',
  },
});

export default RealHealthDataScreen;
