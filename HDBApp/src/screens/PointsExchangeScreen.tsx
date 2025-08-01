import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'PointsExchange'>;

interface ExchangeOption {
  id: string;
  name: string;
  points: number;
}

const PointsExchangeScreen: React.FC<Props> = ({navigation}) => {
  const [currentPoints] = useState(2500);

  const exchangeOptions: ExchangeOption[] = [
    {id: '1', name: 'dポイント', points: 100},
    {id: '2', name: 'dポイント', points: 300},
    {id: '3', name: 'dポイント', points: 500},
    {id: '4', name: 'dポイント', points: 1000},
  ];

  const handleExchange = (option: ExchangeOption) => {
    if (currentPoints < option.points) {
      Alert.alert(
        'ポイント不足',
        'ポイントが不足しています。',
        [{text: 'OK'}]
      );
      return;
    }

    Alert.alert(
      '交換確認',
      `${option.points}ptを${option.name}に交換しますか？`,
      [
        {text: 'キャンセル', style: 'cancel'},
        {
          text: '交換する',
          onPress: () => {
            Alert.alert(
              '交換完了',
              `${option.points}ptを${option.name}に交換しました。`,
              [{text: 'OK', onPress: () => navigation.goBack()}]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.currentPointsContainer}>
        <Text style={styles.currentPointsLabel}>現在のポイント</Text>
        <Text style={styles.currentPointsValue}>{currentPoints.toLocaleString()}pt</Text>
      </View>

      <View style={styles.optionsContainer}>
        {exchangeOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => handleExchange(option)}
            activeOpacity={0.8}>
            <Text style={styles.optionName}>{option.name}</Text>
            <Text style={styles.optionPoints}>{option.points}pt</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  currentPointsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentPointsLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  currentPointsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  optionPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default PointsExchangeScreen;