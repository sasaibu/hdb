# セキュリティ方式設計書

## 1. 概要
HDBアプリケーションのセキュリティ実装方針と具体的な実装方法を定義する。

## 2. セキュリティ要件

### 2.1 認証・認可
- **多要素認証（MFA）**: 生体認証 + パスワード
- **セッション管理**: JWT + リフレッシュトークン
- **アクセス制御**: ロールベースアクセス制御（RBAC）

### 2.2 データ保護
- **保存時暗号化**: AES-256-GCM
- **通信時暗号化**: TLS 1.3
- **キー管理**: iOS Keychain / Android Keystore

### 2.3 プライバシー保護
- **個人情報匿名化**: ハッシュ化（SHA-256）
- **データ最小化**: 必要最小限のデータ収集
- **同意管理**: 明示的な同意取得機能

## 3. 実装アーキテクチャ

### 3.1 認証フロー
```
1. ユーザーログイン要求
2. 生体認証チャレンジ
3. パスワード検証
4. JWT発行（有効期限: 15分）
5. リフレッシュトークン発行（有効期限: 7日）
```

### 3.2 データ暗号化レイヤー
```
アプリケーション層
    ↓
暗号化サービス層（AES-256-GCM）
    ↓
ストレージ層（SQLite/AsyncStorage）
```

### 3.3 通信セキュリティ
```
クライアント（React Native）
    ↓ HTTPS (TLS 1.3)
APIゲートウェイ
    ↓ 内部通信（mTLS）
バックエンドサービス
```

## 4. 実装詳細

### 4.1 認証サービス（AuthService.ts）
```typescript
interface AuthService {
  // 生体認証
  biometricAuthenticate(): Promise<boolean>
  
  // トークン管理
  generateJWT(userId: string): string
  refreshToken(refreshToken: string): Promise<string>
  
  // セッション管理
  validateSession(token: string): boolean
  revokeSession(sessionId: string): void
}
```

### 4.2 暗号化サービス（CryptoService.ts）
```typescript
interface CryptoService {
  // データ暗号化
  encrypt(data: string, key: string): Promise<string>
  decrypt(encryptedData: string, key: string): Promise<string>
  
  // キー管理
  generateKey(): string
  storeKey(key: string): Promise<void>
  retrieveKey(): Promise<string>
}
```

### 4.3 セキュアストレージ（SecureStorage.ts）
```typescript
interface SecureStorage {
  // セキュアな保存
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
  
  // 暗号化オプション
  setEncrypted(key: string, value: string): Promise<void>
  getDecrypted(key: string): Promise<string | null>
}
```

## 5. セキュリティ実装チェックリスト

### 5.1 認証・認可
- [ ] 生体認証の実装（TouchID/FaceID, Fingerprint）
- [ ] JWT実装とトークン管理
- [ ] リフレッシュトークン機構
- [ ] セッションタイムアウト処理
- [ ] 強制ログアウト機能

### 5.2 データ保護
- [ ] AES-256暗号化の実装
- [ ] Keychain/Keystoreとの連携
- [ ] SQLite暗号化（SQLCipher）
- [ ] メモリ上の機密データクリア
- [ ] スクリーンショット防止

### 5.3 通信セキュリティ
- [ ] Certificate Pinning実装
- [ ] API通信のHTTPS強制
- [ ] リクエスト署名機能
- [ ] レート制限実装
- [ ] CORS設定

### 5.4 アプリケーションセキュリティ
- [ ] ルート化/脱獄検知
- [ ] デバッグ検知
- [ ] コード難読化（ProGuard/R8）
- [ ] 改ざん検知
- [ ] セキュアコーディング規約準拠

### 5.5 プライバシー
- [ ] GDPR/個人情報保護法対応
- [ ] データ削除機能
- [ ] エクスポート機能
- [ ] 同意管理画面
- [ ] プライバシーポリシー表示

## 6. 依存ライブラリ

### 必須ライブラリ
```json
{
  "react-native-keychain": "^8.2.0",          // キー管理
  "react-native-biometrics": "^3.0.1",        // 生体認証
  "react-native-crypto": "^2.2.0",            // 暗号化
  "react-native-ssl-pinning": "^1.5.0",       // Certificate Pinning
  "react-native-sqlite-storage": "^6.0.1",    // SQLite（暗号化対応版）
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

### 追加予定ライブラリ
```json
{
  "react-native-jailmonkey": "^2.8.0",        // ルート化検知
  "react-native-obfuscating-transformer": "^1.0.0",  // コード難読化
  "react-native-secure-key-store": "^2.0.10"  // セキュアストレージ
}
```

## 7. 実装優先順位

### Phase 1（即実装）
1. 基本認証（ユーザー名/パスワード）
2. HTTPS通信
3. AsyncStorageの暗号化

### Phase 2（1週間以内）
1. 生体認証統合
2. JWT実装
3. Keychain/Keystore連携

### Phase 3（2週間以内）
1. Certificate Pinning
2. SQLite暗号化
3. ルート化/脱獄検知

### Phase 4（1ヶ月以内）
1. 完全なMFA実装
2. セキュリティ監査
3. ペネトレーションテスト

## 8. セキュリティテスト計画

### 8.1 単体テスト
- 暗号化/復号化機能
- トークン検証
- セッション管理

### 8.2 統合テスト
- 認証フロー全体
- データ保護機能
- 通信セキュリティ

### 8.3 セキュリティテスト
- OWASP Mobile Top 10対応確認
- 脆弱性スキャン（静的/動的）
- ペネトレーションテスト

## 9. インシデント対応

### 9.1 ログ収集
- セキュリティイベントログ
- 認証失敗ログ
- 異常アクセスログ

### 9.2 アラート設定
- 連続認証失敗
- 異常なデータアクセス
- 不正なAPI呼び出し

### 9.3 対応手順
1. インシデント検知
2. 影響範囲特定
3. 緊急対応（アカウント停止等）
4. 原因調査
5. 恒久対策実施

## 10. コンプライアンス

### 10.1 準拠規格
- ISO 27001（情報セキュリティ）
- ISO 27701（プライバシー管理）
- PCI DSS（決済カード業界）

### 10.2 法規制対応
- 個人情報保護法（日本）
- GDPR（EU）
- HIPAA（医療情報：米国）

### 10.3 業界標準
- OWASP Mobile Security
- NIST Cybersecurity Framework
- CIS Controls

## 11. 更新履歴
- 2025-01-06: 初版作成
- セキュリティ要件定義
- 実装アーキテクチャ策定
- 実装チェックリスト作成