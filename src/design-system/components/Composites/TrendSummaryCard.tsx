import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { colors, spacing, radius, shadows } from '../../tokens';
import { CircularProgress } from '../Charts/CircularProgress';

interface TrendSummaryCardProps {
    title: string;
    description: string;
    icon?: string;
    progress?: number;
}

export const TrendSummaryCard: React.FC<TrendSummaryCardProps> = ({
    title,
    description,
    progress = 0
}) => {
    return (
        <Card style={styles.card} noPadding>
            <View style={styles.container}>
                <View style={styles.textColumn}>
                    <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
                        NIVEL DE ESTADO
                    </AppText>
                    <AppText variant="heading" style={styles.title}>
                        {title}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary} style={styles.description}>
                        {description}
                    </AppText>
                </View>

                <View style={styles.chartColumn}>
                    <CircularProgress
                        size={80}
                        progress={progress}
                        strokeWidth={8}
                        color={colors.primary}
                    />
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.lg,
        ...shadows.md, // Pop slightly more
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    textColumn: {
        flex: 1,
    },
    chartColumn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        letterSpacing: 1,
        marginBottom: spacing.xs,
        fontSize: 10,
        fontWeight: '700',
    },
    title: {
        fontSize: 18, // Slightly smaller than 20 for balance
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    description: {
        lineHeight: 20,
        fontSize: 13,
    }
});
