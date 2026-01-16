import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppScreen, AppText, PrimaryButton, SecondaryButton } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { AiService } from '../services/AiService';

export const OnboardingCustomCreateScreen = () => {
    const navigation = useNavigation<any>();
    const [goal, setGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleContinue = () => {
        if (!goal.trim()) return;

        // Pass goal to Period screen to handle context-aware generation there
        // casting to any because of complex route params
        navigation.navigate('Onboarding2Period', { customGoal: goal, resultIntent: 'NEW_PLAN' } as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <SecondaryButton label="Atrás" onPress={handleBack} style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }} />
                    </View>

                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="auto-awesome" size={32} color={colors.primary} />
                        </View>

                        <AppText variant="heading" style={styles.title}>
                            ¿Qué quieres lograr?
                        </AppText>
                        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Escribe tu objetivo y diseñaremos un plan medible para ti.
                        </AppText>

                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Quiero viajar a Europa el próximo año..."
                            placeholderTextColor={colors.textSecondary + '80'} // transparent
                            multiline
                            textAlignVertical="top"
                            value={goal}
                            onChangeText={setGoal}
                            autoFocus
                        />

                        {/* Tips */}
                        <View style={styles.tipContainer}>
                            <MaterialIcons name="lightbulb" size={16} color={colors.primary} style={{ marginTop: 2 }} />
                            <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
                                Sé específico. En lugar de "ahorrar", prueba "ahorrar $1000 para emergencias".
                            </AppText>
                        </View>
                    </View>

                    {/* Footer / Loading State */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.footer}
                        keyboardVerticalOffset={20}
                    >
                        {isGenerating ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <AppText variant="body" style={{ marginTop: spacing.sm, fontWeight: '600' }}>
                                    Diseñando tu plan...
                                </AppText>
                                <AppText variant="caption" color={colors.textSecondary}>
                                    Definiendo criterios y acciones clave
                                </AppText>
                            </View>
                        ) : (
                            <PrimaryButton
                                label="Continuar"
                                onPress={handleContinue}
                                disabled={!goal.trim() || goal.length < 5}
                            />
                        )}
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 28,
        marginBottom: spacing.sm,
    },
    subtitle: {
        marginBottom: spacing.xl,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 18,
        color: colors.textPrimary,
        minHeight: 120,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    tipContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.lg,
        backgroundColor: colors.primarySoft,
        padding: spacing.md,
        borderRadius: radius.md,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
    }
});
