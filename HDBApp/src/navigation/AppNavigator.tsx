import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WebViewScreen from '../screens/WebViewScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  WebView: {url: string; title?: string};
};

export type MainDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
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
        component={HomeScreen}
        options={{title: 'マイページ'}}
      />
      <Drawer.Screen
        name="Settings"
        component={HomeScreen}
        options={{title: '設定'}}
      />
      <Drawer.Screen
        name="Notifications"
        component={HomeScreen}
        options={{title: '通知設定'}}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}