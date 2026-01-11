import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, AppTextInput } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding5PersonalData'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding5PersonalData'>;

type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export const Onboarding5PersonalDataScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState<Gender | null>(null);
    const [loading, setLoading] = useState(false);

    const genderOptions = [
        { id: 'male' as Gender, label: 'Hombre', icon: 'male' },
        { id: 'female' as Gender, label: 'Mujer', icon: 'female' },
        { id: 'other' as Gender, label: 'Otro', icon: 'transgender' },
        { id: 'prefer-not-to-say' as Gender, label: 'Prefiero no decir', icon: 'remove' }
    ];

    const handleContinue = async () => {
        const user = auth.currentUser;
        if (!user) {
            navigation.navigate('Onboarding6Welcome');
            return;
        }

        setLoading(true);

        try {
            // Only save if user provided any data
            if (firstName || lastName || birthDate || gender) {
                const userRef = doc(db, 'users', user.uid);
                const updateData: any = {};

                if (firstName) updateData.firstName = firstName;
                if (lastName) updateData.lastName = lastName;
                if (firstName || lastName) {
                    updateData.name = `${firstName} ${lastName}`.trim();
                }
                if (birthDate) {
                    updateData.birthDate = birthDate.toISOString().split('T')[0];
                }
                if (gender) updateData.gender = gender;

                await updateDoc(userRef, updateData);
            }

            navigation.navigate('Onboarding6Welcome');
        } catch (error) {
            console.error('Error saving personal data:', error);
            // Continue anyway, data is optional
            navigation.navigate('Onboarding6Welcome');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSkip = () => {
        navigation.navigate('Onboarding6Welcome');
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <AppText variant="caption" color={colors.textSecondary}>Paso 5 de 6</AppText>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText variant="heading" centered style={styles.title}>
                            Unos datos básicos para tu progreso
                        </AppText>
                        <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                            Esto nos ayuda a personalizar tus estadísticas y metas diarias.
                        </AppText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <AppTextInput
                            label="Nombre (opcional)"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Tu nombre"
                            autoCapitalize="words"
                        />

                        <AppTextInput
                            label="Apellido (opcional)"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Tu apellido"
                            autoCapitalize="words"
                        />

                        {/* Birth Date Picker */}
                        <View>
                            <AppText variant="body" style={styles.label}>
                                Fecha de nacimiento (opcional)
                            </AppText>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
                                <AppText
                                    variant="body"
                                    style={[
                                        styles.datePickerText,
                                        !birthDate && styles.datePickerPlaceholder
                                    ]}
                                >
                                    {birthDate ? formatDate(birthDate) : 'Selecciona tu fecha de nacimiento'}
                                </AppText>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={birthDate || new Date(2000, 0, 1)}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    minimumDate={new Date(1900, 0, 1)}
                                />
                            )}
                        </View>

                        {/* Gender Selection */}
                        <View>
                            <AppText variant="body" style={styles.label}>
                                Género (opcional)
                            </AppText>
                            <View style={styles.genderContainer}>
                                {genderOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.genderOption,
                                            gender === option.id && styles.genderOptionSelected
                                        ]}
                                        onPress={() => setGender(option.id)}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialIcons
                                            name={option.icon as any}
                                            size={20}
                                            color={gender === option.id ? colors.primary : colors.textSecondary}
                                        />
                                        <AppText
                                            variant="caption"
                                            style={[
                                                styles.genderLabel,
                                                gender === option.id && styles.genderLabelSelected
                                            ]}
                                        >
                                            {option.label}
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 200 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <AppText variant="body" color={colors.textSecondary}>
                            Omitir
                        </AppText>
                    </TouchableOpacity>
                    <PrimaryButton
                        label={loading ? "Guardando..." : "Continuar"}
                        onPress={handleContinue}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: 24,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    form: {
        gap: spacing.lg,
    },
    label: {
        marginBottom: spacing.sm,
        fontWeight: '600',
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 9999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    genderOptionSelected: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    genderLabel: {
        fontSize: 13,
    },
    genderLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
        gap: spacing.md,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    }
});
