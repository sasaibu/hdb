import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import ProfileEditModal from '../components/ProfileEditModal';

const MyPageScreen = () => {
  const [user, setUser] = useState({
    id: 'user_12345',
    nickname: 'テストユーザー',
    icon: 'https://via.placeholder.com/150',
  });
  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveProfile = (data: {nickname: string}) => {
    // バリデーション
    if (!data.nickname || data.nickname.trim() === '') {
      Alert.alert('エラー', 'ニックネームは空にできません。');
      return;
    }
    if (data.nickname.length > 20) {
      Alert.alert('エラー', 'ニックネームは20文字以内で入力してください。');
      return;
    }

    setUser(prevUser => ({...prevUser, nickname: data.nickname}));
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{uri: user.icon}} style={styles.avatar} />
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.userId}>@{user.id}</Text>
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
});

export default MyPageScreen;
