import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MainTabScreen from '../screens/MainTabScreen';
import WebViewScreen from '../screens/WebViewScreen';
import VitalDataScreen from '../screens/VitalDataScreen';
import VitalListScreen from '../screens/VitalListScreen'; // 追加
import MyPageScreen from '../screens/MyPageScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import BackupScreen from '../screens/BackupScreen';
import RestoreScreen from '../screens/RestoreScreen';
import DataMigrationScreen from '../screens/DataMigrationScreen';
import DataMigrationLoginScreen from '../screens/DataMigrationLoginScreen'; // 追加
import LinkedServicesSettingsScreen from '../screens/LinkedServicesSettingsScreen'; // 追加
import NotificationHistoryScreen from '../screens/NotificationHistoryScreen'; // 追加
import NoticeScreen from '../screens/NoticeScreen'; // 追加
import TermsScreen from '../screens/TermsScreen'; // 追加
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen'; // 追加
import OpenSourceLicensesScreen from '../screens/OpenSourceLicensesScreen'; // 追加
import DataDeletionScreen from '../screens/DataDeletionScreen'; // 追加
import LogoutScreen from '../screens/LogoutScreen'; // 追加
import GoalSettingScreen from '../screens/GoalSettingScreen'; // 追加
import GoalInputScreen from '../screens/GoalInputScreen'; // 追加
import GoalNotificationScreen from '../screens/GoalNotificationScreen'; // 追加
import TimingInputScreen from '../screens/TimingInputScreen'; // 追加
import GoalExamplesScreen from '../screens/GoalExamplesScreen'; // 追加
import TimingDetailScreen from '../screens/TimingDetailScreen'; // 追加
import GoalDetailScreen from '../screens/GoalDetailScreen'; // 追加
import GoalConfirmationScreen from '../screens/GoalConfirmationScreen'; // 追加
import GoalContinuationScreen from '../screens/GoalContinuationScreen'; // 追加
import VitalDetailScreen from '../screens/VitalDetailScreen'; // 追加
import ServiceTermsScreen from '../screens/ServiceTermsScreen'; // オンボーディング画面
import EmailInputScreen from '../screens/EmailInputScreen'; // オンボーディング画面
import NicknameInputScreen from '../screens/NicknameInputScreen'; // オンボーディング画面
import HealthcareDataMigrationScreen from '../screens/HealthcareDataMigrationScreen'; // オンボーディング画面
import PointsScreen from '../screens/PointsScreen'; // ポイント画面
import PointsExchangeScreen from '../screens/PointsExchangeScreen'; // ポイント交換画面
import StressCheckScreen from '../screens/StressCheckScreen'; // ストレスチェック画面
import StressCheckAnswerScreen from '../screens/StressCheckAnswerScreen'; // ストレスチェック回答画面
import StressCheckResultScreen from '../screens/StressCheckResultScreen'; // ストレスチェック結果画面
import EventScreen from '../screens/EventScreen'; // イベント画面
import PersonalRankingScreen from '../screens/PersonalRankingScreen'; // 個人ランキング画面
import HowToUseScreen from '../screens/HowToUseScreen'; // アプリの使い方画面
import FAQScreen from '../screens/FAQScreen'; // よくあるご質問画面
import HealthCheckupScreen from '../screens/HealthCheckupScreen'; // 健診情報画面
import HealthCheckupDetailScreen from '../screens/HealthCheckupDetailScreen'; // 健診詳細画面
import DiseasePredictionScreen from '../screens/DiseasePredictionScreen'; // 疾病予測画面
import PulseSurveyScreen from '../screens/PulseSurveyScreen'; // パルスサーベイ画面
import PulseSurveyResultScreen from '../screens/PulseSurveyResultScreen'; // パルスサーベイ結果画面
import PulseSurveyListScreen from '../screens/PulseSurveyListScreen'; // パルスサーベイ一覧画面
import DoneScreen from '../screens/DoneScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  WebView: {url: string; title?: string; screen?: string};
  VitalData: {title: string};
  VitalDetail: {vitalType: string; date: string; recordId?: string};
  DataMigrationLogin: undefined; // 追加
  DataMigration: undefined; // 追加
  LinkedServicesSettings: undefined; // 追加
  NotificationHistory: undefined; // 追加
  OpenSourceLicenses: undefined; // 追加
  GoalInput: undefined; // 追加
  HealthCheckup: undefined; // 健診情報画面
  HealthCheckupDetail: {checkupId: string}; // 健診詳細画面
  DiseasePrediction: undefined; // 疾病予測画面
  PulseSurvey: undefined; // パルスサーベイ画面
  PulseSurveyResult: {
    surveyId: string;
    answers: Array<{questionId: string; value: number}>;
    questions: Array<{id: string; text: string; category: string}>;
    completedAt: string;
  }; // パルスサーベイ結果画面
  PulseSurveyList: undefined; // パルスサーベイ一覧画面
  GoalNotification: {
    goalType?: string;
    goalPrinciple1?: string;
    goalPrinciple2?: string;
    goalReason?: string;
    goalDetail?: string;
  }; // 追加
  TimingInput: {currentTiming?: string; onSave?: (timing: string) => void}; // 追加
  GoalExamples: {onSelectExample?: (example: string) => void}; // 追加
  TimingDetail: {onSave?: (timing: string) => void}; // 追加
  GoalDetail: {initialGoal?: string; onSave?: (goal: string) => void}; // 追加
  GoalConfirmation: {
    goalType?: string;
    goalPrinciple1?: string;
    goalPrinciple2?: string;
    goalReason?: string;
    goalDetail?: string;
    notificationTime?: string;
    isNotificationOn?: boolean;
    timing?: string;
  }; // 追加
  GoalContinuation: {
    goalType?: string;
    goalPrinciple1?: string;
    goalPrinciple2?: string;
    goalReason?: string;
    goalDetail?: string;
    notificationTime?: string;
    isNotificationOn?: boolean;
    timing?: string;
  }; // 追加
  ServiceTerms: undefined; // オンボーディング
  EmailInput: undefined; // オンボーディング
  NicknameInput: undefined; // オンボーディング
  HealthcareDataMigration: undefined; // オンボーディング
  PointsExchange: undefined; // ポイント交換画面
  StressCheckAnswer: {checkId: string; title: string}; // ストレスチェック回答
  StressCheckResult: {checkId: string; title: string; answers?: {[key: string]: number}}; // ストレスチェック結果
  PersonalRanking: {eventId: string; eventTitle: string}; // 個人ランキング画面
  Done: undefined;
};

export type MainDrawerParamList = {
  Home: undefined;
  Notice: undefined; // お知らせ
  MyPage: undefined; // マイページ
  LinkedServicesSettings: undefined; // 連携サービス設定
  Notifications: undefined; // 通知設定
  DataMigrationLogin: undefined; // データ移行
  Terms: undefined; // 利用規約
  PrivacyPolicy: undefined; // プライバシーポリシー
  OpenSourceLicenses: undefined; // オープンソースライセンス
  HowToUse: undefined; // アプリの使い方
  FAQ: undefined; // よくあるご質問
  Backup: undefined; // DBバックアップ
  Restore: undefined; // DBリストア
  HealthCheckup: undefined; // 健診
  DataDeletion: undefined; // データ削除について
  Event: undefined; // イベント
  StressCheck: undefined; // ストレスチェック
  Points: undefined; // ポイント
  Logout: undefined; // ログアウト
  // 削除: Profile, Settings, GoalSetting
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF8C00',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center', // タイトルを中央揃え
        drawerStyle: {
          backgroundColor: '#f5f5f5',
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={MainTabScreen}
        options={{title: 'ホーム'}}
      />
      <Drawer.Screen
        name="Notice"
        component={NoticeScreen}
        options={({navigation}) => ({
          title: 'お知らせ',
          headerTitle: () => (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{color: '#FFFFFF', fontSize: 18, fontWeight: 'bold'}}>
                お知らせ
              </Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{paddingLeft: 15}}>
              <Text style={{color: '#FFFFFF', fontSize: 24}}>☰</Text>
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{width: 50}} />,
        })}
      />
      <Drawer.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{title: 'マイページ'}}
      />
      <Drawer.Screen
        name="LinkedServicesSettings"
        component={LinkedServicesSettingsScreen}
        options={{title: '連携サービス設定'}}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationSettingsScreen}
        options={{title: '通知設定'}}
      />
      <Drawer.Screen
        name="DataMigrationLogin"
        component={DataMigrationLoginScreen}
        options={{title: 'データ移行'}}
      />
      <Drawer.Screen
        name="Terms"
        component={TermsScreen}
        options={{title: '利用規約'}}
      />
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{title: 'プライバシーポリシー'}}
      />
      <Drawer.Screen
        name="OpenSourceLicenses"
        component={OpenSourceLicensesScreen}
        options={{title: 'オープンソースライセンス'}}
      />
      <Drawer.Screen
        name="HowToUse"
        component={HowToUseScreen}
        options={{title: 'アプリの使い方'}}
      />
      <Drawer.Screen
        name="FAQ"
        component={FAQScreen}
        options={{title: 'よくあるご質問'}}
      />
      <Drawer.Screen
        name="Backup"
        component={BackupScreen}
        options={{title: 'DBバックアップ'}}
      />
      <Drawer.Screen
        name="Restore"
        component={RestoreScreen}
        options={{title: 'DBリストア'}}
      />
      <Drawer.Screen
        name="DataDeletion"
        component={DataDeletionScreen}
        options={{title: 'データ削除について'}}
      />
      <Drawer.Screen
        name="HealthCheckup"
        component={HealthCheckupScreen}
        options={{title: '健診'}}
      />
      <Drawer.Screen
        name="Event"
        component={EventScreen}
        options={{title: 'イベント'}}
      />
      <Drawer.Screen
        name="StressCheck"
        component={StressCheckScreen}
        options={{title: 'ストレスチェック'}}
      />
      <Drawer.Screen
        name="Points"
        component={PointsScreen}
        options={{title: 'ポイント'}}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{title: 'ログアウト'}}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainDrawer} />
        <Stack.Screen
          name="WebView"
          component={WebViewScreen}
          options={{headerShown: true}}
        />
        <Stack.Screen
          name="VitalData"
          component={VitalDataScreen}
          options={({route}) => ({
            title: `${route.params.title} 一覧`,
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="DataMigrationLogin" // 追加
          component={DataMigrationLoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DataMigration" // 追加
          component={DataMigrationScreen}
          options={{headerShown: true, title: 'データ移行'}}
        />
        <Stack.Screen
          name="LinkedServicesSettings" // 追加
          component={LinkedServicesSettingsScreen}
          options={{headerShown: true, title: '連携サービス設定'}}
        />
        <Stack.Screen
          name="NotificationHistory" // 追加
          component={NotificationHistoryScreen}
          options={{headerShown: true, title: '通知履歴'}}
        />
        <Stack.Screen
          name="OpenSourceLicenses" // 追加
          component={OpenSourceLicensesScreen}
          options={{headerShown: true, title: 'オープンソースライセンス'}}
        />
        <Stack.Screen
          name="GoalInput" // 追加
          component={GoalInputScreen}
          options={{
            headerShown: true, 
            title: '目標入力',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="GoalNotification" // 追加
          component={GoalNotificationScreen}
          options={{
            headerShown: true, 
            title: '通知設定',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="TimingInput" // 追加
          component={TimingInputScreen}
          options={{
            headerShown: true, 
            title: 'タイミング入力',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="GoalExamples" // 追加
          component={GoalExamplesScreen}
          options={{
            headerShown: true, 
            title: '目標例文',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="TimingDetail" // 追加
          component={TimingDetailScreen}
          options={{
            headerShown: true, 
            title: 'タイミング詳細',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="GoalDetail" // 追加
          component={GoalDetailScreen}
          options={{
            headerShown: true, 
            title: '目標入力',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="GoalConfirmation" // 追加
          component={GoalConfirmationScreen}
          options={{
            headerShown: true, 
            title: '目標設定確認',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="GoalContinuation" // 追加
          component={GoalContinuationScreen}
          options={{
            headerShown: true, 
            title: '目標継続',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="VitalDetail" // 追加
          component={VitalDetailScreen}
          options={{
            headerShown: true,
            title: '詳細表示',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="ServiceTerms"
          component={ServiceTermsScreen}
          options={{
            headerShown: true,
            title: 'サービス利用条件',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="EmailInput"
          component={EmailInputScreen}
          options={{
            headerShown: true,
            title: 'メールアドレス入力',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="NicknameInput"
          component={NicknameInputScreen}
          options={{
            headerShown: true,
            title: 'ニックネーム入力',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="HealthcareDataMigration"
          component={HealthcareDataMigrationScreen}
          options={{
            headerShown: true,
            title: 'データ移行',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PointsExchange"
          component={PointsExchangeScreen}
          options={{
            headerShown: true,
            title: 'ポイント交換',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="StressCheckAnswer"
          component={StressCheckAnswerScreen}
          options={{
            headerShown: true,
            title: 'ストレスチェック回答',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="StressCheckResult"
          component={StressCheckResultScreen}
          options={{
            headerShown: true,
            title: 'ストレスチェック結果',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PersonalRanking"
          component={PersonalRankingScreen}
          options={{
            headerShown: true,
            title: '個人ランキング',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="HealthCheckup"
          component={HealthCheckupScreen}
          options={{
            headerShown: true,
            title: '健診情報',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="HealthCheckupDetail"
          component={HealthCheckupDetailScreen}
          options={{
            headerShown: true,
            title: '健診詳細',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="DiseasePrediction"
          component={DiseasePredictionScreen}
          options={{
            headerShown: true,
            title: '疾病予測',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PulseSurvey"
          component={PulseSurveyScreen}
          options={{
            headerShown: true,
            title: 'パルスサーベイ',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PulseSurveyResult"
          component={PulseSurveyResultScreen}
          options={{
            headerShown: true,
            title: 'パルスサーベイ結果',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PulseSurveyList"
          component={PulseSurveyListScreen}
          options={{
            headerShown: true,
            title: 'パルスサーベイ一覧',
        <Stack.Screen      
          name="Done"
          component={DoneScreen}
          options={{
            headerShown: true, 
            title: '完了',
            headerStyle: {
              backgroundColor: '#FF8C00',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
