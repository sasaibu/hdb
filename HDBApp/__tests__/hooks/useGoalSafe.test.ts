import {renderHook} from '@testing-library/react-native';
import React from 'react';
import {useGoalSafe} from '../../src/hooks/useGoalSafe';
import {GoalProvider} from '../../src/contexts/GoalContext';

describe('useGoalSafe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns context values when GoalProvider is available', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => 
      React.createElement(GoalProvider, null, children);

    const {result} = renderHook(() => useGoalSafe(), {wrapper});

    expect(result.current.isGoalSetting).toBe(false); // Default value from GoalProvider
    expect(result.current.hasCompletedGoal).toBe(false);
    expect(result.current.goalAchievementDate).toBe(null);
    expect(result.current.showCelebrationDialog).toBe(false);
    expect(typeof result.current.setIsGoalSetting).toBe('function');
    expect(typeof result.current.setHasCompletedGoal).toBe('function');
    expect(typeof result.current.setGoalAchievementDate).toBe('function');
    expect(typeof result.current.setShowCelebrationDialog).toBe('function');
    expect(typeof result.current.checkGoalAchievement).toBe('function');
  });

  it('returns default values when GoalProvider is not available', () => {
    // Render hook without wrapper (no GoalProvider)
    const {result} = renderHook(() => useGoalSafe());

    expect(result.current.isGoalSetting).toBe(false);
    expect(result.current.hasCompletedGoal).toBe(false);
    expect(result.current.goalAchievementDate).toBe(null);
    expect(result.current.showCelebrationDialog).toBe(false);
    expect(typeof result.current.setIsGoalSetting).toBe('function');
    expect(typeof result.current.setHasCompletedGoal).toBe('function');
    expect(typeof result.current.setGoalAchievementDate).toBe('function');
    expect(typeof result.current.setShowCelebrationDialog).toBe('function');
    expect(typeof result.current.checkGoalAchievement).toBe('function');
  });

  it('default functions do nothing when called', () => {
    // Render hook without wrapper (no GoalProvider)
    const {result} = renderHook(() => useGoalSafe());

    // These should not throw errors
    expect(() => {
      result.current.setIsGoalSetting(true);
      result.current.setHasCompletedGoal(true);
      result.current.setGoalAchievementDate(new Date());
      result.current.setShowCelebrationDialog(true);
    }).not.toThrow();
  });

  it('default checkGoalAchievement returns false', () => {
    // Render hook without wrapper (no GoalProvider)
    const {result} = renderHook(() => useGoalSafe());

    const achievementResult = result.current.checkGoalAchievement();
    expect(achievementResult).toBe(false);
  });

  it('handles multiple renders consistently', () => {
    const {result, rerender} = renderHook(() => useGoalSafe());

    const firstResult = result.current;
    
    rerender();
    
    const secondResult = result.current;

    // Should return the same default values consistently
    expect(firstResult.isGoalSetting).toBe(secondResult.isGoalSetting);
    expect(firstResult.hasCompletedGoal).toBe(secondResult.hasCompletedGoal);
    expect(firstResult.goalAchievementDate).toBe(secondResult.goalAchievementDate);
    expect(firstResult.showCelebrationDialog).toBe(secondResult.showCelebrationDialog);
  });
});