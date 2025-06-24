# HDB App テスト ガイド

このドキュメントは、HDB App のテストスイートの使用方法を説明します。

## 📋 テスト概要

HDB App には以下のテストが含まれています：

### ✅ 実装済みテスト

1. **コンポーネント テスト**
   - `Button` コンポーネント
   - `Card` コンポーネント  
   - `Input` コンポーネント

2. **フック テスト**
   - `useAuth` フック

3. **ユーティリティ テスト**
   - `ErrorBoundary` コンポーネント
   - `handleApiError` 関数

4. **ナビゲーション テスト**
   - `AppNavigator` コンポーネント

5. **画面テスト**
   - `LoginScreen` コンポーネント

## 🚀 テスト実行方法

### 基本的なテスト実行

```bash
# すべてのテストを実行
npm test

# シンプルなテストのみ実行（推奨）
npm run test:simple

# テストをウォッチモードで実行
npm run test:watch

# カバレッジ測定付きでテスト実行
npm run test:coverage
```

### テストファイル別実行

```bash
# 特定のテストファイルのみ実行
npm test __tests__/simple.test.tsx
npm test __tests__/components/Button.test.tsx

# パターンマッチでテスト実行
npm test -- --testNamePattern="Button"
```

## 📊 テスト結果

### 実行可能なテスト
- ✅ `__tests__/simple.test.tsx` - 基本コンポーネントテスト (6テスト)
- ✅ `__tests__/components/Button.test.tsx` - Buttonコンポーネント
- ✅ `__tests__/components/Card.test.tsx` - Cardコンポーネント
- ✅ `__tests__/components/Input.test.tsx` - Inputコンポーネント
- ✅ `__tests__/navigation/AppNavigator.test.tsx` - ナビゲーション

### 部分的に動作するテスト
- ⚠️  `__tests__/hooks/useAuth.test.ts` - 認証フック（タイムアウト問題）
- ⚠️  `__tests__/utils/ErrorHandler.test.tsx` - エラーハンドリング

### 設定の問題があるテスト
- ❌ `__tests__/screens/LoginScreen.test.tsx` - ログイン画面（依存関係問題）
- ❌ `__tests__/App.test.tsx` - アプリメイン（依存関係問題）

## 🛠️ テスト設定

### Jest 設定 (`jest.config.js`)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|@react-navigation|react-native-safe-area-context|react-native-screens)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
};
```

### テストセットアップ (`jest.setup.js`)

基本的なモックとセットアップが含まれています：
- React Navigation のモック
- SafeAreaProvider のモック
- コンソール警告の抑制

## 📝 テストの種類

### 1. 単体テスト (Unit Tests)
- 個別のコンポーネントやフックをテスト
- モックされた依存関係を使用

### 2. コンポーネントテスト
- コンポーネントのレンダリングと動作をテスト
- ユーザーインタラクションをシミュレート

### 3. 統合テスト (Integration Tests)
- 複数のコンポーネントが連携する動作をテスト
- ナビゲーションフローなど

## 🔧 トラブルシューティング

### よくある問題

1. **React Navigation 関連のエラー**
   - Jest設定で transform パターンを確認
   - モックが正しく設定されているか確認

2. **タイムアウトエラー**
   - `testTimeout` を調整 (現在 30秒)
   - 非同期テストで適切な待機処理を使用

3. **依存関係のエラー**
   - `node_modules` のクリーンインストール
   - `npm install` を再実行

### デバッグ方法

```bash
# 詳細なテスト出力
npm test -- --verbose

# 特定のテストのみ実行してデバッグ
npm test -- --testNamePattern="Button renders correctly"

# Jest の詳細情報
npm test -- --debug
```

## 📈 今後の改善点

1. **E2E テスト**: Detox などを使用した端末間テスト
2. **ビジュアルテスト**: スクリーンショット回帰テスト
3. **パフォーマンステスト**: レンダリング性能のテスト
4. **アクセシビリティテスト**: スクリーンリーダー対応テスト

## 🎯 テストのベストプラクティス

1. **Arrange-Act-Assert パターン**を使用
2. **わかりやすいテスト名**を付ける
3. **モック**は最小限に留める
4. **非同期処理**は適切に待機する
5. **エラーケース**もテストする

---

何か問題があれば、`__tests__/simple.test.tsx` から始めて、徐々に他のテストを実行してください。