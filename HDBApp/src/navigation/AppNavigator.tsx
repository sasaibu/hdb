import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WebViewScreen from '../screens/WebViewScreen';
import VitalDataScreen from '../screens/VitalDataScreen';
import MyPageScreen from '../screens/MyPageScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import BackupScreen from '../screens/BackupScreen';
import RestoreScreen from '../screens/RestoreScreen';
import DataMigrationScreen from '../screens/DataMigrationScreen';
import DataMigrationLoginScreen from '../screens/DataMigrationLoginScreen'; // 追加
import LinkedServicesSettingsScreen from '../screens/LinkedServicesSettingsScreen'; // 追加
import NotificationHistoryScreen from '../screens/NotificationHistoryScreen'; // 追加
import NoticeScreen from '../screens/NoticeScreen'; // 追加

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  WebView: {url: string; title?: string};
  VitalData: {title: string};
  DataMigrationLogin: undefined; // 追加
  DataMigration: undefined; // 追加
  LinkedServicesSettings: undefined; // 追加
  NotificationHistory: undefined; // 追加
};

export type MainDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  MyPage: undefined; // 追加
  Backup: undefined;
  Restore: undefined;
  DataMigrationLogin: undefined; // 追加
  LinkedServicesSettings: undefined; // 追加
  Notice: undefined; // 追加
  // DataMigration: undefined; // 削除
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
          backgroundColor: '#a8c5ff',
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
        component={HomeScreen}
        options={{title: 'ホーム'}}
      />
      <Drawer.Screen
        name="Profile"
        component={MyPageScreen}
        options={{title: 'マイページ'}}
      />
      <Drawer.Screen
        name="Settings"
        component={HomeScreen}
        options={{title: '設定'}}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationSettingsScreen}
        options={{title: '通知設定'}}
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
        name="DataMigrationLogin" // データ移行ログイン画面へ変更
        component={DataMigrationLoginScreen}
        options={{title: 'データ移行'}}
      />
      <Drawer.Screen
        name="LinkedServicesSettings" // 追加
        component={LinkedServicesSettingsScreen}
        options={{title: '連携サービス設定'}}
      />
      <Drawer.Screen
        name="お知らせ"
        component={NoticeScreen}
        options={({navigation}) => ({
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
