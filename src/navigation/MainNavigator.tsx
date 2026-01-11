import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../design-system/tokens';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { View } from 'react-native';
import { AppText } from '../design-system/components';

import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FocusScreen } from '../screens/FocusScreen';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    borderTopColor: colors.divider,
                    elevation: 0, // Android shadow
                    shadowOpacity: 0, // iOS shadow
                    height: 60,
                    paddingBottom: spacing.sm,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tab.Screen
                name="Inicio"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Progreso"
                component={ProgressScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="bar-chart" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Enfoque"
                component={FocusScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="menu-book" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Configuración"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="settings" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
};
