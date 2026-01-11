import React, { createContext, useContext, useState, ReactNode } from 'react';

type Objective = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';

interface OnboardingData {
    objective: Objective | null;
    signals: string[];
    baseline: number | null;
    selectedActions: string[];
}

interface OnboardingContextType {
    data: OnboardingData;
    setObjective: (objective: Objective) => void;
    setSignals: (signals: string[]) => void;
    setBaseline: (baseline: number) => void;
    setSelectedActions: (actions: string[]) => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialData: OnboardingData = {
    objective: null,
    signals: [],
    baseline: null,
    selectedActions: []
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<OnboardingData>(initialData);

    const setObjective = (objective: Objective) => {
        setData(prev => ({ ...prev, objective }));
    };

    const setSignals = (signals: string[]) => {
        setData(prev => ({ ...prev, signals }));
    };

    const setBaseline = (baseline: number) => {
        setData(prev => ({ ...prev, baseline }));
    };

    const setSelectedActions = (actions: string[]) => {
        setData(prev => ({ ...prev, selectedActions: actions }));
    };

    const resetOnboarding = () => {
        setData(initialData);
    };

    return (
        <OnboardingContext.Provider
            value={{
                data,
                setObjective,
                setSignals,
                setBaseline,
                setSelectedActions,
                resetOnboarding
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
