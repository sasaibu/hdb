# 画面別API通信図

### 外部システム一覧
- **バイタルAWS**: HDBアプリ専用のバックエンドAPI
- **HDB**: 既存のHDBシステム（WebView経由でアクセス）
- **Firebase Remote Config**: アプリ設定の動的管理
- **Firebase Cloud Messaging (FCM)**: Push通知配信
- **HealthKit/ヘルスコネクト**: 端末のヘルスデータ取得
- **Keychain/Keystore**: セキュアなトークン保存
- **AsyncStorage**: アプリ設定の永続化
- **iCloud/Google Drive**: バックアップデータ保存

## 1. スプラッシュ画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant Firebase as Firebase Remote Config
    participant AWS as バイタルAWS
    
    App->>Firebase: Firebase設定取得
    Firebase-->>App: アプリ設定情報
    App->>AWS: デバイス情報登録・更新API
    Note over App,AWS: デバイスID、FCMトークン等
    AWS-->>App: ログイン状態、利用権限、ミッション情報
```

## 2. ログイン画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant AWS as バイタルAWS
    participant HDB as HDB
    participant Keychain as Keychain/Keystore
    
    App->>AWS: ログインAPI
    Note over App,AWS: クライアントID、デバイスID
    AWS->>HDB: ログイン認証API（既存）
    HDB-->>AWS: 認証結果
    AWS-->>App: 認可コード、ステート
    App->>AWS: トークン取得API
    AWS-->>App: アクセストークン、リフレッシュトークン
    App->>Keychain: トークン保存
```

## 3. トップメニュー（ダッシュボード）

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    participant HDB as HDB（WebView）
    
    App->>DB: バイタルデータ取得（ローカル）
    DB-->>App: 歩数、体重等の最新データ
    App->>AWS: 歩数ランキング取得API（不足）
    AWS-->>App: ランキングデータ
    App->>DB: ランキングキャッシュ保存
    
    Note over App,HDB: WebView表示時
    App->>AWS: Single Sign On API
    AWS-->>App: HDB画面URL
    App->>HDB: WebView表示
```

## 4. バイタルデータ表示画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant Health as HealthKit/ヘルスコネクト
    participant AWS as バイタルAWS
    participant FCM as Firebase Cloud Messaging
    
    Note over App,Health: データ取得フロー
    App->>Health: バイタルデータ取得要求
    Health-->>App: 歩数、体重、血圧等
    App->>DB: データ保存（sync_status=未同期）
    
    Note over App,AWS: データ同期フロー（1時間ごと）
    App->>DB: 未同期データ取得
    App->>AWS: Healthデータ登録API
    AWS-->>App: 登録結果
    App->>DB: sync_status更新
    
    Note over FCM,App: 目標達成時の通知
    FCM->>App: Push通知（目標達成おめでとう）
```

## 5. バイタル入力ダイアログ

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    
    User->>App: 手動データ入力
    App->>DB: データ保存（is_manual=true）
    Note over App,DB: sync_status=未同期
    
    Note over App,AWS: 次回同期タイミング
    App->>AWS: Healthデータ登録API
    AWS-->>App: 登録結果
```

## 6. マイページ画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    participant Storage as AsyncStorage
    
    Note over App,AWS: 画面表示時
    App->>AWS: マイページ情報取得API（不足）
    AWS-->>App: ニックネーム、アイコン、目標情報
    App->>DB: user_profileテーブル更新
    
    Note over App,AWS: 更新時
    App->>AWS: マイデータ登録API（既存）
    Note over App,AWS: ニックネーム、アイコン、目標設定
    AWS-->>App: 更新結果
```

## 7. ミッション画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    
    Note over App,AWS: 初回表示時
    App->>AWS: デバイス情報登録・更新API
    AWS-->>App: ミッション情報（概要）
    
    Note over App,AWS: 詳細表示時
    App->>AWS: ミッション詳細取得API（不足）
    AWS-->>App: ミッション詳細情報
    App->>DB: missionsテーブル更新
    
    Note over App,AWS: 進捗更新時
    App->>AWS: ミッション進捗更新API（不足）
    AWS-->>App: 更新結果
```

## 8. 通知設定画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant Storage as AsyncStorage
    participant AWS as バイタルAWS
    
    Note over App,AWS: 画面表示時
    App->>AWS: 通知設定取得API（不足）
    AWS-->>App: 通知設定情報
    App->>Storage: ローカル保存
    
    Note over App,AWS: 設定変更時
    App->>AWS: 通知設定更新API（不足）
    AWS-->>App: 更新結果
    App->>Storage: ローカル更新
```

## 9. 連携サービス画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant Health as HealthKit/ヘルスコネクト
    participant Storage as AsyncStorage
    
    Note over App,Health: 連携ON時
    App->>Health: 認証要求
    Health-->>App: 認証結果
    App->>DB: external_servicesテーブル更新
    App->>Storage: 連携状態保存
    
    Note over App,Health: 連携OFF時
    App->>Health: 認証解除
    App->>DB: external_servicesテーブル更新
```

## 10. お知らせ画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    
    App->>AWS: お知らせ一覧取得API（不足）
    AWS-->>App: お知らせリスト
    App->>DB: announcementsテーブル保存
    
    Note over App,AWS: 既読更新時
    App->>AWS: お知らせ既読更新API（不足）
    AWS-->>App: 更新結果
    App->>DB: read_at更新
```

## 11. DBバックアップ・リストア画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    participant Cloud as iCloud/Google Drive
    
    Note over App,AWS: バックアップ時
    App->>DB: 全データ取得
    App->>AWS: アプリDBバックアップAPI（既存）
    AWS-->>App: パスワード、有効期限
    App->>Cloud: バックアップデータ保存
    
    Note over App,AWS: リストア時
    App->>AWS: アプリDBリストアAPI（既存）
    Note over App,AWS: パスワード認証
    AWS-->>App: リストアデータ
    App->>DB: データ復元
```

## 12. 転籍データ移行画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant AWS as バイタルAWS
    participant HDB as HDB
    participant DB as SQLite
    
    Note over App,AWS: 転籍ログイン
    App->>AWS: 転籍用ログインAPI（既存）
    AWS->>HDB: ログイン認証API（転籍用）
    HDB-->>AWS: 認証結果
    AWS-->>App: 転籍前ユーザーID
    
    Note over App,AWS: データ移行
    App->>AWS: 移行データ取得API（既存）
    AWS-->>App: 移行データ（CSV形式）
    App->>DB: データ保存
    
    Note over App,AWS: 進捗確認
    App->>AWS: 移行進捗確認API（不足）
    AWS-->>App: 移行状態
```

## 13. Push通知受信フロー

```mermaid
sequenceDiagram
    participant HDB as HDB
    participant AWS as バイタルAWS
    participant FCM as Firebase Cloud Messaging
    participant App as HDBアプリ
    participant DB as SQLite
    
    HDB->>AWS: Push通知対象者連携CSV
    AWS->>FCM: 通知送信要求
    FCM->>App: Push通知配信
    App->>DB: notification_historyテーブル保存
    App->>App: 通知表示
```

## API通信の特徴

1. **バイタルデータ**
   - 取得：HealthKit/ヘルスコネクト → アプリ内DB
   - 送信：アプリ内DB → バイタルAWS（Healthデータ登録API）
   - サーバーからの取得は不要（アプリ内DBで完結）

2. **認証・セキュリティ**
   - トークンはKeychain/Keystoreに保存
   - WebView表示時はSingle Sign On APIを使用

3. **同期管理**
   - sync_statusフラグで未同期データを管理
   - 1時間ごとにバッチ同期

4. **キャッシュ戦略**
   - ランキングデータはローカルキャッシュ
   - 通知設定はAsyncStorageに保存

5. **不足しているAPI**
   - 各種取得系API（マイページ、ミッション、通知設定、お知らせ、ランキング）
   - 更新系API（ミッション進捗、通知設定、お知らせ既読）
   - 状態確認API（認証状態、移行進捗）