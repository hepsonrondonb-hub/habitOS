import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Types (should eventually be moved to a types file)
export interface ObjectiveDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
    order: number;
}

export interface SignalDefinition {
    id: string;
    objectiveId: string;
    name: string; // was label
    description: string;
    frequency: 'daily' | '2-3_weekly' | 'weekly';
    question: string;
    optional: boolean;
}

export interface ActionDefinition {
    id: string;
    objectiveId: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

// In-memory cache to prevent redundant fetches during session
const CACHE = {
    objectives: null as ObjectiveDefinition[] | null,
    signals: {} as Record<string, SignalDefinition[]>,
    actions: {} as Record<string, ActionDefinition[]>
};

// Hook to fetch Objectives
export const useObjectives = () => {
    const [objectives, setObjectives] = useState<ObjectiveDefinition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadObjectives = async () => {
            if (CACHE.objectives) {
                setObjectives(CACHE.objectives);
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'objectives'),
                    where('active', '==', true),
                    orderBy('order')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ObjectiveDefinition[];

                CACHE.objectives = data;
                setObjectives(data);
            } catch (error) {
                console.error('Error loading objectives:', error);
            } finally {
                setLoading(false);
            }
        };

        loadObjectives();
    }, []);

    return { objectives, loading };
};

// Hook to fetch Signals for an objective
export const useSignalsCatalog = (objectiveId: string | null) => {
    const [signals, setSignals] = useState<SignalDefinition[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!objectiveId) return;

        const loadSignals = async () => {
            if (CACHE.signals[objectiveId]) {
                setSignals(CACHE.signals[objectiveId]);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, 'progress_signals_catalog'),
                    where('objectiveId', '==', objectiveId),
                    where('active', '==', true)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SignalDefinition[];

                CACHE.signals[objectiveId] = data;
                setSignals(data);
            } catch (error) {
                console.error('Error loading signals:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSignals();
    }, [objectiveId]);

    return { signals, loading };
};

// Hook to fetch Actions for an objective
export const useActionsCatalog = (objectiveId: string | null) => {
    const [actions, setActions] = useState<ActionDefinition[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!objectiveId) return;

        const loadActions = async () => {
            if (CACHE.actions[objectiveId]) {
                setActions(CACHE.actions[objectiveId]);
                return;
            }

            setLoading(true);
            try {
                const q = query(
                    collection(db, 'actions_catalog'),
                    where('objectiveId', '==', objectiveId),
                    where('active', '==', true)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActionDefinition[];

                CACHE.actions[objectiveId] = data;
                setActions(data);
            } catch (error) {
                console.error('Error loading actions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadActions();
    }, [objectiveId]);

    return { actions, loading };
};

// Function to fetch a single question (useful for HomeScreen check-in)
// This might need to check the cache or fetch individual doc if not in cache (or just fetch all signals for the objective)
export const getQuestionFromCatalog = async (signalId: string): Promise<string | null> => {
    // 1. Try to find in cache first (search all loaded signals)
    for (const objId in CACHE.signals) {
        const signal = CACHE.signals[objId].find(s => s.id === signalId);
        if (signal) return signal.question;
    }

    // 2. Fetch from Firestore if not found
    try {
        const docRef = doc(db, 'progress_signals_catalog', signalId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().question;
        }
    } catch (e) {
        console.error("Error fetching question", e);
    }
    return null;
};
