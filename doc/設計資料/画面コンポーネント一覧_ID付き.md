画面コンポーネント一覧（ID付き）

このドキュメントは、HDBアプリの画面コンポーネントにID体系を適用した一覧です。

ID体系の説明

ID形式: {カテゴリプレフィックス}{連番3桁}
カテゴリプレフィックス:
AUTH: 認証関連画面
HOME: ホームメイン画面
VITAL: バイタルデータ関連画面
MENU: メニュー設定画面
INFO: 情報静的ページ画面
SYS: システムその他画面

画面コンポーネント一覧

認証関連画面 (AUTH)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| AUTH001 | SplashScreen | スプラッシュ画面 | SplashScreen.tsx | アプリ起動時の初期画面 |
| AUTH002 | LoginScreen | ログイン画面 | LoginScreen.tsx | ユーザー認証画面 |
| AUTH003 | LogoutScreen | ログアウト画面 | LogoutScreen.tsx | ログアウト確認ダイアログ |
| AUTH004 | DataMigrationLoginScreen | 転籍ログイン画面 | DataMigrationLoginScreen.tsx | 転籍用ログイン画面 |
| AUTH005 | DataMigrationScreen | 転籍データ移行画面 | DataMigrationScreen.tsx | 転籍時のデータ移行画面 |
| AUTH006 | HealthcareDataMigrationScreen | 医療データ移行画面 | HealthcareDataMigrationScreen.tsx | 医療データ移行処理画面 |
| AUTH007 | EmailInputScreen | メールアドレス入力画面 | EmailInputScreen.tsx | メールアドレス登録画面 |

ホームメイン画面 (HOME)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| HOME001 | HomeScreen | ホーム画面 | HomeScreen.tsx | メインダッシュボード画面 |
| HOME002 | MainTabScreen | メインタブ画面 | MainTabScreen.tsx | タブナビゲーション画面 |
| HOME003 | WebViewScreen | 汎用WebView画面 | WebViewScreen.tsx | WebView表示画面 |

バイタルデータ関連画面 (VITAL)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| VITAL001 | VitalDataScreen | バイタルデータ表示画面 | VitalDataScreen.tsx | 本日のバイタルデータ表示 |
| VITAL002 | VitalListScreen | バイタル一覧画面 | VitalListScreen.tsx | 全バイタルデータ一覧 |
| VITAL003 | VitalDetailScreen | バイタル詳細画面 | VitalDetailScreen.tsx | バイタルデータ詳細表示 |
| VITAL004 | VitalChartScreen | バイタルグラフ画面 | VitalChartScreen.tsx | バイタルデータグラフ表示 |
| VITAL005 | RecordScreen | 記録画面 | RecordScreen.tsx | データ記録・入力画面 |
| VITAL006 | RealHealthDataScreen | 実健康データ画面 | RealHealthDataScreen.tsx | 実際の健康データ表示 |

健診チェック関連画面 (HEALTH)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| HEALTH001 | HealthCheckScreen | 健診画面 | HealthCheckScreen.tsx | 健診データ表示画面 |
| HEALTH002 | HealthCheckupScreen | 健康診断画面 | HealthCheckupScreen.tsx | 健康診断結果画面 |
| HEALTH003 | HealthCheckupDetailScreen | 健診詳細画面 | HealthCheckupDetailScreen.tsx | 健診データ詳細 |
| HEALTH004 | HealthCheckPlaceholderScreen | 健診プレースホルダー画面 | HealthCheckPlaceholderScreen.tsx | 健診データ未登録時の画面 |
| HEALTH005 | DiseasePredictionScreen | 疾病予測画面 | DiseasePredictionScreen.tsx | 疾病予測グラフ表示 |

アンケートサーベイ関連画面 (SURVEY)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| SURVEY001 | PulseSurveyScreen | パルスサーベイ画面 | PulseSurveyScreen.tsx | パルスサーベイ回答画面 |
| SURVEY002 | PulseSurveyListScreen | パルスサーベイ一覧画面 | PulseSurveyListScreen.tsx | パルスサーベイ一覧 |
| SURVEY003 | PulseSurveyResultScreen | パルスサーベイ結果画面 | PulseSurveyResultScreen.tsx | サーベイ結果表示 |
| SURVEY004 | PulseSurveyPlaceholderScreen | パルスサーベイプレースホルダー画面 | PulseSurveyPlaceholderScreen.tsx | サーベイ未実施時の画面 |
| SURVEY005 | StressCheckScreen | ストレスチェック画面 | StressCheckScreen.tsx | ストレスチェック回答 |
| SURVEY006 | StressCheckAnswerScreen | ストレスチェック回答画面 | StressCheckAnswerScreen.tsx | ストレスチェック入力 |
| SURVEY007 | StressCheckResultScreen | ストレスチェック結果画面 | StressCheckResultScreen.tsx | ストレスチェック結果 |

目標ミッション関連画面 (GOAL)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| GOAL001 | GoalSettingScreen | 目標設定画面 | GoalSettingScreen.tsx | 健康目標設定画面 |
| GOAL002 | GoalInputScreen | 目標入力画面 | GoalInputScreen.tsx | 目標値入力画面 |
| GOAL003 | GoalDetailScreen | 目標詳細画面 | GoalDetailScreen.tsx | 目標詳細表示画面 |
| GOAL004 | GoalConfirmationScreen | 目標確認画面 | GoalConfirmationScreen.tsx | 目標設定確認画面 |
| GOAL005 | GoalContinuationScreen | 目標継続画面 | GoalContinuationScreen.tsx | 目標継続設定画面 |
| GOAL006 | GoalExamplesScreen | 目標例画面 | GoalExamplesScreen.tsx | 目標設定例表示画面 |
| GOAL007 | GoalNotificationScreen | 目標通知画面 | GoalNotificationScreen.tsx | 目標関連通知設定 |
| GOAL008 | DoneScreen | 完了画面 | DoneScreen.tsx | タスク完了画面 |

イベントポイント関連画面 (EVENT)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| EVENT001 | EventScreen | イベント画面 | EventScreen.tsx | イベント情報表示画面 |
| EVENT002 | PointsScreen | ポイント画面 | PointsScreen.tsx | ポイント管理画面 |
| EVENT003 | PointsExchangeScreen | ポイント交換画面 | PointsExchangeScreen.tsx | ポイント交換処理画面 |
| EVENT004 | PersonalRankingScreen | 個人ランキング画面 | PersonalRankingScreen.tsx | 個人成績ランキング表示 |

メニュー設定画面 (MENU)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| MENU001 | MyPageScreen | マイページ画面 | MyPageScreen.tsx | ユーザープロフィール画面 |
| MENU002 | NicknameInputScreen | ニックネーム入力画面 | NicknameInputScreen.tsx | ニックネーム設定画面 |
| MENU003 | LinkedServicesSettingsScreen | 連携サービス設定画面 | LinkedServicesSettingsScreen.tsx | 外部サービス連携設定 |
| MENU004 | NotificationSettingsScreen | 通知設定画面 | NotificationSettingsScreen.tsx | プッシュ通知設定 |
| MENU005 | NotificationHistoryScreen | 通知履歴画面 | NotificationHistoryScreen.tsx | 通知履歴表示 |
| MENU006 | SecuritySettingsScreen | セキュリティ設定画面 | SecuritySettingsScreen.tsx | セキュリティ関連設定 |
| MENU007 | BackupScreen | バックアップ画面 | BackupScreen.tsx | データバックアップ画面 |
| MENU008 | RestoreScreen | リストア画面 | RestoreScreen.tsx | データ復元画面 |

情報静的ページ画面 (INFO)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| INFO001 | NoticeScreen | お知らせ画面 | NoticeScreen.tsx | お知らせ一覧表示 |
| INFO002 | FAQScreen | よくある質問画面 | FAQScreen.tsx | FAQ表示画面 |
| INFO003 | HowToUseScreen | 使い方画面 | HowToUseScreen.tsx | アプリ使用方法説明 |
| INFO004 | TermsScreen | 利用規約画面 | TermsScreen.tsx | 利用規約表示 |
| INFO005 | ServiceTermsScreen | サービス利用規約画面 | ServiceTermsScreen.tsx | サービス規約表示 |
| INFO006 | PrivacyPolicyScreen | プライバシーポリシー画面 | PrivacyPolicyScreen.tsx | プライバシーポリシー表示 |
| INFO007 | OpenSourceLicensesScreen | オープンソースライセンス画面 | OpenSourceLicensesScreen.tsx | OSS ライセンス表示 |
| INFO008 | DataDeletionScreen | データ削除について画面 | DataDeletionScreen.tsx | データ削除に関する説明 |

システムその他画面 (SYS)
| ID | コンポーネント名 | 画面名 | ファイル名 | 説明 |
|---|---|---|---|---|
| SYS001 | DatabaseTestScreen | データベーステスト画面 | DatabaseTestScreen.tsx | DB動作確認画面 |
| SYS002 | TimingInputScreen | タイミング入力画面 | TimingInputScreen.tsx | データ入力タイミング設定 |
| SYS003 | TimingDetailScreen | タイミング詳細画面 | TimingDetailScreen.tsx | タイミング設定詳細 |

ID割り当ての原則

1. 機能別分類: 画面の主要機能に基づいてカテゴリを決定
2. 連番管理: カテゴリ内で001から連番でID割り当て
3. 拡張性: 新しい画面追加時は該当カテゴリの次の番号を使用
4. 一意性: すべてのIDは一意であり、重複しない
5. 可読性: IDから画面の機能分類が判別可能

更新履歴

| 日付 | 更新者 | 更新内容 |
|---|---|---|
| 2025-08-18 | Claude | 初版作成、既存画面コンポーネントへのID付与 |
