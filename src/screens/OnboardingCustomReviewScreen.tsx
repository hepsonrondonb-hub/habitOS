import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AppScreen, AppText, PrimaryButton, SecondaryButton } from '../design-system/components';
import { colors, spacing, radius, shadows } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useOnboarding } from '../store/OnboardingContext';
import { useAuth } from '../store/AuthContext';
import { SuggestedPlan } from '../services/AiService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingCustomReview'>;
type RoutePropType = RouteProp<RootStackParamList, 'OnboardingCustomReview'>;

interface CheckableItem {
    id: string;
    text: string;
    description?: string;
    subtext?: string;
    icon?: string;
    checked: boolean;
    type: 'criteria' | 'action';
    originalData?: any;
}

export const OnboardingCustomReviewScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const { customPlan: plan, setCustomPlan } = useOnboarding();
    const { user } = useAuth();

    // Fallback if context is empty (shouldn't happen in flow)
    const initialPlan = route.params?.plan || plan;

    // --- Local State for Editing ---
    const [title, setTitle] = useState(initialPlan?.objective || '');
    const [criteriaList, setCriteriaList] = useState<CheckableItem[]>([]);
    const [actionsList, setActionsList] = useState<CheckableItem[]>([]);

    // --- Modal State for Adding Items ---
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemType, setNewItemType] = useState<'criteria' | 'action'>('criteria');
    const [newItemText, setNewItemText] = useState('');

    useEffect(() => {
        if (initialPlan) {
            // Initialize Lists
            const cList: CheckableItem[] = (initialPlan.measurableCriteria || []).map((c: string, index: number) => ({
                id: `c-${index}`,
                text: c,
                checked: true,
                type: 'criteria'
            }));

            const aList: CheckableItem[] = (initialPlan.actions || []).map((a: any, index: number) => ({
                id: `a-${index}`,
                text: a.name,
                subtext: `${a.frequency || 'Diario'}`,
                icon: a.icon || 'star',
                checked: true,
                type: 'action',
                originalData: a
            }));

            setCriteriaList(cList);
            setActionsList(aList);
        }
    }, [initialPlan]);

    const toggleItem = (id: string, listType: 'criteria' | 'action') => {
        if (listType === 'criteria') {
            setCriteriaList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
        } else {
            setActionsList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
        }
    };

    const deleteItem = (id: string, listType: 'criteria' | 'action') => {
        if (listType === 'criteria') {
            setCriteriaList(prev => prev.filter(item => item.id !== id));
        } else {
            setActionsList(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleAddItem = () => {
        if (!newItemText.trim()) return;

        const newItem: CheckableItem = {
            id: `${newItemType}-${Date.now()}`,
            text: newItemText,
            checked: true,
            type: newItemType,
            icon: newItemType === 'action' ? 'check-circle' : undefined,
            originalData: newItemType === 'action' ? { name: newItemText, frequency: 'Daily', icon: 'check-circle' } : undefined
        };

        if (newItemType === 'criteria') {
            setCriteriaList([...criteriaList, newItem]);
        } else {
            setActionsList([...actionsList, newItem]);
        }

        setNewItemText('');
        setModalVisible(false);
    };

    const openAddModal = (type: 'criteria' | 'action') => {
        setNewItemType(type);
        setNewItemText('');
        setModalVisible(true);
    };

    const handleConfirm = () => {
        // Construct final plan
        const finalCriteria = criteriaList.filter(i => i.checked).map(i => i.text);

        const finalActions = actionsList.filter(i => i.checked).map(i => ({
            name: i.text,
            frequency: i.originalData?.frequency || 'Daily',
            icon: i.originalData?.icon || 'check-circle',
            bs_period: i.originalData?.bs_period
        }));

        if (finalCriteria.length === 0 && finalActions.length === 0) {
            Alert.alert("Plan vacío", "Selecciona al menos una acción o criterio para continuar.");
            return;
        }

        const finalPlan: SuggestedPlan = {
            objective: title,
            measurableCriteria: finalCriteria,
            actions: finalActions,
            visualMetaphor: initialPlan?.visualMetaphor || 'star'
        };

        // Save to context
        setCustomPlan(finalPlan);

        // Proceed
        if (user) {
            navigation.navigate('Onboarding7Closure', {
                resultIntent: 'NEW_PLAN',
                objective: title,
                signals: [],
                actions: [],
                baseline: null
            });
        } else {
            navigation.navigate('Onboarding4Account', { intent: 'NEW_PLAN' });
        }
    };

    const handleRegenerate = () => {
        navigation.goBack();
    };

    // --- Render Components ---

    const renderCheckboxRow = (item: CheckableItem) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.rowCard, !item.checked && styles.rowDisabled]}
            onPress={() => toggleItem(item.id, item.type)}
            activeOpacity={0.7}
        >
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && <MaterialIcons name="check" size={16} color={colors.surface} />}
            </View>

            <View style={styles.rowContent}>
                <AppText variant="body" style={[styles.rowText, !item.checked && styles.textDisabled]}>
                    {item.text}
                </AppText>
                {item.subtext && (
                    <AppText variant="caption" color={colors.textSecondary}>
                        {item.subtext}
                    </AppText>
                )}
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id, item.type)}>
                <MaterialIcons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={handleRegenerate}>
                        <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>Reintentar</AppText>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Title Section */}
                    <View style={styles.section}>
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>OBJETIVO</AppText>
                        <TextInput
                            style={styles.titleInput}
                            value={title}
                            onChangeText={setTitle}
                            multiline
                            placeholder="Nombre de tu objetivo"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                            Edita el título si lo deseas.
                        </AppText>
                    </View>

                    {/* Criteria Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AppText variant="subheading" style={{ fontWeight: '700' }}>¿Cómo medirlo?</AppText>
                        </View>
                        <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
                            Selecciona las señales de progreso que te hagan sentido.
                        </AppText>

                        {criteriaList.map(renderCheckboxRow)}

                        <TouchableOpacity style={styles.addButton} onPress={() => openAddModal('criteria')}>
                            <MaterialIcons name="add" size={20} color={colors.primary} />
                            <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600', marginLeft: spacing.xs }}>
                                Agregar otra señal
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Actions Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AppText variant="subheading" style={{ fontWeight: '700' }}>Acciones sugeridas</AppText>
                        </View>
                        <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
                            Hábitos o tareas recurrentes para lograrlo.
                        </AppText>

                        {actionsList.map(renderCheckboxRow)}

                        <TouchableOpacity style={styles.addButton} onPress={() => openAddModal('action')}>
                            <MaterialIcons name="add" size={20} color={colors.primary} />
                            <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600', marginLeft: spacing.xs }}>
                                Agregar otra acción
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label="Confirmar Plan"
                        onPress={handleConfirm}
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Add Item Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <AppText variant="subheading" style={{ marginBottom: spacing.md, fontWeight: '700' }}>
                            {newItemType === 'criteria' ? 'Nueva Señal de Progreso' : 'Nueva Acción'}
                        </AppText>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={newItemType === 'criteria' ? "Ej: Correr 5km sin parar" : "Ej: Salir a trotar"}
                            placeholderTextColor={colors.disabled}
                            value={newItemText}
                            onChangeText={setNewItemText}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}>
                                <AppText color={colors.textSecondary}>Cancelar</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddItem} style={styles.modalBtnAdd}>
                                <AppText color={colors.surface} style={{ fontWeight: '600' }}>Agregar</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
        marginLeft: -spacing.xs,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingVertical: spacing.sm,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    rowDisabled: {
        backgroundColor: colors.background,
        borderColor: colors.divider,
        opacity: 0.8,
        shadowOpacity: 0,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.primary,
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    rowContent: {
        flex: 1,
    },
    rowText: {
        fontWeight: '500',
    },
    textDisabled: {
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    deleteButton: {
        padding: spacing.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: radius.md,
        backgroundColor: colors.primaryLight + '10', // 10% opacity if hex, handled roughly here
        marginTop: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginBottom: spacing.xl,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        width: '100%',
        ...shadows.lg,
    },
    modalInput: {
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        paddingVertical: spacing.sm,
        fontSize: 16,
        marginBottom: spacing.xl,
        color: colors.textPrimary,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.md,
    },
    modalBtnCancel: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    modalBtnAdd: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.full,
    }
});
