import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseService } from './DatabaseService';
import { VitalDataService } from './VitalDataService';

interface NotificationSchedule {
  id: string;
  type: 'reminder' | 'achievement' | 'health_check' | 'goal_progress';
  title: string;
  message: string;
  time: Date;
  repeat?: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  data?: any;
}

interface NotificationSettings {
  reminders: {
    morning: boolean;
    evening: boolean;
    customTimes: string[];
  };
  achievements: boolean;
  healthAlerts: boolean;
  goalProgress: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  private dbService: DatabaseService;
  private vitalDataService: VitalDataService;
  private settings: NotificationSettings = {
    reminders: {
      morning: true,
      evening: true,
      customTimes: [],
    },
    achievements: true,
    healthAlerts: true,
    goalProgress: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00',
    },
  };

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.vitalDataService = new VitalDataService();
    this.initializeNotifications();
  }

  static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }

  // 通知の初期化
  private async initializeNotifications(): Promise<void> {
    // チャンネルの作成（Android）
    PushNotification.createChannel(
      {
        channelId: 'health-reminders',
        channelName: '健康リマインダー',
        channelDescription: '健康データの記録リマインダー',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`[Notification] Reminder channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'achievements',
        channelName: '達成通知',
        channelDescription: '目標達成やマイルストーンの通知',
        importance: Importance.DEFAULT,
        vibrate: true,
      },
      (created) => console.log(`[Notification] Achievement channel created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'health-alerts',
        channelName: '健康アラート',
        channelDescription: '健康状態に関する重要な通知',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`[Notification] Health alert channel created: ${created}`)
    );

    // 設定の読み込み
    await this.loadSettings();

    // デフォルトのスケジュール設定
    await this.setupDefaultSchedules();

    // 通知ハンドラーの設定
    PushNotification.configure({
      onNotification: (notification) => {
        console.log('[Notification] Received:', notification);
        this.handleNotification(notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  // デフォルトスケジュールの設定
  private async setupDefaultSchedules(): Promise<void> {
    // 朝のリマインダー（8:00）
    if (this.settings.reminders.morning) {
      await this.scheduleReminder({
        id: 'morning_reminder',
        type: 'reminder',
        title: 'おはようございます！',
        message: '今日の健康データを記録しましょう',
        time: this.getNextOccurrence(8, 0),
        repeat: 'daily',
        enabled: true,
      });
    }

    // 夜のリマインダー（20:00）
    if (this.settings.reminders.evening) {
      await this.scheduleReminder({
        id: 'evening_reminder',
        type: 'reminder',
        title: '今日の健康記録',
        message: '本日の健康データを記録しましたか？',
        time: this.getNextOccurrence(20, 0),
        repeat: 'daily',
        enabled: true,
      });
    }

    // カスタムタイムのリマインダー
    for (const time of this.settings.reminders.customTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      await this.scheduleReminder({
        id: `custom_reminder_${time}`,
        type: 'reminder',
        title: '健康データの記録時間です',
        message: 'バイタルデータを記録しましょう',
        time: this.getNextOccurrence(hours, minutes),
        repeat: 'daily',
        enabled: true,
      });
    }
  }

  // 次の発生時刻を取得
  private getNextOccurrence(hours: number, minutes: number): Date {
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);
    
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }
    
    return scheduled;
  }

  // リマインダーのスケジュール
  async scheduleReminder(schedule: NotificationSchedule): Promise<void> {
    // 静音時間のチェック
    if (this.isQuietHours(schedule.time)) {
      console.log(`[Notification] Skipping notification during quiet hours: ${schedule.id}`);
      return;
    }

    const notificationOptions = {
      id: schedule.id,
      title: schedule.title,
      message: schedule.message,
      date: schedule.time,
      channelId: this.getChannelId(schedule.type),
      userInfo: {
        type: schedule.type,
        data: schedule.data,
      },
      repeatType: schedule.repeat as any,
      allowWhileIdle: true,
    };

    PushNotification.localNotificationSchedule(notificationOptions);
    
    // スケジュールをデータベースに保存
    await this.saveSchedule(schedule);
    
    console.log(`[Notification] Scheduled: ${schedule.id} at ${schedule.time}`);
  }

  // チャンネルIDの取得
  private getChannelId(type: NotificationSchedule['type']): string {
    switch (type) {
      case 'reminder':
        return 'health-reminders';
      case 'achievement':
        return 'achievements';
      case 'health_check':
      case 'goal_progress':
        return 'health-alerts';
      default:
        return 'health-reminders';
    }
  }

  // 静音時間のチェック
  private isQuietHours(date: Date): boolean {
    if (!this.settings.quietHours.enabled) {
      return false;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const { start, end } = this.settings.quietHours;
    
    if (start <= end) {
      return timeString >= start && timeString <= end;
    } else {
      // 深夜をまたぐ場合
      return timeString >= start || timeString <= end;
    }
  }

  // 達成通知の送信
  async sendAchievementNotification(achievement: {
    type: string;
    value: number;
    target?: number;
    milestone?: string;
  }): Promise<void> {
    if (!this.settings.achievements) {
      return;
    }

    let title = '目標達成！🎉';
    let message = '';
    
    if (achievement.milestone) {
      message = `${achievement.milestone}を達成しました！`;
    } else if (achievement.target) {
      const percentage = Math.round((achievement.value / achievement.target) * 100);
      message = `${achievement.type}の目標を${percentage}%達成しました！`;
    } else {
      message = `${achievement.type}: ${achievement.value}を記録しました！`;
    }

    PushNotification.localNotification({
      channelId: 'achievements',
      title,
      message,
      userInfo: {
        type: 'achievement',
        data: achievement,
      },
    });

    // 通知履歴に保存
    await this.saveNotificationHistory({
      type: 'achievement',
      title,
      message,
      timestamp: new Date().toISOString(),
      data: achievement,
    });
  }

  // 健康アラートの送信
  async sendHealthAlert(alert: {
    severity: 'info' | 'warning' | 'critical';
    type: string;
    value: number;
    normalRange?: { min: number; max: number };
    recommendation?: string;
  }): Promise<void> {
    if (!this.settings.healthAlerts) {
      return;
    }

    let title = '';
    let message = '';
    
    switch (alert.severity) {
      case 'critical':
        title = '⚠️ 重要な健康アラート';
        break;
      case 'warning':
        title = '⚡ 健康に関する注意';
        break;
      case 'info':
        title = 'ℹ️ 健康情報';
        break;
    }
    
    message = `${alert.type}: ${alert.value}`;
    
    if (alert.normalRange) {
      message += `\n正常範囲: ${alert.normalRange.min}-${alert.normalRange.max}`;
    }
    
    if (alert.recommendation) {
      message += `\n${alert.recommendation}`;
    }

    PushNotification.localNotification({
      channelId: 'health-alerts',
      title,
      message,
      priority: alert.severity === 'critical' ? 'high' : 'default',
      userInfo: {
        type: 'health_alert',
        data: alert,
      },
    });

    // 通知履歴に保存
    await this.saveNotificationHistory({
      type: 'health_alert',
      title,
      message,
      timestamp: new Date().toISOString(),
      data: alert,
    });
  }

  // 目標進捗通知
  async sendGoalProgressNotification(progress: {
    goalType: string;
    currentValue: number;
    targetValue: number;
    daysRemaining?: number;
  }): Promise<void> {
    if (!this.settings.goalProgress) {
      return;
    }

    const percentage = Math.round((progress.currentValue / progress.targetValue) * 100);
    let title = '目標進捗レポート';
    let message = `${progress.goalType}: ${percentage}%達成`;
    
    if (progress.daysRemaining) {
      message += `\n残り${progress.daysRemaining}日`;
    }
    
    if (percentage >= 100) {
      title = '🎊 目標達成おめでとうございます！';
    } else if (percentage >= 80) {
      message += '\nもう少しで目標達成です！';
    } else if (percentage >= 50) {
      message += '\n順調に進んでいます！';
    }

    PushNotification.localNotification({
      channelId: 'health-alerts',
      title,
      message,
      userInfo: {
        type: 'goal_progress',
        data: progress,
      },
    });
  }

  // 通知処理
  private async handleNotification(notification: any): Promise<void> {
    console.log('[Notification] Handling:', notification);
    
    // 通知タイプに応じた処理
    if (notification.userInfo) {
      switch (notification.userInfo.type) {
        case 'reminder':
          // リマインダーがタップされた場合の処理
          await this.handleReminderTap(notification);
          break;
        case 'achievement':
          // 達成通知がタップされた場合の処理
          await this.handleAchievementTap(notification);
          break;
        case 'health_alert':
          // 健康アラートがタップされた場合の処理
          await this.handleHealthAlertTap(notification);
          break;
      }
    }
  }

  // リマインダータップ処理
  private async handleReminderTap(notification: any): Promise<void> {
    // アプリ内でデータ入力画面を開くなどの処理
    console.log('[Notification] Reminder tapped:', notification);
  }

  // 達成通知タップ処理
  private async handleAchievementTap(notification: any): Promise<void> {
    // 達成詳細画面を開くなどの処理
    console.log('[Notification] Achievement tapped:', notification);
  }

  // 健康アラートタップ処理
  private async handleHealthAlertTap(notification: any): Promise<void> {
    // 健康データ詳細画面を開くなどの処理
    console.log('[Notification] Health alert tapped:', notification);
  }

  // スケジュールの保存
  private async saveSchedule(schedule: NotificationSchedule): Promise<void> {
    const schedules = await this.getSchedules();
    const index = schedules.findIndex(s => s.id === schedule.id);
    
    if (index >= 0) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    await AsyncStorage.setItem('notification_schedules', JSON.stringify(schedules));
  }

  // スケジュールの取得
  async getSchedules(): Promise<NotificationSchedule[]> {
    const data = await AsyncStorage.getItem('notification_schedules');
    return data ? JSON.parse(data) : [];
  }

  // スケジュールの削除
  async removeSchedule(id: string): Promise<void> {
    PushNotification.cancelLocalNotification(id);
    
    const schedules = await this.getSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    await AsyncStorage.setItem('notification_schedules', JSON.stringify(filtered));
  }

  // 通知履歴の保存
  private async saveNotificationHistory(notification: {
    type: string;
    title: string;
    message: string;
    timestamp: string;
    data?: any;
  }): Promise<void> {
    const sql = `
      INSERT INTO notifications (type, title, message, timestamp, data, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `;
    
    await this.dbService.executeSql(sql, [
      notification.type,
      notification.title,
      notification.message,
      notification.timestamp,
      notification.data ? JSON.stringify(notification.data) : null,
    ]);
  }

  // 設定の保存
  async saveSettings(settings: NotificationSettings): Promise<void> {
    this.settings = settings;
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    
    // スケジュールの再設定
    await this.resetSchedules();
  }

  // 設定の読み込み
  private async loadSettings(): Promise<void> {
    const data = await AsyncStorage.getItem('notification_settings');
    if (data) {
      this.settings = JSON.parse(data);
    }
  }

  // スケジュールのリセット
  private async resetSchedules(): Promise<void> {
    // 全ての通知をキャンセル
    PushNotification.cancelAllLocalNotifications();
    
    // デフォルトスケジュールの再設定
    await this.setupDefaultSchedules();
  }

  // 通知権限のチェック
  async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert || false);
      });
    });
  }

  // 通知権限のリクエスト
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        resolve(permissions.alert || false);
      });
    });
  }
}