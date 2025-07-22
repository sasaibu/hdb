import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const DataMigrationScreen = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const handleStartMigration = () => {
    setIsMigrating(true);
    // データ移行処理を開始するロジックをここに追加します
  };

  const handleCancelMigration = () => {
    setIsMigrating(false);
    // データ移行処理を中断するロジックをここに追加します
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>dヘルスケア データ移行</Text>
      </View>
      <View style={styles.content}>
        {isMigrating ? (
          <>
            <ActivityIndicator size="large" color="#FF3B30" style={styles.loader} />
            <Text style={styles.message}>
              dヘルスケアのデータを移行しています。{'\n'}しばらくお待ちください。
            </Text>
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleStartMigration}>
              <Text style={styles.buttonText}>データの移行</Text>
            </TouchableOpacity>
          </>
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
});

export default DataMigrationScreen;
