import { NotificationType } from './notifications';

// --- CONFIGURATION ---

const COPYS = {
    checkin: [
        "Si quieres, puedes observar cómo estuvo tu día.",
        "Un momento para notar cómo te sentiste hoy.",
        "Registrar cómo te fue hoy también es parte del proceso."
    ],
    presence: [
        "Volver con algo pequeño también cuenta.",
        "Si hoy tienes espacio, una acción simple puede ser suficiente.",
        "No hace falta hacerlo todo para estar presente."
    ],
    weekly_summary: [
        "Una mirada tranquila a cómo fue tu semana.",
        "Tu proceso esta semana, en pocas palabras.",
        "Un resumen breve de lo que empezó a moverse."
    ]
};

// --- TYPES ---
interface RuleContext {
    activeSignalsCount: number;
    activePlansCount: number;
    todayCheckInCount: number;
    daysSinceLastAction: number;
    actionsLast7Days: number;
    checkInsLast7Days: number;
    userCreatedAt: Date; // To check "first 2 days" rule
    lastNotificationDate: string | null; // YYYY-MM-DD
}

interface EvaluationResult {
    type: NotificationType | null;
    body: string | null;
    reason: string;
}

// --- HELPERS ---
export const getRandomCopy = (type: NotificationType) => {
    const list = COPYS[type];
    return list[Math.floor(Math.random() * list.length)];
};

const getDaysSinceCreation = (createdAt: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// --- MAIN EVALUATOR ---
export const evaluateDailyRule = (ctx: RuleContext): EvaluationResult => {

    // 0. Safety Checks
    const todayStr = new Date().toISOString().split('T')[0];
    if (ctx.lastNotificationDate === todayStr) {
        return { type: null, body: null, reason: "Already sent a notification today" };
    }

    const accountAgeDays = getDaysSinceCreation(ctx.userCreatedAt);
    const inTrialPeriod = accountAgeDays < 2;

    // 1. WEEKLY SUMMARY (REFLEXIONAR) - Priority 1
    // Condition: Sunday + Activity in last 7 days + Not trial period
    const isSunday = new Date().getDay() === 0;
    const hasWeeklyActivity = (ctx.actionsLast7Days > 0 || ctx.checkInsLast7Days > 0);

    if (isSunday && hasWeeklyActivity && !inTrialPeriod) {
        return {
            type: 'weekly_summary',
            body: getRandomCopy('weekly_summary'),
            reason: "Sunday + Activity + Priority 1"
        };
    }

    // 2. CHECK-IN (OBSERVAR) - Priority 2
    // Condition: Active Signals + No check-in today
    // Allowed in trial period
    if (ctx.activeSignalsCount > 0 && ctx.todayCheckInCount === 0) {
        return {
            type: 'checkin',
            body: getRandomCopy('checkin'),
            reason: "Active Signals + No Check-in + Priority 2"
        };
    }

    // 3. PRESENCE SUAVE (ACTUAR) - Priority 3
    // Condition: > 3 days inactive + Active Plans + Not trial period
    if (ctx.daysSinceLastAction >= 3 && ctx.activePlansCount > 0 && !inTrialPeriod) {
        return {
            type: 'presence',
            body: getRandomCopy('presence'),
            reason: "Inactive > 3 days + Active Plans + Priority 3"
        };
    }

    return { type: null, body: null, reason: "No rules matched" };
};
