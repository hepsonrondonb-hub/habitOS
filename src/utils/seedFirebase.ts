import { db } from '../config/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// --- DATA DEFINITIONS ---

// 1. Objectives
const OBJECTIVES = [
    { id: 'energy', label: 'Más energía', description: 'Sentirme activo durante el día', icon: 'bolt', order: 1 },
    { id: 'fitness', label: 'Mejor estado físico', description: 'Sentirme más fuerte y capaz', icon: 'fitness-center', order: 2 },
    { id: 'calm', label: 'Más calma', description: 'Vivir con menos tensión', icon: 'spa', order: 3 },
    { id: 'focus', label: 'Más enfoque', description: 'Concentrarme mejor en lo importante', icon: 'center-focus-strong', order: 4 },
    { id: 'sleep', label: 'Mejor sueño', description: 'Dormir y despertar descansado', icon: 'bedtime', order: 5 },
    { id: 'consistency', label: 'Más constancia', description: 'Sostener lo que empiezo', icon: 'trending-up', order: 6 }
];

// 2. Signals
// Merged from Onboarding4ProgressSignalsScreen, checkInQuestions, and signalFrequencies
const SIGNALS = [
    // Energy
    { id: 'fatigue_level', objectiveId: 'energy', label: 'Nivel de fatiga en los últimos 7 días', frequency: 'daily', question: "Hoy, ¿qué tan descansado te sentiste durante el día?" },
    { id: 'energy_crashes', objectiveId: 'energy', label: 'Frecuencia de bajones fuertes de energía', frequency: 'weekly', question: "En los últimos días, ¿tuviste bajones fuertes de energía?" },
    { id: 'energy_for_important', objectiveId: 'energy', label: 'Energía suficiente para lo importante del día', frequency: 'daily', question: "Hoy, ¿tuviste energía suficiente para lo importante?" },
    { id: 'movement_regularity', objectiveId: 'energy', label: 'Regularidad de movimiento diario', optional: true, frequency: 'weekly', question: "Esta semana, ¿qué tan regular fue tu movimiento diario?" },

    // Calm
    { id: 'stress_level', objectiveId: 'calm', label: 'Nivel de estrés percibido en la semana', frequency: 'daily', question: "Hoy, ¿qué tan estresado te sentiste?" },
    { id: 'physical_tension', objectiveId: 'calm', label: 'Tensión física (cuello, mandíbula, pecho)', frequency: '2-3_weekly', question: "Hoy, ¿sentiste tensión física (cuello, mandíbula, pecho)?" },
    { id: 'rumination', objectiveId: 'calm', label: 'Dificultad para soltar pensamientos', frequency: '2-3_weekly', question: "Hoy, ¿te costó soltar pensamientos?" },
    { id: 'tranquility', objectiveId: 'calm', label: 'Sensación general de tranquilidad', frequency: 'daily', question: "Hoy, ¿qué tan tranquilo te sentiste en general?" },

    // Focus
    { id: 'attention_ease', objectiveId: 'focus', label: 'Facilidad para mantener atención', frequency: 'daily', question: "Hoy, ¿qué tan fácil fue mantener tu atención?" },
    { id: 'distraction_frequency', objectiveId: 'focus', label: 'Frecuencia de distracciones', frequency: 'daily', question: "Hoy, ¿qué tan seguido te distrajiste?" },
    { id: 'task_completion', objectiveId: 'focus', label: 'Capacidad de terminar lo que empiezo', frequency: 'daily', question: "Hoy, ¿pudiste terminar lo que empezaste?" },
    { id: 'mental_clarity', objectiveId: 'focus', label: 'Claridad mental general', frequency: '2-3_weekly', question: "Hoy, ¿qué tan clara estuvo tu mente?" },

    // Sleep
    { id: 'fall_asleep_ease', objectiveId: 'sleep', label: 'Facilidad para quedarme dormido', frequency: 'daily', question: "Anoche, ¿qué tan fácil fue quedarte dormido?" },
    { id: 'night_awakenings', objectiveId: 'sleep', label: 'Cantidad de despertares nocturnos', frequency: 'daily', question: "Anoche, ¿cuántas veces despertaste?" },
    { id: 'rest_feeling', objectiveId: 'sleep', label: 'Sensación de descanso al despertar', frequency: 'daily', question: "Hoy, ¿qué tan descansado despertaste?" },
    { id: 'morning_energy', objectiveId: 'sleep', label: 'Energía durante la mañana', frequency: 'daily', question: "Hoy, ¿cómo estuvo tu energía durante la mañana?" },

    // Fitness
    { id: 'activity_level', objectiveId: 'fitness', label: 'Nivel de actividad física semanal', frequency: 'weekly', question: "Esta semana, ¿qué tan activo has estado físicamente?" },
    { id: 'strength_feeling', objectiveId: 'fitness', label: 'Sensación de fuerza corporal', frequency: '2-3_weekly', question: "Hoy, ¿qué tan fuerte te sentiste físicamente?" },
    { id: 'movement_capacity', objectiveId: 'fitness', label: 'Capacidad para moverme sin fatiga excesiva', frequency: '2-3_weekly', question: "Hoy, ¿pudiste moverte sin fatiga excesiva?" },
    { id: 'body_measurement', objectiveId: 'fitness', label: 'Medida corporal relevante (cintura, % grasa o % músculo)', optional: true, frequency: 'weekly', question: "Esta semana, ¿cómo sientes tu medida corporal?" },

    // Consistency
    { id: 'automaticity', objectiveId: 'consistency', label: 'Qué tan automático se siente empezar', frequency: 'daily', question: "Hoy, ¿qué tan automático se sintió empezar?" },
    { id: 'recovery_time', objectiveId: 'consistency', label: 'Tiempo que tardo en retomar cuando me detengo', frequency: '2-3_weekly', question: "Cuando te detuviste, ¿qué tan rápido retomaste?" },
    { id: 'start_difficulty', objectiveId: 'consistency', label: 'Dificultad percibida para comenzar', frequency: 'daily', question: "Hoy, ¿qué tan difícil fue comenzar?" },
    { id: 'weekly_continuity', objectiveId: 'consistency', label: 'Continuidad semanal (aunque sea mínima)', frequency: 'weekly', question: "Esta semana, ¿qué tan continuo has sido (aunque sea mínimo)?" }
];

// 3. Actions
const ACTIONS = [
    // Energy
    { id: 'walk_15min', objectiveId: 'energy', name: 'Caminar 15 minutos', description: 'Ayuda a reducir fatiga y estabilizar energía', icon: 'directions-walk' },
    { id: 'water_morning', objectiveId: 'energy', name: 'Beber agua al despertar', description: 'Apoya activación temprana', icon: 'water-drop' },
    { id: 'active_pause', objectiveId: 'energy', name: 'Pausa activa cada 90 min', description: 'Previene bajones de energía', icon: 'timer' },

    // Calm
    { id: 'slow_breathing', objectiveId: 'calm', name: 'Respiración lenta 5 min', description: 'Reduce activación del sistema nervioso', icon: 'air' },
    { id: 'screen_pause', objectiveId: 'calm', name: 'Pausa sin pantalla 10 min', description: 'Disminuye sobreestimulación', icon: 'phone-disabled' },
    { id: 'journaling', objectiveId: 'calm', name: 'Journaling breve', description: 'Ayuda a soltar rumiación', icon: 'edit-note' },

    // Focus
    { id: 'focus_block', objectiveId: 'focus', name: 'Bloque de foco 15–25 min', description: 'Entrena atención sostenida', icon: 'timer' },
    { id: 'silence_notifications', objectiveId: 'focus', name: 'Silenciar notificaciones', description: 'Reduce interrupciones cognitivas', icon: 'notifications-off' },
    { id: 'prepare_environment', objectiveId: 'focus', name: 'Preparar entorno', description: 'Menos fricción mental', icon: 'cleaning-services' },

    // Sleep
    { id: 'night_routine', objectiveId: 'sleep', name: 'Rutina de cierre nocturno', description: 'Prepara al cuerpo para dormir', icon: 'bedtime' },
    { id: 'avoid_screens', objectiveId: 'sleep', name: 'Evitar pantallas antes de dormir', description: 'Facilita conciliación', icon: 'phone-disabled' },
    { id: 'morning_light', objectiveId: 'sleep', name: 'Exposición a luz matinal', description: 'Regula ritmo circadiano', icon: 'wb-sunny' },

    // Fitness
    { id: 'daily_movement', objectiveId: 'fitness', name: 'Movimiento diario suave', description: 'Mejora capacidad y bienestar', icon: 'directions-walk' },
    { id: 'strength_2x', objectiveId: 'fitness', name: 'Fuerza 2x por semana', description: 'Mantiene músculo y metabolismo', icon: 'fitness-center' },
    { id: 'stretching', objectiveId: 'fitness', name: 'Estiramientos breves', description: 'Reduce rigidez corporal', icon: 'self-improvement' },

    // Consistency
    { id: 'minimal_action', objectiveId: 'consistency', name: 'Acción mínima diaria (2–5 min)', description: 'Reduce fricción', icon: 'timer' },
    { id: 'same_time_cue', objectiveId: 'consistency', name: 'Misma hora, misma señal', description: 'Construye automaticidad', icon: 'schedule' },
    { id: 'if_then_plan', objectiveId: 'consistency', name: 'Plan "si–entonces"', description: 'Facilita recuperación', icon: 'rule' }
];

// --- SEED FUNCTION ---

export const seedDatabase = async () => {
    console.log('🌱 Starting database seed...');

    try {
        // 1. Objectives
        console.log('Creating objectives...');
        for (const obj of OBJECTIVES) {
            await setDoc(doc(db, 'objectives', obj.id), {
                ...obj,
                active: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
        }
        console.log(`✅ Created ${OBJECTIVES.length} objectives`);

        // 2. Signals
        console.log('Creating progress signals catalog...');
        for (const signal of SIGNALS) {
            await setDoc(doc(db, 'progress_signals_catalog', signal.id), {
                objectiveId: signal.objectiveId,
                name: signal.label, // Mapping 'label' to 'name' for consistency
                description: signal.label,
                frequency: signal.frequency,
                question: signal.question,
                optional: signal.optional || false,
                active: true,
                createdAt: Timestamp.now()
            });
        }
        console.log(`✅ Created ${SIGNALS.length} signals`);

        // 3. Actions
        console.log('Creating actions catalog...');
        for (const action of ACTIONS) {
            await setDoc(doc(db, 'actions_catalog', action.id), {
                ...action,
                category: action.objectiveId, // Using objective as category
                active: true,
                createdAt: Timestamp.now()
            });
        }
        console.log(`✅ Created ${ACTIONS.length} actions`);

        console.log('🎉 Database seed completed successfully!');
        return { success: true };

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return { success: false, error };
    }
};
