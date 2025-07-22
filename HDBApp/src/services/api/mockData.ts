// モックデータ定義
export const mockUsers = {
  'testuser': {
    id: 'user-001',
    username: 'testuser',
    displayName: '田中太郎',
    email: 'tanaka@example.com',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
};

export const mockVitals = [
  {
    id: 'vital-001',
    userId: 'user-001',
    type: 'steps',
    value: 8500,
    unit: '歩',
    measuredAt: '2025-07-11T09:00:00Z',
    source: 'manual',
    createdAt: '2025-07-11T09:05:00Z',
  },
  {
    id: 'vital-002',
    userId: 'user-001',
    type: 'weight',
    value: 65.5,
    unit: 'kg',
    measuredAt: '2025-07-11T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-11T07:05:00Z',
  },
  {
    id: 'vital-003',
    userId: 'user-001',
    type: 'temperature',
    value: 36.5,
    unit: '℃',
    measuredAt: '2025-07-11T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-11T07:05:00Z',
  },
  {
    id: 'vital-004',
    userId: 'user-001',
    type: 'bloodPressure',
    value: 120,
    value2: 80,
    unit: 'mmHg',
    measuredAt: '2025-07-11T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-11T07:05:00Z',
  },
  {
    id: 'vital-005',
    userId: 'user-001',
    type: 'heartRate',
    value: 72,
    unit: 'bpm',
    measuredAt: '2025-07-11T07:00:00Z',
    source: 'healthkit',
    createdAt: '2025-07-11T07:05:00Z',
  },
  {
    id: 'vital-006',
    userId: 'user-001',
    type: 'pulse',
    value: 74,
    unit: 'bpm',
    measuredAt: '2025-07-11T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-11T07:05:00Z',
  },
  {
    id: 'vital-007',
    userId: 'user-001',
    type: 'pulse',
    value: 76,
    unit: 'bpm',
    measuredAt: '2025-07-10T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-10T07:05:00Z',
  },
  {
    id: 'vital-008',
    userId: 'user-001',
    type: 'pulse',
    value: 72,
    unit: 'bpm',
    measuredAt: '2025-07-09T07:00:00Z',
    source: 'manual',
    createdAt: '2025-07-09T07:05:00Z',
  },
];

export const mockRankings = [
  {
    rank: 1,
    userId: 'user-002',
    displayName: '佐藤花子',
    steps: 15234,
    achievement: 152,
  },
  {
    rank: 2,
    userId: 'user-003',
    displayName: '鈴木一郎',
    steps: 12500,
    achievement: 125,
  },
  {
    rank: 3,
    userId: 'user-001',
    displayName: '田中太郎',
    steps: 8500,
    achievement: 85,
  },
  {
    rank: 4,
    userId: 'user-004',
    displayName: '高橋美咲',
    steps: 7800,
    achievement: 78,
  },
  {
    rank: 5,
    userId: 'user-005',
    displayName: '渡辺健太',
    steps: 6500,
    achievement: 65,
  },
];

export const mockNotifications = [
  {
    id: 'notif-001',
    title: '目標達成おめでとうございます！',
    body: '今日の歩数目標10,000歩を達成しました',
    type: 'achievement',
    read: false,
    createdAt: '2025-07-11T15:00:00Z',
  },
  {
    id: 'notif-002',
    title: 'バイタルデータの入力をお忘れなく',
    body: '本日の体重データが未入力です',
    type: 'reminder',
    read: false,
    createdAt: '2025-07-11T08:00:00Z',
  },
  {
    id: 'notif-003',
    title: 'システムメンテナンスのお知らせ',
    body: '7月15日 2:00-5:00にメンテナンスを実施します',
    type: 'system',
    read: true,
    createdAt: '2025-07-10T10:00:00Z',
  },
];

export const mockDevices = [
  {
    id: 'device-001',
    userId: 'user-001',
    deviceType: 'ios',
    deviceModel: 'iPhone 15',
    osVersion: '17.0',
    appVersion: '1.0.0',
    pushToken: 'dummy-push-token-12345',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-07-11T00:00:00Z',
  },
];

// バイタルデータのサマリー生成
export const generateVitalSummary = (userId: string) => {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    steps: {
      today: 8500,
      average7days: 7850,
      goal: 10000,
      achievementRate: 85,
    },
    weight: {
      latest: 65.5,
      average7days: 65.8,
      change: -0.3,
    },
    temperature: {
      latest: 36.5,
      average7days: 36.4,
      normal: true,
    },
    bloodPressure: {
      latestSystolic: 120,
      latestDiastolic: 80,
      averageSystolic: 118,
      averageDiastolic: 78,
      status: 'normal',
    },
    heartRate: {
      latest: 72,
      average7days: 70,
      restingRate: 65,
    },
    pulse: {
      latest: 74,
      average7days: 74,
      restingRate: 68,
    },
  };
};

// 日付範囲でバイタルデータをフィルタリング
export const filterVitalsByDateRange = (startDate: Date, endDate: Date) => {
  return mockVitals.filter(vital => {
    const measuredDate = new Date(vital.measuredAt);
    return measuredDate >= startDate && measuredDate <= endDate;
  });
};

// ランダムなバイタルデータ生成（デモ用）
export const generateRandomVital = (type: string, userId: string) => {
  const baseValues = {
    steps: { min: 3000, max: 15000, unit: '歩' },
    weight: { min: 50, max: 80, unit: 'kg', decimals: 1 },
    temperature: { min: 35.5, max: 37.5, unit: '℃', decimals: 1 },
    bloodPressure: { min: 100, max: 140, min2: 60, max2: 90, unit: 'mmHg' },
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    pulse: { min: 60, max: 100, unit: 'bpm' },
  };

  const config = baseValues[type as keyof typeof baseValues];
  if (!config) return null;

  const value = 'decimals' in config
    ? parseFloat((Math.random() * (config.max - config.min) + config.min).toFixed(config.decimals))
    : Math.floor(Math.random() * (config.max - config.min) + config.min);

  const vital: any = {
    id: `vital-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    value,
    unit: config.unit,
    measuredAt: new Date().toISOString(),
    source: 'manual',
    createdAt: new Date().toISOString(),
  };

  if (type === 'bloodPressure' && 'min2' in config && 'max2' in config) {
    vital.value2 = Math.floor(Math.random() * (config.max2 - config.min2) + config.min2);
  }

  return vital;
};
