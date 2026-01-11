import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../tokens';
import { AppText } from '../AppText';
import { Card } from '../Card';

interface ListItemProps {
    title: string;
    subtitle?: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconColor?: string;
    iconBackgroundColor?: string; // For the circle background behind icon
    rightElement?: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
    title,
    subtitle,
    icon,
    iconColor = colors.primary,
    iconBackgroundColor = colors.primarySoft,
    rightElement,
    onPress,
    style
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Card style={[styles.card, style]} noPadding>
            <Container
                style={styles.container}
                activeOpacity={onPress ? 0.7 : 1}
                onPress={onPress}
            >
                {icon && (
                    <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
                        <MaterialIcons name={icon} size={24} color={iconColor} />
                    </View>
                )}

                <View style={styles.contentContainer}>
                    <AppText variant="body" style={styles.title}>{title}</AppText>
                    {subtitle && (
                        <AppText variant="caption" style={styles.subtitle}>{subtitle}</AppText>
                    )}
                </View>

                {rightElement && (
                    <View style={styles.rightContainer}>
                        {rightElement}
                    </View>
                )}
            </Container>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.sm,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
    subtitle: {
        color: colors.textSecondary,
        marginTop: 2,
    },
    rightContainer: {
        marginLeft: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
