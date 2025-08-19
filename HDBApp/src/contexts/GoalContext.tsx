import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GoalContextType {
  isGoalSetting: boolean;
  hasCompletedGoal: boolean;
  goalAchievementDate: Date | null;
  showCelebrationDialog: boolean;
  setIsGoalSetting: (value: boolean) => void;
  setHasCompletedGoal: (value: boolean) => void;
  setGoalAchievementDate: (date: Date | null) => void;
  setShowCelebrationDialog: (show: boolean) => void;
  checkGoalAchievement: () => boolean;
}

export const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGoalSetting, setIsGoalSetting] = useState(false);
  const [hasCompletedGoal, setHasCompletedGoal] = useState(false);
  const [goalAchievementDate, setGoalAchievementDate] = useState<Date | null>(null);
  const [showCelebrationDialog, setShowCelebrationDialog] = useState(false);

  const checkGoalAchievement = (): boolean => {
    if (!goalAchievementDate) return false;
    
    const today = new Date();
    const achievementDate = new Date(goalAchievementDate);
    const daysDifference = Math.floor((today.getTime() - achievementDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDifference >= 30;
  };

  return (
    <GoalContext.Provider
      value={{
        isGoalSetting,
        hasCompletedGoal,
        goalAchievementDate,
        showCelebrationDialog,
        setIsGoalSetting,
        setHasCompletedGoal,
        setGoalAchievementDate,
        setShowCelebrationDialog,
        checkGoalAchievement,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
};