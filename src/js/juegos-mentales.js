// src/js/juegos-mentales.js
// Gimnasio Mental Ruichis Lab — Sopa de Letras (8 Direcciones + SVG Pill Overlay) & Sudoku Maestro 9x9

(function () {
  const TEMAS_SOPA = {
    cultura_historia: {
      nombre: "Vol. I: Cultura General — Historia y Civilizaciones",
      libroTitulo: "100 Grandes Sopas de Letras de Cultura General (Vol. I)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      libroId: "sopas-cultura-general",
      descripcion: "Rastrea 12 conceptos clave de las grandes civilizaciones antiguas, la historia clásica y los hitos documentales de la humanidad.",
      gridSize: 13,
      palabras: [
        "MESOPOTAMIA", "ALEJANDRIA", "RENACIMIENTO", "IMPRENTA",
        "ACROPOLIS", "FILOSOFIA", "CARTAGO", "BIZANCIO",
        "CRONICA", "MANUSCRITO", "DINASTIA", "ORACULO"
      ]
    },
    cultura_arte: {
      nombre: "Vol. I: Cultura General — Arte, Literatura y Filosofía",
      libroTitulo: "100 Grandes Sopas de Letras de Cultura General (Vol. I)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      libroId: "sopas-cultura-general",
      descripcion: "Movimientos estéticos, géneros literarios y técnicas maestras del arte universal presentes en nuestro Volumen I.",
      gridSize: 13,
      palabras: [
        "VANGUARDIA", "BARROCO", "SIMBOLISMO", "METAFORA",
        "SONETO", "ESCULTURA", "PERSPECTIVA", "LIENZO",
        "ANTOLOGIA", "EPISTOLA", "ESTETICA", "RETABLO"
      ]
    },
    biologia_celula: {
      nombre: "Vol. II: Biología — Célula, Genética y Vida Molecular",
      libroTitulo: "100 Grandes Sopas de Letras de Biología (Vol. II)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Biologia+Ruichis+Lab",
      libroId: "sopas-biologia",
      descripcion: "Explora la maquinaria microscópica de la vida: orgánulos celulares, genética molecular y bioquímica.",
      gridSize: 13,
      palabras: [
        "MITOCONDRIA", "RIBOSOMA", "CROMOSOMA", "GENOMA",
        "ENZIMA", "NUCLEOTIDO", "MEIOSIS", "PROTEINA",
        "SINAPSIS", "CLOROPLASTO", "CITOPLASMA", "OSMOSIS"
      ]
    },
    biologia_ecosistemas: {
      nombre: "Vol. II: Biología — Botánica, Zoología y Evolución",
      libroTitulo: "100 Grandes Sopas de Letras de Biología (Vol. II)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Biologia+Ruichis+Lab",
      libroId: "sopas-biologia",
      descripcion: "Procesos ecológicos, botánica y mecanismos evolutivos seleccionados del Volumen II de la Colección Letras y Retos.",
      gridSize: 14,
      palabras: [
        "FOTOSINTESIS", "BIODIVERSIDAD", "SIMBIOSIS", "TAXONOMIA",
        "ENDEMICO", "POLINIZACION", "FILOGENIA", "BIOMA",
        "ADAPTACION", "MICELIO", "ESTOMA", "ESPECIE"
      ]
    },
    productividad_sistemas: {
      nombre: "Especial: Productividad Asimétrica & Foco Profundo",
      libroTitulo: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      libroUrl: "https://www.amazon.com/dp/B0HD2MY2HN",
      libroId: "productividad-asimetrica-es",
      descripcion: "Conceptos clave de ejecución profunda, aislamiento cognitivo, apalancamiento algorítmico y sistemas modulares.",
      gridSize: 13,
      palabras: [
        "ASIMETRIA", "ALGORITMO", "HEURISTICA", "SISTEMAS",
        "ATENCION", "PALANCA", "EJECUCION", "MODULAR",
        "AISLAMIENTO", "SINAPSIS", "IMPACTO", "CLARIDAD"
      ]
    }
  };

  // Alias de compatibilidad
  TEMAS_SOPA.ia_cibernetica = TEMAS_SOPA.productividad_sistemas;

  const DIRECCIONES_8 = [
    { dr: 0, dc: 1, nombre: "Horizontal →" },
    { dr: 1, dc: 0, nombre: "Vertical ↓" },
    { dr: 1, dc: 1, nombre: "Diagonal ↘" },
    { dr: -1, dc: 1, nombre: "Diagonal ↗" },
    { dr: 0, dc: -1, nombre: "Invertida ←" },
    { dr: -1, dc: 0, nombre: "Vertical ↑" },
    { dr: -1, dc: -1, nombre: "Diagonal ↖" },
    { dr: 1, dc: -1, nombre: "Diagonal ↙" }
  ];

  const COLORES_PALABRAS = [
    { stroke: "rgba(212, 175, 55, 0.48)", cell: "rgba(212, 175, 55, 0.24)", dot: "#D4AF37" },
    { stroke: "rgba(16, 185, 129, 0.48)", cell: "rgba(16, 185, 129, 0.24)", dot: "#10B981" },
    { stroke: "rgba(56, 189, 248, 0.48)", cell: "rgba(56, 189, 248, 0.24)", dot: "#38BDF8" },
    { stroke: "rgba(168, 85, 247, 0.48)", cell: "rgba(168, 85, 247, 0.24)", dot: "#A855F7" },
    { stroke: "rgba(244, 63, 94, 0.46)", cell: "rgba(244, 63, 94, 0.22)", dot: "#F43F5E" },
    { stroke: "rgba(245, 158, 11, 0.48)", cell: "rgba(245, 158, 11, 0.24)", dot: "#F59E0B" },
    { stroke: "rgba(20, 184, 166, 0.48)", cell: "rgba(20, 184, 166, 0.24)", dot: "#14B8A6" },
    { stroke: "rgba(99, 102, 241, 0.48)", cell: "rgba(99, 102, 241, 0.24)", dot: "#6366F1" },
    { stroke: "rgba(236, 72, 153, 0.46)", cell: "rgba(236, 72, 153, 0.22)", dot: "#EC4899" },
    { stroke: "rgba(132, 204, 22, 0.46)", cell: "rgba(132, 204, 22, 0.22)", dot: "#84CC16" },
    { stroke: "rgba(14, 165, 233, 0.48)", cell: "rgba(14, 165, 233, 0.24)", dot: "#0EA5E9" },
    { stroke: "rgba(217, 119, 6, 0.48)", cell: "rgba(217, 119, 6, 0.24)", dot: "#D97706" }
  ];

  class GimnasioMental {
    constructor() {
      this.activeGame = "sopa"; // 'sopa' | 'sudoku'

      // Estado Sopa de Letras
      this.sopaTemaActual = "cultura_historia";
      this.sopaSize = 13;
      this.sopaGrid = [];
      this.sopaPlacements = []; // { word, cells: [{r,c}], dir, found, colorIndex }
      this.sopaFoundCount = 0;
      this.sopaSelecting = false;
      this.sopaStartCell = null;
      this.sopaCurrentPath = [];
      this.sopaClickStart = null;
      this.sopaSeconds = 0;
      this.sopaTimerId = null;
      this.sopaHintsUsed = 0;

      // Estado Sudoku
      this.sudokuDifficulty = "medio";
      this.sudokuSolution = [];
      this.sudokuInitial = [];
      this.sudokuBoard = [];
      this.sudokuNotes = []; // 9x9 de Sets
      this.sudokuSelected = { r: 0, c: 0 };
      this.sudokuNotesMode = false;
      this.sudokuHistory = [];
      this.sudokuSeconds = 0;
      this.sudokuTimerId = null;
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;
    }

    init() {
      const container = document.getElementById("gimnasio-mental-app");
      if (!container) return;

      this.bindTabSwitching();
      this.initSopaGame();
      this.initSudokuGame();
    }

    bindTabSwitching() {
      const tabButtons = document.querySelectorAll("[data-game-tab]");
      tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-game-tab");
          this.switchGame(target);
        });
      });
    }

    switchGame(gameType, options = {}) {
      this.activeGame = gameType;

      document.querySelectorAll("[data-game-tab]").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-game-tab") === gameType);
      });

      const sopaPanel = document.getElementById("panel-juego-sopa");
      const sudokuPanel = document.getElementById("panel-juego-sudoku");

      if (sopaPanel && sudokuPanel) {
        if (gameType === "sopa") {
          sopaPanel.style.display = "block";
          sudokuPanel.style.display = "none";
          if (options.tema && TEMAS_SOPA[options.tema]) {
            const select = document.getElementById("sopa-tema-select");
            if (select) select.value = options.tema;
            this.sopaTemaActual = options.tema;
            this.generarNuevaSopa();
          }
        } else {
          sopaPanel.style.display = "none";
          sudokuPanel.style.display = "block";
          if (options.dificultad) {
            const diffBtns = document.querySelectorAll("[data-sudoku-diff]");
            diffBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-sudoku-diff") === options.dificultad));
            this.sudokuDifficulty = options.dificultad;
            this.generarNuevoSudoku();
          }
        }
      }
    }

    // =========================================================================
    // MOTOR 1: SOPA DE LETRAS EN 8 DIRECCIONES (COLECCIÓN LETRAS Y RETOS)
    // =========================================================================
    initSopaGame() {
      const selectTema = document.getElementById("sopa-tema-select");
      if (selectTema) {
        selectTema.addEventListener("change", (e) => {
          this.sopaTemaActual = e.target.value;
          this.generarNuevaSopa();
        });
      }

      const btnNueva = document.getElementById("btn-sopa-nueva");
      if (btnNueva) btnNueva.addEventListener("click", () => this.generarNuevaSopa());

      const btnPista = document.getElementById("btn-sopa-pista");
      if (btnPista) btnPista.addEventListener("click", () => this.darPistaSopa());

      const btnResolver = document.getElementById("btn-sopa-resolver");
      if (btnResolver) btnResolver.addEventListener("click", () => this.resolverSopaCompleta());

      const btnImprimir = document.getElementById("btn-sopa-imprimir");
      if (btnImprimir) btnImprimir.addEventListener("click", () => this.imprimirPasatiempoActual("sopa"));

      // Eventos globales para finalizar arrastre fuera de la cuadrícula
      window.addEventListener("mouseup", () => {
        if (this.sopaSelecting) {
          this.finalizarSeleccionSopa();
        }
      });

      this.generarNuevaSopa();
    }

    generarNuevaSopa() {
      const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
      this.sopaSize = config.gridSize || 13;
      const N = this.sopaSize;

      // Inicializar matriz vacía
      this.sopaGrid = Array.from({ length: N }, () => Array(N).fill(""));
      this.sopaPlacements = [];
      this.sopaFoundCount = 0;
      this.sopaHintsUsed = 0;
      this.sopaClickStart = null;
      this.sopaCurrentPath = [];

      // Ordenar palabras de mayor a menor longitud para colocación óptima
      const palabrasOrdenadas = [...config.palabras].sort((a, b) => b.length - a.length);

      palabrasOrdenadas.forEach((palabra, idx) => {
        const colocada = this.colocarPalabraBalanceada(palabra, idx);
        if (!colocada) {
          this.colocarPalabraForzada(palabra, idx);
        }
      });

      // Rellenar celdas vacías con letras ponderadas del español
      const alfabeto = "AAABCCDEEEFGHIIIJKLMNNOOOPQRRSSSTTUUVWXYZ";
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!this.sopaGrid[r][c]) {
            this.sopaGrid[r][c] = alfabeto[Math.floor(Math.random() * alfabeto.length)];
          }
        }
      }

      // Reiniciar temporizador
      this.iniciarTimerSopa();
      this.renderSopaUI(config);
      this.actualizarPreviewPalabraSopa("");
      this.renderSopaSvgOverlay();
    }

    colocarPalabraBalanceada(palabra, idx) {
      const N = this.sopaSize;
      const len = palabra.length;

      // Rotar direcciones preferidas para balancear los 8 sentidos como en el libro KDP
      const dirsShuffled = [...DIRECCIONES_8].sort(() => Math.random() - 0.5);

      let mejoresCandidatos = [];

      for (const dir of dirsShuffled) {
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            const endR = r + dir.dr * (len - 1);
            const endC = c + dir.dc * (len - 1);
            if (endR < 0 || endR >= N || endC < 0 || endC >= N) continue;

            let valido = true;
            let intersecciones = 0;

            for (let i = 0; i < len; i++) {
              const nr = r + dir.dr * i;
              const nc = c + dir.dc * i;
              const actual = this.sopaGrid[nr][nc];
              if (actual !== "" && actual !== palabra[i]) {
                valido = false;
                break;
              }
              if (actual === palabra[i]) {
                intersecciones++;
              }
            }

            if (valido) {
              mejoresCandidatos.push({ r, c, dir, intersecciones });
            }
          }
        }
      }

      if (mejoresCandidatos.length === 0) return false;

      // Priorizar candidatos con 1 o 2 intersecciones para hacer el tablero más interesante
      mejoresCandidatos.sort((a, b) => {
        const scoreA = (a.intersecciones > 0 ? 10 : 0) + Math.random() * 6;
        const scoreB = (b.intersecciones > 0 ? 10 : 0) + Math.random() * 6;
        return scoreB - scoreA;
      });

      const elegido = mejoresCandidatos[0];
      const cells = [];
      for (let i = 0; i < len; i++) {
        const nr = elegido.r + elegido.dir.dr * i;
        const nc = elegido.c + elegido.dir.dc * i;
        this.sopaGrid[nr][nc] = palabra[i];
        cells.push({ r: nr, c: nc });
      }

      this.sopaPlacements.push({
        word: palabra,
        cells,
        dir: elegido.dir.nombre,
        found: false,
        colorIndex: idx % COLORES_PALABRAS.length
      });

      return true;
    }

    colocarPalabraForzada(palabra, idx) {
      const N = this.sopaSize;
      const len = Math.min(palabra.length, N);
      const r = idx % N;
      const cells = [];
      for (let i = 0; i < len; i++) {
        this.sopaGrid[r][i] = palabra[i];
        cells.push({ r, c: i });
      }
      this.sopaPlacements.push({
        word: palabra,
        cells,
        dir: "Horizontal →",
        found: false,
        colorIndex: idx % COLORES_PALABRAS.length
      });
    }

    iniciarTimerSopa() {
      if (this.sopaTimerId) clearInterval(this.sopaTimerId);
      this.sopaSeconds = 0;
      this.actualizarTimerSopaDOM();
      this.sopaTimerId = setInterval(() => {
        if (this.sopaFoundCount < this.sopaPlacements.length) {
          this.sopaSeconds++;
          this.actualizarTimerSopaDOM();
        }
      }, 1000);
    }

    actualizarTimerSopaDOM() {
      const el = document.getElementById("sopa-timer");
      if (el) {
        const mins = String(Math.floor(this.sopaSeconds / 60)).padStart(2, "0");
        const secs = String(this.sopaSeconds % 60).padStart(2, "0");
        el.textContent = `${mins}:${secs}`;
      }
    }

    renderSopaUI(config) {
      const descEl = document.getElementById("sopa-tema-descripcion");
      if (descEl) descEl.textContent = config.descripcion;

      const bookBannerTitle = document.getElementById("sopa-libro-vinculado-titulo");
      const bookBannerLink = document.getElementById("sopa-libro-vinculado-link");
      if (bookBannerTitle) bookBannerTitle.textContent = config.libroTitulo;
      if (bookBannerLink) bookBannerLink.href = config.libroUrl;

      const statusEl = document.getElementById("sopa-status-msg");
      if (statusEl) {
        statusEl.textContent = "Arrastra sobre las letras o haz clic en la primera y última letra de cada palabra (8 direcciones).";
        statusEl.className = "puzzle-status-bar";
      }

      // Renderizar cuadrícula
      const gridEl = document.getElementById("sopa-grid-board");
      if (!gridEl) return;

      gridEl.style.gridTemplateColumns = `repeat(${this.sopaSize}, 1fr)`;
      gridEl.innerHTML = "";

      for (let r = 0; r < this.sopaSize; r++) {
        for (let c = 0; c < this.sopaSize; c++) {
          const cell = document.createElement("div");
          cell.className = "sopa-cell";
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.textContent = this.sopaGrid[r][c];

          // Mouse events
          cell.addEventListener("mousedown", (e) => {
            e.preventDefault();
            this.iniciarSeleccionSopa(r, c);
          });

          cell.addEventListener("mouseenter", () => {
            if (this.sopaSelecting) {
              this.actualizarSeleccionSopa(r, c);
            } else if (this.sopaClickStart) {
              // Vista previa en modo clic-inicio -> clic-fin al mover el cursor
              const previewPath = this.calcularCaminoRecto(this.sopaClickStart.r, this.sopaClickStart.c, r, c);
              this.sopaCurrentPath = previewPath;
              this.pintarSeleccionTemporalSopa();
            }
          });

          // Click inicio-fin alternativo para máxima comodidad
          cell.addEventListener("click", () => {
            this.manejarClickCeldaSopa(r, c);
          });

          gridEl.appendChild(cell);
        }
      }

      // Soporte Touch móvil en el tablero
      gridEl.ontouchstart = (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("sopa-cell")) {
          e.preventDefault();
          const r = parseInt(target.dataset.r, 10);
          const c = parseInt(target.dataset.c, 10);
          this.iniciarSeleccionSopa(r, c);
        }
      };

      gridEl.ontouchmove = (e) => {
        if (!this.sopaSelecting || e.touches.length !== 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("sopa-cell")) {
          const r = parseInt(target.dataset.r, 10);
          const c = parseInt(target.dataset.c, 10);
          this.actualizarSeleccionSopa(r, c);
        }
      };

      gridEl.ontouchend = () => {
        if (this.sopaSelecting) {
          this.finalizarSeleccionSopa();
        }
      };

      this.renderListaPalabrasSopa();
      this.actualizarProgresoSopa();
    }

    iniciarSeleccionSopa(r, c) {
      this.sopaSelecting = true;
      this.sopaStartCell = { r, c };
      this.sopaCurrentPath = [{ r, c }];
      this.pintarSeleccionTemporalSopa();
    }

    actualizarSeleccionSopa(r, c) {
      if (!this.sopaStartCell) return;
      const path = this.calcularCaminoRecto(this.sopaStartCell.r, this.sopaStartCell.c, r, c);
      if (path.length > 0) {
        this.sopaCurrentPath = path;
        this.pintarSeleccionTemporalSopa();
      }
    }

    manejarClickCeldaSopa(r, c) {
      if (!this.sopaClickStart) {
        this.sopaClickStart = { r, c };
        const cellEl = this.obtenerCeldaSopaDOM(r, c);
        if (cellEl) cellEl.classList.add("click-anchor");
        this.actualizarPreviewPalabraSopa(this.sopaGrid[r][c]);
      } else {
        const start = this.sopaClickStart;
        document.querySelectorAll(".sopa-cell.click-anchor").forEach(el => el.classList.remove("click-anchor"));
        this.sopaClickStart = null;
        if (start.r === r && start.c === c) {
          this.sopaCurrentPath = [];
          this.pintarSeleccionTemporalSopa();
          return;
        }

        const path = this.calcularCaminoRecto(start.r, start.c, r, c);
        if (path.length > 1) {
          this.sopaCurrentPath = path;
          this.verificarCaminoSopa();
        }
        this.sopaCurrentPath = [];
        this.pintarSeleccionTemporalSopa();
      }
    }

    calcularCaminoRecto(r1, c1, r2, c2) {
      const dr = r2 - r1;
      const dc = c2 - c1;
      if (dr === 0 && dc === 0) return [{ r: r1, c: c1 }];

      const absR = Math.abs(dr);
      const absC = Math.abs(dc);

      let stepR = 0;
      let stepC = 0;
      let steps = 0;

      if (dr === 0) {
        stepR = 0;
        stepC = Math.sign(dc);
        steps = absC;
      } else if (dc === 0) {
        stepR = Math.sign(dr);
        stepC = 0;
        steps = absR;
      } else if (absR === absC) {
        stepR = Math.sign(dr);
        stepC = Math.sign(dc);
        steps = absR;
      } else {
        return [];
      }

      const path = [];
      for (let i = 0; i <= steps; i++) {
        const nr = r1 + stepR * i;
        const nc = c1 + stepC * i;
        if (nr < 0 || nr >= this.sopaSize || nc < 0 || nc >= this.sopaSize) break;
        path.push({ r: nr, c: nc });
      }
      return path;
    }

    actualizarPreviewPalabraSopa(str) {
      const pill = document.getElementById("sopa-live-preview");
      const lettersEl = document.getElementById("sopa-live-letters");
      if (!lettersEl || !pill) return;

      if (str && str.length > 0) {
        lettersEl.textContent = str.split("").join(" ");
        pill.classList.add("active");
      } else {
        lettersEl.textContent = "—";
        pill.classList.remove("active");
      }
    }

    renderSopaSvgOverlay() {
      const svg = document.getElementById("sopa-svg-overlay");
      if (!svg) return;

      const N = this.sopaSize;
      const pillStrokeWidth = (100 / N) * 0.72;
      let linesHtml = "";

      // 1. Dibujar cápsulas redondeadas para todas las palabras encontradas
      this.sopaPlacements.forEach(p => {
        if (!p.found || p.cells.length === 0) return;
        const first = p.cells[0];
        const last = p.cells[p.cells.length - 1];
        const x1 = ((first.c + 0.5) / N) * 100;
        const y1 = ((first.r + 0.5) / N) * 100;
        const x2 = ((last.c + 0.5) / N) * 100;
        const y2 = ((last.r + 0.5) / N) * 100;
        const colorObj = COLORES_PALABRAS[p.colorIndex];

        linesHtml += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${colorObj.stroke}" stroke-width="${pillStrokeWidth.toFixed(2)}" stroke-linecap="round" />`;
      });

      // 2. Dibujar cápsula activa de selección en tiempo real
      if (this.sopaCurrentPath && this.sopaCurrentPath.length > 0) {
        const first = this.sopaCurrentPath[0];
        const last = this.sopaCurrentPath[this.sopaCurrentPath.length - 1];
        const x1 = ((first.c + 0.5) / N) * 100;
        const y1 = ((first.r + 0.5) / N) * 100;
        let x2 = ((last.c + 0.5) / N) * 100;
        const y2 = ((last.r + 0.5) / N) * 100;
        if (Math.abs(x1 - x2) < 0.001 && Math.abs(y1 - y2) < 0.001) {
          x2 = x1 + 0.01;
        }

        linesHtml += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(0, 168, 255, 0.52)" stroke-width="${pillStrokeWidth.toFixed(2)}" stroke-linecap="round" />`;
      }

      svg.innerHTML = linesHtml;
    }

    pintarSeleccionTemporalSopa() {
      document.querySelectorAll(".sopa-cell.selecting").forEach(el => el.classList.remove("selecting"));
      this.sopaCurrentPath.forEach(({ r, c }) => {
        const el = this.obtenerCeldaSopaDOM(r, c);
        if (el) el.classList.add("selecting");
      });

      const currentWord = this.sopaCurrentPath.map(({ r, c }) => this.sopaGrid[r][c]).join("");
      this.actualizarPreviewPalabraSopa(currentWord);
      this.renderSopaSvgOverlay();
    }

    finalizarSeleccionSopa() {
      this.sopaSelecting = false;
      document.querySelectorAll(".sopa-cell.selecting").forEach(el => el.classList.remove("selecting"));
      if (this.sopaCurrentPath.length > 1) {
        this.verificarCaminoSopa();
      }
      this.sopaCurrentPath = [];
      if (!this.sopaClickStart) {
        this.actualizarPreviewPalabraSopa("");
      }
      this.renderSopaSvgOverlay();
    }

    verificarCaminoSopa() {
      const letrasSeleccionadas = this.sopaCurrentPath.map(({ r, c }) => this.sopaGrid[r][c]).join("");
      const letrasInvertidas = letrasSeleccionadas.split("").reverse().join("");

      const encontrado = this.sopaPlacements.find(
        p => !p.found && (p.word === letrasSeleccionadas || p.word === letrasInvertidas)
      );

      if (encontrado) {
        encontrado.found = true;
        this.sopaFoundCount++;
        this.sopaClickStart = null;
        document.querySelectorAll(".sopa-cell.click-anchor").forEach(el => el.classList.remove("click-anchor"));

        const colorObj = COLORES_PALABRAS[encontrado.colorIndex];
        encontrado.cells.forEach(({ r, c }) => {
          const el = this.obtenerCeldaSopaDOM(r, c);
          if (el) {
            el.classList.remove("hint-pulse");
            el.classList.add("found");
            el.style.backgroundColor = colorObj.cell;
          }
        });

        this.renderSopaSvgOverlay();
        this.renderListaPalabrasSopa();
        this.actualizarProgresoSopa();

        const statusEl = document.getElementById("sopa-status-msg");
        if (this.sopaFoundCount === this.sopaPlacements.length) {
          if (statusEl) {
            statusEl.innerHTML = `🎉 <strong>¡Tablero Completado en ${document.getElementById("sopa-timer")?.textContent}!</strong> Has encontrado las ${this.sopaPlacements.length} palabras. Descubre los 100 desafíos completos en la edición impresa de Amazon.`;
            statusEl.className = "puzzle-status-bar success";
          }
        } else if (statusEl) {
          statusEl.innerHTML = `✨ ¡Excelente! Encontraste <strong>${encontrado.word}</strong> (${encontrado.dir}).`;
          statusEl.className = "puzzle-status-bar highlight";
        }
      }
    }

    darPistaSopa() {
      const pendientes = this.sopaPlacements.filter(p => !p.found);
      if (pendientes.length === 0) return;

      this.sopaHintsUsed++;
      const objetivo = pendientes[Math.floor(Math.random() * pendientes.length)];
      const primera = objetivo.cells[0];
      const ultima = objetivo.cells[objetivo.cells.length - 1];

      document.querySelectorAll(".sopa-cell.hint-pulse").forEach(el => el.classList.remove("hint-pulse"));

      const cellStart = this.obtenerCeldaSopaDOM(primera.r, primera.c);
      const cellEnd = this.obtenerCeldaSopaDOM(ultima.r, ultima.c);
      if (cellStart) cellStart.classList.add("hint-pulse");
      if (cellEnd) cellEnd.classList.add("hint-pulse");

      const statusEl = document.getElementById("sopa-status-msg");
      if (statusEl) {
        statusEl.innerHTML = `💡 <strong>Pista:</strong> Busca <strong>${objetivo.word}</strong> desde la fila ${primera.r + 1}, columna ${primera.c + 1} (${objetivo.dir}).`;
        statusEl.className = "puzzle-status-bar highlight";
      }
    }

    resolverSopaCompleta() {
      this.sopaPlacements.forEach(p => {
        if (!p.found) {
          p.found = true;
          const colorObj = COLORES_PALABRAS[p.colorIndex];
          p.cells.forEach(({ r, c }) => {
            const el = this.obtenerCeldaSopaDOM(r, c);
            if (el) {
              el.classList.remove("hint-pulse");
              el.classList.add("found");
              el.style.backgroundColor = colorObj.cell;
            }
          });
        }
      });
      this.sopaFoundCount = this.sopaPlacements.length;
      this.renderSopaSvgOverlay();
      this.renderListaPalabrasSopa();
      this.actualizarProgresoSopa();

      const statusEl = document.getElementById("sopa-status-msg");
      if (statusEl) {
        statusEl.innerHTML = `📖 <strong>Solucionario Activado:</strong> Todas las palabras han sido trazadas en el tablero.`;
        statusEl.className = "puzzle-status-bar";
      }
    }

    obtenerCeldaSopaDOM(r, c) {
      return document.querySelector(`#sopa-grid-board .sopa-cell[data-r="${r}"][data-c="${c}"]`);
    }

    renderListaPalabrasSopa() {
      const listEl = document.getElementById("sopa-word-list");
      if (!listEl) return;

      const ordenadas = [...this.sopaPlacements].sort((a, b) => a.word.localeCompare(b.word));
      listEl.innerHTML = ordenadas
        .map(p => {
          const colorObj = COLORES_PALABRAS[p.colorIndex];
          return `
            <li class="sopa-word-item ${p.found ? "word-found" : ""}" data-word="${p.word}">
              <span class="word-bullet" style="background:${p.found ? colorObj.dot : "rgba(255,255,255,0.22)"}"></span>
              <span class="word-text">${p.word}</span>
              ${p.found ? '<span class="word-check">✓</span>' : ""}
            </li>
          `;
        })
        .join("");
    }

    actualizarProgresoSopa() {
      const total = this.sopaPlacements.length;
      const countEl = document.getElementById("sopa-found-counter");
      if (countEl) {
        countEl.textContent = `${this.sopaFoundCount} / ${total}`;
      }
      const barEl = document.getElementById("sopa-progress-fill");
      if (barEl) {
        const pct = total > 0 ? Math.round((this.sopaFoundCount / total) * 100) : 0;
        barEl.style.width = `${pct}%`;
      }
    }

    // =========================================================================
    // MOTOR 2: SUDOKU MAESTRO 9x9 (ENTRENAMIENTO DE FOCO PROFUNDO)
    // =========================================================================
    initSudokuGame() {
      document.querySelectorAll("[data-sudoku-diff]").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("[data-sudoku-diff]").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.sudokuDifficulty = btn.getAttribute("data-sudoku-diff");
          this.generarNuevoSudoku();
        });
      });

      const btnNuevo = document.getElementById("btn-sudoku-nuevo");
      if (btnNuevo) btnNuevo.addEventListener("click", () => this.generarNuevoSudoku());

      const btnNotas = document.getElementById("btn-sudoku-notas");
      if (btnNotas) {
        btnNotas.addEventListener("click", () => {
          this.sudokuNotesMode = !this.sudokuNotesMode;
          btnNotas.classList.toggle("active", this.sudokuNotesMode);
          btnNotas.setAttribute("aria-pressed", String(this.sudokuNotesMode));
        });
      }

      const btnAutoCandidatos = document.getElementById("btn-sudoku-autocandidatos");
      if (btnAutoCandidatos) {
        btnAutoCandidatos.addEventListener("click", () => this.calcularAutoCandidatosSudoku());
      }

      const btnDeshacer = document.getElementById("btn-sudoku-deshacer");
      if (btnDeshacer) btnDeshacer.addEventListener("click", () => this.deshacerSudoku());

      const btnBorrar = document.getElementById("btn-sudoku-borrar");
      if (btnBorrar) btnBorrar.addEventListener("click", () => this.ingresarNumeroSudoku(0));

      const btnPista = document.getElementById("btn-sudoku-pista");
      if (btnPista) btnPista.addEventListener("click", () => this.darPistaSudoku());

      const btnVerificar = document.getElementById("btn-sudoku-verificar");
      if (btnVerificar) btnVerificar.addEventListener("click", () => this.verificarTableroSudoku());

      const btnImprimir = document.getElementById("btn-sudoku-imprimir");
      if (btnImprimir) btnImprimir.addEventListener("click", () => this.imprimirPasatiempoActual("sudoku"));

      // Teclado numérico en pantalla
      document.querySelectorAll("[data-sudoku-num]").forEach(btn => {
        btn.addEventListener("click", () => {
          const val = parseInt(btn.getAttribute("data-sudoku-num"), 10);
          this.ingresarNumeroSudoku(val);
        });
      });

      // Soporte de teclado físico cuando el panel Sudoku está visible
      window.addEventListener("keydown", (e) => {
        if (this.activeGame !== "sudoku") return;
        const activeTag = document.activeElement?.tagName;
        if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

        const { r, c } = this.sudokuSelected;
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault();
          this.ingresarNumeroSudoku(parseInt(e.key, 10));
        } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
          e.preventDefault();
          this.ingresarNumeroSudoku(0);
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          const btnNotasEl = document.getElementById("btn-sudoku-notas");
          if (btnNotasEl) btnNotasEl.click();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.seleccionarCeldaSudoku((r + 8) % 9, c);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this.seleccionarCeldaSudoku((r + 1) % 9, c);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.seleccionarCeldaSudoku(r, (c + 8) % 9);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this.seleccionarCeldaSudoku(r, (c + 1) % 9);
        }
      });

      this.generarNuevoSudoku();
    }

    generarNuevoSudoku() {
      const base = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8]
      ];

      const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let grid = base.map(row => row.map(v => digits[v - 1]));

      for (let band = 0; band < 3; band++) {
        const rows = [0, 1, 2].sort(() => Math.random() - 0.5);
        const copy = [grid[band * 3], grid[band * 3 + 1], grid[band * 3 + 2]];
        for (let i = 0; i < 3; i++) grid[band * 3 + i] = copy[rows[i]];
      }

      for (let stack = 0; stack < 3; stack++) {
        const cols = [0, 1, 2].sort(() => Math.random() - 0.5);
        for (let r = 0; r < 9; r++) {
          const copy = [grid[r][stack * 3], grid[r][stack * 3 + 1], grid[r][stack * 3 + 2]];
          for (let i = 0; i < 3; i++) grid[r][stack * 3 + i] = copy[cols[i]];
        }
      }

      this.sudokuSolution = grid.map(r => [...r]);

      const cluesMap = {
        facil: 43,
        medio: 35,
        dificil: 29,
        experto: 25
      };
      const targetClues = cluesMap[this.sudokuDifficulty] || 35;
      const cellsToRemove = 81 - targetClues;

      const board = grid.map(r => [...r]);
      const positions = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          positions.push({ r, c });
        }
      }
      positions.sort(() => Math.random() - 0.5);

      for (let i = 0; i < cellsToRemove; i++) {
        const { r, c } = positions[i];
        board[r][c] = 0;
      }

      this.sudokuInitial = board.map(r => [...r]);
      this.sudokuBoard = board.map(r => [...r]);
      this.sudokuNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
      this.sudokuHistory = [];
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;

      let firstEmpty = { r: 0, c: 0 };
      outer: for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] === 0) {
            firstEmpty = { r, c };
            break outer;
          }
        }
      }
      this.sudokuSelected = firstEmpty;

      this.iniciarTimerSudoku();
      this.renderSudokuBoard();
      this.actualizarContadoresSudoku();

      const statusEl = document.getElementById("sudoku-status-msg");
      if (statusEl) {
        statusEl.innerHTML = "Selecciona una celda y usa el teclado numérico (1–9), activa <strong>✏️ Notas (Lápiz)</strong> o pulsa <strong>✨ Auto-Candidatos</strong> para desplegar todas las opciones lógicas.";
        statusEl.className = "puzzle-status-bar";
      }
    }

    iniciarTimerSudoku() {
      if (this.sudokuTimerId) clearInterval(this.sudokuTimerId);
      this.sudokuSeconds = 0;
      this.actualizarTimerSudokuDOM();
      this.sudokuTimerId = setInterval(() => {
        if (!this.sudokuCompleted) {
          this.sudokuSeconds++;
          this.actualizarTimerSudokuDOM();
        }
      }, 1000);
    }

    actualizarTimerSudokuDOM() {
      const el = document.getElementById("sudoku-timer");
      if (el) {
        const mins = String(Math.floor(this.sudokuSeconds / 60)).padStart(2, "0");
        const secs = String(this.sudokuSeconds % 60).padStart(2, "0");
        el.textContent = `${mins}:${secs}`;
      }
    }

    renderSudokuBoard() {
      const boardEl = document.getElementById("sudoku-grid-board");
      if (!boardEl) return;

      boardEl.innerHTML = "";
      const selR = this.sudokuSelected.r;
      const selC = this.sudokuSelected.c;
      const selVal = this.sudokuBoard[selR]?.[selC] || 0;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = this.sudokuBoard[r][c];
          const isInitial = this.sudokuInitial[r][c] !== 0;
          const isSelected = r === selR && c === selC;
          const isSameGroup =
            r === selR ||
            c === selC ||
            (Math.floor(r / 3) === Math.floor(selR / 3) && Math.floor(c / 3) === Math.floor(selC / 3));
          const isSameValue = val !== 0 && val === selVal;
          const hasConflict = val !== 0 && !isInitial && this.tieneConflictoSudoku(r, c, val);

          const cell = document.createElement("button");
          cell.type = "button";
          cell.className = [
            "sudoku-cell",
            isInitial ? "initial-clue" : "user-input",
            isSelected ? "selected" : "",
            !isSelected && isSameGroup ? "peer-cell" : "",
            !isSelected && isSameValue ? "same-digit" : "",
            hasConflict ? "conflict-cell" : "",
            c === 2 || c === 5 ? "box-border-right" : "",
            r === 2 || r === 5 ? "box-border-bottom" : ""
          ]
            .filter(Boolean)
            .join(" ");

          cell.dataset.r = r;
          cell.dataset.c = c;

          if (val !== 0) {
            cell.textContent = val;
          } else {
            const notesSet = this.sudokuNotes[r][c];
            if (notesSet && notesSet.size > 0) {
              const notesGrid = document.createElement("div");
              notesGrid.className = "sudoku-notes-grid";
              for (let n = 1; n <= 9; n++) {
                const span = document.createElement("span");
                span.textContent = notesSet.has(n) ? n : "";
                if (selVal !== 0 && n === selVal && notesSet.has(n)) {
                  span.className = "note-match";
                }
                notesGrid.appendChild(span);
              }
              cell.appendChild(notesGrid);
            }
          }

          cell.addEventListener("click", () => {
            this.seleccionarCeldaSudoku(r, c);
          });

          boardEl.appendChild(cell);
        }
      }
    }

    seleccionarCeldaSudoku(r, c) {
      this.sudokuSelected = { r, c };
      this.renderSudokuBoard();
    }

    tieneConflictoSudoku(r, c, val) {
      for (let i = 0; i < 9; i++) {
        if (i !== c && this.sudokuBoard[r][i] === val) return true;
        if (i !== r && this.sudokuBoard[i][c] === val) return true;
      }
      const startR = Math.floor(r / 3) * 3;
      const startC = Math.floor(c / 3) * 3;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const nr = startR + dr;
          const nc = startC + dc;
          if ((nr !== r || nc !== c) && this.sudokuBoard[nr][nc] === val) return true;
        }
      }
      return false;
    }

    calcularAutoCandidatosSudoku() {
      if (this.sudokuCompleted) return;

      // Guardar snapshot para permitir Deshacer
      const snapshot = this.sudokuNotes.map(row => row.map(set => new Set(set)));
      this.sudokuHistory.push({ bulkNotes: snapshot });

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          this.sudokuNotes[r][c].clear();
          if (this.sudokuBoard[r][c] === 0) {
            for (let n = 1; n <= 9; n++) {
              if (!this.tieneConflictoSudoku(r, c, n)) {
                this.sudokuNotes[r][c].add(n);
              }
            }
          }
        }
      }

      this.renderSudokuBoard();
      const statusEl = document.getElementById("sudoku-status-msg");
      if (statusEl) {
        statusEl.innerHTML = `✨ <strong>Auto-Candidatos Calculados:</strong> Se han anotado todos los candidatos lógicamente válidos en cada celda vacía.`;
        statusEl.className = "puzzle-status-bar highlight";
      }
    }

    ingresarNumeroSudoku(num) {
      if (this.sudokuCompleted) return;
      const { r, c } = this.sudokuSelected;
      if (this.sudokuInitial[r][c] !== 0) return;

      this.sudokuHistory.push({
        r,
        c,
        prevVal: this.sudokuBoard[r][c],
        prevNotes: new Set(this.sudokuNotes[r][c])
      });

      if (num === 0) {
        this.sudokuBoard[r][c] = 0;
        this.sudokuNotes[r][c].clear();
      } else if (this.sudokuNotesMode) {
        this.sudokuBoard[r][c] = 0;
        if (this.sudokuNotes[r][c].has(num)) {
          this.sudokuNotes[r][c].delete(num);
        } else {
          this.sudokuNotes[r][c].add(num);
        }
      } else {
        this.sudokuBoard[r][c] = num;
        this.sudokuNotes[r][c].clear();

        for (let i = 0; i < 9; i++) {
          this.sudokuNotes[r][i].delete(num);
          this.sudokuNotes[i][c].delete(num);
        }
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++) {
          for (let dc = 0; dc < 3; dc++) {
            this.sudokuNotes[br + dr][bc + dc].delete(num);
          }
        }
      }

      this.renderSudokuBoard();
      this.actualizarContadoresSudoku();
      this.comprobarVictoriaSudoku();
    }

    deshacerSudoku() {
      if (this.sudokuHistory.length === 0) return;
      const last = this.sudokuHistory.pop();
      if (last.bulkNotes) {
        this.sudokuNotes = last.bulkNotes;
      } else {
        this.sudokuBoard[last.r][last.c] = last.prevVal;
        this.sudokuNotes[last.r][last.c] = last.prevNotes;
        this.sudokuSelected = { r: last.r, c: last.c };
      }
      this.renderSudokuBoard();
      this.actualizarContadoresSudoku();
    }

    darPistaSudoku() {
      if (this.sudokuCompleted) return;
      let { r, c } = this.sudokuSelected;

      if (this.sudokuBoard[r][c] === this.sudokuSolution[r][c]) {
        const candidatas = [];
        for (let rr = 0; rr < 9; rr++) {
          for (let cc = 0; cc < 9; cc++) {
            if (this.sudokuBoard[rr][cc] !== this.sudokuSolution[rr][cc]) {
              candidatas.push({ r: rr, c: cc });
            }
          }
        }
        if (candidatas.length === 0) return;
        const elegida = candidatas[Math.floor(Math.random() * candidatas.length)];
        r = elegida.r;
        c = elegida.c;
      }

      const valorCorrecto = this.sudokuSolution[r][c];
      this.sudokuSelected = { r, c };
      const prevNotesMode = this.sudokuNotesMode;
      this.sudokuNotesMode = false;
      this.ingresarNumeroSudoku(valorCorrecto);
      this.sudokuNotesMode = prevNotesMode;

      const statusEl = document.getElementById("sudoku-status-msg");
      if (statusEl && !this.sudokuCompleted) {
        statusEl.innerHTML = `💡 <strong>Pista Aplicada:</strong> En la fila ${r + 1}, columna ${c + 1} el valor exacto es <strong>${valorCorrecto}</strong>.`;
        statusEl.className = "puzzle-status-bar highlight";
      }
    }

    verificarTableroSudoku() {
      let errores = 0;
      let vacias = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = this.sudokuBoard[r][c];
          if (v === 0) {
            vacias++;
          } else if (v !== this.sudokuSolution[r][c]) {
            errores++;
          }
        }
      }

      const statusEl = document.getElementById("sudoku-status-msg");
      if (!statusEl) return;

      if (errores === 0 && vacias > 0) {
        statusEl.innerHTML = `✅ <strong>Verificación Impecable:</strong> Todos los números ingresados hasta ahora son correctos (${vacias} celdas por completar).`;
        statusEl.className = "puzzle-status-bar highlight";
      } else if (errores > 0) {
        statusEl.innerHTML = `⚠️ Se detectaron <strong>${errores} celda(s)</strong> que no coinciden con la solución única. Revisa tus deducciones o usa Deshacer.`;
        statusEl.className = "puzzle-status-bar warning";
      }
    }

    actualizarContadoresSudoku() {
      const counts = Array(10).fill(0);
      let completadas = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const v = this.sudokuBoard[r][c];
          if (v >= 1 && v <= 9) {
            counts[v]++;
            completadas++;
          }
        }
      }

      document.querySelectorAll("[data-sudoku-num]").forEach(btn => {
        const n = parseInt(btn.getAttribute("data-sudoku-num"), 10);
        const rem = Math.max(0, 9 - counts[n]);
        const sub = btn.querySelector(".numpad-rem");
        if (sub) sub.textContent = rem;
        btn.classList.toggle("digit-complete", rem === 0);
      });

      const progEl = document.getElementById("sudoku-progress-counter");
      if (progEl) progEl.textContent = `${completadas} / 81`;
    }

    comprobarVictoriaSudoku() {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] !== this.sudokuSolution[r][c]) return;
        }
      }

      this.sudokuCompleted = true;
      const statusEl = document.getElementById("sudoku-status-msg");
      if (statusEl) {
        statusEl.innerHTML = `🏆 <strong>¡Sudoku Maestro Resuelto en ${document.getElementById("sudoku-timer")?.textContent}!</strong> Foco profundo al 100%. Explora nuestro catálogo de libros en Amazon KDP.`;
        statusEl.className = "puzzle-status-bar success";
      }
    }

    // =========================================================================
    // MODO IMPRIMIBLE (HOJA DE PASATIEMPO PARA IMPRIMIR)
    // =========================================================================
    imprimirPasatiempoActual(tipo) {
      const win = window.open("", "_blank", "width=850,height=950");
      if (!win) {
        window.print();
        return;
      }

      if (tipo === "sopa") {
        const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
        const rowsHtml = this.sopaGrid
          .map(
            row =>
              `<tr>${row.map(ch => `<td>${ch}</td>`).join("")}</tr>`
          )
          .join("");
        const wordsHtml = [...this.sopaPlacements]
          .sort((a, b) => a.word.localeCompare(b.word))
          .map(p => `<div class="word-item">☐ ${p.word}</div>`)
          .join("");

        win.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>${config.nombre} — Ruichis Lab</title>
            <style>
              body { font-family: Georgia, serif; color: #111; max-width: 720px; margin: 24px auto; padding: 0 20px; }
              .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
              .imprint { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #444; }
              h1 { font-size: 22px; margin: 6px 0; }
              p.desc { font-size: 13px; color: #333; margin: 4px 0 0; }
              table.grid { margin: 20px auto; border-collapse: collapse; border: 2px solid #111; }
              table.grid td { width: 34px; height: 34px; text-align: center; vertical-align: middle; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; border: 1px solid #bbb; }
              .words-box { margin-top: 22px; border-top: 1px solid #111; padding-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; font-family: sans-serif; font-size: 13px; font-weight: 600; }
              .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #444; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="imprint">RUICHIS LAB • COLECCIÓN LETRAS Y RETOS</div>
              <h1>${config.nombre}</h1>
              <p class="desc">${config.descripcion}</p>
            </div>
            <table class="grid">${rowsHtml}</table>
            <div class="words-box">${wordsHtml}</div>
            <div class="footer">
              Muestra interactiva gratuita de <strong>${config.libroTitulo}</strong> • Ruichis Lab • ruichislab.com
            </div>
            <script>window.onload = () => { window.print(); };</script>
          </body>
          </html>
        `);
        win.document.close();
      } else {
        const rowsHtml = this.sudokuBoard
          .map(
            (row, r) =>
              `<tr>${row
                .map((v, c) => {
                  const br = r === 2 || r === 5 ? "border-bottom: 2.5px solid #111;" : "";
                  const bc = c === 2 || c === 5 ? "border-right: 2.5px solid #111;" : "";
                  return `<td style="${br}${bc}">${v !== 0 ? v : ""}</td>`;
                })
                .join("")}</tr>`
          )
          .join("");

        win.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Sudoku Maestro (${this.sudokuDifficulty.toUpperCase()}) — Ruichis Lab</title>
            <style>
              body { font-family: Georgia, serif; color: #111; max-width: 680px; margin: 24px auto; padding: 0 20px; text-align: center; }
              .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; }
              .imprint { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #444; }
              table.sudoku { margin: 24px auto; border-collapse: collapse; border: 3px solid #111; }
              table.sudoku td { width: 48px; height: 48px; text-align: center; vertical-align: middle; font-family: 'Courier New', monospace; font-size: 22px; font-weight: bold; border: 1px solid #999; }
              .footer { margin-top: 32px; font-size: 12px; color: #444; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="imprint">RUICHIS LAB • ENTRENAMIENTO DE FOCO PROFUNDO</div>
              <h1>Sudoku Maestro 9×9 — Nivel: ${this.sudokuDifficulty.toUpperCase()}</h1>
            </div>
            <table class="sudoku">${rowsHtml}</table>
            <div class="footer">
              Generado en el Gimnasio Mental de <strong>Ruichis Lab</strong> • Descubre nuestros libros en Amazon KDP • ruichislab.com
            </div>
            <script>window.onload = () => { window.print(); };</script>
          </body>
          </html>
        `);
        win.document.close();
      }
    }
  }

  window.GimnasioMental = GimnasioMental;
})();
