import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {RootStackParamList, MainDrawerParamList} from '../navigation/AppNavigator';

type HealthCheckupScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'HealthCheckup'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation?: HealthCheckupScreenNavigationProp;
}

type ViewMode = 'list' | 'yearly' | 'single';

interface HealthCheckupData {
  id: string;
  date: string;
  age: number;
  hospitalName: string;
  checkupType: string;
  // 詳細データ
  height: number;
  weight: number;
  bmi: number;
  bloodPressureHigh: number;
  bloodPressureLow: number;
  bloodSugar: number;
  cholesterol: number;
  triglyceride: number;
  hdlCholesterol: number;
  ldlCholesterol: number;
  ast: number;
  alt: number;
  gammaGtp: number;
}

const HealthCheckupScreen: React.FC<Props> = ({navigation}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ダミーデータ（実際はDBから取得）
  const hospitals = ['東京健康クリニック', '中央病院', 'みなと医療センター', '山手健診センター', '渋谷総合病院'];
  const checkupTypes = ['定期健康診断', '生活習慣病健診', '人間ドック', '特定健康診査', '企業健診'];
  
  const dummyData: HealthCheckupData[] = Array.from({length: 100}, (_, i) => ({
    id: `checkup-${i + 1}`,
    date: `2024-${String(12 - Math.floor(i / 10)).padStart(2, '0')}-${String(20 - (i % 10)).padStart(2, '0')}`,
    age: 30 + Math.floor(i / 3),
    hospitalName: hospitals[i % hospitals.length],
    checkupType: checkupTypes[i % checkupTypes.length],
    height: 170 + Math.random() * 10,
    weight: 65 + Math.random() * 15,
    bmi: 22 + Math.random() * 3,
    bloodPressureHigh: 120 + Math.random() * 20,
    bloodPressureLow: 70 + Math.random() * 15,
    bloodSugar: 90 + Math.random() * 20,
    cholesterol: 180 + Math.random() * 40,
    triglyceride: 100 + Math.random() * 50,
    hdlCholesterol: 50 + Math.random() * 20,
    ldlCholesterol: 100 + Math.random() * 30,
    ast: 20 + Math.random() * 15,
    alt: 20 + Math.random() * 15,
    gammaGtp: 30 + Math.random() * 20,
  }));

  const totalPages = Math.ceil(dummyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = dummyData.slice(startIndex, endIndex);

  const handleMenuSelect = (mode: ViewMode) => {
    setViewMode(mode);
    setMenuVisible(false);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDiseasePrediction = () => {
    navigation?.navigate('DiseasePrediction');
  };

  const renderListView = () => {
    return (
      <View style={styles.listContainer}>
        {currentData.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.listItemMain}>
              <View style={styles.listItemInfo}>
                <Text style={styles.listDate}>{item.date}</Text>
                <Text style={styles.listAge}>年齢: {item.age}歳</Text>
                <Text style={styles.listHospital}>{item.hospitalName}</Text>
                <Text style={styles.listType}>{item.checkupType}</Text>
              </View>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => navigation?.navigate('HealthCheckupDetail', {checkupId: item.id})}
                activeOpacity={0.8}>
                <Text style={styles.detailButtonText}>詳細</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderYearlyView = () => {
    return (
      <View style={styles.yearlyContainer}>
        <Text style={styles.yearlyTitle}>経年変化グラフ</Text>
        <Text style={styles.comingSoon}>グラフ表示機能は開発中です</Text>
      </View>
    );
  };

  const renderSingleView = () => {
    const latestData = dummyData[0];
    return (
      <ScrollView style={styles.singleContainer}>
        <View style={styles.singleSection}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>検査日:</Text>
            <Text style={styles.singleValue}>{latestData.date}</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>身長:</Text>
            <Text style={styles.singleValue}>{latestData.height.toFixed(1)} cm</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>体重:</Text>
            <Text style={styles.singleValue}>{latestData.weight.toFixed(1)} kg</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>BMI:</Text>
            <Text style={styles.singleValue}>{latestData.bmi.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.singleSection}>
          <Text style={styles.sectionTitle}>血圧・血糖</Text>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>血圧:</Text>
            <Text style={styles.singleValue}>
              {Math.round(latestData.bloodPressureHigh)}/{Math.round(latestData.bloodPressureLow)} mmHg
            </Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>血糖値:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.bloodSugar)} mg/dL</Text>
          </View>
        </View>

        <View style={styles.singleSection}>
          <Text style={styles.sectionTitle}>脂質</Text>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>総コレステロール:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.cholesterol)} mg/dL</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>中性脂肪:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.triglyceride)} mg/dL</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>HDLコレステロール:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.hdlCholesterol)} mg/dL</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>LDLコレステロール:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.ldlCholesterol)} mg/dL</Text>
          </View>
        </View>

        <View style={styles.singleSection}>
          <Text style={styles.sectionTitle}>肝機能</Text>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>AST (GOT):</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.ast)} U/L</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>ALT (GPT):</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.alt)} U/L</Text>
          </View>
          <View style={styles.singleRow}>
            <Text style={styles.singleLabel}>γ-GTP:</Text>
            <Text style={styles.singleValue}>{Math.round(latestData.gammaGtp)} U/L</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return renderListView();
      case 'yearly':
        return renderYearlyView();
      case 'single':
        return renderSingleView();
      default:
        return null;
    }
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'list':
        return '健診情報の一覧表示';
      case 'yearly':
        return '経年表示';
      case 'single':
        return '単回表示';
      default:
        return '健診情報';
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
        <Text style={styles.headerTitle}>{getViewModeTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[styles.dropdownItem, viewMode === 'list' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('list')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, viewMode === 'list' && styles.activeDropdownText]}>
              健診情報の一覧表示
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, viewMode === 'yearly' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('yearly')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, viewMode === 'yearly' && styles.activeDropdownText]}>
              経年表示
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dropdownItem, viewMode === 'single' && styles.activeDropdownItem]}
            onPress={() => handleMenuSelect('single')}
            activeOpacity={0.8}>
            <Text style={[styles.dropdownText, viewMode === 'single' && styles.activeDropdownText]}>
              単回表示
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.controlBar}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
          onPress={handlePrevPage}
          disabled={currentPage === 1}
          activeOpacity={0.8}>
          <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledButtonText]}>
            前の20件
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.predictionButton}
          onPress={handleDiseasePrediction}
          activeOpacity={0.8}>
          <Text style={styles.predictionButtonText}>疾病予測</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
          activeOpacity={0.8}>
          <Text style={[styles.pageButtonText, currentPage === totalPages && styles.disabledButtonText]}>
            次の20件
          </Text>
        </TouchableOpacity>
      </View>

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
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  disabledButtonText: {
    color: '#999999',
  },
  predictionButton: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    alignItems: 'center',
  },
  predictionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
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
  listItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemInfo: {
    flex: 1,
    gap: 4,
  },
  listDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  listAge: {
    fontSize: 14,
    color: '#666666',
  },
  listHospital: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  listType: {
    fontSize: 13,
    color: '#666666',
  },
  detailButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  yearlyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  yearlyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  comingSoon: {
    fontSize: 16,
    color: '#666666',
  },
  singleContainer: {
    padding: 16,
  },
  singleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  singleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  singleLabel: {
    fontSize: 15,
    color: '#666666',
  },
  singleValue: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
});

export default HealthCheckupScreen;