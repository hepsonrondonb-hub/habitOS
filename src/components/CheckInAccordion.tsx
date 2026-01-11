import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors, spacing } from '../design-system/tokens';
import { Card } from '../design-system/components/Card';
import { AppText } from '../design-system/components/AppText';
import { PrimaryButton } from '../design-system/components/Buttons/PrimaryButton';
import { MaterialIcons } from '@expo/vector-icons';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CheckInAccordionProps {
    question: string;
    onSave: (value: number) => void;
    minLabel?: string;
    maxLabel?: string;
}

export const CheckInAccordion: React.FC<CheckInAccordionProps> = ({
    question,
    onSave,
    minLabel = "Bajo",
    maxLabel = "Alto"
}) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedValue, setSelectedValue] = useState<number | null>(null);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleSave = () => {
        if (selectedValue !== null) {
            onSave(selectedValue);
        }
    };

    return (
        <Card style={styles.container} onPress={!expanded ? toggleExpand : undefined}>
            {/* Header */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpand}
                style={styles.header}
            >
                <View style={styles.headerText}>
                    <AppText variant="subheading" style={styles.title}>
                        Registrar cómo te sentiste hoy
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                        Solo toma 10 segundos
                    </AppText>
                </View>
                <MaterialIcons
                    name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            {/* Expanded Content */}
            {expanded && (
                <View style={styles.content}>
                    <View style={styles.divider} />

                    <AppText variant="body" style={styles.question}>
                        {question}
                    </AppText>

                    {/* Scale 1-5 */}
                    <View style={styles.scaleContainer}>
                        {[1, 2, 3, 4, 5].map((val) => (
                            <TouchableOpacity
                                key={val}
                                style={[
                                    styles.scaleItem,
                                    selectedValue === val && styles.scaleItemActive
                                ]}
                                onPress={() => setSelectedValue(val)}
                            >
                                <AppText
                                    style={[
                                        styles.scaleText,
                                        selectedValue === val && styles.scaleTextActive
                                    ]}
                                >
                                    {val.toString()}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.labels}>
                        <AppText variant="caption" color={colors.textSecondary}>{minLabel}</AppText>
                        <AppText variant="caption" color={colors.textSecondary}>{maxLabel}</AppText>
                    </View>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            title="Guardar"
                            onPress={handleSave}
                            disabled={selectedValue === null}
                            fullWidth
                        />
                    </View>
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 0, // Override card padding to handle dividers
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        marginBottom: 2,
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: spacing.md,
    },
    question: {
        marginBottom: spacing.lg,
        fontWeight: '500',
    },
    scaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    scaleItem: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scaleItemActive: {
        backgroundColor: colors.primary,
    },
    scaleText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    scaleTextActive: {
        color: colors.surface,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingHorizontal: 4,
    },
    buttonContainer: {
        marginTop: spacing.xs,
    }
});
