# Health Connect 完全データ仕様書

## 注意事項
⚠️ **先ほどのサンプルは推測に基づくもので、実際のHealth Connect APIとは異なる可能性があります**

## 実際のHealth Connect データタイプ（2024年1月時点）

Health Connectは50種類以上のデータタイプをサポートしています。以下が実際に取得可能なデータです：

### 1. アクティビティ系データ

#### Steps（歩数）
```kotlin
// 実際のフィールド
- count: Long // 歩数
- startTime: Instant
- endTime: Instant
- startZoneOffset: ZoneOffset?
- endZoneOffset: ZoneOffset?
- metadata: Metadata
```

#### Distance（距離）
```kotlin
- distance: Length // メートル単位
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### TotalCaloriesBurned（総消費カロリー）
```kotlin
- energy: Energy // kcal単位
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### ActiveCaloriesBurned（活動消費カロリー）
```kotlin
- energy: Energy
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### FloorsClimbed（階段上昇数）
```kotlin
- floors: Double
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### Speed（速度）
```kotlin
- samples: List<Sample>
  - time: Instant
  - speed: Velocity // m/s
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### Power（パワー）
```kotlin
- samples: List<Sample>
  - time: Instant
  - power: Power // ワット
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

### 2. バイタル系データ

#### HeartRate（心拍数）
```kotlin
- samples: List<Sample>
  - time: Instant
  - beatsPerMinute: Long
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### BloodPressure（血圧）
```kotlin
- systolic: Pressure // mmHg
- diastolic: Pressure // mmHg
- bodyPosition: Int // 測定時の姿勢
- measurementLocation: Int // 測定部位
- time: Instant
- zoneOffset: ZoneOffset?
- metadata: Metadata
```

#### BloodGlucose（血糖値）
```kotlin
- level: BloodGlucose // mmol/L or mg/dL
- specimenSource: Int // 血液採取部位
- mealType: Int // 食事タイミング
- relationToMeal: Int // 食事との関係
- time: Instant
- metadata: Metadata
```

#### OxygenSaturation（血中酸素飽和度）
```kotlin
- percentage: Percentage // SpO2 %
- time: Instant
- metadata: Metadata
```

#### BodyTemperature（体温）
```kotlin
- temperature: Temperature // 摂氏/華氏
- measurementLocation: Int // 測定部位
- time: Instant
- metadata: Metadata
```

#### BasalMetabolicRate（基礎代謝率）
```kotlin
- basalMetabolicRate: Power // kcal/day
- time: Instant
- metadata: Metadata
```

#### RestingHeartRate（安静時心拍数）
```kotlin
- beatsPerMinute: Long
- time: Instant
- metadata: Metadata
```

#### HeartRateVariability（心拍変動）
```kotlin
- heartRateVariabilityMillis: Double // RMSSD
- time: Instant
- metadata: Metadata
```

#### RespiratoryRate（呼吸数）
```kotlin
- rate: Double // 呼吸/分
- time: Instant
- metadata: Metadata
```

### 3. 身体測定系データ

#### Weight（体重）
```kotlin
- weight: Mass // kg
- time: Instant
- metadata: Metadata
```

#### Height（身長）
```kotlin
- height: Length // メートル
- time: Instant
- metadata: Metadata
```

#### BodyFat（体脂肪率）
```kotlin
- percentage: Percentage
- time: Instant
- metadata: Metadata
```

#### BoneMass（骨量）
```kotlin
- mass: Mass // kg
- time: Instant
- metadata: Metadata
```

#### LeanBodyMass（除脂肪体重）
```kotlin
- mass: Mass // kg
- time: Instant
- metadata: Metadata
```

#### BasalBodyTemperature（基礎体温）
```kotlin
- temperature: Temperature
- time: Instant
- metadata: Metadata
```

### 4. 栄養系データ

#### Nutrition（栄養）
```kotlin
- biotin: Mass? // μg
- caffeine: Mass? // mg
- calcium: Mass? // mg
- energy: Energy? // kcal
- energyFromFat: Energy? // kcal
- chloride: Mass? // mg
- cholesterol: Mass? // mg
- chromium: Mass? // μg
- copper: Mass? // mg
- dietaryFiber: Mass? // g
- folate: Mass? // μg
- folicAcid: Mass? // μg
- iodine: Mass? // μg
- iron: Mass? // mg
- magnesium: Mass? // mg
- manganese: Mass? // mg
- molybdenum: Mass? // μg
- monounsaturatedFat: Mass? // g
- niacin: Mass? // mg
- pantothenicAcid: Mass? // mg
- phosphorus: Mass? // mg
- polyunsaturatedFat: Mass? // g
- potassium: Mass? // mg
- protein: Mass? // g
- riboflavin: Mass? // mg
- saturatedFat: Mass? // g
- selenium: Mass? // μg
- sodium: Mass? // mg
- sugar: Mass? // g
- thiamin: Mass? // mg
- totalCarbohydrate: Mass? // g
- totalFat: Mass? // g
- transFat: Mass? // g
- unsaturatedFat: Mass? // g
- vitaminA: Mass? // IU
- vitaminB12: Mass? // μg
- vitaminB6: Mass? // mg
- vitaminC: Mass? // mg
- vitaminD: Mass? // μg
- vitaminE: Mass? // mg
- vitaminK: Mass? // μg
- zinc: Mass? // mg
- name: String? // 食品名
- mealType: Int // 食事タイプ
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### Hydration（水分摂取）
```kotlin
- volume: Volume // リットル
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

### 5. 睡眠系データ

#### SleepSession（睡眠セッション）
```kotlin
- startTime: Instant
- endTime: Instant
- title: String?
- notes: String?
- stages: List<Stage> // 睡眠ステージ
  - startTime: Instant
  - endTime: Instant
  - stage: Int // AWAKE, REM, LIGHT, DEEP
- metadata: Metadata
```

### 6. 運動系データ

#### ExerciseSession（運動セッション）
```kotlin
- startTime: Instant
- endTime: Instant
- exerciseType: Int // 運動タイプ（100種類以上）
- title: String?
- notes: String?
- segments: List<Segment> // セグメント
- laps: List<Lap> // ラップ
- route: ExerciseRoute? // ルート情報
- metadata: Metadata
```

運動タイプの例：
- BADMINTON
- BASEBALL
- BASKETBALL
- BIKING
- BIKING_STATIONARY
- BOXING
- CRICKET
- DANCING
- ELLIPTICAL
- FOOTBALL_AMERICAN
- FOOTBALL_AUSTRALIAN
- GOLF
- GYMNASTICS
- HANDBALL
- HIKING
- ICE_HOCKEY
- ICE_SKATING
- MARTIAL_ARTS
- PILATES
- ROWING
- ROWING_MACHINE
- RUGBY
- RUNNING
- RUNNING_TREADMILL
- SKIING
- SNOWBOARDING
- SOCCER
- STAIR_CLIMBING
- STRENGTH_TRAINING
- SURFING
- SWIMMING_OPEN_WATER
- SWIMMING_POOL
- TABLE_TENNIS
- TENNIS
- VOLLEYBALL
- WALKING
- WATER_POLO
- WEIGHTLIFTING
- WHEELCHAIR
- YOGA
...他多数

### 7. サイクル系データ

#### CyclingPedalingCadence（ペダリングケイデンス）
```kotlin
- samples: List<Sample>
  - time: Instant
  - revolutionsPerMinute: Double
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

#### WheelchairPushes（車椅子プッシュ）
```kotlin
- count: Long
- startTime: Instant
- endTime: Instant
- metadata: Metadata
```

### 8. 女性の健康データ

#### MenstruationFlow（月経フロー）
```kotlin
- flow: Int // LIGHT, MEDIUM, HEAVY
- time: Instant
- metadata: Metadata
```

#### CervicalMucus（頸管粘液）
```kotlin
- texture: Int
- amount: Int  
- time: Instant
- metadata: Metadata
```

#### OvulationTest（排卵検査）
```kotlin
- result: Int // POSITIVE, NEGATIVE, INCONCLUSIVE
- time: Instant
- metadata: Metadata
```

#### SexualActivity（性行為）
```kotlin
- protectionUsed: Int
- time: Instant
- metadata: Metadata
```

#### IntermenstrualBleeding（不正出血）
```kotlin
- time: Instant
- metadata: Metadata
```

### 9. メタデータ構造

全データタイプに共通のMetadata：
```kotlin
- id: String // レコードID
- dataOrigin: DataOrigin
  - packageName: String // アプリのパッケージ名
- lastModifiedTime: Instant
- clientRecordId: String? // クライアント側ID
- clientRecordVersion: Long
- device: Device?
  - manufacturer: String?
  - model: String?
  - type: Int // UNKNOWN, PHONE, WATCH, etc.
```

## 重要な注意点

1. **データ構造の変更**: Health Connect APIは定期的に更新されるため、フィールドが追加・変更される可能性があります

2. **権限の必要性**: 各データタイプごとに個別の権限が必要です
   - 例: `android.permission.health.READ_STEPS`

3. **単位の扱い**: Health Connectは国際単位系（SI）を使用
   - 距離: メートル
   - 重量: キログラム
   - エネルギー: キロカロリー

4. **データの可用性**: デバイスやアプリによって利用可能なデータタイプが異なります

5. **サンプリングレート**: 連続データ（心拍数など）は、デバイスによってサンプリング間隔が異なります

## データ取得時の実装例（Kotlin）

```kotlin
// 実際のHealth Connect APIでのデータ取得
val response = healthConnectClient.readRecords(
    ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
    )
)

response.records.forEach { stepsRecord ->
    val count = stepsRecord.count
    val startTime = stepsRecord.startTime
    val endTime = stepsRecord.endTime
    val metadata = stepsRecord.metadata
}
```

## まとめ

Health Connectは医療・フィットネス関連の包括的なデータを扱えますが、実際に取得できるデータは：
- デバイスの機能
- インストールされているアプリ
- ユーザーが許可した権限
- 実際に記録されているデータ

によって異なります。完全なデータ仕様はGoogle公式ドキュメントを参照してください。