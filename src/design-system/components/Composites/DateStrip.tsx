import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { DateStripItem } from '../Composites/DateStripItem';
import { spacing, colors } from '../../tokens';
import { AppText } from '../AppText';
import { MaterialIcons } from '@expo/vector-icons';

interface DateStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    maxDate?: Date; // Optional prop to block future dates
}

// Single letter day names
const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onSelectDate, maxDate }) => {
    // track the start of the visible week
    const [startOfView, setStartOfView] = useState(new Date());

    useEffect(() => {
        const date = new Date(selectedDate);
        const currentDay = date.getDay(); // 0=Sun, 1=Mon
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(date);
        monday.setDate(date.getDate() - distanceToMonday);
        setStartOfView(monday);
    }, []);

    const generateWeekDates = (startDate: Date) => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const dates = generateWeekDates(startOfView);

    // Helpers to check date limits
    const isFuture = (date: Date) => {
        if (!maxDate) return false;
        const check = new Date(date);
        check.setHours(0, 0, 0, 0);
        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);
        return check > max;
    };

    // Check if next week is completely in the future
    const canGoNext = () => {
        if (!maxDate) return true;

        // Check the Monday of next week
        const nextMonday = new Date(startOfView);
        nextMonday.setDate(nextMonday.getDate() + 7);
        nextMonday.setHours(0, 0, 0, 0);

        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);

        // If even the first day of next week is in future, block it
        // Or strictly: block if ALL days are future? 
        // User said "no puede avanzar de la fecha del dia de hoy".
        // If today is Wednesday, and I am on this week. 
        // Next week starts next Monday. That is definitely future.
        // So checking the start of next week is sufficient.

        return nextMonday <= max;
    };

    const handlePrevWeek = () => {
        const newStart = new Date(startOfView);
        newStart.setDate(newStart.getDate() - 7);
        setStartOfView(newStart);
    };

    const handleNextWeek = () => {
        if (!canGoNext()) return;
        const newStart = new Date(startOfView);
        newStart.setDate(newStart.getDate() + 7);
        setStartOfView(newStart);
    };

    return (
        <View style={styles.container}>
            <View style={styles.carouselContainer}>
                {/* Left Arrow */}
                <TouchableOpacity onPress={handlePrevWeek} style={styles.arrow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="chevron-left" size={24} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Days */}
                <View style={styles.daysRow}>
                    {dates.map((date, index) => {
                        const isSelected =
                            date.getDate() === selectedDate.getDate() &&
                            date.getMonth() === selectedDate.getMonth() &&
                            date.getFullYear() === selectedDate.getFullYear();

                        const disabled = isFuture(date);

                        return (
                            <View key={index} style={[styles.dayWrapper, disabled && { opacity: 0.3 }]}>
                                <DateStripItem
                                    dayName={DAY_LETTERS[date.getDay()]}
                                    dayNumber={date.getDate()}
                                    isActive={isSelected}
                                    onPress={disabled ? undefined : () => onSelectDate(date)}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Right Arrow */}
                <TouchableOpacity
                    onPress={handleNextWeek}
                    style={[styles.arrow, !canGoNext() && { opacity: 0.2 }]}
                    disabled={!canGoNext()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.xs,
    },
    carouselContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sm,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distribute evenly
        flex: 1,
    },
    dayWrapper: {
        alignItems: 'center',
    },
    arrow: {
        padding: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
