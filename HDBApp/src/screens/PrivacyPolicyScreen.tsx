import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { height: screenHeight } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = screenHeight * 0.50;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const PrivacyPolicyScreen: React.FC = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fixedScrollY = useRef(new Animated.Value(HEADER_SCROLL_DISTANCE)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const currentScrollValue = useRef(0);
  const isAnimating = useRef(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // scrollYの値を追跡
  scrollY.addListener(({ value }) => {
    currentScrollValue.current = value;
  });

  // 画面がフォーカスされた時に初期状態にリセット
  useFocusEffect(
    React.useCallback(() => {
      // 画面に入った時に初期状態にリセット
      setHeaderCollapsed(false);
      setShowShareMenu(false);
      scrollY.setValue(0);
      fixedScrollY.setValue(HEADER_SCROLL_DISTANCE);
      currentScrollValue.current = 0;
      isAnimating.current = false;
      // ScrollViewを最上部にスクロール
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [scrollY, fixedScrollY])
  );

  // アニメーション値を選択（ヘッダーが縮小している場合は固定値を使用）
  const animatedValue = headerCollapsed && !isAnimating.current ? fixedScrollY : scrollY;

  // ヘッダーの高さアニメーション
  const headerHeight = animatedValue.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // コンテンツコンテナの位置（ヘッダーに追従して移動）
  const contentTransform = animatedValue.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // タイトルの透明度
  const titleOpacity = animatedValue.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // パンくずリストの透明度
  const breadcrumbOpacity = animatedValue.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // ボタンの透明度
  const buttonOpacity = animatedValue.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // PanResponderを使用してスワイプジェスチャーを処理
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !headerCollapsed,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 上方向のスワイプかつヘッダーが未縮小の場合のみ反応
        return gestureState.dy < -5 && !headerCollapsed;
      },
      onPanResponderGrant: () => {
        // ジェスチャー開始時の処理
        // 現在の値を取得して、アニメーションの開始点を明確にする
        scrollY.setOffset(currentScrollValue.current);
        scrollY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // 上スワイプの場合のみヘッダーを縮小
        if (gestureState.dy < 0) {
          const newValue = Math.min(Math.max(-gestureState.dy, 0), HEADER_SCROLL_DISTANCE);
          scrollY.setValue(-gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // スワイプを離した時の処理
        scrollY.flattenOffset();
        const currentValue = currentScrollValue.current;

        // 上スワイプで、かつ以下のどちらかの条件を満たす場合、ヘッダーを完全に縮小するアニメーションを開始
        // 1. 現在のスクロール値が、ヘッダー縮小距離の半分を超えている (currentValue > HEADER_SCROLL_DISTANCE / 2)
        // 2. 指を離す速度が非常に速い (gestureState.vy < -0.5)
        if (gestureState.dy < 0 && (currentValue > HEADER_SCROLL_DISTANCE / 2 || gestureState.vy < -0.5)) {
          isAnimating.current = true;
          Animated.spring(scrollY, {
            toValue: HEADER_SCROLL_DISTANCE,
            useNativeDriver: false,
            tension: 50,
            friction: 10,
          }).start(() => {
            setHeaderCollapsed(true);
            // ヘッダー縮小完了時にscrollYの値を固定
            scrollY.setValue(HEADER_SCROLL_DISTANCE);
            isAnimating.current = false;
          });
        } else if (!headerCollapsed) {
          // ヘッダーが縮小していない場合のみ元に戻す
          isAnimating.current = true;
          Animated.spring(scrollY, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 10,
          }).start(() => {
            isAnimating.current = false;
          });
        }
      },
    })
  ).current;

  const handleSearch = () => {
    console.log('検索アイコンがクリックされました');
  };

  const handleMail = () => {
    console.log('メールアイコンがクリックされました');
  };

  const handleMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'ヘルスデータバンク - プライバシーポリシー\nhttps://example.com/privacy-policy',
        title: 'プライバシーポリシーを共有',
      });
    } catch (error) {
      Alert.alert('エラー', '共有に失敗しました');
    }
    setShowShareMenu(false);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        {/* ヘッダートップバー */}
        <View style={styles.topBar}>
          {/* ロゴ */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          </View>

          {/* アイコンコンテナ */}
          <View style={styles.iconsWrapper}>
            <View style={styles.iconsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={handleSearch}>
                <Text style={styles.iconText}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleMail}>
                <Text style={styles.iconText}>✉️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleMenu}>
                <Text style={styles.iconText}>☰</Text>
              </TouchableOpacity>
            </View>
            {/* 共有ボタン */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareIcon}>📤</Text>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>


        <Animated.Text style={[styles.breadcrumb, { opacity: breadcrumbOpacity }]}>
          ホーム　>　インフォメーション
        </Animated.Text>
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          プライバシーポリシー
        </Animated.Text>
        <Animated.View style={{ opacity: buttonOpacity }}>
          <TouchableOpacity onPress={() => console.log('お問い合わせがクリックされました')}>
            <Text style={styles.contactText}>お問い合わせ →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.scrollContainer,
          {
            top: contentTransform,
          }
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={headerCollapsed}
          showsVerticalScrollIndicator={headerCollapsed}
          bounces={false}
          {...(!headerCollapsed ? panResponder.panHandlers : {})}
        >
          {!headerCollapsed && (
            <View style={styles.swipeHint}>
              <Text style={styles.swipeHintText}>↑ 上にスワイプして表示領域を拡大</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>1. 個人情報の取り扱いについて</Text>
          <Text style={styles.content}>
            当社は、お客様の個人情報を適切に管理し、法令に基づき適正に取り扱います。
            個人情報の収集、利用、提供について、以下のとおり定めます。
          </Text>

          <Text style={styles.sectionTitle}>2. 個人情報の収集について</Text>
          <Text style={styles.content}>
            当社は、サービスの提供にあたり、お客様から以下の個人情報を収集することがあります。
            {'\n'}・氏名、住所、電話番号、メールアドレス
            {'\n'}・健康に関する情報
            {'\n'}・その他サービス提供に必要な情報
          </Text>

          <Text style={styles.sectionTitle}>3. 個人情報の利用目的</Text>
          <Text style={styles.content}>
            収集した個人情報は、以下の目的で利用いたします。
            {'\n'}・サービスの提供および運営
            {'\n'}・お客様への連絡、通知
            {'\n'}・サービスの品質向上および新サービスの開発
            {'\n'}・法令に基づく対応
          </Text>

          <Text style={styles.sectionTitle}>4. 個人情報の第三者提供</Text>
          <Text style={styles.content}>
            当社は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。
            {'\n'}・お客様の同意がある場合
            {'\n'}・法令に基づく場合
            {'\n'}・人の生命、身体または財産の保護のために必要がある場合
          </Text>

          <Text style={styles.sectionTitle}>5. 個人情報の管理</Text>
          <Text style={styles.content}>
            当社は、個人情報の正確性を保ち、安全に管理するため、以下の措置を講じます。
            {'\n'}・セキュリティシステムの維持、管理
            {'\n'}・従業員への教育、啓発
            {'\n'}・個人情報への不正アクセス、紛失、破損、改ざん、漏洩などの防止
          </Text>

          <Text style={styles.sectionTitle}>6. お問い合わせ</Text>
          <Text style={styles.content}>
            個人情報の取り扱いに関するお問い合わせは、以下の窓口までご連絡ください。
            {'\n'}
            {'\n'}株式会社ヘルスデータバンク
            {'\n'}個人情報保護管理者
            {'\n'}メール: privacy@healthdatabank.jp
            {'\n'}電話: 03-XXXX-XXXX
          </Text>

          <Text style={styles.sectionTitle}>7. プライバシーポリシーの変更</Text>
          <Text style={styles.content}>
            当社は、必要に応じて本プライバシーポリシーを変更することがあります。
            変更した場合は、アプリ内でお知らせいたします。
          </Text>

          <Text style={styles.lastUpdated}>最終更新日: 2024年1月18日</Text>
        </ScrollView>
      </Animated.View>

      {/* シェアメニュー（最前面に表示） */}
      {showShareMenu && (
        <View style={styles.shareMenu}>
          <TouchableOpacity style={styles.shareMenuItem} onPress={handleShare}>
            <Text style={styles.shareMenuText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#040d26',
    paddingTop: 100,
    paddingBottom: 30,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 10,
    overflow: 'hidden',
  },
  breadcrumb: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  swipeHint: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  swipeHintText: {
    fontSize: 16,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
  },
  content: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999999',
    marginTop: 30,
    textAlign: 'center',
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
  },
  logoContainer: {
    flex: 1,
    marginTop: 10,
  },
  logoPlaceholder: {
    width: 160,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#040d26',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconsWrapper: {
    alignItems: 'flex-end',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 12,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingRight: 8,
  },
  shareIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginRight: 4,
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shareMenu: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  shareMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  shareMenuText: {
    color: '#040d26',
    fontSize: 16,
  },
});

export default PrivacyPolicyScreen;