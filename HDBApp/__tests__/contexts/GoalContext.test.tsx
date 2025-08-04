import React from 'react';
import {render, act} from '@testing-library/react-native';
import {Text, TouchableOpacity} from 'react-native';
import {GoalProvider, useGoal, GoalContext} from '../../src/contexts/GoalContext';

// Test component that uses the GoalContext
const TestComponent: React.FC = () => {
  const {
    isGoalSetting,
    hasCompletedGoal,
    goalAchievementDate,
    showCelebrationDialog,
    setIsGoalSetting,
    setHasCompletedGoal,
    setGoalAchievementDate,
    setShowCelebrationDialog,
    checkGoalAchievement,
  } = useGoal();

  const handleSetGoalSetting = (value: boolean) => {
    setIsGoalSetting(value);
  };

  const handleSetCompletedGoal = (value: boolean) => {
    setHasCompletedGoal(value);
  };

  const handleSetAchievementDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setGoalAchievementDate(date);
  };

  const handleSetShowDialog = (show: boolean) => {
    setShowCelebrationDialog(show);
  };

  const handleCheckAchievement = () => {
    const result = checkGoalAchievement();
    return result;
  };

  return (
    <>
      <Text testID="isGoalSetting">{isGoalSetting.toString()}</Text>
      <Text testID="hasCompletedGoal">{hasCompletedGoal.toString()}</Text>
      <Text testID="goalAchievementDate">
        {goalAchievementDate ? goalAchievementDate.toISOString() : 'null'}
      </Text>
      <Text testID="showCelebrationDialog">{showCelebrationDialog.toString()}</Text>
      
      <TouchableOpacity
        testID="setGoalSettingTrue"
        onPress={() => handleSetGoalSetting(true)}>
        <Text>Set Goal Setting True</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setGoalSettingFalse"
        onPress={() => handleSetGoalSetting(false)}>
        <Text>Set Goal Setting False</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setCompletedGoalTrue"
        onPress={() => handleSetCompletedGoal(true)}>
        <Text>Set Completed Goal True</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setCompletedGoalFalse"
        onPress={() => handleSetCompletedGoal(false)}>
        <Text>Set Completed Goal False</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setAchievementDate30DaysAgo"
        onPress={() => handleSetAchievementDate(30)}>
        <Text>Set Achievement Date 30 Days Ago</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setAchievementDate10DaysAgo"
        onPress={() => handleSetAchievementDate(10)}>
        <Text>Set Achievement Date 10 Days Ago</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setShowDialogTrue"
        onPress={() => handleSetShowDialog(true)}>
        <Text>Set Show Dialog True</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="setShowDialogFalse"
        onPress={() => handleSetShowDialog(false)}>
        <Text>Set Show Dialog False</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        testID="checkAchievement"
        onPress={handleCheckAchievement}>
        <Text>Check Achievement</Text>
      </TouchableOpacity>
    </>
  );
};

// Component without GoalProvider to test error handling
const TestComponentWithoutProvider: React.FC = () => {
  const goal = useGoal();
  return <Text>Should not render</Text>;
};

describe('GoalContext', () => {
  it('provides initial default values', () => {
    const {getByTestId} = render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );

    expect(getByTestId('isGoalSetting').props.children).toBe('false');
    expect(getByTestId('hasCompletedGoal').props.children).toBe('false');
    expect(getByTestId('goalAchievementDate').props.children).toBe('null');
    expect(getByTestId('showCelebrationDialog').props.children).toBe('false');
  });

  it('updates isGoalSetting state correctly', () => {
    const {getByTestId} = render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );

    // Initially false
    expect(getByTestId('isGoalSetting').props.children).toBe('false');

    // Set to true
    act(() => {
      getByTestId('setGoalSettingTrue').props.onPress();
    });
    expect(getByTestId('isGoalSetting').props.children).toBe('true');

    // Set back to false
    act(() => {
      getByTestId('setGoalSettingFalse').props.onPress();
    });
    expect(getByTestId('isGoalSetting').props.children).toBe('false');
  });

  it('updates hasCompletedGoal state correctly', () => {
    const {getByTestId} = render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );

    // Initially false
    expect(getByTestId('hasCompletedGoal').props.children).toBe('false');

    // Set to true
    act(() => {
      getByTestId('setCompletedGoalTrue').props.onPress();
    });
    expect(getByTestId('hasCompletedGoal').props.children).toBe('true');

    // Set back to false
    act(() => {
      getByTestId('setCompletedGoalFalse').props.onPress();
    });
    expect(getByTestId('hasCompletedGoal').props.children).toBe('false');
  });

  it('updates goalAchievementDate state correctly', () => {
    const {getByTestId} = render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );

    // Initially null
    expect(getByTestId('goalAchievementDate').props.children).toBe('null');

    // Set a date
    act(() => {
      getByTestId('setAchievementDate30DaysAgo').props.onPress();
    });
    expect(getByTestId('goalAchievementDate').props.children).not.toBe('null');
  });

  it('updates showCelebrationDialog state correctly', () => {
    const {getByTestId} = render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );

    // Initially false
    expect(getByTestId('showCelebrationDialog').props.children).toBe('false');

    // Set to true
    act(() => {
      getByTestId('setShowDialogTrue').props.onPress();
    });
    expect(getByTestId('showCelebrationDialog').props.children).toBe('true');

    // Set back to false
    act(() => {
      getByTestId('setShowDialogFalse').props.onPress();
    });
    expect(getByTestId('showCelebrationDialog').props.children).toBe('false');
  });

  it('checkGoalAchievement returns false when no achievement date is set', () => {
    let achievementResult = false;
    
    const TestAchievementComponent = () => {
      const {checkGoalAchievement} = useGoal();
      
      const handleCheck = () => {
        achievementResult = checkGoalAchievement();
      };
      
      return (
        <TouchableOpacity testID="checkButton" onPress={handleCheck}>
          <Text>Check</Text>
        </TouchableOpacity>
      );
    };

    const {getByTestId} = render(
      <GoalProvider>
        <TestAchievementComponent />
      </GoalProvider>
    );

    act(() => {
      getByTestId('checkButton').props.onPress();
    });

    expect(achievementResult).toBe(false);
  });

  it('checkGoalAchievement returns true when achievement date is 30 or more days ago', () => {
    let achievementResult = false;
    let setAchievementDateRef: ((date: Date | null) => void) | null = null;
    let checkAchievementRef: (() => boolean) | null = null;
    
    const TestAchievementComponent = () => {
      const {setGoalAchievementDate, checkGoalAchievement} = useGoal();
      
      // Store refs to functions
      setAchievementDateRef = setGoalAchievementDate;
      checkAchievementRef = checkGoalAchievement;
      
      return (
        <TouchableOpacity testID="checkButton">
          <Text>Check</Text>
        </TouchableOpacity>
      );
    };

    render(
      <GoalProvider>
        <TestAchievementComponent />
      </GoalProvider>
    );

    // Set date to 31 days ago to ensure it's more than 30
    const date = new Date();
    date.setDate(date.getDate() - 31);
    
    act(() => {
      if (setAchievementDateRef) {
        setAchievementDateRef(date);
      }
    });

    // Wait for state update, then check
    act(() => {
      if (checkAchievementRef) {
        achievementResult = checkAchievementRef();
      }
    });

    expect(achievementResult).toBe(true);
  });

  it('checkGoalAchievement returns false when achievement date is less than 30 days ago', () => {
    let achievementResult = true; // Start with true to ensure it changes
    
    const TestAchievementComponent = () => {
      const {setGoalAchievementDate, checkGoalAchievement} = useGoal();
      
      const handleCheck = () => {
        // Set date to 10 days ago
        const date = new Date();
        date.setDate(date.getDate() - 10);
        setGoalAchievementDate(date);
        achievementResult = checkGoalAchievement();
      };
      
      return (
        <TouchableOpacity testID="checkButton" onPress={handleCheck}>
          <Text>Check</Text>
        </TouchableOpacity>
      );
    };

    const {getByTestId} = render(
      <GoalProvider>
        <TestAchievementComponent />
      </GoalProvider>
    );

    act(() => {
      getByTestId('checkButton').props.onPress();
    });

    expect(achievementResult).toBe(false);
  });

  it('throws error when useGoal is used outside of GoalProvider', () => {
    // Suppress console.error for this test since we expect an error
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useGoal must be used within a GoalProvider');

    consoleError.mockRestore();
  });

  it('allows setting goalAchievementDate to null', () => {
    const TestNullDateComponent = () => {
      const {goalAchievementDate, setGoalAchievementDate} = useGoal();
      
      const handleSetNull = () => {
        setGoalAchievementDate(null);
      };
      
      return (
        <>
          <Text testID="dateValue">
            {goalAchievementDate ? goalAchievementDate.toISOString() : 'null'}
          </Text>
          <TouchableOpacity testID="setNullButton" onPress={handleSetNull}>
            <Text>Set Null</Text>
          </TouchableOpacity>
        </>
      );
    };

    const {getByTestId} = render(
      <GoalProvider>
        <TestNullDateComponent />
      </GoalProvider>
    );

    // Initially null
    expect(getByTestId('dateValue').props.children).toBe('null');

    // Should remain null after explicit setting
    act(() => {
      getByTestId('setNullButton').props.onPress();
    });
    expect(getByTestId('dateValue').props.children).toBe('null');
  });
});