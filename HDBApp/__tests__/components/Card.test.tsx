import React from 'react';
import {render} from '@testing-library/react-native';
import {Text} from 'react-native';
import Card from '../../src/components/Card';

describe('Card', () => {
  it('renders correctly with children', () => {
    const {getByText} = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('applies custom padding', () => {
    const {UNSAFE_root} = render(
      <Card padding={20}>
        <Text>Content</Text>
      </Card>
    );
    
    const cardView = UNSAFE_root.findByType('View');
    expect(cardView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({padding: 20})
      ])
    );
  });

  it('applies custom style', () => {
    const customStyle = {backgroundColor: 'red'};
    const {UNSAFE_root} = render(
      <Card style={customStyle}>
        <Text>Content</Text>
      </Card>
    );
    
    const cardView = UNSAFE_root.findByType('View');
    expect(cardView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('uses default padding when not specified', () => {
    const {UNSAFE_root} = render(
      <Card>
        <Text>Content</Text>
      </Card>
    );
    
    const cardView = UNSAFE_root.findByType('View');
    expect(cardView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({padding: 16})
      ])
    );
  });
});
