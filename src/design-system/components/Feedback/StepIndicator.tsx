import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../tokens';

interface StepIndicatorProps {
    totalSteps: number;
    currentStep: number; // 0-indexed
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    totalSteps,
    currentStep
}) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const isActive = index === currentStep;
                return (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            isActive ? styles.activeDot : styles.inactiveDot
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: colors.primary,
        width: 24, // Elongated pill for active step (see screenshot top bar?)
        // Actually screenshot shows 3 lines? "___  _  _" 
        // Wait, screenshot uploaded_image_1766883631520.png shows "___ _ _" at top.
        // It looks like Bars, not Dots.
        // Let's make them Bars.
    },
    inactiveDot: {
        backgroundColor: colors.disabled,
    }
});
