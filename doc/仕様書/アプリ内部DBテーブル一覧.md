# アプリ内部DBテーブル一覧

## 概要
アプリ内部のデータストレージ構成です。セキュリティレベルに応じて適切なストレージを使い分けます。

### データストレージの使い分け
- **Keychain/Keystore（セキュアストレージ）**: 認証トークン、APIキーなど機密性の高いデータ
- **SQLite（ローカルDB）**: ユーザーデータ、バイタルデータ、設定情報など
- **AsyncStorage**: 通知設定、UI設定など機密性の低い永続データ
- **Firebase Remote Config**: アプリ設定、機能フラグなどの動的設定
- **Firebase Cloud Messaging**: Push通知の配信インフラ（データ保存なし）

## SQLiteテーブル一覧

| テーブル名 | 説明 | 主要カラム | 備考 |
|-----------|------|------------|------|
| **認証・ユーザー関連** ||||
| users | ユーザー認証情報 | user_id, hdb_key, token_expires_at, created_at, updated_at | トークンはKeychainに保存 |
| user_profile | ユーザープロフィール | user_id, nickname, avatar_type, birth_date, gender, height, target_weight, personal_id, created_at, updated_at | マイページ情報 |
| device_info | デバイス情報 | device_id, device_token, platform, app_version, last_sync_at, created_at, updated_at | device_tokenはFCM用 |
| data_sources | データソース情報 | id, user_id, source_name, device_name, source_type, is_active, created_at, updated_at | HealthKit/ヘルスコネクト等のデータソース管理 |
| **バイタルデータ関連** ||||
| vital_data | 統合バイタルデータ | vital_id, user_id, data_source_id, measurement_code, measured_start_at, measured_end_at, value1, value2, value3, is_manual, sync_status, created_at, updated_at | 新ER図に基づく統合テーブル |
| daily_steps | 1日歩数集計 | date, user_id, data_source_id, estimated_steps, manual_steps, sync_status, created_at, updated_at | 歩数の日次集計テーブル |
| daily_heart_rate | 1日心拍数集計 | date, user_id, data_source_id, min_value, max_value, sync_status, created_at, updated_at | 心拍数の日次集計テーブル |
| vital_steps | 歩数データ | id, user_id, measured_at, value, source_type, device_name, is_manual, sync_status, synced_at, created_at, updated_at | 既存互換用（段階的移行） |
| vital_weight | 体重データ | id, user_id, measured_at, value, body_fat_rate, source_type, is_manual, sync_status, synced_at, created_at, updated_at | 体脂肪率も含む |
| vital_blood_pressure | 血圧データ | id, user_id, measured_at, systolic, diastolic, pulse, source_type, is_manual, sync_status, synced_at, created_at, updated_at | 最高/最低血圧と脈拍 |
| vital_temperature | 体温データ | id, user_id, measured_at, value, source_type, is_manual, sync_status, synced_at, created_at, updated_at | |
| measurement_codes | 測定項目コード | code, name, unit, category, is_active, created_at, updated_at | 測定項目のマスターテーブル |
| vital_sync_log | 同期ログ | id, table_name, record_id, sync_type, sync_status, error_message, synced_at, created_at | 同期状態の管理 |
| **目標・達成管理** ||||
| user_targets | ユーザー目標値 | user_id, vital_type, target_value, period_type, start_date, end_date, created_at, updated_at | vital_type: steps/weight等 |
| daily_achievements | 日次達成状況 | user_id, target_id, achievement_date, is_achieved, achieved_value, target_value, created_at, updated_at | 日ごとの達成状況を管理 |
| achievement_summary | 達成サマリー | user_id, target_id, total_count, current_streak, max_streak, last_achieved_at, created_at, updated_at | 継続回数と表示用サマリー |
| achievement_records | 達成記録 | id, user_id, vital_type, target_value, achieved_value, achievement_rate, achieved_date, created_at | 目標達成履歴（既存互換） |
| **通知・お知らせ** ||||
| announcements | お知らせ | id, announcement_id, title, body, category, priority, read_at, created_at | サーバーから取得 |
| notification_settings | 通知設定 | user_id, notification_type, push_enabled, email_enabled, time_from, time_to, created_at, updated_at | 種別ごとの通知設定 |
| notification_history | 通知履歴 | id, user_id, notification_type, title, body, sent_at, read_at, created_at | ローカル通知含む |
| **外部連携** ||||
| external_services | 外部サービス連携 | user_id, service_type, is_connected, auth_token, last_sync_at, created_at, updated_at | service_type: healthkit/health_connect |
| **データ管理** ||||
| backup_metadata | バックアップメタデータ | id, backup_id, password_hash, data_size, expires_at, created_at | バックアップ管理 |
| migration_log | データ移行ログ | id, user_id, source_user_id, migration_type, status, started_at, completed_at, error_message | 転籍データ移行 |
| **キャッシュ** ||||
| ranking_cache | ランキングキャッシュ | id, ranking_type, period_type, rank, user_id, nickname, avatar_type, value, cached_at | 表示用キャッシュ |

## 測定項目コード仕様

新ER図で定義された測定項目コードを以下のように実装：

| コード | 項目名 | 単位 | カテゴリ | 備考 |
|-------|--------|------|---------|------|
| 1000 | 歩数（概算） | 歩 | activity | デバイス自動計測 |
| 1001 | 歩数（手入力） | 歩 | activity | ユーザー手動入力 |
| 1100 | 体重 | kg | body | - |
| 1101 | 体脂肪率 | % | body | - |
| 1200 | 血圧 | mmHg | vital | 収縮期/拡張期をvalue1/value2に格納 |
| 1210 | 心拍数 | bpm | vital | - |
| 1400 | 体温 | ℃ | vital | - |

### 新ER図設計の考慮事項

**統合バイタルデータテーブル（vital_data）の活用**:
- Health ConnectやHealthKitからの複数値データ（血圧等）はvalue1, value2, value3に分散格納
- データソース別の管理によりデバイス混在環境での重複データ制御
- 測定項目コードによる統一的なデータ管理

**日次集計テーブルの導入**:
- daily_stepsとdaily_heart_rateテーブルでパフォーマンス向上
- 複数データソース間での最大値選択ロジック（歩数等）
- バイタルAWSへの送信データ最適化

**データソース管理の強化**:
- data_sourcesテーブルでHealthKit、ヘルスコネクト等を統一管理
- デバイス別、アプリ別のデータ識別
- 転職時のユーザーデータ付け替えサポート

## Firebaseで管理するデータ

### Firebase Remote Config
| 設定項目 | 説明 | 用途 |
|---------|------|------|
| app_config | アプリ全体の設定 | 機能の有効/無効、バージョン管理など |
| feature_flags | 機能フラグ | 特定機能のON/OFF制御 |
| api_endpoints | APIエンドポイント | 環境別API URLの管理 |
| maintenance_info | メンテナンス情報 | メンテナンス時の表示制御 |

### Firebase Cloud Messaging (FCM)
- **用途**: Push通知の配信
- **データ保存**: なし（通知配信のインフラのみ）
- **トークン管理**: device_infoテーブルのdevice_tokenカラムに保存

## データフローとストレージの関係

1. **初期化時（スプラッシュ画面）**:
   - Firebase Remote Config → アプリ設定取得
   - デバイス情報登録・更新API → device_infoテーブル更新

2. **Push通知**:
   - HDB → Push通知対象者連携CSV → バイタルAWS → FCM → アプリ
   - FCMトークンはdevice_infoテーブルで管理

3. **バイタルデータ**:
   - HealthKit/ヘルスコネクト → SQLite（vital_*テーブル） → バイタルAWS
   - 全てローカルDBで管理、Firebaseには保存しない

## 目標達成管理の詳細仕様

### 日次達成状況の管理
目標達成は**日ごとの達成状況**と**継続回数の表示**を分離して管理します。

#### 例：7/1から目標設定した場合
```
設定日: 7/1
7/1 未達成 (is_achieved: false)
7/2 未達成 (is_achieved: false)  
7/3 達成   (is_achieved: true)   ← 1回目
7/4 達成   (is_achieved: true)   ← 2回目
7/5 未達成 (is_achieved: false)
7/6 達成   (is_achieved: true)   ← 3回目
7/7 達成   (is_achieved: true)   ← 4回目 (本日分Done)
```

#### テーブル設計のポイント
- **daily_achievements**: 各日の達成状況を個別に記録
- **achievement_summary**: 継続回数や最大連続記録を集計管理
- **表示ロジック**: 「○回目」「Done」は達成済み日数をカウント
- **継続性分析**: 日次データから連続達成日数や達成パターンを分析可能

#### 画面表示例
```
目標: 1日8000歩
達成状況: 4回目 Done ✓
継続記録: 最大2日連続
```

## Keychain/Keystoreで管理するデータ

| データ種別 | キー名 | 説明 | 備考 |
|-----------|-------|------|------|
| access_token | hdb_access_token | HDB APIアクセストークン | JWT形式 |
| refresh_token | hdb_refresh_token | トークンリフレッシュ用 | 長期保存 |
| api_key | vital_aws_api_key | バイタルAWS APIキー | 環境別 |
| client_secret | hdb_client_secret | OAuth2クライアントシークレット | 認証用 |
| backup_password | backup_password_temp | バックアップ一時パスワード | 機種変更時のみ |

### セキュリティ考慮事項
- Keychainは生体認証（Face ID/Touch ID/指紋）と連携可能
- アプリ削除時にKeychainデータも削除される設定を推奨
- トークンの有効期限はusersテーブルで管理し、実際のトークン値はKeychainに保存

## AsyncStorageで管理するデータ

| データ種別 | キー名 | 説明 | 備考 |
|-----------|-------|------|------|
| notification_settings | user_notification_prefs | 通知設定のON/OFF | JSON形式 |
| ui_preferences | user_ui_prefs | テーマ、言語設定など | JSON形式 |
| last_sync_time | last_vital_sync | 最終同期時刻 | ISO 8601形式 |
| tutorial_completed | tutorial_status | チュートリアル完了フラグ | boolean |
| selected_health_service | health_service_type | HealthKit/ヘルスコネクト選択 | string |