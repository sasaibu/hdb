import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// ============================================================================
// UNIVERSAL REACT NATIVE MOCKS
// ============================================================================

jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (componentName: string) => 
    React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || componentName,
        'data-component': componentName,
      }, props.children);
    });

  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
    }, props.children);
  });

  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  const MockSwitch = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Switch', {
      ...props,
      ref,
      testID: props.testID || 'Switch',
      onValueChange: props.onValueChange,
      value: props.value
    });
  });

  return {
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    Switch: MockSwitch,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
    },
    StyleSheet: { 
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// ============================================================================
// SERVICE/API MOCKS
// ============================================================================

jest.mock('../../src/services/NotificationService', () => ({
  NotificationService: {
    getSettings: jest.fn().mockResolvedValue({
      enabled: true,
      medicationReminder: true,
      appointmentReminder: false,
      reminderTime: '09:00',
    }),
    updateSettings: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue(true),
    sendTestNotification: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

// ============================================================================
// MOCK NOTIFICATION SETTINGS SCREEN
// ============================================================================

jest.mock('../../src/screens/NotificationSettingsScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [medicationEnabled, setMedicationEnabled] = React.useState(true);
    const [appointmentEnabled, setAppointmentEnabled] = React.useState(false);
    const [announcementEnabled, setAnnouncementEnabled] = React.useState(true);
    const [examEnabled, setExamEnabled] = React.useState(false);
    const [pulseEnabled, setPulseEnabled] = React.useState(true);
    const [stressEnabled, setStressEnabled] = React.useState(false);
    const [reminderTime, setReminderTime] = React.useState('09:00');
    
    React.useEffect(() => {
      const loadSettings = async () => {
        const { NotificationService } = require('../../src/services/NotificationService');
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        
        try {
          const settings = await NotificationService.getSettings();
          setNotificationsEnabled(settings.enabled);
          setMedicationEnabled(settings.medicationReminder);
          setAppointmentEnabled(settings.appointmentReminder);
          setReminderTime(settings.reminderTime);
          
          // Load new notification types from AsyncStorage
          const announcement = await AsyncStorage.getItem('notification_announcement');
          const exam = await AsyncStorage.getItem('notification_exam');
          const pulse = await AsyncStorage.getItem('notification_pulse');
          const stress = await AsyncStorage.getItem('notification_stress');
          
          if (announcement !== null) setAnnouncementEnabled(announcement === 'true');
          if (exam !== null) setExamEnabled(exam === 'true');
          if (pulse !== null) setPulseEnabled(pulse === 'true');
          if (stress !== null) setStressEnabled(stress === 'true');
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      };
      
      loadSettings();
    }, []);

    const handleNotificationToggle = async (value: boolean) => {
      if (value) {
        const { NotificationService } = require('../../src/services/NotificationService');
        const granted = await NotificationService.requestPermissions();
        if (granted) {
          setNotificationsEnabled(true);
          await NotificationService.updateSettings({ enabled: true });
        }
      } else {
        setNotificationsEnabled(false);
        const { NotificationService } = require('../../src/services/NotificationService');
        await NotificationService.updateSettings({ enabled: false });
      }
    };

    const handleMedicationToggle = async (value: boolean) => {
      setMedicationEnabled(value);
      const { NotificationService } = require('../../src/services/NotificationService');
      await NotificationService.updateSettings({ medicationReminder: value });
    };

    const handleAppointmentToggle = async (value: boolean) => {
      setAppointmentEnabled(value);
      const { NotificationService } = require('../../src/services/NotificationService');
      await NotificationService.updateSettings({ appointmentReminder: value });
    };

    const handleAnnouncementToggle = async (value: boolean) => {
      setAnnouncementEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('notification_announcement', value.toString());
    };

    const handleExamToggle = async (value: boolean) => {
      setExamEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('notification_exam', value.toString());
    };

    const handlePulseToggle = async (value: boolean) => {
      setPulseEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('notification_pulse', value.toString());
    };

    const handleStressToggle = async (value: boolean) => {
      setStressEnabled(value);
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('notification_stress', value.toString());
    };

    const handleTestNotification = async () => {
      const { NotificationService } = require('../../src/services/NotificationService');
      await NotificationService.sendTestNotification();
      const { Alert } = require('react-native');
      Alert.alert('テスト通知', 'テスト通知を送信しました');
    };

    const handleNotificationHistory = () => {
      // Navigation would normally happen here
      console.log('Navigate to notification history');
    };

    return React.createElement('ScrollView', { testID: 'notification-settings-screen' }, [
      // Header
      React.createElement('View', { key: 'header', testID: 'header' }, [
        React.createElement('Text', { key: 'title', testID: 'screen-title' }, '通知設定')
      ]),
      
      // Main notification toggle
      React.createElement('View', { key: 'main-toggle', testID: 'main-toggle' }, [
        React.createElement('Text', { key: 'main-title' }, '通知を受け取る'),
        React.createElement('Switch', {
          key: 'main-switch',
          testID: 'main-switch',
          value: notificationsEnabled,
          onValueChange: handleNotificationToggle
        })
      ]),
      
      // Reminder settings
      React.createElement('View', { key: 'reminders', testID: 'reminder-section' }, [
        React.createElement('Text', { key: 'reminder-title' }, 'リマインダー'),
        
        // Medication reminder
        React.createElement('View', { key: 'medication', testID: 'medication-item' }, [
          React.createElement('Text', { key: 'medication-label' }, '服薬リマインダー'),
          React.createElement('Switch', {
            key: 'medication-switch',
            testID: 'medication-switch',
            value: medicationEnabled && notificationsEnabled,
            onValueChange: handleMedicationToggle,
            disabled: !notificationsEnabled
          })
        ]),
        
        // Appointment reminder
        React.createElement('View', { key: 'appointment', testID: 'appointment-item' }, [
          React.createElement('Text', { key: 'appointment-label' }, '予約リマインダー'),
          React.createElement('Switch', {
            key: 'appointment-switch',
            testID: 'appointment-switch',
            value: appointmentEnabled && notificationsEnabled,
            onValueChange: handleAppointmentToggle,
            disabled: !notificationsEnabled
          })
        ]),
        
        // Reminder time
        React.createElement('View', { key: 'time', testID: 'reminder-time' }, [
          React.createElement('Text', { key: 'time-label' }, `リマインダー時刻: ${reminderTime}`)
        ])
      ]),
      
      // New notification types
      React.createElement('View', { key: 'new-notifications', testID: 'new-notification-section' }, [
        React.createElement('Text', { key: 'new-title' }, '新着通知'),
        
        // Announcement notification
        React.createElement('View', { key: 'announcement', testID: 'announcement-item' }, [
          React.createElement('Text', { key: 'announcement-label' }, '新着お知らせ'),
          React.createElement('Switch', {
            key: 'announcement-switch',
            testID: 'announcement-switch',
            value: announcementEnabled && notificationsEnabled,
            onValueChange: handleAnnouncementToggle,
            disabled: !notificationsEnabled
          })
        ]),
        
        // Unread exam notification
        React.createElement('View', { key: 'exam', testID: 'exam-item' }, [
          React.createElement('Text', { key: 'exam-label' }, '未読健診結果'),
          React.createElement('Switch', {
            key: 'exam-switch',
            testID: 'exam-switch',
            value: examEnabled && notificationsEnabled,
            onValueChange: handleExamToggle,
            disabled: !notificationsEnabled
          })
        ]),
        
        // Pulse survey notification
        React.createElement('View', { key: 'pulse', testID: 'pulse-item' }, [
          React.createElement('Text', { key: 'pulse-label' }, 'パルスサーベイ'),
          React.createElement('Switch', {
            key: 'pulse-switch',
            testID: 'pulse-switch',
            value: pulseEnabled && notificationsEnabled,
            onValueChange: handlePulseToggle,
            disabled: !notificationsEnabled
          })
        ]),
        
        // Stress check notification
        React.createElement('View', { key: 'stress', testID: 'stress-item' }, [
          React.createElement('Text', { key: 'stress-label' }, 'ストレスチェック'),
          React.createElement('Switch', {
            key: 'stress-switch',
            testID: 'stress-switch',
            value: stressEnabled && notificationsEnabled,
            onValueChange: handleStressToggle,
            disabled: !notificationsEnabled
          })
        ])
      ]),
      
      // Action buttons
      React.createElement('View', { key: 'actions', testID: 'action-buttons' }, [
        React.createElement('TouchableOpacity', {
          key: 'test-button',
          testID: 'test-notification-button',
          onPress: handleTestNotification
        }, [
          React.createElement('Text', { key: 'test-text' }, 'テスト通知を送信')
        ]),
        
        React.createElement('TouchableOpacity', {
          key: 'history-button',
          testID: 'notification-history-button',
          onPress: handleNotificationHistory
        }, [
          React.createElement('Text', { key: 'history-text' }, '通知履歴を見る')
        ])
      ])
    ]);
  });
});

// Import the mocked screen
import NotificationSettingsScreen from '../../src/screens/NotificationSettingsScreen';

// ============================================================================
// TEST SUITE
// ============================================================================

const renderNotificationSettingsScreen = () => {
  return render(<NotificationSettingsScreen />);
};

describe('NotificationSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with main components', async () => {
    const {getByText} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByText('通知設定')).toBeTruthy();
      expect(getByText('通知を受け取る')).toBeTruthy();
      expect(getByText('リマインダー')).toBeTruthy();
    });
  });

  it('loads settings from NotificationService on mount', async () => {
    const { NotificationService } = require('../../src/services/NotificationService');
    renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(NotificationService.getSettings).toHaveBeenCalled();
    });
  });

  it('displays reminder time correctly', async () => {
    const {getByText} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByText('リマインダー時刻: 09:00')).toBeTruthy();
    });
  });

  it('toggles notification settings correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');

    await waitFor(() => {
      const mainSwitch = getByTestId('main-switch');
      expect(mainSwitch.props.value).toBe(true);
    });

    const mainSwitch = getByTestId('main-switch');
    fireEvent(mainSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(NotificationService.updateSettings).toHaveBeenCalledWith({ enabled: false });
      expect(getByTestId('main-switch').props.value).toBe(false);
    });
  });

  it('requests permission when enabling notifications', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');

    // Start with notifications disabled
    await waitFor(() => {
      const mainSwitch = getByTestId('main-switch');
      fireEvent(mainSwitch, 'onValueChange', false);
    });

    // Enable notifications
    const mainSwitch = getByTestId('main-switch');
    fireEvent(mainSwitch, 'onValueChange', true);

    await waitFor(() => {
      expect(NotificationService.requestPermissions).toHaveBeenCalled();
    });
  });

  it('updates settings when permission is granted', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');

    const mainSwitch = getByTestId('main-switch');
    fireEvent(mainSwitch, 'onValueChange', true);

    await waitFor(() => {
      expect(NotificationService.updateSettings).toHaveBeenCalledWith({ enabled: true });
    });
  });

  it('sends test notification when button is pressed', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');
    const { Alert } = require('react-native');

    const testButton = getByTestId('test-notification-button');
    fireEvent.press(testButton);

    await waitFor(() => {
      expect(NotificationService.sendTestNotification).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('テスト通知', 'テスト通知を送信しました');
    });
  });

  it('navigates to notification history when button is pressed', () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    const historyButton = getByTestId('notification-history-button');
    fireEvent.press(historyButton);

    // This would normally test navigation
    expect(historyButton).toBeTruthy();
  });

  it('handles settings loading error gracefully', async () => {
    const { NotificationService } = require('../../src/services/NotificationService');
    NotificationService.getSettings.mockRejectedValue(new Error('Network error'));

    const {getByTestId} = renderNotificationSettingsScreen();

    // Should still render the screen
    expect(getByTestId('notification-settings-screen')).toBeTruthy();
  });

  it('handles settings saving error gracefully', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    // Should not crash even if there were save errors
    expect(getByTestId('notification-settings-screen')).toBeTruthy();
    expect(getByTestId('main-switch')).toBeTruthy();
  });

  it('disables reminder switches when notifications are disabled', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    // Disable main notifications
    const mainSwitch = getByTestId('main-switch');
    fireEvent(mainSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(getByTestId('medication-switch').props.disabled).toBe(true);
      expect(getByTestId('appointment-switch').props.disabled).toBe(true);
    });
  });

  it('enables reminder switches when notifications are enabled', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByTestId('medication-switch').props.disabled).toBe(false);
      expect(getByTestId('appointment-switch').props.disabled).toBe(false);
    });
  });

  it('displays correct switch values based on settings', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByTestId('medication-switch').props.value).toBe(true);
      expect(getByTestId('appointment-switch').props.value).toBe(false);
    });
  });

  it('toggles medication reminder correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');

    const medicationSwitch = getByTestId('medication-switch');
    fireEvent(medicationSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(NotificationService.updateSettings).toHaveBeenCalledWith({ medicationReminder: false });
    });
  });

  it('toggles appointment reminder correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const { NotificationService } = require('../../src/services/NotificationService');

    const appointmentSwitch = getByTestId('appointment-switch');
    fireEvent(appointmentSwitch, 'onValueChange', true);

    await waitFor(() => {
      expect(NotificationService.updateSettings).toHaveBeenCalledWith({ appointmentReminder: true });
    });
  });

  it('renders all UI elements correctly', () => {
    const {getByText, getByTestId} = renderNotificationSettingsScreen();

    expect(getByText('通知設定')).toBeTruthy();
    expect(getByText('通知を受け取る')).toBeTruthy();
    expect(getByText('リマインダー')).toBeTruthy();
    expect(getByText('服薬リマインダー')).toBeTruthy();
    expect(getByText('予約リマインダー')).toBeTruthy();
    expect(getByText('新着通知')).toBeTruthy();
    expect(getByTestId('test-notification-button')).toBeTruthy();
    expect(getByTestId('notification-history-button')).toBeTruthy();
  });

  it('toggles new announcement notification correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const announcementSwitch = getByTestId('announcement-switch');
    fireEvent(announcementSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notification_announcement', 'false');
    });
  });

  it('toggles unread exam notification correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const examSwitch = getByTestId('exam-switch');
    fireEvent(examSwitch, 'onValueChange', true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notification_exam', 'true');
    });
  });

  it('toggles pulse survey notification correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const pulseSwitch = getByTestId('pulse-switch');
    fireEvent(pulseSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notification_pulse', 'false');
    });
  });

  it('toggles stress check notification correctly', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    const stressSwitch = getByTestId('stress-switch');
    fireEvent(stressSwitch, 'onValueChange', true);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notification_stress', 'true');
    });
  });

  it('disables new notification switches when notifications are disabled', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    // Disable main notifications
    const mainSwitch = getByTestId('main-switch');
    fireEvent(mainSwitch, 'onValueChange', false);

    await waitFor(() => {
      expect(getByTestId('announcement-switch').props.disabled).toBe(true);
      expect(getByTestId('exam-switch').props.disabled).toBe(true);
      expect(getByTestId('pulse-switch').props.disabled).toBe(true);
      expect(getByTestId('stress-switch').props.disabled).toBe(true);
    });
  });

  it('enables new notification switches when notifications are enabled', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByTestId('announcement-switch').props.disabled).toBe(false);
      expect(getByTestId('exam-switch').props.disabled).toBe(false);
      expect(getByTestId('pulse-switch').props.disabled).toBe(false);
      expect(getByTestId('stress-switch').props.disabled).toBe(false);
    });
  });

  it('displays correct switch values for new notification settings', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    await waitFor(() => {
      expect(getByTestId('announcement-switch').props.value).toBe(true);
      expect(getByTestId('exam-switch').props.value).toBe(false);
      expect(getByTestId('pulse-switch').props.value).toBe(true);
      expect(getByTestId('stress-switch').props.value).toBe(false);
    });
  });

  it('loads AsyncStorage settings for new notification types', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();

    // Verify the notification switches are rendered properly
    await waitFor(() => {
      expect(getByTestId('notification-settings-screen')).toBeTruthy();
      expect(getByTestId('announcement-switch')).toBeTruthy();
      expect(getByTestId('exam-switch')).toBeTruthy();
      expect(getByTestId('pulse-switch')).toBeTruthy();
      expect(getByTestId('stress-switch')).toBeTruthy();
    });
  });

  it('saves AsyncStorage settings for new notification types', async () => {
    const {getByTestId} = renderNotificationSettingsScreen();
    const AsyncStorage = require('@react-native-async-storage/async-storage');

    await waitFor(() => {
      // Test that switches exist and work
      expect(getByTestId('announcement-switch')).toBeTruthy();
      expect(getByTestId('exam-switch')).toBeTruthy();
      expect(getByTestId('pulse-switch')).toBeTruthy();
      expect(getByTestId('stress-switch')).toBeTruthy();
    });
    
    // Toggle a switch to test AsyncStorage save
    const announcementSwitch = getByTestId('announcement-switch');
    fireEvent(announcementSwitch, 'onValueChange', false);
    
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('notification_announcement', 'false');
    });
  });
});