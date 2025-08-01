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
  const [bodyFat, setBodyFat] = React.useState('');
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
  const isWeight = title === '体重';
  const isTemperature = title === '体温';
  const isSteps = title === '歩数';
  const isHeartRate = title === '心拍数';

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
      onSave(value);
    }
    onClose();
  };

  const getUnit = () => {
    switch (title) {
      case '体重': return 'kg';
      case '体温': return '℃';
      case '歩数': return '歩';
      case '心拍数': return 'bpm';
      case '血圧': return 'mmHg';
      default: return '';
    }
  };

  const getSaveFrequencyText = () => {
    return isBloodPressure ? '時間ごとに保存されます' : '日単位で保存されます';
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}の入力</Text>

          {/* 日付・時刻入力 */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.inputRow}>
              <Text style={styles.label}>日付</Text>
              {isEditingDate ? (
                <TextInput
                  style={styles.dateTimeInput}
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
                  style={styles.dateTimeInput}
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
          </View>

          {/* メイン入力エリア */}
          <View style={styles.mainInputContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{title}</Text>
              <Text style={styles.saveFrequency}>{getSaveFrequencyText()}</Text>
            </View>

            <View style={styles.inputBox}>
              {isWeight ? (
                <View style={styles.inputGrid}>
                  <View style={styles.gridItem}>
                    <TextInput
                      style={styles.valueInput}
                      onChangeText={setValue}
                      value={value}
                      keyboardType="numeric"
                      placeholder="体重"
                    />
                    <Text style={styles.unitText}>{getUnit()}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <TextInput
                      style={styles.valueInput}
                      onChangeText={setBodyFat}
                      value={bodyFat}
                      keyboardType="numeric"
                      placeholder="体脂肪率"
                    />
                    <Text style={styles.unitText}>%</Text>
                  </View>
                </View>
              ) : isBloodPressure ? (
                <>
                  <View style={styles.bloodPressureRow}>
                    <View style={styles.bpItem}>
                      <Text style={styles.bpLabel}>収縮期</Text>
                      <View style={styles.bpInputContainer}>
                        <TextInput
                          style={styles.bpInput}
                          onChangeText={setValue}
                          value={value}
                          keyboardType="numeric"
                          placeholder="120"
                        />
                        <Text style={styles.unitText}>{getUnit()}</Text>
                      </View>
                    </View>
                    <View style={styles.bpItem}>
                      <Text style={styles.bpLabel}>拡張期</Text>
                      <View style={styles.bpInputContainer}>
                        <TextInput
                          style={styles.bpInput}
                          onChangeText={setValue2}
                          value={value2}
                          keyboardType="numeric"
                          placeholder="80"
                        />
                        <Text style={styles.unitText}>{getUnit()}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.pulseRow}>
                    <Text style={styles.bpLabel}>脈拍</Text>
                    <View style={styles.bpInputContainer}>
                      <TextInput
                        style={styles.bpInput}
                        onChangeText={setPulse}
                        value={pulse}
                        keyboardType="numeric"
                        placeholder="72 (任意)"
                      />
                      <Text style={styles.unitText}>bpm</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.singleInputContainer}>
                  <TextInput
                    style={styles.singleInput}
                    onChangeText={setValue}
                    value={value}
                    keyboardType="numeric"
                    placeholder={`${title}を入力`}
                  />
                  <Text style={styles.unitText}>{getUnit()}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}>
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={handleSave}>
              <Text style={[styles.buttonText, styles.saveButtonText]}>保存</Text>
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
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 50,
    fontSize: 14,
    color: '#666',
  },
  dateTimeInput: {
    flex: 1,
    height: 36,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  datePicker: {
    flex: 1,
    height: 36,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  mainInputContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  saveFrequency: {
    fontSize: 12,
    color: '#666',
  },
  inputBox: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  valueInput: {
    flex: 1,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 18,
    paddingHorizontal: 8,
  },
  singleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  singleInput: {
    flex: 1,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 18,
    paddingHorizontal: 8,
  },
  bloodPressureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  bpItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  bpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  bpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpInput: {
    flex: 1,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 18,
    paddingHorizontal: 8,
  },
  pulseRow: {
    marginTop: 10,
  },
  unitText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    minWidth: 45,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: '#f0f0f0',
  },
  buttonSave: {
    backgroundColor: '#FF8C00',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});

export default VitalInputDialog;