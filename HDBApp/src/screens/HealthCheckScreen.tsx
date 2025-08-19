import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const HealthCheckScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>健診</Text>
        <Text style={styles.subtitle}>健康診断の記録と管理</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>次回の健診予定</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>定期健康診断</Text>
          <Text style={styles.cardDate}>2024年4月15日</Text>
          <Text style={styles.cardLocation}>東京健診センター</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>過去の健診記録</Text>
        <TouchableOpacity style={styles.recordCard}>
          <Text style={styles.recordDate}>2023年10月20日</Text>
          <Text style={styles.recordType}>定期健康診断</Text>
          <Text style={styles.viewDetails}>詳細を見る →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.recordCard}>
          <Text style={styles.recordDate}>2023年4月12日</Text>
          <Text style={styles.recordType}>定期健康診断</Text>
          <Text style={styles.viewDetails}>詳細を見る →</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: '#666666',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordDate: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  recordType: {
    fontSize: 14,
    color: '#666666',
  },
  viewDetails: {
    fontSize: 14,
    color: '#FF6B35',
  },
});

export default HealthCheckScreen;