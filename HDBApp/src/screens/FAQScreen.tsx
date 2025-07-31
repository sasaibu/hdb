import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQScreen: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: '1',
      category: '基本操作',
      question: 'データの記録方法がわかりません',
      answer: '「記録」タブを開き、記録したいバイタルデータ（歩数、体重など）をタップしてください。数値を入力して「保存」ボタンを押すとデータが記録されます。',
    },
    {
      id: '2',
      category: '基本操作',
      question: '過去のデータを確認するには？',
      answer: '各バイタルデータの「詳細」ボタンをタップすると、過去の記録を一覧で確認できます。グラフ表示も可能です。',
    },
    {
      id: '3',
      category: 'アカウント',
      question: 'パスワードを忘れてしまいました',
      answer: 'ログイン画面の「パスワードを忘れた方」をタップし、登録メールアドレスを入力してください。パスワードリセット用のメールが送信されます。',
    },
    {
      id: '4',
      category: 'アカウント',
      question: '機種変更時のデータ移行方法は？',
      answer: '旧端末で「DBバックアップ」を実行し、新端末で「DBリストア」からバックアップファイルを選択することでデータを移行できます。',
    },
    {
      id: '5',
      category: '連携',
      question: 'HealthKitと連携できません',
      answer: 'iOSの設定アプリ > プライバシー > ヘルスケア > HDBAppで、必要な項目の読み取り・書き込み権限を有効にしてください。',
    },
    {
      id: '6',
      category: '連携',
      question: 'Google Fitとの同期が失敗します',
      answer: 'Google Fitアプリが最新版であることを確認し、連携サービス設定から再度ログインしてください。',
    },
    {
      id: '7',
      category: 'イベント',
      question: 'イベントに参加するには？',
      answer: 'ドロワーメニューから「イベント」を選択し、参加したいイベントをタップしてください。自動的に参加登録されます。',
    },
    {
      id: '8',
      category: 'イベント',
      question: 'ポイントはどのように獲得できますか？',
      answer: '毎日のデータ記録、目標達成、イベント参加などでポイントを獲得できます。詳細は「ポイント」画面で確認できます。',
    },
    {
      id: '9',
      category: 'トラブル',
      question: 'アプリが起動しません',
      answer: 'アプリを一度削除して再インストールしてください。データはバックアップしておくことをお勧めします。',
    },
    {
      id: '10',
      category: 'トラブル',
      question: '通知が届きません',
      answer: '端末の設定で通知が有効になっているか確認してください。また、アプリ内の「通知設定」も確認してください。',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>よくあるご質問</Text>
        <Text style={styles.headerSubtitle}>
          お困りの内容をタップして回答をご確認ください
        </Text>
      </View>

      {categories.map(category => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {faqData
            .filter(item => item.category === category)
            .map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.questionContainer}>
                  <Text style={styles.questionIcon}>Q</Text>
                  <Text style={styles.question}>{item.question}</Text>
                  <Text style={styles.expandIcon}>
                    {expandedItems.includes(item.id) ? '−' : '+'}
                  </Text>
                </View>
                {expandedItems.includes(item.id) && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerIcon}>A</Text>
                    <Text style={styles.answer}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
        </View>
      ))}

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>解決しない場合</Text>
        <Text style={styles.contactText}>
          上記で解決しない場合は、お問い合わせフォームからご連絡ください。
        </Text>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>お問い合わせ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  categorySection: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 24,
    color: '#666',
    marginLeft: 12,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  answerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  answer: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FAQScreen;