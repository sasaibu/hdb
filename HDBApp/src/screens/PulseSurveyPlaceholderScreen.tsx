import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PulseSurveyPlaceholderScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💭</Text>
        </View>
        
        <Text style={styles.title}>パルスサーベイ</Text>
        
        <Text style={styles.subtitle}>
          WebView実装予定
        </Text>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            パルスサーベイ機能は現在準備中です。{'\n'}
            本番環境では、WebViewを通じて{'\n'}
            HDBシステムのパルスサーベイ画面が表示されます。
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>実装予定機能：</Text>
          <Text style={styles.infoItem}>• 従業員意識調査</Text>
          <Text style={styles.infoItem}>• アンケート回答</Text>
          <Text style={styles.infoItem}>• 結果確認</Text>
          <Text style={styles.infoItem}>• 統計データ表示</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FF6B35',
    marginBottom: 32,
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    paddingLeft: 8,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PulseSurveyPlaceholderScreen;