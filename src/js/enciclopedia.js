// src/js/enciclopedia.js
// Motor Interactivo de la Enciclopedia Universal de IA — Ruichis Lab

(function () {
  const BOOKMARKS_KEY = "ruichis_ia_bookmarks_v1";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatInlineMarkdown(text) {
    let out = escapeHtml(text);
    // Código inline `...`
    out = out.replace(/`([^`]+)`/g, '<code class="ia-inline-code">$1</code>');
    // Negrita **...**
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Cursiva *...*
    out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    // Enlaces [texto](url)
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
    return out;
  }

  function slugifyHeading(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function renderMarkdownToHtml(md) {
    if (typeof window.marked !== "undefined" && typeof window.marked.parse === "function") {
      try {
        return window.marked.parse(md);
      } catch (e) {}
    }

    const lines = String(md).replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Bloque de código ```
      if (line.trim().startsWith("```")) {
        const lang = line.trim().slice(3).trim() || "text";
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // cerrar ```
        html.push(
          `<div class="ia-code-block">` +
            `<div class="ia-code-header"><span>${escapeHtml(lang.toUpperCase())}</span><button type="button" class="btn-ia-copy-code">📋 Copiar</button></div>` +
            `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>` +
          `</div>`
        );
        continue;
      }

      // Tabla Markdown
      if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[i + 1])) {
        const parseRow = (r) =>
          r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());
        const headers = parseRow(line);
        i += 2; // saltar header y separador
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        html.push(
          `<div class="ia-table-wrap"><table class="ia-table"><thead><tr>${headers
            .map(h => `<th>${formatInlineMarkdown(h)}</th>`)
            .join("")}</tr></thead><tbody>${rows
            .map(row => `<tr>${row.map(cell => `<td>${formatInlineMarkdown(cell)}</td>`).join("")}</tr>`)
            .join("")}</tbody></table></div>`
        );
        continue;
      }

      // Encabezados
      const hMatch = line.match(/^(#{1,4})\s+(.*)$/);
      if (hMatch) {
        const level = hMatch[1].length;
        const rawText = hMatch[2].trim();
        const hid = slugifyHeading(rawText);
        html.push(`<h${level} id="${hid}">${formatInlineMarkdown(rawText)}</h${level}>`);
        i++;
        continue;
      }

      // Separador horizontal
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
        html.push("<hr>");
        i++;
        continue;
      }

      // Blockquote
      if (line.trim().startsWith(">")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        html.push(`<blockquote>${quoteLines.map(formatInlineMarkdown).join("<br>")}</blockquote>`);
        continue;
      }

      // Lista desordenada
      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
          i++;
        }
        html.push(`<ul>${items.map(it => `<li>${formatInlineMarkdown(it)}</li>`).join("")}</ul>`);
        continue;
      }

      // Lista ordenada
      if (/^\s*\d+\.\s+/.test(line)) {
        const items = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
          i++;
        }
        html.push(`<ol>${items.map(it => `<li>${formatInlineMarkdown(it)}</li>`).join("")}</ol>`);
        continue;
      }

      // Línea vacía
      if (!line.trim()) {
        i++;
        continue;
      }

      // Párrafo
      const paraLines = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith("```") &&
        !lines[i].trim().startsWith(">") &&
        !lines[i].trim().startsWith("|") &&
        !/^\s*[-*+]\s+/.test(lines[i]) &&
        !/^\s*\d+\.\s+/.test(lines[i])
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }
      html.push(`<p>${formatInlineMarkdown(paraLines.join(" "))}</p>`);
    }

    return html.join("\n");
  }

  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(list) {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function inicializarEnciclopedia(contenedor) {
    const articulos = window.ENCICLOPEDIA_IA_ARTICULOS || [];
    const categorias = window.ENCICLOPEDIA_IA_CATEGORIAS || [];

    const gridEl = contenedor.querySelector("#ia-articles-grid");
    const emptyEl = contenedor.querySelector("#ia-empty-state");
    const pillsEl = contenedor.querySelector("#ia-category-pills");
    const searchInput = contenedor.querySelector("#ia-search");
    const resultsCountEl = contenedor.querySelector("#ia-results-count");
    const bookmarksCountEl = contenedor.querySelector("#ia-bookmarks-count");
    const btnBookmarks = contenedor.querySelector("#btn-ia-bookmarks");
    const btnRandom = contenedor.querySelector("#btn-ia-random");
    const btnReset = contenedor.querySelector("#btn-ia-reset-filters");

    const readerShell = contenedor.querySelector("#articulo-detalle-container");
    const readerBody = contenedor.querySelector("#ia-reader-body");
    const readerBadges = contenedor.querySelector("#ia-reader-badges");
    const readerToc = contenedor.querySelector("#ia-reader-toc");
    const relatedGrid = contenedor.querySelector("#ia-related-grid");
    const prevNextNav = contenedor.querySelector("#ia-prev-next-nav");
    const btnBack = contenedor.querySelector("#btn-ia-back-catalog");
    const btnToggleBookmark = contenedor.querySelector("#btn-ia-toggle-bookmark");
    const btnShare = contenedor.querySelector("#btn-ia-share-article");

    if (!gridEl || !readerShell) return;

    const state = {
      query: "",
      categoria: "todos",
      nivel: "todos",
      onlyBookmarks: false,
      currentArticleId: null,
      bookmarks: loadBookmarks()
    };

    function updateBookmarksCount() {
      if (bookmarksCountEl) bookmarksCountEl.textContent = String(state.bookmarks.length);
    }

    function renderCategoryPills() {
      if (!pillsEl) return;
      pillsEl.innerHTML = categorias
        .map(cat => {
          const count = cat.id === "todos"
            ? articulos.length
            : articulos.filter(a => a.categoria === cat.id).length;
          const active = state.categoria === cat.id ? "active" : "";
          return `
            <button type="button" class="ia-cat-pill ${active}" data-ia-cat="${cat.id}" role="tab" aria-selected="${state.categoria === cat.id ? "true" : "false"}">
              <span>${cat.icono}</span> ${cat.nombre} <span class="ia-cat-count">${count}</span>
            </button>
          `;
        })
        .join("");

      pillsEl.querySelectorAll("[data-ia-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
          state.categoria = btn.getAttribute("data-ia-cat");
          renderCategoryPills();
          renderGrid();
        });
      });
    }

    function getFilteredArticles() {
      const q = state.query.trim().toLowerCase();
      return articulos.filter(art => {
        if (state.onlyBookmarks && !state.bookmarks.includes(art.id)) return false;
        if (state.categoria !== "todos" && art.categoria !== state.categoria) return false;
        if (state.nivel !== "todos" && art.nivel !== state.nivel) return false;
        if (q) {
          const haystack = `${art.titulo} ${art.resumen} ${art.categoriaLabel} ${art.tags.join(" ")}`.toLowerCase();
          return haystack.includes(q);
        }
        return true;
      });
    }

    function renderGrid() {
      const filtered = getFilteredArticles();
      if (resultsCountEl) {
        resultsCountEl.textContent = `Mostrando ${filtered.length} de ${articulos.length} monografías`;
      }

      if (filtered.length === 0) {
        gridEl.innerHTML = "";
        gridEl.hidden = true;
        if (emptyEl) emptyEl.hidden = false;
        return;
      }

      gridEl.hidden = false;
      if (emptyEl) emptyEl.hidden = true;

      gridEl.innerHTML = filtered
        .map(art => {
          const isSaved = state.bookmarks.includes(art.id);
          return `
            <article class="ia-article-card" data-articulo="${art.id}" tabindex="0">
              <div class="ia-card-top">
                <span class="ia-card-icon">${art.icono}</span>
                <div class="ia-card-meta-pills">
                  <span class="ia-level-badge level-${art.nivel.toLowerCase()}">${art.nivel}</span>
                  <span class="ia-time-badge">⏱️ ${art.tiempoLectura}</span>
                </div>
              </div>
              <div class="ia-card-cat">${art.categoriaLabel}${isSaved ? " • 🔖" : ""}</div>
              <h3 class="ia-card-title">${art.titulo}</h3>
              <p class="ia-card-desc">${art.resumen}</p>
              <div class="ia-card-tags">
                ${art.tags.slice(0, 3).map(t => `<span>${t}</span>`).join("")}
              </div>
              <div class="ia-card-cta">Leer monografía →</div>
            </article>
          `;
        })
        .join("");
    }

    function updateBookmarkButtonState(articleId) {
      if (!btnToggleBookmark) return;
      const saved = state.bookmarks.includes(articleId);
      btnToggleBookmark.innerHTML = saved ? "🔖 Guardado" : "🔖 Guardar";
      btnToggleBookmark.classList.toggle("active", saved);
    }

    async function abrirArticulo(articleId) {
      const meta = articulos.find(a => a.id === articleId);
      if (!meta) return;

      state.currentArticleId = articleId;
      readerShell.hidden = false;
      gridEl.hidden = true;
      if (emptyEl) emptyEl.hidden = true;

      if (readerBadges) {
        readerBadges.innerHTML = `
          <span class="ia-level-badge level-${meta.nivel.toLowerCase()}">${meta.nivel}</span>
          <span class="ia-time-badge">⏱️ ${meta.tiempoLectura}</span>
          <span class="ia-time-badge">${meta.icono} ${meta.categoriaLabel}</span>
        `;
      }
      updateBookmarkButtonState(articleId);

      readerBody.innerHTML = `<div class="ia-loading">Cargando monografía técnica...</div>`;

      try {
        const response = await fetch(`src/modulos/ia/${articleId}.md`);
        if (!response.ok) throw new Error("No se encontró el archivo Markdown");
        const markdown = await response.text();
        readerBody.innerHTML = renderMarkdownToHtml(markdown);

        // Generar Tabla de Contenidos
        if (readerToc) {
          const headings = Array.from(readerBody.querySelectorAll("h2, h3"));
          readerToc.innerHTML = headings
            .map(h => {
              if (!h.id) h.id = slugifyHeading(h.textContent);
              const cls = h.tagName === "H3" ? "toc-sub" : "toc-main";
              return `<li class="${cls}"><a href="#${h.id}" data-toc-target="${h.id}">${escapeHtml(h.textContent)}</a></li>`;
            })
            .join("");

          readerToc.querySelectorAll("[data-toc-target]").forEach(link => {
            link.addEventListener("click", (e) => {
              e.preventDefault();
              const targetEl = readerBody.querySelector(`#${CSS.escape(link.getAttribute("data-toc-target"))}`);
              if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          });
        }

        // Botones de copiar código
        readerBody.querySelectorAll(".btn-ia-copy-code").forEach(btn => {
          btn.addEventListener("click", () => {
            const codeEl = btn.closest(".ia-code-block")?.querySelector("code");
            if (!codeEl) return;
            navigator.clipboard?.writeText(codeEl.textContent).then(() => {
              const orig = btn.textContent;
              btn.textContent = "✅ Copiado";
              setTimeout(() => { btn.textContent = orig; }, 1800);
            }).catch(() => {});
          });
        });

        // Artículos relacionados
        if (relatedGrid) {
          const rels = (meta.relacionados || [])
            .map(rid => articulos.find(a => a.id === rid))
            .filter(Boolean);
          relatedGrid.innerHTML = rels
            .map(r => `
              <button type="button" class="ia-related-card" data-open-ia="${r.id}">
                <span class="ia-rel-icon">${r.icono}</span>
                <div>
                  <strong>${r.titulo}</strong>
                  <span>${r.nivel} • ${r.tiempoLectura}</span>
                </div>
              </button>
            `)
            .join("");
          relatedGrid.querySelectorAll("[data-open-ia]").forEach(btn => {
            btn.addEventListener("click", () => abrirArticulo(btn.getAttribute("data-open-ia")));
          });
        }

        // Navegación Anterior / Siguiente
        if (prevNextNav) {
          const idx = articulos.findIndex(a => a.id === articleId);
          const prev = idx > 0 ? articulos[idx - 1] : null;
          const next = idx >= 0 && idx < articulos.length - 1 ? articulos[idx + 1] : null;
          prevNextNav.innerHTML = `
            ${prev ? `<button type="button" class="ia-pn-btn" data-open-ia="${prev.id}"><span>← Anterior</span><strong>${prev.icono} ${prev.titulo}</strong></button>` : "<div></div>"}
            ${next ? `<button type="button" class="ia-pn-btn next" data-open-ia="${next.id}"><span>Siguiente →</span><strong>${next.icono} ${next.titulo}</strong></button>` : ""}
          `;
          prevNextNav.querySelectorAll("[data-open-ia]").forEach(btn => {
            btn.addEventListener("click", () => abrirArticulo(btn.getAttribute("data-open-ia")));
          });
        }

        readerShell.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (err) {
        readerBody.innerHTML = `<p class="error-message">No se pudo cargar la monografía. Verifica tu conexión o recarga la página.</p>`;
      }
    }

    function cerrarArticulo() {
      state.currentArticleId = null;
      readerShell.hidden = true;
      renderGrid();
      const topEl = contenedor.querySelector(".ia-controls-panel");
      if (topEl) topEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Eventos de búsqueda y filtros
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.query = e.target.value;
        if (!readerShell.hidden) cerrarArticulo();
        renderGrid();
      });
    }

    contenedor.querySelectorAll("[data-ia-level]").forEach(btn => {
      btn.addEventListener("click", () => {
        contenedor.querySelectorAll("[data-ia-level]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.nivel = btn.getAttribute("data-ia-level");
        if (!readerShell.hidden) cerrarArticulo();
        renderGrid();
      });
    });

    if (btnBookmarks) {
      btnBookmarks.addEventListener("click", () => {
        state.onlyBookmarks = !state.onlyBookmarks;
        btnBookmarks.classList.toggle("active", state.onlyBookmarks);
        btnBookmarks.setAttribute("aria-pressed", state.onlyBookmarks ? "true" : "false");
        if (!readerShell.hidden) cerrarArticulo();
        renderGrid();
      });
    }

    if (btnRandom) {
      btnRandom.addEventListener("click", () => {
        if (articulos.length === 0) return;
        const pick = articulos[Math.floor(Math.random() * articulos.length)];
        abrirArticulo(pick.id);
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        state.query = "";
        state.categoria = "todos";
        state.nivel = "todos";
        state.onlyBookmarks = false;
        if (searchInput) searchInput.value = "";
        if (btnBookmarks) {
          btnBookmarks.classList.remove("active");
          btnBookmarks.setAttribute("aria-pressed", "false");
        }
        contenedor.querySelectorAll("[data-ia-level]").forEach(b => {
          b.classList.toggle("active", b.getAttribute("data-ia-level") === "todos");
        });
        renderCategoryPills();
        renderGrid();
      });
    }

    gridEl.addEventListener("click", (e) => {
      const card = e.target.closest(".ia-article-card");
      if (card) abrirArticulo(card.dataset.articulo);
    });

    gridEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".ia-article-card");
        if (card) {
          e.preventDefault();
          abrirArticulo(card.dataset.articulo);
        }
      }
    });

    if (btnBack) btnBack.addEventListener("click", cerrarArticulo);

    if (btnToggleBookmark) {
      btnToggleBookmark.addEventListener("click", () => {
        if (!state.currentArticleId) return;
        const idx = state.bookmarks.indexOf(state.currentArticleId);
        if (idx >= 0) state.bookmarks.splice(idx, 1);
        else state.bookmarks.push(state.currentArticleId);
        saveBookmarks(state.bookmarks);
        updateBookmarkButtonState(state.currentArticleId);
        updateBookmarksCount();
      });
    }

    if (btnShare) {
      btnShare.addEventListener("click", () => {
        const url = `${window.location.origin}/#enciclopedia-ia`;
        navigator.clipboard?.writeText(url).then(() => {
          const orig = btnShare.innerHTML;
          btnShare.innerHTML = "✅ ¡Enlace Copiado!";
          setTimeout(() => { btnShare.innerHTML = orig; }, 2000);
        }).catch(() => {});
      });
    }

    updateBookmarksCount();
    renderCategoryPills();
    renderGrid();
  }

  window.inicializarEnciclopedia = inicializarEnciclopedia;
})();
