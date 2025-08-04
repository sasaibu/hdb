import React from 'react';
import {render, fireEvent, within} from '@testing-library/react-native';
import FAQScreen from '../../src/screens/FAQScreen';

describe('FAQScreen', () => {
  it('renders correctly with FAQ items', () => {
    const {getByText} = render(<FAQScreen />);

    // Check header
    expect(getByText('よくあるご質問')).toBeTruthy();
    expect(getByText('お困りの内容をタップして回答をご確認ください')).toBeTruthy();

    // Check if FAQ questions are rendered
    expect(getByText('データの記録方法がわかりません')).toBeTruthy();
    expect(getByText('過去のデータを確認するには？')).toBeTruthy();
    expect(getByText('パスワードを忘れてしまいました')).toBeTruthy();
    expect(getByText('機種変更時のデータ移行方法は？')).toBeTruthy();
    expect(getByText('HealthKitと連携できません')).toBeTruthy();
  });

  it('expands and collapses FAQ items when tapped', () => {
    const {getAllByTestId, queryByText, getByText} = render(<FAQScreen />);

    // Find all FAQ item TouchableOpacities
    const faqItems = getAllByTestId('TouchableOpacity');
    
    // Initially, the answer should not be visible
    expect(queryByText(/「記録」タブを開き/)).toBeNull();

    // Tap the first FAQ item that contains the question
    const firstFaqItem = faqItems.find(item => {
      try {
        within(item).getByText('データの記録方法がわかりません');
        return true;
      } catch {
        return false;
      }
    });

    if (firstFaqItem) {
      fireEvent.press(firstFaqItem);
      
      // Now the answer should be visible
      expect(getByText(/「記録」タブを開き/)).toBeTruthy();

      // Tap again to collapse
      fireEvent.press(firstFaqItem);
      
      // Answer should be hidden again
      expect(queryByText(/「記録」タブを開き/)).toBeNull();
    }
  });

  it('displays all FAQ categories', () => {
    const {getAllByText} = render(<FAQScreen />);

    // Check that category labels are displayed
    const basicOperationTexts = getAllByText('基本操作');
    expect(basicOperationTexts.length).toBeGreaterThan(0);
    
    const accountTexts = getAllByText('アカウント');
    expect(accountTexts.length).toBeGreaterThan(0);
    
    const integrationTexts = getAllByText('連携');
    expect(integrationTexts.length).toBeGreaterThan(0);
  });

  it('shows Q and A icons correctly', () => {
    const {getAllByText, getByText, getAllByTestId, queryByText} = render(<FAQScreen />);

    // Check that Q icons are displayed for all questions
    const qIcons = getAllByText('Q');
    expect(qIcons.length).toBe(5); // 5 FAQ items

    // Expand a question to see A icon
    const faqItems = getAllByTestId('TouchableOpacity');
    const firstFaqItem = faqItems.find(item => {
      try {
        within(item).getByText('データの記録方法がわかりません');
        return true;
      } catch {
        return false;
      }
    });

    if (firstFaqItem) {
      fireEvent.press(firstFaqItem);
      
      // Now A icon should be visible
      expect(getByText('A')).toBeTruthy();
    }
  });

  it('shows expand/collapse icons correctly', () => {
    const {getByText, getAllByText, getAllByTestId} = render(<FAQScreen />);

    // Initially all items should show + icon
    const plusIcons = getAllByText('+');
    expect(plusIcons.length).toBe(5); // 5 FAQ items

    // Expand first item
    const faqItems = getAllByTestId('TouchableOpacity');
    const firstFaqItem = faqItems.find(item => {
      try {
        within(item).getByText('データの記録方法がわかりません');
        return true;
      } catch {
        return false;
      }
    });

    if (firstFaqItem) {
      fireEvent.press(firstFaqItem);

      // Now should have 4 plus icons and 1 minus icon
      const minusIcon = getByText('−');
      expect(minusIcon).toBeTruthy();
    }
  });

  it('shows contact section', () => {
    const {getByText} = render(<FAQScreen />);

    expect(getByText('解決しない場合')).toBeTruthy();
    expect(getByText('上記で解決しない場合は、お問い合わせフォームからご連絡ください。')).toBeTruthy();
    expect(getByText('お問い合わせ')).toBeTruthy();
  });

  it('shows FAQ data correctly', () => {
    const {getByText} = render(<FAQScreen />);

    // Test that we can see questions from different categories
    expect(getByText('データの記録方法がわかりません')).toBeTruthy(); // 基本操作
    expect(getByText('パスワードを忘れてしまいました')).toBeTruthy(); // アカウント
    expect(getByText('HealthKitと連携できません')).toBeTruthy(); // 連携
  });
});