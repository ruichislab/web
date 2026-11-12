// src/js/seo-dynamic.js — Actualización dinámica de metadatos SEO al navegar en la SPA
(function () {
  'use strict';

  const META_POR_MODULO = {
    'Inicio': {
      title: 'Ruichis Lab | Libros en Amazon, Productividad Asimétrica & Sudoku Online Gratis',
      description: 'Ruichis Lab: Editorial independiente en Amazon (Productividad Asimétrica, Asymmetric Productivity, 100 Grandes Sopas de Letras) y Gimnasio Mental gratuito sin anuncios.'
    },
    'Gimnasio Mental': {
      title: 'Sudoku Online Gratis sin Anuncios y Sopas de Letras Pro | Ruichis Lab',
      description: 'Juega Sudoku Maestro 9×9 gratis (Reto del Día, notas a lápiz, pistas lógicas) y Sopas de Letras Pro en 8 direcciones sin publicidad ni registro.'
    },
    'Enciclopedia IA': {
      title: 'Enciclopedia Universal de IA (30 Monografías Verificadas) | Ruichis Lab',
      description: 'Aprende Inteligencia Artificial en lenguaje claro y 100% verificado: 30 monografías sobre Machine Learning, Transformers, LLMs, RAG, Agentes, Medicina y Seguridad.'
    },
    'Herramientas Web': {
      title: 'Herramientas Web Asimétricas & Productividad | Ruichis Lab',
      description: 'Utilidades web gratuitas y enfocadas en la privacidad y concentración profunda desarrolladas por Ruichis Lab.'
    },
    'Filosofia': {
      title: 'Filosofía de Atención y Foco Profundo | Ruichis Lab',
      description: 'Por qué construimos libros y juegos sin anuncios ni algoritmos adictivos para devolver el control cognitivo.'
    },
    'Contacto': {
      title: 'Contacto Editorial & Proyectos | Ruichis Lab',
      description: 'Contacta con Ruichis Lab en contacto@ruichislab.com para colaboraciones editoriales, software o consultas sobre nuestras publicaciones.'
    }
  };

  function updateMeta(title, description) {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', title);
    }
    if (description) {
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', description);
    }
  }

  document.addEventListener('modulo:cargado', function (e) {
    const nombre = e && e.detail && e.detail.nombre;
    if (nombre && META_POR_MODULO[nombre]) {
      updateMeta(META_POR_MODULO[nombre].title, META_POR_MODULO[nombre].description);
    }
  });

  window.RuichisSEO = { updateMeta: updateMeta };
})();
