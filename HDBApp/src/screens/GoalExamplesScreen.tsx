import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'GoalExamples'>;

const GOAL_EXAMPLES = [
  {
    category: '運動',
    examples: [
      '朝起きたら5分間ストレッチをする',
      '階段を見たら1階分だけ上る',
      '歯磨きの間、かかと上げを10回する',
      'テレビCMの間、その場で足踏みする',
    ],
  },
  {
    category: '食事',
    examples: [
      '食事の最初に野菜を一口食べる',
      'お茶を1日1杯多く飲む',
      '夕食で白米を半分にする',
      '間食の前に水を1杯飲む',
    ],
  },
  {
    category: '睡眠',
    examples: [
      '寝る5分前にスマホを置く',
      '布団に入ったら深呼吸を3回する',
      '朝起きたらカーテンを開ける',
      '寝室の温度を1度下げる',
    ],
  },
  {
    category: 'メンタルヘルス',
    examples: [
      '朝起きたら「今日も良い日」と言う',
      '1日1回、鏡で笑顔を作る',
      '寝る前に今日の良かったことを1つ思い出す',
      '深呼吸を5回する',
    ],
  },
];

const GoalExamplesScreen: React.FC<Props> = ({navigation, route}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>
          5分で達成できる目標の例
        </Text>

        <Text style={styles.description}>
          小さな目標から始めることで、無理なく習慣化できます。
          以下の例を参考に、あなたに合った目標を見つけてください。
        </Text>

        {GOAL_EXAMPLES.map((category, index) => (
          <View key={index} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            {category.examples.map((example, exampleIndex) => (
              <TouchableOpacity
                key={exampleIndex}
                style={styles.exampleItem}
                onPress={() => {
                  // 前の画面に例文を渡して戻る
                  if (route.params?.onSelectExample) {
                    route.params.onSelectExample(example);
                  }
                  navigation.goBack();
                }}>
                <Text style={styles.exampleText}>• {example}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>
            戻る
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5E6', // 薄い橙色
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 15,
  },
  exampleItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalExamplesScreen;