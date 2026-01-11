import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SuccessModal } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAvatarSource } from '../utils/avatars';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

const GENDER_OPTIONS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
const LANGUAGE_OPTIONS = ['Español', 'English'];

export const EditProfileScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, userProfile, refreshProfile } = useAuth();

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [gender, setGender] = useState('Prefiero no decir');
    const [language, setLanguage] = useState('Español');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Load user data on mount
    useEffect(() => {
        if (!user) return;

        const loadUserData = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setGender(data.gender || 'Prefiero no decir');
                    setLanguage(data.language || 'Español');

                    if (data.birthDate) {
                        setBirthDate(new Date(data.birthDate));
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user]);

    const handleSave = async () => {
        // Validation
        if (!firstName.trim()) {
            Alert.alert('Campo requerido', 'Por favor ingresa tu nombre');
            return;
        }

        if (!lastName.trim()) {
            Alert.alert('Campo requerido', 'Por favor ingresa tu apellido');
            return;
        }

        if (!user) return;

        setSaving(true);

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                birthDate: birthDate ? birthDate.toISOString() : null,
                gender,
                language
            });

            // Refresh profile in AuthContext
            await refreshProfile();

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'No se pudieron guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        // On Android, close picker immediately
        // On iOS, keep it open (modal style)
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    if (loading) {
        return (
            <AppScreen backgroundColor={colors.background} safeArea>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText variant="body" color={colors.textSecondary}>Cargando...</AppText>
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="heading" style={styles.headerTitle}>Editar Perfil</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={getAvatarSource(userProfile?.avatarId as any)}
                            style={styles.avatar}
                        />
                        <View style={styles.cameraButton}>
                            <MaterialIcons name="photo-camera" size={16} color={colors.surface} />
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('SelectAvatar')}>
                        <AppText variant="body" color={colors.primary} style={{ fontWeight: '600', marginTop: spacing.sm }}>
                            Cambiar avatar
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>Nombre</AppText>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Sofía"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>Apellido</AppText>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Martínez"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>Fecha de nacimiento</AppText>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <AppText variant="body" color={birthDate ? colors.textPrimary : colors.textSecondary}>
                            {birthDate ? birthDate.toLocaleDateString('es-ES') : '15/04/1995'}
                        </AppText>
                        <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>Género</AppText>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowGenderPicker(!showGenderPicker)}
                    >
                        <AppText variant="body">{gender}</AppText>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showGenderPicker && (
                        <View style={styles.picker}>
                            {GENDER_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setGender(option);
                                        setShowGenderPicker(false);
                                    }}
                                >
                                    <AppText variant="body" color={gender === option ? colors.primary : colors.textPrimary}>
                                        {option}
                                    </AppText>
                                    {gender === option && (
                                        <MaterialIcons name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>
                        Correo electrónico <MaterialIcons name="lock" size={14} color={colors.textSecondary} />
                    </AppText>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={user?.email || ''}
                        editable={false}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="body" style={styles.label}>Idioma de la app</AppText>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowLanguagePicker(!showLanguagePicker)}
                    >
                        <AppText variant="body">{language}</AppText>
                        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showLanguagePicker && (
                        <View style={styles.picker}>
                            {LANGUAGE_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setLanguage(option);
                                        setShowLanguagePicker(false);
                                    }}
                                >
                                    <AppText variant="body" color={language === option ? colors.primary : colors.textPrimary}>
                                        {option}
                                    </AppText>
                                    {language === option && (
                                        <MaterialIcons name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Guardar cambios"
                    onPress={handleSave}
                    loading={saving}
                />
            </View>

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                title="¡Guardado con éxito!"
                message="Tus cambios se han actualizado correctamente en tu perfil."
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }}
            />
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3E8D2',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    section: {
        marginBottom: spacing.lg,
    },
    label: {
        fontWeight: '600',
        marginBottom: spacing.xs,
        color: colors.textPrimary,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        color: colors.textPrimary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputDisabled: {
        backgroundColor: '#F9FAFB',
        color: colors.textSecondary,
    },
    picker: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginTop: spacing.xs,
        borderWidth: 1,
        borderColor: colors.divider,
        overflow: 'hidden',
    },
    pickerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    }
});
