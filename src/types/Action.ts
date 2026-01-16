
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'once';

export interface Action {
    id: string;
    userId: string;
    objectiveId: string;
    // Core Identity
    name: string; // Mapped from 'title' to keep compatibility with 'Habit.name' if needed, or we switch to title. existing uses name.
    description?: string;

    // Type & Styling
    type: 'simple' | 'training' | 'exercise';
    icon: string;
    category?: string; // Legacy support

    // Frequency Logic
    frequency_type: FrequencyType;
    frequency_interval: number; // Default 1
    frequency_days?: number[]; // [0-6] for weekly specific days

    // Status
    active: boolean; // boolean in existing, mapped to status enum concepts? keeping boolean for now for compat.
    status?: 'active' | 'paused' | 'archived'; // New field

    // Stats
    completed_count: number;
    last_completed_at?: string; // ISO Date
    createdAt: any; // Firestore Timestamp
}

export interface ActionCompletion {
    id: string;
    actionId: string;
    userId: string;
    completedAt: string; // ISO
    periodKey: string; // The specific bucket this completion counts for
    value?: number; // For future quantitative actions
}
