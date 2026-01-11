import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { colors, spacing, radius } from '../../tokens';

export type PeriodOption = 7 | 14 | 30;

interface PeriodSelectorProps {
    selectedPeriod: PeriodOption;
    onSelect: (period: PeriodOption) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onSelect }) => {
    const options: PeriodOption[] = [7, 14, 30];

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const isSelected = selectedPeriod === option;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.button, isSelected && styles.selectedButton]}
                        onPress={() => onSelect(option)}
                        activeOpacity={0.8}
                    >
                        <AppText
                            variant="body"
                            style={[
                                styles.text,
                                isSelected && styles.selectedText
                            ]}
                        >
                            {option} días
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface, // Or a slightly darker background if needed for contrast
        borderRadius: 20, // Full rounded pill
        padding: 4,
        alignSelf: 'center', // Center it if container allows
        width: '100%', // Or dynamic
    },
    button: {
        flex: 1,
        paddingVertical: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    selectedButton: {
        // Analyzing image: It looks like white background on grey container.
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,
        elevation: 2,
    },
    text: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    selectedText: {
        color: colors.textPrimary,
        fontWeight: '600',
    }
});
