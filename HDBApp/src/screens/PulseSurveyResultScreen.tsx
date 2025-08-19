import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'PulseSurveyResult'>;

interface Answer {
  questionId: string;
  value: number;
}

interface Question {
  id: string;
  text: string;
  category: string;
}

const PulseSurveyResultScreen: React.FC<Props> = ({route, navigation}) => {
  const {surveyId, answers, questions, completedAt} = route.params;

  const weatherOptions = [
    {value: 4, icon: '☀️', label: 'そうだ', color: '#FFD700'},
    {value: 3, icon: '☁️', label: 'まあそうだ', color: '#A0A0A0'},
    {value: 2, icon: '🌧️', label: 'やや違う', color: '#4682B4'},
    {value: 1, icon: '⛈️', label: '違う', color: '#2C3E50'},
  ];

  const getWeatherOption = (value: number) => {
    return weatherOptions.find(option => option.value === value) || weatherOptions[0];
  };

  // カテゴリごとの平均スコアを計算
  const calculateCategoryScores = () => {
    const categoryScores: {[key: string]: {total: number; count: number}} = {};
    
    questions.forEach((question) => {
      const answer = answers.find(a => a.questionId === question.id);
      if (answer) {
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = {total: 0, count: 0};
        }
        categoryScores[question.category].total += answer.value;
        categoryScores[question.category].count += 1;
      }
    });

    return Object.entries(categoryScores).map(([category, scores]) => ({
      category,
      average: scores.total / scores.count,
    }));
  };

  const categoryScores = calculateCategoryScores();
  const overallScore = answers.reduce((sum, answer) => sum + answer.value, 0) / answers.length;

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return '#4CAF50';
    if (score >= 2.5) return '#FF9800';
    if (score >= 1.5) return '#FF5722';
    return '#F44336';
  };

  const getScoreText = (score: number) => {
    if (score >= 3.5) return '良好';
    if (score >= 2.5) return '普通';
    if (score >= 1.5) return '要注意';
    return '要改善';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>パルスサーベイ分析結果</Text>
        <Text style={styles.date}>回答日: {formatDate(completedAt)}</Text>
      </View>

      {/* 総合スコア */}
      <View style={styles.overallScoreContainer}>
        <Text style={styles.overallScoreTitle}>総合スコア</Text>
        <View style={styles.overallScoreContent}>
          <Text style={[styles.overallScore, {color: getScoreColor(overallScore)}]}>
            {overallScore.toFixed(1)}
          </Text>
          <Text style={styles.overallScoreMax}>/4.0</Text>
        </View>
        <Text style={[styles.overallScoreText, {color: getScoreColor(overallScore)}]}>
          {getScoreText(overallScore)}
        </Text>
      </View>

      {/* カテゴリ別スコア */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>カテゴリ別スコア</Text>
        {categoryScores.map((score, index) => {
          const weatherOption = getWeatherOption(Math.round(score.average));
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{score.category}</Text>
                <View style={styles.categoryScore}>
                  <Text style={styles.categoryScoreIcon}>{weatherOption.icon}</Text>
                  <Text style={[styles.categoryScoreValue, {color: weatherOption.color}]}>
                    {score.average.toFixed(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreBarFill, 
                    {
                      width: `${(score.average / 4) * 100}%`,
                      backgroundColor: weatherOption.color,
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* 回答詳細 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>回答詳細</Text>
        {questions.map((question) => {
          const answer = answers.find(a => a.questionId === question.id);
          if (!answer) return null;
          const weatherOption = getWeatherOption(answer.value);
          
          return (
            <View key={question.id} style={styles.answerItem}>
              <Text style={styles.answerCategory}>{question.category}</Text>
              <Text style={styles.answerQuestion}>{question.text}</Text>
              <View style={styles.answerValue}>
                <Text style={styles.answerIcon}>{weatherOption.icon}</Text>
                <Text style={[styles.answerLabel, {color: weatherOption.color}]}>
                  {weatherOption.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* アドバイス */}
      <View style={styles.adviceContainer}>
        <Text style={styles.adviceTitle}>今後のアドバイス</Text>
        <Text style={styles.adviceText}>
          {overallScore >= 3.5 
            ? '現在の状態は良好です。この調子を維持していきましょう。定期的なリフレッシュと適度な運動を心がけてください。'
            : overallScore >= 2.5
            ? '全体的には標準的な状態です。ストレスが溜まりやすい項目については、早めの対策を心がけましょう。'
            : '要注意の項目がいくつか見られます。上司や人事部門に相談することをおすすめします。無理をせず、必要に応じて休息を取りましょう。'
          }
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('PulseSurveyList')}
        activeOpacity={0.8}>
        <Text style={styles.backButtonText}>一覧へ戻る</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  overallScoreContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overallScoreTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  overallScoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  overallScoreMax: {
    fontSize: 24,
    color: '#999999',
    marginLeft: 8,
  },
  overallScoreText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  categoryScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryScoreIcon: {
    fontSize: 24,
  },
  categoryScoreValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  answerItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  answerCategory: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },
  answerQuestion: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  answerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerIcon: {
    fontSize: 28,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  adviceContainer: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  adviceText: {
    fontSize: 15,
    color: '#1B5E20',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PulseSurveyResultScreen;