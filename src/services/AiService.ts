
export interface SuggestedPlan {
    objective: string;
    measurableCriteria: string[];
    actions: {
        name: string;
        frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Once';
        icon: string;
    }[];
}

const API_KEY = 'AIzaSyD5c5TxC5jGUu_wT6J3-DASfKETAProRkA'; // In production, move to .env

export const AiService = {
    generatePlan: async (userGoal: string, periodMonths: number): Promise<SuggestedPlan> => {
        try {
            const prompt = `
            Eres un experto en hábitos y OKRs. Tu tarea es recibir un objetivo de un usuario y un periodo de tiempo, y estructurarlo en un plan de acción medible para ese lapso.
            
            Objetivo del Usuario: "${userGoal}"
            Periodo: ${periodMonths} meses

            Debes devolver un JSON estrictamente con esta estructura:
            {
                "objective": "Título corto y motivador del objetivo",
                "measurableCriteria": ["Criterio 1 (ej: Ahorrar $X)", "Criterio 2 (ej: Reducir Y)"],
                "actions": [
                    { "name": "Acción concreta 1", "frequency": "Daily" | "Weekly" | "Monthly" | "Once", "icon": "nombre_icono_material_icon" },
                    { "name": "Acción concreta 2", "frequency": "Daily" | "Weekly" | "Monthly" | "Once", "icon": "nombre_icono_material_icon" }
                ]
            }

            Reglas:
            1. Genera 3 criterios medibles.
            2. Genera 3-4 acciones concretas.
            3. Los iconos deben ser nombres de MaterialIcons válidos (ej: "fitness-center", "savings", "menu-book").
            4. Responde SOLO con el JSON, sin markdown ni explicaciones adicionales.
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API HTTP Error:', response.status, errorText);
                throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.error) {
                console.error('Gemini API Error Body:', data.error);
                throw new Error(`Gemini API Error: ${data.error.message}`);
            }

            if (!data.candidates || data.candidates.length === 0) {
                console.error('Gemini Empty Response:', JSON.stringify(data));
                if (data.promptFeedback) {
                    console.error('Prompt Feedback:', data.promptFeedback);
                }
                throw new Error('No response candidates from AI');
            }

            const text = data.candidates[0].content.parts[0].text;

            // Clean markdown if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const plan: SuggestedPlan = JSON.parse(cleanText);
            return plan;

        } catch (error) {
            console.error('AI Error:', error);
            // Fallback for demo/error
            return {
                objective: userGoal,
                measurableCriteria: [
                    'Dedicar 4 horas semanales al objetivo',
                    'Completar el primer hito importante en 1 mes'
                ],
                actions: [
                    { name: 'Sesión de trabajo enfocado', frequency: 'Daily', icon: 'timer' },
                    { name: 'Revisión de progreso', frequency: 'Weekly', icon: 'update' }
                ]
            };
        }
    }
};
