import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../navigation/AppNavigator';
import {mockApi} from '../services/api/mockApi';

type WebViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WebView'
>;

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

interface Props {
  navigation: WebViewScreenNavigationProp;
  route: WebViewScreenRouteProp;
}

export default function WebViewScreen({navigation, route}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [ssoUrl, setSsoUrl] = useState<string | null>(null);
  const {url, title, screen} = route.params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Web',
    });
  }, [navigation, title]);

  // SSO URL取得
  useEffect(() => {
    const getSsoUrl = async () => {
      if (screen) {
        try {
          const userStr = await AsyncStorage.getItem('current_user');
          if (userStr) {
            const user = JSON.parse(userStr);
            const response = await mockApi.singleSignOn(user.id, screen);
            
            if (response.success && response.data?.member_url) {
              setSsoUrl(response.data.member_url);
              console.log('SSO URL取得成功:', response.data.member_url);
            } else {
              console.error('SSO URL取得失敗:', response.error);
              Alert.alert('エラー', 'ログイン済みページURLの取得に失敗しました');
            }
          }
        } catch (error) {
          console.error('SSO API呼び出しエラー:', error);
          Alert.alert('エラー', 'ログイン済みページURLの取得に失敗しました');
        }
      }
    };

    getSsoUrl();
  }, [screen]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    Alert.alert('エラー', 'ページの読み込みに失敗しました');
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      // TODO: HDBとの連携メッセージ処理
      console.log('Received message from web:', data);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      )}
      
      <WebView
        source={{uri: ssoUrl || url}}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  placeholderNote: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
