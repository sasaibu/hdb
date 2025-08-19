import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'HealthCheckupDetail'>;

interface HealthCheckupDetailData {
  id: string;
  date: string;
  age: number;
  hospitalName: string;
  checkupType: string;
  // 身体測定
  height: number;
  weight: number;
  bmi: number;
  waist: number;
  // 血圧
  bloodPressureHigh: number;
  bloodPressureLow: number;
  // 血液検査
  bloodSugar: number;
  hba1c: number;
  cholesterol: number;
  triglyceride: number;
  hdlCholesterol: number;
  ldlCholesterol: number;
  // 肝機能
  ast: number;
  alt: number;
  gammaGtp: number;
  // 腎機能
  creatinine: number;
  egfr: number;
  // 尿検査
  urineProtein: string;
  urineSugar: string;
  urineOccultBlood: string;
  // その他
  uricAcid: number;
  hemoglobin: number;
  redBloodCell: number;
  whiteBloodCell: number;
  platelet: number;
}

const HealthCheckupDetailScreen: React.FC<Props> = ({route}) => {
  const {checkupId} = route.params;

  // ダミーデータ（実際はDBから取得）
  const detailData: HealthCheckupDetailData = {
    id: checkupId,
    date: '2024-12-15',
    age: 35,
    hospitalName: '東京健康クリニック',
    checkupType: '定期健康診断',
    // 身体測定
    height: 175.2,
    weight: 72.5,
    bmi: 23.6,
    waist: 85.0,
    // 血圧
    bloodPressureHigh: 128,
    bloodPressureLow: 78,
    // 血液検査
    bloodSugar: 98,
    hba1c: 5.4,
    cholesterol: 195,
    triglyceride: 120,
    hdlCholesterol: 58,
    ldlCholesterol: 113,
    // 肝機能
    ast: 25,
    alt: 28,
    gammaGtp: 42,
    // 腎機能
    creatinine: 0.95,
    egfr: 78.5,
    // 尿検査
    urineProtein: '(-)',
    urineSugar: '(-)',
    urineOccultBlood: '(-)',
    // その他
    uricAcid: 6.2,
    hemoglobin: 15.2,
    redBloodCell: 485,
    whiteBloodCell: 6200,
    platelet: 24.5,
  };

  const renderSection = (title: string, content: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content}
    </View>
  );

  const renderRow = (label: string, value: string | number, unit?: string, isNormal?: boolean) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, isNormal === false && styles.abnormalValue]}>
          {value}{unit && ` ${unit}`}
        </Text>
        {isNormal === false && <Text style={styles.abnormalMark}>!</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 基本情報 */}
      {renderSection('基本情報', (
        <>
          {renderRow('検査日', detailData.date)}
          {renderRow('年齢', detailData.age, '歳')}
          {renderRow('医療機関', detailData.hospitalName)}
          {renderRow('検査種別', detailData.checkupType)}
        </>
      ))}

      {/* 身体測定 */}
      {renderSection('身体測定', (
        <>
          {renderRow('身長', detailData.height.toFixed(1), 'cm')}
          {renderRow('体重', detailData.weight.toFixed(1), 'kg')}
          {renderRow('BMI', detailData.bmi.toFixed(1), '', detailData.bmi < 25)}
          {renderRow('腹囲', detailData.waist.toFixed(1), 'cm', detailData.waist < 85)}
        </>
      ))}

      {/* 血圧 */}
      {renderSection('血圧', (
        <>
          {renderRow('収縮期血圧', detailData.bloodPressureHigh, 'mmHg', detailData.bloodPressureHigh < 130)}
          {renderRow('拡張期血圧', detailData.bloodPressureLow, 'mmHg', detailData.bloodPressureLow < 85)}
        </>
      ))}

      {/* 血液検査（糖代謝） */}
      {renderSection('血液検査（糖代謝）', (
        <>
          {renderRow('空腹時血糖', detailData.bloodSugar, 'mg/dL', detailData.bloodSugar < 100)}
          {renderRow('HbA1c', detailData.hba1c.toFixed(1), '%', detailData.hba1c < 5.6)}
        </>
      ))}

      {/* 血液検査（脂質） */}
      {renderSection('血液検査（脂質）', (
        <>
          {renderRow('総コレステロール', detailData.cholesterol, 'mg/dL')}
          {renderRow('中性脂肪', detailData.triglyceride, 'mg/dL', detailData.triglyceride < 150)}
          {renderRow('HDLコレステロール', detailData.hdlCholesterol, 'mg/dL', detailData.hdlCholesterol >= 40)}
          {renderRow('LDLコレステロール', detailData.ldlCholesterol, 'mg/dL', detailData.ldlCholesterol < 120)}
        </>
      ))}

      {/* 肝機能 */}
      {renderSection('肝機能', (
        <>
          {renderRow('AST (GOT)', detailData.ast, 'U/L', detailData.ast <= 30)}
          {renderRow('ALT (GPT)', detailData.alt, 'U/L', detailData.alt <= 30)}
          {renderRow('γ-GTP', detailData.gammaGtp, 'U/L', detailData.gammaGtp <= 50)}
        </>
      ))}

      {/* 腎機能 */}
      {renderSection('腎機能', (
        <>
          {renderRow('クレアチニン', detailData.creatinine.toFixed(2), 'mg/dL', detailData.creatinine <= 1.04)}
          {renderRow('eGFR', detailData.egfr.toFixed(1), 'mL/分/1.73m²', detailData.egfr >= 60)}
        </>
      ))}

      {/* 尿検査 */}
      {renderSection('尿検査', (
        <>
          {renderRow('尿蛋白', detailData.urineProtein, '', detailData.urineProtein === '(-)')}
          {renderRow('尿糖', detailData.urineSugar, '', detailData.urineSugar === '(-)')}
          {renderRow('尿潜血', detailData.urineOccultBlood, '', detailData.urineOccultBlood === '(-)')}
        </>
      ))}

      {/* その他の検査 */}
      {renderSection('その他の検査', (
        <>
          {renderRow('尿酸', detailData.uricAcid.toFixed(1), 'mg/dL', detailData.uricAcid <= 7.0)}
          {renderRow('ヘモグロビン', detailData.hemoglobin.toFixed(1), 'g/dL', detailData.hemoglobin >= 13.5)}
          {renderRow('赤血球数', detailData.redBloodCell, '万/μL', detailData.redBloodCell >= 400)}
          {renderRow('白血球数', detailData.whiteBloodCell, '/μL', detailData.whiteBloodCell >= 3500 && detailData.whiteBloodCell <= 9000)}
          {renderRow('血小板数', detailData.platelet.toFixed(1), '万/μL', detailData.platelet >= 15)}
        </>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 15,
    color: '#666666',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  abnormalValue: {
    color: '#FF3B30',
  },
  abnormalMark: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});

export default HealthCheckupDetailScreen;