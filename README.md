# HDB プロジェクト

## 概要
本プロジェクトは、React Native（TypeScript）を用いて開発されたヘルスデータバンク（HDB）モバイルアプリケーションです。AndroidおよびiOSの両プラットフォームに対応し、健康データの管理・可視化・同期機能を提供します。

## 主な機能
- **ユーザー認証**: ID/パスワードによるログイン機能
- **健康データ管理**: 歩数、体重、体温、血圧、心拍数の記録・表示
- **ダッシュボード**: 健康データの一覧表示とカード形式の視覚化
- **プラットフォーム連携**: HealthKit（iOS）、Google Fit（Android）との連携予定
- **WebView統合**: 既存HDBシステムとの連携
- **プッシュ通知**: データ更新やリマインダー機能
- **データ同期**: クラウドバックアップ・復元機能

## ディレクトリ構成
```
HDBApp/                          ... React Nativeアプリ本体
├── src/
│   ├── components/              ... 再利用可能UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── screens/                 ... 画面コンポーネント
│   │   ├── HomeScreen.tsx       ... メインダッシュボード
│   │   ├── LoginScreen.tsx      ... ログイン画面
│   │   ├── SplashScreen.tsx     ... スプラッシュ画面
│   │   └── WebViewScreen.tsx    ... WebView画面
│   ├── navigation/              ... ナビゲーション設定
│   │   └── AppNavigator.tsx     ... Stack + Drawer ナビゲーター
│   ├── hooks/                   ... カスタムReactフック
│   │   └── useAuth.ts           ... 認証状態管理
│   ├── types/                   ... TypeScript型定義
│   │   └── index.ts             ... アプリ全体の型定義
│   └── utils/                   ... ユーティリティ
│       └── ErrorHandler.tsx     ... エラーハンドリング
├── android/                     ... Androidプロジェクト
├── ios/                         ... iOSプロジェクト
├── __tests__/                   ... 単体テスト
├── App.tsx                      ... アプリエントリーポイント
└── package.json                 ... 依存関係管理
doc/                             ... プロジェクトドキュメント
├── アプリケーション実装方式.md
├── 進捗管理表.md
├── 全体作業計画.tsv
└── 開発対象機能一覧.tsv
```

## 必要な環境
- **Node.js**: 18以上
- **React Native**: 0.80.0
- **TypeScript**: 5.0.4
- **iOS開発**: Xcode（macOSのみ）
- **Android開発**: Android Studio

## セットアップ手順

### 1. リポジトリのクローンと依存関係インストール
```bash
git clone <repository-url>
cd hdb/HDBApp
npm install
```

### 2. iOS セットアップ（macOS）
```bash
cd ios
pod install
cd ..
```

### 3. アプリケーションの起動

#### 開発サーバーの起動
```bash
npm start
```

#### iOS シミュレーターで実行
```bash
npm run ios
```

#### Android エミュレーターで実行
```bash
npm run android
```

### トラブルシューティング

#### iOSシミュレータが検出されない場合
1. Xcodeを起動し、「Settings」→「Components」でiOS Simulatorをインストール
2. 「Window」→「Devices and Simulators」からシミュレータを起動
3. 再度 `npm run ios` を実行

#### Android エミュレーターが起動しない場合
1. Android Studioを起動し、AVD Managerでエミュレーターを作成・起動
2. 環境変数 `ANDROID_HOME` が正しく設定されているか確認

## 開発コマンド

### テスト
```bash
npm test                    # Jest テストの実行
npm run test:watch         # ウォッチモードでテスト実行
```

### コード品質チェック
```bash
npm run lint               # ESLint実行
npm run lint:fix           # ESLint自動修正
```

### ビルド
```bash
# iOS リリースビルド
npx react-native run-ios --configuration Release

# Android リリースビルド
npx react-native run-android --variant=release
```

## 技術スタック

### フロントエンド
- **React Native 0.80.0**: クロスプラットフォームモバイル開発
- **TypeScript 5.0.4**: 静的型付け
- **React Navigation 7.x**: ナビゲーション（Stack + Drawer）

### 開発ツール
- **Jest**: 単体テスト フレームワーク
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター
- **Metro**: JavaScript バンドラー

### 予定している統合
- **HealthKit**: iOSヘルスデータ連携
- **Google Fit**: Android ヘルスデータ連携
- **AsyncStorage**: ローカルデータ永続化
- **Push Notifications**: プッシュ通知

## アプリケーション構成

### ナビゲーション構造
```
Stack Navigator (Root)
├── Splash Screen
├── Login Screen
└── Main Drawer
    ├── Home (Dashboard)
    ├── Profile
    ├── Settings
    └── Notifications
```

### 認証フロー
1. スプラッシュ画面でトークン確認
2. 未認証の場合はログイン画面へ
3. 認証済みの場合はメインアプリへ

### 健康データ管理
- 歩数、体重、体温、血圧、心拍数
- 手動入力 + プラットフォーム連携
- リアルタイム同期とローカルキャッシュ

## プロジェクト進捗
- ✅ 基本アプリ構造とナビゲーション
- ✅ 認証システム（モック実装）
- ✅ ダッシュボード UI
- ✅ TypeScript 型定義
- 🔄 HealthKit/Google Fit 連携
- 🔄 実API連携
- ⏳ プッシュ通知機能
- ⏳ データ同期機能

## ドキュメント
- `doc/アプリケーション実装方式.md`: 技術実装方針
- `doc/進捗管理表.md`: 開発進捗管理
- `doc/全体作業計画.tsv`: 全体スケジュール
- `doc/開発対象機能一覧.tsv`: 機能要件一覧

## ライセンス
本プロジェクトのライセンスは未定義です。必要に応じて追記してください。