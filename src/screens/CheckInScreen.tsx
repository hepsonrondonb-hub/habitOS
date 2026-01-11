import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../store/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;
type RoutePropType = RouteProp<RootStackParamList, 'CheckIn'>;

const SCALE_OPTIONS = [
    { value: 1, label: '1. Muy difícil' },
    { value: 2, label: '2. Difícil' },
    { value: 3, label: '3. Normal' },
    { value: 4, label: '4. Fácil' },
    { value: 5, label: '5. Muy fácil' }
];

export const CheckInScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const { user } = useAuth();

    const { objectiveId, objectiveType, signalId, question, date } = route.params;

    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!selectedValue || !user) return;

        setSaving(true);
        try {
            const checkInsRef = collection(db, 'check_ins');
            await addDoc(checkInsRef, {
                userId: user.uid,
                objectiveId: objectiveId,
                signalId: signalId,
                value: selectedValue,
                date: date,
                createdAt: serverTimestamp()
            });

            // Navigate back to home
            navigation.goBack();
        } catch (error) {
            console.error('Error saving check-in:', error);
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title */}
                <AppText variant="heading" style={styles.title}>
                    Check-in rápido
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                    Esto nos ayuda a entender tu progreso.
                </AppText>

                {/* Objective and Date */}
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <AppText variant="caption" color={colors.textSecondary} style={styles.metaLabel}>
                            OBJETIVO
                        </AppText>
                        <View style={styles.objectiveRow}>
                            <View style={styles.objectiveDot} />
                            <AppText variant="body" style={styles.metaValue}>
                                {objectiveType.charAt(0).toUpperCase() + objectiveType.slice(1)}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.metaItem}>
                        <AppText variant="caption" color={colors.textSecondary} style={styles.metaLabel}>
                            FECHA
                        </AppText>
                        <AppText variant="body" style={styles.metaValue}>
                            Hoy
                        </AppText>
                    </View>
                </View>

                {/* Question */}
                <AppText variant="subheading" style={styles.question}>
                    {question}
                </AppText>

                {/* Scale Options */}
                <View style={styles.optionsContainer}>
                    {SCALE_OPTIONS.map((option) => {
                        const isSelected = selectedValue === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected
                                ]}
                                onPress={() => setSelectedValue(option.value)}
                                activeOpacity={0.7}
                            >
                                <AppText
                                    variant="body"
                                    style={[
                                        styles.optionLabel,
                                        isSelected && styles.optionLabelSelected
                                    ]}
                                >
                                    {option.label}
                                </AppText>
                                <View style={[
                                    styles.radio,
                                    isSelected && styles.radioSelected
                                ]}>
                                    {isSelected && <View style={styles.radioDot} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Disclaimer */}
                <AppText variant="caption" centered color={colors.textSecondary} style={styles.disclaimer}>
                    No hay respuestas correctas. Es solo una foto del momento.
                </AppText>
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Guardar respuesta"
                    onPress={handleSave}
                    disabled={selectedValue === null || saving}
                    loading={saving}
                />
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
        marginLeft: -spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    title: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        marginBottom: spacing.xl,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.xxl,
    },
    metaItem: {
        gap: spacing.xs,
    },
    metaLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    objectiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    objectiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    question: {
        fontSize: 18,
        lineHeight: 26,
        marginBottom: spacing.xxl,
        color: colors.textPrimary,
    },
    optionsContainer: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    optionLabel: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    optionLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    disclaimer: {
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    }
});
