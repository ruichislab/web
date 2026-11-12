#!/usr/bin/env node
// scripts/build-seo-enciclopedia.js
// Genera páginas HTML estáticas SEO-friendly para las 30 monografías de la Enciclopedia IA
// y actualiza pages/enciclopedia.html y sitemap.xml.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATOS_PATH = path.join(ROOT, 'src', 'js', 'enciclopedia-datos.js');
const IA_DIR = path.join(ROOT, 'src', 'modulos', 'ia');
const OUT_DIR = path.join(ROOT, 'enciclopedia');

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(DATOS_PATH, 'utf8'), ctx);
const articulos = ctx.window.ENCICLOPEDIA_IA_ARTICULOS || [];
const areas = ctx.window.ENCICLOPEDIA_IA_AREAS || [];
const areaById = Object.fromEntries(areas.map(a => [a.id, a]));
const artById = Object.fromEntries(articulos.map(a => [a.id, a]));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMd(text) {
  let out = escHtml(text);
  // Code inline
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold + italic
  out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links [label](target)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    let target = href.trim();
    if (/^[a-z0-9-]+\.md$/i.test(target)) {
      target = target.replace(/\.md$/i, '.html');
    } else if (/^file:\/\/.*\/([a-z0-9-]+)\.md$/i.test(target)) {
      const m = target.match(/\/([a-z0-9-]+)\.md$/i);
      if (m) target = m[1] + '.html';
    }
    const isExt = /^https?:\/\//i.test(target);
    return `<a href="${escHtml(target)}"${isExt ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  return out;
}

function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inList = false;
  let listTag = 'ul';
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (inList) {
      html.push(`</${listTag}>`);
      inList = false;
    }
  };
  const flushTable = () => {
    if (!inTable || !tableRows.length) return;
    const parseRow = r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    const header = parseRow(tableRows[0]);
    const bodyStart = tableRows.length > 1 && /^[\s|:-]+$/.test(tableRows[1]) ? 2 : 1;
    let t = '<div style="overflow-x:auto;margin:1.25rem 0;"><table style="width:100%;border-collapse:collapse;"><thead><tr>';
    header.forEach(h => { t += `<th style="text-align:left;padding:0.6rem;border-bottom:2px solid #D4AF37;">${inlineMd(h)}</th>`; });
    t += '</tr></thead><tbody>';
    for (let i = bodyStart; i < tableRows.length; i++) {
      const cols = parseRow(tableRows[i]);
      t += '<tr>';
      cols.forEach(c => { t += `<td style="padding:0.6rem;border-bottom:1px solid rgba(255,255,255,0.12);">${inlineMd(c)}</td>`; });
      t += '</tr>';
    }
    t += '</tbody></table></div>';
    html.push(t);
    inTable = false;
    tableRows = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      flushList();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuf = [];
      } else {
        html.push(`<pre style="padding:1rem;border-radius:8px;overflow-x:auto;background:#111827;color:#E5E7EB;"><code class="language-${escHtml(codeLang || 'text')}">${escHtml(codeBuf.join('\n'))}</code></pre>`);
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      flushTable();
      html.push('<hr style="border:none;border-top:1px solid rgba(212,175,55,0.25);margin:2rem 0;">');
      continue;
    }
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      flushList();
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      flushList();
      const lvl = hMatch[1].length;
      html.push(`<h${lvl}>${inlineMd(hMatch[2])}</h${lvl}>`);
      continue;
    }
    if (trimmed.startsWith('>')) {
      flushList();
      html.push(`<blockquote style="border-left:3px solid #D4AF37;padding:0.75rem 1rem;margin:1.25rem 0;background:rgba(212,175,55,0.08);border-radius:0 8px 8px 0;">${inlineMd(trimmed.replace(/^>\s*/, ''))}</blockquote>`);
      continue;
    }
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ulMatch || olMatch) {
      const nextTag = ulMatch ? 'ul' : 'ol';
      if (!inList || listTag !== nextTag) {
        flushList();
        inList = true;
        listTag = nextTag;
        html.push(`<${listTag}>`);
      }
      html.push(`<li>${inlineMd((ulMatch || olMatch)[1])}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${inlineMd(trimmed)}</p>`);
  }
  flushList();
  flushTable();
  return html.join('\n');
}

const today = '2026-11-12';
const generatedUrls = [];

for (const art of articulos) {
  const mdPath = path.join(IA_DIR, `${art.id}.md`);
  if (!fs.existsSync(mdPath)) continue;
  const md = fs.readFileSync(mdPath, 'utf8');
  const bodyHtml = mdToHtml(md);
  const area = areaById[art.area] || { nombre: art.area, icono: '🧠' };
  const url = `https://ruichislab.com/enciclopedia/${art.id}.html`;
  generatedUrls.push(url);

  const relLinks = (art.relacionados || [])
    .map(rid => artById[rid])
    .filter(Boolean)
    .map(r => `<li><a href="${r.id}.html">${escHtml(r.icono)} ${escHtml(r.titulo)}</a> — ${escHtml(r.resumen)}</li>`)
    .join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        'headline': art.titulo,
        'description': art.resumen,
        'inLanguage': 'es',
        'dateModified': today,
        'author': { '@type': 'Organization', 'name': 'Ruichis Lab', 'url': 'https://ruichislab.com/' },
        'publisher': { '@type': 'Organization', 'name': 'Ruichis Lab', 'url': 'https://ruichislab.com/' },
        'mainEntityOfPage': { '@type': 'WebPage', '@id': url }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://ruichislab.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Enciclopedia IA', 'item': 'https://ruichislab.com/pages/enciclopedia.html' },
          { '@type': 'ListItem', 'position': 3, 'name': art.titulo, 'item': url }
        ]
      }
    ]
  };

  const pageHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(art.titulo)} — Enciclopedia IA | Ruichis Lab</title>
  <meta name="description" content="${escHtml(art.resumen)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Ruichis Lab">
  <meta property="og:title" content="${escHtml(art.titulo)} — Enciclopedia IA | Ruichis Lab">
  <meta property="og:description" content="${escHtml(art.resumen)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="https://ruichislab.com/src/assets/covers/productividad-asimetrica-es.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escHtml(art.titulo)} | Ruichis Lab">
  <meta name="twitter:description" content="${escHtml(art.resumen)}">
  <link rel="stylesheet" href="../src/estilos/editorial.css">
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <header style="border-bottom:1px solid rgba(212,175,55,0.25);padding:1rem 1.5rem;">
    <div style="max-width:860px;margin:0 auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;">
      <a href="../" style="font-weight:800;letter-spacing:0.08em;text-decoration:none;color:#D4AF37;">RUICHIS LAB</a>
      <nav style="display:flex;gap:1rem;font-size:0.9rem;">
        <a href="../pages/enciclopedia.html">Índice Enciclopedia (30)</a>
        <a href="../#enciclopedia-ia">Lector Interactivo</a>
        <a href="../#gimnasio-mental">Sudoku y Sopas Gratis</a>
      </nav>
    </div>
  </header>
  <main class="container" style="max-width:860px;margin:2.5rem auto;padding:0 1.5rem 3rem;line-height:1.75;">
    <p style="font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;color:#D4AF37;font-weight:700;">
      ${escHtml(area.icono)} ${escHtml(area.nombre)} • NIVEL: ${escHtml(art.nivel.toUpperCase())} • LECTURA: ${escHtml(art.tiempo)}
    </p>
    <article>
      ${bodyHtml}
    </article>
    ${relLinks ? `<section style="margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(212,175,55,0.25);"><h2>Seguir explorando en la Enciclopedia IA</h2><ul>${relLinks}</ul></section>` : ''}
    <p style="margin-top:2rem;">
      <a href="../#enciclopedia-ia" class="btn-hero-primary" style="display:inline-block;padding:0.85rem 1.5rem;text-decoration:none;">📚 Abrir en el Lector Interactivo de Ruichis Lab →</a>
    </p>
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(OUT_DIR, `${art.id}.html`), pageHtml, 'utf8');
}

// Actualizar pages/enciclopedia.html con enlaces reales a las 30 páginas + FAQPage
const listItemsHtml = articulos.map(a =>
  `      <li><a href="../enciclopedia/${a.id}.html">${escHtml(a.icono)} <strong>${escHtml(a.titulo)}</strong></a> — ${escHtml(a.resumen)}</li>`
).join('\n');

const encIndexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enciclopedia Universal de Inteligencia Artificial (30 Monografías) — Ruichis Lab</title>
  <meta name="description" content="Enciclopedia Universal de Inteligencia Artificial de Ruichis Lab: 30 monografías verificadas y explicadas en lenguaje claro para cualquier persona. Fundamentos, Machine Learning, Transformers, LLMs, RAG, Agentes, Medicina, Robótica y Seguridad.">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="https://ruichislab.com/pages/enciclopedia.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Ruichis Lab">
  <meta property="og:title" content="Enciclopedia Universal de IA — 30 Monografías Verificadas | Ruichis Lab">
  <meta property="og:description" content="Aprende Inteligencia Artificial con explicaciones humanas, claras y 100% verificadas: desde Machine Learning hasta Transformers, LLMs, Modelos Locales y Ética.">
  <meta property="og:url" content="https://ruichislab.com/pages/enciclopedia.html">
  <link rel="stylesheet" href="../src/estilos/editorial.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Enciclopedia Universal de Inteligencia Artificial — Ruichis Lab",
    "url": "https://ruichislab.com/pages/enciclopedia.html",
    "description": "30 monografías verificadas sobre Inteligencia Artificial explicadas en lenguaje claro.",
    "inLanguage": "es",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Ruichis Lab",
      "url": "https://ruichislab.com/"
    }
  }
  </script>
</head>
<body>
  <main class="container" style="max-width:860px;margin:3rem auto;padding:2rem;line-height:1.7;">
    <p style="font-size:0.8rem;letter-spacing:0.14em;text-transform:uppercase;color:#D4AF37;font-weight:700;">RUICHIS LAB • ENCICLOPEDIA UNIVERSAL DE IA</p>
    <h1>Enciclopedia Universal de Inteligencia Artificial</h1>
    <p>Explora nuestra biblioteca técnica gratuita con <strong>30 monografías verificadas</strong> y explicadas en lenguaje claro para cualquier persona: fundamentos, Machine Learning, Redes Neuronales, Transformers, LLMs, RAG, Agentes Autónomos, Medicina, Robótica, Modelos Locales y Seguridad Digital.</p>
    <p style="margin:1.5rem 0;">
      <a href="../#enciclopedia-ia" class="btn-hero-primary" style="display:inline-block;padding:0.85rem 1.5rem;text-decoration:none;">📚 Abrir la Enciclopedia Interactiva →</a>
    </p>
    <h2>Las 30 Monografías Verificadas</h2>
    <ul>
${listItemsHtml}
    </ul>
  </main>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'pages', 'enciclopedia.html'), encIndexHtml, 'utf8');

// Regenerar sitemap.xml con las 33 URLs limpias
const sitemapLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  `  <url><loc>https://ruichislab.com/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  `  <url><loc>https://ruichislab.com/pages/gimnasio-mental.html</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>https://ruichislab.com/pages/enciclopedia.html</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
];
for (const u of generatedUrls) {
  sitemapLines.push(`  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
}
sitemapLines.push('</urlset>');
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapLines.join('\n') + '\n', 'utf8');

console.log(`Generated ${generatedUrls.length} SEO encyclopedia pages and updated sitemap.xml (${generatedUrls.length + 3} URLs).`);
