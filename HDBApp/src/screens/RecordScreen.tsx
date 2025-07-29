import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const RecordScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>記録</Text>
        <Text style={styles.subtitle}>日々の健康データを記録</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今日の記録</Text>
        <View style={styles.recordGrid}>
          <TouchableOpacity style={styles.recordItem}>
            <Text style={styles.recordIcon}>🚶</Text>
            <Text style={styles.recordLabel}>歩数</Text>
            <Text style={styles.recordValue}>8,234歩</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordItem}>
            <Text style={styles.recordIcon}>⚖️</Text>
            <Text style={styles.recordLabel}>体重</Text>
            <Text style={styles.recordValue}>未記録</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordItem}>
            <Text style={styles.recordIcon}>🩺</Text>
            <Text style={styles.recordLabel}>血圧</Text>
            <Text style={styles.recordValue}>未記録</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recordItem}>
            <Text style={styles.recordIcon}>💤</Text>
            <Text style={styles.recordLabel}>睡眠</Text>
            <Text style={styles.recordValue}>7時間</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>記録を追加</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 新しい記録を追加</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>最近の記録</Text>
        <View style={styles.recentRecord}>
          <Text style={styles.recentDate}>2024年1月20日</Text>
          <Text style={styles.recentData}>体重: 65.2kg</Text>
        </View>
        <View style={styles.recentRecord}>
          <Text style={styles.recentDate}>2024年1月19日</Text>
          <Text style={styles.recentData}>血圧: 120/80</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  recordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  recordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recordIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  recordLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recentRecord: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDate: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  recentData: {
    fontSize: 14,
    color: '#666666',
  },
});

export default RecordScreen;