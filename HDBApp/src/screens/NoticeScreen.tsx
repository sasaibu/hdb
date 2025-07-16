import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {MainDrawerParamList} from '../types/navigation';

type Props = DrawerScreenProps<MainDrawerParamList, 'Notice'>;

interface NoticeItem {　//お知らせの型定義
  id: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  target: 'all' | 'personal' | 'everyone';
}

const NoticeScreen: React.FC<Props> = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'everyone'>('all');
  const [expandedNotices, setExpandedNotices] = useState<string[]>([]);

  const mockNotices: NoticeItem[] = [　//お知らせたち
    {
      id: '1',
      title: 'システムメンテナンスのお知らせ',
      content: '2024年1月20日（土）午前2時～午前6時の間、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません。お客様にはご不便をおかけいたしますが、何卒ご理解ご協力のほどお願い申し上げます。',
      date: '01-15',
      isRead: false,
      target: 'everyone',
    },
    {
      id: '2',
      title: '新機能リリースのお知らせ',
      content: '血圧データのグラフ表示機能を追加しました。詳しくは設定画面をご確認ください。今回のアップデートでは、過去1週間、1ヶ月、3ヶ月の血圧推移をグラフで確認できるようになりました。',
      date: '01-10',
      isRead: true,
      target: 'everyone',
    },
    {
      id: '3',
      title: 'あなたの健康データについて',
      content: '先月の歩数目標を達成されました！おめでとうございます。今月も目標達成を目指して頑張りましょう。詳細なレポートはダッシュボードでご確認いただけます。',
      date: '01-08',
      isRead: false,
      target: 'personal',
    },
    {
      id: '4',
      title: '年末年始の営業について',
      content: 'サポートセンターは12月29日～1月3日まで休業とさせていただきます。緊急のお問い合わせはアプリ内のヘルプセンターをご利用ください。',
      date: '12-25',
      isRead: true,
      target: 'everyone',
    },
    {
      id: '5',
      title: '健康診断リマインダー',
      content: '次回の健康診断の予定日が近づいています。早めに予約を取ることをおすすめします。前回の健康診断から6ヶ月が経過しました。',
      date: '01-12',
      isRead: false,
      target: 'personal',
    },
  ];

  const filteredNotices = mockNotices.filter(notice => { //お知らせの分類わけ
    if (activeTab === 'all') return true;
    if (activeTab === 'personal') return notice.target === 'personal';
    if (activeTab === 'everyone') return notice.target === 'everyone';
    return false;
  });

  // 各タブのお知らせ件数を計算
  const allCount = mockNotices.length;
  const personalCount = mockNotices.filter(n => n.target === 'personal').length;
  const everyoneCount = mockNotices.filter(n => n.target === 'everyone').length;

  const toggleExpanded = (noticeId: string) => {
    setExpandedNotices(prev => 
      prev.includes(noticeId) 
        ? prev.filter(id => id !== noticeId)
        : [...prev, noticeId]
    );
  };

  const handleDetailPress = (notice: NoticeItem) => {
    if (notice.target === 'personal') {
      setActiveTab('personal');
    } else if (notice.target === 'everyone') {
      setActiveTab('everyone');
    }
    setExpandedNotices([notice.id]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}>
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              all
            </Text>
            <View style={[styles.countBadge, activeTab === 'all' && styles.activeCountBadge]}>
              <Text style={[styles.countText, activeTab === 'all' && styles.activeCountText]}>
                {allCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}>
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
              あなたへ
            </Text>
            <View style={[styles.countBadge, activeTab === 'personal' && styles.activeCountBadge]}>
              <Text style={[styles.countText, activeTab === 'personal' && styles.activeCountText]}>
                {personalCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'everyone' && styles.activeTab]}
          onPress={() => setActiveTab('everyone')}>
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, activeTab === 'everyone' && styles.activeTabText]}>
              みんなへ
            </Text>
            <View style={[styles.countBadge, activeTab === 'everyone' && styles.activeCountBadge]}>
              <Text style={[styles.countText, activeTab === 'everyone' && styles.activeCountText]}>
                {everyoneCount}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredNotices.map(notice => {
          const isExpanded = expandedNotices.includes(notice.id);
          
          return (
            <View key={notice.id} style={styles.noticeCard}>
              {!notice.isRead && <View style={styles.unreadIndicator} />}
              <View style={styles.contentContainer}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.dateText}>{notice.date}</Text>
                </View>

                <Text 
                  style={styles.noticeContent} 
                  numberOfLines={isExpanded ? undefined : 2}>
                  {notice.content}
                </Text>

                {!isExpanded && (
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleDetailPress(notice)}>
                    <Text style={styles.detailButtonText}>くわしく見る</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',　//背景のオレンジ
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF8800',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  noticeCard: { //お知らせの白枠
    backgroundColor: 'white',
    marginBottom: 16,
    padding: 24,
    borderRadius: 8,
    flexDirection: 'row',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  unreadIndicator: {
    position: 'absolute',
    left: 24,
    top: 32,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  noticeContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#FFD400', //ボタンのオレンジ
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  detailButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: '#FFE8A1',
  },
  countText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  activeCountText: {
    color: '#000',
  },
});

export default NoticeScreen;