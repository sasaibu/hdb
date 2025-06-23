# HDB プロジェクト

## 概要
本プロジェクトは、React Native（TypeScript）を用いて開発されたモバイルアプリケーション「HDBApp」を中心としたリポジトリです。AndroidおよびiOSの両プラットフォームに対応しています。

## ディレクトリ構成
```
HDBApp/           ... モバイルアプリ本体（React Native）
├── src/          ... ソースコード（コンポーネント・画面・ナビゲーション等）
├── android/      ... Androidプロジェクト
├── ios/          ... iOSプロジェクト
├── __tests__/    ... 単体テスト
├── App.tsx       ... エントリーポイント
├── package.json  ... 依存関係管理
doc/              ... ドキュメント
```

## セットアップ手順

1. 必要なツールのインストール  
   - Node.js（推奨バージョンはpackage.json参照）
   - Yarn または npm
   - Android Studio（Android開発の場合）
   - Xcode（iOS開発の場合、Macのみ）

2. 依存関係のインストール
   ```
   cd HDBApp
   npm install
   # または
   yarn install
   ```

3. iOS用ライブラリのインストール（Macの場合）
   ```
   cd ios
   pod install
   cd ..
   ```

4. アプリの起動
   - Android
     ```
     npx react-native run-android
     ```
   - iOS
     ```
     npx react-native run-ios
     ```

## テスト実行
```
cd HDBApp
npm test
```

## 主な技術スタック
- React Native
- TypeScript
- Jest（テスト）
- ESLint, Prettier（コード整形・静的解析）

## ドキュメント
- `doc/` 配下に設計資料や進捗管理表などを格納

## ライセンス
本プロジェクトのライセンスは未定義です。必要に応じて追記してください。