import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs: TabItem[] = [
  { key: 'health-check', label: '健診', icon: '🏥' },
  { key: 'pulse-survey', label: 'パルスサーベイ', icon: '📊' },
  { key: 'home', label: 'ホーム', icon: '🏠' },
  { key: 'record', label: '記録', icon: '📝' },
  { key: 'notifications', label: 'お知らせ', icon: '🔔' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconPlaceholder, activeTab === tab.key && styles.activeIconPlaceholder]}>
            <Text style={[styles.icon, activeTab === tab.key && styles.activeIcon]}>
              {tab.icon || tab.label.charAt(0)}
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              activeTab === tab.key && styles.activeLabel,
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconPlaceholder: {
    backgroundColor: '#FFE5DC',
  },
  icon: {
    fontSize: 20,
    color: '#666666',
  },
  activeIcon: {
    fontSize: 22,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#FF6B35',
    fontWeight: '600',
  },
});

export default BottomNavigation;