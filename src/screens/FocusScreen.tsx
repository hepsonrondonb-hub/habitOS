import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppScreen, AppText, Card } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { FOCUS_ARTICLES, FocusArticle } from '../data/focusArticles';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

// Images map
const CARD_IMAGES: Record<string, any> = {
    art_01: require('../../assets/focus/focus_mountains.png'),
    art_02: require('../../assets/focus/focus_water.png'),
    art_03: require('../../assets/focus/focus_stones.png'),
};

export const FocusScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handlePressArticle = (article: FocusArticle) => {
        // We will define this route in RootNavigator shortly
        // @ts-ignore - Route not defined yet
        navigation.navigate('ArticleDetail', { article });
    };

    return (
        <AppScreen backgroundColor="#F8FAFC" safeArea>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header Module */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <AppText variant="heading" style={styles.heading}>Enfoque</AppText>
                        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Marco mental para que este proceso funcione.
                        </AppText>
                    </View>
                    <View style={styles.iconBadge}>
                        <MaterialIcons name="menu-book" size={20} color="#3B82F6" />
                    </View>
                </View>

                {/* Articles List */}
                <View style={styles.listContainer}>
                    {FOCUS_ARTICLES.filter(a => a.is_active).sort((a, b) => a.order - b.order).map(article => (
                        <TouchableOpacity
                            key={article.article_id}
                            activeOpacity={0.9}
                            onPress={() => handlePressArticle(article)}
                        >
                            <Card style={styles.card} noPadding>
                                {/* Image */}
                                <Image
                                    source={CARD_IMAGES[article.article_id]}
                                    style={styles.cardImage}
                                    resizeMode="cover"
                                />

                                <View style={styles.cardContent}>
                                    <AppText variant="body" style={styles.cardTitle}>{article.title}</AppText>
                                    <AppText variant="caption" color={colors.textSecondary} style={styles.cardSubtitle}>
                                        {article.subtitle}
                                    </AppText>

                                    <View style={styles.metaRow}>
                                        <MaterialIcons name="schedule" size={12} color={colors.textSecondary} />
                                        <AppText variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>
                                            {article.reading_time}
                                        </AppText>
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280', // coolGray-500
        fontWeight: '500',
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.md,
    },
    listContainer: {
        gap: spacing.lg,
    },
    card: {
        overflow: 'hidden',
        borderWidth: 0,
        // Elevation handled by Card component usually, else add shadow here if needed
    },
    cardImage: {
        height: 120,
        width: '100%',
        backgroundColor: '#E5E7EB',
    },
    cardContent: {
        padding: spacing.lg,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: spacing.xs,
        lineHeight: 24,
    },
    cardSubtitle: {
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    }
});
