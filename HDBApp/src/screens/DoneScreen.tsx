import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';

const DoneScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackToHome = () => {
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Text style={styles.iconText}>✅</Text>
          </View>
          
          <Text style={styles.title}>30日目達成！</Text>
          <Text style={styles.subtitle}>目標完了</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>達成サマリー</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>30</Text>
              <Text style={styles.statLabel}>連続日数</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>達成率</Text>
            </View>
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>🎊 素晴らしい成果です！</Text>
          <Text style={styles.messageText}>
            30日間継続して健康目標を達成されました。{'\n'}
            この習慣を続けることで、より健康的な{'\n'}
            ライフスタイルを維持できます。
          </Text>
        </View>

        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>次のステップ</Text>
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>🎯</Text>
            <Text style={styles.nextStepText}>新しい健康目標を設定</Text>
          </View>
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>📊</Text>
            <Text style={styles.nextStepText}>健康データを継続記録</Text>
          </View>
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>🏆</Text>
            <Text style={styles.nextStepText}>さらなる目標にチャレンジ</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackToHome}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>ホームに戻る</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.success,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginBottom: 20,
    ...theme.shadow.md,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border.light,
    marginHorizontal: 20,
  },
  messageCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginBottom: 20,
    ...theme.shadow.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  nextStepsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginBottom: 32,
    ...theme.shadow.md,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextStepIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  nextStepText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  homeButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  homeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DoneScreen;