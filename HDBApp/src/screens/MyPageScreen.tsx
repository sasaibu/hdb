import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  MainDrawerParamList,
  RootStackParamList,
} from '../navigation/AppNavigator';
import ProfileEditModal from '../components/ProfileEditModal';
import theme from '../styles/theme';

const {width} = Dimensions.get('window');

type MyPageScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<MainDrawerParamList, 'MyPage'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MyPageScreenNavigationProp;
}

interface UserProfile {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  showNickname: boolean;
  goals: Goal[];
  supportComment?: string;
}

interface Goal {
  id: string;
  type: 'steps' | 'weight' | 'exercise';
  target: number;
  current: number;
  unit: string;
  achieved: boolean;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function MyPageScreen({navigation}: Props) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '田中 太郎',
    email: 'tanaka@example.com',
    age: 35,
    height: 170,
    weight: 65,
    showNickname: true,
    goals: [
      {
        id: '1',
        type: 'steps',
        target: 10000,
        current: 7500,
        unit: '歩',
        achieved: false,
      },
      {
        id: '2',
        type: 'weight',
        target: 60,
        current: 65,
        unit: 'kg',
        achieved: false,
      },
    ],
    supportComment: 'がんばって健康管理を続けましょう！',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  // アニメーション用の値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 入場アニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleProfileSave = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setModalVisible(false);
    Alert.alert('成功', 'プロフィールを更新しました。');
  };

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        {text: 'キャンセル', style: 'cancel'},
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: () => {
            // 退場アニメーション
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              // ログアウト時はLogin画面に戻る
              navigation.getParent()?.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
            });
          },
        },
      ]
    );
  };

  const settingsData: SettingItem[] = [
    {
      id: 'notifications',
      title: '通知設定',
      subtitle: 'プッシュ通知の受信設定',
      icon: '🔔',
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'darkMode',
      title: 'ダークモード',
      subtitle: '画面の表示テーマ',
      icon: '🌙',
      type: 'toggle',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: 'biometric',
      title: '生体認証',
      subtitle: '指紋・顔認証でのログイン',
      icon: '🔐',
      type: 'toggle',
      value: biometric,
      onToggle: setBiometric,
    },
    {
      id: 'backup',
      title: 'データバックアップ',
      subtitle: 'クラウドへのデータ保存',
      icon: '☁️',
      type: 'navigation',
      onPress: () => navigation.navigate('Backup'),
    },
    {
      id: 'privacy',
      title: 'プライバシー設定',
      subtitle: 'データ共有とプライバシー',
      icon: '🛡️',
      type: 'navigation',
      onPress: () => Alert.alert('開発中', 'この機能は開発中です。'),
    },
    {
      id: 'help',
      title: 'ヘルプ・サポート',
      subtitle: 'よくある質問とお問い合わせ',
      icon: '❓',
      type: 'navigation',
      onPress: () => Alert.alert('開発中', 'この機能は開発中です。'),
    },
    {
      id: 'about',
      title: 'アプリについて',
      subtitle: 'バージョン情報と利用規約',
      icon: 'ℹ️',
      type: 'navigation',
      onPress: () => Alert.alert('HDB v1.0.0', 'Health Data Bank\n© 2025 HDB Team'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{item.icon}</Text>
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: theme.colors.gray[300],
              true: theme.colors.primary[200],
            }}
            thumbColor={
              item.value ? theme.colors.primary[500] : theme.colors.gray[400]
            }
          />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* プロフィールヘッダー */}
          <View style={styles.profileHeader}>
            <View style={styles.profileBackground}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
            </View>
            
            <View style={styles.profileContent}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
              
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.editProfileButtonText}>
                  ✨ プロフィール編集
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ニックネーム表示設定 */}
          <View style={styles.nicknameSection}>
            <Text style={styles.sectionTitle}>👤 ニックネーム設定</Text>
            <View style={styles.nicknameContainer}>
              <View style={styles.nicknameRow}>
                <View style={styles.nicknameInfo}>
                  <Text style={styles.nicknameLabel}>ニックネーム表示</Text>
                  <Text style={styles.nicknameSubtitle}>
                    他のユーザーにニックネームを表示する
                  </Text>
                </View>
                <Switch
                  value={profile.showNickname}
                  onValueChange={(value) => 
                    setProfile(prev => ({...prev, showNickname: value}))
                  }
                  trackColor={{
                    false: theme.colors.gray[300],
                    true: theme.colors.primary[200],
                  }}
                  thumbColor={
                    profile.showNickname ? theme.colors.primary[500] : theme.colors.gray[400]
                  }
                />
              </View>
              {profile.showNickname && (
                <View style={styles.nicknamePreview}>
                  <Text style={styles.nicknamePreviewLabel}>表示名:</Text>
                  <Text style={styles.nicknamePreviewText}>{profile.name}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 目標設定セクション */}
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>🎯 目標設定</Text>
            <View style={styles.goalsContainer}>
              {profile.goals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalType}>
                        {goal.type === 'steps' ? '👣 歩数' : 
                         goal.type === 'weight' ? '⚖️ 体重' : '💪 運動'}
                      </Text>
                      <Text style={styles.goalTarget}>
                        目標: {goal.target.toLocaleString()}{goal.unit}
                      </Text>
                    </View>
                    <View style={styles.goalStatus}>
                      <Text style={[
                        styles.goalStatusText,
                        {color: goal.achieved ? theme.colors.success : theme.colors.warning}
                      ]}>
                        {goal.achieved ? '達成' : '未達成'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.goalProgress}>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                            backgroundColor: goal.achieved ? theme.colors.success : theme.colors.primary[500]
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.goalProgressText}>
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}{goal.unit}
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity 
                style={styles.addGoalButton}
                onPress={() => Alert.alert('開発中', '目標追加機能は開発中です。')}
              >
                <Text style={styles.addGoalButtonText}>+ 新しい目標を追加</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 応援コメント表示エリア */}
          {profile.supportComment && (
            <View style={styles.supportSection}>
              <Text style={styles.sectionTitle}>💬 応援メッセージ</Text>
              <View style={styles.supportContainer}>
                <View style={styles.supportIcon}>
                  <Text style={styles.supportIconText}>🌟</Text>
                </View>
                <Text style={styles.supportComment}>{profile.supportComment}</Text>
              </View>
            </View>
          )}

          {/* 健康データサマリー */}
          <View style={styles.healthSummary}>
            <Text style={styles.sectionTitle}>📊 健康データサマリー</Text>
            <View style={styles.healthStats}>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatIcon}>📏</Text>
                <Text style={styles.healthStatValue}>{profile.height}</Text>
                <Text style={styles.healthStatLabel}>身長 (cm)</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatIcon}>⚖️</Text>
                <Text style={styles.healthStatValue}>{profile.weight}</Text>
                <Text style={styles.healthStatLabel}>体重 (kg)</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatIcon}>🎂</Text>
                <Text style={styles.healthStatValue}>{profile.age}</Text>
                <Text style={styles.healthStatLabel}>年齢 (歳)</Text>
              </View>
              <View style={styles.healthStatItem}>
                <Text style={styles.healthStatIcon}>💪</Text>
                <Text style={styles.healthStatValue}>
                  {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                </Text>
                <Text style={styles.healthStatLabel}>BMI</Text>
              </View>
            </View>
          </View>

          {/* 設定セクション */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>⚙️ 設定</Text>
            <View style={styles.settingsContainer}>
              {settingsData.map(renderSettingItem)}
            </View>
          </View>

          {/* アクションセクション */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 ログアウト</Text>
            </TouchableOpacity>
          </View>

          {/* フッター */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              HDB - Health Data Bank{'\n'}
              あなたの健康を、データで支える
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <ProfileEditModal
        visible={modalVisible}
        user={{ nickname: profile.name }}
        onSave={(data: any) => {
          // プロフィール更新処理
          const updatedProfile = {
            ...profile,
            name: data.nickname || profile.name,
          };
          handleProfileSave(updatedProfile);
        }}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 24,
  },
  profileBackground: {
    height: 200,
    backgroundColor: theme.colors.primary[500],
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary[400],
    opacity: 0.3,
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary[600],
    opacity: 0.2,
    bottom: -30,
    left: -30,
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.background.primary,
    ...theme.shadow.lg,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent[400],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  editIcon: {
    fontSize: 14,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 20,
  },
  editProfileButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    ...theme.shadow.md,
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  healthSummary: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  healthStats: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...theme.shadow.md,
  },
  healthStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  healthStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  healthStatLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  settingsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  settingsContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 24,
    color: theme.colors.text.tertiary,
    fontWeight: '300',
  },
  actionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  // ニックネーム設定スタイル
  nicknameSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  nicknameContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadow.md,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nicknameInfo: {
    flex: 1,
    marginRight: 16,
  },
  nicknameLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  nicknameSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  nicknamePreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknamePreviewLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  nicknamePreviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary[600],
  },
  // 目標設定スタイル
  goalsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  goalsContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadow.md,
  },
  goalItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  goalStatusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  goalProgress: {
    marginTop: 8,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  addGoalButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary[300],
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addGoalButtonText: {
    fontSize: 14,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  // 応援コメントスタイル
  supportSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  supportContainer: {
    backgroundColor: theme.colors.accent[50],
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent[400],
    ...theme.shadow.sm,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportIconText: {
    fontSize: 20,
  },
  supportComment: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
