import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  LineChart,
  BarChart,
  ProgressChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { VitalDataRecord } from '../services/DatabaseService';

const screenWidth = Dimensions.get('window').width;

interface VitalChartProps {
  data: VitalDataRecord[];
  type: string;
  period: 'week' | 'month' | 'year';
  showTarget?: boolean;
  targetValue?: number;
  onDataPointClick?: (data: VitalDataRecord) => void;
}

export const VitalChart: React.FC<VitalChartProps> = ({
  data,
  type,
  period,
  showTarget = false,
  targetValue,
  onDataPointClick,
}) => {
  // チャートデータの準備
  const chartData = useMemo(() => {
    // 期間に応じてデータをフィルタリング
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    const filteredData = data.filter(item => 
      new Date(item.recorded_date) >= startDate
    );
    
    // 日付でソート
    filteredData.sort((a, b) => 
      new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
    );
    
    // チャート用のラベルとデータを生成
    const labels: string[] = [];
    const values: number[] = [];
    const originalData: VitalDataRecord[] = [];
    
    filteredData.forEach(item => {
      const date = new Date(item.recorded_date);
      let label: string;
      
      switch (period) {
        case 'week':
          label = `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case 'month':
          label = `${date.getDate()}`;
          break;
        case 'year':
          label = `${date.getMonth() + 1}月`;
          break;
      }
      
      labels.push(label);
      values.push(item.value);
      originalData.push(item);
    });
    
    // 期間が年の場合は月平均を計算
    if (period === 'year') {
      const monthlyData: { [key: string]: number[] } = {};
      
      filteredData.forEach(item => {
        const month = new Date(item.recorded_date).getMonth();
        const key = `${month}`;
        
        if (!monthlyData[key]) {
          monthlyData[key] = [];
        }
        monthlyData[key].push(item.value);
      });
      
      const monthlyLabels: string[] = [];
      const monthlyValues: number[] = [];
      
      Object.keys(monthlyData).sort((a, b) => Number(a) - Number(b)).forEach(key => {
        const month = Number(key) + 1;
        monthlyLabels.push(`${month}月`);
        
        const values = monthlyData[key];
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        monthlyValues.push(Math.round(average * 10) / 10);
      });
      
      return {
        labels: monthlyLabels,
        datasets: [{
          data: monthlyValues,
          strokeWidth: 2,
        }],
        originalData: filteredData,
      };
    }
    
    return {
      labels,
      datasets: [{
        data: values,
        strokeWidth: 2,
      }],
      originalData,
    };
  }, [data, period]);

  // チャートの設定
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: type === '体温' ? 1 : 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  // チャートタイプの選択
  const renderChart = () => {
    if (type === '歩数') {
      return (
        <BarChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showBarTops={false}
          fromZero
        />
      );
    } else {
      return (
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          onDataPointClick={(data: any) => {
            if (onDataPointClick && chartData.originalData[data.index]) {
              onDataPointClick(chartData.originalData[data.index]);
            }
          }}
          decorator={() => {
            if (showTarget && targetValue) {
              return (
                <View style={styles.targetLine}>
                  <Text style={styles.targetLabel}>目標: {targetValue}</Text>
                </View>
              );
            }
            return null;
          }}
        />
      );
    }
  };

  // 統計情報
  const statistics = useMemo(() => {
    if (chartData.datasets[0].data.length === 0) {
      return null;
    }
    
    const values = chartData.datasets[0].data;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {
      average: Math.round(average * 10) / 10,
      max,
      min,
      latest: values[values.length - 1],
    };
  }, [chartData]);

  // 達成率チャート（目標値がある場合）
  const renderProgressChart = () => {
    if (!showTarget || !targetValue || !statistics) {
      return null;
    }
    
    const progressData = {
      labels: ['達成率'],
      data: [Math.min(statistics.latest / targetValue, 1)],
    };
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>目標達成率</Text>
        <ProgressChart
          data={progressData}
          width={screenWidth - 32}
          height={120}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => {
              const percentage = progressData.data[0];
              if (percentage >= 1) return `rgba(76, 175, 80, ${opacity})`;
              if (percentage >= 0.7) return `rgba(255, 193, 7, ${opacity})`;
              return `rgba(244, 67, 54, ${opacity})`;
            },
          }}
          hideLegend={false}
          style={styles.progressChart}
        />
        <Text style={styles.progressText}>
          {Math.round(progressData.data[0] * 100)}%
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{type}の推移</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity style={[styles.periodButton, period === 'week' && styles.activePeriod]}>
            <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>週</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.periodButton, period === 'month' && styles.activePeriod]}>
            <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>月</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.periodButton, period === 'year' && styles.activePeriod]}>
            <Text style={[styles.periodText, period === 'year' && styles.activePeriodText]}>年</Text>
          </TouchableOpacity>
        </View>
      </View>

      {chartData.datasets[0].data.length > 0 ? (
        <>
          {renderChart()}
          
          {statistics && (
            <View style={styles.statistics}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>平均</Text>
                <Text style={styles.statValue}>{statistics.average}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最高</Text>
                <Text style={styles.statValue}>{statistics.max}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最低</Text>
                <Text style={styles.statValue}>{statistics.min}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>最新</Text>
                <Text style={styles.statValue}>{statistics.latest}</Text>
              </View>
            </View>
          )}
          
          {renderProgressChart()}
        </>
      ) : (
        <View style={styles.noData}>
          <Text style={styles.noDataText}>データがありません</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activePeriod: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
  statistics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopColor: '#FF6B6B',
    borderStyle: 'dashed',
  },
  targetLabel: {
    position: 'absolute',
    right: 8,
    top: -20,
    backgroundColor: '#FF6B6B',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  progressChart: {
    marginVertical: 8,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    position: 'absolute',
    bottom: 50,
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  noDataText: {
    fontSize: 16,
    color: '#999999',
  },
});