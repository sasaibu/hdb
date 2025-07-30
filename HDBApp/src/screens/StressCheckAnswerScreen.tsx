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

type Props = StackScreenProps<RootStackParamList, 'StressCheckAnswer'>;

interface Question {
  id: string;
  text: string;
  options: {value: number; label: string}[];
}

const StressCheckAnswerScreen: React.FC<Props> = ({navigation, route}) => {
  const {checkId, title} = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: number}>({});

  const questions: Question[] = [
    {
      id: 'q1',
      text: '最近1ヶ月間、仕事の量が多いと感じることがありましたか？',
      options: [
        {value: 1, label: 'ほとんどなかった'},
        {value: 2, label: 'ときどきあった'},
        {value: 3, label: 'しばしばあった'},
        {value: 4, label: 'ほとんどいつもあった'},
      ],
    },
    {
      id: 'q2',
      text: '最近1ヶ月間、時間内に仕事が処理しきれないと感じることがありましたか？',
      options: [
        {value: 1, label: 'ほとんどなかった'},
        {value: 2, label: 'ときどきあった'},
        {value: 3, label: 'しばしばあった'},
        {value: 4, label: 'ほとんどいつもあった'},
      ],
    },
    {
      id: 'q3',
      text: '最近1ヶ月間、職場での人間関係でストレスを感じることがありましたか？',
      options: [
        {value: 1, label: 'ほとんどなかった'},
        {value: 2, label: 'ときどきあった'},
        {value: 3, label: 'しばしばあった'},
        {value: 4, label: 'ほとんどいつもあった'},
      ],
    },
    {
      id: 'q4',
      text: '最近1ヶ月間、よく眠れないことがありましたか？',
      options: [
        {value: 1, label: 'ほとんどなかった'},
        {value: 2, label: 'ときどきあった'},
        {value: 3, label: 'しばしばあった'},
        {value: 4, label: 'ほとんどいつもあった'},
      ],
    },
    {
      id: 'q5',
      text: '最近1ヶ月間、イライラすることがありましたか？',
      options: [
        {value: 1, label: 'ほとんどなかった'},
        {value: 2, label: 'ときどきあった'},
        {value: 3, label: 'しばしばあった'},
        {value: 4, label: 'ほとんどいつもあった'},
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    setAnswers({...answers, [currentQuestion.id]: value});

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 全質問完了
      Alert.alert(
        '回答完了',
        'ストレスチェックの回答が完了しました。結果を確認しますか？',
        [
          {text: 'キャンセル', style: 'cancel'},
          {
            text: '結果を見る',
            onPress: () => {
              navigation.replace('StressCheckResult', {
                checkId,
                title,
                answers,
              });
            },
          },
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionNumber}>
          質問 {currentQuestionIndex + 1}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                answers[currentQuestion.id] === option.value &&
                  styles.selectedOption,
              ]}
              onPress={() => handleAnswer(option.value)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value &&
                    styles.selectedOptionText,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.disabledButtonText,
            ]}>
            前へ
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
  progressContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 32,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledButtonText: {
    color: '#999999',
  },
});

export default StressCheckAnswerScreen;