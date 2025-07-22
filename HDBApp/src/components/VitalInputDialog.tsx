import React from 'react';
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
  onSave: (value: string, value2?: string) => void;
  title: string;
  initialValue: string;
  initialValue2?: string;
}

const VitalInputDialog = ({
  visible,
  onClose,
  onSave,
  title,
  initialValue,
  initialValue2,
}: Props) => {
  const [value, setValue] = React.useState(initialValue);
  const [value2, setValue2] = React.useState(initialValue2 || '');

  React.useEffect(() => {
    setValue(initialValue);
    setValue2(initialValue2 || '');
  }, [initialValue, initialValue2]);

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
    }

    return true;
  };

  const handleSave = () => {
    if (!validateInput()) {
      return;
    }
    
    if (isBloodPressure) {
      onSave(value, value2);
    } else {
      onSave(value);
    }
    onClose();
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
            <TouchableOpacity style={styles.datePicker}>
              <Text>2025/07/02</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.label}>時刻</Text>
            <TouchableOpacity style={styles.datePicker}>
              <Text>16:30</Text>
            </TouchableOpacity>
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
});

export default VitalInputDialog;
