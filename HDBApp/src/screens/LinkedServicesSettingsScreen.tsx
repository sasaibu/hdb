import React, {useState} from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type LinkedServicesSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LinkedServicesSettings'
>;

interface Props {
  navigation: LinkedServicesSettingsScreenNavigationProp;
}

export default function LinkedServicesSettingsScreen({navigation}: Props) {
  const [newAppEnabled, setNewAppEnabled] = useState(false);
  const [externalServiceEnabled, setExternalServiceEnabled] = useState(false);
  const [healthConnectEnabled, setHealthConnectEnabled] = useState(false);

  const handleHowToUsePress = () => {
    // TODO: 「使い方はこちら」のリンク先を実装
    Alert.alert('情報', '「使い方はこちら」の機能は未実装です。');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>連携サービス</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>新アプリ</Text>
          <Switch
            onValueChange={setNewAppEnabled}
            value={newAppEnabled}
          />
        </View>

        {/* 外部サービスのSwitchを削除 */}

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>ヘルスコネクト（外部サービス）</Text>
          <Switch
            onValueChange={setHealthConnectEnabled}
            value={healthConnectEnabled}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleHowToUsePress} style={styles.linkButton}>
        <Text style={styles.linkText}>ヘルスコネクトの使い方はこちら</Text>
      </TouchableOpacity>

      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          ※新アプリとヘルスコネクトの許可がともにONとなっている場合、歩数は多い方の歩数データが反映されます。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingLabel: {
    fontSize: 16,
    color: '#555555',
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
