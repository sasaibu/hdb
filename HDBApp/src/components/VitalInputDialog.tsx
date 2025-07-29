import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string, value2?: string, pulse?: string) => void;
  title: string;
  initialValue: string;
  initialValue2?: string;
  initialPulse?: string;
}

const VitalInputDialog = ({
  visible,
  onClose,
  onSave,
  title,
  initialValue,
  initialValue2,
  initialPulse,
}: Props) => {
  const [value, setValue] = React.useState(initialValue);
  const [value2, setValue2] = React.useState(initialValue2 || '');
  const [pulse, setPulse] = React.useState(initialPulse || '');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');

  React.useEffect(() => {
    setValue(initialValue);
    setValue2(initialValue2 || '');
    setPulse(initialPulse || '');
    // 現在の日時を設定
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setDateValue(`${year}/${month}/${day}`);
    setTimeValue(`${hours}:${minutes}`);
  }, [initialValue, initialValue2, initialPulse]);

  const isBloodPressure = title === '血圧';

  const validateInput = () => {
    if (!value.trim()) {
      return false;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return false;
    }

    if (isBloodPressure) {
      if (!value2.trim()) {
        return false;
      }
      const numValue2 = parseFloat(value2);
      if (isNaN(numValue2)) {
        return false;
      }
      if (numValue < 50 || numValue > 250) {
        return false;
      }
      if (numValue2 < 30 || numValue2 > 150) {
        return false;
      }
      if (numValue <= numValue2) {
        return false;
      }
      
      // 脈拍のバリデーション（オプション）
      if (pulse.trim()) {
        const pulseValue = parseFloat(pulse);
        if (isNaN(pulseValue) || pulseValue < 40 || pulseValue > 200) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateInput()) {
      return;
    }
    
    if (isBloodPressure) {
      onSave(value, value2, pulse);
    } else {
      onSave(value, undefined, selectedDate);
    }
    onClose();
  };

  const toggleDate = () => {
    const newDate = new Date();
    if (isToday) {
      newDate.setDate(newDate.getDate() - 1);
      setIsToday(false);
    } else {
      setIsToday(true);
    }
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title} の入力</Text>

          <View style={styles.inputRow}>
            <Text style={styles.label}>日付</Text>
            {isEditingDate ? (
              <TextInput
                style={styles.input}
                value={dateValue}
                onChangeText={setDateValue}
                onBlur={() => setIsEditingDate(false)}
                placeholder="YYYY/MM/DD"
                autoFocus
              />
            ) : (
              <TouchableOpacity 
                style={styles.datePicker}
                onPress={() => setIsEditingDate(true)}>
                <Text>{dateValue}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>時刻</Text>
            {isEditingTime ? (
              <TextInput
                style={styles.input}
                value={timeValue}
                onChangeText={setTimeValue}
                onBlur={() => setIsEditingTime(false)}
                placeholder="HH:MM"
                autoFocus
              />
            ) : (
              <TouchableOpacity 
                style={styles.datePicker}
                onPress={() => setIsEditingTime(true)}>
                <Text>{timeValue}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>{isBloodPressure ? '収縮期' : '値'}</Text>
            <TextInput
              style={styles.input}
              onChangeText={setValue}
              value={value}
              keyboardType="numeric"
              placeholder={isBloodPressure ? '例: 120' : ''}
            />
            {isBloodPressure && <Text style={styles.unit}>mmHg</Text>}
          </View>

          {isBloodPressure && (
            <>
              <View style={styles.inputRow}>
                <Text style={styles.label}>拡張期</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setValue2}
                  value={value2}
                  keyboardType="numeric"
                  placeholder="例: 80"
                />
                <Text style={styles.unit}>mmHg</Text>
              </View>
              
              <View style={styles.inputRow}>
                <Text style={styles.label}>脈拍</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setPulse}
                  value={pulse}
                  keyboardType="numeric"
                  placeholder="例: 72 (任意)"
                />
                <Text style={styles.unit}>bpm</Text>
              </View>
            </>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}>
              <Text style={styles.textStyle}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={handleSave}>
              <Text style={styles.textStyle}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  label: {
    width: 50,
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  datePicker: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonSave: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#ccc',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unit: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    width: 50,
  },
  dateToggle: {
    marginLeft: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  dateToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default VitalInputDialog;
