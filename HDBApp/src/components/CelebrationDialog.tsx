import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

interface CelebrationDialogProps {
  visible: boolean;
  onClose: () => void;
}

const CelebrationDialog: React.FC<CelebrationDialogProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.celebrationIcon}>
            <Text style={styles.iconText}>🎉</Text>
          </View>
          
          <Text style={styles.title}>おめでとうございます！</Text>
          
          <Text style={styles.message}>
            30日間の目標を達成しました！{'\n'}
            素晴らしい頑張りです！
          </Text>
          
          <View style={styles.achievementBox}>
            <Text style={styles.achievementText}>
              ✨ 30日間連続達成 ✨
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>完了</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 340,
    ...theme.shadow.lg,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  achievementBox: {
    backgroundColor: theme.colors.success + '15',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.success,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 120,
    ...theme.shadow.md,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CelebrationDialog;