import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'GoalDetail'>;

const GoalDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const [goal, setGoal] = useState(route.params?.initialGoal || '');

  const handleSave = () => {
    if (goal.trim()) {
      // 前の画面（GoalInputScreen）に戻って目標を更新
      if (route.params?.onSave) {
        route.params.onSave(goal);
      }
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <Text style={styles.title}>
            目標を入力してください
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="例：毎日5分ストレッチをする"
              placeholderTextColor="#999999"
              value={goal}
              onChangeText={setGoal}
              multiline={true}
              numberOfLines={5}
              autoFocus={true}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, goal.trim() && styles.saveButtonActive]}
            onPress={handleSave}
            disabled={!goal.trim()}>
            <Text style={[styles.saveButtonText, goal.trim() && styles.saveButtonTextActive]}>
              決定
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
    padding: 15,
    marginBottom: 60,
  },
  input: {
    fontSize: 16,
    color: '#333333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  saveButtonActive: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  saveButtonText: {
    color: '#999999',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default GoalDetailScreen;