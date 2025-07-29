import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  MainDrawerParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import BottomNavigation from '../components/BottomNavigation';
import HomeScreen from './HomeScreen';
import GoalContinuationScreen from './GoalContinuationScreen';
import HealthCheckScreen from './HealthCheckScreen';
import RecordScreen from './RecordScreen';
import NotificationHistoryScreen from './NotificationHistoryScreen';
import PulseSurveyPlaceholderScreen from './PulseSurveyPlaceholderScreen';
import HealthCheckPlaceholderScreen from './HealthCheckPlaceholderScreen';

type MainTabScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MainTabScreenNavigationProp;
}

export default function MainTabScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = (tab: string) => {
    // パルスサーベイと健診は特別なタブとして処理
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'health-check':
        return <HealthCheckScreen />;
      case 'pulse-survey':
        return <PulseSurveyPlaceholderScreen />;
      case 'record':
        return <RecordScreen />;
      case 'notifications':
        return <NotificationHistoryScreen />;
      case 'home':
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});