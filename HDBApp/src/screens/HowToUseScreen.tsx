import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface HowToSection {
  title: string;
  icon: string;
  content: string;
  steps?: string[];
}

const HowToUseScreen: React.FC = () => {
  const sections: HowToSection[] = [
    {
      title: '基本的な使い方',
      icon: '📱',
      content: 'Health Data Bankアプリの基本的な使い方をご説明します。',
      steps: [
        'ホーム画面でダッシュボードを確認',
        '記録タブで健康データを入力',
        'バイタル履歴で過去のデータを確認',
        'レポートタブで統計を表示',
      ],
    },
    {
      title: 'バイタルデータの記録',
      icon: '📝',
      content: '健康データを記録する方法について説明します。',
      steps: [
        '記録タブを開く',
        '記録したいバイタルデータ（歩数、体重など）をタップ',
        '数値を入力して保存',
        '詳細ボタンで履歴を確認',
      ],
    },
    {
      title: '目標設定の方法',
      icon: '🎯',
      content: '健康目標を設定して達成度を管理できます。',
      steps: [
        'ドロワーメニューから「目標設定」を選択',
        '目標タイプを選択（運動、食事など）',
        '具体的な目標を入力',
        '通知設定でリマインダーを設定',
      ],
    },
    {
      title: 'イベント参加',
      icon: '🏆',
      content: '健康チャレンジイベントに参加してモチベーションを維持しましょう。',
      steps: [
        'ドロワーメニューから「イベント」を選択',
        '参加したいイベントをタップ',
        'ランキングで順位を確認',
        'ポイントを獲得',
      ],
    },
    {
      title: 'データ連携',
      icon: '🔗',
      content: '外部の健康アプリやデバイスとデータを連携できます。',
      steps: [
        'ドロワーメニューから「連携サービス」を選択',
        '連携したいサービスを選択',
        'アカウント情報を入力して連携',
        '自動的にデータが同期されます',
      ],
    },
    {
      title: 'バックアップとリストア',
      icon: '💾',
      content: 'データのバックアップと復元方法を説明します。',
      steps: [
        'ドロワーメニューから「DBバックアップ」を選択',
        'バックアップボタンをタップ',
        '機種変更時は「DBリストア」から復元',
        'バックアップファイルを選択して復元',
      ],
    },
  ];

  const renderSection = (section: HowToSection, index: number) => (
    <View key={index} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <Text style={styles.sectionContent}>{section.content}</Text>
      {section.steps && (
        <View style={styles.stepsList}>
          {section.steps.map((step, stepIndex) => (
            <View key={stepIndex} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>アプリの使い方</Text>
        <Text style={styles.headerSubtitle}>
          Health Data Bankアプリを最大限活用するためのガイド
        </Text>
      </View>

      {sections.map((section, index) => renderSection(section, index))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          その他ご不明な点は「よくあるご質問」をご覧ください
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
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default HowToUseScreen;