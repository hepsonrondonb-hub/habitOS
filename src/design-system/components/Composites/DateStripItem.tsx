import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../tokens';
import { AppText } from '../AppText';

interface DateStripItemProps {
    dayName: string; // "L", "M"
    dayNumber: number; // 12, 13
    isActive?: boolean;
    onPress?: () => void;
}

export const DateStripItem: React.FC<DateStripItemProps> = ({
    dayName,
    dayNumber,
    isActive = false,
    onPress
}) => {
    return (
        <View style={styles.wrapper}>
            <AppText
                variant="caption"
                style={styles.dayName}
                color={colors.textSecondary}
            >
                {dayName}
            </AppText>
            <TouchableOpacity
                style={[
                    styles.container,
                    isActive && styles.activeContainer
                ]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <AppText
                    variant="subheading"
                    style={[styles.dayNumber, isActive && styles.activeText]}
                >
                    {dayNumber}
                </AppText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        width: 40,
    },
    container: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xs,
        backgroundColor: 'transparent',
    },
    activeContainer: {
        backgroundColor: colors.primary, // Brand color (Sage/Green)
    },
    dayName: {
        fontSize: 12,
        fontWeight: '500',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    activeText: {
        color: colors.surface,
    },
});
