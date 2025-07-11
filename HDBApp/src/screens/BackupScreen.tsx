import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {apiClient} from '../services/api/apiClient';

const BackupScreen = () => {
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    backupId?: string;
    size?: number;
    createdAt?: string;
  } | null>(null);

  const handleBackup = async () => {
    Alert.alert(
      '確認',
      'バックアップを開始しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '開始',
          onPress: async () => {
            setLoading(true);
            setBackupInfo(null);

            try {
              const response = await apiClient.createBackup();
              
              if (response.success && response.data) {
                setBackupInfo({
                  backupId: response.data.backupId,
                  size: response.data.size,
                  createdAt: response.data.createdAt,
                });
                Alert.alert('成功', response.message || 'バックアップが完了しました');
              } else {
                Alert.alert('エラー', 'バックアップに失敗しました');
              }
            } catch (error) {
              console.error('Backup failed:', error);
              Alert.alert('エラー', 'バックアップ中にエラーが発生しました');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DBバックアップ</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleBackup}>
          <Text style={styles.buttonText}>バックアップの実行</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>バックアップ中...</Text>
          </View>
        )}

        {backupInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>バックアップ情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>バックアップID:</Text>
              <Text style={styles.infoValue}>{backupInfo.backupId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>サイズ:</Text>
              <Text style={styles.infoValue}>{formatFileSize(backupInfo.size || 0)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>作成日時:</Text>
              <Text style={styles.infoValue}>{formatDate(backupInfo.createdAt || '')}</Text>
            </View>
            <Text style={styles.notice}>
              ※ このバックアップIDを安全に保管してください
            </Text>
          </View>
        )}
      </View>
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
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  notice: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default BackupScreen;
