import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
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
  completedAt?: string; // 目標完了日
}

const GoalContinuationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [buttonStatus, setButtonStatus] = useState<'未入力' | 'DONE'>('未入力');
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [goalHistory, setGoalHistory] = useState<GoalData[]>([
    {
      goalType: '回数',
      goalPrinciple1: '毎日10分のストレッチ',
      goalPrinciple2: '1回',
      goalReason: '健康維持のため',
      goalDetail: '朝起きてすぐにストレッチをする',
      createdAt: '2024-01-01T00:00:00.000Z',
      completedDays: Array.from({length: 30}, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + i);
        return date.toDateString();
      }),
      lastCompletedDate: new Date('2024-01-30').toDateString(),
      completedAt: '2024-01-30T23:59:59.000Z',
    },
    {
      goalType: '時間',
      goalPrinciple1: '読書を30分',
      goalPrinciple2: '30分',
      goalReason: '知識を増やすため',
      goalDetail: '寝る前に本を読む',
      createdAt: '2024-02-01T00:00:00.000Z',
      completedDays: Array.from({length: 25}, (_, i) => {
        const date = new Date('2024-02-01');
        date.setDate(date.getDate() + i);
        return date.toDateString();
      }),
      lastCompletedDate: new Date('2024-02-25').toDateString(),
      completedAt: '2024-02-25T23:59:59.000Z',
    },
    {
      goalType: '回数',
      goalPrinciple1: '腕立て伏せ10回',
      goalPrinciple2: '10回',
      goalReason: '筋力向上',
      goalDetail: '夜シャワー前に腕立て伏せ',
      createdAt: '2024-03-01T00:00:00.000Z',
      completedDays: Array.from({length: 15}, (_, i) => {
        const date = new Date('2024-03-01');
        date.setDate(date.getDate() + i);
        return date.toDateString();
      }),
      lastCompletedDate: new Date('2024-03-15').toDateString(),
      completedAt: '2024-03-15T23:59:59.000Z',
    },
  ]);

  useEffect(() => {
    loadGoalData();
    loadGoalHistory();
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
      } else if (route.params && route.params.goalPrinciple1) {
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
      } else {
        console.log('目標データが見つかりません');
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

  const loadGoalHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('goalHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        // 既存の履歴がある場合は、ダミーデータの後に追加
        setGoalHistory(prevHistory => [...prevHistory, ...parsedHistory]);
      }
    } catch (error) {
      console.error('履歴の読み込みに失敗しました:', error);
    }
  };

  const saveToHistory = async (goal: GoalData) => {
    try {
      const completedGoal = {
        ...goal,
        completedAt: new Date().toISOString(),
      };
      
      const updatedHistory = [completedGoal, ...goalHistory];
      setGoalHistory(updatedHistory);
      await AsyncStorage.setItem('goalHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('履歴の保存に失敗しました:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

      {activeTab === 'current' && (
        <View style={styles.content}>
          <View style={styles.goalCard}>
            <Text style={styles.goalText}>
              {goalData ? (formatGoalDisplay() || '目標が設定されていません') : '目標が設定されていません'}
            </Text>
            <Text style={styles.reasonText}>
              理由: {goalData?.goalReason || '未設定'}
            </Text>
          </View>

          {goalData && (
            <>
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
                onLongPress={() => {
                  if (buttonStatus === 'DONE') {
                    setShowCancelDialog(true);
                  }
                }}
                disabled={buttonStatus === 'DONE' && false} // DONEでも長押し可能にする
              >
                <Text style={[
                  styles.buttonText,
                  buttonStatus === 'DONE' && styles.doneButtonText
                ]}>
                  {buttonStatus}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* テスト用：30日達成モーダル表示ボタン */}
          {goalData && (
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => setShowCelebrationModal(true)}
            >
              <Text style={styles.testButtonText}>テスト: 30日達成表示</Text>
            </TouchableOpacity>
          )}
          
          {/* 目標が設定されていない場合の設定ボタン */}
          {!goalData && (
            <TouchableOpacity
              style={styles.setGoalButton}
              onPress={() => navigation.navigate('GoalInput')}
            >
              <Text style={styles.setGoalButtonText}>目標を設定する</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>過去の目標履歴</Text>
          {goalHistory.length === 0 ? (
            <Text style={styles.emptyHistoryText}>まだ履歴がありません</Text>
          ) : (
            <ScrollView style={styles.historyList}>
              {goalHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyGoalText}>{item.goalPrinciple1}</Text>
                    <Text style={styles.historyDateText}>
                      {item.completedDays.length}日達成
                    </Text>
                  </View>
                  <Text style={styles.historyPeriodText}>
                    開始: {formatDate(item.createdAt)}
                  </Text>
                  {item.completedAt && (
                    <Text style={styles.historyPeriodText}>
                      完了: {formatDate(item.completedAt)}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* 30日達成モーダル */}
      <Modal
        visible={showCelebrationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCelebrationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.celebrationModal}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>祝！</Text>
            <Text style={styles.celebrationSubtitle}>30日間達成成功！</Text>
            
            <View style={styles.celebrationContent}>
              <Text style={styles.celebrationText}>
                素晴らしい成果です！
              </Text>
              <Text style={styles.celebrationText}>
                30日間、毎日目標を達成し続けたあなたは
              </Text>
              <Text style={styles.celebrationText}>
                もう立派な習慣のマスターです。
              </Text>
              <Text style={styles.celebrationText}>
                この調子で、次の30日も頑張りましょう！
              </Text>
            </View>

            <TouchableOpacity
              style={styles.celebrationButton}
              onPress={() => {
                setShowCelebrationModal(false);
                setShowResetDialog(true);
              }}
            >
              <Text style={styles.celebrationButtonText}>ありがとう！</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 目標再設定推奨ダイアログ */}
      <Modal
        visible={showResetDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resetDialog}>
            <Text style={styles.resetDialogTitle}>次の目標を設定しましょう</Text>
            
            <Text style={styles.resetDialogText}>
              習慣化に成功しました！{'\n'}
              次はどうしますか？
            </Text>

            <View style={styles.resetDialogButtons}>
              <TouchableOpacity
                style={styles.resetDialogButton}
                onPress={async () => {
                  // 現在の目標を履歴に保存
                  await saveToHistory(goalData!);
                  
                  // 同じ目標でリスタート
                  const restartData = {
                    ...goalData!,
                    completedDays: [],
                    lastCompletedDate: null,
                    createdAt: new Date().toISOString(),
                  };
                  setGoalData(restartData);
                  await AsyncStorage.setItem('currentGoal', JSON.stringify(restartData));
                  setShowResetDialog(false);
                  Alert.alert('リスタート！', '同じ目標で再スタートしました');
                }}
              >
                <Text style={styles.resetDialogButtonText}>同じ目標でリスタートする</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetDialogButton, styles.newGoalButton]}
                onPress={() => {
                  setShowResetDialog(false);
                  navigation.navigate('GoalInput');
                }}
              >
                <Text style={[styles.resetDialogButtonText, styles.newGoalButtonText]}>
                  新しい目標を設定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 入力キャンセルダイアログ */}
      <Modal
        visible={showCancelDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelDialog}>
            <Text style={styles.cancelDialogTitle}>入力のキャンセル</Text>
            
            <View style={styles.cancelDialogButtons}>
              <TouchableOpacity
                style={styles.cancelDialogButton}
                onPress={async () => {
                  // 本日分をキャンセル
                  const today = new Date().toDateString();
                  const updatedDays = goalData!.completedDays.filter(day => day !== today);
                  const updatedGoalData = {
                    ...goalData!,
                    completedDays: updatedDays,
                  };
                  setGoalData(updatedGoalData);
                  await AsyncStorage.setItem('currentGoal', JSON.stringify(updatedGoalData));
                  setShowCancelDialog(false);
                  Alert.alert('キャンセル完了', '本日分の入力をキャンセルしました');
                }}
              >
                <Text style={styles.cancelDialogButtonText}>本日分をキャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelDialogButton}
                onPress={async () => {
                  // 前日分をキャンセル
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const yesterdayString = yesterday.toDateString();
                  const updatedDays = goalData!.completedDays.filter(day => day !== yesterdayString);
                  const updatedGoalData = {
                    ...goalData!,
                    completedDays: updatedDays,
                  };
                  setGoalData(updatedGoalData);
                  await AsyncStorage.setItem('currentGoal', JSON.stringify(updatedGoalData));
                  setShowCancelDialog(false);
                  Alert.alert('キャンセル完了', '前日分の入力をキャンセルしました');
                }}
              >
                <Text style={styles.cancelDialogButtonText}>前日分をキャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelDialogButton, styles.cancelCloseButton]}
                onPress={() => setShowCancelDialog(false)}
              >
                <Text style={[styles.cancelDialogButtonText, styles.cancelCloseButtonText]}>
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  testButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  celebrationSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30,
  },
  celebrationContent: {
    marginBottom: 30,
  },
  celebrationText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  celebrationButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  celebrationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetDialogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  resetDialogText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  resetDialogButtons: {
    width: '100%',
  },
  resetDialogButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  resetDialogButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newGoalButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  newGoalButtonText: {
    color: '#FFFFFF',
  },
  cancelDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelDialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cancelDialogButtons: {
    width: '100%',
  },
  cancelDialogButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  cancelDialogButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelCloseButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
  cancelCloseButtonText: {
    color: '#FFFFFF',
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 40,
  },
  historyList: {
    width: '100%',
  },
  historyItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyGoalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  historyDateText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  historyPeriodText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  setGoalButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GoalContinuationScreen;