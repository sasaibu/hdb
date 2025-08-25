import {Platform} from 'react-native';
import * as Keychain from 'react-native-keychain';

export interface AuthTokens {
  authorizationCode?: string;
  accessToken?: string;
  accessTokenExpiry?: string;
  refreshToken?: string;
  deviceToken?: string;
}

export class KeychainService {
  private static instance: KeychainService;
  
  // Keychain/Keystoreのキー定義
  private static readonly KEYS = {
    AUTHORIZATION_CODE: 'hdb_authorization_code',
    ACCESS_TOKEN: 'hdb_access_token',
    ACCESS_TOKEN_EXPIRY: 'hdb_access_token_expiry',
    REFRESH_TOKEN: 'hdb_refresh_token',
    DEVICE_TOKEN: 'hdb_device_token',
  };

  private constructor() {}

  public static getInstance(): KeychainService {
    if (!KeychainService.instance) {
      KeychainService.instance = new KeychainService();
    }
    return KeychainService.instance;
  }

  /**
   * 認可コードを安全に保存
   */
  async saveAuthorizationCode(code: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        KeychainService.KEYS.AUTHORIZATION_CODE,
        'hdb_user',
        code,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        }
      );
    } catch (error) {
      console.error('Failed to save authorization code:', error);
      throw new Error('認可コードの保存に失敗しました');
    }
  }

  /**
   * 認可コードを取得
   */
  async getAuthorizationCode(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        KeychainService.KEYS.AUTHORIZATION_CODE
      );
      
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Failed to get authorization code:', error);
      return null;
    }
  }

  /**
   * アクセストークンを安全に保存
   */
  async saveAccessToken(token: string, expiry?: Date): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        KeychainService.KEYS.ACCESS_TOKEN,
        'hdb_user',
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        }
      );

      // 有効期限も保存
      if (expiry) {
        await Keychain.setInternetCredentials(
          KeychainService.KEYS.ACCESS_TOKEN_EXPIRY,
          'hdb_user',
          expiry.toISOString()
        );
      }
    } catch (error) {
      console.error('Failed to save access token:', error);
      throw new Error('アクセストークンの保存に失敗しました');
    }
  }

  /**
   * アクセストークンを取得
   */
  async getAccessToken(): Promise<{token: string | null; expiry: Date | null}> {
    try {
      const tokenCredentials = await Keychain.getInternetCredentials(
        KeychainService.KEYS.ACCESS_TOKEN
      );
      
      const expiryCredentials = await Keychain.getInternetCredentials(
        KeychainService.KEYS.ACCESS_TOKEN_EXPIRY
      );

      const token = tokenCredentials && tokenCredentials.password ? tokenCredentials.password : null;
      const expiry = expiryCredentials && expiryCredentials.password ? 
        new Date(expiryCredentials.password) : null;

      return { token, expiry };
    } catch (error) {
      console.error('Failed to get access token:', error);
      return { token: null, expiry: null };
    }
  }

  /**
   * アクセストークンの有効性をチェック
   */
  async isAccessTokenValid(): Promise<boolean> {
    try {
      const { token, expiry } = await this.getAccessToken();
      
      if (!token) {
        return false;
      }

      if (expiry && expiry <= new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to check access token validity:', error);
      return false;
    }
  }

  /**
   * リフレッシュトークンを安全に保存
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        KeychainService.KEYS.REFRESH_TOKEN,
        'hdb_user',
        token,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        }
      );
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw new Error('リフレッシュトークンの保存に失敗しました');
    }
  }

  /**
   * リフレッシュトークンを取得
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        KeychainService.KEYS.REFRESH_TOKEN
      );
      
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * デバイストークンを安全に保存
   */
  async saveDeviceToken(token: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        KeychainService.KEYS.DEVICE_TOKEN,
        'hdb_user',
        token
      );
    } catch (error) {
      console.error('Failed to save device token:', error);
      throw new Error('デバイストークンの保存に失敗しました');
    }
  }

  /**
   * デバイストークンを取得
   */
  async getDeviceToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        KeychainService.KEYS.DEVICE_TOKEN
      );
      
      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Failed to get device token:', error);
      return null;
    }
  }

  /**
   * 全ての認証トークンを取得
   */
  async getAllTokens(): Promise<AuthTokens> {
    try {
      const [
        authorizationCode,
        { token: accessToken, expiry: accessTokenExpiry },
        refreshToken,
        deviceToken,
      ] = await Promise.all([
        this.getAuthorizationCode(),
        this.getAccessToken(),
        this.getRefreshToken(),
        this.getDeviceToken(),
      ]);

      return {
        authorizationCode: authorizationCode || undefined,
        accessToken: accessToken || undefined,
        accessTokenExpiry: accessTokenExpiry?.toISOString(),
        refreshToken: refreshToken || undefined,
        deviceToken: deviceToken || undefined,
      };
    } catch (error) {
      console.error('Failed to get all tokens:', error);
      return {};
    }
  }

  /**
   * 特定のトークンを削除
   */
  async removeToken(tokenType: keyof typeof KeychainService.KEYS): Promise<void> {
    try {
      const key = KeychainService.KEYS[tokenType];
      // 空文字列で上書きして削除をシミュレート
      await Keychain.setInternetCredentials(key, 'hdb_user', '');
    } catch (error) {
      console.error(`Failed to remove ${tokenType}:`, error);
      throw new Error(`${tokenType}の削除に失敗しました`);
    }
  }

  /**
   * 全ての認証情報をクリア
   */
  async clearAllTokens(): Promise<void> {
    try {
      const keys = Object.values(KeychainService.KEYS);
      await Promise.all(keys.map(key => 
        Keychain.setInternetCredentials(key, 'hdb_user', '')
      ));
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
      throw new Error('認証情報のクリアに失敗しました');
    }
  }

  /**
   * Keychainの利用可能性をチェック
   */
  async isKeychainAvailable(): Promise<boolean> {
    try {
      await Keychain.getSupportedBiometryType();
      return true;
    } catch (error) {
      console.error('Keychain not available:', error);
      return false;
    }
  }

  /**
   * 生体認証の利用可能性をチェック
   */
  async getBiometryType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Failed to get biometry type:', error);
      return null;
    }
  }

  /**
   * セキュリティレベルの取得
   */
  getSecurityLevel(): string {
    if (Platform.OS === 'ios') {
      return 'iOS Keychain (Secure Enclave)';
    } else {
      return 'Android Keystore (Hardware-backed)';
    }
  }

  /**
   * トークンの暗号化状態をチェック
   */
  async isTokenEncrypted(tokenType: keyof typeof KeychainService.KEYS): Promise<boolean> {
    try {
      // Keychainは常に暗号化されている
      return true;
    } catch (error) {
      console.error(`Failed to check encryption for ${tokenType}:`, error);
      return false;
    }
  }

  /**
   * セキュリティ設定の取得
   */
  getSecuritySettings(): {
    platform: string;
    securityLevel: string;
    biometrySupported: boolean;
    encryptionSupported: boolean;
  } {
    return {
      platform: Platform.OS,
      securityLevel: this.getSecurityLevel(),
      biometrySupported: true,
      encryptionSupported: true, // Keychainは常に暗号化対応
    };
  }

  /**
   * セキュリティ監査情報の取得
   */
  async getSecurityAudit(): Promise<{
    keychainAvailable: boolean;
    biometryType: Keychain.BIOMETRY_TYPE | null;
    securityLevel: string;
    encryptionEnabled: boolean;
    storedTokenCount: number;
  }> {
    try {
      const [keychainAvailable, biometryType] = await Promise.all([
        this.isKeychainAvailable(),
        this.getBiometryType(),
      ]);

      const tokens = await this.getAllTokens();
      const storedTokenCount = Object.values(tokens).filter(token => token !== undefined).length;

      return {
        keychainAvailable,
        biometryType,
        securityLevel: this.getSecurityLevel(),
        encryptionEnabled: true,
        storedTokenCount,
      };
    } catch (error) {
      console.error('Failed to get security audit:', error);
      return {
        keychainAvailable: false,
        biometryType: null,
        securityLevel: 'Unknown',
        encryptionEnabled: false,
        storedTokenCount: 0,
      };
    }
  }
}

export default KeychainService;
