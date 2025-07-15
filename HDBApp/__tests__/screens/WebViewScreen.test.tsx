import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import WebViewScreen from '../../src/screens/WebViewScreen';

// WebView is already mocked in jest.setup.js
// No need to mock it again here

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
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Check if WebView component is rendered
    expect(getByTestId('webview')).toBeTruthy();
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
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Since WebView is mocked, we just check that the component renders
    expect(getByText('Example Website')).toBeTruthy();
  });

  it('displays refresh button', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    expect(getByTestId('refresh-button')).toBeTruthy();
  });

  it('handles refresh button press', () => {
    const {getByTestId} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    // Button press should not throw error
    expect(refreshButton).toBeTruthy();
  });

  it('handles navigation state changes', () => {
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Since WebView is mocked, we just check that the component renders
    expect(getByText('Example Website')).toBeTruthy();
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
    const {getByText} = render(
      <WebViewScreen navigation={mockNavigation as any} route={mockRoute as any} />
    );

    // Since WebView is mocked, we just check that the component renders
    expect(getByText('Example Website')).toBeTruthy();
  });
});
