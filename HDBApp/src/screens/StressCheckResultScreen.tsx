import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import Svg, {Polygon, Line, Text as SvgText, Circle} from 'react-native-svg';

type Props = StackScreenProps<RootStackParamList, 'StressCheckResult'>;

type MenuTab = 'list' | 'graph' | 'advice' | 'evaluation' | 'answers';

interface StressData {
  category: string;
  score: number;
  maxScore: number;
}

const StressCheckResultScreen: React.FC<Props> = ({navigation, route}) => {
  const {checkId, title} = route.params;
  const [activeTab, setActiveTab] = useState<MenuTab>('graph');
  const [menuVisible, setMenuVisible] = useState(false);

  // ダミーデータ（実際は回答から計算）
  const stressData: StressData[] = [
    {category: '仕事の量', score: 7, maxScore: 10},
    {category: '仕事の質', score: 5, maxScore: 10},
    {category: '身体的負担', score: 3, maxScore: 10},
    {category: '人間関係', score: 6, maxScore: 10},
    {category: '職場環境', score: 4, maxScore: 10},
    {category: '仕事の適性', score: 8, maxScore: 10},
  ];

  const totalScore = stressData.reduce((sum, item) => sum + item.score, 0);
  const maxTotalScore = stressData.reduce((sum, item) => sum + item.maxScore, 0);
  const stressLevel = totalScore / maxTotalScore;

  const getStressLevelText = () => {
    if (stressLevel < 0.3) return {level: '低', color: '#4CAF50'};
    if (stressLevel < 0.6) return {level: '中', color: '#FF9800'};
    return {level: '高', color: '#F44336'};
  };

  const renderRadarChart = () => {
    const {width} = Dimensions.get('window');
    const size = width - 80;
    const center = size / 2;
    const radius = size * 0.35;
    const angleStep = (2 * Math.PI) / stressData.length;

    const points = stressData.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (item.score / item.maxScore) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={styles.chartContainer}>
        <Svg width={size} height={size} style={styles.chart}>
          {/* グリッド線 */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
            <Polygon
              key={scale}
              points={stressData.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const r = radius * scale;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#E0E0E0"
              strokeWidth="1"
            />
          ))}

          {/* 軸線 */}
          {stressData.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
            );
          })}

          {/* データ */}
          <Polygon
            points={points}
            fill="#007AFF"
            fillOpacity="0.3"
            stroke="#007AFF"
            strokeWidth="2"
          />

          {/* データポイント */}
          {stressData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const r = (item.score / item.maxScore) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#007AFF"
              />
            );
          })}

          {/* ラベル */}
          {stressData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 30;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            return (
              <SvgText
                key={index}
                x={x}
                y={y}
                fontSize="12"
                fill="#666666"
                textAnchor="middle"
                alignmentBaseline="middle">
                {item.category}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <TouchableOpacity
            style={styles.listButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <Text style={styles.listButtonText}>アンケート一覧へ戻る</Text>
          </TouchableOpacity>
        );

      case 'graph':
        return (
          <>
            {renderRadarChart()}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>総合ストレススコア</Text>
              <Text style={[styles.scoreValue, {color: getStressLevelText().color}]}>
                {totalScore} / {maxTotalScore}
              </Text>
              <Text style={[styles.levelText, {color: getStressLevelText().color}]}>
                ストレスレベル: {getStressLevelText().level}
              </Text>
            </View>
          </>
        );

      case 'advice':
        return (
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceTitle}>アドバイス</Text>
            <Text style={styles.adviceText}>
              あなたのストレスレベルは「{getStressLevelText().level}」です。
              {'\n\n'}
              {stressLevel < 0.3 && '現在のストレスレベルは良好です。この状態を維持するため、定期的な運動や十分な睡眠を心がけましょう。'}
              {stressLevel >= 0.3 && stressLevel < 0.6 && '中程度のストレスを感じています。リラックスする時間を作り、趣味や運動でストレスを発散しましょう。必要に応じて同僚や上司に相談することも大切です。'}
              {stressLevel >= 0.6 && '高いストレスレベルです。早めの対処が必要です。産業医や専門家への相談を検討し、業務量の調整や休暇の取得を考えてみてください。'}
            </Text>
          </View>
        );

      case 'evaluation':
        return (
          <View style={styles.evaluationContainer}>
            <Text style={styles.evaluationTitle}>評価</Text>
            {stressData.map((item, index) => (
              <View key={index} style={styles.evaluationItem}>
                <Text style={styles.evaluationCategory}>{item.category}</Text>
                <View style={styles.evaluationBar}>
                  <View
                    style={[
                      styles.evaluationFill,
                      {
                        width: `${(item.score / item.maxScore) * 100}%`,
                        backgroundColor: item.score > 6 ? '#F44336' : item.score > 3 ? '#FF9800' : '#4CAF50',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.evaluationScore}>{item.score}/{item.maxScore}</Text>
              </View>
            ))}
          </View>
        );

      case 'answers':
        return (
          <View style={styles.answersContainer}>
            <Text style={styles.answersTitle}>回答結果</Text>
            <Text style={styles.answersText}>
              実施日: 2025-01-30{'\n'}
              回答時間: 8分32秒{'\n'}
              {'\n'}
              質問1: ときどきあった{'\n'}
              質問2: しばしばあった{'\n'}
              質問3: ときどきあった{'\n'}
              質問4: ほとんどなかった{'\n'}
              質問5: ときどきあった
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const handleMenuSelect = (tab: MenuTab) => {
    setActiveTab(tab);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
          activeOpacity={0.8}>
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[styles.dropdownItem, activeTab === 'list' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('list')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, activeTab === 'list' && styles.activeDropdownText]}>
              一覧表示
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, activeTab === 'graph' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('graph')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, activeTab === 'graph' && styles.activeDropdownText]}>
              グラフ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, activeTab === 'advice' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('advice')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, activeTab === 'advice' && styles.activeDropdownText]}>
              アドバイス
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, activeTab === 'evaluation' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('evaluation')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, activeTab === 'evaluation' && styles.activeDropdownText]}>
              評価
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, activeTab === 'answers' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('answers')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, activeTab === 'answers' && styles.activeDropdownText]}>
              回答結果
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    padding: 8,
  },
  hamburgerIcon: {
    width: 24,
    height: 24,
    justifyContent: 'space-around',
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#333333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeDropdownItem: {
    backgroundColor: '#F0F8FF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  activeDropdownText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  listButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  adviceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adviceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  adviceText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  evaluationContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evaluationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  evaluationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  evaluationCategory: {
    width: 80,
    fontSize: 14,
    color: '#666666',
  },
  evaluationBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  evaluationFill: {
    height: '100%',
    borderRadius: 10,
  },
  evaluationScore: {
    fontSize: 14,
    color: '#666666',
    width: 40,
    textAlign: 'right',
  },
  answersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  answersText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
});

export default StressCheckResultScreen;