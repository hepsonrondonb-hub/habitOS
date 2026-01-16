import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppScreen, AppText, PrimaryButton, Card } from '../design-system/components';
import { SuccessModal } from '../design-system/components/Modals/SuccessModal';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Constants from 'expo-constants';

export const FeedbackScreen = () => {
    const navigation = useNavigation();
    const { user, userProfile } = useAuth();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const userName = userProfile?.firstName || userProfile?.name || user?.displayName || 'Usuario';

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Campo vacío', 'Por favor cuéntanos qué piensas antes de enviar.');
            return;
        }

        try {
            setSubmitting(true);

            await addDoc(collection(db, 'user_feedback'), {
                userId: user?.uid,
                userEmail: user?.email,
                content: content.trim(),
                createdAt: serverTimestamp(),
                platform: Platform.OS,
                appVersion: Constants.expoConfig?.version || '1.0.0',
                status: 'new'
            });

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error sending feedback:', error);
            Alert.alert('Error', 'No pudimos enviar tu mensaje. Intenta nuevamente.');
            setSubmitting(false);
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <SuccessModal
                visible={showSuccessModal}
                title="¡Gracias!"
                message="Hemos recibido tu mensaje. Gracias por ayudarnos a mejorar Avitio."
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }}
                buttonLabel="Cerrar"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                                <View style={styles.closeButton}>
                                    <MaterialIcons name="close" size={24} color={colors.textPrimary} />
                                </View>
                            </TouchableWithoutFeedback>
                            <AppText variant="subheading" style={{ fontWeight: '700' }}>Feedback</AppText>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="chat-bubble-outline" size={32} color={colors.primary} />
                            </View>

                            <AppText variant="heading" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
                                ¡Hola, {userName}!
                            </AppText>
                            <AppText variant="body" color={colors.textSecondary} style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                                Tu opinión es vital para nosotros. ¿Qué te gustaría ver en la app? ¿Qué podemos mejorar?
                            </AppText>

                            <Card style={styles.inputCard}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Escribe tu idea aquí..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={6}
                                    value={content}
                                    onChangeText={setContent}
                                    maxLength={1000}
                                />
                                <AppText variant="caption" color={colors.textSecondary} style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}>
                                    {content.length}/1000
                                </AppText>
                            </Card>
                        </View>

                        <View style={styles.footer}>
                            <PrimaryButton
                                label="Enviar comentario"
                                onPress={handleSubmit}
                                loading={submitting}
                                disabled={submitting || !content.trim()}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...colors.shadows?.[1] // Assuming shadow tokens exist, or fallback
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3E8FF', // Light purple
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    inputCard: {
        width: '100%',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    input: {
        fontSize: 16,
        color: colors.textPrimary,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    footer: {
        marginTop: spacing.lg,
    }
});
