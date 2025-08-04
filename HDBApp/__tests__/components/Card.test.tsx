import React from 'react';
import { render } from '@testing-library/react-native';
import Card from '../../src/components/Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Test Card Content</Text>
      </Card>
    );
    expect(getByText('Test Card Content')).toBeDefined();
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Card style={customStyle} testID="card-component">
        <Text>Test</Text>
      </Card>
    );
    expect(getByTestId('card-component').props.style).toContainEqual(customStyle);
  });

  it('applies custom padding', () => {
    const { getByTestId } = render(
      <Card padding={20} testID="card-component">
        <Text>Test</Text>
      </Card>
    );
    expect(getByTestId('card-component').props.style).toContainEqual({ padding: 20 });
  });
});
