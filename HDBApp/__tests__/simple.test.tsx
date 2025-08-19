import React from 'react';
import {render} from '@testing-library/react-native';
import {Text} from 'react-native';
import Button from '../src/components/Button';
import Card from '../src/components/Card';
import Input from '../src/components/Input';

describe('Simple Component Tests', () => {
  describe('Button Component', () => {
    it('renders with title', () => {
      const {getByText} = render(
        <Button title="Test Button" onPress={() => {}} />
      );
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('shows loading indicator when loading', () => {
      const {getByTestId} = render(
        <Button title="Test" onPress={() => {}} loading={true} />
      );
      expect(getByTestId('activity-indicator')).toBeTruthy();
    });
  });

  describe('Card Component', () => {
    it('renders children correctly', () => {
      const {getByText} = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });
  });

  describe('Input Component', () => {
    it('renders with placeholder', () => {
      const {getByPlaceholderText} = render(
        <Input placeholder="Enter text" />
      );
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('shows label when provided', () => {
      const {getByText} = render(
        <Input label="Username" placeholder="Enter username" />
      );
      expect(getByText('Username')).toBeTruthy();
    });

    it('shows error message when provided', () => {
      const {getByText} = render(
        <Input error="This field is required" placeholder="Enter text" />
      );
      expect(getByText('This field is required')).toBeTruthy();
    });
  });
});