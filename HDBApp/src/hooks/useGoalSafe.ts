import { useContext } from 'react';
import { GoalContext } from '../contexts/GoalContext';

export const useGoalSafe = () => {
  try {
    const context = useContext(GoalContext);
    if (!context) {
      // Contextが存在しない場合のデフォルト値
      return {
        isGoalSetting: false,
        hasCompletedGoal: false,
        goalAchievementDate: null,
        showCelebrationDialog: false,
        setIsGoalSetting: () => {},
        setHasCompletedGoal: () => {},
        setGoalAchievementDate: () => {},
        setShowCelebrationDialog: () => {},
        checkGoalAchievement: () => false,
      };
    }
    return context;
  } catch (error) {
    // エラーが発生した場合のデフォルト値
    return {
      isGoalSetting: false,
      hasCompletedGoal: false,
      goalAchievementDate: null,
      showCelebrationDialog: false,
      setIsGoalSetting: () => {},
      setHasCompletedGoal: () => {},
      setGoalAchievementDate: () => {},
      setShowCelebrationDialog: () => {},
      checkGoalAchievement: () => false,
    };
  }
};