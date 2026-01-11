import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
// Screens
import { LoginScreen } from '../screens/LoginScreen'; // Deprecated/Social
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { EmailLoginScreen } from '../screens/auth/EmailLoginScreen';

import { Onboarding1PositioningScreen } from '../screens/Onboarding1PositioningScreen';
import { Onboarding2IdentityScreen } from '../screens/Onboarding2IdentityScreen';
import { Onboarding3ExpectationsScreen } from '../screens/Onboarding3ExpectationsScreen';
import { Onboarding4ProgressSignalsScreen } from '../screens/Onboarding4ProgressSignalsScreen';
import { Onboarding5BaselineScreen } from '../screens/Onboarding5BaselineScreen';
import { Onboarding6ActionsScreen } from '../screens/Onboarding6ActionsScreen';
import { Onboarding7ClosureScreen } from '../screens/Onboarding7ClosureScreen';
import { CheckInScreen } from '../screens/CheckInScreen';
import { Onboarding3HabitsScreen } from '../screens/Onboarding3HabitsScreen';
import { Onboarding4AccountScreen } from '../screens/Onboarding4AccountScreen';
import { Onboarding5PersonalDataScreen } from '../screens/Onboarding5PersonalDataScreen';
import { Onboarding6WelcomeScreen } from '../screens/Onboarding6WelcomeScreen';
import { MainNavigator } from './MainNavigator';
import { CreateHabitScreen } from '../screens/CreateHabitScreen';
import { LogWorkoutScreen } from '../screens/LogWorkoutScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { SelectAvatarScreen } from '../screens/SelectAvatarScreen';
import { IdeasScreen } from '../screens/IdeasScreen';
import { SignalDetailScreen } from '../screens/SignalDetailScreen';
import { EditPlanScreen } from '../screens/EditPlanScreen';

export type RootStackParamList = {
    // Auth Flow v1
    Welcome: undefined;
    Register: undefined;
    EmailLogin: undefined;

    // Deprecated
    Login: undefined;

    // Onboarding (7 steps - new progress-based flow)
    Onboarding1Positioning: { resultIntent?: 'NEW_PLAN' };
    Onboarding2Identity: { resultIntent?: 'NEW_PLAN' };
    Onboarding3Expectations: { objective: string; resultIntent?: 'NEW_PLAN' };
    Onboarding4ProgressSignals: { objective: string; resultIntent?: 'NEW_PLAN' };
    Onboarding5Baseline: { objective: string; signals: any[]; resultIntent?: 'NEW_PLAN' };
    Onboarding6Actions: { objective: string; signals: any[]; baseline: any; resultIntent?: 'NEW_PLAN' };
    Onboarding7Closure: { objective: string; signals: any[]; baseline: any; actions: any[]; resultIntent?: 'NEW_PLAN' };
    SignalDetail: { signalData: any; period: number; objectiveId: string }; // using any strictly for quickly bypassing type import cycles, real app should allow types shared

    // Old onboarding (deprecated - keeping for migration)
    Onboarding1Message: undefined;
    Onboarding3Habits: { intent?: string };
    Onboarding4Account: { intent?: string; selectedHabits?: any[] };
    Onboarding5PersonalData: { intent?: string };
    Onboarding6Welcome: undefined;

    // Main
    Main: undefined;
    CheckIn: { objectiveId: string; objectiveType: string; signalId: string; question: string; date: string };
    CreateHabit: { habitId?: string; objectiveId?: string; objectiveType?: string };
    LogWorkout: { habitId: string };
    EditProfile: undefined;
    SelectAvatar: undefined;
    EditPlan: { planId: string; objectiveName: string };
    Ideas: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { useAuth } from '../store/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../design-system/tokens';

export const RootNavigator = () => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={user ? (userProfile?.onboardingCompleted ? 'Main' : 'Onboarding1Positioning') : 'Welcome'}
            >
                {user ? (
                    userProfile?.onboardingCompleted ? (
                        /* Main App */
                        <>
                            <Stack.Screen name="Main" component={MainNavigator} />
                            <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ presentation: 'modal' }} />
                            <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ presentation: 'modal' }} />
                            <Stack.Screen name="LogWorkout" component={LogWorkoutScreen} />
                            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                            <Stack.Screen name="SelectAvatar" component={SelectAvatarScreen} />
                            <Stack.Screen name="EditPlan" component={EditPlanScreen} />
                            <Stack.Screen name="Ideas" component={IdeasScreen} options={{ presentation: 'modal' }} />
                            <Stack.Screen name="SignalDetail" component={SignalDetailScreen} />

                            {/* Enable Onboarding screens for "New Plan" flow */}
                            <Stack.Screen name="Onboarding1Positioning" component={Onboarding1PositioningScreen} />
                            <Stack.Screen name="Onboarding2Identity" component={Onboarding2IdentityScreen} />
                            <Stack.Screen name="Onboarding3Expectations" component={Onboarding3ExpectationsScreen} />
                            <Stack.Screen name="Onboarding4ProgressSignals" component={Onboarding4ProgressSignalsScreen} />
                            <Stack.Screen name="Onboarding5Baseline" component={Onboarding5BaselineScreen} />
                            <Stack.Screen name="Onboarding6Actions" component={Onboarding6ActionsScreen} />
                            <Stack.Screen name="Onboarding7Closure" component={Onboarding7ClosureScreen} />
                            <Stack.Screen name="Onboarding3Habits" component={Onboarding3HabitsScreen} />
                            <Stack.Screen name="Onboarding4Account" component={Onboarding4AccountScreen} />
                            <Stack.Screen name="Onboarding5PersonalData" component={Onboarding5PersonalDataScreen} />
                            <Stack.Screen name="Onboarding6Welcome" component={Onboarding6WelcomeScreen} />
                        </>
                    ) : (
                        /* Onboarding Flow (7 steps) */
                        <>
                            <Stack.Screen name="Onboarding1Positioning" component={Onboarding1PositioningScreen} />
                            <Stack.Screen name="Onboarding2Identity" component={Onboarding2IdentityScreen} />
                            <Stack.Screen name="Onboarding3Expectations" component={Onboarding3ExpectationsScreen} />
                            <Stack.Screen name="Onboarding4ProgressSignals" component={Onboarding4ProgressSignalsScreen} />
                            <Stack.Screen name="Onboarding5Baseline" component={Onboarding5BaselineScreen} />
                            <Stack.Screen name="Onboarding6Actions" component={Onboarding6ActionsScreen} />
                            <Stack.Screen name="Onboarding7Closure" component={Onboarding7ClosureScreen} />
                            <Stack.Screen name="Onboarding3Habits" component={Onboarding3HabitsScreen} />
                            <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ presentation: 'modal' }} />
                            <Stack.Screen name="Onboarding4Account" component={Onboarding4AccountScreen} />
                            <Stack.Screen name="Onboarding5PersonalData" component={Onboarding5PersonalDataScreen} />
                            <Stack.Screen name="Onboarding6Welcome" component={Onboarding6WelcomeScreen} />
                        </>
                    )
                ) : (
                    /* Auth Flow + Onboarding */
                    <>
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />

                        {/* Onboarding screens available before auth */}
                        <Stack.Screen name="Onboarding1Positioning" component={Onboarding1PositioningScreen} />
                        <Stack.Screen name="Onboarding2Identity" component={Onboarding2IdentityScreen} />
                        <Stack.Screen name="Onboarding3Expectations" component={Onboarding3ExpectationsScreen} />
                        <Stack.Screen name="Onboarding4ProgressSignals" component={Onboarding4ProgressSignalsScreen} />
                        <Stack.Screen name="Onboarding5Baseline" component={Onboarding5BaselineScreen} />
                        <Stack.Screen name="Onboarding6Actions" component={Onboarding6ActionsScreen} />
                        <Stack.Screen name="Onboarding7Closure" component={Onboarding7ClosureScreen} />
                        <Stack.Screen name="Onboarding3Habits" component={Onboarding3HabitsScreen} />
                        <Stack.Screen name="CreateHabit" component={CreateHabitScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="Onboarding4Account" component={Onboarding4AccountScreen} />
                        <Stack.Screen name="Onboarding5PersonalData" component={Onboarding5PersonalDataScreen} />
                        <Stack.Screen name="Onboarding6Welcome" component={Onboarding6WelcomeScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
