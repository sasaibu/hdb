import React from 'react';
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

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  WebView: {url: string; title?: string};
  VitalData: {title: string};
};

export type MainDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  MyPage: undefined; // 追加
  Backup: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
