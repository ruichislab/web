// src/app.js
// Orquestador Principal de Ruichis Lab & Gimnasio Mental SPA

const agente = new window.AgenteModular({ contenedor: '#main .content-wrapper', logging: false });

let activeModuloName = 'Inicio';
let currentCatalogFilter = 'todos';
let currentCatalogSearch = '';
let featuredShowcaseIndex = 0;

// --- FUNCIÓN DE INICIALIZACIÓN DE LA PORTADA EDITORIAL ---
function initEditorialHome(contenedor) {
  const catalogData = window.RUICHIS_CATALOGO;
  if (!catalogData) return;

  // 1. Inicializar Vitrina Interactiva 3D del Hero
  initHeroShowcase(catalogData.libros);

  // 2. Renderizar Catálogo de 5 Libros Verificados y conectar filtros/búsqueda
  renderCatalogBooks(catalogData.libros);
  initCatalogFilters(catalogData.libros);

  // 3. Inicializar Gimnasio Mental (Sopa de Letras + Sudoku Maestro)
  if (window.GimnasioMental) {
    window.gimnasioInstance = new window.GimnasioMental();
    window.gimnasioInstance.init();
  }

  // 5. Botón Política de Privacidad RuichisLab Book Ranker
  const btnPrivacy = contenedor.querySelector('#btn-open-privacy-modal');
  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', () => openPrivacyPolicyModal());
  }

  // 6. Botones de scroll interno del Hero
  contenedor.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-scroll-to');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 7. Botones de acceso rápido del Hero para jugar Sopa de Letras o Sudoku inmediatamente
  contenedor.querySelectorAll('[data-quick-play]').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameType = btn.getAttribute('data-quick-play');
      const gimSection = document.getElementById('gimnasio-mental');
      if (gimSection) {
        gimSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.gimnasioInstance && gameType) {
        window.gimnasioInstance.switchGame(gameType);
      }
    });
  });
}

// --- 1. VITRINA INTERACTIVA 3D DEL HERO ---
function initHeroShowcase(libros) {
  const destacados = libros.filter(b => b.destacado);
  if (destacados.length === 0) return;

  const thumbsContainer = document.getElementById('showcase-thumbs-container');
  const prevBtn = document.getElementById('showcase-prev-btn');
  const nextBtn = document.getElementById('showcase-next-btn');
  if (!thumbsContainer) return;

  const updateShowcase = (idx) => {
    featuredShowcaseIndex = (idx + destacados.length) % destacados.length;
    const book = destacados[featuredShowcaseIndex];
    if (!book) return;

    const badgeEl = document.getElementById('showcase-badge');
    const langEl = document.getElementById('showcase-lang');
    const imgEl = document.getElementById('showcase-cover-img');
    const titleEl = document.getElementById('showcase-title');
    const authorEl = document.getElementById('showcase-author');
    const descEl = document.getElementById('showcase-desc');
    const btnFicha = document.getElementById('showcase-btn-ficha');
    const btnAmazon = document.getElementById('showcase-btn-amazon');
    const coverTrigger = document.getElementById('showcase-cover-trigger');

    if (badgeEl) badgeEl.textContent = `★ ${book.badgeEspecial || book.categoriaLabel}`;
    if (langEl) langEl.textContent = `${book.idiomaBadge} • KDP`;
    if (imgEl) {
      imgEl.src = book.portada;
      imgEl.alt = `Portada de ${book.titulo}`;
    }
    if (titleEl) titleEl.textContent = book.titulo;
    if (authorEl) authorEl.textContent = `Por ${book.autor} • ${book.categoriaLabel}`;
    if (descEl) descEl.textContent = book.sinopsis;
    if (btnAmazon) btnAmazon.href = book.amazonUrl;

    if (btnFicha) {
      btnFicha.onclick = () => openBookModal(book.id);
    }
    if (coverTrigger) {
      coverTrigger.onclick = () => openBookModal(book.id);
    }

    thumbsContainer.querySelectorAll('.showcase-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === featuredShowcaseIndex);
    });
  };

  thumbsContainer.innerHTML = destacados
    .map(
      (b, idx) => `
      <button type="button" class="showcase-thumb ${idx === 0 ? 'active' : ''}" data-showcase-idx="${idx}" title="${b.titulo}">
        <img src="${b.portada}" alt="${b.titulo}" loading="lazy">
      </button>
    `
    )
    .join('');

  thumbsContainer.querySelectorAll('.showcase-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-showcase-idx'), 10);
      updateShowcase(idx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateShowcase(featuredShowcaseIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateShowcase(featuredShowcaseIndex + 1));
  }

  updateShowcase(0);
}

// --- 2. CATÁLOGO EDITORIAL CON FILTROS Y BUSCADOR ---
function initCatalogFilters(libros) {
  const pillsContainer = document.getElementById('catalog-filter-pills');
  const searchInput = document.getElementById('catalog-search-input');

  if (pillsContainer) {
    const counts = {
      todos: libros.length,
      productividad: libros.filter(b => b.categoria === 'productividad').length,
      pasatiempos: libros.filter(b => b.categoria === 'pasatiempos').length,
      bilingue: libros.filter(b => b.categoria === 'bilingue').length
    };

    pillsContainer.querySelectorAll('[data-filter]').forEach(btn => {
      const cat = btn.getAttribute('data-filter');
      if (cat === 'todos') btn.textContent = `Todos los Libros (${counts.todos})`;
      if (cat === 'productividad') btn.textContent = `⚡ Productividad Asimétrica (${counts.productividad})`;
      if (cat === 'pasatiempos') btn.textContent = `🧩 Colección Letras y Retos (${counts.pasatiempos})`;
      if (cat === 'bilingue') btn.textContent = `🌐 Aprendizaje Bilingüe (${counts.bilingue})`;

      btn.addEventListener('click', () => {
        currentCatalogFilter = cat;
        pillsContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        renderCatalogBooks(libros);
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentCatalogSearch = e.target.value.trim().toLowerCase();
      renderCatalogBooks(libros);
    });
  }
}

function renderCatalogBooks(libros) {
  const grid = document.getElementById('catalog-books-grid');
  if (!grid) return;

  const filtrados = libros.filter(book => {
    const matchCat = currentCatalogFilter === 'todos' || book.categoria === currentCatalogFilter;
    if (!matchCat) return false;
    if (!currentCatalogSearch) return true;

    const haystack = [
      book.titulo,
      book.subtitulo,
      book.autor,
      book.sello,
      book.categoriaLabel,
      book.sinopsis,
      book.asin,
      book.asinSecundario
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(currentCatalogSearch);
  });

  if (filtrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;background:var(--surface-card);border-radius:16px;border:1px solid var(--border-subtle);">
        <p style="margin:0 auto 1rem;font-size:1.05rem;color:var(--text-primary);">No se encontraron libros que coincidan con tu búsqueda.</p>
        <button type="button" class="btn-editorial outline" id="btn-reset-catalog-filter">Ver los 5 Libros</button>
      </div>
    `;
    const resetBtn = document.getElementById('btn-reset-catalog-filter');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentCatalogFilter = 'todos';
        currentCatalogSearch = '';
        const input = document.getElementById('catalog-search-input');
        if (input) input.value = '';
        document.querySelectorAll('#catalog-filter-pills .filter-pill').forEach(p => {
          p.classList.toggle('active', p.getAttribute('data-filter') === 'todos');
        });
        renderCatalogBooks(libros);
      });
    }
    return;
  }

  grid.innerHTML = filtrados
    .map(book => {
      const asinPillHtml = book.asin
        ? `<span class="book-asin-badge" title="ASIN verificado en Amazon">ASIN: ${book.asin}${book.asinSecundario ? ` / ${book.asinSecundario}` : ''}</span>`
        : `<span class="book-asin-badge">${book.badgeEspecial || 'EDICIÓN KDP'}</span>`;

      return `
      <article class="book-card" data-book-id="${book.id}">
        <div class="book-card-body">
          <div class="book-card-top">
            <div class="book-cover-frame book-3d-stage" data-open-book="${book.id}" title="Ver vista previa, portada completa y detalles">
              <div class="book-3d-spine"></div>
              <span class="book-lang-pill">${book.idiomaBadge}</span>
              <img src="${book.portada}" alt="Portada de ${book.titulo}" loading="lazy">
            </div>
            <div class="book-meta-col">
              <div class="book-badges-row">
                <span class="book-imprint-tag">${book.categoriaLabel}</span>
                ${asinPillHtml}
              </div>
              <h3 class="book-title" data-open-book="${book.id}">${book.titulo}</h3>
              <p class="book-subtitle">${book.subtitulo}</p>
              <span class="book-author">Por <strong>${book.autor}</strong> • ${book.idioma}</span>
              <span class="book-format-badge">${book.formato}</span>
            </div>
          </div>
          <p class="book-synopsis">${book.sinopsis}</p>
        </div>

        <div class="book-card-footer">
          <button type="button" class="btn-book-detail" data-open-book="${book.id}">
            📖 Vista Previa &amp; Detalles
          </button>
          <a href="${book.amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn-book-amazon">
            🛒 Ver en Amazon ↗
          </a>
        </div>
      </article>
    `;
    })
    .join('');

  grid.querySelectorAll('[data-open-book]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-open-book');
      openBookModal(id);
    });
  });
}

// --- 3. MODAL DE FICHA EDITORIAL Y FRAGMENTO DE LECTURA ---
function openBookModal(bookId) {
  const catalogData = window.RUICHIS_CATALOGO;
  if (!catalogData) return;
  const book = catalogData.libros.find(b => b.id === bookId);
  if (!book) return;

  const modal = document.getElementById('book-detail-modal');
  const body = document.getElementById('modal-book-body');
  if (!modal || !body) return;

  const featuresHtml = (book.caracteristicas || [])
    .map(item => `<li>${item}</li>`)
    .join('');

  const altCoverImg = book.portadaWrap || book.portadaAlternativa;
  const altCoverBtnText = book.portadaWrap
    ? '🖼️ Ver Cubierta Completa KDP (Wrap)'
    : (book.portadaAlternativaLabel || '🖼️ Ver Portada Alternativa');

  const wrapButtonHtml = altCoverImg
    ? `<button type="button" class="btn-puzzle-tool" id="btn-toggle-wrap-cover" style="width:100%;justify-content:center;">
         ${altCoverBtnText}
       </button>`
    : '';

  const gameActionHtml = book.juegoRelacionado
    ? `<button type="button" class="btn-editorial emerald" id="btn-modal-play-game" style="padding:0.6rem 1.1rem;font-size:0.84rem;">
         🧩 Jugar Reto Relacionado Gratis
       </button>`
    : '';

  const secondAmazonHtml = book.amazonUrlEn
    ? `<a href="${book.amazonUrlEn}" target="_blank" rel="noopener noreferrer" class="btn-editorial outline" style="padding:0.6rem 1.1rem;font-size:0.84rem;">
         🌐 English Edition (${book.asinSecundario || 'Amazon'}) ↗
       </a>`
    : '';

  const asinMetaRow = book.asin
    ? `<div style="margin-top:0.25rem;"><strong style="color:var(--primary-color);">ASIN:</strong> ${book.asin}${book.asinSecundario ? ` (ES) / ${book.asinSecundario} (EN)` : ''}</div>`
    : '';

  body.innerHTML = `
    <div class="modal-book-layout">
      <div class="modal-cover-col">
        <img id="modal-book-cover-img" src="${book.portada}" alt="Portada de ${book.titulo}">
        ${wrapButtonHtml}
        <div style="background:var(--background-primary);padding:0.8rem;border-radius:8px;border:1px solid var(--border-subtle);font-size:0.76rem;color:var(--text-muted);font-family:var(--font-mono);">
          <div><strong style="color:var(--primary-color);">AUTOR:</strong> ${book.autor}</div>
          <div style="margin-top:0.25rem;"><strong style="color:var(--primary-color);">COLECCIÓN:</strong> ${book.categoriaLabel}</div>
          <div style="margin-top:0.25rem;"><strong style="color:var(--primary-color);">IDIOMA:</strong> ${book.idioma} (${book.idiomaBadge})</div>
          <div style="margin-top:0.25rem;"><strong style="color:var(--primary-color);">FORMATO:</strong> ${book.formato}</div>
          ${asinMetaRow}
        </div>
      </div>

      <div class="modal-info-col">
        <span class="section-kicker">${book.categoriaLabel} • ${book.badgeEspecial || 'EDICIÓN OFICIAL'}</span>
        <h2 id="modal-book-title" style="font-family:var(--font-heading);font-size:1.7rem;color:var(--text-primary);margin-bottom:0.35rem;line-height:1.2;">
          ${book.titulo}
        </h2>
        <p style="font-size:0.94rem;color:var(--primary-color);font-weight:600;margin-bottom:0.9rem;line-height:1.45;">
          ${book.subtitulo}
        </p>
        <p style="font-size:0.92rem;color:var(--text-secondary);line-height:1.68;margin-bottom:1rem;">
          ${book.sinopsis}
        </p>

        <ul class="modal-features-list">
          ${featuresHtml}
        </ul>

        ${
          book.extracto
            ? `<div class="modal-excerpt-box">
                 <h4>📖 ${book.extractoTitulo || 'Fragmento de Lectura'}</h4>
                 <blockquote>${book.extracto}</blockquote>
               </div>`
            : ''
        }

        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:1.35rem;">
          <a href="${book.amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn-editorial primary" style="padding:0.65rem 1.25rem;font-size:0.86rem;">
            🛒 Ver en Amazon KDP ↗
          </a>
          ${secondAmazonHtml}
          ${gameActionHtml}
        </div>
      </div>
    </div>
  `;

  // Toggle cubierta completa KDP o portada alternativa
  const btnWrap = document.getElementById('btn-toggle-wrap-cover');
  if (btnWrap && altCoverImg) {
    let showingAlt = false;
    btnWrap.addEventListener('click', () => {
      showingAlt = !showingAlt;
      const img = document.getElementById('modal-book-cover-img');
      if (img) {
        img.src = showingAlt ? altCoverImg : book.portada;
      }
      btnWrap.textContent = showingAlt ? '📕 Volver a Portada Principal' : altCoverBtnText;
    });
  }

  // Botón Jugar Reto Relacionado
  const btnPlay = document.getElementById('btn-modal-play-game');
  if (btnPlay && book.juegoRelacionado) {
    btnPlay.addEventListener('click', () => {
      closeBookModal();
      const gimSection = document.getElementById('gimnasio-mental');
      if (gimSection) {
        gimSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.gimnasioInstance) {
        window.gimnasioInstance.switchGame(book.juegoRelacionado.tipo, book.juegoRelacionado);
      }
    });
  }

  modal.classList.add('open');
}

function openPrivacyPolicyModal() {
  const modal = document.getElementById('book-detail-modal');
  const body = document.getElementById('modal-book-body');
  if (!modal || !body) return;

  fetch('src/privacy.md')
    .then(r => r.text())
    .then(md => {
      const rendered = typeof marked !== 'undefined' ? marked.parse(md) : `<pre>${md}</pre>`;
      body.innerHTML = `
        <div style="max-width:720px;margin:0 auto;">
          <span class="section-kicker">DOCUMENTO OFICIAL DE TRANSPARENCIA</span>
          <div style="line-height:1.75;color:var(--text-secondary);">
            ${rendered}
          </div>
        </div>
      `;
      modal.classList.add('open');
    })
    .catch(() => {
      window.open('src/privacy.md', '_blank');
    });
}

function closeBookModal() {
  const modal = document.getElementById('book-detail-modal');
  if (modal) modal.classList.remove('open');
}

// --- 4. ACERCA DE RUICHIS LAB (Estructurado en src/modulos/inicio.html) ---


// --- REGISTRO DE MÓDULOS SPA ---
agente.registrarModulo('Inicio', {
  templateUrl: 'src/modulos/inicio.html',
  init: (contenedor) => {
    activeModuloName = 'Inicio';
    initEditorialHome(contenedor);
  }
});

agente.registrarModulo('Herramientas Web', {
  templateUrl: 'src/modulos/herramientasweb.html',
  init: () => {
    activeModuloName = 'Herramientas Web';
  }
});

agente.registrarModulo('Enciclopedia IA', {
  templateUrl: 'src/modulos/enciclopedia.html',
  init: (contenedor) => {
    activeModuloName = 'Enciclopedia IA';
    if (typeof inicializarEnciclopedia === 'function') {
      inicializarEnciclopedia(contenedor);
    }
  }
});

agente.registrarModulo('Filosofia', {
  templateUrl: 'src/modulos/filosofia.html',
  init: () => {
    activeModuloName = 'Filosofia';
  }
});

agente.registrarModulo('Contacto', {
  templateUrl: 'src/modulos/contacto.html',
  init: (contenedor) => {
    activeModuloName = 'Contacto';
    const emailScript = document.createElement('script');
    emailScript.src = 'src/js/email-service.js';
    document.head.appendChild(emailScript);

    const contactForm = contenedor.querySelector('.form-cyber');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span>ENVIANDO...';

        const formData = new FormData(e.target);
        const templateParams = {
          nombre: formData.get('nombre'),
          email: formData.get('email'),
          tipo: formData.get('tipo'),
          mensaje: formData.get('mensaje')
        };

        try {
          setTimeout(async () => {
            const emailService = new EmailService();
            const result = await emailService.sendEmail(templateParams);
            if (result.success) {
              alert('✅ ' + (result.message || 'Mensaje preparado correctamente.'));
              e.target.reset();
            } else {
              alert('📧 Por favor, contacta directamente a info@ruichislab.com');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 400);
        } catch (error) {
          alert('📧 Por favor, contacta directamente a info@ruichislab.com');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  }
});

agente.registrarModulo('Ruichis Lock', {
  templateUrl: 'src/modulos/ruichislock.html',
  init: () => {
    activeModuloName = 'Ruichis Lock';
    const script = document.createElement('script');
    script.src = 'src/js/ruichislock.js';
    script.onload = () => {
      if (typeof initRuichisLock === 'function') {
        window.ruichisLockInstance = initRuichisLock();
      }
    };
    document.head.appendChild(script);
  },
  cleanup: () => {
    if (typeof restoreOriginalSEO === 'function') {
      restoreOriginalSEO();
    }
    if (window.ruichisLockInstance) {
      window.ruichisLockInstance = null;
    }
  }
});

// --- EVENTOS GLOBALES DE NAVEGACIÓN, MODAL Y TEMA ---
document.addEventListener('click', (e) => {
  // 1. Enlaces a secciones dentro de la portada (Catálogo, Juegos, Autores)
  const navSectionLink = e.target.closest('[data-nav-section]');
  if (navSectionLink) {
    e.preventDefault();
    const targetSectionId = navSectionLink.getAttribute('data-nav-section');

    const scrollToTarget = () => {
      const targetEl = document.getElementById(targetSectionId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (activeModuloName !== 'Inicio') {
      const onLoaded = (ev) => {
        if (ev.detail?.nombre === 'Inicio') {
          document.removeEventListener('modulo:cargado', onLoaded);
          setTimeout(scrollToTarget, 80);
        }
      };
      document.addEventListener('modulo:cargado', onLoaded);
      agente.navegarA('Inicio');
    } else {
      scrollToTarget();
    }

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    if (navSectionLink.classList.contains('nav-link')) {
      navSectionLink.classList.add('active');
    }
    return;
  }

  // 2. Enlaces a módulos SPA completos (Inicio, Enciclopedia IA, Ruichis Lock, Contacto)
  const moduleElement = e.target.closest('[data-modulo]');
  if (moduleElement) {
    e.preventDefault();
    const moduleName = moduleElement.getAttribute('data-modulo');
    if (moduleName) {
      agente.navegarA(moduleName);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-modulo="${moduleName}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Cerrar modal con botón X o clic en el fondo
  const closeBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('book-detail-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeBookModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeBookModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBookModal();
  });

  // Alternador de Tema Oscuro Obsidiana / Modo Papel Cálido
  const themeBtn = document.getElementById('theme-reader-toggle');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');

  const applyTheme = (isPaper) => {
    document.body.classList.toggle('theme-paper', isPaper);
    if (themeIcon) themeIcon.textContent = isPaper ? '🌙' : '📜';
    if (themeLabel) themeLabel.textContent = isPaper ? 'Modo Oscuro' : 'Modo Papel';
  };

  const savedTheme = localStorage.getItem('ruichis_editorial_theme');
  if (savedTheme === 'paper') {
    applyTheme(true);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const nextIsPaper = !document.body.classList.contains('theme-paper');
      applyTheme(nextIsPaper);
      localStorage.setItem('ruichis_editorial_theme', nextIsPaper ? 'paper' : 'dark');
    });
  }

  // Cargar módulo inicial
  agente.navegarA('Inicio');

  // Si la URL incluye #privacy o ?privacy, abrir política de privacidad de Book Ranker
  if (window.location.hash === '#privacy' || window.location.search.includes('privacy')) {
    setTimeout(() => openPrivacyPolicyModal(), 300);
  }
});

window.agenteModular = agente;
window.openBookModal = openBookModal;
