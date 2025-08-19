import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  testID?: string; // Add testID prop
}

export default function Card({children, style, padding = 16, testID}: CardProps) {
  return (
    <View style={[styles.card, {padding}, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
