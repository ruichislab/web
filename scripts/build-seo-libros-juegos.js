#!/usr/bin/env node
// scripts/build-seo-libros-juegos.js
// Genera páginas HTML estáticas SEO para los 4 libros en Amazon (libros/*.html),
// 2 landing pages de juegos de alto tráfico (juegos/*.html) y actualiza sitemap.xml.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CAT_PATH = path.join(ROOT, 'src', 'js', 'catalogo-datos.js');
const ENC_PATH = path.join(ROOT, 'src', 'js', 'enciclopedia-datos.js');
const LIBROS_DIR = path.join(ROOT, 'libros');
const JUEGOS_DIR = path.join(ROOT, 'juegos');

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(CAT_PATH, 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(ENC_PATH, 'utf8'), ctx);

const libros = (ctx.window.RUICHIS_CATALOGO && ctx.window.RUICHIS_CATALOGO.libros) || [];
const articulos = ctx.window.ENCICLOPEDIA_IA_ARTICULOS || [];

if (!fs.existsSync(LIBROS_DIR)) fs.mkdirSync(LIBROS_DIR, { recursive: true });
if (!fs.existsSync(JUEGOS_DIR)) fs.mkdirSync(JUEGOS_DIR, { recursive: true });

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const today = '2026-11-12';
const bookUrls = [];

for (const libro of libros) {
  const url = `https://ruichislab.com/libros/${libro.id}.html`;
  bookUrls.push(url);
  const imgUrl = `https://ruichislab.com/${libro.portada}`;
  const langCode = libro.idiomaBadge === 'EN' ? 'en' : 'es';

  let hreflang = '';
  if (libro.id === 'productividad-asimetrica-es') {
    hreflang = `\n  <link rel="alternate" hreflang="es" href="https://ruichislab.com/libros/productividad-asimetrica-es.html">\n  <link rel="alternate" hreflang="en" href="https://ruichislab.com/libros/asymmetric-productivity-en.html">`;
  } else if (libro.id === 'asymmetric-productivity-en') {
    hreflang = `\n  <link rel="alternate" hreflang="en" href="https://ruichislab.com/libros/asymmetric-productivity-en.html">\n  <link rel="alternate" hreflang="es" href="https://ruichislab.com/libros/productividad-asimetrica-es.html">`;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Book',
        'name': libro.titulo,
        'alternateName': libro.subtitulo,
        'description': libro.sinopsis,
        'inLanguage': langCode,
        'bookFormat': 'https://schema.org/Paperback',
        'image': imgUrl,
        'url': url,
        'sameAs': libro.amazonUrl,
        'author': { '@type': 'Organization', 'name': 'Ruichis Lab', 'url': 'https://ruichislab.com/' },
        'publisher': { '@type': 'Organization', 'name': 'Ruichis Lab', 'url': 'https://ruichislab.com/' }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://ruichislab.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Libros', 'item': 'https://ruichislab.com/libros/index.html' },
          { '@type': 'ListItem', 'position': 3, 'name': libro.titulo, 'item': url }
        ]
      }
    ]
  };

  const featuresHtml = (libro.caracteristicas || []).map(c => `<li>${esc(c)}</li>`).join('\n      ');
  const otherBooksHtml = libros
    .filter(b => b.id !== libro.id)
    .map(b => `<li><a href="${b.id}.html"><strong>${esc(b.titulo)}</strong></a> — ${esc(b.subtitulo)}</li>`)
    .join('\n      ');

  const html = `<!DOCTYPE html>
<html lang="${langCode}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(libro.titulo)} — Libro en Amazon | Ruichis Lab</title>
  <meta name="description" content="${esc(libro.descripcionCorta)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${url}">${hreflang}
  <meta property="og:type" content="book">
  <meta property="og:site_name" content="Ruichis Lab">
  <meta property="og:title" content="${esc(libro.titulo)} — ${esc(libro.subtitulo)}">
  <meta property="og:description" content="${esc(libro.descripcionCorta)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${imgUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(libro.titulo)} | Ruichis Lab">
  <meta name="twitter:description" content="${esc(libro.descripcionCorta)}">
  <meta name="twitter:image" content="${imgUrl}">
  <link rel="stylesheet" href="../src/estilos/variables.css">
  <link rel="stylesheet" href="../src/estilos/components.css">
  <link rel="stylesheet" href="../src/estilos/modules.css">
  <link rel="stylesheet" href="../src/estilos/main.css">
  <link rel="stylesheet" href="../src/estilos/editorial.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <header style="border-bottom:1px solid rgba(212,175,55,0.25);padding:1rem 1.5rem;">
    <div style="max-width:860px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;">
      <a href="../" style="font-weight:800;letter-spacing:0.08em;text-decoration:none;color:#D4AF37;">RUICHIS LAB</a>
      <nav style="display:flex;gap:1rem;font-size:0.9rem;">
        <a href="index.html">Catálogo de Libros</a>
        <a href="../pages/gimnasio-mental.html">Gimnasio Mental Gratis</a>
        <a href="../pages/enciclopedia.html">Enciclopedia IA</a>
      </nav>
    </div>
  </header>
  <main class="container" style="max-width:860px;margin:2.5rem auto;padding:0 1.5rem 3rem;line-height:1.75;">
    <p style="font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;font-weight:700;">
      ${esc(libro.categoriaLabel)} • ${esc(libro.idioma)} • ${esc(libro.formato)}
    </p>
    <h1>${esc(libro.titulo)}</h1>
    <p style="font-size:1.15rem;opacity:0.9;"><strong>${esc(libro.subtitulo)}</strong></p>
    <div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:flex-start;margin:1.5rem 0;">
      <img src="../${esc(libro.portada)}" alt="Portada de ${esc(libro.titulo)}" width="240" height="360" style="border-radius:10px;object-fit:cover;border:1px solid rgba(212,175,55,0.35);">
      <div style="flex:1;min-width:260px;">
        <h2>Sinopsis</h2>
        <p>${esc(libro.sinopsis)}</p>
        <p style="margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:0.75rem;">
          <a href="${esc(libro.amazonUrl)}" target="_blank" rel="noopener noreferrer" class="btn-hero-primary" style="display:inline-block;padding:0.85rem 1.4rem;text-decoration:none;">🛒 Comprar en Amazon →</a>
          <a href="../#gimnasio-mental" style="display:inline-block;padding:0.85rem 1.2rem;border:1px solid #D4AF37;border-radius:8px;text-decoration:none;">🧩 Probar Gimnasio Mental Gratis</a>
        </p>
      </div>
    </div>
    <h2>Qué incluye esta edición</h2>
    <ul>
      ${featuresHtml}
    </ul>
    <h2>${esc(libro.extractoTitulo)}</h2>
    <blockquote style="border-left:3px solid #D4AF37;padding:0.85rem 1.2rem;background:rgba(212,175,55,0.08);border-radius:0 8px 8px 0;">
      ${esc(libro.extracto)}
    </blockquote>
    <section style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(212,175,55,0.25);">
      <h2>Otros libros de Ruichis Lab</h2>
      <ul>
      ${otherBooksHtml}
      </ul>
    </section>
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(LIBROS_DIR, `${libro.id}.html`), html, 'utf8');
}

// libros/index.html
const librosIndexCards = libros.map(b =>
  `      <li><a href="${b.id}.html"><strong>${esc(b.titulo)}</strong></a> (${esc(b.idioma)}) — ${esc(b.descripcionCorta)}</li>`
).join('\n');

const librosIndexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Catálogo de Libros en Amazon — Productividad y Sopas de Letras | Ruichis Lab</title>
  <meta name="description" content="Catálogo oficial de libros de Ruichis Lab en Amazon: Productividad Asimétrica (ES/EN) y Colección Letras y Retos (100 Grandes Sopas de Letras de Cultura General y Biología).">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="https://ruichislab.com/libros/index.html">
  <link rel="stylesheet" href="../src/estilos/variables.css">
  <link rel="stylesheet" href="../src/estilos/components.css">
  <link rel="stylesheet" href="../src/estilos/modules.css">
  <link rel="stylesheet" href="../src/estilos/main.css">
  <link rel="stylesheet" href="../src/estilos/editorial.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <main class="container" style="max-width:860px;margin:3rem auto;padding:2rem;line-height:1.7;">
    <p style="font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;font-weight:700;">RUICHIS LAB • CATÁLOGO EDITORIAL</p>
    <h1>Libros de Ruichis Lab en Amazon</h1>
    <p>Obras independientes disponibles en Kindle eBook y Tapa Blanda, diseñadas para potenciar el foco profundo y el entrenamiento cognitivo.</p>
    <ul>
${librosIndexCards}
    </ul>
    <p style="margin-top:1.5rem;"><a href="../" class="btn-hero-primary" style="display:inline-block;padding:0.85rem 1.5rem;text-decoration:none;">← Volver a Ruichis Lab</a></p>
  </main>
</body>
</html>
`;
fs.writeFileSync(path.join(LIBROS_DIR, 'index.html'), librosIndexHtml, 'utf8');

// Landing pages de juegos de alto tráfico
const juegosPages = [
  {
    file: 'sudoku-online-gratis.html',
    title: 'Sudoku Online Gratis sin Anuncios (9×9, Reto del Día y Pistas) | Ruichis Lab',
    desc: 'Juega Sudoku online gratis y sin anuncios en Ruichis Lab. Tableros 9×9 con solución única, Reto del Día, notas a lápiz, entrada rápida, modo 3 Vidas y pistas lógicas explicadas.',
    h1: 'Sudoku Maestro Online Gratis y Sin Anuncios',
    intro: 'Entrena tu deducción lógica con nuestro Sudoku 9×9 gratuito, libre de publicidad invasiva, rastreadores y registros obligatorios. Funciona también sin internet tras instalarlo como app.',
    bullets: [
      '<strong>Reto del Día:</strong> Un tablero diario compartido para mantener tu racha cognitiva.',
      '<strong>4 Niveles Reales:</strong> Fácil, Medio, Difícil y Maestro con solución única verificada.',
      '<strong>Herramientas Pro:</strong> Notas a lápiz inteligentes, modo entrada rápida, detección de conflictos y pistas lógicas que explican el porqué de cada número.',
      '<strong>Modo 3 Vidas y Estadísticas:</strong> Mide tu mejor tiempo, precisión y victorias guardadas localmente.'
    ],
    faq: [
      { q: '¿Necesito descargar algo para jugar Sudoku gratis en Ruichis Lab?', a: 'No. Puedes jugar directamente desde el navegador en móvil o PC, o instalar la app PWA con un clic para jugar sin conexión.' },
      { q: '¿Los tableros de Sudoku tienen solución única?', a: 'Sí. Cada tablero se genera y valida algorítmicamente para garantizar una única solución lógica sin necesidad de adivinar.' }
    ]
  },
  {
    file: 'sopas-de-letras-gratis.html',
    title: 'Sopas de Letras Online Gratis en 8 Direcciones (Cultura y Biología) | Ruichis Lab',
    desc: 'Juega Sopas de Letras online gratis sin anuncios en Ruichis Lab: 8 direcciones, 5 categorías temáticas de Cultura General y Biología, tableros 12×12 a 16×16 y Sopa del Día.',
    h1: 'Sopas de Letras Pro Online Gratis en 8 Direcciones',
    intro: 'Ejercita tu rastreo visual, vocabulario y memoria con tableros dinámicos inspirados en la Colección Letras y Retos de Ruichis Lab. Sin anuncios, sin esperas y apto para jugar offline.',
    bullets: [
      '<strong>8 Direcciones Reales:</strong> Horizontal, vertical, diagonal y palabras invertidas.',
      '<strong>5 Categorías Temáticas (100 palabras seleccionadas):</strong> Historia y Civilizaciones, Arte y Filosofía, Ciencia y Astronomía, Biología Celular y Ecosistemas.',
      '<strong>Tamaños Adaptables:</strong> Tableros 12×12, 14×14, 16×16 y desafío especial Sopa del Día.',
      '<strong>Glosario y Modo Impresión:</strong> Cada palabra encontrada incluye su definición editorial y puedes imprimir tableros limpios en papel.'
    ],
    faq: [
      { q: '¿Las palabras de la sopa de letras pueden aparecer al revés o en diagonal?', a: 'Sí. Sopas de Letras Pro distribuye las palabras en las 8 direcciones posibles, igual que nuestros libros impresos en Amazon.' },
      { q: '¿Puedo imprimir las sopas de letras gratis?', a: 'Sí. Incluye un botón de Modo Impresión optimizado para papel con contraste limpio.' }
    ]
  }
];

const juegosUrls = [];
for (const j of juegosPages) {
  const url = `https://ruichislab.com/juegos/${j.file}`;
  juegosUrls.push(url);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': j.h1,
        'url': 'https://ruichislab.com/#gimnasio-mental',
        'applicationCategory': 'GameApplication',
        'operatingSystem': 'Web',
        'inLanguage': 'es',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'publisher': { '@type': 'Organization', 'name': 'Ruichis Lab', 'url': 'https://ruichislab.com/' }
      },
      {
        '@type': 'FAQPage',
        'mainEntity': j.faq.map(item => ({
          '@type': 'Question',
          'name': item.q,
          'acceptedAnswer': { '@type': 'Answer', 'text': item.a }
        }))
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(j.title)}</title>
  <meta name="description" content="${esc(j.desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Ruichis Lab">
  <meta property="og:title" content="${esc(j.title)}">
  <meta property="og:description" content="${esc(j.desc)}">
  <meta property="og:url" content="${url}">
  <link rel="stylesheet" href="../src/estilos/variables.css">
  <link rel="stylesheet" href="../src/estilos/components.css">
  <link rel="stylesheet" href="../src/estilos/modules.css">
  <link rel="stylesheet" href="../src/estilos/main.css">
  <link rel="stylesheet" href="../src/estilos/editorial.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <main class="container" style="max-width:860px;margin:3rem auto;padding:2rem;line-height:1.75;">
    <p style="font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;font-weight:700;">RUICHIS LAB • GIMNASIO MENTAL GRATIS</p>
    <h1>${esc(j.h1)}</h1>
    <p>${esc(j.intro)}</p>
    <p style="margin:1.5rem 0;">
      <a href="../#gimnasio-mental" class="btn-hero-primary" style="display:inline-block;padding:0.9rem 1.6rem;text-decoration:none;">▶ Jugar Ahora Gratis Sin Anuncios →</a>
    </p>
    <h2>Características destacadas</h2>
    <ul>
      ${j.bullets.map(b => `<li>${b}</li>`).join('\n      ')}
    </ul>
    <h2>Preguntas frecuentes</h2>
    ${j.faq.map(item => `<h3>${esc(item.q)}</h3><p>${esc(item.a)}</p>`).join('\n    ')}
  </main>
</body>
</html>
`;
  fs.writeFileSync(path.join(JUEGOS_DIR, j.file), html, 'utf8');
}

// Reconstruir sitemap.xml completo con todas las URLs (Home + Pages + Libros + Juegos + 30 Enciclopedia)
const encUrls = articulos.map(a => `https://ruichislab.com/enciclopedia/${a.id}.html`);
const sitemapLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>https://ruichislab.com/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  `  <url><loc>https://ruichislab.com/pages/gimnasio-mental.html</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>https://ruichislab.com/pages/enciclopedia.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>https://ruichislab.com/libros/index.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
];
for (const u of juegosUrls) {
  sitemapLines.push(`  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
}
for (const u of bookUrls) {
  sitemapLines.push(`  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
}
for (const u of encUrls) {
  sitemapLines.push(`  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
}
sitemapLines.push('</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapLines.join('\n') + '\n', 'utf8');

console.log(`Generated ${bookUrls.length} book pages, ${juegosUrls.length} game landing pages, and updated sitemap.xml (${4 + juegosUrls.length + bookUrls.length + encUrls.length} URLs).`);
