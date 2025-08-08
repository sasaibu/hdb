import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {MainDrawerParamList} from '../types/navigation';
import {DATA_DELETION_CONTENT} from '../constants/dataDeletionContent';

type Props = DrawerScreenProps<MainDrawerParamList, 'DataDeletion'>;

const DataDeletionScreen: React.FC<Props> = () => {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>ロゴ画像</Text>
            </View>
          </View>

          <Text style={styles.title}>データ削除について</Text>
          
          <View style={styles.divider} />

          <Text style={styles.contentText}>{DATA_DELETION_CONTENT}</Text>

          <View style={styles.bottomDivider} />
          
          <Text style={styles.copyright}>
            Copyright © 2008-2025 NTT DATA JAPAN CORPORATION
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 250,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoText: {
    color: '#999',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
    marginLeft: 20,
    marginBottom: 20,
  },
  divider: {
    height: 2,
    backgroundColor: '#22C55E',
    width: '100%',
    marginBottom: 30,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333333',
    paddingHorizontal: 20,
  },
  bottomDivider: {
    height: 2,
    backgroundColor: '#22C55E',
    width: '100%',
    marginTop: 30,
  },
  copyright: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
    marginRight: 20,
    marginBottom: 20,
  },
});

export default DataDeletionScreen;