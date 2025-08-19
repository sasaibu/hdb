// ユーザー関連の型定義
export interface User {
  id: string;
  username: string;
  email?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  nickname?: string;
  avatar?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  targetWeight?: number;
}

// バイタルデータ関連の型定義
export interface VitalData {
  id: string;
  type: VitalType;
  value: number | BloodPressureValue;
  unit: string;
  timestamp: string;
  source: 'manual' | 'healthkit' | 'googlefit';
}

export type VitalType = 'steps' | 'weight' | 'temperature' | 'bodyFat' | 'bloodPressure' | 'heartRate';

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

// API関連の型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// 通知関連の型定義
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

// 設定関連の型定義
export interface AppSettings {
  notifications: {
    push: boolean;
    daily: boolean;
    weekly: boolean;
    achievements: boolean;
  };
  health: {
    healthKitEnabled: boolean;
    googleFitEnabled: boolean;
    autoSync: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
  };
}

// エラー関連の型定義
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}