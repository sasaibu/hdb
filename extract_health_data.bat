@echo off
echo 🔥 Health Connect 生データ取得ツール (Windows)
echo ================================================

REM Pythonの存在確認
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Pythonがインストールされていません
    echo https://www.python.org/ からPythonをインストールしてください
    pause
    exit /b 1
)

REM ADBの存在確認
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ADBコマンドが見つかりません
    echo Android SDK Platform Toolsをインストールしてください
    echo https://developer.android.com/studio/releases/platform-tools
    pause
    exit /b 1
)

echo ✅ 前提条件チェック完了
echo.

REM Pythonスクリプト実行
python health_connect_data_extractor.py

echo.
echo 処理が完了しました。何かキーを押してください...
pause >nul
