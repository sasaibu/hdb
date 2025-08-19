import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'TimingInput'>;

const TimingInputScreen: React.FC<Props> = ({navigation, route}) => {
  const [selectedHour, setSelectedHour] = useState(22);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isNotificationOff, setIsNotificationOff] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    // 前の画面に値を渡して戻る
    const hours = selectedHour.toString().padStart(2, '0');
    const minutes = selectedMinute.toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    if (route.params?.onSave) {
      route.params.onSave(timeString);
    }
    navigation.goBack();
  };

  const formatTime = () => {
    const hours = selectedHour.toString().padStart(2, '0');
    const minutes = selectedMinute.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.content}>
          <Text style={styles.title}>
            通知時刻を設定
          </Text>

          <View style={styles.timeContainer}>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeText}>
                {formatTime()}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.notificationToggleContainer}>
              <Text style={styles.notificationText}>通知オフ</Text>
              <Switch
                value={isNotificationOff}
                onValueChange={setIsNotificationOff}
                trackColor={{ false: '#E0E0E0', true: '#FF8C00' }}
                thumbColor={isNotificationOff ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>

          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimePicker(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>時刻を選択</Text>
                <View style={styles.timePickerRow}>
                  <ScrollView 
                    style={styles.pickerColumn}
                    showsVerticalScrollIndicator={false}>
                    {[...Array(24)].map((_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.pickerItem,
                          selectedHour === i && styles.selectedPickerItem
                        ]}
                        onPress={() => setSelectedHour(i)}>
                        <Text style={[
                          styles.pickerItemText,
                          selectedHour === i && styles.selectedPickerItemText
                        ]}>
                          {i.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={styles.timeSeparator}>:</Text>
                  <ScrollView 
                    style={styles.pickerColumn}
                    showsVerticalScrollIndicator={false}>
                    {[0, 15, 30, 45].map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute && styles.selectedPickerItem
                        ]}
                        onPress={() => setSelectedMinute(minute)}>
                        <Text style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.selectedPickerItemText
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.doneButtonText}>完了</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              保存
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 60,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 60,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF8C00',
  },
  notificationToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: -40,
    right: -20,
  },
  notificationText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  pickerColumn: {
    width: 80,
    height: 200,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPickerItem: {
    backgroundColor: '#FFE5CC',
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 20,
    color: '#666666',
  },
  selectedPickerItemText: {
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TimingInputScreen;