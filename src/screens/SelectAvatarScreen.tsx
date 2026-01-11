import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getAvatarList, AvatarId } from '../utils/avatars';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectAvatar'>;

export const SelectAvatarScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user, userProfile, refreshProfile } = useAuth();

    const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(
        (userProfile?.avatarId as AvatarId) || 'focus'
    );
    const [saving, setSaving] = useState(false);

    const avatars = getAvatarList();

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                avatarId: selectedAvatar
            });

            // Refresh profile in AuthContext
            await refreshProfile();

            navigation.goBack();
        } catch (error) {
            console.error('Error saving avatar:', error);
            Alert.alert('Error', 'No se pudo guardar el avatar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="heading" style={styles.headerTitle}>Seleccionar Avatar</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <AppText variant="body" color={colors.textSecondary} centered style={styles.subtitle}>
                    Elige una representación visual para tu perfil en HabitOS.
                </AppText>

                {/* Avatar Grid */}
                <View style={styles.grid}>
                    {avatars.map((avatar) => (
                        <TouchableOpacity
                            key={avatar.id}
                            style={styles.avatarContainer}
                            onPress={() => setSelectedAvatar(avatar.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.avatarWrapper,
                                selectedAvatar === avatar.id && styles.avatarWrapperSelected
                            ]}>
                                <Image
                                    source={avatar.image}
                                    style={styles.avatar}
                                />
                                {selectedAvatar === avatar.id && (
                                    <View style={styles.checkBadge}>
                                        <MaterialIcons name="check" size={16} color={colors.surface} />
                                    </View>
                                )}
                            </View>
                            <AppText
                                variant="body"
                                centered
                                style={[
                                    styles.avatarName,
                                    selectedAvatar === avatar.id && { color: colors.primary }
                                ]}
                            >
                                {avatar.name}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Guardar"
                    onPress={handleSave}
                    loading={saving}
                />
            </View>
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
    subtitle: {
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.lg,
    },
    avatarContainer: {
        width: '45%',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: spacing.sm,
        borderWidth: 3,
        borderColor: 'transparent',
        borderRadius: 75,
        padding: 3,
    },
    avatarWrapperSelected: {
        borderColor: colors.primary,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    checkBadge: {
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
    avatarName: {
        fontWeight: '600',
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
