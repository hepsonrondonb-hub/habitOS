import { startOfWeek, startOfMonth, format, isSameDay } from 'date-fns';
import { Action, ActionCompletion } from '../types/Action';

// Helper to get the period key for a given date and frequency
export const getPeriodKey = (date: Date, frequencyType: Action['frequency_type']): string => {
    switch (frequencyType) {
        case 'daily':
            return format(date, 'yyyy-MM-dd');
        case 'weekly':
            // ISO Week? Or just start of week date string?
            // Using logic: "2024-W02" format is good, or just start date string prefix.
            // Let's use Start of Week date string for simplicity and sorting.
            return `W_${format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')}`;
        case 'monthly':
            return `M_${format(startOfMonth(date), 'yyyy-MM')}`;
        case 'once':
            return 'ONCE';
        default:
            return format(date, 'yyyy-MM-dd'); // Default to daily
    }
};

// Check if an action is DUE on a specific date (usually today)
// It is due if it hasn't been completed for the current period key.
export const isActionDue = (
    action: Action,
    date: Date,
    completions: Record<string, ActionCompletion[]> // Map of periodKey -> Completion? Or list?
    // Optimization: Pass a Set of completed periodKeys for this action?
): boolean => {

    if (!action.active) return false;
    if (action.status === 'paused' || action.status === 'archived') return false;

    // 1. Check Frequency Days (for Weekly specific days)
    // Legacy support: 'frequency' field on Habit was [0, 1, 2...]
    // New Action field: frequency_days [0-6]
    // If defined, strictly check if today is one of those days.
    // BUT: If it's weekly/monthly type, usually we just want "sometime this week".
    // Let's say: If frequency_days is present AND frequency_type is 'daily' or 'weekly', we restrict visibility?
    // User Requirement: "Weekly: Show as 'Pending this week'".
    // Implementation: Always show weekly/monthly as due if not done, regardless of specific day, UNLESS user heavily restricted it.
    // For now, let's respect 'frequency_days' only if type is 'daily' or legacy.

    if (action.frequency_type === 'daily' && action.frequency_days && action.frequency_days.length > 0) {
        const dayIndex = date.getDay(); // 0-6
        // Fix: Input usually uses 0=Monday? No, JS is 0=Sunday.
        // Our app uses 0=Monday in some places? Let's check DaySelector.
        // DaySelector usually 0-6. Let's assume standard JS Day or verify.
        // In HomeScreen: "const appDayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 ... Sun=6"
        // So our data (frequency_days) stores 0=Mon, 6=Sun.

        const jsDay = date.getDay();
        const appDayIndex = jsDay === 0 ? 6 : jsDay - 1;

        if (!action.frequency_days.includes(appDayIndex)) {
            return false; // Not due today
        }
    }

    // 2. Check if completed for this period
    // We need to know if we have a completion for the calculated period key.
    // The context will likely pass a simple boolean or a set of keys.
    // Let's assume the caller handles the checkout against the map.
    // This function might just calculate the key.

    return true; // If it passed the Day check, it is theoretically "Due" to be shown, unless completed.
};

export const getActionState = (
    action: Action,
    date: Date,
    completions: Record<string, boolean> // Map: periodKey -> boolean
): 'due' | 'completed' | 'not_due' => {

    const key = getPeriodKey(date, action.frequency_type);
    const isCompleted = completions[key];

    if (isCompleted) return 'completed';

    // If not completed, is it due?
    // Logic from isActionDue inline here for simplicity
    if (action.frequency_type === 'daily' && action.frequency_days && action.frequency_days.length > 0) {
        const jsDay = date.getDay();
        const appDayIndex = jsDay === 0 ? 6 : jsDay - 1;
        if (!action.frequency_days.includes(appDayIndex)) return 'not_due';
    }

    return 'due';
};
