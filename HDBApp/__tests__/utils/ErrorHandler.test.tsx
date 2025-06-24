import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Text} from 'react-native';
import {ErrorBoundary, handleApiError} from '../../src/utils/ErrorHandler';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

const ThrowError = ({shouldThrow}: {shouldThrow: boolean}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text testID="child-component">Child Component</Text>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const {getByTestId} = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(getByTestId('child-component')).toBeTruthy();
  });

  it('renders error UI when there is an error', () => {
    const {getByText} = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('申し訳ございません')).toBeTruthy();
    expect(getByText(/予期しないエラーが発生しました/)).toBeTruthy();
    expect(getByText('再試行')).toBeTruthy();
  });

  it('resets error state when reload button is pressed', () => {
    const {getByText, queryByText} = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Error state should be showing
    expect(getByText('申し訳ございません')).toBeTruthy();
    
    // Press reload button to reset error state
    fireEvent.press(getByText('再試行'));
    
    // Error message should be gone
    expect(queryByText('申し訳ございません')).toBeNull();
  });

  it('logs error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleSpy.mockRestore();
  });
});

describe('handleApiError', () => {
  it('handles 400 status code', () => {
    const error = {
      response: {
        status: 400
      }
    };
    
    expect(handleApiError(error)).toBe('入力内容に不備があります');
  });

  it('handles 401 status code', () => {
    const error = {
      response: {
        status: 401
      }
    };
    
    expect(handleApiError(error)).toBe('認証に失敗しました');
  });

  it('handles 403 status code', () => {
    const error = {
      response: {
        status: 403
      }
    };
    
    expect(handleApiError(error)).toBe('アクセス権限がありません');
  });

  it('handles 404 status code', () => {
    const error = {
      response: {
        status: 404
      }
    };
    
    expect(handleApiError(error)).toBe('データが見つかりません');
  });

  it('handles 500 status code', () => {
    const error = {
      response: {
        status: 500
      }
    };
    
    expect(handleApiError(error)).toBe('サーバーエラーが発生しました');
  });

  it('handles unknown status codes', () => {
    const error = {
      response: {
        status: 418
      }
    };
    
    expect(handleApiError(error)).toBe('エラーが発生しました');
  });

  it('handles network errors', () => {
    const error = {
      request: {}
    };
    
    expect(handleApiError(error)).toBe('ネットワークに接続できません');
  });

  it('handles other errors', () => {
    const error = {
      message: 'Something went wrong'
    };
    
    expect(handleApiError(error)).toBe('予期しないエラーが発生しました');
  });
});
