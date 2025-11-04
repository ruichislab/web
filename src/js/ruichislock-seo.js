// Metadatos SEO y configuración para Ruichis Lock
const RuichisLockSEO = {
  title: "Ruichis Lock - Cifrado AES-256 para Windows | Ruichis Lab",
  description: "Descubre Ruichis Lock: aplicación profesional de cifrado AES-256 para Windows, disponible en Microsoft Store. Protege tus datos con seguridad de nivel empresarial.",
  keywords: [
    "cifrado AES-256",
    "seguridad Windows",
    "Ruichis Lock",
    "Microsoft Store",
    "cifrado archivos",
    "seguridad datos",
    "aplicación Windows",
    "protección digital",
    "software seguridad",
    "cifrado profesional"
  ],
  openGraph: {
    title: "Ruichis Lock - Cifrado AES-256 para Windows",
    description: "Protege tus datos con cifrado AES-256 profesional. Disponible en Microsoft Store para Windows 10/11.",
    type: "website",
    url: "https://ruichislab.com/ruichis-lock",
    image: "https://ruichislab.com/assets/ruichis-lock-og.jpg",
    site_name: "Ruichis Lab"
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruichis Lock - Cifrado AES-256 para Windows",
    description: "Aplicación profesional de cifrado disponible en Microsoft Store 🔒💻",
    image: "https://ruichislab.com/assets/ruichis-lock-twitter.jpg"
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ruichis Lock",
    "description": "Aplicación profesional de cifrado AES-256 para Windows, disponible en Microsoft Store",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Windows 10, Windows 11",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "developer": {
      "@type": "Organization",
      "name": "Ruichis Lab",
      "url": "https://ruichislab.com"
    },
    "downloadUrl": "https://www.microsoft.com/store/apps/ruichis-lock",
    "softwareVersion": "1.0.0",
    "releaseNotes": "Primera versión con cifrado AES-256 y interfaz moderna para Windows",
    "screenshot": "https://ruichislab.com/assets/ruichis-lock-screenshot.jpg"
  }
};

// Función para aplicar metadatos SEO
function applyRuichisLockSEO() {
  // Actualizar título
  document.title = RuichisLockSEO.title;
  
  // Actualizar meta description
  updateMetaTag('description', RuichisLockSEO.description);
  
  // Actualizar keywords
  updateMetaTag('keywords', RuichisLockSEO.keywords.join(', '));
  
  // Open Graph tags
  updateMetaTag('og:title', RuichisLockSEO.openGraph.title, 'property');
  updateMetaTag('og:description', RuichisLockSEO.openGraph.description, 'property');
  updateMetaTag('og:type', RuichisLockSEO.openGraph.type, 'property');
  updateMetaTag('og:url', RuichisLockSEO.openGraph.url, 'property');
  updateMetaTag('og:image', RuichisLockSEO.openGraph.image, 'property');
  updateMetaTag('og:site_name', RuichisLockSEO.openGraph.site_name, 'property');
  
  // Twitter Cards
  updateMetaTag('twitter:card', RuichisLockSEO.twitter.card, 'name');
  updateMetaTag('twitter:title', RuichisLockSEO.twitter.title, 'name');
  updateMetaTag('twitter:description', RuichisLockSEO.twitter.description, 'name');
  updateMetaTag('twitter:image', RuichisLockSEO.twitter.image, 'name');
  
  // Schema.org JSON-LD
  updateSchemaMarkup(RuichisLockSEO.schema);
}

function updateMetaTag(name, content, attribute = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function updateSchemaMarkup(schema) {
  // Remover schema existente
  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }
  
  // Agregar nuevo schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
}

// Función para restaurar metadatos originales
function restoreOriginalSEO() {
  document.title = "Ruichis Lab | Tecnología Modular Profesional";
  updateMetaTag('description', "Ruichis Lab: Soluciones de tecnología modular para Windows. Aplicaciones especializadas incluyendo Ruichis Lock con cifrado AES-256, disponibles en Microsoft Store.");
  updateMetaTag('keywords', "modular apps, Ruichis Lab, AES-256 encryption, Windows applications, Microsoft Store, security software, digital tools");
  
  // Remover metadatos específicos de Ruichis Lock
  const lockSpecificMetas = [
    'og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:site_name',
    'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
  ];
  
  lockSpecificMetas.forEach(meta => {
    const element = document.querySelector(`meta[property="${meta}"], meta[name="${meta}"]`);
    if (element) {
      element.remove();
    }
  });
  
  // Remover schema específico
  const schemaElement = document.querySelector('script[type="application/ld+json"]');
  if (schemaElement) {
    schemaElement.remove();
  }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RuichisLockSEO,
    applyRuichisLockSEO,
    restoreOriginalSEO
  };
} else {
  window.RuichisLockSEO = RuichisLockSEO;
  window.applyRuichisLockSEO = applyRuichisLockSEO;
  window.restoreOriginalSEO = restoreOriginalSEO;
}
