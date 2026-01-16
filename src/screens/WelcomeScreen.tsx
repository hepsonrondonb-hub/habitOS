import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SecondaryButton, TrendSummaryCard } from '../design-system/components';
import { colors, spacing, shadows, radius } from '../design-system/tokens';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export const WelcomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const heroSlideAnim = useRef(new Animated.Value(40)).current;
    const bottomSlideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(heroSlideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(bottomSlideAnim, {
                toValue: 0,
                duration: 800,
                // tension: 50,
                // friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>

                {/* 1. HEADER: Subtle Branding */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <Image
                        source={require('../../assets/avitio-logo-new.png')}
                        style={{ width: 40, height: 40, marginRight: 8 }}
                        resizeMode="contain"
                    />
                    <AppText variant="heading" style={{ fontSize: 20 }}>Avitio</AppText>
                </Animated.View>

                {/* 2. CENTER: Hero Dashboard Mockup */}
                <Animated.View
                    style={[
                        styles.heroContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: heroSlideAnim }]
                        }
                    ]}
                >
                    <View style={styles.phoneFrame}>
                        {/* Status Bar Decor */}
                        <View style={styles.notch} />

                        {/* Fake Dashboard Content */}
                        <View style={styles.mockupContent}>
                            <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: 16 }}>
                                MI PROGRESO HOY
                            </AppText>

                            <TrendSummaryCard
                                title="Productividad"
                                description="Estás en racha. +12% vs semana pasada."
                                progress={78}
                            />

                            <TrendSummaryCard
                                title="Enfoque Mental"
                                description="2 sesiones profundas completadas."
                                progress={100}
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* 3. BOTTOM: Value Prop & Actions */}
                <Animated.View
                    style={[
                        styles.bottomSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: bottomSlideAnim }]
                        }
                    ]}
                >
                    <AppText variant="heading" style={styles.tagline}>
                        Construye la vida que deseas.
                    </AppText>

                    <AppText
                        variant="body"
                        color={colors.textSecondary}
                        style={styles.subTagline}
                    >
                        Tus hábitos, objetivos y evolución en un solo lugar.
                    </AppText>

                    <View style={styles.actionsContainer}>
                        <PrimaryButton
                            label="Empezar ahora"
                            onPress={() => navigation.navigate('Onboarding1Positioning')}
                            style={styles.button}
                        />

                        <View style={{ height: 12 }} />

                        <PrimaryButton
                            label="Ya tengo una cuenta"
                            variant="text"
                            onPress={() => navigation.navigate('EmailLogin')}
                            style={styles.button}
                        />
                    </View>

                    {/* Footer */}
                    <AppText variant="caption" color={colors.textSecondary} centered style={{ opacity: 0.6 }}>
                        Al continuar, aceptas nuestros Términos.
                    </AppText>
                </Animated.View>

            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
    },
    heroContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    phoneFrame: {
        width: width * 0.75,
        height: 380, // Fixed height for proportionality
        backgroundColor: colors.background, // Or surface
        borderRadius: 32,
        borderWidth: 6,
        borderColor: colors.surface, // Frame color
        ...shadows.lg, // Deep shadow for "floating" effect
        overflow: 'hidden',
        position: 'relative',
    },
    notch: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: '40%',
        height: 24,
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        zIndex: 10,
    },
    mockupContent: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Slightly different bg inside phone
        padding: spacing.md,
        paddingTop: 40, // Space for notch
    },
    bottomSection: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },
    tagline: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.xs,
        lineHeight: 34,
        color: colors.textPrimary,
    },
    subTagline: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.xl,
        maxWidth: 300,
        lineHeight: 24,
    },
    actionsContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    button: {
        width: '100%',
        height: 54,
    },
});
