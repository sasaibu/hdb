import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'PulseSurveyList'>;

interface Survey {
  id: string;
  title: string;
  completedAt: string;
  averageScore: number;
  status: 'completed' | 'pending';
}

const PulseSurveyListScreen: React.FC<Props> = ({navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  // ダミーデータ
  const surveys: Survey[] = [
    {
      id: 'survey-1',
      title: '2024年12月 パルスサーベイ',
      completedAt: '2024-12-20',
      averageScore: 3.2,
      status: 'completed',
    },
    {
      id: 'survey-2',
      title: '2024年11月 パルスサーベイ',
      completedAt: '2024-11-20',
      averageScore: 3.5,
      status: 'completed',
    },
    {
      id: 'survey-3',
      title: '2024年10月 パルスサーベイ',
      completedAt: '2024-10-20',
      averageScore: 3.3,
      status: 'completed',
    },
    {
      id: 'survey-4',
      title: '2024年9月 パルスサーベイ',
      completedAt: '2024-09-20',
      averageScore: 3.8,
      status: 'completed',
    },
    {
      id: 'survey-5',
      title: '2024年8月 パルスサーベイ',
      completedAt: '2024-08-20',
      averageScore: 3.1,
      status: 'completed',
    },
  ];

  const weatherOptions = [
    {value: 4, icon: '☀️', label: 'そうだ', color: '#FFD700'},
    {value: 3, icon: '☁️', label: 'まあそうだ', color: '#A0A0A0'},
    {value: 2, icon: '🌧️', label: 'やや違う', color: '#4682B4'},
    {value: 1, icon: '⛈️', label: '違う', color: '#2C3E50'},
  ];

  const getWeatherIcon = (score: number) => {
    const weatherOption = weatherOptions.find(option => option.value === Math.round(score)) || weatherOptions[0];
    return weatherOption;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleSurveyPress = (survey: Survey) => {
    if (survey.status === 'completed') {
      // 実際のアプリでは、ここで該当のサーベイの詳細データを取得して渡す
      navigation.navigate('PulseSurveyResult', {
        surveyId: survey.id,
        answers: [
          {questionId: 'q1', value: 4},
          {questionId: 'q2', value: 3},
          {questionId: 'q3', value: 3},
          {questionId: 'q4', value: 3},
          {questionId: 'q5', value: 4},
          {questionId: 'q6', value: 3},
          {questionId: 'q7', value: 3},
          {questionId: 'q8', value: 3},
        ],
        questions: [
          {id: 'q1', text: '今の仕事にやりがいを感じていますか？', category: '仕事の満足度'},
          {id: 'q2', text: '職場の人間関係は良好ですか？', category: '職場環境'},
          {id: 'q3', text: '仕事とプライベートのバランスは取れていますか？', category: 'ワークライフバランス'},
          {id: 'q4', text: '上司からのサポートは十分ですか？', category: '上司との関係'},
          {id: 'q5', text: '今の仕事で成長を実感できていますか？', category: '成長実感'},
          {id: 'q6', text: '会社の方針や目標に共感できますか？', category: '組織への共感'},
          {id: 'q7', text: '適切な評価を受けていると感じますか？', category: '評価・承認'},
          {id: 'q8', text: '今の職場で長く働きたいと思いますか？', category: '継続意向'},
        ],
        completedAt: survey.completedAt,
      });
    }
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
        <Text style={styles.headerTitle}>パルスサーベイ一覧表示</Text>
        <View style={styles.headerSpacer} />
      </View>

      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('PulseSurvey');
            }}
            activeOpacity={0.8}>
            <Text style={styles.dropdownText}>新規サーベイ回答</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, styles.activeDropdownItem]}
            onPress={() => setMenuVisible(false)}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, styles.activeDropdownText]}>
              パルスサーベイ一覧表示
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 規約同意・連絡先設定状態 */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>規約同意状態</Text>
          <Text style={styles.statusValue}>同意済み</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>連絡先設定状態</Text>
          <Text style={styles.statusValueWarning}>未設定</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.surveyList}>
          {surveys.map((survey) => {
            const weather = getWeatherIcon(survey.averageScore);
            return (
              <TouchableOpacity
                key={survey.id}
                style={styles.surveyCard}
                onPress={() => handleSurveyPress(survey)}
                activeOpacity={0.8}>
                <View style={styles.surveyHeader}>
                  <Text style={styles.surveyTitle}>{survey.title}</Text>
                  <View style={styles.surveyScore}>
                    <Text style={styles.surveyScoreIcon}>{weather.icon}</Text>
                    <Text style={[styles.surveyScoreValue, {color: weather.color}]}>
                      {survey.averageScore.toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.surveyDate}>回答日: {formatDate(survey.completedAt)}</Text>
                <View style={styles.surveyStatus}>
                  <Text style={[
                    styles.surveyStatusText,
                    {color: survey.status === 'completed' ? '#4CAF50' : '#FF9800'}
                  ]}>
                    {survey.status === 'completed' ? '回答済み' : '未回答'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 新規サーベイボタン */}
        <TouchableOpacity
          style={styles.newSurveyButton}
          onPress={() => navigation.navigate('PulseSurvey')}
          activeOpacity={0.8}>
          <Text style={styles.newSurveyButtonText}>新しいサーベイに回答する</Text>
        </TouchableOpacity>
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
  statusContainer: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusValueWarning: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  content: {
    flex: 1,
  },
  surveyList: {
    padding: 16,
  },
  surveyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  surveyScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  surveyScoreIcon: {
    fontSize: 28,
  },
  surveyScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  surveyDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  surveyStatus: {
    alignSelf: 'flex-start',
  },
  surveyStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newSurveyButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newSurveyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PulseSurveyListScreen;