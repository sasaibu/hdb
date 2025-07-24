import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth } = Dimensions.get('window');

type GoalContinuationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GoalContinuation'
>;

type GoalContinuationScreenRouteProp = RouteProp<
  RootStackParamList,
  'GoalContinuation'
>;

interface Props {
  navigation: GoalContinuationScreenNavigationProp;
  route: GoalContinuationScreenRouteProp;
}

interface GoalData {
  goalType: string;
  goalPrinciple1: string;
  goalPrinciple2: string;
  goalReason: string;
  goalDetail: string;
  createdAt: string;
  completedDays: string[];
  lastCompletedDate: string | null;
}

const GoalContinuationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [buttonStatus, setButtonStatus] = useState<'未入力' | 'DONE'>('未入力');
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadGoalData();
  }, []);

  useEffect(() => {
    if (goalData) {
      updateButtonStatus();
      calculateConsecutiveDays();
    }
  }, [goalData]);

  const loadGoalData = async () => {
    try {
      const savedGoal = await AsyncStorage.getItem('currentGoal');
      console.log('保存された目標データ:', savedGoal);
      console.log('route.params:', route.params);
      
      if (savedGoal) {
        const parsedGoal = JSON.parse(savedGoal);
        setGoalData({
          ...parsedGoal,
          completedDays: parsedGoal.completedDays || [],
          lastCompletedDate: parsedGoal.lastCompletedDate || null,
        });
      } else if (route.params) {
        // 新しく設定された目標の場合
        const newGoalData: GoalData = {
          goalType: route.params.goalType || '回数',
          goalPrinciple1: route.params.goalPrinciple1 || '',
          goalPrinciple2: route.params.goalPrinciple2 || '',
          goalReason: route.params.goalReason || '',
          goalDetail: route.params.goalDetail || '',
          createdAt: new Date().toISOString(),
          completedDays: [],
          lastCompletedDate: null,
        };
        console.log('新しい目標データ:', newGoalData);
        setGoalData(newGoalData);
        await AsyncStorage.setItem('currentGoal', JSON.stringify(newGoalData));
      }
    } catch (error) {
      console.error('目標データの読み込みに失敗しました:', error);
    }
  };

  const updateButtonStatus = () => {
    if (!goalData) return;

    const today = new Date().toDateString();
    const todayCompleted = goalData.completedDays.includes(today);

    if (todayCompleted) {
      setButtonStatus('DONE');
      setStatusMessage('');
    } else {
      setButtonStatus('未入力');
      
      // ステータスメッセージの設定
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      const yesterdayCompleted = goalData.completedDays.includes(yesterdayString);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoString = twoDaysAgo.toDateString();
      const twoDaysAgoCompleted = goalData.completedDays.includes(twoDaysAgoString);

      if (!yesterdayCompleted && !twoDaysAgoCompleted && goalData.completedDays.length > 0) {
        setStatusMessage('本日分、前日分未入力');
      } else if (!yesterdayCompleted && goalData.completedDays.length > 0) {
        setStatusMessage('前日分未入力');
      } else {
        setStatusMessage('');
      }
    }
  };

  const calculateConsecutiveDays = () => {
    if (!goalData || goalData.completedDays.length === 0) {
      setConsecutiveDays(0);
      return;
    }

    let consecutive = 0;
    const today = new Date();
    let checkDate = new Date(today);

    // 今日が完了している場合は今日から、そうでない場合は昨日から確認
    const todayCompleted = goalData.completedDays.includes(today.toDateString());
    if (!todayCompleted) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (goalData.completedDays.includes(checkDate.toDateString())) {
      consecutive++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    setConsecutiveDays(consecutive);
  };

  const handleButtonPress = async () => {
    if (buttonStatus === 'DONE') return;

    const today = new Date().toDateString();
    const updatedGoalData = {
      ...goalData!,
      completedDays: [...goalData!.completedDays, today],
      lastCompletedDate: today,
    };

    setGoalData(updatedGoalData);
    await AsyncStorage.setItem('currentGoal', JSON.stringify(updatedGoalData));
    
    Alert.alert('完了！', '今日の目標を達成しました！');
  };

  const formatGoalDisplay = () => {
    if (!goalData) return '';
    
    // 最初に入力した目標（goalPrinciple1）をそのまま表示
    return goalData.goalPrinciple1 || goalData.goalDetail || '';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'current' && styles.activeTab]}
            onPress={() => setActiveTab('current')}
          >
            <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
              今の目標
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              履歴
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'current' && goalData && (
        <View style={styles.content}>
          <View style={styles.goalCard}>
            <Text style={styles.goalText}>
              {formatGoalDisplay() || '目標が設定されていません'}
            </Text>
            <Text style={styles.reasonText}>
              理由: {goalData.goalReason || '未設定'}
            </Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>🚶</Text>
            </View>
            <View style={styles.arrowContainer}>
              <View style={styles.arrow} />
              <View style={styles.arrowHead} />
            </View>
            <View style={styles.countContainer}>
              <Text style={styles.countNumber}>{consecutiveDays}</Text>
              <Text style={styles.countLabel}>日連続</Text>
            </View>
          </View>

          {statusMessage !== '' && (
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              buttonStatus === 'DONE' && styles.doneButton
            ]}
            onPress={handleButtonPress}
            disabled={buttonStatus === 'DONE'}
          >
            <Text style={[
              styles.buttonText,
              buttonStatus === 'DONE' && styles.doneButtonText
            ]}>
              {buttonStatus}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>過去の目標履歴</Text>
          <Text style={styles.comingSoon}>準備中...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 50,
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#FFF5F0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFE0D0',
  },
  goalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    fontSize: 60,
  },
  arrowContainer: {
    width: screenWidth * 0.8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrow: {
    height: 4,
    width: '100%',
    backgroundColor: '#FF6B35',
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FF6B35',
    position: 'absolute',
    right: -10,
  },
  countContainer: {
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  countLabel: {
    fontSize: 18,
    color: '#666666',
  },
  statusMessage: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doneButtonText: {
    color: '#FFFFFF',
  },
  historyContent: {
    padding: 20,
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 16,
    color: '#999999',
    marginTop: 40,
  },
});

export default GoalContinuationScreen;