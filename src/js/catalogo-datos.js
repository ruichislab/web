// src/js/catalogo-datos.js
// Catálogo Oficial Verificado — Ruichis Lab (Amazon KDP)

window.RUICHIS_CATALOGO = {
  editorialInfo: {
    nombre: "Ruichis Lab",
    lema: "Productividad Asimétrica, Colección Letras y Retos, Thriller Tecnológico & Aprendizaje Bilingüe",
    ciudad: "Bogotá, Colombia",
    distribucion: "Amazon KDP (Kindle eBook & Tapa Blanda)",
    amazonAuthorSearch: "https://www.amazon.com/s?k=Ruichis+Lab"
  },

  libros: [
    // 1. PRODUCTIVIDAD ASIMÉTRICA (ESPAÑOL)
    {
      id: "productividad-asimetrica-es",
      titulo: "Productividad Asimétrica: El arte de hacer en dos horas lo que a otros les lleva una semana",
      subtitulo: "Edición en Español • Aislamiento Cognitivo Profundo, Apalancamiento Algorítmico y Sistemas Modulares",
      autor: "Ruichis Lab",
      sello: "Ruichis Lab",
      categoria: "productividad",
      categoriaLabel: "Productividad Asimétrica",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Kindle eBook & Tapa Blanda (5\" × 8\")",
      portada: "src/assets/covers/productividad-asimetrica-es.jpg",
      portadaAlternativa: "src/assets/covers/herramientas-asimetricas.jpg",
      portadaAlternativaLabel: "🖼️ Ver Portada Alternativa",
      destacado: true,
      badgeEspecial: "ASIN: B0HD2MY2HN",
      asin: "B0HD2MY2HN",
      amazonUrl: "https://www.amazon.com/dp/B0HD2MY2HN",
      juegoRelacionado: { tipo: "sudoku", dificultad: "medio" },
      sinopsis: "La mayoría de los sistemas de productividad tradicionales están diseñados para la era industrial: miden horas frente a una pantalla en lugar de impacto real. 'Productividad Asimétrica' expone cómo combinar aislamiento cognitivo profundo, apalancamiento tecnológico y diseño de sistemas para comprimir semanas de trabajo fragmentado en bloques de ejecución de dos horas.",
      caracteristicas: [
        "Arquitectura de bloques de foco profundo de 120 minutos sin residuo atencional.",
        "Apalancamiento asimétrico mediante automatización, plantillas modulares y flujos de IA.",
        "Eliminación sistemática del 'teatro de la productividad' y la fricción operativa.",
        "Edición oficial en Español disponible en Amazon (ASIN: B0HD2MY2HN)."
      ],
      extractoTitulo: "Capítulo 1: La Mentira Lineal del Tiempo",
      extracto: "«El trabajador promedio no está agotado por la complejidad de sus ideas, sino por la fricción de su entorno. Cada notificación, cada cambio de contexto y cada pestaña abierta cobra un impuesto neurobiológico que llamamos residuo de atención. La productividad asimétrica no consiste en correr más rápido dentro del laberinto; consiste en diseñar una catapulta fuera de él.»"
    },

    // 2. ASYMMETRIC PRODUCTIVITY (ENGLISH EDITION)
    {
      id: "asymmetric-productivity-en",
      titulo: "Asymmetric Productivity: The Art of Doing in Two Hours What Takes Others a Week",
      subtitulo: "English Edition • Cognitive Isolation Protocols, Algorithmic Leverage & High-Output Execution",
      autor: "Ruichis Lab",
      sello: "Ruichis Lab",
      categoria: "productividad",
      categoriaLabel: "Productividad Asimétrica",
      idioma: "Inglés",
      idiomaBadge: "EN",
      formato: "Kindle eBook & Paperback (5\" × 8\")",
      portada: "src/assets/covers/asymmetric-productivity-en.jpg",
      destacado: true,
      badgeEspecial: "ASIN: B0HJ42QFCV",
      asin: "B0HJ42QFCV",
      amazonUrl: "https://www.amazon.com/dp/B0HJ42QFCV",
      juegoRelacionado: { tipo: "sudoku", dificultad: "dificil" },
      sinopsis: "The official English edition of Ruichis Lab's manifesto on cognitive leverage. Discover how high-output engineers, writers, and creators replace linear grind with asymmetric execution systems, cognitive isolation protocols, and autonomous workflows.",
      caracteristicas: [
        "Full English edition crafted for global professionals, builders, and independent creators.",
        "Includes the 2-Hour Deep Execution Protocol and Asymmetric Leverage Matrix.",
        "Available worldwide in Kindle eBook and 5\" × 8\" Paperback (ASIN: B0HJ42QFCV)."
      ],
      extractoTitulo: "Excerpt — The Asymmetric Leverage Principle",
      extracto: "«In knowledge work, output is never proportional to hours logged. Two hours of uninterrupted architectural clarity—amplified by the right cognitive tools—routinely outperforms forty hours of fragmented, reactive busywork.»"
    },

    // 3. 100 GRANDES SOPAS DE LETRAS DE CULTURA GENERAL
    {
      id: "sopas-cultura-general",
      titulo: "100 Grandes Sopas de Letras de Cultura General",
      subtitulo: "Colección Letras y Retos (Vol. I) • Historia • Ciencia • Arte • Geografía • Filosofía — 100 Desafíos Temáticos • 1.200 Palabras",
      autor: "Ruichis Lab",
      sello: "Colección Letras y Retos",
      categoria: "pasatiempos",
      categoriaLabel: "Colección Letras y Retos",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Edición de Bolsillo 5\" × 8\" • Letra Clara • 132 págs.",
      portada: "src/assets/covers/100-sopas-cultura-general.jpg",
      portadaWrap: "src/assets/covers/100-sopas-cultura-wrap.jpg",
      destacado: true,
      badgeEspecial: "VOLUMEN I • 1.200 PALABRAS",
      asin: "",
      amazonUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      juegoRelacionado: { tipo: "sopa", tema: "cultura_historia" },
      sinopsis: "Desafía tu mente y amplía tu vocabulario con 100 tableros temáticos cuidadosamente diseñados en 8 direcciones. Desde las grandes civilizaciones de la historia y los hitos de la ciencia hasta el arte universal, la geografía del mundo y las corrientes filosóficas.",
      caracteristicas: [
        "100 desafíos temáticos únicos con 12 palabras por tablero (1.200 términos culturales).",
        "Palabras distribuidas en 8 direcciones: horizontal, vertical, diagonal e invertidas.",
        "Edición de bolsillo 5\" × 8\" (132 páginas) con tipografía de letra clara y alto contraste.",
        "Incluye solucionario completo en la sección final del libro."
      ],
      extractoTitulo: "Presentación de la Colección Letras y Retos (Vol. I)",
      extracto: "«Entrenar la atención sostenida en una época dominada por la fragmentación digital es un acto de resistencia cognitiva. Cada uno de los 100 tableros de este primer volumen ha sido construido como una expedición por el saber humano: Historia, Ciencia, Arte, Geografía y Filosofía.»"
    },

    // 4. 100 GRANDES SOPAS DE LETRAS DE BIOLOGÍA
    {
      id: "sopas-biologia",
      titulo: "100 Grandes Sopas de Letras de Biología",
      subtitulo: "Colección Letras y Retos (Vol. II) • Célula • Genética • Botánica • Zoología • Evolución — 100 Desafíos Temáticos • 1.200 Palabras",
      autor: "Ruichis Lab",
      sello: "Colección Letras y Retos",
      categoria: "pasatiempos",
      categoriaLabel: "Colección Letras y Retos",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Edición de Bolsillo 5\" × 8\" • Letra Clara • 132 págs.",
      portada: "src/assets/covers/100-sopas-biologia.jpg",
      portadaWrap: "src/assets/covers/100-sopas-biologia-wrap.jpg",
      destacado: true,
      badgeEspecial: "VOLUMEN II • CIENCIAS BIOLÓGICAS",
      asin: "",
      amazonUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Biologia+Ruichis+Lab",
      juegoRelacionado: { tipo: "sopa", tema: "biologia_celula" },
      sinopsis: "Explora los fundamentos de las ciencias de la vida mientras ejercitas tu agilidad mental. El Volumen II de la Colección Letras y Retos reúne 1.200 términos esenciales de biología celular, genética molecular, botánica, zoología, ecología y evolución.",
      caracteristicas: [
        "100 desafíos temáticos dedicados a las ciencias biológicas y la naturaleza (1.200 palabras).",
        "Ideal para estudiantes, docentes, lectores científicos y amantes de los retos mentales.",
        "Formato compacto 5\" × 8\" de 132 páginas con diseño limpio de letra clara y soluciones incluidas."
      ],
      extractoTitulo: "Introducción al Volumen II: El Léxico de la Vida",
      extracto: "«Al rastrear términos como mitocondria, ribosoma, cromosoma, fotosíntesis o filogenia entre las letras entrelazadas, el cerebro refuerza simultáneamente la memoria visual, la precisión ortográfica y el dominio conceptual de la biología.»"
    },

    // 5. CORPORATE SILENCE — BOOK 1: PUSH
    {
      id: "corporate-silence-1",
      titulo: "Corporate Silence — Book 1: Push",
      subtitulo: "Techno-Thriller de Espionaje Financiero y Algoritmos de Sombra (Edición en Español e Inglés)",
      autor: "Daemon Drew",
      sello: "Ruichis Lab",
      categoria: "ficcion",
      categoriaLabel: "Thriller Tecnológico",
      idioma: "Español & Inglés",
      idiomaBadge: "ES / EN",
      formato: "Kindle eBook",
      portada: "src/assets/covers/corporate-silence-1.jpg",
      destacado: true,
      badgeEspecial: "ASIN: B0HDQ91SD1 / B0HDM455NT",
      asin: "B0HDQ91SD1",
      asinSecundario: "B0HDM455NT",
      amazonUrl: "https://www.amazon.com/dp/B0HDQ91SD1",
      amazonUrlEn: "https://www.amazon.com/dp/B0HDM455NT",
      juegoRelacionado: { tipo: "sudoku", dificultad: "experto" },
      sinopsis: "En las altas esferas financieras, el silencio corporativo nunca es casual: se compra, se cifra y se ejecuta en microsegundos. Cuando sale a la luz una anomalía oculta en los conductos de liquidación algorítmica, un simple 'push' en producción desata una persecución implacable entre consorcios financieros y operadores de inteligencia privada.",
      caracteristicas: [
        "Libro 1 de la saga 'Corporate Silence' escrita por Daemon Drew.",
        "Thriller tecnológico de alta tensión sobre ciberseguridad, código crítico y poder corporativo.",
        "Edición en Español disponible en Kindle (ASIN: B0HDQ91SD1).",
        "Edición en Inglés disponible en Kindle (ASIN: B0HDM455NT)."
      ],
      extractoTitulo: "Fragmento — Book 1: Push",
      extracto: "«En los mercados de alta frecuencia nadie dispara un arma cuando puede alterar tres líneas de un servicio de conciliación. El rastro no desapareció; simplemente quedó fuera del alcance de quienes no poseían la llave criptográfica correcta.»"
    },

    // 6. CORPORATE SILENCE — LIBRO 2: NOISE
    {
      id: "corporate-silence-2",
      titulo: "Corporate Silence — Libro 2: Noise",
      subtitulo: "Secuela de Corporate Silence: Push • Guerra Algorítmica y Silencio Corporativo",
      autor: "Daemon Drew",
      sello: "Ruichis Lab",
      categoria: "ficcion",
      categoriaLabel: "Thriller Tecnológico",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Kindle eBook",
      portada: "src/assets/covers/corporate-silence-2.jpg",
      destacado: true,
      badgeEspecial: "ASIN: B0HKTLLGMM",
      asin: "B0HKTLLGMM",
      amazonUrl: "https://www.amazon.com/dp/B0HKTLLGMM",
      juegoRelacionado: { tipo: "sudoku", dificultad: "experto" },
      sinopsis: "Secuela directa de 'Corporate Silence: Push'. La confrontación escala hacia una guerra algorítmica donde el arma definitiva ya no es ocultar los datos, sino inundar los canales de auditoría y vigilancia global con ruido sintético indistinguible de la verdad.",
      caracteristicas: [
        "Segundo libro de la serie 'Corporate Silence' de Daemon Drew.",
        "Explora la desinformación sintética, bóvedas de datos y espionaje financiero de nueva generación.",
        "Disponible en formato Kindle eBook en Amazon (ASIN: B0HKTLLGMM)."
      ],
      extractoTitulo: "Fragmento — Libro 2: Noise",
      extracto: "«Si quieres ocultar una operación crítica en la era de la vigilancia total, no apagas los sensores. Inundas la red con diez millones de señales falsas matemáticamente perfectas. No necesitas silencio cuando eres el dueño del ruido.»"
    },

    // 7. LEARN SPANISH / APRENDE INGLÉS CON SAMANIEGO
    {
      id: "learn-spanish-samaniego",
      titulo: "Learn Spanish / Aprende Inglés con / with Samaniego",
      subtitulo: "A Two-Way Bilingual Fable Reader & Workbook (Trilogía Bilingüe Español–Inglés: Fábulas 1–75)",
      autor: "Ruichis Lab",
      sello: "Ruichis Lab",
      categoria: "bilingue",
      categoriaLabel: "Aprendizaje Bilingüe",
      idioma: "Bilingüe",
      idiomaBadge: "ES ⇄ EN",
      formato: "Tapa Blanda & Kindle eBook (Vols. 1, 2 y 3)",
      portada: "src/assets/covers/learn-spanish-samaniego.jpg",
      destacado: true,
      badgeEspecial: "TRILOGÍA BILINGÜE • FÁBULAS 1–75",
      asin: "",
      amazonUrl: "https://www.amazon.com/s?k=Learn+Spanish+Aprende+Ingles+Samaniego+Ruichis+Lab",
      juegoRelacionado: { tipo: "sopa", tema: "cultura_arte" },
      sinopsis: "Un método bidireccional (Two-Way Bilingual Reader & Workbook) para aprender español o inglés a través de las 75 fábulas clásicas de Félix María de Samaniego. Presenta lectura paralela Español–Inglés, vocabulario clave y ejercicios de comprensión divididos en tres volúmenes progresivos.",
      caracteristicas: [
        "Volumen 1 (Fábulas 1–25), Volumen 2 (Fábulas 26–50) y Volumen 3 (Fábulas 51–75).",
        "Diseño bidireccional: ideal tanto para hispanohablantes que aprenden inglés como para angloparlantes que estudian español.",
        "Lectura comparada con vocabulario contextual y moralejas clásicas."
      ],
      extractoTitulo: "Muestra Bilingüe — La Cigarra y la Hormiga / The Cicada and the Ant",
      extracto: "«Cantando la Cigarra pasó el verano entero, sin hacer provisiones allá para el invierno... / Singing the whole summer through, the Cicada spent her days, making no provisions at all for the coming winter days...»"
    }
  ],

  autores: [
    {
      nombre: "Ruichis Lab",
      rol: "Sello Editorial & Laboratorio de Ingeniería Cognitiva",
      avatar: "🏛️",
      bio: "Proyecto editorial independiente con sede en Bogotá. Publica obras de productividad de alto apalancamiento ('Productividad Asimétrica' en español e inglés), cuadernos de entrenamiento mental ('Colección Letras y Retos') y ediciones bilingües Español–Inglés.",
      obrasDestacadas: [
        "Productividad Asimétrica (Español — ASIN: B0HD2MY2HN)",
        "Asymmetric Productivity (English — ASIN: B0HJ42QFCV)",
        "100 Grandes Sopas de Letras de Cultura General (Vol. I)",
        "100 Grandes Sopas de Letras de Biología (Vol. II)",
        "Learn Spanish / Aprende Inglés con / with Samaniego (Fábulas 1–75)"
      ]
    },
    {
      nombre: "Daemon Drew",
      rol: "Autor de Thriller Tecnológico & Ficción Especulativa",
      avatar: "🕵️‍♂️",
      bio: "Autor de la serie de techno-thrillers 'Corporate Silence', donde convergen el espionaje financiero, la ciberseguridad de alto nivel y la guerra algorítmica contemporánea.",
      obrasDestacadas: [
        "Corporate Silence — Book 1: Push (Español: B0HDQ91SD1 / Inglés: B0HDM455NT)",
        "Corporate Silence — Libro 2: Noise (Español: B0HKTLLGMM)"
      ]
    }
  ]
};
