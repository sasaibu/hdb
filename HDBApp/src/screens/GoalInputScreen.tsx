import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {useGoal} from '../contexts/GoalContext';
import ScreenWithBottomNav from '../components/ScreenWithBottomNav';

type Props = StackScreenProps<RootStackParamList, 'GoalInput'>;

const GoalInputScreen: React.FC<Props> = ({navigation}) => {
  const [goal, setGoal] = useState('');
  const { setIsGoalSetting } = useGoal();

  useEffect(() => {
    // 目標設定モードを維持
    setIsGoalSetting(true);

    return () => {
      // この画面から離れても目標設定モードは維持
    };
  }, [setIsGoalSetting]);

  const handleNext = () => {
    if (goal.trim()) {
      // 目標を保存して次の画面へ
      console.log('入力された目標:', goal);
      navigation.navigate('GoalNotification', {
        goalType: '回数', // デフォルトは回数として設定
        goalPrinciple1: goal,
        goalPrinciple2: '1回', // デフォルト値
        goalReason: '', // 後で入力
        goalDetail: goal,
      });
    }
  };

  return (
    <ScreenWithBottomNav activeTab="goal">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            
            <Text style={styles.title}>
              ここで決めたことは30日間続けます
            </Text>

            <TouchableOpacity 
              style={styles.inputSection}
              onPress={() => navigation.navigate('GoalDetail', {
                initialGoal: goal,
                onSave: (newGoal: string) => setGoal(newGoal),
              })}>
              <Text style={[styles.inputPlaceholder, goal && styles.inputText]}>
                {goal || '目標を入力してください'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helpTitle}>
              「目標が書けない」という人へ
            </Text>

            <Text style={styles.principleText}>
              目標設定の原則①
            </Text>

            <TouchableOpacity 
              style={styles.orangeBox}
              onPress={() => navigation.navigate('GoalExamples', {
                onSelectExample: (example: string) => setGoal(example),
              })}>
              <Text style={styles.orangeText}>
                5分で達成できる、{'\n'}最低限の目標
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.nextButton, !goal.trim() && styles.nextButtonDisabled, goal.trim() && styles.nextButtonActive]}
              onPress={handleNext}
              disabled={!goal.trim()}>
              <Text style={[styles.nextButtonText, goal.trim() && styles.nextButtonTextActive]}>
                次へ
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenWithBottomNav>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6', // 薄い橙色
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // ナビゲーション用の余白
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 40,
    minHeight: 80,
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  inputText: {
    color: '#333333',
  },
  helpTitle: {
    fontSize: 16,
    color: '#FF8C00', // オレンジ色
    marginBottom: 20,
    textAlign: 'center',
  },
  principleText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  orangeBox: {
    borderWidth: 2,
    borderColor: '#FF8C00', // オレンジ色の枠
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  orangeText: {
    fontSize: 18,
    color: '#FF8C00', // オレンジ色の文字
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 26,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#999999', // グレー文字
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonActive: {
    backgroundColor: '#FF8C00', // オレンジ背景
    borderColor: '#FF8C00',
  },
  nextButtonTextActive: {
    color: '#FFFFFF', // 白文字
  },
});

export default GoalInputScreen;