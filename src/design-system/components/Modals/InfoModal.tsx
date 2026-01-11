import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { AppText } from '../AppText/AppText';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export const InfoModal = ({ visible, onClose, title, content }: InfoModalProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* Blur or Dim Background */}
                    <View style={styles.backdrop} />

                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <AppText variant="subheading" style={styles.title}>{title}</AppText>
                                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                                <AppText variant="body" color={colors.textSecondary} style={styles.content}>
                                    {content}
                                </AppText>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: 340,
        borderRadius: radius.lg,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
        marginRight: spacing.md,
    },
    scroll: {
        maxHeight: 400,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    }
});
