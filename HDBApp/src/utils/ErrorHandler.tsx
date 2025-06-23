import React, {Component, ReactNode} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface State {
  hasError: boolean;
  error?: Error;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // TODO: エラーログ送信処理
  }

  handleReload = () => {
    this.setState({hasError: false, error: undefined});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>申し訳ございません</Text>
          <Text style={styles.message}>
            予期しないエラーが発生しました。{'\n'}
            アプリを再起動してお試しください。
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails}>
              {this.state.error.toString()}
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReload}>
            <Text style={styles.buttonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export const handleApiError = (error: any): string => {
  if (error.response) {
    // API からのエラーレスポンス
    switch (error.response.status) {
      case 400:
        return '入力内容に不備があります';
      case 401:
        return '認証に失敗しました';
      case 403:
        return 'アクセス権限がありません';
      case 404:
        return 'データが見つかりません';
      case 500:
        return 'サーバーエラーが発生しました';
      default:
        return 'エラーが発生しました';
    }
  } else if (error.request) {
    // ネットワークエラー
    return 'ネットワークに接続できません';
  } else {
    // その他のエラー
    return '予期しないエラーが発生しました';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});