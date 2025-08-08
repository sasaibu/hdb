# Health Connect データ仕様書（HDB版）

## 1. バイタルデータ一覧

### 1.1 歩数データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **Steps** | 歩数 | | | 歩行による歩数データ |
| count | 歩数 | Long | 8543 | 計測期間中の総歩数 |
| startTime | 開始時刻 | Instant | 2025-01-06T00:00:00Z | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 2025-01-06T23:59:59Z | 計測終了時刻 |
| metadata | メタデータ | Metadata | {id: "step_001", dataOrigin: "com.google.fit"} | データ提供元などの付加情報 |

### 1.2 体重データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **Weight** | 体重 | | | 体重測定データ |
| weight | 体重 | Mass | 65.5 | キログラム単位の体重 |
| time | 測定時刻 | Instant | 2025-01-06T06:00:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "wt_001", device: {type: 3, model: "Withings Body+"}} | データ提供元などの付加情報 |

### 1.3 体温データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **BodyTemperature** | 体温 | | | 体温測定データ |
| temperature | 体温 | Temperature | 36.5 | 摂氏の体温 |
| measurementLocation | 測定部位 | Int | 2 | 測定部位（1=口腔、2=腋窩） |
| time | 測定時刻 | Instant | 2025-01-06T07:30:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "temp_001", dataOrigin: "com.thermometer.app"} | データ提供元などの付加情報 |

### 1.4 血圧データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **BloodPressure** | 血圧 | | | 血圧測定データ |
| systolic | 収縮期血圧 | Pressure | 120 | 最高血圧（mmHg） |
| diastolic | 拡張期血圧 | Pressure | 80 | 最低血圧（mmHg） |
| bodyPosition | 測定姿勢 | Int | 2 | 測定時の体位（1=立位、2=座位、3=仰臥位） |
| measurementLocation | 測定部位 | Int | 1 | 測定箇所（1=左腕、2=右腕） |
| time | 測定時刻 | Instant | 2025-01-06T07:00:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "bp_001", device: {type: 3, model: "OMRON HEM-7281T"}} | データ提供元などの付加情報 |

### 1.5 心拍数データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **HeartRate** | 心拍数 | | | 心拍数の時系列データ |
| samples | サンプル | List<Sample> | [{time: "2025-01-06T10:00:00Z", beatsPerMinute: 72}] | 心拍数測定値のリスト |
| samples.time | 測定時刻 | Instant | 2025-01-06T10:00:00Z | 個別測定時刻 |
| samples.beatsPerMinute | 心拍数 | Long | 72 | 1分あたりの心拍数(BPM) |
| startTime | 開始時刻 | Instant | 2025-01-06T10:00:00Z | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 2025-01-06T10:05:00Z | 計測終了時刻 |
| metadata | メタデータ | Metadata | {id: "hr_001", device: {type: 2, model: "Galaxy Watch5"}} | データ提供元などの付加情報 |

### 1.6 体脂肪率データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **BodyFat** | 体脂肪率 | | | 体脂肪率測定データ |
| percentage | 体脂肪率 | Percentage | 22.5 | パーセント単位の体脂肪率 |
| time | 測定時刻 | Instant | 2025-01-06T06:00:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "bf_001", device: {type: 3, model: "TANITA BC-768"}} | データ提供元などの付加情報 |

### 1.7 血糖値データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **BloodGlucose** | 血糖値 | | | 血糖値測定データ |
| level | 血糖値 | BloodGlucose | 95 | mg/dL単位の血糖値 |
| specimenSource | 採血部位 | Int | 1 | 血液採取部位（1=指先） |
| mealType | 食事タイプ | Int | 1 | 朝食=1、昼食=2、夕食=3 |
| relationToMeal | 食事タイミング | Int | 1 | 食前=1、食後=2 |
| time | 測定時刻 | Instant | 2025-01-06T06:45:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "bg_001", dataOrigin: "com.glucometer.app"} | データ提供元などの付加情報 |

### 1.8 血中酸素飽和度データ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **OxygenSaturation** | 血中酸素飽和度 | | | SpO2測定データ |
| percentage | 飽和度 | Percentage | 98.5 | パーセント単位のSpO2値 |
| time | 測定時刻 | Instant | 2025-01-06T10:30:00Z | 測定時刻 |
| metadata | メタデータ | Metadata | {id: "spo2_001", device: {type: 2, model: "Apple Watch"}} | データ提供元などの付加情報 |

## 2. HDBアプリ内部データ構造

### 2.1 データベーステーブル（vital_data）

| カラム名 | 型 | サンプル値 | 説明 |
|----------|-----|------------|------|
| id | INTEGER | 1 | 主キー（自動採番） |
| type | TEXT | "歩数" | データタイプ（日本語） |
| value | REAL | 8543 | 測定値 |
| unit | TEXT | "歩" | 単位 |
| systolic | INTEGER | 120 | 収縮期血圧（血圧の場合のみ） |
| diastolic | INTEGER | 80 | 拡張期血圧（血圧の場合のみ） |
| recorded_date | TEXT | "2025-01-06" | 記録日（YYYY-MM-DD形式） |
| created_at | DATETIME | "2025-01-06 10:00:00" | 作成日時 |
| source | TEXT | "manual" | データソース（manual/healthkit/googlefit） |
| sync_status | TEXT | "pending" | 同期ステータス（pending/synced） |
| synced_at | DATETIME | "2025-01-06 11:00:00" | 同期日時 |

### 2.2 データタイプマッピング

| 日本語名 | 英語名 | 測定項目コード | 単位 | Health Connect型 |
|----------|--------|---------------|------|-----------------|
| 歩数 | steps | 1000 | 歩 | Steps |
| 体重 | weight | 1100 | kg | Weight |
| 体脂肪率 | bodyFat | 1101 | % | BodyFat |
| 体温 | temperature | 1400 | ℃ | BodyTemperature |
| 血圧 | bloodPressure | 1200 | mmHg | BloodPressure |
| 心拍数 | heartRate | 1210 | bpm | HeartRate |
| 脈拍 | pulse | 1210 | bpm | HeartRate |
| 血糖値 | glucose | - | mg/dL | BloodGlucose |
| 血中酸素飽和度 | oxygen | - | % | OxygenSaturation |

### 2.3 1日の心拍データテーブル（daily_heart_rate）

| カラム名 | 型 | サンプル値 | 説明 |
|----------|-----|------------|------|
| date | TEXT | "2025-01-06" | 日付（主キー） |
| user_no | INTEGER | 1 | ユーザー番号（主キー） |
| data_source_no | INTEGER | 1 | データソース番号（主キー） |
| min_value | INTEGER | 58 | 最小心拍数 |
| max_value | INTEGER | 95 | 最大心拍数 |
| sync_status | TEXT | "pending" | 同期ステータス |
| synced_at | DATETIME | null | 同期日時 |
| created_at | DATETIME | "2025-01-06 23:59:59" | 作成日時 |

## 3. メタデータ構造

### 3.1 共通メタデータ

| 物理名 | 日本語名 | データ型 | サンプル値 | 説明 |
|--------|----------|----------|------------|------|
| **Metadata** | メタデータ | | | 全データタイプ共通の付加情報 |
| id | レコードID | String | "rec_20250106_001" | 一意のレコード識別子 |
| dataOrigin | データ提供元 | DataOrigin | {packageName: "com.google.android.apps.fitness"} | データの提供元情報 |
| dataOrigin.packageName | パッケージ名 | String | "com.google.android.apps.fitness" | 提供元アプリのパッケージ名 |
| lastModifiedTime | 最終更新時刻 | Instant | 2025-01-06T10:30:00Z | データの最終更新時刻 |
| clientRecordId | クライアントID | String? | "client_001" | クライアント側の識別子 |
| clientRecordVersion | バージョン | Long | 1 | クライアント側のバージョン番号 |
| device | デバイス情報 | Device? | {manufacturer: "Samsung", model: "Galaxy S23", type: 1} | 測定デバイスの情報 |
| device.manufacturer | メーカー | String? | "Samsung" | デバイス製造元 |
| device.model | モデル | String? | "Galaxy S23" | デバイスモデル名 |
| device.type | デバイス種別 | Int | 1 | 1=スマホ、2=スマートウォッチ、3=体重計・血圧計 |

## 4. データ単位と定数

### 4.1 測定単位

| 単位タイプ | 物理名 | 説明 | サンプル値 | 使用例 |
|------------|--------|------|------------|--------|
| 歩数 | count | 歩 | 8543 | 歩数 |
| 質量 | Mass | キログラム(kg) | 65.5 | 体重 |
| 温度 | Temperature | 摂氏(℃) | 36.5 | 体温 |
| 圧力 | Pressure | 水銀柱ミリメートル(mmHg) | 120 | 血圧 |
| 心拍 | beatsPerMinute | 1分あたりの拍動(bpm) | 72 | 心拍数、脈拍 |
| パーセント | Percentage | パーセント(%) | 22.5 | 体脂肪率、SpO2 |
| 血糖 | BloodGlucose | mg/dL | 95 | 血糖値 |

### 4.2 定数値

| カテゴリ | 定数名 | 値 | 説明 |
|----------|--------|-----|------|
| 測定姿勢 | STANDING | 1 | 立位 |
| | SITTING | 2 | 座位 |
| | LYING_DOWN | 3 | 仰臥位 |
| 測定部位（血圧） | LEFT_ARM | 1 | 左腕 |
| | RIGHT_ARM | 2 | 右腕 |
| 測定部位（体温） | ORAL | 1 | 口腔 |
| | AXILLARY | 2 | 腋窩 |
| 測定部位（血糖） | FINGERTIP | 1 | 指先 |
| 食事タイプ | BREAKFAST | 1 | 朝食 |
| | LUNCH | 2 | 昼食 |
| | DINNER | 3 | 夕食 |
| 食事タイミング | BEFORE_MEAL | 1 | 食前 |
| | AFTER_MEAL | 2 | 食後 |
| デバイスタイプ | PHONE | 1 | スマートフォン |
| | WATCH | 2 | スマートウォッチ |
| | SCALE | 3 | 体重計・体組成計・血圧計 |
| データソース | MANUAL | "manual" | 手動入力 |
| | HEALTHKIT | "healthkit" | iOS HealthKit |
| | GOOGLEFIT | "googlefit" | Google Fit |
| | HEALTH_CONNECT | "healthconnect" | Health Connect |

## 5. API連携

### 5.1 測定項目コード（HDB API）

| 測定項目コード | 項目名 | 単位 | 備考 |
|---------------|--------|------|------|
| 1000 | 歩数 | 歩 | 1日の総歩数 |
| 1100 | 体重 | kg | 小数第1位まで |
| 1101 | 体脂肪率 | % | 小数第1位まで |
| 1200 | 血圧 | mmHg | 収縮期/拡張期 |
| 1210 | 心拍数・脈拍 | bpm | 心拍数と脈拍は同一コード |
| 1400 | 体温 | ℃ | 小数第1位まで |

### 5.2 APIデータ形式

```json
{
  "measurementItemCode": "1200",
  "measurementItemName": "血圧",
  "value1": 120,        // 収縮期血圧
  "value2": 80,         // 拡張期血圧
  "unit": "mmHg",
  "measurementDate": "2025-01-06",
  "measurementTime": "07:00:00",
  "dataSourceNo": 1
}
```

## 6. 権限とアクセス制御

### 6.1 必要な権限（Android Health Connect）

| データカテゴリ | 読み取り権限 | 書き込み権限 |
|---------------|-------------|-------------|
| 歩数 | android.permission.health.READ_STEPS | android.permission.health.WRITE_STEPS |
| 体重 | android.permission.health.READ_WEIGHT | android.permission.health.WRITE_WEIGHT |
| 体脂肪率 | android.permission.health.READ_BODY_FAT | android.permission.health.WRITE_BODY_FAT |
| 体温 | android.permission.health.READ_BODY_TEMPERATURE | android.permission.health.WRITE_BODY_TEMPERATURE |
| 血圧 | android.permission.health.READ_BLOOD_PRESSURE | android.permission.health.WRITE_BLOOD_PRESSURE |
| 心拍数 | android.permission.health.READ_HEART_RATE | android.permission.health.WRITE_HEART_RATE |
| 血糖値 | android.permission.health.READ_BLOOD_GLUCOSE | android.permission.health.WRITE_BLOOD_GLUCOSE |
| SpO2 | android.permission.health.READ_OXYGEN_SATURATION | android.permission.health.WRITE_OXYGEN_SATURATION |

## 7. バリデーションルール

### 7.1 値の有効範囲

| データタイプ | 最小値 | 最大値 | 備考 |
|-------------|--------|--------|------|
| 歩数 | 0 | 100000 | 1日の上限 |
| 体重 | 20 | 300 | kg単位 |
| 体脂肪率 | 3 | 60 | %単位 |
| 体温 | 34.0 | 42.0 | ℃単位 |
| 収縮期血圧 | 50 | 250 | mmHg単位 |
| 拡張期血圧 | 30 | 150 | mmHg単位、収縮期より小さい |
| 心拍数 | 30 | 200 | bpm単位 |
| 血糖値 | 20 | 600 | mg/dL単位 |
| SpO2 | 70 | 100 | %単位 |

## 8. 実装上の注意事項

### 8.1 データ取得時の考慮事項

1. **権限の確認**: 各データタイプごとに個別の権限が必要
2. **データの可用性**: デバイスやアプリによって利用可能なデータタイプが異なる
3. **血圧データの扱い**: systolicとdiastolicは必ずセットで保存
4. **心拍数の集計**: 1日の最小値・最大値を別テーブルで管理
5. **同期ステータス**: pending→syncedの状態管理が必要

### 8.2 データソースの優先順位

1. Health Connect（Android）
2. HealthKit（iOS）
3. 手動入力

### 8.3 プライバシーとセキュリティ

1. **データの暗号化**: AES-256による保存時暗号化
2. **ユーザー同意**: 明示的なユーザー同意が必要
3. **データ保持期間**: デフォルトで過去1年間
4. **アクセスログ**: vital_dataテーブルへのアクセスログ記録

---
*文書バージョン: 1.0*  
*最終更新日: 2025年1月*  
*対応バージョン: Health Connect API v1.1.0*  
*対象アプリ: HDB（Health Data Bank）*