import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  CheckBox,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ServiceTermsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ServiceTerms'
>;

interface Props {
  navigation: ServiceTermsScreenNavigationProp;
}

const ServiceTermsScreen: React.FC<Props> = ({ navigation }) => {
  const [isAgreed, setIsAgreed] = useState(false);

  const handleAgree = () => {
    if (isAgreed) {
      navigation.navigate('EmailInput');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>サービス利用条件</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>第1条（利用規約の適用）</Text>
        <Text style={styles.paragraph}>
          本利用規約は、Health Data Bank（以下「本サービス」といいます）の利用に関する条件を定めるものです。
          ユーザーは、本利用規約に同意した上で、本サービスを利用するものとします。
        </Text>

        <Text style={styles.sectionTitle}>第2条（定義）</Text>
        <Text style={styles.paragraph}>
          本利用規約において使用する用語の定義は、以下のとおりとします。
          {'\n'}• 「ユーザー」とは、本サービスを利用する個人をいいます。
          {'\n'}• 「健康データ」とは、ユーザーが本サービスに登録する健康に関する情報をいいます。
        </Text>

        <Text style={styles.sectionTitle}>第3条（サービス内容）</Text>
        <Text style={styles.paragraph}>
          本サービスは、以下の機能を提供します。
          {'\n'}• 健康データの記録・管理
          {'\n'}• 健康データの可視化・分析
          {'\n'}• 健康目標の設定・管理
          {'\n'}• 外部サービスとの連携
        </Text>

        <Text style={styles.sectionTitle}>第4条（個人情報の取扱い）</Text>
        <Text style={styles.paragraph}>
          当社は、ユーザーの個人情報を適切に管理し、プライバシーポリシーに従って取り扱います。
          健康データは特に機密性の高い情報として、厳重に管理いたします。
        </Text>

        <Text style={styles.sectionTitle}>第5条（禁止事項）</Text>
        <Text style={styles.paragraph}>
          ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          {'\n'}• 法令または公序良俗に違反する行為
          {'\n'}• 他のユーザーまたは第三者の権利を侵害する行為
          {'\n'}• 本サービスの運営を妨害する行為
        </Text>

        <Text style={styles.sectionTitle}>第6条（免責事項）</Text>
        <Text style={styles.paragraph}>
          本サービスで提供される情報は、健康管理の参考情報であり、医学的診断や治療の代替となるものではありません。
          健康に関する判断は、必ず医療専門家にご相談ください。
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsAgreed(!isAgreed)}
        >
          <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
            {isAgreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            上記の利用条件に同意します
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.agreeButton, !isAgreed && styles.agreeButtonDisabled]}
          onPress={handleAgree}
          disabled={!isAgreed}
        >
          <Text style={[styles.agreeButtonText, !isAgreed && styles.agreeButtonTextDisabled]}>
            同意して次へ
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  agreeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  agreeButtonTextDisabled: {
    color: '#999',
  },
});

export default ServiceTermsScreen;