import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ideas'>;

interface Principle {
    id: number;
    title: string;
    content: string;
}

const principles: Principle[] = [
    {
        id: 1,
        title: 'Hazlo obvio',
        content: 'Si no lo ves, no lo harás.\nDiseñar hábitos no es cuestión de fuerza de voluntad,\nsino de recordatorios visibles.\n\nDeja señales claras en tu día.\nLo que está a la vista, tiene más posibilidades de pasar.'
    },
    {
        id: 2,
        title: 'Hazlo atractivo',
        content: 'No repetimos lo que es perfecto.\nRepetimos lo que se siente bien.\n\nUn hábito no tiene que encantarte,\nsolo no debería sentirse como un castigo.'
    },
    {
        id: 3,
        title: 'Hazlo fácil',
        content: 'Empieza tan pequeño que no puedas fallar.\nCuando un hábito es fácil,\nno necesita motivación.\n\nSi hoy parece difícil,\nprobablemente es demasiado grande.'
    },
    {
        id: 4,
        title: 'Hazlo satisfactorio',
        content: 'El cerebro aprende con cierres, no con promesas.\nCada vez que marcas un hábito,\nrefuerzas la identidad que estás construyendo.\n\nLo que se reconoce, se repite.'
    }
];

export const IdeasScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [expandedId, setExpandedId] = useState<number | null>(1);

    const toggleCard = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <AppText variant="heading" style={styles.title}>
                        Ideas para{'\n'}hacerlo fácil
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        Principios simples para sostener hábitos en la vida real.
                    </AppText>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                >
                    <AppText variant="body" style={styles.closeText}>Cerrar</AppText>
                </TouchableOpacity>
            </View>

            {/* Accordion Cards */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {principles.map((principle) => (
                    <TouchableOpacity
                        key={principle.id}
                        style={[
                            styles.card,
                            expandedId === principle.id && styles.cardExpanded
                        ]}
                        onPress={() => toggleCard(principle.id)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={styles.numberBadge}>
                                    <AppText variant="caption" style={styles.numberText}>
                                        {principle.id}
                                    </AppText>
                                </View>
                                <AppText variant="subheading" style={styles.cardTitle}>
                                    {principle.title}
                                </AppText>
                            </View>
                            <MaterialIcons
                                name={expandedId === principle.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                size={24}
                                color={colors.textSecondary}
                            />
                        </View>

                        {expandedId === principle.id && (
                            <View style={styles.cardContent}>
                                <AppText variant="body" color={colors.textSecondary} style={styles.contentText}>
                                    {principle.content}
                                </AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Bottom Icon */}
                <View style={styles.bottomIcon}>
                    <MaterialIcons name="eco" size={32} color={colors.primary} style={{ opacity: 0.3 }} />
                </View>
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    headerContent: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: spacing.sm,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    closeButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        top: spacing.md,
        right: spacing.lg,
    },
    closeText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardExpanded: {
        borderColor: colors.primary,
        backgroundColor: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.sm,
    },
    numberBadge: {
        width: 28,
        height: 28,
        borderRadius: 9999,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
    },
    cardContent: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    contentText: {
        fontSize: 15,
        lineHeight: 24,
    },
    bottomIcon: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    }
});
