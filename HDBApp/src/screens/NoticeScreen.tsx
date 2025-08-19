import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// ナビゲーションライブラリの型定義 (React Navigationを使用している場合)
// プロジェクトのセットアップによってはこれらのimportは不要な場合もあります
import type {DrawerScreenProps} from '@react-navigation/drawer';
import type {MainDrawerParamList} from '../types/navigation'; // アプリ独自のナビゲーションの型定義

// Propsの型定義: このコンポーネントが親から受け取るpropsの設計図
// 'Notice'はナビゲーションルートの名前を指します
type Props = DrawerScreenProps<MainDrawerParamList, 'Notice'>;

// お知らせアイテムのデータ構造を定義するインターフェース
// 'target'は'personal'か'everyone'のどちらかのみを持ち、'all'は個別のターゲットとしては持ちません
interface NoticeItem {
  id: string; // お知らせを一意に識別するID
  title: string; // お知らせのタイトル
  content: string; // お知らせの本文
  date: string; // お知らせの日付
  isRead: boolean; // 既読かどうか (true: 既読, false: 未読)
  target: 'personal' | 'everyone'; // 誰向けのお知らせか ('personal': あなたへ, 'everyone': みんなへ)
}

// NoticeScreenコンポーネントの定義
const NoticeScreen: React.FC<Props> = () => {
  // ① 状態の管理 (useStateフック)
  // activeTab: 現在選択されているタブを管理 ('all', 'personal', 'everyone'のいずれか)
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'everyone'>('all');
  // expandedNotices: 展開されているお知らせのIDを文字列の配列で管理
  const [expandedNotices, setExpandedNotices] = useState<string[]>([]);

  // ② 仮のデータ (モックデータ)
  // 実際のアプリでは、このデータはAPIから取得されます
  // targetの型定義に合わせて、'all'のデータは含めません
  const mockNotices: NoticeItem[] = [
    {
      id: '1',
      title: 'システムメンテナンスのお知らせ',
      content: '2024年1月20日（土）午前2時～午前6時の間、システムメンテナンスを実施いたします。メンテナンス中はサービスをご利用いただけません。お客様にはご不便をおかけいたしますが、何卒ご理解ご協力のほどお願い申し上げます。',
      date: '2024-01-15',
      isRead: false,
      target: 'everyone',
    },
    {
      id: '2',
      title: '新機能リリースのお知らせ',
      content: '血圧データのグラフ表示機能を追加しました。詳しくは設定画面をご確認ください。今回のアップデートでは、過去1週間、1ヶ月、3ヶ月の血圧推移をグラフで確認できるようになりました。',
      date: '2024-01-10',
      isRead: true,
      target: 'everyone',
    },
    {
      id: '3',
      title: 'あなたの健康データについて',
      content: '先月の歩数目標を達成されました！おめでとうございます。今月も目標達成を目指して頑張りましょう。詳細なレポートはダッシュボードでご確認いただけます。',
      date: '2024-01-08',
      isRead: false,
      target: 'personal',
    },
    {
      id: '4',
      title: '年末年始の営業について',
      content: 'サポートセンターは12月29日～1月3日まで休業とさせていただきます。緊急のお問い合わせはアプリ内のヘルプセンターをご利用ください。',
      date: '2023-12-25',
      isRead: true,
      target: 'everyone',
    },
    {
      id: '5',
      title: '健康診断リマインダー',
      content: '次回の健康診断の予定日が近づいています。早めに予約を取ることをおすすめします。前回の健康診断から6ヶ月が経過しました。',
      date: '2024-01-12',
      isRead: false,
      target: 'personal',
    },
  ];

  // ③ 表示するお知らせを絞り込むロジック
  // activeTabの値に基づいて、mockNoticesから表示対象のお知らせを選び出します
  const filteredNotices = mockNotices.filter(notice => {
    if (activeTab === 'all') {
      // 'all'タブが選択されている場合、targetが'personal'または'everyone'のものを表示
      return notice.target === 'personal' || notice.target === 'everyone';
    }
    if (activeTab === 'personal') {
      // 'personal'タブが選択されている場合、targetが'personal'のものだけを表示
      return notice.target === 'personal';
    }
    if (activeTab === 'everyone') {
      // 'everyone'タブが選択されている場合、targetが'everyone'のものだけを表示
      return notice.target === 'everyone';
    }
    return false; // 上記のどれにも当てはまらない場合は表示しない (通常は発生しない)
  });

  // ④ 各タブのお知らせ件数を計算
  // 'all'の件数は'personal'と'everyone'の合計として計算されます
  const personalCount = mockNotices.filter(n => n.target === 'personal').length;
  const everyoneCount = mockNotices.filter(n => n.target === 'everyone').length;
  const allCount = personalCount + everyoneCount; // 'all'は'personal'と'everyone'の合計

  // ⑤ お知らせの展開・折りたたみを切り替える関数
  const toggleExpanded = (noticeId: string) => {
    setExpandedNotices(prev => // 以前の展開リスト(prev)を使って新しいリストを作成
      prev.includes(noticeId) // もし、今タップされたお知らせのIDが、既に展開リストに入っていたら
        ? prev.filter(id => id !== noticeId) // そのIDをリストから削除 (折りたたむ)
        : [...prev, noticeId] // そうでなければ、そのIDをリストに追加 (展開する)
    );
  };

  // ⑥ '詳しく見る'ボタンが押された時の処理
  const handleDetailPress = (notice: NoticeItem) => {
    // タップされたお知らせのターゲットに応じて、対応するタブに切り替える
    if (notice.target === 'personal') {
      setActiveTab('personal');
    } else if (notice.target === 'everyone') {
      setActiveTab('everyone');
    }
    // そして、タップされたそのお知らせだけを展開状態にする (他の展開されていたものは閉じる)
    setExpandedNotices([notice.id]);
  };

  // ⑦ 画面の見た目 (JSX)
  return (
    <View style={styles.container}> {/* 画面全体の土台となるView。背景色がオレンジ色。 */}

      {/* 固定されたタブの表示部分 */}
      <View style={styles.tabContainer}> {/* タブのボタンを横に並べるためのView */}
        {/* 'all'タブのボタン */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]} // スタイル配列: 基本スタイルに、activeTabが'all'ならactiveTabスタイルを追加
          onPress={() => setActiveTab('all')}> {/* ボタンが押されたらactiveTabを'all'に設定 */}
          <View style={styles.tabContent}> {/* タブのテキストと件数バッジを横並びにするためのView */}
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              all {/* タブのテキスト */}
            </Text>
            <View style={[styles.countBadge, activeTab === 'all' && styles.activeCountBadge]}> {/* 件数バッジのView */}
              <Text style={[styles.countText, activeTab === 'all' && styles.activeCountText]}>
                {allCount} {/* 計算した件数（allCount）を表示 */}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 'あなたへ'タブのボタン (上記'all'タブと同様の構造) */}
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

        {/* 'みんなへ'タブのボタン (上記'all'タブと同様の構造) */}
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

      {/* お知らせリストのスクロール表示部分 */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 絞り込まれたお知らせデータ (filteredNotices) を一つずつ繰り返し表示 */}
        {filteredNotices.map(notice => {
          const isExpanded = expandedNotices.includes(notice.id); // このお知らせが現在展開されているか？

          return (
            <View key={notice.id} style={styles.noticeCard}> {/* 各お知らせのカード (白い枠) */}
              {/* 未読の点 */}
              {!notice.isRead && <View style={styles.unreadIndicator} />} {/* isReadがfalse (未読) の場合のみ、未読を示す青い点を表示 */}

              {/* お知らせの内容全体を囲むView */}
              <View style={styles.contentContainer}>
                {/* お知らせのヘッダー (タイトルと日付) */}
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.dateText}>{notice.date}</Text>
                </View>

                {/* お知らせの本文 */}
                <Text
                  style={styles.noticeContent}
                  numberOfLines={isExpanded ? undefined : 2} // 展開されていれば行数制限なし、そうでなければ2行まで表示
                  onPress={() => toggleExpanded(notice.id)}> {/* 本文をタップしても展開・折りたたみ */}
                  {notice.content}
                </Text>

                {/* '詳しく見る'ボタン */}
                {!isExpanded && ( // 展開されていなければ (isExpandedがfalseなら)、ボタンを表示
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleDetailPress(notice)}> {/* ボタンが押されたらhandleDetailPressを実行 */}
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

export default NoticeScreen; // このコンポーネントを他のファイルで使えるようにエクスポート

// コンポーネントの見た目を定義するスタイルシート
const styles = StyleSheet.create({
  container: {
    flex: 1, // 画面全体を使う (利用可能なスペースを全て占める)
    backgroundColor: '#FFF5E6',　// 背景のオレンジ色
  },
  tabContainer: {
    flexDirection: 'row', // 子要素 (タブボタン) を横に並べる
    backgroundColor: 'white',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center', // 子要素を中央に縦方向で揃える
    justifyContent: 'center', // 子要素を中央に横方向で揃える
    // 影を追加してタブコンテナーを浮き上がらせる
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4, // Android用の影
    zIndex: 1, // スクロールコンテンツより上に表示
  },
  tab: {
    flex: 1, // 利用可能なスペースを均等に分割し、各タブが同じ幅になるようにする
    paddingVertical: 12, // 上下の余白
    alignItems: 'center', // タブ内のコンテンツ (テキストとバッジ) を中央に揃える
    borderBottomWidth: 2,
    borderBottomColor: 'transparent', // 非アクティブなタブの下線は透明
  },
  activeTab: {
    borderBottomColor: '#FF8800', // アクティブなタブの下線はオレンジ色
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000', // アクティブなタブのテキストは黒色
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  noticeCard: { // 各お知らせのカード (白い枠)
    backgroundColor: 'white',
    marginBottom: 16, // 下のカードとの間隔
    padding: 24, // カード内の余白
    borderRadius: 8, // 角を丸くする
    flexDirection: 'row', // 子要素 (未読の点と内容) を横に並べる
    position: 'relative', // 未読の点のabsolute配置の基準にする
  },
  contentContainer: { // お知らせのタイトルと本文、ボタンが入るコンテナ
    flex: 1, // 利用可能なスペースを全て占める
    paddingLeft: 20, // 未読の点のための左側の余白
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  unreadIndicator: { // 未読の点 (青い丸)
    position: 'absolute', // 親要素 (noticeCard) を基準に位置を決定
    left: 24, // 親の左端から24px
    top: 32, // 親の上端から32px
    width: 8,
    height: 8,
    borderRadius: 4, // 円形にする
    backgroundColor: '#2196F3', // 青色
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
    lineHeight: 20, // 行の高さ
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#FFD400', // ボタンのオレンジ色
    paddingHorizontal: 16, // 左右のパディング
    paddingVertical: 8, // 上下のパディング
    borderRadius: 4, // 角を丸くする
    alignSelf: 'flex-start', // 親の左側に寄せる
  },
  detailButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: { // 各タブのテキストとバッジを囲むView
    flexDirection: 'row', // テキストとバッジを横並びにする
    alignItems: 'center', // 縦方向で中央揃え
    justifyContent: 'center', // 横方向で中央揃え
  },
  countBadge: { // 件数表示のバッジ (小さい丸い数字の背景)
    backgroundColor: '#ccc', // デフォルトの灰色
    borderRadius: 10, // 円形にする
    paddingHorizontal: 8, // 左右のパディング
    paddingVertical: 2, // 上下のパディング
    marginLeft: 6, // テキストとの間隔
    minWidth: 20, // 最小幅 (数字が1桁でも2桁でも見た目を保つため)
    alignItems: 'center', // 数字を中央に揃える
  },
  activeCountBadge: { // アクティブなタブのバッジの背景色
    backgroundColor: '#FFE8A1', // 明るいオレンジ色
  },
  countText: { // 件数表示の数字のテキスト
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  activeCountText: { // アクティブなタブの件数テキストの色
    color: '#000',
  },
  scrollContent: { // スクロールコンテンツのパディング
    padding: 16,
    paddingBottom: 32, // 最後のカードの下に余白を追加
  },
});
