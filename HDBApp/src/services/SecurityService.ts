import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import CryptoJS from 'react-native-crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseService } from './DatabaseService';

interface SecurityConfig {
  biometricEnabled: boolean;
  encryptionEnabled: boolean;
  autoLockTimeout: number; // minutes
  requireAuthOnResume: boolean;
  secureStorageEnabled: boolean;
}

interface EncryptedData {
  iv: string;
  salt: string;
  ciphertext: string;
  hmac: string;
}

export class SecurityService {
  private static instance: SecurityService;
  private rnBiometrics: ReactNativeBiometrics;
  private dbService: DatabaseService;
  private config: SecurityConfig = {
    biometricEnabled: false,
    encryptionEnabled: true,
    autoLockTimeout: 5,
    requireAuthOnResume: true,
    secureStorageEnabled: true,
  };
  private masterKey: string | null = null;
  private sessionKey: string | null = null;
  private lastActivityTime: Date = new Date();

  private constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
    this.dbService = DatabaseService.getInstance();
    this.initialize();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // 初期化
  private async initialize(): Promise<void> {
    try {
      // 設定の読み込み
      await this.loadConfig();
      
      // マスターキーの初期化
      await this.initializeMasterKey();
      
      // 生体認証の可用性チェック
      const biometryType = await this.checkBiometricAvailability();
      console.log(`[Security] Biometry available: ${biometryType}`);
      
      // セキュリティテーブルの作成
      await this.createSecurityTables();
      
      console.log('[Security] Initialized successfully');
    } catch (error) {
      console.error('[Security] Initialization failed:', error);
    }
  }

  // セキュリティテーブルの作成
  private async createSecurityTables(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        details TEXT,
        success INTEGER DEFAULT 1
      )
    `;
    
    await this.dbService.executeSql(sql);
  }

  // 生体認証の可用性チェック
  async checkBiometricAvailability(): Promise<BiometryTypes | null> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      if (available) {
        return biometryType as BiometryTypes;
      }
      
      return null;
    } catch (error) {
      console.error('[Security] Biometric check failed:', error);
      return null;
    }
  }

  // 生体認証の実行
  async authenticateWithBiometrics(reason: string = 'アプリへのアクセスを認証してください'): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'キャンセル',
      });
      
      await this.logSecurityEvent('biometric_auth', { success });
      
      if (success) {
        await this.unlockSession();
      }
      
      return success;
    } catch (error) {
      console.error('[Security] Biometric authentication failed:', error);
      await this.logSecurityEvent('biometric_auth', { success: false, error: error.message });
      return false;
    }
  }

  // マスターキーの初期化
  private async initializeMasterKey(): Promise<void> {
    try {
      // Keychainからマスターキーを取得
      const credentials = await Keychain.getInternetCredentials('hdb.masterkey');
      
      if (credentials) {
        this.masterKey = credentials.password;
      } else {
        // 新しいマスターキーを生成
        this.masterKey = this.generateSecureKey();
        
        // Keychainに保存
        await Keychain.setInternetCredentials(
          'hdb.masterkey',
          'masterkey',
          this.masterKey
        );
      }
    } catch (error) {
      console.error('[Security] Master key initialization failed:', error);
      // フォールバック: デバイス固有のキーを使用
      this.masterKey = this.generateDeviceKey();
    }
  }

  // セキュアなキーの生成
  private generateSecureKey(): string {
    const array = new Uint8Array(32);
    // React Native環境でのランダム値生成
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return CryptoJS.lib.WordArray.create(array).toString();
  }

  // デバイス固有キーの生成
  private generateDeviceKey(): string {
    // デバイスIDとタイムスタンプを組み合わせてキーを生成
    const deviceId = 'device_' + Date.now().toString();
    return CryptoJS.SHA256(deviceId).toString();
  }

  // データの暗号化
  async encryptData(data: any): Promise<string> {
    if (!this.config.encryptionEnabled || !this.masterKey) {
      return JSON.stringify(data);
    }
    
    try {
      const plaintext = JSON.stringify(data);
      
      // IV（初期化ベクトル）の生成
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      // Salt の生成
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      
      // キーの導出（PBKDF2）
      const key = CryptoJS.PBKDF2(this.masterKey, salt, {
        keySize: 256 / 32,
        iterations: 1000,
      });
      
      // AES暗号化
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // HMAC計算（改ざん検知用）
      const hmac = CryptoJS.HmacSHA256(encrypted.toString(), key);
      
      const encryptedData: EncryptedData = {
        iv: iv.toString(),
        salt: salt.toString(),
        ciphertext: encrypted.toString(),
        hmac: hmac.toString(),
      };
      
      return JSON.stringify(encryptedData);
    } catch (error) {
      console.error('[Security] Encryption failed:', error);
      throw error;
    }
  }

  // データの復号化
  async decryptData(encryptedDataStr: string): Promise<any> {
    if (!this.config.encryptionEnabled || !this.masterKey) {
      return JSON.parse(encryptedDataStr);
    }
    
    try {
      const encryptedData: EncryptedData = JSON.parse(encryptedDataStr);
      
      // キーの導出
      const key = CryptoJS.PBKDF2(this.masterKey, CryptoJS.enc.Hex.parse(encryptedData.salt), {
        keySize: 256 / 32,
        iterations: 1000,
      });
      
      // HMAC検証
      const hmac = CryptoJS.HmacSHA256(encryptedData.ciphertext, key);
      if (hmac.toString() !== encryptedData.hmac) {
        throw new Error('Data integrity check failed');
      }
      
      // AES復号化
      const decrypted = CryptoJS.AES.decrypt(encryptedData.ciphertext, key, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(plaintext);
    } catch (error) {
      console.error('[Security] Decryption failed:', error);
      throw error;
    }
  }

  // セキュアストレージへの保存
  async secureStore(key: string, value: any): Promise<void> {
    if (!this.config.secureStorageEnabled) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return;
    }
    
    try {
      const encrypted = await this.encryptData(value);
      await AsyncStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('[Security] Secure store failed:', error);
      throw error;
    }
  }

  // セキュアストレージからの取得
  async secureRetrieve(key: string): Promise<any> {
    if (!this.config.secureStorageEnabled) {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    
    try {
      const encrypted = await AsyncStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      return await this.decryptData(encrypted);
    } catch (error) {
      console.error('[Security] Secure retrieve failed:', error);
      return null;
    }
  }

  // 認証情報の保存
  async saveCredentials(username: string, password: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'hdb.app',
        username,
        password
      );
      
      await this.logSecurityEvent('credentials_saved', { username });
    } catch (error) {
      console.error('[Security] Save credentials failed:', error);
      throw error;
    }
  }

  // 認証情報の取得
  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('hdb.app');
      
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      
      return null;
    } catch (error) {
      console.error('[Security] Get credentials failed:', error);
      return null;
    }
  }

  // 認証情報の削除
  async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials('hdb.app');
      await this.logSecurityEvent('credentials_cleared', {});
    } catch (error) {
      console.error('[Security] Clear credentials failed:', error);
    }
  }

  // セッションのロック解除
  private async unlockSession(): Promise<void> {
    this.sessionKey = this.generateSecureKey();
    this.lastActivityTime = new Date();
    await this.logSecurityEvent('session_unlocked', {});
  }

  // セッションのロック
  async lockSession(): Promise<void> {
    this.sessionKey = null;
    await this.logSecurityEvent('session_locked', {});
  }

  // セッションの有効性チェック
  isSessionValid(): boolean {
    if (!this.sessionKey) return false;
    
    const now = new Date();
    const diff = now.getTime() - this.lastActivityTime.getTime();
    const timeoutMs = this.config.autoLockTimeout * 60 * 1000;
    
    if (diff > timeoutMs) {
      this.lockSession();
      return false;
    }
    
    return true;
  }

  // アクティビティの更新
  updateActivity(): void {
    this.lastActivityTime = new Date();
  }

  // データベースの暗号化
  async encryptDatabase(): Promise<void> {
    // SQLCipherを使用したデータベース暗号化
    // React Native SQLiteの暗号化拡張が必要
    console.log('[Security] Database encryption would be implemented with SQLCipher');
  }

  // セキュリティイベントのログ
  private async logSecurityEvent(eventType: string, details: any): Promise<void> {
    const sql = `
      INSERT INTO security_logs (event_type, timestamp, details, success)
      VALUES (?, ?, ?, ?)
    `;
    
    await this.dbService.executeSql(sql, [
      eventType,
      new Date().toISOString(),
      JSON.stringify(details),
      details.success !== false ? 1 : 0,
    ]);
  }

  // セキュリティログの取得
  async getSecurityLogs(limit: number = 100): Promise<any[]> {
    const sql = `
      SELECT * FROM security_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    const result = await this.dbService.executeSql(sql, [limit]);
    const logs = [];
    
    for (let i = 0; i < result.rows.length; i++) {
      logs.push(result.rows.item(i));
    }
    
    return logs;
  }

  // 設定の保存
  async saveConfig(config: SecurityConfig): Promise<void> {
    this.config = config;
    await AsyncStorage.setItem('security_config', JSON.stringify(config));
  }

  // 設定の読み込み
  private async loadConfig(): Promise<void> {
    const data = await AsyncStorage.getItem('security_config');
    if (data) {
      this.config = JSON.parse(data);
    }
  }

  // 設定の取得
  getConfig(): SecurityConfig {
    return this.config;
  }

  // アプリのセキュリティ状態チェック
  async performSecurityCheck(): Promise<{
    isSecure: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // 生体認証チェック
    if (this.config.biometricEnabled) {
      const biometryType = await this.checkBiometricAvailability();
      if (!biometryType) {
        issues.push('生体認証が利用できません');
      }
    }
    
    // マスターキーチェック
    if (!this.masterKey) {
      issues.push('暗号化キーが初期化されていません');
    }
    
    // 最近の認証失敗チェック
    const recentLogs = await this.getSecurityLogs(10);
    const failedAuths = recentLogs.filter(log => 
      log.event_type === 'biometric_auth' && log.success === 0
    );
    
    if (failedAuths.length > 3) {
      issues.push('最近の認証失敗が多すぎます');
    }
    
    return {
      isSecure: issues.length === 0,
      issues,
    };
  }

  // データのエクスポート（暗号化付き）
  async exportSecureData(data: any, password: string): Promise<string> {
    // パスワードベースの暗号化
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password);
    return encrypted.toString();
  }

  // データのインポート（復号化付き）
  async importSecureData(encryptedData: string, password: string): Promise<any> {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, password);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(plaintext);
    } catch (error) {
      throw new Error('パスワードが正しくないか、データが破損しています');
    }
  }
}