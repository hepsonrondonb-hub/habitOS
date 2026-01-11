// Measurement frequency logic

export type SignalFrequency = 'daily' | '2-3_weekly' | 'weekly';

// Helper to check if a signal should be measured on a given day
export const shouldMeasureSignal = (
    frequency: SignalFrequency | string,
    date: Date,
    lastMeasurement?: Date
): boolean => {
    if (!frequency) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Only measure for today or future dates
    if (checkDate < today) return false;

    switch (frequency) {
        case 'daily':
            // Measure every day
            return true;

        case '2-3_weekly':
            // Measure if no measurement in last 2-3 days
            if (!lastMeasurement) return true;
            const daysSinceLastMeasurement = Math.floor(
                (checkDate.getTime() - lastMeasurement.getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceLastMeasurement >= 2;

        case 'weekly':
            // Measure once per week (e.g., every Sunday)
            if (!lastMeasurement) return true;
            const weeksSinceLastMeasurement = Math.floor(
                (checkDate.getTime() - lastMeasurement.getTime()) / (1000 * 60 * 60 * 24 * 7)
            );
            return weeksSinceLastMeasurement >= 1;

        default:
            return false;
    }
};
