import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const PulseSurveyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>パルスサーベイ</Text>
        <Text style={styles.subtitle}>従業員の健康状態を定期的にチェック</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今週のサーベイ</Text>
        <TouchableOpacity style={styles.surveyCard}>
          <Text style={styles.surveyTitle}>週次健康チェック</Text>
          <Text style={styles.surveyStatus}>未回答</Text>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>回答を開始</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>回答履歴</Text>
        <View style={styles.historyCard}>
          <Text style={styles.historyDate}>2024年1月15日</Text>
          <Text style={styles.historyScore}>健康スコア: 85/100</Text>
        </View>
        <View style={styles.historyCard}>
          <Text style={styles.historyDate}>2024年1月8日</Text>
          <Text style={styles.historyScore}>健康スコア: 82/100</Text>
        </View>
        <View style={styles.historyCard}>
          <Text style={styles.historyDate}>2024年1月1日</Text>
          <Text style={styles.historyScore}>健康スコア: 79/100</Text>
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
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  surveyStatus: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  historyScore: {
    fontSize: 14,
    color: '#666666',
  },
});

export default PulseSurveyScreen;