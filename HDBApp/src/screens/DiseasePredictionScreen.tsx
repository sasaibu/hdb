import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import Svg, {Path, Circle, Line, Text as SvgText, Rect} from 'react-native-svg';

type Props = StackScreenProps<RootStackParamList, 'DiseasePrediction'>;

interface DiseaseData {
  name: string;
  color: string;
  description: string;
  currentRisk: number;
  historicalData: {year: string; risk: number}[];
  recommendation: string;
}

const DiseasePredictionScreen: React.FC<Props> = () => {
  const {width} = Dimensions.get('window');
  const chartWidth = width - 60;
  const chartHeight = 180;

  // ダミーデータ（各疾病の経年リスク変化）
  const diseases: DiseaseData[] = [
    {
      name: '糖尿病',
      color: '#4CAF50',
      description: '血糖値とHbA1cの推移から予測',
      currentRisk: 5,
      historicalData: [
        {year: '2020', risk: 3},
        {year: '2021', risk: 4},
        {year: '2022', risk: 4},
        {year: '2023', risk: 5},
        {year: '2024', risk: 5},
        {year: '2025', risk: 6},
      ],
      recommendation: '現在のリスクは低いですが、わずかに上昇傾向です。食事管理を継続してください。',
    },
    {
      name: '高血圧症',
      color: '#FF5722',
      description: '収縮期・拡張期血圧の推移から予測',
      currentRisk: 28,
      historicalData: [
        {year: '2020', risk: 15},
        {year: '2021', risk: 18},
        {year: '2022', risk: 22},
        {year: '2023', risk: 25},
        {year: '2024', risk: 28},
        {year: '2025', risk: 32},
      ],
      recommendation: '上昇傾向が続いています。塩分制限と有酸素運動を強化してください。',
    },
    {
      name: '脂質異常症',
      color: '#2196F3',
      description: 'コレステロール値の推移から予測',
      currentRisk: 15,
      historicalData: [
        {year: '2020', risk: 12},
        {year: '2021', risk: 13},
        {year: '2022', risk: 14},
        {year: '2023', risk: 14},
        {year: '2024', risk: 15},
        {year: '2025', risk: 16},
      ],
      recommendation: '緩やかな上昇です。脂質の摂取量に注意し、運動習慣を維持してください。',
    },
    {
      name: '心疾患',
      color: '#9C27B0',
      description: '複合的な要因から予測',
      currentRisk: 12,
      historicalData: [
        {year: '2020', risk: 8},
        {year: '2021', risk: 9},
        {year: '2022', risk: 10},
        {year: '2023', risk: 11},
        {year: '2024', risk: 12},
        {year: '2025', risk: 13},
      ],
      recommendation: 'リスクは比較的低いですが、予防的な対策を継続してください。',
    },
    {
      name: '脳血管疾患',
      color: '#00BCD4',
      description: '血圧・脂質・血糖値から総合的に予測',
      currentRisk: 8,
      historicalData: [
        {year: '2020', risk: 6},
        {year: '2021', risk: 7},
        {year: '2022', risk: 7},
        {year: '2023', risk: 8},
        {year: '2024', risk: 8},
        {year: '2025', risk: 9},
      ],
      recommendation: 'リスクは低く安定しています。現在の健康管理を継続してください。',
    },
  ];

  const createLineChart = (data: {year: string; risk: number}[], color: string) => {
    const maxRisk = 40;
    const minRisk = 0;
    const padding = 10;
    const chartInnerWidth = chartWidth - padding * 2;
    const chartInnerHeight = chartHeight - padding * 2 - 30; // 下部のラベル用スペース

    // データポイントの座標を計算
    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartInnerWidth;
      const y = padding + ((maxRisk - item.risk) / (maxRisk - minRisk)) * chartInnerHeight;
      return {x, y, ...item};
    });

    // パスの作成
    const pathData = points
      .map((point, index) => {
        return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
      })
      .join(' ');

    return {points, pathData, maxRisk, chartInnerHeight, padding};
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage < 10) return { text: '低リスク', color: '#4CAF50' };
    if (percentage < 20) return { text: '中リスク', color: '#FF9800' };
    if (percentage < 30) return { text: '要注意', color: '#FF5722' };
    return { text: '高リスク', color: '#F44336' };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>疾病予測分析結果</Text>
        <Text style={styles.subtitle}>
          AIが健診データから将来の疾病リスクを予測しました
        </Text>
      </View>

      {/* 各疾病の折れ線グラフ */}
      {diseases.map((disease, index) => {
        const chartData = createLineChart(disease.historicalData, disease.color);
        const riskLevel = getRiskLevel(disease.currentRisk);
        
        return (
          <View key={index} style={styles.chartContainer}>
            <View style={styles.diseaseHeader}>
              <Text style={styles.diseaseName}>{disease.name}</Text>
              <View style={styles.currentRiskBadge}>
                <Text style={[styles.currentRiskValue, {color: disease.color}]}>
                  {disease.currentRisk}%
                </Text>
                <Text style={[styles.riskLevelText, {color: riskLevel.color}]}>
                  {riskLevel.text}
                </Text>
              </View>
            </View>
            
            <Text style={styles.diseaseDescription}>{disease.description}</Text>
            
            {/* 折れ線グラフ */}
            <View style={styles.lineChart}>
              <Svg width={chartWidth} height={chartHeight}>
                {/* グリッド線（横） */}
                {[0, 10, 20, 30, 40].map((value) => (
                  <Line
                    key={`grid-${value}`}
                    x1={chartData.padding}
                    x2={chartWidth - chartData.padding}
                    y1={chartData.padding + ((chartData.maxRisk - value) / chartData.maxRisk) * chartData.chartInnerHeight}
                    y2={chartData.padding + ((chartData.maxRisk - value) / chartData.maxRisk) * chartData.chartInnerHeight}
                    stroke="#E0E0E0"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y軸のラベル */}
                {[0, 10, 20, 30, 40].map((value) => (
                  <SvgText
                    key={`label-${value}`}
                    x="5"
                    y={chartData.padding + ((chartData.maxRisk - value) / chartData.maxRisk) * chartData.chartInnerHeight + 5}
                    fontSize="10"
                    fill="#666666">
                    {value}%
                  </SvgText>
                ))}
                
                {/* 折れ線 */}
                <Path
                  d={chartData.pathData}
                  stroke={disease.color}
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* データポイント */}
                {chartData.points.map((point, idx) => (
                  <Circle
                    key={`point-${idx}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={disease.color}
                  />
                ))}
                
                {/* X軸のラベル（年） */}
                {chartData.points.map((point, idx) => (
                  <SvgText
                    key={`year-${idx}`}
                    x={point.x}
                    y={chartHeight - 5}
                    fontSize="10"
                    fill="#666666"
                    textAnchor="middle">
                    {point.year}
                  </SvgText>
                ))}
              </Svg>
            </View>
            
            <Text style={styles.recommendation}>{disease.recommendation}</Text>
          </View>
        );
      })}

      {/* 総合評価 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>総合評価</Text>
        <Text style={styles.summaryText}>
          あなたの健診データに基づく分析結果では、高血圧症のリスクがやや高めです。
          {'\n\n'}
          推奨される対策：
          {'\n'}
          • 塩分摂取を1日6g未満に制限
          {'\n'}
          • 週3回以上、30分以上の有酸素運動
          {'\n'}
          • 体重管理（BMI 25未満を目標）
          {'\n'}
          • 定期的な血圧測定
          {'\n'}
          • ストレス管理とリラックス時間の確保
        </Text>
      </View>

      {/* 免責事項 */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          ※ この予測はAIによる分析結果であり、医学的診断ではありません。
          実際の診断や治療については、必ず医師にご相談ください。
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  currentRiskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentRiskValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  diseaseDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  lineChart: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendation: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  summaryContainer: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: '#1B5E20',
    lineHeight: 22,
  },
  disclaimerContainer: {
    margin: 16,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default DiseasePredictionScreen;