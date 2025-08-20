# Health Connect & HealthKit データ仕様書（HDB版）

## 1. バイタルデータ一覧

### 1.1 歩数データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 歩数 | count | Long | value | Double |
| 開始時刻 | startTime | Instant | startDate | Date |
| 終了時刻 | endTime | Instant | endDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

### 1.2 体重データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体重 | weight | Mass | value | Double |
| 単位 | - | kg固定 | unit | HKUnit |
| 測定時刻 | time | Instant | startDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

### 1.3 体温データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体温 | temperature | Temperature | value | Double |
| 単位 | - | ℃固定 | unit | HKUnit |
| 測定部位 | measurementLocation | Int | bodySiteLocation | HKBodyTemperatureSensorLocation |
| 測定時刻 | time | Instant | startDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

### 1.4 血圧データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 収縮期血圧 | systolic | Pressure | systolicValue | Double |
| 拡張期血圧 | diastolic | Pressure | diastolicValue | Double |
| 単位 | - | mmHg固定 | systolicUnit/diastolicUnit | HKUnit |
| 測定姿勢 | bodyPosition | Int | - | - |
| 測定部位 | measurementLocation | Int | - | - |
| 測定時刻 | time | Instant | startDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

### 1.5 心拍数データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 心拍数サンプル | samples | List<HeartRateSample> | value | Double |
| 心拍数(BPM) | beatsPerMinute | Long | - | - |
| 単位 | - | bpm固定 | unit | HKUnit |
| 測定時刻 | time | Instant | startDate | Date |
| 開始時刻 | startTime | Instant | startDate | Date |
| 終了時刻 | endTime | Instant | endDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

### 1.6 体脂肪率データ

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体脂肪率 | percentage | Percentage | value | Double |
| 単位 | - | %固定 | unit | HKUnit |
| 測定時刻 | time | Instant | startDate | Date |
| メタデータ | metadata | Metadata | metadata | HKMetadata |

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
| source | TEXT | "manual" | データソース（manual/healthkit/healthconnect） |
| sync_status | TEXT | "pending" | 同期ステータス（pending/synced） |
| synced_at | DATETIME | "2025-01-06 11:00:00" | 同期日時 |

### 2.2 データタイプマッピング

| 日本語名 | 英語名 | 測定項目コード | 単位 | Android型 | iOS型 |
|----------|--------|---------------|------|-----------|-------|
| 歩数 | steps | 1000 | 歩 | Steps | HKQuantityType(.stepCount) |
| 体重 | weight | 1100 | kg | Weight | HKQuantityType(.bodyMass) |
| 体脂肪率 | bodyFat | 1101 | % | BodyFat | HKQuantityType(.bodyFatPercentage) |
| 体温 | temperature | 1400 | ℃ | BodyTemperature | HKQuantityType(.bodyTemperature) |
| 血圧 | bloodPressure | 1200 | mmHg | BloodPressure | HKCorrelationType(.bloodPressure) |
| 心拍数 | heartRate | 1210 | bpm | HeartRate | HKQuantityType(.heartRate) |
| 脈拍 | pulse | 1210 | bpm | HeartRate | HKQuantityType(.heartRate) |

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

| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| レコードID | id | String | UUID | String |
| データ提供元 | dataOrigin | DataOrigin | source | HKSource |
| パッケージ名 | packageName | String | bundleIdentifier | String |
| 最終更新時刻 | lastModifiedTime | Instant | endDate | Date |
| クライアントID | clientRecordId | String? | externalUUID | String? |
| バージョン | clientRecordVersion | Long | version | Int |
| デバイス情報 | device | Device? | device | HKDevice? |
| メーカー | manufacturer | String? | manufacturer | String? |
| モデル | model | String? | model | String? |
| デバイス種別 | type | Int | deviceType | HKDeviceType |

**デバイス種別**
- Android: 1=スマホ、2=スマートウォッチ、3=体重計・血圧計
- iOS: .phone=スマホ、.watch=Apple Watch、.unknown=その他

## 4. データ単位と定数

### 4.1 測定単位

| 単位タイプ | Android | iOS | 説明 | サンプル値 |
|-----------|---------|-----|------|------------|
| 歩数 | count | count | 歩 | 8543 |
| 質量 | Mass (kg) | HKUnit.gramUnit(with: .kilo) | キログラム | 65.5 |
| 温度 | Temperature (℃) | HKUnit.degreeCelsius() | 摂氏 | 36.5 |
| 圧力 | Pressure (mmHg) | HKUnit.millimeterOfMercury() | 水銀柱ミリメートル | 120 |
| 心拍 | beatsPerMinute | HKUnit.count().unitDivided(by: .minute()) | 1分あたりの拍動 | 72 |
| パーセント | Percentage (%) | HKUnit.percent() | パーセント | 22.5 |

### 4.2 定数値

| カテゴリ | Android定数名 | Android値 | iOS定数名 | iOS値 |
|----------|--------------|-----------|-----------|-------|
| **測定姿勢** | | | | |
| 立位 | STANDING | 1 | - | - |
| 座位 | SITTING | 2 | - | - |
| 仰臥位 | LYING_DOWN | 3 | - | - |
| **測定部位（血圧）** | | | | |
| 左腕 | LEFT_ARM | 1 | - | - |
| 右腕 | RIGHT_ARM | 2 | - | - |
| **測定部位（体温）** | | | | |
| 口腔 | ORAL | 1 | .mouth | 1 |
| 腋窩 | AXILLARY | 2 | .armpit | 2 |
| **デバイスタイプ** | | | | |
| スマートフォン | PHONE | 1 | .phone | - |
| スマートウォッチ | WATCH | 2 | .watch | - |
| 体重計・血圧計 | SCALE | 3 | .unknown | - |
| **データソース** | | | | |
| 手動入力 | MANUAL | "manual" | - | "manual" |
| iOS HealthKit | - | - | HEALTHKIT | "healthkit" |
| Health Connect | HEALTH_CONNECT | "healthconnect" | - | - |

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

### 6.1 必要な権限

| データカテゴリ | Android読み取り権限 | Android書き込み権限 | iOS権限 |
|--------------|-------------------|-------------------|---------|
| 歩数 | android.permission.health.READ_STEPS | android.permission.health.WRITE_STEPS | HKQuantityType.stepCount |
| 体重 | android.permission.health.READ_WEIGHT | android.permission.health.WRITE_WEIGHT | HKQuantityType.bodyMass |
| 体脂肪率 | android.permission.health.READ_BODY_FAT | android.permission.health.WRITE_BODY_FAT | HKQuantityType.bodyFatPercentage |
| 体温 | android.permission.health.READ_BODY_TEMPERATURE | android.permission.health.WRITE_BODY_TEMPERATURE | HKQuantityType.bodyTemperature |
| 血圧 | android.permission.health.READ_BLOOD_PRESSURE | android.permission.health.WRITE_BLOOD_PRESSURE | HKCorrelationType.bloodPressure |
| 心拍数 | android.permission.health.READ_HEART_RATE | android.permission.health.WRITE_HEART_RATE | HKQuantityType.heartRate |

**iOS追加設定**
- Info.plistに使用目的記述が必要
  - NSHealthShareUsageDescription: 読み取り権限の説明
  - NSHealthUpdateUsageDescription: 書き込み権限の説明

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

## 8. 実装上の注意事項

### 8.1 データ取得時の考慮事項

- **権限の確認**: 各データタイプごとに個別の権限が必要
- **データの可用性**: デバイスやアプリによって利用可能なデータタイプが異なる
- **血圧データの扱い**: systolicとdiastolicは必ずセットで保存
- **心拍数の集計**: 1日の最小値・最大値を別テーブルで管理
- **同期ステータス**: pending→syncedの状態管理が必要

### 8.2 プラットフォーム固有の考慮事項

**Android (Health Connect)**
- Android 9 (API 28) 以上が必要
- Google Play ストアから Health Connect アプリのインストールが必要
- Content Provider経由でのデータアクセス
- パッケージ名: com.google.android.apps.healthdata

**iOS (HealthKit)**
- iOS 8.0以上が必要
- HealthKit.frameworkのリンクが必要
- バックグラウンドでのデータ更新に制限あり
- Apple Watchとの自動同期対応

### 8.3 データソースの優先順位

1. Health Connect（Android）/ HealthKit（iOS）
2. 手動入力

### 8.4 プライバシーとセキュリティ

- **データの暗号化**: AES-256による保存時暗号化
- **ユーザー同意**: 明示的なユーザー同意が必要
- **データ保持期間**: デフォルトで過去1年間
- **アクセスログ**: vital_dataテーブルへのアクセスログ記録

### 8.5 データ形式の違いへの対応

| 項目 | Android | iOS | 変換方法 |
|------|---------|-----|----------|
| 時刻 | Instant (UTC) | Date (ローカル) | TimeZone変換が必要 |
| 単位 | enum値 | HKUnit | マッピングテーブル使用 |
| 精度 | Long/Double | Double | 型変換時の精度注意 |
| 体脂肪率 | Percentage (0-100) | Double (0-1) | iOS値は100倍する |

---

**文書バージョン**: 1.1  
**最終更新日**: 2025年8月20日  
**対応バージョン**:
- Android: Health Connect API v1.1.0
- iOS: HealthKit (iOS 8.0+)  
**対象アプリ**: HDB（Health Data Bank）