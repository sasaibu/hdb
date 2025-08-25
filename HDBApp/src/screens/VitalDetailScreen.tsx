import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { VitalDataService } from '../services/VitalDataService';

const { width: screenWidth } = Dimensions.get('window');

type VitalDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VitalDetail'
>;

type VitalDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'VitalDetail'
>;

interface Props {
  navigation: VitalDetailScreenNavigationProp;
  route: VitalDetailScreenRouteProp;
}

interface TimeSlotData {
  timeSlot: string;
  value: number;
  startHour: number;
  endHour: number;
}

const VitalDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { vitalType, date, recordId } = route.params;
  const [hourlyData, setHourlyData] = useState<TimeSlotData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const vitalDataService = new VitalDataService();

  useEffect(() => {
    loadDetailData();
  }, []);

  const loadDetailData = async () => {
    try {
      setLoading(true);
      
      // 時間帯別のダミーデータを生成
      const timeSlots: TimeSlotData[] = [
        { timeSlot: '0:00 - 3:00', value: vitalType === '歩数' ? 0 : 60, startHour: 0, endHour: 3 },
        { timeSlot: '3:00 - 6:00', value: vitalType === '歩数' ? 0 : 58, startHour: 3, endHour: 6 },
        { timeSlot: '6:00 - 9:00', value: vitalType === '歩数' ? 500 : 65, startHour: 6, endHour: 9 },
        { timeSlot: '9:00 - 12:00', value: vitalType === '歩数' ? 3000 : 72, startHour: 9, endHour: 12 },
        { timeSlot: '12:00 - 15:00', value: vitalType === '歩数' ? 400 : 75, startHour: 12, endHour: 15 },
        { timeSlot: '15:00 - 18:00', value: vitalType === '歩数' ? 2500 : 70, startHour: 15, endHour: 18 },
        { timeSlot: '18:00 - 21:00', value: vitalType === '歩数' ? 1500 : 68, startHour: 18, endHour: 21 },
        { timeSlot: '21:00 - 24:00', value: vitalType === '歩数' ? 100 : 62, startHour: 21, endHour: 24 },
      ];

      setHourlyData(timeSlots);
      
      const total = timeSlots.reduce((sum, slot) => sum + slot.value, 0);
      setTotalValue(total);
    } catch (error) {
      console.error('Error loading detail data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = () => {
    return Math.max(...hourlyData.map(slot => slot.value));
  };

  const renderBarChart = () => {
    const maxValue = getMaxValue();
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartContent}>
          {hourlyData.map((slot, index) => {
            const barHeight = maxValue > 0 ? (slot.value / maxValue) * 150 : 0;
            
            return (
              <View key={index} style={styles.barWrapper}>
                <Text style={styles.barValue}>{slot.value}</Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        backgroundColor: vitalType === '歩数' ? '#4CAF50' : '#FF5722'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>
                  {slot.startHour}時
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>1日の{vitalType}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>合計</Text>
        <Text style={styles.summaryValue}>
          {totalValue} {vitalType === '歩数' ? '歩' : 'bpm'}
        </Text>
        {vitalType === '心拍数' && (
          <Text style={styles.summarySubtext}>
            平均: {Math.round(totalValue / hourlyData.length)} bpm
          </Text>
        )}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>時間帯別グラフ</Text>
        {renderBarChart()}
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>詳細データ</Text>
        {hourlyData.map((slot, index) => (
          <View key={index} style={styles.detailItem}>
            <Text style={styles.detailTime}>{slot.timeSlot}</Text>
            <Text style={styles.detailValue}>
              {slot.value} {vitalType === '歩数' ? '歩' : 'bpm'}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => Alert.alert('編集', '編集機能は準備中です')}
      >
        <Text style={styles.editButtonText}>編集</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  summarySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    height: 200,
  },
  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 150,
    width: '80%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 5,
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  detailSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailTime: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VitalDetailScreen;