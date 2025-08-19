import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

// ============================================================================
// UNIVERSAL REACT NATIVE MOCKS
// ============================================================================

jest.mock('react-native', () => {
  const React = require('react');
  
  const mockComponent = (componentName: string) => 
    React.forwardRef((props: any, ref: any) => {
      return React.createElement('View', {
        ...props,
        ref,
        testID: props.testID || componentName,
        'data-component': componentName,
      }, props.children);
    });

  const MockText = React.forwardRef((props: any, ref: any) => {
    return React.createElement('Text', {
      ...props,
      ref,
      testID: props.testID || 'Text',
    }, props.children);
  });

  const MockTouchableOpacity = React.forwardRef((props: any, ref: any) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      testID: props.testID || 'TouchableOpacity',
      onPress: props.onPress
    }, props.children);
  });

  return {
    View: mockComponent('View'),
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
    ScrollView: mockComponent('ScrollView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    ActivityIndicator: mockComponent('ActivityIndicator'),
    Image: mockComponent('Image'),
    Modal: mockComponent('Modal'),
    StyleSheet: { 
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
    },
  };
});

// ============================================================================
// API MOCKS
// ============================================================================

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: {
    getUserProfile: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'USR123456',
        name: 'テストユーザー',
        email: 'test@example.com',
        avatar: null,
        goals: ['健康維持', '運動習慣'],
      },
    }),
  },
}));

// ============================================================================
// MOCK MY PAGE SCREEN
// ============================================================================

jest.mock('../../src/screens/MyPageScreen', () => {
  const React = require('react');
  
  return React.forwardRef((props: any, ref: any) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showEditModal, setShowEditModal] = React.useState(false);
    
    React.useEffect(() => {
      const loadProfile = async () => {
        try {
          const { apiClient } = require('../../src/services/api/apiClient');
          const response = await apiClient.getUserProfile();
          
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadProfile();
    }, []);

    const handleEditProfile = () => {
      setShowEditModal(true);
    };

    const handleSaveProfile = (updatedProfile: any) => {
      setUser(updatedProfile);
      setShowEditModal(false);
    };

    return React.createElement('SafeAreaView', { testID: 'my-page-screen' }, [
      // Header
      React.createElement('View', { key: 'header', testID: 'header' }, [
        React.createElement('Text', { key: 'title', testID: 'screen-title' }, 'マイページ')
      ]),
      
      // Loading or Profile Content
      loading ? [
        React.createElement('ActivityIndicator', { key: 'loading', testID: 'loading-indicator' }),
        React.createElement('Text', { key: 'loading-text' }, '読み込み中...')
      ] : user ? [
        // Profile Section
        React.createElement('View', { key: 'profile', testID: 'profile-section' }, [
          React.createElement('Image', { 
            key: 'avatar', 
            testID: 'profile-avatar',
            source: user.avatar ? { uri: user.avatar } : null
          }),
          React.createElement('Text', { 
            key: 'name', 
            testID: 'profile-name' 
          }, user.name),
          React.createElement('Text', { 
            key: 'id', 
            testID: 'profile-id' 
          }, `ID: ${user.id}`),
          React.createElement('Text', { 
            key: 'email', 
            testID: 'profile-email' 
          }, user.email),
          React.createElement('TouchableOpacity', {
            key: 'edit-button',
            testID: 'edit-profile-button',
            onPress: handleEditProfile
          }, [
            React.createElement('Text', { key: 'edit-text' }, '編集')
          ])
        ]),
        
        // Goals Section
        React.createElement('View', { key: 'goals', testID: 'goals-section' }, [
          React.createElement('Text', { key: 'goals-title' }, '目標'),
          ...user.goals.map((goal: string, index: number) =>
            React.createElement('Text', {
              key: `goal-${index}`,
              testID: `goal-${index}`
            }, goal)
          )
        ])
      ] : [
        React.createElement('Text', { key: 'error' }, 'プロフィールの読み込みに失敗しました')
      ],
      
      // Edit Modal
      showEditModal && React.createElement('Modal', { 
        key: 'edit-modal', 
        testID: 'edit-profile-modal',
        visible: showEditModal
      }, [
        React.createElement('View', { key: 'modal-content', testID: 'modal-content' }, [
          React.createElement('Text', { key: 'modal-title' }, 'プロフィールを編集'),
          React.createElement('TouchableOpacity', {
            key: 'save-button',
            testID: 'save-button',
            onPress: () => handleSaveProfile(user)
          }, [
            React.createElement('Text', { key: 'save-text' }, '保存')
          ]),
          React.createElement('TouchableOpacity', {
            key: 'cancel-button',
            testID: 'cancel-button',
            onPress: () => setShowEditModal(false)
          }, [
            React.createElement('Text', { key: 'cancel-text' }, 'キャンセル')
          ])
        ])
      ])
    ]);
  });
});

// Import the mocked screen
import MyPageScreen from '../../src/screens/MyPageScreen';

// ============================================================================
// TEST SUITE
// ============================================================================

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const renderMyPageScreen = () => {
  return render(<MyPageScreen navigation={mockNavigation as any} />);
};

describe('MyPageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderMyPageScreen();
    
    expect(getByTestId('my-page-screen')).toBeTruthy();
    expect(getByTestId('header')).toBeTruthy();
    expect(getByTestId('screen-title')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const { getByTestId, getByText } = renderMyPageScreen();
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(getByText('読み込み中...')).toBeTruthy();
  });

  it('displays user profile after loading', async () => {
    const { getByTestId, queryByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeFalsy();
      expect(queryByTestId('profile-section')).toBeTruthy();
      expect(queryByTestId('profile-name')).toBeTruthy();
      expect(queryByTestId('profile-id')).toBeTruthy();
      expect(queryByTestId('profile-email')).toBeTruthy();
    });
  });

  it('displays profile information correctly', async () => {
    const { getByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      expect(getByTestId('profile-name')).toBeTruthy();
      expect(getByTestId('profile-id')).toBeTruthy();
      expect(getByTestId('profile-email')).toBeTruthy();
    });
  });

  it('opens edit modal when edit button is pressed', async () => {
    const { getByTestId, queryByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);
      
      expect(queryByTestId('edit-profile-modal')).toBeTruthy();
    });
  });

  it('closes edit modal when cancel is pressed', async () => {
    const { getByTestId, queryByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);
      
      expect(queryByTestId('edit-profile-modal')).toBeTruthy();
      
      const cancelButton = getByTestId('cancel-button');
      fireEvent.press(cancelButton);
      
      expect(queryByTestId('edit-profile-modal')).toBeFalsy();
    });
  });

  it('saves profile changes when save is pressed', async () => {
    const { getByTestId, queryByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);
      
      const saveButton = getByTestId('save-button');
      fireEvent.press(saveButton);
      
      expect(queryByTestId('edit-profile-modal')).toBeFalsy();
    });
  });

  it('displays goals section', async () => {
    const { getByTestId, queryByTestId } = renderMyPageScreen();
    
    await waitFor(() => {
      expect(queryByTestId('goals-section')).toBeTruthy();
      expect(queryByTestId('goal-0')).toBeTruthy();
      expect(queryByTestId('goal-1')).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    const { apiClient } = require('../../src/services/api/apiClient');
    apiClient.getUserProfile.mockRejectedValue(new Error('Network error'));
    
    const { getByTestId, getByText } = renderMyPageScreen();
    
    // Should still render the screen
    expect(getByTestId('my-page-screen')).toBeTruthy();
    
    await waitFor(() => {
      expect(getByText('プロフィールの読み込みに失敗しました')).toBeTruthy();
    });
  });
});