import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
// DateTimePicker removed - using custom implementation
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'GoalNotification'>;

const GoalNotificationScreen: React.FC<Props> = ({navigation, route}) => {
  const [selectedHour, setSelectedHour] = useState(22);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const [timing, setTiming] = useState('');
  const [hasToggleTouched, setHasToggleTouched] = useState(false);

  const hours = Array.from({length: 24}, (_, i) => i);
  const minutes = Array.from({length: 60}, (_, i) => i);

  const handleNext = () => {
    // TODO: 通知設定を保存して次の画面へ
    console.log('通知時刻:', `${selectedHour}:${selectedMinute}`);
    console.log('通知ON/OFF:', isNotificationOn);
    console.log('タイミング:', timing);
    // 確認画面へ遷移（前の画面から受け取ったデータも含めて渡す）
    navigation.navigate('GoalConfirmation', {
      goalType: route.params?.goalType,
      goalPrinciple1: route.params?.goalPrinciple1,
      goalPrinciple2: route.params?.goalPrinciple2,
      goalReason: route.params?.goalReason,
      goalDetail: route.params?.goalDetail,
      notificationTime: `${selectedHour}:${selectedMinute}`,
      isNotificationOn,
      timing,
    });
  };

  const formatTime = () => {
    const hour = selectedHour.toString().padStart(2, '0');
    const minute = selectedMinute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: number) => {
    if (type === 'hour') {
      setSelectedHour(value);
    } else {
      setSelectedMinute(value);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>
          行動しやすいタイミングを考えます。
        </Text>

        <Text style={styles.exampleText}>
          ex) ストレッチ → シャワー直後（22:00）
        </Text>

        <View style={styles.timeSection}>
          <View style={styles.timeWrapper}>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>
                {formatTime()}
              </Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>通知OFF</Text>
              <Switch
                value={isNotificationOn}
                onValueChange={(value) => {
                  setIsNotificationOn(value);
                  setHasToggleTouched(true);
                }}
                trackColor={{ false: '#767577', true: '#FF8C00' }}
                thumbColor={isNotificationOn ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
          onRequestClose={() => setShowTimePicker(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}>
            <View style={Platform.OS === 'ios' ? styles.iosModalContent : styles.modalContent}>
              {Platform.OS === 'ios' && (
                <View style={styles.iosHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.iosCancelText}>キャンセル</Text>
                  </TouchableOpacity>
                  <Text style={styles.iosTitle}>時刻を選択</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.iosDoneText}>完了</Text>
                  </TouchableOpacity>
                </View>
              )}
              {Platform.OS === 'ios' ? (
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerColumn}>
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.iosPickerScrollContent}
                      bounces={false}
                      overScrollMode="never">
                      <View style={styles.iosPickerSpacer} />
                      {hours.map((hour) => (
                        <TouchableOpacity
                          key={`hour-${hour}`}
                          style={styles.iosPickerItem}
                          onPress={() => handleTimeChange('hour', hour)}>
                          <Text style={[
                            styles.iosPickerItemText,
                            selectedHour === hour && styles.iosSelectedPickerItemText
                          ]}>
                            {hour.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <View style={styles.iosPickerSpacer} />
                    </ScrollView>
                  </View>
                  <Text style={styles.iosPickerSeparator}>:</Text>
                  <View style={styles.iosPickerColumn}>
                    <ScrollView 
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.iosPickerScrollContent}
                      bounces={false}
                      overScrollMode="never">
                      <View style={styles.iosPickerSpacer} />
                      {minutes.map((minute) => (
                        <TouchableOpacity
                          key={`minute-${minute}`}
                          style={styles.iosPickerItem}
                          onPress={() => handleTimeChange('minute', minute)}>
                          <Text style={[
                            styles.iosPickerItemText,
                            selectedMinute === minute && styles.iosSelectedPickerItemText
                          ]}>
                            {minute.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <View style={styles.iosPickerSpacer} />
                    </ScrollView>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.modalTitle}>時刻を選択</Text>
                  <View style={styles.androidPickerContainer}>
                    <ScrollView 
                      style={styles.androidHourColumn}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.androidPickerScrollContent}
                      bounces={false}
                      overScrollMode="never">
                      <View style={styles.androidPickerSpacer} />
                      {hours.map((hour) => (
                        <TouchableOpacity
                          key={`hour-${hour}`}
                          style={styles.timeItem}
                          onPress={() => {
                            handleTimeChange('hour', hour);
                          }}>
                          <Text style={[
                            styles.timeItemText,
                            selectedHour === hour && styles.selectedTimeItemText
                          ]}>
                            {hour.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <View style={styles.androidPickerSpacer} />
                    </ScrollView>
                    <Text style={styles.androidSeparator}>:</Text>
                    <ScrollView 
                      style={styles.androidMinuteColumn}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.androidPickerScrollContent}
                      bounces={false}
                      overScrollMode="never">
                      <View style={styles.androidPickerSpacer} />
                      {minutes.map((minute) => (
                        <TouchableOpacity
                          key={`minute-${minute}`}
                          style={styles.timeItem}
                          onPress={() => {
                            handleTimeChange('minute', minute);
                          }}>
                          <Text style={[
                            styles.timeItemText,
                            selectedMinute === minute && styles.selectedTimeItemText
                          ]}>
                            {minute.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <View style={styles.androidPickerSpacer} />
                    </ScrollView>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.closeButtonText}>閉じる</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.principleText}>
          目標設定の原則②
        </Text>

        <TouchableOpacity 
          style={styles.timingInputArea}
          onPress={() => {
            navigation.navigate('TimingDetail', {
              onSave: (newTiming: string) => setTiming(newTiming),
            });
          }}>
          <Text style={[styles.timingPlaceholder, timing && styles.timingText]}>
            {timing || '「楽に動けるタイミング」を考える'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.nextButton, (hasToggleTouched || timing.trim()) ? styles.nextButtonActive : styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!hasToggleTouched && !timing.trim()}>
          <Text style={[styles.nextButtonText, (hasToggleTouched || timing.trim()) && styles.nextButtonTextActive]}>
            次へ
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6', // 薄い橙色
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
    marginBottom: 20,
  },
  exampleText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timeWrapper: {
    position: 'relative',
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 60,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'absolute',
    bottom: -35,
    right: -20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#666666',
  },
  principleText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 60,
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
  nextButtonActive: {
    backgroundColor: '#FF8C00', // オレンジ背景
    borderColor: '#FF8C00',
  },
  nextButtonTextActive: {
    color: '#FFFFFF', // 白文字
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePartButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  timeItemText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333333',
  },
  selectedTimeItemText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF8C00',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timingInputArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 60,
    marginHorizontal: 20,
  },
  timingPlaceholder: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
  timingText: {
    color: '#333333',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#999999', // グレー文字
    fontSize: 16,
    fontWeight: 'bold',
  },
  // iOS専用スタイル
  iosModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '50%',
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iosCancelText: {
    color: '#FF8C00',
    fontSize: 16,
  },
  iosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  iosDoneText: {
    color: '#FF8C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iosTimeList: {
    maxHeight: 250,
  },
  iosTimeItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  iosTimeItemText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#000000',
  },
  iosSelectedTimeItemText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  // iOS風ピッカースタイル
  iosPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 216,
    paddingHorizontal: 20,
  },
  iosPickerColumn: {
    width: 70,
    height: 216,
  },
  iosPickerScrollContent: {
    paddingVertical: 0,
  },
  iosPickerSpacer: {
    height: 86, // (216 - 44) / 2 to center the first/last item
  },
  iosPickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosPickerItemText: {
    fontSize: 22,
    color: '#000000',
  },
  iosSelectedPickerItemText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  iosPickerSeparator: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 5,
    color: '#000000',
  },
  // Android用スタイル
  androidPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    paddingHorizontal: 20,
  },
  androidHourColumn: {
    width: 80,
    height: 200,
  },
  androidMinuteColumn: {
    width: 80,
    height: 200,
  },
  androidSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  androidPickerScrollContent: {
    paddingVertical: 0,
  },
  androidPickerSpacer: {
    height: 70, // (200 - 60) / 2 to center the first/last item (60 = item height + border)
  },
});

export default GoalNotificationScreen;