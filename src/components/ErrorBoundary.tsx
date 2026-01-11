import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Here you would log to Sentry, Crashlytics, etc.
    }

    private handleReset = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            // Fallback for dev mode where reloadAsync might not work or if not using expo-updates
            this.setState({ hasError: false, error: null });
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.iconBox}>
                        <MaterialIcons name="error-outline" size={48} color={colors.danger} />
                    </View>
                    <AppText variant="heading" centered style={styles.title}>
                        Algo salió mal
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.message}>
                        Ocurrió un error inesperado. Hemos registrado el problema.
                        Por favor, intenta reiniciar la aplicación.
                    </AppText>

                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <AppText variant="body" color="#FFFFFF" style={{ fontWeight: '700' }}>
                            Reiniciar aplicación
                        </AppText>
                    </TouchableOpacity>

                    {/* Optional: Show error details in DEV */}
                    {__DEV__ && this.state.error && (
                        <View style={styles.devBox}>
                            <AppText variant="caption" style={{ fontFamily: 'monospace' }}>
                                {this.state.error.toString()}
                            </AppText>
                        </View>
                    )}
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconBox: {
        marginBottom: spacing.lg,
        backgroundColor: '#FEF2F2',
        padding: spacing.lg,
        borderRadius: 32,
    },
    title: {
        fontSize: 24,
        marginBottom: spacing.md,
    },
    message: {
        marginBottom: spacing.xl,
        maxWidth: 300,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    devBox: {
        marginTop: spacing.xl,
        padding: spacing.md,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        width: '100%',
    }
});
