import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {useGoal} from '../contexts/GoalContext';
import ScreenWithBottomNav from '../components/ScreenWithBottomNav';

type Props = StackScreenProps<RootStackParamList, 'GoalConfirmation'>;

const GoalConfirmationScreen: React.FC<Props> = ({navigation, route}) => {
  const { setIsGoalSetting } = useGoal();

  useEffect(() => {
    // 目標設定モードを維持
    setIsGoalSetting(true);

    return () => {
      // この画面から離れても目標設定モードは維持
    };
  }, [setIsGoalSetting]);

  const handleConfirm = () => {
    // 目標が確定したら目標設定モードを解除
    setIsGoalSetting(false);
    
    // 目標継続画面へ遷移
    navigation.navigate('GoalContinuation', {
      goalType: route.params?.goalType,
      goalPrinciple1: route.params?.goalPrinciple1,
      goalPrinciple2: route.params?.goalPrinciple2,
      goalReason: route.params?.goalReason,
      goalDetail: route.params?.goalDetail,
      notificationTime: route.params?.notificationTime,
      isNotificationOn: route.params?.isNotificationOn,
      timing: route.params?.timing,
    });
  };

  const handleEdit = () => {
    // 目標入力画面へ戻る
    navigation.navigate('GoalInput');
  };

  return (
    <ScreenWithBottomNav activeTab="home">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.title}>
              5分でできる目標ですか？
            </Text>

          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>
              おめでとうございます！{'\n'}
              目標設定が完了しました。
            </Text>

            <Text style={styles.contentText}>
              これから30日間、毎日設定した時間に{'\n'}
              通知でリマインドします。
            </Text>

            <Text style={styles.contentText}>
              最初の1週間は特に重要です。{'\n'}
              無理せず、でも確実に続けていきましょう。
            </Text>

            <Text style={styles.contentText}>
              もし目標が難しすぎると感じたら、{'\n'}
              いつでも「もっと簡単な目標」に{'\n'}
              変更することができます。
            </Text>

            <Text style={styles.contentText}>
              あなたの健康習慣づくりを{'\n'}
              全力でサポートします！
            </Text>
          </View>

        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>
              大丈夫なので、次へ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}>
            <Text style={styles.editButtonText}>
              目標を修正する
            </Text>
          </TouchableOpacity>
        </View>

        </View>
      </SafeAreaView>
    </ScreenWithBottomNav>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6',
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
    paddingBottom: 150, // ボタン用の余白
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF8C00',
  },
  editButtonText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GoalConfirmationScreen;