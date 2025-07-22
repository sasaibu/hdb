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
- **App Store/Google Play**: アプリアップデート
- **iTunes Search API**: App Storeの最新バージョン情報取得（iOS）
- **Google Play In-app updates API / Developer API**: Play Storeの最新バージョン情報取得（Android）

## 1. スプラッシュ画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant Firebase as Firebase Remote Config
    participant AWS as バイタルAWS
    participant Storage as AsyncStorage
    participant Store as App Store/Google Play
    
    App->>Firebase: Firebase設定取得
    Firebase-->>App: アプリ設定情報（最新バージョン含む）
    
    Note over App: バージョンチェック
    alt アプリバージョン < 最新バージョン
        App->>App: アップデート推奨ダイアログ表示
        alt ユーザーが「今すぐ更新」選択
            App->>Store: ストアへ遷移
        else ユーザーが「後で」選択
            App->>App: 処理続行
        end
    end
    
    App->>AWS: デバイス情報登録・更新API
    Note over App,AWS: デバイスID、FCMトークン、アプリバージョン等
    AWS-->>App: ログイン状態、利用権限
    
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
    AWS-->>App: アクセストークン、リフレッシュトークン、ユーザーID、利用権限
    App->>Keychain: トークン保存
```

## 3. トップメニュー（目標画面）

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    participant HDB as HDB（WebView）
    
    App->>DB: バイタルデータ取得（ローカル）
    DB-->>App: 歩数、体重等の最新データ
    App->>DB: 目標設定取得（ローカル）
    DB-->>App: ユーザーが設定した目標情報
    Note over App: 目標達成状況を計算・表示
    
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
    
    Note over App,DB: 画面表示時
    App->>DB: user_profileテーブル取得（ローカル）
    DB-->>App: ニックネーム、アイコン
    
    Note over App,AWS: 更新時
    App->>AWS: マイデータ登録API（新規）
    Note over App,AWS: ニックネーム、アイコン
    AWS-->>App: 更新結果
    App->>DB: user_profileテーブル更新
```

## 7. 目標設定画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant DB as SQLite
    participant AWS as バイタルAWS
    
    Note over App,DB: 目標表示
    App->>DB: goals テーブル取得
    DB-->>App: ユーザーが設定した目標一覧
    
    Note over App,DB: 目標設定・編集
    App->>DB: goals テーブル更新
    Note over DB: 目標タイプ、目標値、期間を保存
    DB-->>App: 保存結果
    
    Note over App,AWS: 目標データ同期
    App->>AWS: 目標設定更新API（新規）
    Note over App,AWS: 目標タイプ、目標値、期間
    AWS-->>App: 更新結果
```

## 8. 通知設定画面

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant Storage as AsyncStorage
    participant AWS as バイタルAWS
    
    Note over App,Storage: 画面表示時
    App->>Storage: 通知設定取得（ローカル）
    Storage-->>App: 通知設定情報
    
    Note over App,AWS: 設定変更時
    App->>Storage: ローカル更新
    App->>AWS: マイデータ登録API
    Note over App,AWS: 通知設定情報を含む
    AWS-->>App: 更新結果
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
    participant WebView as WebView
    participant AWS as バイタルAWS
    participant HDB as HDB
    
    Note over App,AWS: お知らせ画面表示
    App->>AWS: Single Sign On API
    AWS-->>App: お知らせ画面URL
    App->>WebView: WebView表示
    WebView->>HDB: お知らせ一覧表示
    
    Note over WebView,HDB: 既読管理はHDB側で処理
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
    participant WebView as 転籍用WebView
    participant AWS as バイタルAWS
    participant HDB as HDB
    participant DB as SQLite
    participant Storage as AsyncStorage
    
    Note over App,WebView: 転籍画面表示
    App->>AWS: Single Sign On API（転籍用）
    AWS-->>App: 転籍用WebView URL
    App->>WebView: 転籍画面表示
    
    Note over WebView,HDB: 転籍前IDでログイン
    WebView->>HDB: ログイン認証（転籍前ID）
    HDB-->>WebView: 認証成功
    
    Note over HDB,AWS: サーバー側処理
    HDB->>HDB: 転籍前データのUserID更新
    Note over HDB: 転籍前ID → 転籍後IDに更新
    HDB->>AWS: 転籍完了通知
    AWS-->>HDB: 通知受領
    
    Note over WebView,App: リダイレクト処理
    WebView->>App: リダイレクト（ディープリンク）
    Note over App: hdbapp://transfer-complete?oldUserId=XXX&newUserId=YYY
    
    Note over App,DB: 端末側データ移行
    App->>DB: トランザクション開始
    App->>DB: 転籍前ユーザーIDのデータ検索
    DB-->>App: 該当データ一覧
    App->>DB: 全テーブルのuser_idを転籍後IDに更新
    Note over App,DB: users, vital_data, missions等全テーブル
    App->>DB: トランザクションコミット
    
    Note over App,Storage: 移行完了処理
    App->>Storage: 移行完了フラグ保存
    App->>App: ホーム画面へ遷移
    App->>App: 転籍完了メッセージ表示
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

## 14. アプリバージョンチェックフロー

```mermaid
sequenceDiagram
    participant App as HDBアプリ
    participant Firebase as Firebase Remote Config
    participant AWS as バイタルAWS
    participant Store as App Store/Google Play
    participant User as ユーザー
    
    Note over App,Firebase: アプリ起動時
    App->>Firebase: アプリ設定取得要求
    Firebase-->>App: 設定情報
    Note over Firebase,App: latest_version（最新バージョン）
    Note over Firebase,App: update_message（更新メッセージ）
    
    App->>App: 現在のバージョンと比較
    
    alt 現在のバージョン < 最新バージョン
        App->>User: アップデート推奨ダイアログ表示
        Note over App,User: 「新しいバージョンが利用可能です」
        Note over App,User: 「今すぐ更新」「後で」ボタン
        alt ユーザーが「今すぐ更新」選択
            User->>App: 今すぐ更新押下
            App->>Store: ストアアプリを開く
        else ユーザーが「後で」選択
            User->>App: 後で押下
            App->>App: 通常処理続行
        end
    else 現在のバージョン = 最新バージョン
        App->>App: 通常処理続行
    end
    
    Note over App,AWS: バージョン情報をサーバーに送信
    App->>AWS: デバイス情報登録・更新API
    Note over App,AWS: app_version、os_version含む
```

## API関連のポイント

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

5. **バージョン管理**
   - Firebase Remote Config経由で最新バージョンを管理
   - メリット: 柔軟な制御、カスタムメッセージ設定可能
   - デメリット: 手動更新が必要
   - アップデート推奨：最新バージョン未満の場合、更新を推奨（スキップ可能）
   - 常に最新バージョンを保つように促す

6. **不足しているAPI**
   - 更新系API（目標設定）
   - 移行完了通知API（転籍処理）

## 転籍処理の重要ポイント

### 処理フロー
1. **転籍用WebView表示**
   - アプリからSingle Sign On APIで転籍用URLを取得
   - WebView内で転籍前のIDでログイン

2. **サーバー側処理**
   - HDBサーバーで転籍前データのUserIDを転籍後UserIDに更新
   - 更新完了後、転籍完了通知をバイタルAWSへ送信

3. **端末側処理**
   - WebViewからのリダイレクト（ディープリンク）でアプリ側に通知
   - リダイレクトURL例：`hdbapp://transfer-complete?oldUserId=XXX&newUserId=YYY`
   - アプリ内DBの全テーブルのuser_idを一括更新（トランザクション処理）

### 実装上の注意点
- **ディープリンク設定**：iOS/Androidでのカスタムスキーム（hdbapp://）の設定が必要
- **トランザクション処理**：データ整合性を保つため、全テーブルの更新は単一トランザクション内で実行
- **エラーハンドリング**：転籍処理中のエラーに対する適切なリカバリー処理
- **状態管理**：転籍完了フラグをAsyncStorageに保存し、重複処理を防止

### 更新対象テーブル
- users
- vital_data
- missions
- events
- notifications
- linked_services
- その他user_idカラムを持つ全テーブル