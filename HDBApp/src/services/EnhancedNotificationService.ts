import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class EnhancedNotificationService {
  private static instance: EnhancedNotificationService;
  
  static getInstance(): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      EnhancedNotificationService.instance = new EnhancedNotificationService();
    }
    return EnhancedNotificationService.instance;
  }
  
  /**
   * アプリ起動時に呼び出す初期化処理
   */
  async initializeOnAppStart(): Promise<void> {
    // 保存されている通知設定を読み込む
    const settings = await this.loadNotificationSettings();
    
    if (settings && settings.enabled) {
      // ユーザーが設定した時刻で通知をスケジュール
      await this.scheduleUserDefinedNotification(
        settings.hour,
        settings.minute
      );
    }
  }
  
  /**
   * ユーザーが設定画面で時刻を変更した時に呼び出す
   */
  async updateNotificationTime(hour: number, minute: number): Promise<void> {
    // 設定を保存
    await this.saveNotificationSettings({
      enabled: true,
      hour,
      minute,
      lastUpdated: new Date().toISOString()
    });
    
    // 新しい時刻で通知を再スケジュール
    await this.scheduleUserDefinedNotification(hour, minute);
  }
  
  /**
   * ユーザー設定の時刻で毎日通知をスケジュール
   */
  private async scheduleUserDefinedNotification(
    hour: number,
    minute: number
  ): Promise<void> {
    // 既存の通知をキャンセル
    PushNotification.cancelLocalNotification('daily-goal-notification');
    
    // 次回通知時刻を計算
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    
    // 今日の時刻を過ぎていたら明日に設定
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    console.log(`通知設定: 毎日 ${hour}:${minute}`);
    console.log(`初回通知: ${scheduledDate.toLocaleString()}`);
    
    // 通知をスケジュール
    PushNotification.localNotificationSchedule({
      id: 'daily-goal-notification',
      title: '目標達成確認',
      message: '今日の目標達成状況を確認しましょう',
      
      // ユーザーが設定した時刻
      date: scheduledDate,
      
      // 毎日繰り返し（無期限）
      repeatType: 'day',
      
      // その他の設定
      allowWhileIdle: true,
      userInfo: {
        scheduledHour: hour,
        scheduledMinute: minute
      }
    });
  }
  
  /**
   * 通知設定の保存
   */
  private async saveNotificationSettings(settings: any): Promise<void> {
    await AsyncStorage.setItem(
      'notification_settings',
      JSON.stringify(settings)
    );
  }
  
  /**
   * 通知設定の読み込み
   */
  private async loadNotificationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('設定読み込みエラー:', error);
      return null;
    }
  }
  
  /**
   * 通知の無効化
   */
  async disableNotifications(): Promise<void> {
    // 通知をキャンセル
    PushNotification.cancelLocalNotification('daily-goal-notification');
    
    // 設定を保存
    await this.saveNotificationSettings({
      enabled: false,
      lastUpdated: new Date().toISOString()
    });
  }
}

export default EnhancedNotificationService;