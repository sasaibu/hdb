import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
import HealthCheckupScreen from './HealthCheckupScreen';
import RecordScreen from './RecordScreen';
import NotificationHistoryScreen from './NotificationHistoryScreen';
import PulseSurveyListScreen from './PulseSurveyListScreen';

type MainTabScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MainTabScreenNavigationProp;
}

export default function MainTabScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'health-check':
        return <HealthCheckupScreen navigation={navigation as any} />;
      case 'pulse-survey':
        return <PulseSurveyListScreen navigation={navigation as any} />;
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
      <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} />
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