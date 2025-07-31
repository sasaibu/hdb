# アプリ内部DB ER図

```mermaid
erDiagram
    users["ユーザー (users)"] {
        string user_id PK "ユーザーID"
        string hdb_key "HDBキー"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
    
    data_sources["データソース (data_sources)"] {
        int id PK "データソースID"
        string user_id FK "ユーザーID"
        string source_name "ソース名"
        string device_name "デバイス名"
        string source_type "ソース種別"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
    
    measurement_codes["測定項目コード (measurement_codes)"] {
        int code PK "項目コード"
        string name "項目名"
        string unit "単位"
        string category "カテゴリ"
        boolean is_active "有効フラグ"
    }
    
    vital_data["バイタルデータ (vital_data)"] {
        string vital_id PK "バイタルID"
        string user_id FK "ユーザーID"
        int data_source_id FK "データソースID"
        int measurement_code FK "測定項目コード"
        datetime measured_start_at "測定開始日時"
        datetime measured_end_at "測定終了日時"
        float value1 "測定値1"
        float value2 "測定値2"
        float value3 "測定値3"
        boolean is_manual "手入力フラグ"
        string sync_status "同期ステータス"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
    
    daily_steps["日次歩数 (daily_steps)"] {
        date date PK "日付"
        string user_id FK "ユーザーID"
        int data_source_id FK "データソースID"
        int estimated_steps "推定歩数"
        int manual_steps "手入力歩数"
        string sync_status "同期ステータス"
        datetime created_at "作成日時"
    }
    
    daily_heart_rate["日次心拍 (daily_heart_rate)"] {
        date date PK "日付"
        string user_id FK "ユーザーID"
        int data_source_id FK "データソースID"
        int min_value "最小値"
        int max_value "最大値"
        string sync_status "同期ステータス"
        datetime created_at "作成日時"
    }
    
    user_targets["ユーザー目標 (user_targets)"] {
        int target_id PK "目標ID"
        string user_id FK "ユーザーID"
        string vital_type "バイタル種別"
        float target_value "目標値"
        string period_type "期間種別"
        date start_date "開始日"
        date end_date "終了日"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
    
    daily_achievements["日次達成状況 (daily_achievements)"] {
        string user_id FK "ユーザーID"
        int target_id FK "目標ID"
        date achievement_date PK "達成日"
        boolean is_achieved "達成フラグ"
        float achieved_value "達成値"
        float target_value "目標値"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
    
    achievement_summary["達成サマリー (achievement_summary)"] {
        string user_id FK "ユーザーID"
        int target_id FK "目標ID"
        int total_count "総達成回数"
        int current_streak "現在の連続記録"
        int max_streak "最大連続記録"
        datetime last_achieved_at "最終達成日時"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    %% リレーションシップ
    users ||--o{ data_sources : "1対多"
    users ||--o{ vital_data : "1対多"
    users ||--o{ daily_steps : "1対多"
    users ||--o{ daily_heart_rate : "1対多"
    users ||--o{ user_targets : "1対多"
    users ||--o{ daily_achievements : "1対多"
    users ||--o{ achievement_summary : "1対多"
    
    data_sources ||--o{ vital_data : "1対多"
    data_sources ||--o{ daily_steps : "1対多"
    data_sources ||--o{ daily_heart_rate : "1対多"
    measurement_codes ||--o{ vital_data : "1対多"
    
    user_targets ||--o{ daily_achievements : "1対多"
    user_targets ||--o{ achievement_summary : "1対多"
```

## コアテーブル説明

### ユーザー管理
- **users**: ユーザーの基本認証情報（HDBキー含む）

### バイタルデータ管理
- **data_sources**: データソース情報（HealthKit、ヘルスコネクト、手入力等）
- **measurement_codes**: 測定項目コードマスター（1000:歩数、1100:体重、1200:血圧等）
- **vital_data**: 統合バイタルデータ（全測定項目を統一管理）
- **daily_steps**: 1日の歩数集計データ（パフォーマンス最適化）
- **daily_heart_rate**: 1日の心拍数集計データ（パフォーマンス最適化）

### 目標管理
- **user_targets**: ユーザーが設定する個人目標（自分で入力）
- **daily_achievements**: 日ごとの目標達成状況を詳細管理
- **achievement_summary**: 達成回数や連続記録のサマリー情報

## 設計思想

### シンプルな統合データ管理
- **vital_data**: 全バイタルデータを測定項目コードで統一管理
- **measurement_codes**: コード体系による拡張性確保
- **data_sources**: デバイス・アプリ別データソース管理

### パフォーマンス最適化
- **daily_steps/daily_heart_rate**: 日次集計テーブルで高速データ取得
- 複数データソース間での最大値選択ロジック

### 多値データ対応
- **value1/value2/value3**: 血圧（収縮期/拡張期）等の複数値データを効率格納
- Health Connect/HealthKitからの複合データに対応

### 測定項目コード一覧
| コード | 項目名 | 単位 | 格納方法 |
|-------|--------|------|----------|
| 1000 | 歩数（概算） | 歩 | value1 |
| 1001 | 歩数（手入力） | 歩 | value1 |
| 1100 | 体重 | kg | value1 |
| 1101 | 体脂肪率 | % | value1 |
| 1200 | 血圧 | mmHg | value1:収縮期, value2:拡張期 |
| 1210 | 心拍数 | bpm | value1 |
| 1400 | 体温 | ℃ | value1 |