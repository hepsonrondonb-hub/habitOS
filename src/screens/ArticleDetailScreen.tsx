import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppScreen, AppText } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { FocusArticle } from '../data/focusArticles';

type ArticleDetailRouteProp = RouteProp<{ params: { article: FocusArticle } }, 'params'>;

export const ArticleDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<ArticleDetailRouteProp>();
    const { article } = route.params;

    return (
        <AppScreen backgroundColor="#F8FAFC" safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="subheading" style={styles.headerTitle}>ENFOQUE</AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentContainer}>
                    {/* Title Section */}
                    <AppText variant="heading" style={styles.title}>
                        {article.title}
                    </AppText>

                    <View style={styles.blueDivider} />

                    {/* Content Blocks */}
                    <View style={styles.blocksContainer}>
                        {article.content_blocks.map((block, index) => (
                            <AppText key={index} variant="body" style={styles.paragraph}>
                                {block}
                            </AppText>
                        ))}
                    </View>
                </View>

                {/* Editorial Footer (Fixed Style) */}
                <View style={styles.footerContainer}>
                    <View style={styles.quoteBox}>
                        <AppText variant="body" style={styles.quoteText}>
                            “No hace falta aplicar esto hoy.
                        </AppText>
                        <AppText variant="body" style={styles.quoteText}>
                            Basta con entenderlo.”
                        </AppText>
                    </View>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.returnLink}>
                        <MaterialIcons name="keyboard-return" size={16} color={colors.primary} />
                        <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                            Volver a Enfoque
                        </AppText>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', marginTop: 32, opacity: 0.2 }}>
                        {/* Optional minimalistic icon if needed */}
                        <MaterialIcons name="import-contacts" size={24} color={colors.textSecondary} />
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    contentContainer: {
        padding: spacing.xl,
        backgroundColor: '#F8FAFC',
    },
    title: {
        fontSize: 28,
        lineHeight: 34,
        fontWeight: '800',
        marginBottom: spacing.md,
        color: '#111827',
    },
    blueDivider: {
        width: 40,
        height: 4,
        backgroundColor: '#3B82F6', // Focus Module Blue
        marginBottom: spacing.xl,
        borderRadius: 2,
    },
    blocksContainer: {
        gap: spacing.lg,
    },
    paragraph: {
        fontSize: 17,
        lineHeight: 28,
        color: '#374151',
    },
    footerContainer: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    quoteBox: {
        backgroundColor: '#EFF6FF', // Light Blue bg
        padding: spacing.xl,
        borderRadius: radius.lg,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    quoteText: {
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#1E40AF',
        fontWeight: '500',
    },
    returnLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    }
});
