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
| **バイタルデータ関連** ||||
| vital_steps | 歩数データ | id, user_id, measured_at, value, source_type, device_name, is_manual, sync_status, synced_at, created_at, updated_at | source_type: healthkit/sensor/manual |
| vital_weight | 体重データ | id, user_id, measured_at, value, body_fat_rate, source_type, is_manual, sync_status, synced_at, created_at, updated_at | 体脂肪率も含む |
| vital_blood_pressure | 血圧データ | id, user_id, measured_at, systolic, diastolic, pulse, source_type, is_manual, sync_status, synced_at, created_at, updated_at | 最高/最低血圧と脈拍 |
| vital_temperature | 体温データ | id, user_id, measured_at, value, source_type, is_manual, sync_status, synced_at, created_at, updated_at | |
| vital_sync_log | 同期ログ | id, table_name, record_id, sync_type, sync_status, error_message, synced_at, created_at | 同期状態の管理 |
| **目標・達成管理** ||||
| user_targets | ユーザー目標値 | user_id, vital_type, target_value, period_type, start_date, end_date, created_at, updated_at | vital_type: steps/weight等 |
| achievement_records | 達成記録 | id, user_id, vital_type, target_value, achieved_value, achievement_rate, achieved_date, created_at | 目標達成履歴 |
| **ミッション・イベント** ||||
| missions | ミッション情報 | id, mission_id, title, description, target_type, target_value, start_date, end_date, reward_points, sync_status, created_at, updated_at | サーバーから取得 |
| user_missions | ユーザーミッション進捗 | user_id, mission_id, current_value, status, completed_at, sync_status, created_at, updated_at | status: active/completed |
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