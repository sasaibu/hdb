import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNavigation from './BottomNavigation';

interface ScreenWithBottomNavProps {
  children: React.ReactNode;
  activeTab?: string;
}

const ScreenWithBottomNav: React.FC<ScreenWithBottomNavProps> = ({ 
  children, 
  activeTab = 'home' 
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) return;

    switch (tab) {
      case 'home':
        navigation.navigate('Main', { screen: 'Home' });
        break;
      case 'goal':
        // 目標画面へ遷移
        navigation.navigate('GoalSetting');
        break;
      case 'health-check':
        // 健診画面へ遷移（WebView）
        navigation.navigate('WebView', { 
          url: 'https://example.com/health-check', 
          title: '健診',
          screen: 'health-check'
        });
        break;
      case 'record':
        // 記録画面へ遷移（バイタル一覧）
        navigation.navigate('Main', { screen: 'Settings' });
        break;
      case 'notifications':
        // お知らせ画面へ遷移
        navigation.navigate('Main', { screen: 'Notice' });
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});

export default ScreenWithBottomNav;