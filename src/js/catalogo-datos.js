// src/js/catalogo-datos.js
// Catálogo Oficial Verificado — Ruichis Lab (Amazon KDP)

window.RUICHIS_CATALOGO = {
  editorialInfo: {
    nombre: "Ruichis Lab",
    lema: "Productividad Asimétrica & Colección Letras y Retos",
    ciudad: "Bogotá, Colombia",
    distribucion: "Amazon KDP (Kindle eBook & Tapa Blanda)",
    amazonAuthorSearch: "https://www.amazon.com/s?k=Ruichis+Lab"
  },

  libros: [
    // 1. PRODUCTIVIDAD ASIMÉTRICA (ESPAÑOL)
    {
      id: "productividad-asimetrica-es",
      titulo: "Productividad Asimétrica",
      subtitulo: "El arte de hacer en dos horas lo que a otros les lleva una semana",
      descripcionCorta: "Aislamiento cognitivo profundo, apalancamiento algorítmico y sistemas modulares para multiplicar el impacto en bloques de 120 minutos.",
      autor: "Ruichis Lab",
      sello: "Ruichis Lab",
      categoria: "productividad",
      categoriaLabel: "Productividad Asimétrica",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Kindle eBook & Tapa Blanda (5\" × 8\")",
      paginas: "Formato Bolsillo 5\" × 8\"",
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
      titulo: "Asymmetric Productivity",
      subtitulo: "The Art of Doing in Two Hours What Takes Others a Week",
      descripcionCorta: "The international English edition on cognitive leverage, autonomous workflows, and eliminating attentional residue for high-output creators.",
      autor: "Ruichis Lab",
      sello: "Ruichis Lab",
      categoria: "productividad",
      categoriaLabel: "Productividad Asimétrica",
      idioma: "Inglés",
      idiomaBadge: "EN",
      formato: "Kindle eBook & Paperback (5\" × 8\")",
      paginas: "Pocket Edition 5\" × 8\"",
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
      subtitulo: "Colección Letras y Retos (Vol. I) • Historia • Ciencia • Arte • Geografía • Filosofía",
      descripcionCorta: "100 desafíos temáticos únicos con 1.200 palabras seleccionadas en 8 direcciones dinámicas. Formato bolsillo con letra clara y soluciones al final.",
      autor: "Ruichis Lab",
      sello: "Colección Letras y Retos",
      categoria: "pasatiempos",
      categoriaLabel: "Colección Letras y Retos",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Edición Bolsillo 5\" × 8\" • 132 págs.",
      paginas: "132 páginas • Letra Clara",
      portada: "src/assets/covers/100-sopas-cultura-general.jpg",
      portadaWrap: "src/assets/covers/100-sopas-cultura-wrap.jpg",
      destacado: true,
      badgeEspecial: "VOLUMEN I • 1.200 PALABRAS",
      asin: "VOL-1-CULTURA",
      amazonUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      juegoRelacionado: { tipo: "sopa", tema: "cultura_historia" },
      sinopsis: "Desafía tu mente y amplía tu vocabulario con 100 tableros temáticos cuidadosamente diseñados en 8 direcciones. Desde las grandes civilizaciones de la historia y los hitos de la ciencia hasta el arte universal, la geografía del mundo y las corrientes filosóficas.",
      caracteristicas: [
        "100 desafíos temáticos únicos con 12 palabras por tablero (1.200 términos culturales).",
        "Palabras distribuidas en 8 direcciones: horizontal, vertical, diagonal e invertidas.",
        "Edición de bolsillo 5\" × 8\" (132 páginas) con tipografía de letra clara y alto contraste.",
        "Incluye solucionario completo e ilustrado en la sección final del libro."
      ],
      extractoTitulo: "Presentación de la Colección Letras y Retos (Vol. I)",
      extracto: "«Entrenar la atención sostenida en una época dominada por la fragmentación digital es un acto de resistencia cognitiva. Cada uno de los 100 tableros de este primer volumen ha sido construido como una expedición por el saber humano: Historia, Ciencia, Arte, Geografía y Filosofía.»"
    },

    // 4. 100 GRANDES SOPAS DE LETRAS DE BIOLOGÍA
    {
      id: "sopas-biologia",
      titulo: "100 Grandes Sopas de Letras de Biología",
      subtitulo: "Colección Letras y Retos (Vol. II) • Célula • Genética • Botánica • Zoología • Evolución",
      descripcionCorta: "100 desafíos especializados en las ciencias de la vida. 1.200 términos científicos rigurosos en matrices cómodas sin fatiga visual.",
      autor: "Ruichis Lab",
      sello: "Colección Letras y Retos",
      categoria: "pasatiempos",
      categoriaLabel: "Colección Letras y Retos",
      idioma: "Español",
      idiomaBadge: "ES",
      formato: "Edición Bolsillo 5\" × 8\" • 132 págs.",
      paginas: "132 páginas • Letra Clara",
      portada: "src/assets/covers/100-sopas-biologia.jpg",
      portadaWrap: "src/assets/covers/100-sopas-biologia-wrap.jpg",
      destacado: true,
      badgeEspecial: "VOLUMEN II • CIENCIAS BIOLÓGICAS",
      asin: "VOL-2-BIOLOGIA",
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
    }
  ],

  acercaDe: {
    nombre: "Ruichis Lab",
    subtitulo: "Ingeniería Cognitiva, Productividad & Entretenimiento Lógico",
    ciudad: "Bogotá, Colombia",
    descripcion: "Ruichis Lab es un proyecto independiente enfocado en la creación de herramientas de alto apalancamiento mental. Desde publicaciones editoriales publicadas en Amazon KDP hasta utilidades de software como Ruichis Lock (cifrado AES-256) y RuichisLab Book Ranker para autores, cada desarrollo busca maximizar la claridad, el foco profundo y la soberanía del tiempo.",
    pilares: [
      {
        icono: "⚡",
        titulo: "Productividad Asimétrica",
        desc: "Sistemas para concentrar semanas de trabajo reactivo en bloques de foco puro de dos horas."
      },
      {
        icono: "🧩",
        titulo: "Entrenamiento Mental",
        desc: "Pasatiempos estructurados con algoritmos balanceados para cultivar la atención sostenida."
      },
      {
        icono: "🌐",
        titulo: "Publicación Global",
        desc: "Distribución internacional en papel y digital a través de Amazon Kindle Direct Publishing."
      }
    ]
  }
};
