import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/AppNavigator';

// TODO: react-native-webviewをインストール後に有効化
// import {WebView} from 'react-native-webview';

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
  const [_isLoading, _setIsLoading] = useState(true);
  const {url, title} = route.params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Web',
    });
  }, [navigation, title]);

  // TODO: react-native-webview有効化時に使用
  // const handleLoadStart = () => {
  //   setIsLoading(true);
  // };

  // const handleLoadEnd = () => {
  //   setIsLoading(false);
  // };

  // const handleError = () => {
  //   setIsLoading(false);
  //   Alert.alert('エラー', 'ページの読み込みに失敗しました');
  // };

  // const handleMessage = (event: any) => {
  //   try {
  //     const data = JSON.parse(event.nativeEvent.data);
  //     // TODO: HDBとの連携メッセージ処理
  //     console.log('Received message from web:', data);
  //   } catch (error) {
  //     console.error('Failed to parse message:', error);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* TODO: WebView実装時にローディング表示を有効化 */}
      {/* {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      )} */}
      
      {/* TODO: react-native-webviewインストール後に有効化 */}
      {/* <WebView
        source={{uri: url}}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      /> */}
      
      {/* 暫定表示 */}
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>WebView画面</Text>
        <Text style={styles.placeholderText}>URL: {url}</Text>
        <Text style={styles.placeholderNote}>
          react-native-webviewライブラリをインストール後に実装されます
        </Text>
      </View>
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