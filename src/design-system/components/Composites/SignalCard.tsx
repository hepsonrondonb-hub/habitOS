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
            <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
                {/* Left: Text Info */}
                <View style={styles.infoColumn}>
                    <AppText variant="subheading" style={styles.name} numberOfLines={1}>
                        {name}
                    </AppText>
                    <AppText variant="caption" color={colors.primary} style={styles.outcome}>
                        {outcome}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={styles.context}>
                        {context}
                    </AppText>
                </View>

                {/* Right: Chart */}
                <View style={styles.chartColumn}>
                    <Sparkline
                        data={data}
                        width={90}
                        height={40}
                        color={colors.primary}
                    />
                </View>
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingVertical: spacing.md,
    },
    infoColumn: {
        flex: 1,
        paddingRight: spacing.md,
    },
    chartColumn: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    name: {
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 2,
    },
    outcome: {
        fontWeight: '600',
        marginBottom: 4,
        fontSize: 12,
    },
    context: {
        fontSize: 11,
        opacity: 0.8,
    },
});
