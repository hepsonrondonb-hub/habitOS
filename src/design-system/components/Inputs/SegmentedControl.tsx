import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, shadows } from '../../tokens';
import { AppText } from '../AppText';

interface SegmentedControlProps {
    options: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
    options,
    selectedIndex,
    onChange,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            {options.map((option, index) => {
                const isSelected = index === selectedIndex;
                return (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.segment,
                            isSelected && styles.selectedSegment
                        ]}
                        onPress={() => onChange(index)}
                        activeOpacity={0.8}
                    >
                        <AppText
                            variant="body"
                            style={[
                                styles.text,
                                isSelected && styles.selectedText
                            ]}
                        >
                            {option}
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
        backgroundColor: colors.divider, // Using divider as a light gray background for the track
        borderRadius: 12,
        padding: 2,
    },
    segment: {
        flex: 1,
        paddingVertical: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8, // Slightly smaller than container
    },
    selectedSegment: {
        backgroundColor: colors.surface,
        ...shadows.sm,
    },
    text: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    selectedText: {
        color: colors.primary,
        fontWeight: '600',
    }
});
