import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CelebrationDialog from '../../src/components/CelebrationDialog';

describe('CelebrationDialog', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <CelebrationDialog visible={true} onClose={() => {}} />
    );
    expect(getByText('おめでとうございます！')).toBeDefined();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <CelebrationDialog visible={false} onClose={() => {}} />
    );
    expect(queryByText('おめでとうございます！')).toBeNull();
  });

  it('calls onClose when the close button is pressed', () => {
    const mockOnClose = jest.fn();
    const { getByText } = render(
      <CelebrationDialog visible={true} onClose={mockOnClose} />
    );
    fireEvent.press(getByText('完了'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
