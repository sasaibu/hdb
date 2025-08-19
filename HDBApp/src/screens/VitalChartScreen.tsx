import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { VitalChart } from '../components/VitalChart';
import { VitalDataService } from '../services/VitalDataService';
import { VitalDataRecord } from '../services/DatabaseService';

type Props = NativeStackScreenProps<RootStackParamList, 'VitalChart'>;

type ChartType = '歩数' | '体重' | '体温' | '血圧' | '心拍数';
type PeriodType = 'week' | 'month' | 'year';

export const VitalChartScreen: React.FC<Props> = ({ navigation, route }) => {
  const [selectedType, setSelectedType] = useState<ChartType>('歩数');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [vitalData, setVitalData] = useState<VitalDataRecord[]>([]);
  const [targetValue, setTargetValue] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const vitalDataService = new VitalDataService();

  // データタイプの配列
  const dataTypes: ChartType[] = ['歩数', '体重', '体温', '血圧', '心拍数'];

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // バイタルデータを取得
      const data = await vitalDataService.getVitalDataByType(selectedType);
      setVitalData(data);
      
      // 目標値を取得
      const target = await vitalDataService.getTarget(selectedType);
      setTargetValue(target?.target_value);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading vital data:', error);
      setLoading(false);
      Alert.alert('エラー', 'データの読み込みに失敗しました');
    }
  };

  const handleDataPointClick = (data: VitalDataRecord) => {
    let message = `日付: ${data.recorded_date}\n`;
    
    if (data.type === '血圧' && data.systolic && data.diastolic) {
      message += `値: ${data.systolic}/${data.diastolic} ${data.unit}`;
    } else {
      message += `値: ${data.value} ${data.unit}`;
    }
    
    if (data.source) {
      message += `\nソース: ${data.source}`;
    }
    
    Alert.alert('詳細情報', message);
  };

  const renderTypeSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.typeSelector}
      contentContainerStyle={styles.typeSelectorContent}
    >
      {dataTypes.map(type => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeButton,
            selectedType === type && styles.activeTypeButton,
          ]}
          onPress={() => setSelectedType(type)}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === type && styles.activeTypeButtonText,
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'week' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('week')}
      >
        <Text style={[styles.periodText, selectedPeriod === 'week' && styles.activePeriodText]}>
          週間
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'month' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('month')}
      >
        <Text style={[styles.periodText, selectedPeriod === 'month' && styles.activePeriodText]}>
          月間
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.periodButton, selectedPeriod === 'year' && styles.activePeriodButton]}
        onPress={() => setSelectedPeriod('year')}
      >
        <Text style={[styles.periodText, selectedPeriod === 'year' && styles.activePeriodText]}>
          年間
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>データ分析</Text>
        <View style={styles.backButton} />
      </View>

      {renderTypeSelector()}
      {renderPeriodSelector()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : (
        <VitalChart
          data={vitalData}
          type={selectedType}
          period={selectedPeriod}
          showTarget={!!targetValue}
          targetValue={targetValue}
          onDataPointClick={handleDataPointClick}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 50,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  typeSelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  typeSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTypeButton: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  activeTypeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activePeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    color: '#666666',
  },
  activePeriodText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999999',
  },
});