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

type Props = StackScreenProps<RootStackParamList, 'TimingDetail'>;

const TimingDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const [timingDetail, setTimingDetail] = useState('');

  const handleSave = () => {
    if (route.params?.onSave) {
      route.params.onSave(timingDetail);
    }
    navigation.goBack();
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
            楽に動けるタイミングを考える
          </Text>

          <Text style={styles.subtitle}>
            どんな時なら、この行動を取りやすいですか？{'\n'}
            具体的に書いてみましょう。
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="例：お風呂から上がった直後、テレビを見ながら、朝起きてすぐ"
              placeholderTextColor="#999999"
              value={timingDetail}
              onChangeText={setTimingDetail}
              multiline={true}
              numberOfLines={5}
              autoFocus={true}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.helpText}>
            ポイント：すでにある習慣の「ついで」に{'\n'}
            行うと続けやすくなります
          </Text>

          <TouchableOpacity 
            style={[styles.saveButton, timingDetail.trim() && styles.saveButtonActive]}
            onPress={handleSave}
            disabled={!timingDetail.trim()}>
            <Text style={[styles.saveButtonText, timingDetail.trim() && styles.saveButtonTextActive]}>
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
    marginTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8C00',
    borderRadius: 8,
    padding: 15,
    marginBottom: 30,
  },
  input: {
    fontSize: 16,
    color: '#333333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 14,
    color: '#FF8C00',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
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

export default TimingDetailScreen;