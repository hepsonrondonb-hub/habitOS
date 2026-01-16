import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore'; // onSnapshot? Maybe for real-time adjustments? User asked for "panel debug me allows input and see result immediately". onSnapshot is better for that.
import { db } from '../config/firebase';
import { useAuth } from '../store/AuthContext';
import {
    calculateOverviewStats,
    calculateSignalStats,
    aggregateOverviewTrend,
    calculateRelation,
    getDatesInPeriod,
    SignalStat,
    OverviewStats
} from '../utils/progressCalculator';
import { PeriodOption } from '../design-system/components/Selectors/PeriodSelector';

// Types
export interface ProgressObjective {
    id: string; // User Objective ID
    type: string; // 'energy', 'focus', etc.
    label: string; // 'Energía', etc. (Mapped from const or catalog)
}

export interface SignalData extends SignalStat {
    // Calculated stats extended with specific UI needs if any
    insight: string; // Relation insight text
}

const OBJECTIVE_LABELS: Record<string, string> = {
    energy: 'Energía',
    fitness: 'Cond. Física',
    calm: 'Calma',
    focus: 'Enfoque',
    sleep: 'Sueño',
    consistency: 'Constancia'
};

export const useProgressData = (periodDays: PeriodOption, selectedObjectiveId?: string) => {
    const { user } = useAuth();

    // State
    const [objectives, setObjectives] = useState<ProgressObjective[]>([]);
    const [resolvedObjectiveId, setResolvedObjectiveId] = useState<string | null>(null);

    // Raw Data State
    const [rawSignals, setRawSignals] = useState<any[]>([]); // User signals
    const [catalogSignals, setCatalogSignals] = useState<any[]>([]); // To resolve names
    const [rawActions, setRawActions] = useState<any[]>([]);
    const [actionLogs, setActionLogs] = useState<any[]>([]);
    const [checkIns, setCheckIns] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // 1. Fetch User Objectives (Once)
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'user_objectives'),
            where('userId', '==', user.uid),
            where('active', '==', true)
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const objs = snapshot.docs.map(doc => ({
                id: doc.id,
                type: doc.data().objectiveType,
                label: doc.data().title || OBJECTIVE_LABELS[doc.data().objectiveType] || doc.data().objectiveType
            }));

            // Deduplicate? Should be unique active ones.
            setObjectives(objs);

            // Set resolved ID if not set or invalid
            if (objs.length > 0) {
                if (selectedObjectiveId) {
                    // Check if still valid
                    const exists = objs.find(o => o.id === selectedObjectiveId);
                    setResolvedObjectiveId(exists ? exists.id : objs[0].id);
                } else {
                    setResolvedObjectiveId(objs[0].id);
                }
            } else {
                setResolvedObjectiveId(null);
            }
        });

        return () => unsubscribe();
    }, [user, selectedObjectiveId]); // Depend on selectedObjectiveId to update resolved if passed? No, better handle internally.

    // 2. Fetch Context Data (Signals, Actions, Catalog) when Objective Changes
    useEffect(() => {
        if (!user || !resolvedObjectiveId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const currentObj = objectives.find(o => o.id === resolvedObjectiveId);
        if (!currentObj) return;

        // Parallel listeners would be ideal, but catalog is static.
        // Let's listen to user data, fetch catalog once.

        let unsubSignals: () => void;
        let unsubActions: () => void;

        const fetchData = async () => {
            // 2a. Fetch Catalog Signals for this objective type
            // We need this to get names.
            const catalogQ = query(
                collection(db, 'progress_signals_catalog'),
                where('objectiveId', '==', currentObj.type),
                where('active', '==', true)
            );
            const catalogSnap = await getDocs(catalogQ);
            setCatalogSignals(catalogSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        };

        fetchData();

        // 2b. User Signals
        const signalsQ = query(
            collection(db, 'progress_signals'),
            where('userId', '==', user.uid),
            where('objectiveId', '==', resolvedObjectiveId)
        );
        unsubSignals = onSnapshot(signalsQ, (snapshot) => {
            setRawSignals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 2c. User Actions (Habits)
        const actionsQ = query(
            collection(db, 'habits'),
            where('userId', '==', user.uid),
            where('objectiveId', '==', resolvedObjectiveId),
            where('isActive', '==', true)
        );
        unsubActions = onSnapshot(actionsQ, (snapshot) => {
            setRawActions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubSignals && unsubSignals();
            unsubActions && unsubActions();
        };
    }, [user, resolvedObjectiveId, objectives]); // Depend on objectives to find currentObj

    // 3. Fetch Transactional Data (Checkins, Logs) - Fetch ALL for user/objective to avoid complex indexes and enable instant period toggling
    useEffect(() => {
        if (!user || !resolvedObjectiveId) return;

        setLoading(true);

        let unsubLogs: () => void;
        let unsubCheckins: () => void;

        // 3a. Action Completions (New Schema)
        const logsQ = query(
            collection(db, 'action_completions'),
            where('userId', '==', user.uid)
        );
        unsubLogs = onSnapshot(logsQ, (snapshot) => {
            const logs = snapshot.docs.map(d => ({
                habitId: d.data().actionId, // Map actionId back to habitId for calc util compatibility
                date: d.data().periodKey,   // PeriodKey is used as date? No, calculator expects date string.
                // Wait, calculator expects 'date' (YYYY-MM-DD). 
                // action_completions has 'periodKey' (YYYY-MM-DD) for Daily actions.
                // For weekly/monthly, periodKey is different. 
                // We need 'completedAt' which includes date, or parse periodKey.
                // Let's use periodKey if it looks like a date, or derived date.
                // Actually, existing calculator likely filters by date string exact match.
                // If we want to support daily view, periodKey is perfect.
                // If we want to support aggregated, we might need more.
                // For now, assume periodKey IS the date for daily actions.
                // For compatibility, let's map periodKey -> date.
                ...d.data(),
                date: d.data().periodKey // Assuming periodKey is YYYY-MM-DD for daily
            }));
            setActionLogs(logs);
        }, (error) => {
            console.error("Error listening to action completions:", error);
            // Don't hang functionality completely, just log
        });

        // 3b. Checkins
        const checkinsQ = query(
            collection(db, 'check_ins'),
            where('userId', '==', user.uid),
            where('objectiveId', '==', resolvedObjectiveId)
        );
        unsubCheckins = onSnapshot(checkinsQ, (snapshot) => {
            setCheckIns(snapshot.docs.map(d => d.data()));
            setLoading(false);
        }, (error) => {
            console.error("Error listening to check-ins:", error);
            setLoading(false); // Ensure we stop loading even on error
        });

        return () => {
            unsubLogs && unsubLogs();
            unsubCheckins && unsubCheckins();
        };

    }, [user, resolvedObjectiveId]); // Removed periodDays dependency


    // 4. Calculate Stats (Memoized)
    const stats = useMemo(() => {
        if (!resolvedObjectiveId) {
            return {
                overview: null,
                signals: [],
                trend: null
            };
        }

        const allDates = getDatesInPeriod(periodDays);
        const startDate = allDates[0];
        const endDate = allDates[allDates.length - 1];

        // Map Checkins to RawCheckIn & Filter by Period
        const cleanCheckIns = checkIns
            .filter(c => c.date >= startDate && c.date <= endDate)
            .map(c => ({
                signalId: c.signalId, // This is catalog ID usually in check_ins collection
                date: c.date,
                value: c.value
            }));

        // Map Logs to RawActionLog, Filtered by rawActions (this objective's habits) AND Period
        const myHabitIds = new Set(rawActions.map(a => a.id));

        const cleanLogs = actionLogs
            .filter(l => myHabitIds.has(l.habitId))
            .filter(l => l.date >= startDate && l.date <= endDate)
            .map(l => ({
                habitId: l.habitId,
                date: l.date,
                completed: l.completed
            }));

        // Calculate Overview
        const overview = calculateOverviewStats(
            cleanLogs,
            rawActions.map(a => ({ id: a.id, name: a.name })),
            periodDays,
            allDates
        );

        // Calculate Signals
        const computedSignals = rawSignals.map(signal => {
            // Resolve name
            const catalogDef = catalogSignals.find(c => c.id === signal.signalId);
            const name = catalogDef?.name || signal.name || "Señal desconocida";

            // Calculate Base Stats
            const baseStats = calculateSignalStats(
                { id: signal.id, signalId: signal.signalId, name },
                cleanCheckIns,
                allDates
            );

            // Calculate Relation
            // For relation, we need to associate this signal with actions. 
            // The user prompt says "Relación acciones <-> señales". 
            // "When you perform THIS action, the signal improves". 
            // But which action? 
            // "Relación acción <-> señal (SIN MENTIR)" -> "comparar promedio de la señal entre A) días con acción B) días sin acción".
            // "Día con acción" = date where >= 1 action (ANY action of the objective) was completed.
            // Simplified global relation.

            const relation = calculateRelation(
                cleanCheckIns.filter(c => c.signalId === signal.signalId),
                cleanLogs,
                allDates
            );

            return {
                ...baseStats,
                insight: relation.text,
                relationDelta: relation.delta,
                avgWithAction: relation.avgWithAction,
                avgWithoutAction: relation.avgWithoutAction,
                hasRelation: relation.hasRelation
            };
        });

        // Calculate Trend Aggregate
        const aggregate = aggregateOverviewTrend(computedSignals);
        overview.trendSummary = aggregate.summary;
        overview.trendDescription = aggregate.description;
        overview.objectiveProgress = aggregate.objectiveProgress;

        // Find Top Insight (Strongest Relation)
        // We only care about positive relations for the "Highlight" (helping the user).
        // Or significant ones.
        let topInsight = null;
        const significantSignals = computedSignals.filter(s => s.hasRelation && Math.abs(s.relationDelta) >= 0.3);

        if (significantSignals.length > 0) {
            // Sort by absolute strength
            significantSignals.sort((a, b) => Math.abs(b.relationDelta) - Math.abs(a.relationDelta));
            const best = significantSignals[0];
            topInsight = {
                signalName: best.name,
                text: best.insight,
                delta: best.relationDelta
            };
        }

        return {
            overview,
            signals: computedSignals,
            trend: aggregate,
            topInsight
        };

    }, [rawSignals, rawActions, actionLogs, checkIns, catalogSignals, periodDays, resolvedObjectiveId]);

    return {
        loading,
        objectives,
        selectedObjectiveId: resolvedObjectiveId,
        ...stats
    };
};
