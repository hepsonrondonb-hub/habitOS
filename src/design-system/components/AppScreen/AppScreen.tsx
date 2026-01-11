import React from 'react';
import { View, StyleSheet, ViewProps, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../tokens';

interface AppScreenProps extends ViewProps {
    children: React.ReactNode;
    scrollable?: boolean; // In future could wrap in ScrollView
    safeArea?: boolean;
    backgroundColor?: string;
}

export const AppScreen: React.FC<AppScreenProps> = ({
    children,
    style,
    safeArea = true,
    backgroundColor = colors.background,
    ...props
}) => {
    const Container = safeArea ? SafeAreaView : View;

    return (
        <Container style={[styles.container, { backgroundColor }, style]} {...props}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <View style={styles.content}>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.md, // Default global padding
    }
});
