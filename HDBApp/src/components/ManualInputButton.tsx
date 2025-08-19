import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import theme from '../styles/theme';

interface Props {
  onPress: () => void;
  title: string; // Add title prop
}

const ManualInputButton = ({onPress, title}: Props) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManualInputButton;
