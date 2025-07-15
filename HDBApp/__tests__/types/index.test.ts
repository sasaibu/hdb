import {
  User,
  UserProfile,
  VitalData,
  VitalType,
  BloodPressureValue,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Notification,
  AppSettings,
  AppError,
} from '../../src/types/index';

describe('Type Definitions', () => {
  describe('User', () => {
    it('正しい構造を持つ', () => {
      const user: User = {
        id: 'user123',
        username: 'testuser',
      };

      expect(typeof user.id).toBe('string');
      expect(typeof user.username).toBe('string');
    });

    it('オプショナルフィールドを持つ', () => {
      const userWithOptionals: User = {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        profile: {
          nickname: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
          birthDate: '1990-01-01',
          gender: 'male',
          height: 170,
          targetWeight: 65,
        },
      };

      expect(userWithOptionals.email).toBe('test@example.com');
      expect(userWithOptionals.profile?.nickname).toBe('Test User');
      expect(userWithOptionals.profile?.avatar).toBe('https://example.com/avatar.jpg');
      expect(userWithOptionals.profile?.birthDate).toBe('1990-01-01');
      expect(userWithOptionals.profile?.gender).toBe('male');
      expect(userWithOptionals.profile?.height).toBe(170);
      expect(userWithOptionals.profile?.targetWeight).toBe(65);
    });
  });

  describe('VitalData', () => {
    it('正しい構造を持つ', () => {
      const vitalData: VitalData = {
        id: 'vital123',
        type: 'steps',
        value: 10000,
        unit: 'steps',
        timestamp: '2024-01-01T00:00:00Z',
        source: 'manual',
      };

      expect(typeof vitalData.id).toBe('string');
      expect(typeof vitalData.type).toBe('string');
      expect(typeof vitalData.value).toBe('number');
      expect(typeof vitalData.unit).toBe('string');
      expect(typeof vitalData.timestamp).toBe('string');
      expect(typeof vitalData.source).toBe('string');
    });

    it('血圧データの構造を持つ', () => {
      const bloodPressureData: VitalData = {
        id: 'vital123',
        type: 'bloodPressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: '2024-01-01T00:00:00Z',
        source: 'manual',
      };

      expect(typeof bloodPressureData.value).toBe('object');
      expect((bloodPressureData.value as BloodPressureValue).systolic).toBe(120);
      expect((bloodPressureData.value as BloodPressureValue).diastolic).toBe(80);
    });
  });

  describe('VitalType', () => {
    it('有効なバイタルタイプを含む', () => {
      const validTypes: VitalType[] = ['steps', 'weight', 'temperature', 'bodyFat', 'bloodPressure', 'heartRate'];
      
      validTypes.forEach(type => {
        expect(['steps', 'weight', 'temperature', 'bodyFat', 'bloodPressure', 'heartRate']).toContain(type);
      });
    });
  });

  describe('BloodPressureValue', () => {
    it('正しい構造を持つ', () => {
      const bloodPressure: BloodPressureValue = {
        systolic: 120,
        diastolic: 80,
      };

      expect(typeof bloodPressure.systolic).toBe('number');
      expect(typeof bloodPressure.diastolic).toBe('number');
    });
  });

  describe('UserProfile', () => {
    it('全てのフィールドがオプショナルである', () => {
      const emptyProfile: UserProfile = {};
      const fullProfile: UserProfile = {
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        birthDate: '1990-01-01',
        gender: 'male',
        height: 170,
        targetWeight: 65,
      };

      expect(emptyProfile).toEqual({});
      expect(fullProfile.nickname).toBe('Test User');
      expect(fullProfile.avatar).toBe('https://example.com/avatar.jpg');
      expect(fullProfile.birthDate).toBe('1990-01-01');
      expect(fullProfile.gender).toBe('male');
      expect(fullProfile.height).toBe(170);
      expect(fullProfile.targetWeight).toBe(65);
    });

    it('genderフィールドが正しい値を持つ', () => {
      const maleProfile: UserProfile = { gender: 'male' };
      const femaleProfile: UserProfile = { gender: 'female' };
      const otherProfile: UserProfile = { gender: 'other' };

      expect(maleProfile.gender).toBe('male');
      expect(femaleProfile.gender).toBe('female');
      expect(otherProfile.gender).toBe('other');
    });
  });

  describe('Notification', () => {
    it('正しい構造を持つ', () => {
      const notification: Notification = {
        id: 'notif123',
        title: 'Test Notification',
        message: 'This is a test message',
        type: 'info',
        timestamp: '2024-01-01T00:00:00Z',
        read: false,
      };

      expect(typeof notification.id).toBe('string');
      expect(typeof notification.title).toBe('string');
      expect(typeof notification.message).toBe('string');
      expect(typeof notification.type).toBe('string');
      expect(typeof notification.timestamp).toBe('string');
      expect(typeof notification.read).toBe('boolean');
    });

    it('typeフィールドが正しい値を持つ', () => {
      const infoNotification: Notification = {
        id: '1', title: 'Info', message: 'Info message', type: 'info', timestamp: '2024-01-01T00:00:00Z', read: false
      };
      const warningNotification: Notification = {
        id: '2', title: 'Warning', message: 'Warning message', type: 'warning', timestamp: '2024-01-01T00:00:00Z', read: false
      };
      const errorNotification: Notification = {
        id: '3', title: 'Error', message: 'Error message', type: 'error', timestamp: '2024-01-01T00:00:00Z', read: false
      };
      const successNotification: Notification = {
        id: '4', title: 'Success', message: 'Success message', type: 'success', timestamp: '2024-01-01T00:00:00Z', read: false
      };

      expect(infoNotification.type).toBe('info');
      expect(warningNotification.type).toBe('warning');
      expect(errorNotification.type).toBe('error');
      expect(successNotification.type).toBe('success');
    });
  });

  describe('AppSettings', () => {
    it('正しい構造を持つ', () => {
      const settings: AppSettings = {
        notifications: {
          push: true,
          daily: true,
          weekly: false,
          achievements: true,
        },
        health: {
          healthKitEnabled: true,
          googleFitEnabled: false,
          autoSync: true,
        },
        privacy: {
          dataSharing: false,
          analytics: true,
        },
      };

      expect(typeof settings.notifications.push).toBe('boolean');
      expect(typeof settings.notifications.daily).toBe('boolean');
      expect(typeof settings.notifications.weekly).toBe('boolean');
      expect(typeof settings.notifications.achievements).toBe('boolean');
      expect(typeof settings.health.healthKitEnabled).toBe('boolean');
      expect(typeof settings.health.googleFitEnabled).toBe('boolean');
      expect(typeof settings.health.autoSync).toBe('boolean');
      expect(typeof settings.privacy.dataSharing).toBe('boolean');
      expect(typeof settings.privacy.analytics).toBe('boolean');
    });
  });

  describe('AppError', () => {
    it('正しい構造を持つ', () => {
      const error: AppError = {
        code: 'E001',
        message: 'Something went wrong',
        timestamp: '2024-01-01T00:00:00Z',
      };

      expect(typeof error.code).toBe('string');
      expect(typeof error.message).toBe('string');
      expect(typeof error.timestamp).toBe('string');
    });

    it('オプショナルフィールドを持つ', () => {
      const errorWithDetails: AppError = {
        code: 'E001',
        message: 'Something went wrong',
        timestamp: '2024-01-01T00:00:00Z',
        details: { stack: 'Error stack trace' },
      };

      expect(errorWithDetails.details).toEqual({ stack: 'Error stack trace' });
    });
  });

  describe('ApiResponse', () => {
    it('成功レスポンスの構造を持つ', () => {
      const successResponse: ApiResponse<string> = {
        success: true,
        data: 'test data',
        timestamp: '2024-01-01T00:00:00Z',
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBe('test data');
      expect(successResponse.timestamp).toBe('2024-01-01T00:00:00Z');
    });

    it('エラーレスポンスの構造を持つ', () => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        timestamp: '2024-01-01T00:00:00Z',
        error: 'Error occurred',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.timestamp).toBe('2024-01-01T00:00:00Z');
      expect(errorResponse.error).toBe('Error occurred');
    });
  });

  describe('LoginRequest', () => {
    it('正しい構造を持つ', () => {
      const loginRequest: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      expect(typeof loginRequest.username).toBe('string');
      expect(typeof loginRequest.password).toBe('string');
    });
  });

  describe('LoginResponse', () => {
    it('正しい構造を持つ', () => {
      const loginResponse: LoginResponse = {
        token: 'jwt_token_123',
        user: {
          id: 'user123',
          username: 'testuser',
          email: 'test@example.com',
          profile: {
            nickname: 'Test User',
          },
        },
        expiresAt: '2024-01-02T00:00:00Z',
      };

      expect(typeof loginResponse.token).toBe('string');
      expect(typeof loginResponse.user.id).toBe('string');
      expect(typeof loginResponse.expiresAt).toBe('string');
    });
  });

  describe('Type Compatibility', () => {
    it('VitalTypeがVitalDataのtypeと互換性がある', () => {
      const vitalTypes: VitalType[] = ['steps', 'weight', 'temperature', 'bodyFat', 'bloodPressure', 'heartRate'];
      
      vitalTypes.forEach(type => {
        const record: VitalData = {
          id: 'vital123',
          type: type,
          value: 100,
          unit: 'unit',
          timestamp: '2024-01-01T00:00:00Z',
          source: 'manual',
        };
        
        expect(record.type).toBe(type);
      });
    });

    it('ApiResponseが異なる型で正しく動作する', () => {
      const stringResponse: ApiResponse<string> = {
        success: true,
        data: 'test',
        timestamp: '2024-01-01T00:00:00Z',
      };

      const numberResponse: ApiResponse<number> = {
        success: true,
        data: 123,
        timestamp: '2024-01-01T00:00:00Z',
      };

      const objectResponse: ApiResponse<VitalData> = {
        success: true,
        data: {
          id: 'vital123',
          type: 'steps',
          value: 10000,
          unit: 'steps',
          timestamp: '2024-01-01T00:00:00Z',
          source: 'manual',
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      expect(typeof stringResponse.data).toBe('string');
      expect(typeof numberResponse.data).toBe('number');
      expect(typeof objectResponse.data?.id).toBe('string');
    });

    it('sourceフィールドが正しい値を持つ', () => {
      const manualData: VitalData = {
        id: 'vital1',
        type: 'steps',
        value: 10000,
        unit: 'steps',
        timestamp: '2024-01-01T00:00:00Z',
        source: 'manual',
      };

      const healthkitData: VitalData = {
        id: 'vital2',
        type: 'weight',
        value: 65.5,
        unit: 'kg',
        timestamp: '2024-01-01T00:00:00Z',
        source: 'healthkit',
      };

      const googlefitData: VitalData = {
        id: 'vital3',
        type: 'heartRate',
        value: 72,
        unit: 'bpm',
        timestamp: '2024-01-01T00:00:00Z',
        source: 'googlefit',
      };

      expect(manualData.source).toBe('manual');
      expect(healthkitData.source).toBe('healthkit');
      expect(googlefitData.source).toBe('googlefit');
    });
  });
});
