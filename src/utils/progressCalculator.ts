import { PeriodOption } from '../design-system/components/Selectors/PeriodSelector';

// Types representing the raw data needed for calculation
export interface RawActionLog {
    habitId: string;
    date: string; // YYYY-MM-DD
    completed: boolean;
}

export interface RawCheckIn {
    signalId: string;
    date: string; // YYYY-MM-DD
    value: number;
}

export interface RawSignal {
    id: string; // Document ID
    signalId: string; // Catalog ID
    name: string; // resolved name
}

export interface RawAction {
    id: string;
    name: string;
}

// Result Types
export interface SignalStat {
    id: string; // Document ID
    catalogId: string;
    name: string;
    coverage: number;
    trendValue: number;
    trendType: 'improving' | 'stable' | 'irregular' | 'no_pattern';
    recentAvg: number;
    formattedStatus: string; // "Mejorando lentamente", etc.
    dataPoints: number[]; // For chart (sparse or filled? let's return sparse points or filled zero? Layout expects array. Let's return sparse objects or just values mapped to timeline)
    // The UI components TrendChart expects number array. We should normalize this.
    chartData: number[]; // Normalized for the period
}

export interface OverviewStats {
    activeDays: number;
    totalActions: number;
    presenceRatio: number;
    planLoad: number;
    trendSummary: string; // "Tendencia general: X"
    trendDescription: string;
}

export interface SignalRelation {
    hasRelation: boolean;
    text: string;
    delta: number;
    avgWithAction: number;
    avgWithoutAction: number;
}

// ------ HELPERS ------

export const getDatesInPeriod = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const getHalfPeriodDates = (allDates: string[]) => {
    const mid = Math.floor(allDates.length / 2);
    return {
        firstHalf: allDates.slice(0, mid),
        secondHalf: allDates.slice(mid)
    };
};

const average = (nums: number[]) => {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
};

// ------ CORE FUNCTIONS ------

export const calculateOverviewStats = (
    actionLogs: RawActionLog[],
    actions: RawAction[],
    periodDays: number,
    allDates: string[] // Pass generated dates to ensure alignment
): OverviewStats => {

    // Filter logs strictly within period (just in case)
    const periodSet = new Set(allDates);
    const validLogs = actionLogs.filter(l => periodSet.has(l.date) && l.completed);

    const activeDaysSet = new Set(validLogs.map(l => l.date));
    const activeDays = activeDaysSet.size;
    const totalActions = validLogs.length;
    const planLoad = actions.length;
    const presenceRatio = periodDays > 0 ? activeDays / periodDays : 0;

    return {
        activeDays,
        totalActions,
        presenceRatio,
        planLoad,
        trendSummary: '', // To be filled by aggregator
        trendDescription: '' // To be filled by aggregator
    };
};

export const calculateSignalStats = (
    signal: RawSignal,
    checkIns: RawCheckIn[],
    allDates: string[]
): SignalStat => {
    const periodSet = new Set(allDates);
    const signalCheckIns = checkIns
        .filter(c => c.signalId === signal.signalId && periodSet.has(c.date))
        .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending

    const values = signalCheckIns.map(c => c.value);
    const coverage = new Set(signalCheckIns.map(c => c.date)).size;

    // Split halves
    const { firstHalf, secondHalf } = getHalfPeriodDates(allDates);
    const firstHalfSet = new Set(firstHalf);
    const secondHalfSet = new Set(secondHalf);

    const firstHalfValues = signalCheckIns.filter(c => firstHalfSet.has(c.date)).map(c => c.value);
    const secondHalfValues = signalCheckIns.filter(c => secondHalfSet.has(c.date)).map(c => c.value);

    const avgFirst = average(firstHalfValues);
    const avgSecond = average(secondHalfValues);
    const trendValue = (firstHalfValues.length > 0 && secondHalfValues.length > 0) ? (avgSecond - avgFirst) : 0;

    // Variability: average of absolute diffs between CONSECUTIVE checkins
    let diffSum = 0;
    let diffCount = 0;
    for (let i = 1; i < signalCheckIns.length; i++) {
        diffSum += Math.abs(signalCheckIns[i].value - signalCheckIns[i - 1].value);
        diffCount++;
    }
    const variability = diffCount > 0 ? diffSum / diffCount : 0;

    // Recent Avg (last 3 matches)
    const recentValues = values.slice(-3);
    const recentAvg = average(recentValues);

    // Status Determination
    let statusText = "Aún sin patrón claro";
    let trendType: SignalStat['trendType'] = 'no_pattern';

    if (coverage < 3) {
        statusText = "Aún sin patrón claro";
        trendType = 'no_pattern';
    } else if (trendValue > 0.3 && variability <= 0.6) {
        statusText = "Mejorando lentamente";
        trendType = 'improving';
    } else if (Math.abs(trendValue) <= 0.3) {
        statusText = "Evolución estable";
        trendType = 'stable';
    } else if (variability > 0.6) {
        statusText = "Irregular";
        trendType = 'irregular';
    } else {
        // Fallback for cases like negative trend but low variability (Worsening?) 
        // User spec didn't strictly cover "Worsening", but implied "Evolución estable" if abs <= 0.3. 
        // If trendValue < -0.3 and low variability, technically it's worsening. 
        // Spec says: "Evolución estable" if abs <= 0.3. 
        // Spec says: "Irregular" if var > 0.6.
        // Spec says: "Mejorando" if val > 0.3 AND var <= 0.6.
        // What if val < -0.3 AND var <= 0.6? 
        // I will default to "Evolución estable" or "Aún sin patrón claro" to avoid negativity based on tone "No aggressive dashboards". 
        // Let's stick to "Evolución estable" or maybe indicate change? 
        // User instructions say: "Estados posibles (solo estos)".
        // So I must fit it into one. 
        // If it's effectively going down, "Evolución estable" is the safest "calm" fallback, or maybe just "Irregular" if it feels jumpy.
        // But strict math: let's map < -0.3 to "Evolución estable" (as in 'pattern is consistent') or just use the catch-all.
        // Use "Evolución estable" as the default for anything not matching "Improving" or "Irregular".
        statusText = "Evolución estable";
        trendType = 'stable';
    }

    // Chart Data Construction
    // Mapping actual values to the dates array.
    // If a date has no value, what do we put? 
    // Sparklines usually interpolate. `TrendChart` expects `number[]`. 
    // If I send [1, 5], it draws a line. 
    // If I send [1, null, 5], d3 might break or skip. 
    // For now, let's just send the VALUES present, evenly spaced. 
    // "Sparkline" conceptual model usually ignores time gaps for simple lists, 
    // BUT the requested "TrendChart" detail might need gaps.
    // The previous implementation sent just the values.
    const chartData = values;

    return {
        id: signal.id,
        catalogId: signal.signalId,
        name: signal.name,
        coverage,
        trendValue,
        trendType,
        recentAvg,
        formattedStatus: statusText,
        dataPoints: values,
        chartData
    };
};

export const aggregateOverviewTrend = (signalStats: SignalStat[]): { summary: string; description: string } => {
    const validSignals = signalStats.filter(s => s.coverage >= 3);

    if (validSignals.length === 0) {
        return {
            summary: "Tendencia general: Aún sin patrón claro",
            description: "Aún estamos construyendo tu progreso. Vuelve en unos días."
        };
    }

    // Mode calculation
    const counts = {
        'Mejorando lentamente': 0,
        'Evolución estable': 0,
        'Irregular': 0,
        'Aún sin patrón claro': 0
    };

    validSignals.forEach(s => {
        if (counts[s.formattedStatus as keyof typeof counts] !== undefined) {
            counts[s.formattedStatus as keyof typeof counts]++;
        }
    });

    let bestStatus = "Evolución estable";
    let maxCount = -1;

    // Priority handling in case of ties?
    // User says: "si hay empate -> Evolución estable"

    // Check specific specific precedence or just max?
    // Let's iterate
    const entries = Object.entries(counts);
    entries.sort((a, b) => b[1] - a[1]); // Sort by count desc

    const first = entries[0];
    const second = entries[1];

    if (first[1] === second[1]) {
        bestStatus = "Evolución estable";
    } else {
        bestStatus = first[0];
    }

    return {
        summary: `Tendencia general: ${bestStatus.split(':')[0]}`, // Remove prefix if any
        description: getTrendDescription(bestStatus)
    };
};

const getTrendDescription = (status: string): string => {
    switch (status) {
        case "Mejorando lentamente": return "Tus señales muestran un cambio positivo constante.";
        case "Evolución estable": return "Tu proceso se mantiene firme y constante.";
        case "Irregular": return "Hay variaciones naturales, es parte del proceso.";
        default: return "Aún estamos reuniendo información.";
    }
};

export const calculateRelation = (
    signalCheckIns: RawCheckIn[],
    actionLogs: RawActionLog[],
    allDates: string[]
): SignalRelation => {
    // 1. Identify "Action Dates" (Set of dates where >= 1 action was completed)
    const actionDateSet = new Set(
        actionLogs.filter(l => l.completed).map(l => l.date)
    );

    // 2. Filter Checkins to only those within our period (allDates)
    const periodSet = new Set(allDates);
    const validCheckIns = signalCheckIns.filter(c => periodSet.has(c.date));

    // Coverage check
    if (validCheckIns.length < 4) {
        return { hasRelation: false, text: "Aún no hay datos suficientes para ver una relación.", delta: 0, avgWithAction: 0, avgWithoutAction: 0 };
    }

    // 3. Separate checkins
    const withActionValues = validCheckIns.filter(c => actionDateSet.has(c.date)).map(c => c.value);
    const withoutActionValues = validCheckIns.filter(c => !actionDateSet.has(c.date)).map(c => c.value);

    // Ensure we have data in both buckets? Or at least one?
    // User only said "Compare averages". If one bucket is empty, avg is 0. 
    // If withoutAction is empty (user does action EVERY day with checkin), delta = avgWith.

    const avgWith = average(withActionValues);
    const avgWithout = average(withoutActionValues);

    // If withoutActionValues is empty (e.g. user acts every day), comparison is tricky. 
    // Let's handle it gracefully: if one bucket is empty, we can't really speak to a "Relation" (causality needs control group).
    if (withActionValues.length === 0 || withoutActionValues.length === 0) {
        return { hasRelation: false, text: "Necesitamos más variedad de días (con y sin acciones) para comparar.", delta: 0, avgWithAction: avgWith, avgWithoutAction: avgWithout };
    }

    const delta = avgWith - avgWithout;

    let text = "Aún no se observa un impacto claro de esta acción.";
    if (delta >= 0.3) {
        text = "Cuando realizas esta acción, la señal suele mejorar.";
    } else if (delta <= -0.3) {
        // User didn't specify negative case text, uses "Aún no se observa..." for -0.3 < delta < 0.3
        // Logical fallback for negative impact? "Parece que esta acción te exige demasiado."? 
        // Sticking to safety:
        text = "Aún no se observa un impacto claro de esta acción.";
    }

    return {
        hasRelation: true,
        text,
        delta,
        avgWithAction: avgWith,
        avgWithoutAction: avgWithout
    };
};
