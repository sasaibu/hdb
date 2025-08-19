Health Connect & HealthKit データ仕様書

このドキュメントはHDBアプリにおけるAndroid Health ConnectとiOS HealthKitのデータ仕様を定義します。

1. ヘルスデータ項目仕様

1.1. 歩数データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 歩数 | count | Long | count | Double |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |

1.2. 心拍数データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 心拍数 | beats_per_minute | Long | value | Double |
| 測定方法 | measurement_method | String | metadata.source | String |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.3. 血圧データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 最高血圧 | systolic | Double | systolicPressure | Double |
| 最低血圧 | diastolic | Double | diastolicPressure | Double |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.4. 体重データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体重 | weight | Double | value | Double |
| 単位 | unit | String (KILOGRAM) | unit | String (kg) |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.5. 身長データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 身長 | height | Double | value | Double |
| 単位 | unit | String (METER) | unit | String (m) |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.6. 体脂肪率データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体脂肪率 | percentage | Double | value | Double |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.7. 睡眠データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 睡眠段階 | stage | Int (1-4) | value | Int |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |

1.8. 運動データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 運動タイプ | exercise_type | Int | workoutActivityType | Int |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |
| 消費カロリー | total_energy_burned | Double | totalEnergyBurned | Double |

1.9. 移動距離データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 距離 | distance | Double | value | Double |
| 単位 | unit | String (METER) | unit | String (m) |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |

1.10. 総消費カロリーデータ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 総カロリー | energy | Double | value | Double |
| 単位 | unit | String (CALORIE) | unit | String (kcal) |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |

1.11. 活動カロリーデータ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 活動カロリー | energy | Double | value | Double |
| 単位 | unit | String (CALORIE) | unit | String (kcal) |
| 開始時刻 | start_time | Long (timestamp) | startDate | Date |
| 終了時刻 | end_time | Long (timestamp) | endDate | Date |

1.12. 安静時心拍数データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 安静時心拍数 | beats_per_minute | Long | value | Double |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.13. 血糖値データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 血糖値 | level | Double | value | Double |
| 単位 | unit | String (MILLIMOLES_PER_LITER) | unit | String (mg/dL) |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.14. 酸素飽和度データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 酸素飽和度 | percentage | Double | value | Double |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

1.15. 体温データ
| 項目 | Android | | iOS | |
|------|---------|---|-----|---|
|      | 物理名 | データ型 | 物理名 | データ型 |
| 体温 | temperature | Double | value | Double |
| 単位 | unit | String (CELSIUS) | unit | String (°C) |
| 測定時刻 | time | Long (timestamp) | startDate | Date |

2. データ取得方法

Android Health Connect
- Content Provider経由でのデータアクセス
- 権限: `android.permission.health.READ_*`
- パッケージ名: `com.google.android.apps.healthdata`

iOS HealthKit
- HealthKit Framework使用
- 権限: Info.plistでの使用目的記述が必要
- Framework: `HealthKit.framework`

3. 注意事項

データ形式の違い
- 時刻: AndroidはLong型のタイムスタンプ、iOSはDate型
- 単位: Android はenum値、iOSは文字列表現
- 精度: データ型によって精度が異なる場合がある

権限管理
- 各プラットフォームで適切な権限要求が必要
- ユーザーによる明示的な許可が必要
- データタイプごとに個別の権限設定が可能