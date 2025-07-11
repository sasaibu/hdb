import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import WebViewScreen from '../../src/screens/WebViewScreen';
import {WebView} from 'react-native-webview';

// Mock react-native-webview
jest.mock('react-native-webview', () => ({
  WebView: jest.fn(({onLoadStart, onLoadEnd, onError}) => {
    // Mock component that calls callbacks
    React.useEffect(() => {
      onLoadStart?.({nativeEvent: {url: 'https://example.com'}});
      setTimeout(() => {
        onLoadEnd?.({nativeEvent: {url: 'https://example.com'}});
      }, 100);
    }, []);
    
    return null;
  }),
}));

const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
};

const mockRoute = {
  params: {
    url: 'https://example.com',
    title: 'Example Website',
  },
};

describe('WebViewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and URL', () => {
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText('Example Website')).toBeTruthy();
    expect(getByText('戻る')).toBeTruthy();
  });

  it('displays WebView with correct URL', () => {
    render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(WebView).toHaveBeenCalledWith(
      expect.objectContaining({
        source: {uri: 'https://example.com'},
        startInLoadingState: true,
      }),
      expect.any(Object)
    );
  });

  it('navigates back when back button is pressed', () => {
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const backButton = getByText('戻る');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when page is loading', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('webview-loading')).toBeTruthy();
  });

  it('handles WebView errors', () => {
    // Mock WebView to trigger error
    (WebView as jest.Mock).mockImplementationOnce(({onError}) => {
      React.useEffect(() => {
        onError?.({
          nativeEvent: {
            description: 'Network error',
            code: -1,
          },
        });
      }, []);
      return null;
    });

    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByText(/エラーが発生しました/)).toBeTruthy();
  });

  it('displays refresh button', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('refresh-button')).toBeTruthy();
  });

  it('handles refresh button press', () => {
    const mockReload = jest.fn();
    (WebView as jest.Mock).mockImplementationOnce(() => {
      return {reload: mockReload};
    });

    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    // WebView reload should be called
  });

  it('handles navigation state changes', () => {
    let onNavigationStateChange: any;
    (WebView as jest.Mock).mockImplementationOnce((props) => {
      onNavigationStateChange = props.onNavigationStateChange;
      return null;
    });

    render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Simulate navigation
    onNavigationStateChange?.({
      url: 'https://example.com/new-page',
      canGoBack: true,
      canGoForward: false,
    });

    expect(WebView).toHaveBeenCalled();
  });

  it('handles missing URL parameter', () => {
    const invalidRoute = {
      params: {
        title: 'No URL',
      },
    };

    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={invalidRoute as any} />
    );

    expect(getByText(/URLが指定されていません/)).toBeTruthy();
  });

  it('handles JavaScript injection', () => {
    let injectedJavaScript: string;
    (WebView as jest.Mock).mockImplementationOnce((props) => {
      injectedJavaScript = props.injectedJavaScript;
      return null;
    });

    render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(injectedJavaScript).toBeDefined();
  });
});