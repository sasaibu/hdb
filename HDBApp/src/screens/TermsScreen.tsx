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

type Props = DrawerScreenProps<MainDrawerParamList, 'Terms'>;

const TermsScreen: React.FC<Props> = () => {
  const termsContent = `第1条（目的）
本利用規約（以下「本規約」といいます。）は、健康データバンク（以下「当社」といいます。）が提供するヘルスケアアプリケーション「HDB」（以下「本サービス」といいます。）の利用条件を定めるものです。

第2条（適用）
1. 本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
2. 当社は本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。

第3条（利用登録）
1. 本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。

第4条（個人情報の取扱い）
当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。

第5条（健康データの管理）
1. ユーザーは、本サービスに登録する健康データの正確性について責任を負うものとします。
2. 当社は、ユーザーが登録した健康データを適切に管理し、ユーザーの同意なく第三者に提供することはありません。

第6条（禁止事項）
ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
1. 法令または公序良俗に違反する行為
2. 犯罪行為に関連する行為
3. 当社、本サービスの他のユーザー、または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
4. 当社のサービスの運営を妨害するおそれのある行為
5. 他のユーザーに関する個人情報等を収集または蓄積する行為
6. 不正アクセスをし、またはこれを試みる行為

第7条（本サービスの提供の停止等）
1. 当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
2. 本サービスにかかるコンピュータシステムの保守点検または更新を行う場合

第8条（免責事項）
1. 当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
2. 本サービスで提供される健康情報は、医療行為に代わるものではありません。

第9条（サービス内容の変更等）
当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。

第10条（利用規約の変更）
当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなします。

第11条（準拠法・裁判管轄）
本規約の解釈にあたっては、日本法を準拠法とします。`;

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

          <Text style={styles.title}>サービス利用者利用条件</Text>
          
          <View style={styles.divider} />

          <Text style={styles.termsText}>{termsContent}</Text>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Health Data Bank Co., Ltd. All rights reserved.
          </Text>
        </View>
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
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    width: '100%',
    marginBottom: 70, //黒線から文章が始まるまでの感覚
  },
  termsText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#333333',
    paddingHorizontal: 20,
  },
  footer: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default TermsScreen;