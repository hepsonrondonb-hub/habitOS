import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { colors, spacing, radius } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface InsightCardProps {
    title: string;
    subtitle: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, subtitle }) => {
    return (
        <Card style={styles.card}>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <MaterialIcons name="lightbulb" size={16} color={colors.primary} />
                    <AppText variant="caption" color={colors.primary} style={styles.label}>INSIGHT DEL DÍA</AppText>
                </View>

                <AppText variant="subheading" style={styles.title}>{title}</AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>{subtitle}</AppText>
            </View>

            {/* Decorative Gradient Ball as seen in screenshot */}
            <View style={styles.decoration}>
                <LinearGradient
                    colors={[colors.primary, '#93C5FD']} // Blue to Light Blue
                    style={styles.gradient}
                />
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        overflow: 'hidden', // Clip the decoration
        minHeight: 140,
    },
    content: {
        flex: 1,
        paddingRight: spacing.lg,
        zIndex: 1, // Above decoration
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: 4,
    },
    label: {
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: {
        marginBottom: spacing.xs,
        fontSize: 18,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
    },
    decoration: {
        position: 'absolute',
        right: -20,
        top: 20,
        width: 80,
        height: 80,
        borderRadius: 40,
        // Using a simpler view if gradient fails, but attempting LinearGradient
    },
    gradient: {
        flex: 1,
        borderRadius: 40,
        opacity: 0.8,
    }
});
