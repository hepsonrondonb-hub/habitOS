import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { colors, spacing, radius } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface TrendSummaryCardProps {
    title: string;
    description: string;
    icon?: string;
}

export const TrendSummaryCard: React.FC<TrendSummaryCardProps> = ({
    title,
    description,
    icon = "auto-awesome"
}) => {
    return (
        <Card style={styles.card} noPadding>
            <View style={styles.banner}>
                <MaterialIcons name={icon as any} size={32} color={colors.primary} style={{ opacity: 0.6 }} />
            </View>
            <View style={styles.content}>
                <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
                    RESUMEN DE TENDENCIA
                </AppText>
                <AppText variant="heading" style={styles.title}>
                    {title}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.description}>
                    {description}
                </AppText>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        borderWidth: 0,
        backgroundColor: colors.surface, // Or maybe white with shadow
        marginBottom: spacing.lg,
    },
    banner: {
        height: 80,
        backgroundColor: '#E0E7FF', // Light blue/indigo
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: spacing.lg,
    },
    label: {
        letterSpacing: 1,
        marginBottom: spacing.xs,
        fontSize: 10,
        fontWeight: '700',
    },
    title: {
        fontSize: 20,
        marginBottom: spacing.sm,
    },
    description: {
        lineHeight: 24,
    }
});
