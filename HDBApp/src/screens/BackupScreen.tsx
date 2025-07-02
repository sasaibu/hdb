import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const BackupScreen = () => {
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    password?: string;
    expiry?: string;
  } | null>(null);

  const handleBackup = () => {
    setLoading(true);
    setBackupInfo(null);

    // Simulate a network request or a long-running task
    setTimeout(() => {
      const generatePassword = () => {
        return Math.random().toString(36).slice(-8);
      };

      const getExpiryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // 7 days from now
        return date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      };

      setBackupInfo({
        password: generatePassword(),
        expiry: getExpiryDate(),
      });
      setLoading(false);
    }, 2000); // 2-second delay
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

        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        {backupInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>バックアップが完了しました</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>パスワード:</Text>
              <Text style={styles.infoValue}>{backupInfo.password}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>有効期限:</Text>
              <Text style={styles.infoValue}>{backupInfo.expiry}</Text>
            </View>
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
});

export default BackupScreen;
