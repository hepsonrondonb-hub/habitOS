import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../tokens';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    track: {
        height: 4,
        backgroundColor: colors.divider,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    }
});
