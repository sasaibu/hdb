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
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'GoalNotification'>;

const GoalNotificationScreen: React.FC<Props> = ({navigation}) => {
  const [selectedHour, setSelectedHour] = useState(22);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(true);
  const [pickerType, setPickerType] = useState<'hour' | 'minute'>('hour');
  const [timing, setTiming] = useState('');
  const [hasToggleTouched, setHasToggleTouched] = useState(false);

  const hours = Array.from({length: 24}, (_, i) => i);
  const minutes = Array.from({length: 60}, (_, i) => i);

  const handleNext = () => {
    // TODO: 通知設定を保存して次の画面へ
    console.log('通知時刻:', `${selectedHour}:${selectedMinute}`);
    console.log('通知ON/OFF:', isNotificationOn);
  };

  const formatTime = () => {
    const hour = selectedHour.toString().padStart(2, '0');
    const minute = selectedMinute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const openTimePicker = (type: 'hour' | 'minute') => {
    setPickerType(type);
    setShowTimePicker(true);
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
            <View style={styles.timePickerContainer}>
              <TouchableOpacity 
                style={styles.timePartButton}
                onPress={() => openTimePicker('hour')}>
                <Text style={styles.timeText}>
                  {selectedHour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeSeparator}>:</Text>
              <TouchableOpacity 
                style={styles.timePartButton}
                onPress={() => openTimePicker('minute')}>
                <Text style={styles.timeText}>
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            </View>

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
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {pickerType === 'hour' ? '時間を選択' : '分を選択'}
              </Text>
              <FlatList
                data={pickerType === 'hour' ? hours : minutes}
                keyExtractor={(item) => item.toString()}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.timeItem}
                    onPress={() => {
                      if (pickerType === 'hour') {
                        setSelectedHour(item);
                      } else {
                        setSelectedMinute(item);
                      }
                      setShowTimePicker(false);
                    }}>
                    <Text style={[
                      styles.timeItemText,
                      (pickerType === 'hour' ? selectedHour === item : selectedMinute === item) && styles.selectedTimeItemText
                    ]}>
                      {item.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={true}
                style={styles.timeList}
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTimePicker(false)}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
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
          style={[styles.nextButton, hasToggleTouched ? styles.nextButtonActive : styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!hasToggleTouched}>
          <Text style={[styles.nextButtonText, hasToggleTouched && styles.nextButtonTextActive]}>
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
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
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
});

export default GoalNotificationScreen;