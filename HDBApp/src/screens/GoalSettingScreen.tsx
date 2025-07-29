import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {MainDrawerParamList} from '../types/navigation';
import {GOAL_SETTING_CONTENT} from '../constants/goalSettingContent';
import {useGoal} from '../contexts/GoalContext';
import ScreenWithBottomNav from '../components/ScreenWithBottomNav';

type Props = DrawerScreenProps<MainDrawerParamList, 'GoalSetting'>;

const GOAL_SETTING_SHOWN_KEY = 'goalSettingShown';

const GoalSettingScreen: React.FC<Props> = ({navigation}) => {
  const { setIsGoalSetting } = useGoal();

  useEffect(() => {
    // 目標設定モードに入る
    setIsGoalSetting(true);

    // 既に表示済みかチェック
    const checkIfShown = async () => {
      try {
        const hasShown = await AsyncStorage.getItem(GOAL_SETTING_SHOWN_KEY);
        if (hasShown === 'true') {
          // 既に表示済みの場合は前の画面に戻る
          navigation.goBack();
        }
      } catch (error) {
        console.error('Failed to check goal setting status:', error);
      }
    };
    
    checkIfShown();

    // クリーンアップ時に目標設定モードを解除
    return () => {
      setIsGoalSetting(false);
    };
  }, [navigation, setIsGoalSetting]);

  const handleConfirm = async () => {
    try {
      // 表示済みフラグを保存
      await AsyncStorage.setItem(GOAL_SETTING_SHOWN_KEY, 'true');
      console.log('確認ボタンが押されました');
      // 目標入力画面へ遷移
      navigation.navigate('GoalInput' as any);
    } catch (error) {
      console.error('Failed to save goal setting status:', error);
    }
  };

  return (
    <ScreenWithBottomNav activeTab="goal">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* 上部の橙色背景 */}
          <View style={styles.topOrangeBar} />
          
          {/* メインコンテンツ（80%） */}
          <View style={styles.mainContent}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}>
              
              <View style={styles.blackBorder}>
                <Text style={styles.contentText}>
                  {GOAL_SETTING_CONTENT.text}
                </Text>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>
                    {GOAL_SETTING_CONTENT.buttonText}
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.contentTextBottom}>
                  {GOAL_SETTING_CONTENT.text2}
                </Text>
              </View>
              
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </ScreenWithBottomNav>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6', // より薄い橙色
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6', // より薄い橙色
  },
  topOrangeBar: {
    height: '10%',
    backgroundColor: '#FFF5E6', // より薄い橙色
  },
  mainContent: {
    flex: 1, // BottomNavigationのスペースを考慮
    backgroundColor: '#FFF5E6', // より薄い橙色（黒枠の左右も橙色に）
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  blackBorder: {
    borderWidth: 2,
    borderColor: '#000000',
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // 黒枠内は白背景
  },
  contentText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#000000',
    marginBottom: 0,
  },
  contentTextBottom:{
      fontSize: 16,
      lineHeight: 28,
      color: '#000000',
      marginBottom: 0,
    },
  confirmButton: {
    backgroundColor: '#FFFFFF', // ← ここがボタンの色を設定する場所です
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#CCCCCC', // ほんのりグレーの枠
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomOrangeBar: {
    height: '10%',
    backgroundColor: '#FFF5E6', // より薄い橙色
  },
});

export default GoalSettingScreen;