export interface FocusArticle {
    article_id: string;
    title: string;
    subtitle: string;
    reading_time: string;
    content_blocks: string[];
    order: number;
    is_active: boolean;
    image_key?: string; // Optional for mapped images
}

export const FOCUS_ARTICLES: FocusArticle[] = [
    {
        article_id: 'art_01',
        title: 'Los 4 principios que hacen que una acción se sostenga',
        subtitle: 'No se trata de fuerza de voluntad, sino de diseño.',
        reading_time: '1 min',
        order: 1,
        is_active: true,
        image_key: 'principles',
        content_blocks: [
            'La mayoría de las personas intenta cambiar a fuerza de motivación. El problema es que la motivación aparece y desaparece.',
            'Los comportamientos que se sostienen en el tiempo suelen cumplir cuatro condiciones simples: son visibles, fáciles, atractivos y satisfactorios.',
            'Cuando una acción es visible, no depende de memoria ni de recordatorios constantes. Está presente en tu entorno.',
            'Cuando es fácil, no requiere una gran negociación interna. Empieza incluso en días con poca energía.',
            'Cuando es atractiva, no se vive como castigo. Tiene sentido para ti, no para una versión ideal.',
            'Cuando es satisfactoria, aunque sea de forma mínima, el cerebro la reconoce como algo que vale la pena repetir.',
            'Este sistema no busca que cumplas acciones perfectas. Busca que diseñes acciones que tengan más probabilidades de ocurrir.'
        ]
    },
    {
        article_id: 'art_02',
        title: 'Hacer la acción correcta no garantiza el resultado inmediato',
        subtitle: 'El progreso real se observa en señales, no en cumplimiento.',
        reading_time: '45 seg',
        order: 2,
        is_active: true,
        image_key: 'results',
        content_blocks: [
            'Es normal hacer una acción y no ver resultados de inmediato. Eso no significa que esté mal.',
            'El cuerpo y la mente no responden de forma instantánea. Responden a la repetición posible en el tiempo.',
            'Por eso este sistema no mide éxito por cuántas veces hiciste algo, sino por qué señales empiezan a cambiar.',
            'A veces la señal mejora antes de que seas consciente. Otras veces tarda más de lo esperado.'
        ]
    },
    {
        article_id: 'art_03',
        title: 'Hacer menos también es una estrategia',
        subtitle: 'La constancia no es insistir, es saber ajustar.',
        reading_time: '45 seg',
        order: 3,
        is_active: true,
        image_key: 'adjustment',
        content_blocks: [
            'Hacer mucho durante pocos días suele dar una falsa sensación de avance.',
            'Cuando el sistema exige demasiado, el cuerpo y la mente se defienden. Y el proceso se rompe.',
            'Hacer menos, pero de forma sostenible, permite observar mejor qué funciona y qué no.',
            'Ajustar no es fallar. Es parte natural de cualquier cambio real.'
        ]
    }
];
