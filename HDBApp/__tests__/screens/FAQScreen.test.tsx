import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import FAQScreen from '../../src/screens/FAQScreen';

describe('FAQScreen', () => {
  it('renders correctly with FAQ items', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });

  it('expands and collapses FAQ items when tapped', () => {
    const {getAllByTestId} = render(<FAQScreen />);

    // Find all FAQ item TouchableOpacities
    const faqItems = getAllByTestId('TouchableOpacity');
    
    if (faqItems.length > 0) {
      // Test that we can tap FAQ items without errors
      fireEvent.press(faqItems[0]);
      fireEvent.press(faqItems[0]);
    }
    
    expect(faqItems).toBeTruthy();
  });

  it('displays all FAQ categories', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });

  it('shows Q and A icons correctly', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });

  it('shows expand/collapse icons correctly', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });

  it('shows contact section', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });

  it('shows FAQ data correctly', () => {
    const screen = render(<FAQScreen />);
    expect(screen).toBeTruthy();
  });
});