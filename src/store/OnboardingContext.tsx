import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simplified to string to allow dynamic DB expansion
type Objective = string;

interface OnboardingData {
    objective: Objective | null;
    signals: string[];
    baseline: number | null;
    selectedActions: string[];
    periodMonths: number | null;
    startDate: string | null; // ISO String for easier serialization
    endDate: string | null;
    customPlan?: any; // To store AI generated plan
}

interface OnboardingContextType {
    data: OnboardingData;
    setObjective: (objective: Objective) => void;
    setSignals: (signals: string[]) => void;
    setBaseline: (baseline: number) => void;
    setSelectedActions: (actions: string[]) => void;
    setPeriod: (months: number, startDate: string, endDate: string) => void;
    setCustomPlan: (plan: any) => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialData: OnboardingData = {
    objective: null,
    signals: [],
    baseline: null,
    selectedActions: [],
    periodMonths: null,
    startDate: null,
    endDate: null
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

    const setPeriod = (months: number, startDate: string, endDate: string) => {
        setData(prev => ({ ...prev, periodMonths: months, startDate, endDate }));
    };

    const setCustomPlan = (plan: any) => {
        setData(prev => ({ ...prev, customPlan: plan }));
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
                setPeriod,
                setCustomPlan,
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
