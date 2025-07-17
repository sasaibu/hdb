# 🚀 Health Connect生データ取得 - クイックスタート

## 📱 準備（5分）

### 1. Android端末の準備
```
設定 → システム → 開発者向けオプション → USBデバッグ ✅
```

### 2. Health Connectアプリ
- Google Play Storeから「Health Connect」をインストール
- Google Fit、Samsung Health等と連携してデータを蓄積

### 3. PC側の準備
- Python 3.x をインストール
- Android SDK Platform Tools (ADB) をインストール

## ⚡ 実行（1分）

### Windows
```cmd
extract_health_data.bat
```

### Linux/Mac
```bash
chmod +x extract_health_data.sh
./extract_health_data.sh
```

### 直接実行
```bash
python health_connect_data_extractor.py
```

## 📊 結果

- `health_connect_raw_data_YYYYMMDD_HHMMSS.json` ファイルが生成される
- 15種類のヘルスデータタイプから実際の生データを取得
- JSON形式で詳細な統計情報とともに出力

## 🔥 取得される生データ例

```json
{
  "dataType": "Steps",
  "timestamp": "2025-07-17T10:00:00.000Z",
  "value": {
    "count": 8500,
    "startTime": "2025-07-17T00:00:00.000Z",
    "endTime": "2025-07-17T23:59:59.000Z"
  },
  "source": "HEALTH_CONNECT_DIRECT",
  "metadata": {
    "extractionMethod": "ADB_CONTENT_PROVIDER",
    "isRealData": true
  }
}
```

---

**これで実際のHealth Connect生データが取得できます！** 🎉

詳細は `README_HealthConnect_DataExtractor.md` を参照してください。
