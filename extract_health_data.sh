#!/bin/bash

echo "🔥 Health Connect 生データ取得ツール (Linux/Mac)"
echo "================================================"

# Pythonの存在確認
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3がインストールされていません"
    echo "https://www.python.org/ からPython3をインストールしてください"
    exit 1
fi

# ADBの存在確認
if ! command -v adb &> /dev/null; then
    echo "❌ ADBコマンドが見つかりません"
    echo "Android SDK Platform Toolsをインストールしてください"
    echo "https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

echo "✅ 前提条件チェック完了"
echo ""

# Pythonスクリプト実行
python3 health_connect_data_extractor.py

echo ""
echo "処理が完了しました。"
