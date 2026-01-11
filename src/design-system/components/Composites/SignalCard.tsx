import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { Sparkline } from '../Charts/Sparkline';
import { colors, spacing } from '../../tokens';

interface SignalCardProps {
    name: string;
    outcome: string;
    context: string;
    data: number[];
    onPress: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({
    name,
    outcome,
    context,
    data,
    onPress
}) => {
    return (
        <Card style={styles.card} noPadding>
            <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
                <View style={styles.mainRow}>
                    <View style={styles.textContainer}>
                        <AppText variant="subheading" style={styles.name}>
                            {name}
                        </AppText>
                        <AppText variant="body" style={styles.outcome}>
                            {outcome}
                        </AppText>
                    </View>
                    <View style={styles.chartContainer}>
                        <Sparkline
                            data={data}
                            width={100}
                            height={40}
                            color={colors.primary}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <AppText variant="caption" color={colors.textSecondary}>
                        {context}
                    </AppText>
                </View>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
    },
    content: {
        padding: spacing.lg,
    },
    mainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Align top or center? Sparkline is usually center aligned with text block
        marginBottom: spacing.md,
    },
    textContainer: {
        flex: 1,
        paddingRight: spacing.md,
    },
    chartContainer: {
        width: 100,
        height: 40,
        justifyContent: 'center',
    },
    name: {
        fontWeight: '700',
        marginBottom: 4,
    },
    outcome: {
        color: colors.primary,
        fontSize: 14,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: colors.divider, // Optional, looks clean without too
        paddingTop: spacing.sm,
        // Image doesn't show border, just separate text.
    },
});
