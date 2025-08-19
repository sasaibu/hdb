import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { VitalDataService } from '../services/VitalDataService';
import VitalInputDialog from '../components/VitalInputDialog';

type RecordScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface VitalDataItem {
  type: string;
  icon: string;
  label: string;
  value: string | null;
  unit: string;
  color: string;
}

const RecordScreen: React.FC = () => {
  const navigation = useNavigation<RecordScreenNavigationProp>();
  const [vitalData, setVitalData] = useState<VitalDataItem[]>([
    { type: 'steps', icon: '👟', label: '歩数', value: null, unit: '歩', color: '#4CAF50' },
    { type: 'weight', icon: '⚖️', label: '体重', value: null, unit: 'kg', color: '#FF9800' },
    { type: 'bloodPressure', icon: '🩺', label: '血圧', value: null, unit: 'mmHg', color: '#F44336' },
    { type: 'heartRate', icon: '❤️', label: '心拍数', value: null, unit: 'bpm', color: '#E91E63' },
    { type: 'temperature', icon: '🌡️', label: '体温', value: null, unit: '℃', color: '#2196F3' },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedVital, setSelectedVital] = useState<VitalDataItem | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState(''); // 血圧用
  const [modalVisible, setModalVisible] = useState(false);
  const vitalDataService = new VitalDataService();

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      await vitalDataService.initializeService();
      
      const today = new Date().toISOString().split('T')[0];
      const updatedData = [...vitalData];
      
      for (let i = 0; i < updatedData.length; i++) {
        const item = updatedData[i];
        const typeMap: {[key: string]: string} = {
          steps: '歩数',
          weight: '体重',
          bloodPressure: '血圧',
          heartRate: '心拍数',
          temperature: '体温',
        };
        
        const vitalType = typeMap[item.type];
        const data = await vitalDataService.getVitalDataByPeriod(vitalType, 'today');
        
        if (data.length > 0) {
          const latestData = data[0];
          if (item.type === 'bloodPressure' && latestData.diastolic) {
            item.value = `${latestData.value}/${latestData.diastolic}`;
          } else {
            item.value = latestData.value.toString();
          }
        }
      }
      
      setVitalData(updatedData);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalPress = (item: VitalDataItem) => {
    setSelectedVital(item);
    if (item.type === 'bloodPressure' && item.value) {
      const [systolic, diastolic] = item.value.split('/');
      setInputValue(systolic || '');
      setInputValue2(diastolic || '');
    } else {
      setInputValue(item.value || '');
      setInputValue2('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedVital || !inputValue) {
      Alert.alert('エラー', '値を入力してください');
      return;
    }

    try {
      const numericValue = parseFloat(inputValue);
      if (isNaN(numericValue)) {
        Alert.alert('エラー', '正しい数値を入力してください');
        return;
      }

      const typeMap: {[key: string]: string} = {
        steps: '歩数',
        weight: '体重',
        bloodPressure: '血圧',
        heartRate: '心拍数',
        temperature: '体温',
      };
      
      const vitalType = typeMap[selectedVital.type];
      const today = new Date();
      
      if (selectedVital.type === 'bloodPressure') {
        const diastolic = parseFloat(inputValue2);
        if (isNaN(diastolic)) {
          Alert.alert('エラー', '拡張期血圧を入力してください');
          return;
        }
        await vitalDataService.addVitalData(
          vitalType,
          numericValue,
          today,
          numericValue,
          diastolic,
          'manual'
        );
      } else {
        await vitalDataService.addVitalData(
          vitalType,
          numericValue,
          today,
          undefined,
          undefined,
          'manual'
        );
      }
      
      setModalVisible(false);
      await loadTodayData();
      Alert.alert('成功', 'データを保存しました');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('エラー', 'データの保存に失敗しました');
    }
  };

  const handleDetailPress = (item: VitalDataItem) => {
    // すべてのバイタルデータは一覧画面へ
    navigation.navigate('VitalData', {
      title: item.label,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>記録</Text>
        <Text style={styles.subtitle}>今日の健康データを管理</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>バイタルデータ</Text>
        <View style={styles.vitalGrid}>
          {vitalData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.vitalItem, { borderTopColor: item.color }]}
              onPress={() => handleVitalPress(item)}
            >
              <TouchableOpacity
                style={styles.detailButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDetailPress(item);
                }}
              >
                <Text style={styles.detailButtonText}>詳細 ›</Text>
              </TouchableOpacity>
              <View style={styles.vitalMainContent}>
                <Text style={styles.vitalIcon}>{item.icon}</Text>
                <Text style={styles.vitalLabel}>{item.label}</Text>
                <View style={styles.vitalValueContainer}>
                  <Text style={[styles.vitalValue, { color: item.value ? '#333' : '#999' }]}>
                    {item.value || '未入力'}
                  </Text>
                  {item.value && <Text style={styles.vitalUnit}>{item.unit}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.syncButton}
          onPress={() => Alert.alert('同期', 'データ同期機能は準備中です')}
        >
          <Text style={styles.syncButtonText}>🔄 データを同期</Text>
        </TouchableOpacity>
      </View>

      {selectedVital && (
        <VitalInputDialog
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedVital(null);
            setInputValue('');
            setInputValue2('');
          }}
          onSave={(value, value2) => {
            setInputValue(value);
            setInputValue2(value2 || '');
            handleSave();
          }}
          title={selectedVital.label}
          initialValue={inputValue}
          initialValue2={selectedVital.type === 'bloodPressure' ? inputValue2 : undefined}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  dateText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  vitalGrid: {
    gap: 12,
  },
  vitalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  vitalMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  vitalValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 'auto',
  },
  vitalIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  vitalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  vitalUnit: {
    fontSize: 14,
    color: '#666',
  },
  syncButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  syncButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  detailButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
  },
  detailButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default RecordScreen;