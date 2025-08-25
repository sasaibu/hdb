import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {apiClient} from '../services/api/apiClient';

interface NewVitalInputDialogProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vitalType: string;
}

const NewVitalInputDialog: React.FC<NewVitalInputDialogProps> = ({
  visible,
  onClose,
  onSuccess,
  vitalType,
}) => {
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState(''); // 血圧の拡張期用
  const [isLoading, setIsLoading] = useState(false);

  const getUnit = () => {
    switch (vitalType) {
      case '歩数':
        return '歩';
      case '体重':
        return 'kg';
      case '体温':
        return '℃';
      case '血圧':
        return 'mmHg';
      case '心拍数':
        return 'bpm';
      case '脈拍':
        return 'bpm';
      default:
        return '';
    }
  };

  const getPlaceholder = () => {
    switch (vitalType) {
      case '歩数':
        return '例: 10000';
      case '体重':
        return '例: 65.5';
      case '体温':
        return '例: 36.5';
      case '血圧':
        return '収縮期 例: 120';
      case '心拍数':
        return '例: 72';
      case '脈拍':
        return '例: 75';
      default:
        return '';
    }
  };

  const validateInput = () => {
    if (!value.trim()) {
      Alert.alert('エラー', '値を入力してください');
      return false;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      Alert.alert('エラー', '有効な数値を入力してください');
      return false;
    }

    // バイタルタイプ別のバリデーション
    switch (vitalType) {
      case '歩数':
        if (numValue < 0 || numValue > 100000) {
          Alert.alert('エラー', '歩数は0〜100,000の範囲で入力してください');
          return false;
        }
        break;
      case '体重':
        if (numValue < 20 || numValue > 300) {
          Alert.alert('エラー', '体重は20〜300kgの範囲で入力してください');
          return false;
        }
        break;
      case '体温':
        if (numValue < 34 || numValue > 42) {
          Alert.alert('エラー', '体温は34〜42℃の範囲で入力してください');
          return false;
        }
        break;
      case '血圧':
        const numValue2 = parseFloat(value2);
        if (numValue < 50 || numValue > 250) {
          Alert.alert('エラー', '収縮期血圧は50〜250mmHgの範囲で入力してください');
          return false;
        }
        if (!value2.trim() || isNaN(numValue2)) {
          Alert.alert('エラー', '拡張期血圧を入力してください');
          return false;
        }
        if (numValue2 < 30 || numValue2 > 150) {
          Alert.alert('エラー', '拡張期血圧は30〜150mmHgの範囲で入力してください');
          return false;
        }
        if (numValue <= numValue2) {
          Alert.alert('エラー', '収縮期血圧は拡張期血圧より大きい値にしてください');
          return false;
        }
        break;
      case '心拍数':
        if (numValue < 30 || numValue > 200) {
          Alert.alert('エラー', '心拍数は30〜200bpmの範囲で入力してください');
          return false;
        }
        break;
      case '脈拍':
        if (numValue < 30 || numValue > 200) {
          Alert.alert('エラー', '脈拍は30〜200bpmの範囲で入力してください');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);
    try {
      const vitalData = {
        type: vitalType === '歩数' ? 'steps' : 
              vitalType === '体重' ? 'weight' :
              vitalType === '体温' ? 'temperature' :
              vitalType === '血圧' ? 'bloodPressure' :
              vitalType === '心拍数' ? 'heartRate' :
              vitalType === '脈拍' ? 'pulse' : vitalType,
        value: parseFloat(value),
        value2: vitalType === '血圧' ? parseFloat(value2) : undefined,
        unit: getUnit(),
        measuredAt: new Date().toISOString(),
        source: 'manual',
      };

      const response = await apiClient.createVital(vitalData);

      if (response.success) {
        Alert.alert('成功', 'データを登録しました');
        setValue('');
        setValue2('');
        onSuccess();
        onClose();
      } else {
        Alert.alert('エラー', response.message || 'データの登録に失敗しました');
      }
    } catch (error) {
      console.error('Error saving vital data:', error);
      Alert.alert('エラー', 'データの登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setValue('');
    setValue2('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{vitalType}を入力</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={getPlaceholder()}
              keyboardType="numeric"
              autoFocus
              editable={!isLoading}
            />
            <Text style={styles.unit}>{getUnit()}</Text>
          </View>

          {vitalType === '血圧' && (
            <>
              <Text style={styles.subLabel}>拡張期血圧</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={value2}
                  onChangeText={setValue2}
                  placeholder="拡張期 例: 80"
                  keyboardType="numeric"
                  editable={!isLoading}
                />
                <Text style={styles.unit}>{getUnit()}</Text>
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}>
              <Text style={styles.saveButtonText}>
                {isLoading ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unit: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewVitalInputDialog;
