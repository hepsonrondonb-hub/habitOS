import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../tokens';

interface DaySelectorProps {
    selectedDays: number[]; // 0-6 (Mon-Sun or Sun-Sat)
    onToggleDay: (dayIndex: number) => void;
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const DaySelector: React.FC<DaySelectorProps> = ({
    selectedDays,
    onToggleDay
}) => {
    return (
        <View style={styles.container}>
            {DAYS.map((day, index) => {
                const isSelected = selectedDays.includes(index);
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dayButton,
                            isSelected && styles.selectedDayButton
                        ]}
                        onPress={() => onToggleDay(index)}
                        activeOpacity={0.7}
                    >
                        <AppText
                            variant="caption"
                            style={[
                                styles.dayText,
                                isSelected && styles.selectedDayText
                            ]}
                        >
                            {day}
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
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: spacing.sm,
    },
    dayButton: {
        width: 32,
        height: 32,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    selectedDayButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dayText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    selectedDayText: {
        color: colors.surface,
        fontWeight: '700',
    }
});
