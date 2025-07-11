import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ProfileEditModal from '../components/ProfileEditModal';
import {apiClient} from '../services/api/apiClient';

const MyPageScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser({
          id: response.data.id,
          nickname: response.data.displayName || response.data.username,
          icon: response.data.avatar || 'https://via.placeholder.com/150',
          email: response.data.email,
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('エラー', 'プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: {nickname: string}) => {
    // バリデーション
    if (!data.nickname || data.nickname.trim() === '') {
      Alert.alert('エラー', 'ニックネームは空にできません。');
      return;
    }
    if (data.nickname.length > 20) {
      Alert.alert('エラー', 'ニックネームは20文字以内で入力してください。');
      return;
    }

    try {
      const response = await apiClient.updateProfile({
        displayName: data.nickname,
      });
      
      if (response.success && response.data) {
        setUser(prevUser => ({...prevUser, nickname: data.nickname}));
        setModalVisible(false);
        Alert.alert('成功', 'プロフィールを更新しました');
      } else {
        Alert.alert('エラー', 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>ユーザー情報を取得できませんでした</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{uri: user.icon}} style={styles.avatar} />
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.userId}>ID: {user.id}</Text>
        {user.email && <Text style={styles.email}>{user.email}</Text>}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.editButtonText}>プロフィールを編集</Text>
        </TouchableOpacity>
      </View>

      <ProfileEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProfile}
        user={user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyPageScreen;
