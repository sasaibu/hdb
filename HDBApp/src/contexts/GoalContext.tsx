import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GoalContextType {
  isGoalSetting: boolean;
  hasCompletedGoal: boolean;
  setIsGoalSetting: (value: boolean) => void;
  setHasCompletedGoal: (value: boolean) => void;
}

export const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGoalSetting, setIsGoalSetting] = useState(false);
  const [hasCompletedGoal, setHasCompletedGoal] = useState(false);

  return (
    <GoalContext.Provider
      value={{
        isGoalSetting,
        hasCompletedGoal,
        setIsGoalSetting,
        setHasCompletedGoal,
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