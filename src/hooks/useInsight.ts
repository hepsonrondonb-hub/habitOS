import { useState, useEffect, useRef } from 'react';

interface InsightContext {
    totalHabitsForDay: number;
    completedHabits: number;
    percentageCompleted: number;
    isLastHabitPending: boolean;
    hasActiveStreak: boolean;
    selectedDate: Date;
    isToday: boolean;
}

interface InsightResult {
    title: string;
    subtitle: string;
}

// Message pools - calm, human, no judgment
const insights = {
    zero: [
        {
            title: "Hoy no se trata de hacerlo perfecto",
            subtitle: "Se trata de empezar."
        },
        {
            title: "Un pequeño paso hoy",
            subtitle: "Vale más que un plan perfecto."
        },
        {
            title: "Todavía estás a tiempo",
            subtitle: "De comenzar."
        }
    ],
    low: [
        {
            title: "Ya empezaste",
            subtitle: "Eso es lo importante."
        },
        {
            title: "El primer hábito",
            subtitle: "Rompe la inercia."
        },
        {
            title: "Todo avance cuenta",
            subtitle: "Sigue construyendo."
        }
    ],
    medium: [
        {
            title: "Vas bien",
            subtitle: "Un hábito más cambia el día."
        },
        {
            title: "Estás más cerca",
            subtitle: "De lo que crees."
        },
        {
            title: "La constancia",
            subtitle: "Se construye así."
        }
    ],
    high: [
        {
            title: "La consistencia es clave",
            subtitle: "Ya casi lo logras."
        },
        {
            title: "Así se ve",
            subtitle: "Un buen día."
        },
        {
            title: "Estás sosteniendo",
            subtitle: "El ritmo."
        }
    ],
    complete: [
        {
            title: "Día completo",
            subtitle: "Buen trabajo."
        },
        {
            title: "Cumpliste contigo",
            subtitle: "Hoy."
        },
        {
            title: "Así se construyen",
            subtitle: "Los hábitos."
        },
        {
            title: "Buen cierre",
            subtitle: "De día."
        }
    ],
    streak: [
        {
            title: "La racha",
            subtitle: "Sigue viva."
        },
        {
            title: "Un día más",
            subtitle: "En la cadena."
        },
        {
            title: "Sigues",
            subtitle: "Construyendo."
        }
    ],
    pastDate: [
        {
            title: "Así fue",
            subtitle: "Tu día."
        },
        {
            title: "Un registro más",
            subtitle: "En tu camino."
        },
        {
            title: "Cada día",
            subtitle: "Cuenta."
        }
    ],
    noHabits: [
        {
            title: "Día libre",
            subtitle: "Descansa o crea nuevos hábitos."
        }
    ]
};

export const useInsight = (context: InsightContext): InsightResult => {
    const lastMessageIndex = useRef<{ [key: string]: number }>({});
    const [insight, setInsight] = useState<InsightResult>({ title: '', subtitle: '' });
    const [delayedUpdate, setDelayedUpdate] = useState(false);

    const getRandomMessage = (pool: typeof insights.zero, poolKey: string): InsightResult => {
        const lastIndex = lastMessageIndex.current[poolKey] ?? -1;
        let index;

        // Prevent repetition
        do {
            index = Math.floor(Math.random() * pool.length);
        } while (index === lastIndex && pool.length > 1);

        lastMessageIndex.current[poolKey] = index;
        return pool[index];
    };

    const selectInsight = (): InsightResult => {
        const {
            totalHabitsForDay,
            completedHabits,
            percentageCompleted,
            hasActiveStreak,
            isToday
        } = context;

        // No habits for the day
        if (totalHabitsForDay === 0) {
            return getRandomMessage(insights.noHabits, 'noHabits');
        }

        // Past date - neutral observation
        if (!isToday) {
            return getRandomMessage(insights.pastDate, 'pastDate');
        }

        // Day complete (100%)
        if (percentageCompleted === 100) {
            return getRandomMessage(insights.complete, 'complete');
        }

        // Streak active - prioritize streak messages
        if (hasActiveStreak && percentageCompleted > 0) {
            return getRandomMessage(insights.streak, 'streak');
        }

        // Progress-based messages
        if (percentageCompleted === 0) {
            return getRandomMessage(insights.zero, 'zero');
        } else if (percentageCompleted < 40) {
            return getRandomMessage(insights.low, 'low');
        } else if (percentageCompleted < 70) {
            return getRandomMessage(insights.medium, 'medium');
        } else {
            return getRandomMessage(insights.high, 'high');
        }
    };

    useEffect(() => {
        // Delayed update on last habit completion
        if (context.isLastHabitPending && !delayedUpdate) {
            setDelayedUpdate(true);
            const timer = setTimeout(() => {
                setInsight(selectInsight());
                setDelayedUpdate(false);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setInsight(selectInsight());
        }
    }, [
        context.totalHabitsForDay,
        context.completedHabits,
        context.percentageCompleted,
        context.hasActiveStreak,
        context.isToday,
        context.selectedDate.toISOString()
    ]);

    return insight;
};
