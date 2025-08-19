import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'PulseSurvey'>;

interface Question {
  id: string;
  text: string;
  category: string;
}

interface Answer {
  questionId: string;
  value: number; // 1: 大雨, 2: 雨, 3: 曇り, 4: 晴れ
}

const PulseSurveyScreen: React.FC<Props> = ({navigation}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // 質問データ
  const questions: Question[] = [
    {id: 'q1', text: '今の仕事にやりがいを感じていますか？', category: '仕事の満足度'},
    {id: 'q2', text: '職場の人間関係は良好ですか？', category: '職場環境'},
    {id: 'q3', text: '仕事とプライベートのバランスは取れていますか？', category: 'ワークライフバランス'},
    {id: 'q4', text: '上司からのサポートは十分ですか？', category: '上司との関係'},
    {id: 'q5', text: '今の仕事で成長を実感できていますか？', category: '成長実感'},
    {id: 'q6', text: '会社の方針や目標に共感できますか？', category: '組織への共感'},
    {id: 'q7', text: '適切な評価を受けていると感じますか？', category: '評価・承認'},
    {id: 'q8', text: '今の職場で長く働きたいと思いますか？', category: '継続意向'},
  ];

  const weatherOptions = [
    {value: 4, icon: '☀️', label: 'そうだ', color: '#FFD700'},
    {value: 3, icon: '☁️', label: 'まあそうだ', color: '#A0A0A0'},
    {value: 2, icon: '🌧️', label: 'やや違う', color: '#4682B4'},
    {value: 1, icon: '⛈️', label: '違う', color: '#2C3E50'},
  ];

  const handleSelectAnswer = (value: number) => {
    setSelectedValue(value);
  };

  const handleNext = () => {
    if (selectedValue === null) {
      Alert.alert('選択してください', '回答を選択してから次へ進んでください。');
      return;
    }

    // 回答を保存
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      value: selectedValue,
    };
    setAnswers([...answers.filter(a => a.questionId !== newAnswer.questionId), newAnswer]);

    // 次の質問へ
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedValue(null);
    }
  };

  const handleComplete = () => {
    if (selectedValue === null) {
      Alert.alert('選択してください', '回答を選択してから完了してください。');
      return;
    }

    // 最後の回答を保存
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      value: selectedValue,
    };
    const finalAnswers = [...answers.filter(a => a.questionId !== newAnswer.questionId), newAnswer];

    // 分析結果画面へ遷移
    navigation.navigate('PulseSurveyResult', {
      surveyId: `survey-${Date.now()}`,
      answers: finalAnswers,
      questions: questions,
      completedAt: new Date().toISOString(),
    });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>パルスサーベイ</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              {width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.category}>{currentQuestion.category}</Text>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <View style={styles.optionsContainer}>
            {weatherOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedValue === option.value && styles.selectedOption,
                  selectedValue === option.value && {borderColor: option.color},
                ]}
                onPress={() => handleSelectAnswer(option.value)}
                activeOpacity={0.8}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.optionLabel,
                  selectedValue === option.value && {color: option.color}
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedValue === null && styles.disabledButton,
          ]}
          onPress={isLastQuestion ? handleComplete : handleNext}
          disabled={selectedValue === null}
          activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? '完了' : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
    lineHeight: 26,
    marginBottom: 32,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PulseSurveyScreen;