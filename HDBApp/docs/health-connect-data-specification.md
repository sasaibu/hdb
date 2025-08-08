# Health Connect データ仕様書

## 1. アクティビティ系データ

### 1.1 基本アクティビティデータ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Steps** | 歩数 | | 歩行による歩数データ |
| count | 歩数 | Long | 計測期間中の総歩数 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| startZoneOffset | 開始タイムゾーン | ZoneOffset? | 開始時のタイムゾーンオフセット |
| endZoneOffset | 終了タイムゾーン | ZoneOffset? | 終了時のタイムゾーンオフセット |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Distance** | 移動距離 | | 移動した距離データ |
| distance | 距離 | Length | メートル単位の移動距離 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **TotalCaloriesBurned** | 総消費カロリー | | 基礎代謝を含む総消費カロリー |
| energy | エネルギー | Energy | kcal単位の消費カロリー |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **ActiveCaloriesBurned** | 活動消費カロリー | | 運動による消費カロリー |
| energy | エネルギー | Energy | kcal単位の活動消費カロリー |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **FloorsClimbed** | 階段上昇数 | | 上った階数データ |
| floors | 階数 | Double | 上昇した階数 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

### 1.2 詳細アクティビティデータ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Speed** | 速度 | | 移動速度の時系列データ |
| samples | サンプル | List<Sample> | 速度測定値のリスト |
| samples.time | 測定時刻 | Instant | 個別測定時刻 |
| samples.speed | 速度 | Velocity | m/s単位の速度 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Power** | パワー | | 運動出力の時系列データ |
| samples | サンプル | List<Sample> | パワー測定値のリスト |
| samples.time | 測定時刻 | Instant | 個別測定時刻 |
| samples.power | パワー | Power | ワット単位の出力 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 2. バイタル系データ

### 2.1 心臓関連データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **HeartRate** | 心拍数 | | 心拍数の時系列データ |
| samples | サンプル | List<Sample> | 心拍数測定値のリスト |
| samples.time | 測定時刻 | Instant | 個別測定時刻 |
| samples.beatsPerMinute | 心拍数 | Long | 1分あたりの心拍数(BPM) |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **RestingHeartRate** | 安静時心拍数 | | 安静時の心拍数データ |
| beatsPerMinute | 心拍数 | Long | 1分あたりの安静時心拍数(BPM) |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **HeartRateVariability** | 心拍変動 | | 心拍間隔のばらつきデータ |
| heartRateVariabilityMillis | 心拍変動値 | Double | RMSSD値（ミリ秒） |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

### 2.2 血圧・血液関連データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BloodPressure** | 血圧 | | 血圧測定データ |
| systolic | 収縮期血圧 | Pressure | 最高血圧（mmHg） |
| diastolic | 拡張期血圧 | Pressure | 最低血圧（mmHg） |
| bodyPosition | 測定姿勢 | Int | 測定時の体位（座位、立位等） |
| measurementLocation | 測定部位 | Int | 測定箇所（左腕、右腕等） |
| time | 測定時刻 | Instant | 測定時刻 |
| zoneOffset | タイムゾーン | ZoneOffset? | タイムゾーンオフセット |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BloodGlucose** | 血糖値 | | 血糖値測定データ |
| level | 血糖値 | BloodGlucose | mmol/LまたはMg/dL単位の血糖値 |
| specimenSource | 採血部位 | Int | 血液採取部位 |
| mealType | 食事タイプ | Int | 朝食、昼食、夕食等 |
| relationToMeal | 食事タイミング | Int | 食前、食後等 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **OxygenSaturation** | 血中酸素飽和度 | | SpO2測定データ |
| percentage | 飽和度 | Percentage | パーセント単位のSpO2値 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

### 2.3 体温・代謝関連データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BodyTemperature** | 体温 | | 体温測定データ |
| temperature | 体温 | Temperature | 摂氏または華氏の体温 |
| measurementLocation | 測定部位 | Int | 口腔、腋窩、直腸等 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BasalBodyTemperature** | 基礎体温 | | 基礎体温測定データ |
| temperature | 基礎体温 | Temperature | 摂氏または華氏の基礎体温 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BasalMetabolicRate** | 基礎代謝率 | | 基礎代謝量データ |
| basalMetabolicRate | 基礎代謝率 | Power | kcal/day単位の基礎代謝量 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **RespiratoryRate** | 呼吸数 | | 呼吸数測定データ |
| rate | 呼吸数 | Double | 1分あたりの呼吸数 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 3. 身体測定系データ

### 3.1 基本身体測定データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Weight** | 体重 | | 体重測定データ |
| weight | 体重 | Mass | キログラム単位の体重 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Height** | 身長 | | 身長測定データ |
| height | 身長 | Length | メートル単位の身長 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

### 3.2 体組成データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BodyFat** | 体脂肪率 | | 体脂肪率測定データ |
| percentage | 体脂肪率 | Percentage | パーセント単位の体脂肪率 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **BoneMass** | 骨量 | | 骨量測定データ |
| mass | 骨量 | Mass | キログラム単位の骨量 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **LeanBodyMass** | 除脂肪体重 | | 筋肉量を含む除脂肪体重データ |
| mass | 除脂肪体重 | Mass | キログラム単位の除脂肪体重 |
| time | 測定時刻 | Instant | 測定時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 4. 栄養系データ

### 4.1 栄養摂取データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Nutrition** | 栄養 | | 栄養摂取の包括的データ |
| name | 食品名 | String? | 摂取した食品の名称 |
| mealType | 食事タイプ | Int | 朝食、昼食、夕食、間食等 |
| energy | カロリー | Energy? | kcal単位の摂取カロリー |
| protein | タンパク質 | Mass? | グラム単位のタンパク質量 |
| totalFat | 総脂質 | Mass? | グラム単位の総脂質量 |
| saturatedFat | 飽和脂肪酸 | Mass? | グラム単位の飽和脂肪酸量 |
| unsaturatedFat | 不飽和脂肪酸 | Mass? | グラム単位の不飽和脂肪酸量 |
| transFat | トランス脂肪酸 | Mass? | グラム単位のトランス脂肪酸量 |
| cholesterol | コレステロール | Mass? | ミリグラム単位のコレステロール量 |
| totalCarbohydrate | 総炭水化物 | Mass? | グラム単位の総炭水化物量 |
| sugar | 糖質 | Mass? | グラム単位の糖質量 |
| dietaryFiber | 食物繊維 | Mass? | グラム単位の食物繊維量 |
| sodium | ナトリウム | Mass? | ミリグラム単位のナトリウム量 |
| calcium | カルシウム | Mass? | ミリグラム単位のカルシウム量 |
| iron | 鉄分 | Mass? | ミリグラム単位の鉄分量 |
| potassium | カリウム | Mass? | ミリグラム単位のカリウム量 |
| vitaminA | ビタミンA | Mass? | IU単位のビタミンA量 |
| vitaminC | ビタミンC | Mass? | ミリグラム単位のビタミンC量 |
| vitaminD | ビタミンD | Mass? | マイクログラム単位のビタミンD量 |
| caffeine | カフェイン | Mass? | ミリグラム単位のカフェイン量 |
| startTime | 開始時刻 | Instant | 摂取開始時刻 |
| endTime | 終了時刻 | Instant | 摂取終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

※Nutritionデータには40種類以上の栄養素フィールドが存在（ビタミン、ミネラル等）

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Hydration** | 水分摂取 | | 水分摂取量データ |
| volume | 摂取量 | Volume | リットル単位の水分摂取量 |
| startTime | 開始時刻 | Instant | 摂取開始時刻 |
| endTime | 終了時刻 | Instant | 摂取終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 5. 睡眠系データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **SleepSession** | 睡眠セッション | | 睡眠の詳細データ |
| title | タイトル | String? | 睡眠セッションの名称 |
| notes | メモ | String? | 睡眠に関するメモ |
| startTime | 就寝時刻 | Instant | 睡眠開始時刻 |
| endTime | 起床時刻 | Instant | 睡眠終了時刻 |
| stages | 睡眠ステージ | List<Stage> | 睡眠段階の詳細リスト |
| stages.startTime | ステージ開始 | Instant | 各睡眠段階の開始時刻 |
| stages.endTime | ステージ終了 | Instant | 各睡眠段階の終了時刻 |
| stages.stage | ステージ種別 | Int | AWAKE(覚醒)、REM(レム)、LIGHT(浅い)、DEEP(深い) |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 6. 運動系データ

### 6.1 運動セッションデータ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **ExerciseSession** | 運動セッション | | 運動の詳細データ |
| exerciseType | 運動種別 | Int | 100種類以上の運動タイプ |
| title | タイトル | String? | 運動セッションの名称 |
| notes | メモ | String? | 運動に関するメモ |
| startTime | 開始時刻 | Instant | 運動開始時刻 |
| endTime | 終了時刻 | Instant | 運動終了時刻 |
| segments | セグメント | List<Segment> | 運動区間の詳細 |
| laps | ラップ | List<Lap> | ラップタイムの記録 |
| route | ルート | ExerciseRoute? | GPS経路情報 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

### 6.2 主な運動タイプ

| 運動タイプ | 日本語名 | 説明 |
|------------|----------|------|
| WALKING | ウォーキング | 歩行運動 |
| RUNNING | ランニング | 走行運動 |
| RUNNING_TREADMILL | トレッドミル | ランニングマシンでの運動 |
| CYCLING | サイクリング | 自転車運動 |
| CYCLING_STATIONARY | エアロバイク | 固定式自転車での運動 |
| SWIMMING_POOL | プール水泳 | プールでの水泳 |
| SWIMMING_OPEN_WATER | オープンウォーター | 海や湖での水泳 |
| YOGA | ヨガ | ヨガエクササイズ |
| PILATES | ピラティス | ピラティスエクササイズ |
| STRENGTH_TRAINING | 筋力トレーニング | ウェイトトレーニング等 |
| DANCING | ダンス | ダンスエクササイズ |
| GOLF | ゴルフ | ゴルフプレー |
| TENNIS | テニス | テニスプレー |
| BASKETBALL | バスケットボール | バスケットボール |
| SOCCER | サッカー | サッカー |
| BASEBALL | 野球 | 野球 |
| HIKING | ハイキング | 山歩き、トレッキング |
| MARTIAL_ARTS | 格闘技 | 武道、格闘技全般 |
| GYMNASTICS | 体操 | 体操競技 |
| ELLIPTICAL | エリプティカル | クロストレーナー運動 |

### 6.3 サイクリング関連データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **CyclingPedalingCadence** | ペダリングケイデンス | | 自転車のペダル回転数データ |
| samples | サンプル | List<Sample> | ケイデンス測定値のリスト |
| samples.time | 測定時刻 | Instant | 個別測定時刻 |
| samples.revolutionsPerMinute | 回転数 | Double | 1分あたりのペダル回転数(RPM) |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **WheelchairPushes** | 車椅子プッシュ | | 車椅子の押し回数データ |
| count | プッシュ数 | Long | 車椅子を押した回数 |
| startTime | 開始時刻 | Instant | 計測開始時刻 |
| endTime | 終了時刻 | Instant | 計測終了時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 7. 女性の健康データ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **MenstruationFlow** | 月経量 | | 月経の量に関するデータ |
| flow | 経血量 | Int | LIGHT(少量)、MEDIUM(普通)、HEAVY(多量) |
| time | 記録時刻 | Instant | 記録時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **CervicalMucus** | 頸管粘液 | | 頸管粘液の状態データ |
| texture | 粘液の質 | Int | 粘液の状態分類 |
| amount | 粘液量 | Int | 粘液の量分類 |
| time | 記録時刻 | Instant | 記録時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **OvulationTest** | 排卵検査 | | 排卵検査結果データ |
| result | 検査結果 | Int | POSITIVE(陽性)、NEGATIVE(陰性)、INCONCLUSIVE(判定不能) |
| time | 検査時刻 | Instant | 検査実施時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **SexualActivity** | 性行為 | | 性行為の記録データ |
| protectionUsed | 避妊具使用 | Int | 避妊具使用の有無 |
| time | 記録時刻 | Instant | 記録時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **IntermenstrualBleeding** | 不正出血 | | 月経期間外の出血データ |
| time | 記録時刻 | Instant | 出血確認時刻 |
| metadata | メタデータ | Metadata | データ提供元などの付加情報 |

## 8. メタデータ構造

### 8.1 共通メタデータ

| 物理名 | 日本語名 | データ型 | 説明 |
|--------|----------|----------|------|
| **Metadata** | メタデータ | | 全データタイプ共通の付加情報 |
| id | レコードID | String | 一意のレコード識別子 |
| dataOrigin | データ提供元 | DataOrigin | データの提供元情報 |
| dataOrigin.packageName | パッケージ名 | String | 提供元アプリのパッケージ名 |
| lastModifiedTime | 最終更新時刻 | Instant | データの最終更新時刻 |
| clientRecordId | クライアントID | String? | クライアント側の識別子 |
| clientRecordVersion | バージョン | Long | クライアント側のバージョン番号 |
| device | デバイス情報 | Device? | 測定デバイスの情報 |
| device.manufacturer | メーカー | String? | デバイス製造元 |
| device.model | モデル | String? | デバイスモデル名 |
| device.type | デバイス種別 | Int | PHONE(スマホ)、WATCH(スマートウォッチ)等 |

## 9. データ単位と定数

### 9.1 測定単位

| 単位タイプ | 物理名 | 説明 | 使用例 |
|------------|--------|------|--------|
| 質量 | Mass | キログラム(kg)、グラム(g) | 体重、栄養素 |
| 長さ | Length | メートル(m)、センチメートル(cm) | 身長、距離 |
| エネルギー | Energy | キロカロリー(kcal) | カロリー消費 |
| 圧力 | Pressure | 水銀柱ミリメートル(mmHg) | 血圧 |
| 速度 | Velocity | メートル毎秒(m/s) | 移動速度 |
| 出力 | Power | ワット(W) | 運動出力 |
| 温度 | Temperature | 摂氏(℃)、華氏(°F) | 体温 |
| パーセント | Percentage | パーセント(%) | 体脂肪率、SpO2 |
| 体積 | Volume | リットル(L)、ミリリットル(mL) | 水分摂取量 |

### 9.2 定数値

| カテゴリ | 定数名 | 値 | 説明 |
|----------|--------|-----|------|
| 睡眠ステージ | AWAKE | 1 | 覚醒状態 |
| | REM | 2 | レム睡眠 |
| | LIGHT | 3 | 浅い睡眠 |
| | DEEP | 4 | 深い睡眠 |
| 食事タイプ | BREAKFAST | 1 | 朝食 |
| | LUNCH | 2 | 昼食 |
| | DINNER | 3 | 夕食 |
| | SNACK | 4 | 間食 |
| 測定姿勢 | STANDING | 1 | 立位 |
| | SITTING | 2 | 座位 |
| | LYING_DOWN | 3 | 仰臥位 |
| デバイスタイプ | UNKNOWN | 0 | 不明 |
| | PHONE | 1 | スマートフォン |
| | WATCH | 2 | スマートウォッチ |
| | SCALE | 3 | 体重計 |
| | RING | 4 | スマートリング |

## 10. 権限とアクセス制御

### 10.1 必要な権限

| データカテゴリ | 読み取り権限 | 書き込み権限 |
|---------------|-------------|-------------|
| 歩数 | android.permission.health.READ_STEPS | android.permission.health.WRITE_STEPS |
| 心拍数 | android.permission.health.READ_HEART_RATE | android.permission.health.WRITE_HEART_RATE |
| 血圧 | android.permission.health.READ_BLOOD_PRESSURE | android.permission.health.WRITE_BLOOD_PRESSURE |
| 体重 | android.permission.health.READ_WEIGHT | android.permission.health.WRITE_WEIGHT |
| 睡眠 | android.permission.health.READ_SLEEP | android.permission.health.WRITE_SLEEP |
| 栄養 | android.permission.health.READ_NUTRITION | android.permission.health.WRITE_NUTRITION |
| 運動 | android.permission.health.READ_EXERCISE | android.permission.health.WRITE_EXERCISE |

## 11. 実装上の注意事項

### 11.1 データ取得時の考慮事項

1. **権限の確認**: 各データタイプごとに個別の権限が必要
2. **データの可用性**: デバイスやアプリによって利用可能なデータタイプが異なる
3. **サンプリングレート**: 連続データ（心拍数など）は、デバイスによってサンプリング間隔が異なる
4. **データ更新頻度**: リアルタイムデータではなく、定期的な同期が必要
5. **データサイズ**: 大量のデータを扱う場合はページング処理が必要

### 11.2 データ精度

1. **測定機器の精度**: 医療機器レベルの精度は保証されない
2. **キャリブレーション**: デバイスによって校正方法が異なる
3. **推定値と実測値**: 一部のデータは推定値の場合がある

### 11.3 プライバシーとセキュリティ

1. **データの暗号化**: 保存時および転送時の暗号化が必要
2. **ユーザー同意**: 明示的なユーザー同意が必要
3. **データ保持期間**: 適切なデータ保持ポリシーの設定
4. **アクセスログ**: データアクセスの監査ログ記録

---
*文書バージョン: 2.0*  
*最終更新日: 2025年1月*  
*対応バージョン: Health Connect API v1.1.0*