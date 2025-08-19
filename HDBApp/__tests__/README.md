# HDBApp テストガイドライン

## 概要

このドキュメントは、HDBAppのテストコードを書く際のガイドラインとベストプラクティスを提供します。

## テストの構造

```
__tests__/
├── components/          # UIコンポーネントのテスト
├── screens/            # 画面コンポーネントのテスト
├── services/           # ビジネスロジック・サービスのテスト
├── hooks/              # カスタムフックのテスト
├── integration/        # 統合テスト
├── helpers/            # テストヘルパー・ユーティリティ
│   ├── testUtils.ts    # 共通のテストユーティリティ
│   └── mockFactories.ts # モックファクトリー
└── templates/          # テストテンプレート

```

## テストの書き方

### 1. 基本的な構造

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createMockNavigation } from '../helpers/testUtils';
import MyComponent from '../../src/components/MyComponent';

describe('MyComponent', () => {
  // セットアップ
  let mockNavigation: any;
  
  beforeEach(() => {
    mockNavigation = createMockNavigation();
    jest.clearAllMocks();
  });

  // 基本的なレンダリングテスト
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      const { getByTestId } = render(<MyComponent />);
      expect(getByTestId('my-component')).toBeTruthy();
    });
  });

  // ユーザーインタラクションテスト
  describe('ユーザーインタラクション', () => {
    it('ボタンクリックで適切な処理が実行される', async () => {
      const { getByTestId } = render(<MyComponent />);
      
      const button = getByTestId('action-button');
      fireEvent.press(button);
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalled();
      });
    });
  });

  // エラーハンドリングテスト
  describe('エラーハンドリング', () => {
    it('エラー時に適切なメッセージが表示される', async () => {
      // エラーケースのセットアップ
      const { getByText } = render(<MyComponent />);
      
      // エラーをトリガー
      // ...
      
      await waitFor(() => {
        expect(getByText('エラーが発生しました')).toBeTruthy();
      });
    });
  });
});
```

### 2. モックの使用

#### testUtils.tsのヘルパーを使用

```typescript
import { 
  createMockNavigation, 
  createTestUser, 
  createTestVitalData,
  setupTestEnvironment 
} from '../helpers/testUtils';

describe('MyService', () => {
  const { cleanup } = setupTestEnvironment();
  
  afterEach(() => {
    cleanup();
  });

  it('ユーザーデータを処理する', () => {
    const testUser = createTestUser({ username: 'customuser' });
    // テストロジック
  });
});
```

#### mockFactories.tsの高度なモックを使用

```typescript
import { createIntegratedMocks } from '../helpers/mockFactories';

describe('統合テスト', () => {
  const mocks = createIntegratedMocks();
  
  beforeEach(() => {
    mocks.resetAll();
  });

  it('データの同期フローが正常に動作する', async () => {
    // バイタルデータを追加
    await mocks.database.insertVitalData(
      createTestVitalData('歩数', { sync_status: 'pending' })
    );
    
    // 同期を実行
    await mocks.sync.syncNow();
    
    // APIが呼ばれたことを確認
    expect(mocks.api.uploadVitalsBatch).toHaveBeenCalled();
  });
});
```

### 3. 非同期処理のテスト

```typescript
// Promiseベースのテスト
it('非同期処理が正常に完了する', async () => {
  const result = await myAsyncFunction();
  expect(result).toBe('expected value');
});

// タイマーを使用するテスト
it('遅延処理が正常に動作する', async () => {
  jest.useFakeTimers();
  
  const promise = delayedFunction();
  
  // タイマーを進める
  jest.advanceTimersByTime(1000);
  
  const result = await promise;
  expect(result).toBe('delayed result');
  
  jest.useRealTimers();
});

// 並行処理のテスト
it('複数の非同期処理を並行実行できる', async () => {
  const promises = [
    asyncOperation1(),
    asyncOperation2(),
    asyncOperation3(),
  ];
  
  const results = await Promise.all(promises);
  expect(results).toHaveLength(3);
});
```

### 4. エラーハンドリングのテスト

```typescript
// 例外のテスト
it('無効な入力でエラーをスローする', async () => {
  await expect(myFunction(null)).rejects.toThrow('Invalid input');
});

// エラー状態のテスト
it('ネットワークエラー時にフォールバック処理が実行される', async () => {
  // ネットワークエラーをモック
  mockApi.getData.mockRejectedValue(new Error('Network error'));
  
  const result = await serviceWithFallback();
  
  // フォールバック値が返される
  expect(result).toBe('fallback value');
});

// Try-catchのテスト
it('エラーが適切にキャッチされる', async () => {
  const errorHandler = jest.fn();
  
  await functionWithErrorHandling(errorHandler);
  
  expect(errorHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.any(String)
    })
  );
});
```

### 5. エッジケースのテスト

```typescript
describe('エッジケース', () => {
  // 境界値テスト
  it.each([
    [0, 'zero'],
    [-1, 'negative'],
    [Number.MAX_SAFE_INTEGER, 'max'],
    [null, 'null'],
    [undefined, 'undefined'],
  ])('入力値 %p の処理', (input, description) => {
    const result = processValue(input);
    expect(result).toBeDefined();
  });

  // 特殊文字のテスト
  it('特殊文字を含む文字列を処理できる', () => {
    const specialChars = '!@#$%^&*()_+{}[]|\\:;"\'<>,.?/~`';
    const result = processString(specialChars);
    expect(result).not.toThrow();
  });

  // 大量データのテスト
  it('大量のデータを処理してもメモリリークしない', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 10000件のデータを処理
    for (let i = 0; i < 10000; i++) {
      processData({ id: i, value: `data-${i}` });
    }
    
    global.gc && global.gc(); // ガベージコレクションを強制実行
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    expect(memoryIncrease).toBeLessThan(50); // 50MB以下の増加
  });
});
```

## ベストプラクティス

### 1. テストの命名規則

- **describe**: 日本語でコンポーネント名や機能名を記述
- **it/test**: 期待される動作を日本語で記述

```typescript
describe('ログイン画面', () => {
  it('ユーザー名とパスワードを入力してログインできる', () => {
    // テストコード
  });
});
```

### 2. AAA パターン

すべてのテストは AAA (Arrange, Act, Assert) パターンに従う：

```typescript
it('商品を追加するとカート内の数量が増える', () => {
  // Arrange (準備)
  const cart = new ShoppingCart();
  const product = { id: 1, name: 'テスト商品', price: 1000 };
  
  // Act (実行)
  cart.addProduct(product);
  
  // Assert (検証)
  expect(cart.getItemCount()).toBe(1);
  expect(cart.getTotalPrice()).toBe(1000);
});
```

### 3. モックの適切な使用

- 外部依存は必ずモック化
- モックは最小限に留める
- 実装の詳細ではなく、振る舞いをテスト

```typescript
// ❌ 悪い例：実装の詳細をテスト
it('内部メソッドが呼ばれる', () => {
  const spy = jest.spyOn(component, '_privateMethod');
  component.publicMethod();
  expect(spy).toHaveBeenCalled();
});

// ✅ 良い例：振る舞いをテスト
it('公開メソッドが期待される結果を返す', () => {
  const result = component.publicMethod();
  expect(result).toBe('expected result');
});
```

### 4. テストの独立性

各テストは独立して実行可能であるべき：

```typescript
describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    // 各テストの前に新しいインスタンスを作成
    userService = new UserService();
  });
  
  afterEach(() => {
    // 各テストの後にクリーンアップ
    jest.clearAllMocks();
  });
});
```

### 5. waitFor の適切な使用

非同期処理のテストでは `waitFor` を適切に使用：

```typescript
// ❌ 悪い例：固定の待機時間
it('データが表示される', async () => {
  render(<DataComponent />);
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(getByText('データ')).toBeTruthy();
});

// ✅ 良い例：条件を待つ
it('データが表示される', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(getByText('データ')).toBeTruthy();
  });
});
```

## テストのデバッグ

### 1. コンソールログの使用

```typescript
it('複雑な処理のデバッグ', () => {
  const result = complexFunction();
  
  // デバッグ用のログ（コミット前に削除）
  console.log('Result:', JSON.stringify(result, null, 2));
  
  expect(result).toMatchObject({ /* ... */ });
});
```

### 2. デバッガーの使用

```typescript
it('ブレークポイントでデバッグ', () => {
  const data = setupTestData();
  
  // デバッガーを起動
  debugger;
  
  const result = processData(data);
  expect(result).toBeDefined();
});
```

### 3. スナップショットテスト

```typescript
it('コンポーネントの出力が変わらない', () => {
  const tree = render(<MyComponent />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

## パフォーマンステスト

```typescript
import { measurePerformance } from '../helpers/testUtils';

describe('パフォーマンス', () => {
  it('大量データの処理が1秒以内に完了する', async () => {
    const data = generateLargeDataset(10000);
    
    const duration = await measurePerformance('processLargeDataset', async () => {
      await processDataset(data);
    });
    
    expect(duration).toBeLessThan(1000);
  });
});
```

## CI/CD での実行

### GitHub Actions での設定例

```yaml
- name: Run tests
  run: |
    cd HDBApp
    npm test -- --coverage --watchAll=false
    
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./HDBApp/coverage/lcov.info
```

## トラブルシューティング

### よくある問題と解決方法

1. **モックが正しく動作しない**
   - `jest.clearAllMocks()` を `beforeEach` で呼ぶ
   - モジュールパスが正しいか確認

2. **非同期テストがタイムアウトする**
   - `jest.setTimeout(10000)` でタイムアウトを延長
   - `waitFor` のオプションでタイムアウトを設定

3. **メモリリーク警告**
   - コンポーネントのアンマウント処理を確認
   - イベントリスナーの削除を確認

## 参考リンク

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)