import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
    AppScreen,
    AppText,
    PrimaryButton,
    SecondaryButton,
    IconButton,
    FAB,
    Card,
    Divider,
    CircularCheckbox,
    Toggle,
    SegmentedControl,
    ListItem,
    DateStripItem
} from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';

export const DesignSystemGallery = () => {
    const [checkboxState, setCheckboxState] = useState(false);
    const [toggleState, setToggleState] = useState(false);
    const [segmentedIndex, setSegmentedIndex] = useState(0);
    const [dateIndex, setDateIndex] = useState(1);

    return (
        <AppScreen safeArea>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <AppText variant="heading" style={styles.header}>Design System</AppText>
                <AppText variant="subheading" style={styles.sectionHeader}>Typography</AppText>

                <Card style={styles.section}>
                    <AppText variant="heading">Heading</AppText>
                    <AppText variant="subheading">Subheading</AppText>
                    <AppText variant="body">Body text usually looks like this.</AppText>
                    <AppText variant="caption">Caption text is smaller.</AppText>
                </Card>

                <AppText variant="subheading" style={styles.sectionHeader}>Buttons</AppText>
                <Card style={styles.section}>
                    <PrimaryButton label="Primary Button" onPress={() => { }} style={styles.mb} />
                    <PrimaryButton label="Loading..." loading onPress={() => { }} style={styles.mb} />
                    <PrimaryButton label="Disabled" disabled onPress={() => { }} style={styles.mb} />
                    <SecondaryButton label="Secondary Button" onPress={() => { }} />

                    <View style={styles.row}>
                        <IconButton icon="settings" rounded />
                        <IconButton icon="add" rounded color={colors.primary} />
                        <IconButton icon="home" />
                    </View>
                </Card>

                <AppText variant="subheading" style={styles.sectionHeader}>Inputs & Controls</AppText>
                <Card style={styles.section}>
                    <View style={styles.row}>
                        <AppText>Checkbox: </AppText>
                        <CircularCheckbox checked={checkboxState} onPress={() => setCheckboxState(!checkboxState)} />
                        <View style={{ width: 16 }} />
                        <CircularCheckbox checked={!checkboxState} onPress={() => setCheckboxState(!checkboxState)} />
                    </View>

                    <Divider style={styles.mv} />

                    <View style={styles.row}>
                        <AppText>Toggle: </AppText>
                        <Toggle value={toggleState} onValueChange={setToggleState} />
                    </View>

                    <Divider style={styles.mv} />

                    <SegmentedControl
                        options={['Fuerza', 'Cardio']}
                        selectedIndex={segmentedIndex}
                        onChange={setSegmentedIndex}
                    />
                </Card>

                <AppText variant="subheading" style={styles.sectionHeader}>Composites</AppText>
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                        <DateStripItem dayName="Lun" dayNumber={12} isCompleted />
                        <DateStripItem
                            dayName="Mar"
                            dayNumber={13}
                            isActive={dateIndex === 1}
                            onPress={() => setDateIndex(1)}
                        />
                        <DateStripItem
                            dayName="Mié"
                            dayNumber={14}
                            isActive={dateIndex === 2}
                            onPress={() => setDateIndex(2)}
                        />
                    </View>

                    <ListItem
                        title="Entrenamiento"
                        subtitle="Series y reps"
                        icon="fitness-center"
                        rightElement={<CircularCheckbox checked={true} onPress={() => { }} />}
                    />
                    <ListItem
                        title="Beber agua"
                        subtitle="Todo el día"
                        icon="local-drink"
                        iconBackgroundColor="#E0F2FE" // Light Blue
                        iconColor="#0284C7"
                        rightElement={<CircularCheckbox checked={false} onPress={() => { }} />}
                    />
                    <ListItem
                        title="Configuración"
                        icon="settings"
                        rightElement={<MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />}
                    // Need to import MaterialIcons here properly or assume it works
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB Demo */}
            <FAB />

        </AppScreen>
    );
};

// Need to import MaterialIcons for the ListItem demo usage above
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing.lg,
        marginTop: spacing.md,
    },
    sectionHeader: {
        marginBottom: spacing.sm,
        marginTop: spacing.md,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.md,
    },
    mb: {
        marginBottom: spacing.sm,
    },
    mv: {
        marginVertical: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
    }
});
