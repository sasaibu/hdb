# 🔥 Health Connect 生データ取得ツール

このツールは、AndroidデバイスのHealth Connectから直接生データを取得するためのスクリプトです。

## 📋 概要

- **目的**: Health Connectアプリから実際の生データを直接取得
- **方法**: ADBコマンドを使用してContent Providerに直接アクセス
- **対象**: 15種類のヘルスデータタイプ
- **出力**: JSON形式の詳細レポート

## 🔧 前提条件

### 必須ソフトウェア
1. **Python 3.x**
   - Windows: https://www.python.org/downloads/
   - Linux/Mac: 通常プリインストール済み

2. **Android SDK Platform Tools (ADB)**
   - ダウンロード: https://developer.android.com/studio/releases/platform-tools
   - インストール後、PATHに追加

### Android端末設定
1. **USBデバッグの有効化**
   ```
   設定 → システム → 開発者向けオプション → USBデバッグ
   ```

2. **Health Connectアプリのインストール**
   - Google Play Storeから「Health Connect」をインストール
   - 各種ヘルスアプリ（Google Fit、Samsung Health等）と連携

3. **ヘルスデータの蓄積**
   - 歩数、心拍数、体重などのデータを事前に蓄積

## 🚀 使用方法

### Windows
```cmd
# バッチファイルをダブルクリック、または
extract_health_data.bat
```

### Linux/Mac
```bash
# 実行権限を付与
chmod +x extract_health_data.sh

# スクリプト実行
./extract_health_data.sh
```

### 直接Python実行
```bash
python health_connect_data_extractor.py
```

## 📊 取得可能なデータタイプ

| データタイプ | 説明 | 取得元例 |
|-------------|------|----------|
| Steps | 歩数データ | Google Fit, Samsung Health |
| HeartRate | 心拍数 | ウェアラブル端末 |
| BloodPressure | 血圧 | 血圧計アプリ |
| Weight | 体重 | スマート体重計 |
| Height | 身長 | 手動入力 |
| BodyFat | 体脂肪率 | 体組成計 |
| SleepSession | 睡眠セッション | 睡眠トラッカー |
| ExerciseSession | 運動セッション | フィットネスアプリ |
| Distance | 移動距離 | GPS, 歩数計 |
| TotalCaloriesBurned | 総消費カロリー | フィットネスアプリ |
| ActiveCaloriesBurned | 活動カロリー | フィットネスアプリ |
| RestingHeartRate | 安静時心拍数 | ウェアラブル端末 |
| BloodGlucose | 血糖値 | 血糖値測定器 |
| OxygenSaturation | 酸素飽和度 | ウェアラブル端末 |
| BodyTemperature | 体温 | 体温計 |

## 📁 出力ファイル形式

### ファイル名
```
health_connect_raw_data_YYYYMMDD_HHMMSS.json
```

### JSON構造
```json
{
  "extractionInfo": {
    "timestamp": "2025-07-17T11:57:00.000Z",
    "deviceId": "emulator-5556",
    "extractionMethod": "ADB_CONTENT_PROVIDER",
    "dataTypes": ["Steps", "HeartRate", ...],
    "totalRecords": 150
  },
  "statistics": {
    "Steps": {
      "count": 30,
      "hasData": true,
      "dateRange": {
        "earliest": "2025-06-17T00:00:00.000Z",
        "latest": "2025-07-17T23:59:59.000Z"
      }
    }
  },
  "rawData": {
    "Steps": [
      {
        "dataType": "Steps",
        "timestamp": "2025-07-17T10:00:00.000Z",
        "value": {
          "count": 8500,
          "startTime": "2025-07-17T00:00:00.000Z",
          "endTime": "2025-07-17T23:59:59.000Z"
        },
        "rawData": {
          "count": "8500",
          "start_time": "1721203200000",
          "end_time": "1721289599000"
        },
        "source": "HEALTH_CONNECT_DIRECT",
        "extractedAt": "2025-07-17T11:57:00.000Z",
        "metadata": {
          "extractionMethod": "ADB_CONTENT_PROVIDER",
          "isRealData": true
        }
      }
    ]
  }
}
```

## 🔍 実行例

```bash
🔥 Health Connect 生データ抽出ツール
==================================================
✅ デバイス接続確認: emulator-5556
✅ Health Connectアプリが見つかりました
取得期間を日数で入力してください (デフォルト: 30): 7

🔥 Health Connect生データ取得開始 (過去7日間)
==================================================
🔍 Stepsデータを取得中...
✅ Steps: 7件のデータを取得
🔍 HeartRateデータを取得中...
✅ HeartRate: 15件のデータを取得
🔍 BloodPressureデータを取得中...
⚠️ BloodPressure: データなし または アクセス権限なし
...
==================================================
📊 取得完了: 15種類のデータタイプ
📊 総レコード数: 45件

============================================================
📋 Health Connect 生データ取得サマリー
============================================================
✅ Steps: 7件
   最新データ: 2025-07-17T10:00:00.000Z
   値: {'count': 8500, 'startTime': '2025-07-17T00:00:00.000Z', 'endTime': '2025-07-17T23:59:59.000Z'}
✅ HeartRate: 15件
   最新データ: 2025-07-17T09:30:00.000Z
   値: {'beatsPerMinute': 72, 'measurementMethod': 'AUTOMATIC'}
⚠️ BloodPressure: データなし
...
------------------------------------------------------------
📊 総計: 5/15種類のデータタイプで45件取得
============================================================

💾 データを保存しました: health_connect_raw_data_20250717_115700.json
📁 ファイルサイズ: 15420 bytes

🎉 Health Connect生データ取得完了！
```

## ⚠️ 注意事項

### データアクセス権限
- Health Connectアプリで各データソースの権限が許可されている必要があります
- 一部のデータタイプは、対応するアプリがインストールされていないとデータが存在しません

### セキュリティ
- このツールは生のヘルスデータを取得します
- 取得したJSONファイルには個人の健康情報が含まれるため、適切に管理してください

### 対応OS
- **Android**: API Level 26 (Android 8.0) 以上
- **Health Connect**: バージョン 1.0 以上

## 🛠️ トラブルシューティング

### よくある問題

1. **「Androidデバイスが接続されていません」**
   - USBケーブルでAndroid端末を接続
   - USBデバッグを有効化
   - `adb devices`コマンドでデバイス認識を確認

2. **「Health Connectアプリがインストールされていません」**
   - Google Play StoreからHealth Connectをインストール
   - アプリを一度起動して初期設定を完了

3. **「データなし または アクセス権限なし」**
   - Health Connectアプリで各データソースの権限を確認
   - Google Fit、Samsung Health等のヘルスアプリでデータを蓄積

4. **「ADBコマンドが見つかりません」**
   - Android SDK Platform Toolsをインストール
   - 環境変数PATHにadbのパスを追加

### デバッグコマンド

```bash
# デバイス接続確認
adb devices

# Health Connectアプリ確認
adb shell pm list packages | grep healthdata

# Content Provider直接アクセステスト
adb shell content query --uri content://com.google.android.apps.healthdata.provider/records/Steps
```

## 📞 サポート

このツールに関する質問や問題がある場合は、以下の情報を含めてお問い合わせください：

- 使用OS (Windows/Linux/Mac)
- Android端末の機種とOSバージョン
- エラーメッセージの全文
- `adb devices`の出力結果

---

**🔥 Health Connect生データ取得ツール** - 実際のヘルスデータを直接取得して分析に活用しましょう！
