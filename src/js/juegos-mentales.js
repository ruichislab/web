// src/js/juegos-mentales.js
// Gimnasio Mental Ruichis Lab — Suite Cognitiva: Sopa de Letras (8 Direcciones), Sudoku Maestro 9x9 & Criptograma Asimétrico

(function () {
  // =========================================================================
  // SISTEMA DE AUDIO HÁPTICO (WEB AUDIO API SINTETIZADA NATIVA)
  // =========================================================================
  const GymAudio = {
    ctx: null,
    enabled: true,
    init() {
      const saved = localStorage.getItem("ruichis_gym_sound");
      if (saved === "off") this.enabled = false;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch (e) {
        this.enabled = false;
      }
    },
    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem("ruichis_gym_sound", this.enabled ? "on" : "off");
      return this.enabled;
    },
    playTone(freq, type = "sine", duration = 0.08, gainVal = 0.04) {
      if (!this.enabled || !this.ctx) return;
      try {
        if (this.ctx.state === "suspended") this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },
    click() { this.playTone(480, "sine", 0.03, 0.025); },
    cellSelect() { this.playTone(540, "sine", 0.04, 0.03); },
    foundWord() {
      this.playTone(659.25, "triangle", 0.1, 0.07);
      setTimeout(() => this.playTone(880, "triangle", 0.18, 0.08), 85);
    },
    victory() {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((n, i) => setTimeout(() => this.playTone(n, "triangle", 0.28, 0.09), i * 110));
    },
    error() { this.playTone(190, "sawtooth", 0.12, 0.04); }
  };

  // =========================================================================
  // SISTEMA DE RACHAS Y ESTADÍSTICAS PERSISTENTES (LOCALSTORAGE)
  // =========================================================================
  const GymStats = {
    load() {
      try {
        const raw = localStorage.getItem("ruichis_gym_stats");
        const data = raw ? JSON.parse(raw) : {};
        return {
          solved: data.solved || 0,
          streak: data.streak || 1,
          lastDate: data.lastDate || new Date().toISOString().slice(0, 10),
          wordsTotal: data.wordsTotal || 0
        };
      } catch (e) {
        return { solved: 0, streak: 1, lastDate: "", wordsTotal: 0 };
      }
    },
    save(stats) {
      try {
        localStorage.setItem("ruichis_gym_stats", JSON.stringify(stats));
      } catch (e) {}
    },
    recordSolve() {
      const s = this.load();
      const today = new Date().toISOString().slice(0, 10);
      s.solved += 1;
      if (s.lastDate) {
        const diffDays = Math.floor((new Date(today) - new Date(s.lastDate)) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) s.streak += 1;
        else if (diffDays > 1) s.streak = 1;
      }
      s.lastDate = today;
      this.save(s);
      return s;
    },
    recordWordFound() {
      const s = this.load();
      s.wordsTotal = (s.wordsTotal || 0) + 1;
      this.save(s);
      return s;
    }
  };

  // =========================================================================
  // TEMAS DE SOPA DE LETRAS CON GLOSARIO EDUCATIVO
  // =========================================================================
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
      ],
      glosario: {
        MESOPOTAMIA: "Cuna de la escritura cuneiforme y los primeros códigos de leyes de la humanidad.",
        ALEJANDRIA: "Hogar de la mítica biblioteca y epicentro del saber clásico helenístico.",
        RENACIMIENTO: "Movimiento cultural que restauró el humanismo, el arte y la ciencia empírica.",
        IMPRENTA: "Revolución tipográfica de Gutenberg que multiplicó el acceso al conocimiento.",
        ACROPOLIS: "Cumbre fortificada de Atenas y emblema de la democracia clásica occidental.",
        FILOSOFIA: "Amor por la sabiduría: examen riguroso de la verdad, la ética y la lógica.",
        CARTAGO: "Gran potencia mercantil del Mediterráneo y rival histórica de la República Romana.",
        BIZANCIO: "Imperio Romano de Oriente que preservó el derecho y la herencia clásica por mil años.",
        CRONICA: "Registro testimonial ordenado en el tiempo que preserva los hechos históricos.",
        MANUSCRITO: "Documento redactado o iluminado a mano antes del surgimiento de la imprenta.",
        DINASTIA: "Cadena de gobernantes de un mismo linaje que definieron eras históricas.",
        ORACULO: "Centro sagrado donde se consultaba la voluntad divina en santuarios como Delfos."
      }
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
      ],
      glosario: {
        VANGUARDIA: "Corrientes rupturistas que revolucionaron las formas artísticas en el siglo XX.",
        BARROCO: "Estilo caracterizado por el claroscuro, el dinamismo y la tensión dramática.",
        SIMBOLISMO: "Búsqueda poética de correspondencias sensoriales más allá de la apariencia visible.",
        METAFORA: "Traslación de sentido entre dos conceptos para iluminar una idea oculta.",
        SONETO: "Estructura poética clásica de catorce versos endecasílabos en dos cuartetos y dos tercetos.",
        ESCULTURA: "Modelado tridimensional en piedra, madera o bronce que desafía al espacio.",
        PERSPECTIVA: "Geometría visual desarrollada en el Renacimiento para recrear profundidad espacial.",
        LIENZO: "Soporte textil tensado para óleo o acrílico fundamental en la pintura de caballete.",
        ANTOLOGIA: "Selección curada de las mejores piezas literarias de una época o autor.",
        EPISTOLA: "Composición literaria en forma de carta con propósito doctrinal o reflexivo.",
        ESTETICA: "Rama de la filosofía que estudia la belleza, el arte y la percepción sensorial.",
        RETABLO: "Estructura artística monumental situada detrás del altar en templos históricos."
      }
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
      ],
      glosario: {
        MITOCONDRIA: "Orgánulo celular responsable de la respiración celular y la generación de ATP.",
        RIBOSOMA: "Complejo molecular encargado de la síntesis de proteínas a partir del ARNm.",
        CROMOSOMA: "Estructura organizada de ADN y proteínas que contiene la información hereditaria.",
        GENOMA: "Conjunto completo de instrucciones genéticas contenidas en un organismo.",
        ENZIMA: "Catalizador proteico que acelera millones de veces las reacciones químicas vitales.",
        NUCLEOTIDO: "Unidad monomérica fundamental del ADN y ARN formada por base, azúcar y fosfato.",
        MEIOSIS: "División celular que reduce a la mitad el número de cromosomas para formar gametos.",
        PROTEINA: "Macromolécula compuesta de aminoácidos con funciones estructurales y enzimáticas.",
        SINAPSIS: "Unión neuromuscular o neuronal por donde viaja el impulso eléctrico o químico.",
        CLOROPLASTO: "Orgánulo de células vegetales donde se realiza la fotosíntesis con clorofila.",
        CITOPLASMA: "Fluido celular que alberga los orgánulos y donde ocurren rutas metabólicas clave.",
        OSMOSIS: "Difusión pasiva del agua a través de una membrana semipermeable hacia mayor concentración."
      }
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
      ],
      glosario: {
        FOTOSINTESIS: "Conversión de energía lumínica en energía química sintetizando glucosa a partir de CO2.",
        BIODIVERSIDAD: "Variedad de seres vivos y ecosistemas que sostienen el equilibrio planetario.",
        SIMBIOSIS: "Asociación estrecha y continuada entre organismos de distintas especies biológicas.",
        TAXONOMIA: "Ciencia que clasifica y nombra a los seres vivos según parentesco y linaje.",
        ENDEMICO: "Especie que habita exclusivamente en una región geográfica concreta.",
        POLINIZACION: "Transferencia de polen desde los estambres hasta el estigma de las flores.",
        FILOGENIA: "Historia del desarrollo evolutivo y relaciones de parentesco entre linajes.",
        BIOMA: "Gran región bioclimática definida por su flora, fauna y clima dominante.",
        ADAPTACION: "Rasgo heredable que incrementa la probabilidad de supervivencia y reproducción.",
        MICELIO: "Red subterránea filamentosa de los hongos que nutre los suelos y conecta bosques.",
        ESTOMA: "Poro microscópico en hojas para el intercambio de gases y transpiración.",
        ESPECIE: "Grupo de poblaciones naturales cuyos individuos pueden cruzarse y dejar descendencia fértil."
      }
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
      ],
      glosario: {
        ASIMETRIA: "Principio de apalancamiento: el 20% de las acciones críticas genera el 80% del impacto.",
        ALGORITMO: "Conjunto sistemático de reglas finitas para resolver problemas complejos con precisión.",
        HEURISTICA: "Atajo mental práctico que acelera la toma de decisiones efectivas bajo incertidumbre.",
        SISTEMAS: "Arquitectura de procesos automatizados que elimina la fricción y el desgaste de voluntad.",
        ATENCION: "El recurso cognitivo más escaso: foco indiviso como motor de excelencia.",
        PALANCA: "Multiplicador de fuerza tecnológica para generar resultados exponenciales con menor esfuerzo.",
        EJECUCION: "La materialización disciplinada de ideas en bloques ininterrumpidos de trabajo puro.",
        MODULAR: "Diseño desacoplado donde cada componente puede evolucionar sin romper el conjunto.",
        AISLAMIENTO: "Erradicación radical de notificaciones y dispersión para proteger el estado de flujo.",
        SINAPSIS: "Conexión neuronal que se consolida mediante la práctica sostenida y el descanso estratégico.",
        IMPACTO: "Medida tangible del valor producido frente a la actividad superficial reactiva.",
        CLARIDAD: "Estado mental lúcido alcanzado al simplificar objetivos a lo estrictamente esencial."
      }
    }
  };

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

  // =========================================================================
  // BIBLIOTECA DE CRIPTOGRAMAS ASIMÉTRICOS (JUEGO III)
  // =========================================================================
  const CRIPTOGRAMAS = [
    {
      id: "foco-puro",
      libro: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      autor: "Ruichis Lab",
      frase: "EL FOCO ASIMETRICO COMPRIME UNA SEMANA EN DOS HORAS DE EJECUCION PURA",
      pista: "Principio medular del libro insignia sobre apalancamiento atencional y bloques puros."
    },
    {
      id: "sistema-libera",
      libro: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      autor: "Ruichis Lab",
      frase: "NO CONFUNDAS VELOCIDAD CON APALANCAMIENTO EL SISTEMA MODULAR LIBERA",
      pista: "Diferencia crítica entre el esfuerzo ciego y la arquitectura de sistemas duraderos."
    },
    {
      id: "claridad-arquitectura",
      libro: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      autor: "Ruichis Lab",
      frase: "LA CLARIDAD ARQUITECTONICA SUPRIME EL DESGASTE DE LA FUERZA DE VOLUNTAD",
      pista: "Axioma sobre la primacía de los sistemas modulares sobre el desgaste de la disciplina reactiva."
    },
    {
      id: "perseverancia-logica",
      libro: "100 Grandes Sopas de Letras (Colección Letras y Retos)",
      autor: "Ruichis Lab",
      frase: "LA PERSISTENCIA EN EL LABERINTO SUPERA SIEMPRE A LA PRISA DESORDENADA",
      pista: "Filosofía del entrenamiento mental: paciencia analítica para descubrir patrones ocultos."
    },
    {
      id: "moneda-atencion",
      libro: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      autor: "Ruichis Lab",
      frase: "LA ATENCION ES LA MONEDA MAS VALIOSA DEL SIGLO NO LA MALGASTES EN RUIDO",
      pista: "Sentencia sobre la soberanía mental frente a los micro-estímulos y la dispersión."
    }
  ];

  // =========================================================================
  // CLASE PRINCIPAL: GIMNASIO MENTAL
  // =========================================================================
  class GimnasioMental {
    constructor() {
      this.activeGame = "sopa"; // 'sopa' | 'sudoku' | 'criptograma'
      GymAudio.init();

      // Estado Sopa de Letras
      this.sopaTemaActual = "cultura_historia";
      this.sopaSize = 13;
      this.sopaGrid = [];
      this.sopaPlacements = [];
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
      this.sudokuNotes = [];
      this.sudokuSelected = { r: 0, c: 0 };
      this.sudokuNotesMode = false;
      this.sudokuHistory = [];
      this.sudokuSeconds = 0;
      this.sudokuTimerId = null;
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;

      // Estado Criptograma
      this.criptoIndex = 0;
      this.criptoGuess = [];
      this.criptoSelectedIndex = 0;
      this.criptoSolved = false;
    }

    init() {
      const container = document.getElementById("gimnasio-mental-app");
      if (!container) return;

      this.updateStatsDisplay();
      this.bindAudioToggle();
      this.bindZenMode();
      this.bindHubSwitching();
      this.initSopaGame();
      this.initSudokuGame();
      this.initCriptogramaGame();
    }

    updateStatsDisplay() {
      const stats = GymStats.load();
      const elSolved = document.getElementById("gym-solved-count");
      const elStreak = document.getElementById("gym-streak-count");
      if (elSolved) elSolved.textContent = stats.solved;
      if (elStreak) elStreak.textContent = `${stats.streak} ${stats.streak === 1 ? "Día" : "Días"}`;
    }

    bindAudioToggle() {
      const btn = document.getElementById("btn-toggle-sound");
      if (!btn) return;
      const updateLabel = () => {
        const icon = document.getElementById("sound-icon");
        const text = document.getElementById("sound-text");
        if (icon) icon.textContent = GymAudio.enabled ? "🔊" : "🔇";
        if (text) text.textContent = GymAudio.enabled ? "Sonido: ON" : "Sonido: OFF";
      };
      updateLabel();
      btn.addEventListener("click", () => {
        GymAudio.toggle();
        updateLabel();
        if (GymAudio.enabled) GymAudio.click();
      });
    }

    bindZenMode() {
      const btn = document.getElementById("btn-toggle-zen-mode");
      const app = document.getElementById("gimnasio-mental-app");
      if (!btn || !app) return;

      btn.addEventListener("click", () => {
        const isZen = app.classList.toggle("zen-mode");
        btn.innerHTML = isZen ? "✕ Salir de Modo Zen" : "⛶ Modo Zen";
        btn.classList.toggle("active", isZen);
        if (isZen) {
          document.body.style.overflow = "hidden";
          app.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.body.style.overflow = "";
        }
      });
    }

    bindHubSwitching() {
      const hubCards = document.querySelectorAll("[data-game-tab]");
      hubCards.forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-game-tab");
          this.switchGame(target);
          GymAudio.click();
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
      const criptoPanel = document.getElementById("panel-juego-criptograma");

      if (sopaPanel) sopaPanel.style.display = gameType === "sopa" ? "block" : "none";
      if (sudokuPanel) sudokuPanel.style.display = gameType === "sudoku" ? "block" : "none";
      if (criptoPanel) criptoPanel.style.display = gameType === "criptograma" ? "block" : "none";

      if (gameType === "sopa") {
        if (options.tema && TEMAS_SOPA[options.tema]) {
          const select = document.getElementById("sopa-tema-select");
          if (select) select.value = options.tema;
          this.sopaTemaActual = options.tema;
          this.generarNuevaSopa();
        }
        setTimeout(() => this.renderSopaSvgOverlay(), 50);
      } else if (gameType === "sudoku") {
        if (options.dificultad) {
          const diffBtns = document.querySelectorAll("[data-sudoku-diff]");
          diffBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-sudoku-diff") === options.dificultad));
          this.sudokuDifficulty = options.dificultad;
          this.generarNuevoSudoku();
        }
      } else if (gameType === "criptograma") {
        this.renderCriptograma();
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
          GymAudio.click();
        });
      }

      const btnNueva = document.getElementById("btn-sopa-nueva");
      if (btnNueva) btnNueva.addEventListener("click", () => {
        this.generarNuevaSopa();
        GymAudio.click();
      });

      const btnPista = document.getElementById("btn-sopa-pista");
      if (btnPista) btnPista.addEventListener("click", () => this.darPistaSopa());

      const btnResolver = document.getElementById("btn-sopa-resolver");
      if (btnResolver) btnResolver.addEventListener("click", () => this.resolverSopaCompleta());

      const btnImprimir = document.getElementById("btn-sopa-imprimir");
      if (btnImprimir) btnImprimir.addEventListener("click", () => this.imprimirPasatiempoActual("sopa"));

      window.addEventListener("mouseup", () => {
        if (this.sopaSelecting) {
          this.finalizarSeleccionSopa();
        }
      });

      window.addEventListener("resize", () => {
        if (this.activeGame === "sopa") {
          this.renderSopaSvgOverlay();
        }
      });

      this.generarNuevaSopa();
    }

    generarNuevaSopa() {
      const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
      this.sopaSize = config.gridSize || 13;
      const N = this.sopaSize;

      this.sopaGrid = Array.from({ length: N }, () => Array(N).fill(""));
      this.sopaPlacements = [];
      this.sopaFoundCount = 0;
      this.sopaHintsUsed = 0;
      this.sopaClickStart = null;
      this.sopaCurrentPath = [];

      const palabrasOrdenadas = [...config.palabras].sort((a, b) => b.length - a.length);

      palabrasOrdenadas.forEach((palabra, idx) => {
        const colocada = this.colocarPalabraBalanceada(palabra, idx);
        if (!colocada) {
          this.colocarPalabraForzada(palabra, idx);
        }
      });

      const alfabeto = "AAABCCDEEEFGHIIIJKLMNNOOOPQRRSSSTTUUVWXYZ";
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!this.sopaGrid[r][c]) {
            this.sopaGrid[r][c] = alfabeto[Math.floor(Math.random() * alfabeto.length)];
          }
        }
      }

      this.iniciarTimerSopa();
      this.renderSopaUI(config);
      this.actualizarPreviewPalabraSopa("");
      this.renderSopaSvgOverlay();
    }

    colocarPalabraBalanceada(palabra, idx) {
      const N = this.sopaSize;
      const len = palabra.length;
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

      mejoresCandidatos.sort((a, b) => b.intersecciones - a.intersecciones);
      const topPool = mejoresCandidatos.slice(0, 4);
      const elegida = topPool[Math.floor(Math.random() * topPool.length)];

      const cells = [];
      for (let i = 0; i < len; i++) {
        const nr = elegida.r + elegida.dir.dr * i;
        const nc = elegida.c + elegida.dir.dc * i;
        this.sopaGrid[nr][nc] = palabra[i];
        cells.push({ r: nr, c: nc });
      }

      this.sopaPlacements.push({
        word: palabra,
        cells,
        dir: elegida.dir,
        found: false,
        colorIndex: idx % COLORES_PALABRAS.length
      });

      return true;
    }

    colocarPalabraForzada(palabra, idx) {
      const N = this.sopaSize;
      const len = palabra.length;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c <= N - len; c++) {
          let libre = true;
          for (let i = 0; i < len; i++) {
            if (this.sopaGrid[r][c + i] !== "" && this.sopaGrid[r][c + i] !== palabra[i]) {
              libre = false;
              break;
            }
          }
          if (libre) {
            const cells = [];
            for (let i = 0; i < len; i++) {
              this.sopaGrid[r][c + i] = palabra[i];
              cells.push({ r, c: c + i });
            }
            this.sopaPlacements.push({
              word: palabra,
              cells,
              dir: DIRECCIONES_8[0],
              found: false,
              colorIndex: idx % COLORES_PALABRAS.length
            });
            return true;
          }
        }
      }
      return false;
    }

    iniciarTimerSopa() {
      if (this.sopaTimerId) clearInterval(this.sopaTimerId);
      this.sopaSeconds = 0;
      const timerEl = document.getElementById("sopa-timer");
      if (timerEl) timerEl.textContent = "00:00";

      this.sopaTimerId = setInterval(() => {
        this.sopaSeconds++;
        const mins = String(Math.floor(this.sopaSeconds / 60)).padStart(2, "0");
        const secs = String(this.sopaSeconds % 60).padStart(2, "0");
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
      }, 1000);
    }

    renderSopaUI(config) {
      const gridBoard = document.getElementById("sopa-grid-board");
      const wordList = document.getElementById("sopa-word-list");
      const descEl = document.getElementById("sopa-tema-descripcion");
      const counterEl = document.getElementById("sopa-found-counter");
      const fillEl = document.getElementById("sopa-progress-fill");
      const statusEl = document.getElementById("sopa-status-msg");
      const libroTitEl = document.getElementById("sopa-libro-vinculado-titulo");
      const libroLinkEl = document.getElementById("sopa-libro-vinculado-link");

      if (descEl) descEl.textContent = config.descripcion;
      if (counterEl) counterEl.textContent = `0 / ${config.palabras.length}`;
      if (fillEl) fillEl.style.width = "0%";
      if (statusEl) {
        statusEl.className = "puzzle-status-bar";
        statusEl.innerHTML = "Arrastra sobre las letras o haz clic en la primera y última letra de cada palabra (8 direcciones).";
      }
      if (libroTitEl) libroTitEl.textContent = config.libroTitulo;
      if (libroLinkEl) libroLinkEl.href = config.libroUrl;

      if (wordList) {
        wordList.innerHTML = config.palabras
          .map((p, idx) => {
            const def = config.glosario && config.glosario[p] ? config.glosario[p] : "";
            return `
            <li class="sopa-word-chip" data-word="${p}" title="${def ? def : 'Buscar esta palabra en el tablero'}">
              <span class="chip-bullet">◆</span>
              <span class="chip-text">${p}</span>
              ${def ? `<button type="button" class="btn-word-info" data-word-def="${def}" aria-label="Ver significado">ℹ️</button>` : ""}
            </li>
          `;
          })
          .join("");

        wordList.querySelectorAll(".btn-word-info").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const def = btn.getAttribute("data-word-def");
            alert(`📖 Nota Editorial Ruichis Lab:\n\n${def}`);
          });
        });
      }

      if (gridBoard) {
        gridBoard.style.gridTemplateColumns = `repeat(${this.sopaSize}, 1fr)`;
        gridBoard.style.gridTemplateRows = `repeat(${this.sopaSize}, 1fr)`;

        let cellsHtml = "";
        for (let r = 0; r < this.sopaSize; r++) {
          for (let c = 0; c < this.sopaSize; c++) {
            cellsHtml += `<div class="sopa-cell" data-r="${r}" data-c="${c}">${this.sopaGrid[r][c]}</div>`;
          }
        }
        gridBoard.innerHTML = cellsHtml;

        this.bindSopaGridInteractions(gridBoard);
      }
    }

    bindSopaGridInteractions(gridBoard) {
      const getCoords = (el) => ({
        r: parseInt(el.getAttribute("data-r"), 10),
        c: parseInt(el.getAttribute("data-c"), 10)
      });

      // Eventos Mouse
      gridBoard.querySelectorAll(".sopa-cell").forEach(cell => {
        cell.addEventListener("mousedown", (e) => {
          e.preventDefault();
          const coords = getCoords(cell);
          this.iniciarSeleccionSopa(coords);
          GymAudio.cellSelect();
        });

        cell.addEventListener("mouseenter", () => {
          if (this.sopaSelecting) {
            const coords = getCoords(cell);
            this.actualizarCaminoSopa(coords);
          }
        });

        cell.addEventListener("click", () => {
          const coords = getCoords(cell);
          this.manejarClickSopa(coords);
        });
      });

      // Soporte Touch
      gridBoard.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("sopa-cell")) {
          e.preventDefault();
          this.iniciarSeleccionSopa(getCoords(target));
          GymAudio.cellSelect();
        }
      }, { passive: false });

      gridBoard.addEventListener("touchmove", (e) => {
        if (!this.sopaSelecting) return;
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("sopa-cell")) {
          this.actualizarCaminoSopa(getCoords(target));
        }
      }, { passive: false });

      gridBoard.addEventListener("touchend", () => {
        if (this.sopaSelecting) {
          this.finalizarSeleccionSopa();
        }
      });
    }

    iniciarSeleccionSopa(coords) {
      this.sopaSelecting = true;
      this.sopaStartCell = coords;
      this.sopaCurrentPath = [coords];
      this.resaltarCaminoTemporal();
    }

    actualizarCaminoSopa(endCoords) {
      if (!this.sopaStartCell) return;
      const dr = endCoords.r - this.sopaStartCell.r;
      const dc = endCoords.c - this.sopaStartCell.c;

      const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
      const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;

      const lenR = Math.abs(dr);
      const lenC = Math.abs(dc);

      const esValido = dr === 0 || dc === 0 || lenR === lenC;

      if (!esValido) return;

      const steps = Math.max(lenR, lenC);
      const path = [];
      for (let i = 0; i <= steps; i++) {
        path.push({
          r: this.sopaStartCell.r + stepR * i,
          c: this.sopaStartCell.c + stepC * i
        });
      }

      this.sopaCurrentPath = path;
      this.resaltarCaminoTemporal();

      const palabraFormada = path.map(pt => this.sopaGrid[pt.r][pt.c]).join("");
      this.actualizarPreviewPalabraSopa(palabraFormada);
    }

    manejarClickSopa(coords) {
      if (!this.sopaClickStart) {
        this.sopaClickStart = coords;
        document.querySelectorAll(".sopa-cell").forEach(c => c.classList.remove("click-anchor"));
        const cell = document.querySelector(`.sopa-cell[data-r="${coords.r}"][data-c="${coords.c}"]`);
        if (cell) cell.classList.add("click-anchor");
        this.actualizarPreviewPalabraSopa(this.sopaGrid[coords.r][coords.c]);
      } else {
        const start = this.sopaClickStart;
        const end = coords;
        this.sopaClickStart = null;
        document.querySelectorAll(".sopa-cell").forEach(c => c.classList.remove("click-anchor"));

        const dr = end.r - start.r;
        const dc = end.c - start.c;
        const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
        const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
        const lenR = Math.abs(dr);
        const lenC = Math.abs(dc);

        if (dr === 0 || dc === 0 || lenR === lenC) {
          const steps = Math.max(lenR, lenC);
          const path = [];
          for (let i = 0; i <= steps; i++) {
            path.push({ r: start.r + stepR * i, c: start.c + stepC * i });
          }
          this.sopaCurrentPath = path;
          this.finalizarSeleccionSopa();
        } else {
          GymAudio.error();
        }
      }
    }

    resaltarCaminoTemporal() {
      document.querySelectorAll(".sopa-cell").forEach(c => c.classList.remove("selecting"));
      this.sopaCurrentPath.forEach(pt => {
        const cell = document.querySelector(`.sopa-cell[data-r="${pt.r}"][data-c="${pt.c}"]`);
        if (cell) cell.classList.add("selecting");
      });
      this.renderSopaSvgOverlay();
    }

    finalizarSeleccionSopa() {
      this.sopaSelecting = false;
      document.querySelectorAll(".sopa-cell").forEach(c => c.classList.remove("selecting"));

      if (this.sopaCurrentPath.length === 0) return;

      const palabraFormada = this.sopaCurrentPath.map(pt => this.sopaGrid[pt.r][pt.c]).join("");
      const palabraInvertida = palabraFormada.split("").reverse().join("");

      let acertada = null;
      for (const p of this.sopaPlacements) {
        if (!p.found && (p.word === palabraFormada || p.word === palabraInvertida)) {
          const cellsMatch =
            this.coincidenCeldas(p.cells, this.sopaCurrentPath) ||
            this.coincidenCeldas(p.cells, [...this.sopaCurrentPath].reverse());
          if (cellsMatch) {
            acertada = p;
            break;
          }
        }
      }

      if (acertada) {
        acertada.found = true;
        this.sopaFoundCount++;
        GymAudio.foundWord();
        GymStats.recordWordFound();

        this.marcarPalabraEncontradaUI(acertada);
        this.renderSopaSvgOverlay();
        this.mostrarMensajeFeedback(`¡Excelente! Has encontrado <strong>${acertada.word}</strong>.`, "success");

        if (this.sopaFoundCount === this.sopaPlacements.length) {
          this.victoriaSopa();
        }
      } else {
        GymAudio.error();
      }

      this.sopaCurrentPath = [];
      this.sopaStartCell = null;
      this.actualizarPreviewPalabraSopa("");
      this.renderSopaSvgOverlay();
    }

    coincidenCeldas(a, b) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].r !== b[i].r || a[i].c !== b[i].c) return false;
      }
      return true;
    }

    marcarPalabraEncontradaUI(placement) {
      const chip = document.querySelector(`.sopa-word-chip[data-word="${placement.word}"]`);
      if (chip) {
        chip.classList.add("found");
        const color = COLORES_PALABRAS[placement.colorIndex];
        chip.style.borderColor = color.dot;
        chip.style.color = color.dot;
      }

      placement.cells.forEach(pt => {
        const cell = document.querySelector(`.sopa-cell[data-r="${pt.r}"][data-c="${pt.c}"]`);
        if (cell) {
          cell.classList.add("found");
          cell.setAttribute("data-color-idx", placement.colorIndex);
        }
      });

      const total = this.sopaPlacements.length;
      const pct = Math.round((this.sopaFoundCount / total) * 100);
      const counterEl = document.getElementById("sopa-found-counter");
      const fillEl = document.getElementById("sopa-progress-fill");
      if (counterEl) counterEl.textContent = `${this.sopaFoundCount} / ${total}`;
      if (fillEl) fillEl.style.width = `${pct}%`;
    }

    renderSopaSvgOverlay() {
      const svg = document.getElementById("sopa-svg-overlay");
      const grid = document.getElementById("sopa-grid-board");
      if (!svg || !grid) return;

      const N = this.sopaSize;
      const step = 100 / N;
      const half = step / 2;

      let markup = "";

      // Dibujar palabras ya encontradas
      this.sopaPlacements.forEach(p => {
        if (p.found) {
          const first = p.cells[0];
          const last = p.cells[p.cells.length - 1];
          const x1 = first.c * step + half;
          const y1 = first.r * step + half;
          const x2 = last.c * step + half;
          const y2 = last.r * step + half;
          const color = COLORES_PALABRAS[p.colorIndex] || COLORES_PALABRAS[0];

          markup += `
            <line
              x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"
              stroke="${color.stroke}"
              stroke-width="${step * 0.76}%"
              stroke-linecap="round"
            />
          `;
        }
      });

      // Dibujar selección activa
      if (this.sopaCurrentPath.length > 1) {
        const first = this.sopaCurrentPath[0];
        const last = this.sopaCurrentPath[this.sopaCurrentPath.length - 1];
        const x1 = first.c * step + half;
        const y1 = first.r * step + half;
        const x2 = last.c * step + half;
        const y2 = last.r * step + half;

        markup += `
          <line
            x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%"
            stroke="rgba(0, 168, 255, 0.55)"
            stroke-width="${step * 0.74}%"
            stroke-linecap="round"
            stroke-dasharray="2, 1"
          />
        `;
      }

      svg.innerHTML = markup;
    }

    actualizarPreviewPalabraSopa(texto) {
      const lettersEl = document.getElementById("sopa-live-letters");
      const pillEl = document.getElementById("sopa-live-preview");
      if (lettersEl) lettersEl.textContent = texto || "—";
      if (pillEl) pillEl.classList.toggle("active", Boolean(texto));
    }

    mostrarMensajeFeedback(html, tipo = "info") {
      const msg = document.getElementById("sopa-status-msg");
      if (!msg) return;
      msg.className = `puzzle-status-bar ${tipo}`;
      msg.innerHTML = html;
    }

    darPistaSopa() {
      const noEncontradas = this.sopaPlacements.filter(p => !p.found);
      if (noEncontradas.length === 0) return;

      const randomP = noEncontradas[Math.floor(Math.random() * noEncontradas.length)];
      const firstCell = randomP.cells[0];
      const cellEl = document.querySelector(`.sopa-cell[data-r="${firstCell.r}"][data-c="${firstCell.c}"]`);

      if (cellEl) {
        cellEl.classList.add("hint-pulse");
        GymAudio.playTone(720, "sine", 0.2, 0.05);
        this.mostrarMensajeFeedback(`💡 Pista: Primera letra de <strong>${randomP.word}</strong> resaltada en la cuadrícula.`, "warning");
        setTimeout(() => cellEl.classList.remove("hint-pulse"), 3500);
      }
    }

    resolverSopaCompleta() {
      if (!confirm("¿Deseas revelar la solución completa de esta Sopa de Letras?")) return;
      this.sopaPlacements.forEach(p => {
        if (!p.found) {
          p.found = true;
          this.marcarPalabraEncontradaUI(p);
        }
      });
      this.renderSopaSvgOverlay();
      this.mostrarMensajeFeedback("Tablero resuelto por completo.", "info");
    }

    victoriaSopa() {
      if (this.sopaTimerId) clearInterval(this.sopaTimerId);
      GymAudio.victory();
      GymStats.recordSolve();
      this.updateStatsDisplay();

      const mins = Math.floor(this.sopaSeconds / 60);
      const secs = this.sopaSeconds % 60;
      this.mostrarMensajeFeedback(
        `🏆 ¡FELICITACIONES! Has completado el reto en <strong>${mins}m ${secs}s</strong>.`,
        "success"
      );
    }

    // =========================================================================
    // MOTOR 2: SUDOKU MAESTRO 9X9 CON PENCIL NOTES Y AUTO-CANDIDATOS
    // =========================================================================
    initSudokuGame() {
      const diffButtons = document.querySelectorAll("[data-sudoku-diff]");
      diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          diffButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.sudokuDifficulty = btn.getAttribute("data-sudoku-diff");
          this.generarNuevoSudoku();
          GymAudio.click();
        });
      });

      const btnNuevo = document.getElementById("btn-sudoku-nuevo");
      if (btnNuevo) btnNuevo.addEventListener("click", () => {
        this.generarNuevoSudoku();
        GymAudio.click();
      });

      const btnNotas = document.getElementById("btn-sudoku-notas");
      if (btnNotas) {
        btnNotas.addEventListener("click", () => {
          this.sudokuNotesMode = !this.sudokuNotesMode;
          btnNotas.classList.toggle("active", this.sudokuNotesMode);
          btnNotas.setAttribute("aria-pressed", this.sudokuNotesMode ? "true" : "false");
          GymAudio.click();
        });
      }

      const btnAuto = document.getElementById("btn-sudoku-autocandidatos");
      if (btnAuto) btnAuto.addEventListener("click", () => this.calcularAutoCandidatos());

      const btnDeshacer = document.getElementById("btn-sudoku-deshacer");
      if (btnDeshacer) btnDeshacer.addEventListener("click", () => this.deshacerJugadaSudoku());

      const btnBorrar = document.getElementById("btn-sudoku-borrar");
      if (btnBorrar) btnBorrar.addEventListener("click", () => this.borrarCeldaActualSudoku());

      const btnPista = document.getElementById("btn-sudoku-pista");
      if (btnPista) btnPista.addEventListener("click", () => this.darPistaSudoku());

      const btnVerificar = document.getElementById("btn-sudoku-verificar");
      if (btnVerificar) btnVerificar.addEventListener("click", () => this.verificarSudoku());

      const btnImprimir = document.getElementById("btn-sudoku-imprimir");
      if (btnImprimir) btnImprimir.addEventListener("click", () => this.imprimirPasatiempoActual("sudoku"));

      const btnVictoryNew = document.getElementById("btn-sudoku-victory-new");
      if (btnVictoryNew) btnVictoryNew.addEventListener("click", () => {
        this.generarNuevoSudoku();
        GymAudio.click();
      });

      const btnVictoryView = document.getElementById("btn-sudoku-victory-view");
      if (btnVictoryView) btnVictoryView.addEventListener("click", () => {
        const overlay = document.getElementById("sudoku-victory-overlay");
        if (overlay) overlay.hidden = true;
        GymAudio.click();
      });

      // Teclado numérico virtual
      document.querySelectorAll("[data-sudoku-num]").forEach(btn => {
        btn.addEventListener("click", () => {
          const num = parseInt(btn.getAttribute("data-sudoku-num"), 10);
          this.ingresarNumeroSudoku(num);
        });
      });

      // Teclado físico
      window.addEventListener("keydown", (e) => {
        if (this.activeGame !== "sudoku") return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        const key = e.key;
        if (key >= "1" && key <= "9") {
          this.ingresarNumeroSudoku(parseInt(key, 10));
        } else if (key === "Backspace" || key === "Delete") {
          this.borrarCeldaActualSudoku();
        } else if (key.toLowerCase() === "n") {
          if (btnNotas) btnNotas.click();
        } else if (key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
          this.deshacerJugadaSudoku();
        } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
          e.preventDefault();
          this.moverSeleccionSudoku(key);
        }
      });

      this.generarNuevoSudoku();
    }

    generarNuevoSudoku() {
      this.sudokuSolution = this.generarTableroCompletoValido();
      this.sudokuInitial = this.vaciarCeldasSegunDificultad(this.sudokuSolution, this.sudokuDifficulty);
      this.sudokuBoard = this.sudokuInitial.map(row => [...row]);
      this.sudokuNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
      this.sudokuHistory = [];
      this.sudokuSelected = { r: 0, c: 0 };
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;

      const overlay = document.getElementById("sudoku-victory-overlay");
      if (overlay) overlay.hidden = true;

      this.actualizarContadorErroresSudoku();
      const msg = document.getElementById("sudoku-status-msg");
      if (msg) {
        msg.className = "puzzle-status-bar";
        msg.innerHTML = 'Selecciona una celda y usa el teclado numérico (1–9), activa <strong>✏️ Notas (Lápiz)</strong> o pulsa <strong>✨ Auto-Candidatos</strong> para desplegar todas las opciones lógicas.';
      }

      this.iniciarTimerSudoku();
      this.renderSudokuGrid();
      this.actualizarProgresoYTecladoSudoku();
    }

    generarTableroCompletoValido() {
      const board = Array.from({ length: 9 }, () => Array(9).fill(0));

      const esValido = (b, r, c, val) => {
        for (let i = 0; i < 9; i++) {
          if (b[r][i] === val || b[i][c] === val) return false;
        }
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (b[br + i][bc + j] === val) return false;
          }
        }
        return true;
      };

      const resolver = (r = 0, c = 0) => {
        if (r === 9) return true;
        const nextR = c === 8 ? r + 1 : r;
        const nextC = c === 8 ? 0 : c + 1;

        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const val of nums) {
          if (esValido(board, r, c, val)) {
            board[r][c] = val;
            if (resolver(nextR, nextC)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      };

      resolver();
      return board;
    }

    vaciarCeldasSegunDificultad(solucion, diff) {
      const board = solucion.map(row => [...row]);
      const pistasPorDiff = {
        facil: 44,
        medio: 34,
        dificil: 28,
        experto: 24
      };
      const pistasDeseadas = pistasPorDiff[diff] || 34;
      const celdasABorrar = 81 - pistasDeseadas;

      const indices = [];
      for (let i = 0; i < 81; i++) indices.push(i);
      indices.sort(() => Math.random() - 0.5);

      for (let i = 0; i < celdasABorrar; i++) {
        const idx = indices[i];
        const r = Math.floor(idx / 9);
        const c = idx % 9;
        board[r][c] = 0;
      }
      return board;
    }

    iniciarTimerSudoku() {
      if (this.sudokuTimerId) clearInterval(this.sudokuTimerId);
      this.sudokuSeconds = 0;
      const timerEl = document.getElementById("sudoku-timer");
      if (timerEl) timerEl.textContent = "00:00";

      this.sudokuTimerId = setInterval(() => {
        this.sudokuSeconds++;
        const mins = String(Math.floor(this.sudokuSeconds / 60)).padStart(2, "0");
        const secs = String(this.sudokuSeconds % 60).padStart(2, "0");
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
      }, 1000);
    }

    renderSudokuGrid() {
      const grid = document.getElementById("sudoku-grid-board");
      if (!grid) return;

      grid.innerHTML = "";
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = this.sudokuBoard[r][c];
          const isGiven = this.sudokuInitial[r][c] !== 0;

          const cell = document.createElement("div");
          cell.className = `sudoku-cell ${isGiven ? "given" : ""}`;
          cell.setAttribute("data-r", r);
          cell.setAttribute("data-c", c);

          if (val !== 0) {
            cell.textContent = val;
          } else {
            this.renderPencilNotesEnCelda(cell, r, c);
          }

          cell.addEventListener("click", () => {
            this.seleccionarCeldaSudoku(r, c);
            GymAudio.cellSelect();
          });

          grid.appendChild(cell);
        }
      }

      this.seleccionarCeldaSudoku(this.sudokuSelected.r, this.sudokuSelected.c);
      this.actualizarConflictosSudoku();
    }

    actualizarContadorErroresSudoku() {
      const countEl = document.getElementById("sudoku-mistakes-count");
      const pillEl = document.getElementById("sudoku-mistakes-pill");
      if (countEl) countEl.textContent = String(this.sudokuMistakes || 0);
      if (pillEl) pillEl.classList.toggle("has-error", (this.sudokuMistakes || 0) > 0);
    }

    tieneConflictoReglaSudoku(r, c, val) {
      if (val === 0) return false;
      for (let i = 0; i < 9; i++) {
        if (i !== c && this.sudokuBoard[r][i] === val) return true;
        if (i !== r && this.sudokuBoard[i][c] === val) return true;
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const rr = br + i;
          const cc = bc + j;
          if ((rr !== r || cc !== c) && this.sudokuBoard[rr][cc] === val) return true;
        }
      }
      return false;
    }

    actualizarConflictosSudoku() {
      document.querySelectorAll(".sudoku-cell").forEach(cell => {
        const r = parseInt(cell.getAttribute("data-r"), 10);
        const c = parseInt(cell.getAttribute("data-c"), 10);
        const val = this.sudokuBoard[r][c];
        const isGiven = this.sudokuInitial[r][c] !== 0;

        const isWrong = val !== 0 && !isGiven && (val !== this.sudokuSolution[r][c] || this.tieneConflictoReglaSudoku(r, c, val));
        cell.classList.toggle("conflict", isWrong);
      });
    }

    renderPencilNotesEnCelda(cellEl, r, c) {
      const notes = this.sudokuNotes[r][c];
      if (!notes || notes.size === 0) {
        cellEl.innerHTML = "";
        return;
      }

      let pencilHtml = '<div class="sudoku-pencil-grid">';
      for (let n = 1; n <= 9; n++) {
        pencilHtml += `<span class="sudoku-pencil-digit">${notes.has(n) ? n : ""}</span>`;
      }
      pencilHtml += "</div>";
      cellEl.innerHTML = pencilHtml;
    }

    seleccionarCeldaSudoku(r, c) {
      this.sudokuSelected = { r, c };
      const currentVal = this.sudokuBoard[r][c];
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;

      document.querySelectorAll(".sudoku-cell").forEach(cell => {
        const cr = parseInt(cell.getAttribute("data-r"), 10);
        const cc = parseInt(cell.getAttribute("data-c"), 10);
        const val = this.sudokuBoard[cr][cc];

        cell.classList.remove("selected", "highlighted", "match-number");

        if (cr === r && cc === c) {
          cell.classList.add("selected");
        } else if (cr === r || cc === c || (Math.floor(cr / 3) * 3 === boxR && Math.floor(cc / 3) * 3 === boxC)) {
          cell.classList.add("highlighted");
        }

        if (currentVal !== 0 && val === currentVal) {
          cell.classList.add("match-number");
        }
      });
    }

    moverSeleccionSudoku(dir) {
      let { r, c } = this.sudokuSelected;
      if (dir === "ArrowUp") r = (r - 1 + 9) % 9;
      if (dir === "ArrowDown") r = (r + 1) % 9;
      if (dir === "ArrowLeft") c = (c - 1 + 9) % 9;
      if (dir === "ArrowRight") c = (c + 1) % 9;
      this.seleccionarCeldaSudoku(r, c);
    }

    ingresarNumeroSudoku(num) {
      if (this.sudokuCompleted) return;
      const { r, c } = this.sudokuSelected;
      if (this.sudokuInitial[r][c] !== 0) {
        GymAudio.error();
        return;
      }

      this.guardarEstadoHistorialSudoku();

      const cellEl = document.querySelector(`.sudoku-cell[data-r="${r}"][data-c="${c}"]`);
      const msg = document.getElementById("sudoku-status-msg");

      if (this.sudokuNotesMode) {
        const notes = this.sudokuNotes[r][c];
        if (notes.has(num)) notes.delete(num);
        else notes.add(num);
        this.sudokuBoard[r][c] = 0;
        GymAudio.click();
        this.renderPencilNotesEnCelda(cellEl, r, c);
      } else {
        this.sudokuBoard[r][c] = num;
        this.sudokuNotes[r][c].clear();
        if (cellEl) cellEl.textContent = num;

        const esIncorrecto = num !== this.sudokuSolution[r][c];
        if (esIncorrecto) {
          this.sudokuMistakes++;
          this.actualizarContadorErroresSudoku();
          GymAudio.error();

          if (cellEl) {
            cellEl.classList.remove("error-shake", "correct-pop");
            void cellEl.offsetWidth;
            cellEl.classList.add("error-shake");
          }

          if (msg) {
            const hayConflicto = this.tieneConflictoReglaSudoku(r, c, num);
            msg.className = "puzzle-status-bar warning";
            msg.innerHTML = hayConflicto
              ? `❌ El número <strong>${num}</strong> en (${r + 1}, ${c + 1}) repite un dígito en su fila, columna o bloque 3×3.`
              : `❌ El número <strong>${num}</strong> no corresponde a la celda (${r + 1}, ${c + 1}). Puedes corregirlo o pulsar <strong>🧹 Borrar</strong>.`;
          }
        } else {
          GymAudio.playTone(400 + num * 40, "sine", 0.05, 0.04);
          if (cellEl) {
            cellEl.classList.remove("error-shake", "correct-pop");
            void cellEl.offsetWidth;
            cellEl.classList.add("correct-pop");
          }
          this.limpiarNotasEnParesSudoku(r, c, num);

          if (msg && msg.classList.contains("warning")) {
            msg.className = "puzzle-status-bar";
            msg.innerHTML = "✔️ Celda corregida. Sigue completando el tablero.";
          }
        }
      }

      this.actualizarConflictosSudoku();
      this.actualizarProgresoYTecladoSudoku();
      this.seleccionarCeldaSudoku(r, c);

      if (this.esTableroCompletoSudoku()) {
        this.victoriaSudoku();
      }
    }

    limpiarNotasEnParesSudoku(r, c, num) {
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;

      for (let i = 0; i < 9; i++) {
        this.sudokuNotes[r][i].delete(num);
        this.sudokuNotes[i][c].delete(num);
      }
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          this.sudokuNotes[boxR + i][boxC + j].delete(num);
        }
      }

      document.querySelectorAll(".sudoku-cell").forEach(cell => {
        const cr = parseInt(cell.getAttribute("data-r"), 10);
        const cc = parseInt(cell.getAttribute("data-c"), 10);
        if (this.sudokuBoard[cr][cc] === 0) {
          this.renderPencilNotesEnCelda(cell, cr, cc);
        }
      });
    }

    borrarCeldaActualSudoku() {
      if (this.sudokuCompleted) return;
      const { r, c } = this.sudokuSelected;
      if (this.sudokuInitial[r][c] !== 0) return;

      this.guardarEstadoHistorialSudoku();
      this.sudokuBoard[r][c] = 0;
      this.sudokuNotes[r][c].clear();

      const cellEl = document.querySelector(`.sudoku-cell[data-r="${r}"][data-c="${c}"]`);
      if (cellEl) {
        cellEl.textContent = "";
        cellEl.classList.remove("conflict", "error-shake", "correct-pop");
      }

      GymAudio.click();
      this.actualizarConflictosSudoku();
      this.actualizarProgresoYTecladoSudoku();
      this.seleccionarCeldaSudoku(r, c);
    }

    guardarEstadoHistorialSudoku() {
      const snapshot = {
        board: this.sudokuBoard.map(row => [...row]),
        notes: this.sudokuNotes.map(row => row.map(set => new Set(set)))
      };
      this.sudokuHistory.push(snapshot);
      if (this.sudokuHistory.length > 30) this.sudokuHistory.shift();
    }

    deshacerJugadaSudoku() {
      if (this.sudokuCompleted || this.sudokuHistory.length === 0) return;
      const prev = this.sudokuHistory.pop();
      this.sudokuBoard = prev.board;
      this.sudokuNotes = prev.notes;
      this.renderSudokuGrid();
      this.actualizarConflictosSudoku();
      this.actualizarProgresoYTecladoSudoku();
      GymAudio.click();
    }

    calcularAutoCandidatos() {
      this.guardarEstadoHistorialSudoku();
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] === 0) {
            this.sudokuNotes[r][c] = this.obtenerCandidatosValidos(r, c);
            const cellEl = document.querySelector(`.sudoku-cell[data-r="${r}"][data-c="${c}"]`);
            if (cellEl) this.renderPencilNotesEnCelda(cellEl, r, c);
          }
        }
      }
      GymAudio.playTone(700, "sine", 0.12, 0.05);
      const msg = document.getElementById("sudoku-status-msg");
      if (msg) msg.innerHTML = "✨ <strong>Auto-candidatos calculados</strong> para todas las celdas vacías.";
    }

    obtenerCandidatosValidos(r, c) {
      const usados = new Set();
      for (let i = 0; i < 9; i++) {
        if (this.sudokuBoard[r][i] !== 0) usados.add(this.sudokuBoard[r][i]);
        if (this.sudokuBoard[i][c] !== 0) usados.add(this.sudokuBoard[i][c]);
      }
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.sudokuBoard[br + i][bc + j] !== 0) usados.add(this.sudokuBoard[br + i][bc + j]);
        }
      }

      const validos = new Set();
      for (let n = 1; n <= 9; n++) {
        if (!usados.has(n)) validos.add(n);
      }
      return validos;
    }

    darPistaSudoku() {
      const vacias = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] === 0) vacias.push({ r, c });
        }
      }
      if (vacias.length === 0) return;

      const celda = vacias[Math.floor(Math.random() * vacias.length)];
      const numCorrecto = this.sudokuSolution[celda.r][celda.c];

      this.seleccionarCeldaSudoku(celda.r, celda.c);
      this.ingresarNumeroSudoku(numCorrecto);

      GymAudio.playTone(620, "sine", 0.15, 0.05);
      const msg = document.getElementById("sudoku-status-msg");
      if (msg) msg.innerHTML = `💡 Pista revelada: Celda (${celda.r + 1}, ${celda.c + 1}) completada.`;
    }

    verificarSudoku() {
      let errores = 0;
      document.querySelectorAll(".sudoku-cell").forEach(cell => {
        const r = parseInt(cell.getAttribute("data-r"), 10);
        const c = parseInt(cell.getAttribute("data-c"), 10);
        const val = this.sudokuBoard[r][c];

        cell.classList.remove("conflict");
        if (val !== 0 && val !== this.sudokuSolution[r][c]) {
          cell.classList.add("conflict");
          errores++;
        }
      });

      const msg = document.getElementById("sudoku-status-msg");
      if (msg) {
        if (errores === 0) {
          GymAudio.foundWord();
          msg.className = "puzzle-status-bar success";
          msg.innerHTML = "✔️ ¡Excelente! Todas las celdas ingresadas hasta ahora son 100% correctas.";
        } else {
          GymAudio.error();
          msg.className = "puzzle-status-bar warning";
          msg.innerHTML = `⚠️ Se encontraron <strong>${errores}</strong> celdas con errores (resaltadas en rojo).`;
        }
      }
    }

    actualizarProgresoYTecladoSudoku() {
      const conteo = Array(10).fill(0);
      let llenas = 0;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = this.sudokuBoard[r][c];
          if (val !== 0) {
            conteo[val]++;
            llenas++;
          }
        }
      }

      for (let n = 1; n <= 9; n++) {
        const rem = 9 - conteo[n];
        const btn = document.querySelector(`[data-sudoku-num="${n}"]`);
        if (btn) {
          const remEl = btn.querySelector(".numpad-rem");
          if (remEl) remEl.textContent = rem > 0 ? rem : "✓";
          btn.classList.toggle("digit-complete", rem <= 0);
        }
      }

      const counterEl = document.getElementById("sudoku-progress-counter");
      if (counterEl) counterEl.textContent = `${llenas} / 81`;
    }

    esTableroCompletoSudoku() {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] !== this.sudokuSolution[r][c]) {
            return false;
          }
        }
      }
      return true;
    }

    victoriaSudoku() {
      if (this.sudokuTimerId) clearInterval(this.sudokuTimerId);
      this.sudokuCompleted = true;
      GymAudio.victory();
      GymStats.recordSolve();
      this.updateStatsDisplay();

      const mins = Math.floor(this.sudokuSeconds / 60);
      const secs = this.sudokuSeconds % 60;
      const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      const diffLabels = {
        facil: "Fácil",
        medio: "Medio",
        dificil: "Difícil",
        experto: "Experto"
      };

      const msg = document.getElementById("sudoku-status-msg");
      if (msg) {
        msg.className = "puzzle-status-bar success";
        msg.innerHTML = `🏆 ¡SUDOKU RESUELTO CON ÉXITO! Tiempo total: <strong>${mins}m ${secs}s</strong> • Errores: <strong>${this.sudokuMistakes}</strong>.`;
      }

      const overlay = document.getElementById("sudoku-victory-overlay");
      const timeEl = document.getElementById("sudoku-victory-time");
      const mistakesEl = document.getElementById("sudoku-victory-mistakes");
      const diffEl = document.getElementById("sudoku-victory-diff");
      const subtitleEl = document.getElementById("sudoku-victory-subtitle");

      if (timeEl) timeEl.textContent = formattedTime;
      if (mistakesEl) mistakesEl.textContent = String(this.sudokuMistakes);
      if (diffEl) diffEl.textContent = diffLabels[this.sudokuDifficulty] || "Medio";
      if (subtitleEl) {
        subtitleEl.textContent = this.sudokuMistakes === 0
          ? "¡Partida perfecta sin un solo error! Precisión lógica absoluta."
          : "Has completado las 81 celdas correctamente.";
      }
      if (overlay) overlay.hidden = false;
    }

    // =========================================================================
    // MOTOR 3: CRIPTOGRAMA ASIMÉTRICO (JUEGO III DE SABIDURÍA EDITORIAL)
    // =========================================================================
    initCriptogramaGame() {
      const btnNuevo = document.getElementById("btn-cripto-nuevo");
      if (btnNuevo) btnNuevo.addEventListener("click", () => {
        this.siguienteCriptograma();
        GymAudio.click();
      });

      const btnPista = document.getElementById("btn-cripto-pista");
      if (btnPista) btnPista.addEventListener("click", () => this.darPistaCriptograma());

      const btnVerificar = document.getElementById("btn-cripto-verificar");
      if (btnVerificar) btnVerificar.addEventListener("click", () => this.verificarCriptograma());

      const btnImprimir = document.getElementById("btn-cripto-imprimir");
      if (btnImprimir) btnImprimir.addEventListener("click", () => this.imprimirPasatiempoActual("criptograma"));

      // Teclado virtual del criptograma
      const teclado = document.getElementById("cripto-keyboard");
      if (teclado) {
        const alfabeto = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
        teclado.innerHTML = alfabeto
          .map(letra => `<button type="button" class="btn-keyboard-key" data-key="${letra}">${letra}</button>`)
          .join("") + `<button type="button" class="btn-keyboard-key key-del" data-key="DEL">⌫</button>`;

        teclado.querySelectorAll("[data-key]").forEach(k => {
          k.addEventListener("click", () => {
            const val = k.getAttribute("data-key");
            if (val === "DEL") {
              this.borrarLetraCriptograma();
            } else {
              this.ingresarLetraCriptograma(val);
            }
          });
        });
      }

      // Teclado físico
      window.addEventListener("keydown", (e) => {
        if (this.activeGame !== "criptograma") return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        const key = e.key.toUpperCase();
        if (/^[A-ZÑ]$/.test(key)) {
          this.ingresarLetraCriptograma(key);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          this.borrarLetraCriptograma();
        } else if (e.key === "ArrowLeft") {
          this.moverSlotCriptograma(-1);
        } else if (e.key === "ArrowRight") {
          this.moverSlotCriptograma(1);
        }
      });

      this.cargarCriptograma(0);
    }

    cargarCriptograma(index) {
      this.criptoIndex = index % CRIPTOGRAMAS.length;
      const data = CRIPTOGRAMAS[this.criptoIndex];
      this.criptoSolved = false;

      // Crear estado de respuestas
      this.criptoGuess = data.frase.split("").map(ch => {
        if (ch === " ") return " ";
        // Revelar el 20% de las letras iniciales como anclaje
        return Math.random() < 0.22 ? ch : "";
      });

      // Encontrar primer slot vacío
      this.criptoSelectedIndex = this.criptoGuess.findIndex(ch => ch === "");
      if (this.criptoSelectedIndex === -1) this.criptoSelectedIndex = 0;

      this.renderCriptograma();
    }

    siguienteCriptograma() {
      this.cargarCriptograma(this.criptoIndex + 1);
    }

    renderCriptograma() {
      const data = CRIPTOGRAMAS[this.criptoIndex];
      const bookEl = document.getElementById("cripto-book-ref");
      const hintEl = document.getElementById("cripto-hint-text");
      const boardEl = document.getElementById("cripto-board-slots");
      const statusEl = document.getElementById("cripto-status-msg");

      if (bookEl) bookEl.textContent = `${data.autor} • ${data.libro}`;
      if (hintEl) hintEl.textContent = data.pista;
      if (statusEl) {
        statusEl.className = "puzzle-status-bar";
        statusEl.innerHTML = "Selecciona una casilla y escribe la letra para descifrar el aforismo.";
      }

      if (!boardEl) return;

      const palabras = data.frase.split(" ");
      let slotIndex = 0;
      let html = "";

      palabras.forEach(palabra => {
        html += '<div class="cripto-word-cluster">';
        for (let i = 0; i < palabra.length; i++) {
          const currentIndex = slotIndex;
          const letter = this.criptoGuess[currentIndex];
          const isSelected = currentIndex === this.criptoSelectedIndex;

          html += `
            <div class="cripto-slot ${isSelected ? "selected" : ""} ${letter ? "filled" : ""}" data-slot-idx="${currentIndex}">
              <span class="slot-letter">${letter || ""}</span>
              <span class="slot-line"></span>
            </div>
          `;
          slotIndex++;
        }
        html += "</div>";
        slotIndex++; // Por el espacio
      });

      boardEl.innerHTML = html;

      boardEl.querySelectorAll(".cripto-slot").forEach(slot => {
        slot.addEventListener("click", () => {
          const idx = parseInt(slot.getAttribute("data-slot-idx"), 10);
          this.criptoSelectedIndex = idx;
          this.renderCriptograma();
          GymAudio.cellSelect();
        });
      });
    }

    ingresarLetraCriptograma(letra) {
      if (this.criptoSolved) return;
      const data = CRIPTOGRAMAS[this.criptoIndex];

      this.criptoGuess[this.criptoSelectedIndex] = letra;
      GymAudio.click();

      // Mover al siguiente slot vacío
      let next = this.criptoSelectedIndex + 1;
      while (next < data.frase.length && (data.frase[next] === " " || this.criptoGuess[next] !== "")) {
        next++;
      }
      if (next < data.frase.length) {
        this.criptoSelectedIndex = next;
      }

      this.renderCriptograma();

      if (this.criptoGuess.join("") === data.frase) {
        this.victoriaCriptograma();
      }
    }

    borrarLetraCriptograma() {
      if (this.criptoSolved) return;
      this.criptoGuess[this.criptoSelectedIndex] = "";
      GymAudio.click();
      this.renderCriptograma();
    }

    moverSlotCriptograma(dir) {
      const data = CRIPTOGRAMAS[this.criptoIndex];
      let next = this.criptoSelectedIndex + dir;
      while (next >= 0 && next < data.frase.length && data.frase[next] === " ") {
        next += dir;
      }
      if (next >= 0 && next < data.frase.length) {
        this.criptoSelectedIndex = next;
        this.renderCriptograma();
      }
    }

    darPistaCriptograma() {
      const data = CRIPTOGRAMAS[this.criptoIndex];
      const vacios = [];
      for (let i = 0; i < data.frase.length; i++) {
        if (data.frase[i] !== " " && this.criptoGuess[i] !== data.frase[i]) {
          vacios.push(i);
        }
      }
      if (vacios.length === 0) return;

      const idx = vacios[Math.floor(Math.random() * vacios.length)];
      this.criptoGuess[idx] = data.frase[idx];
      this.criptoSelectedIndex = idx;
      GymAudio.playTone(650, "sine", 0.15, 0.05);
      this.renderCriptograma();

      if (this.criptoGuess.join("") === data.frase) {
        this.victoriaCriptograma();
      }
    }

    verificarCriptograma() {
      const data = CRIPTOGRAMAS[this.criptoIndex];
      let errores = 0;
      for (let i = 0; i < data.frase.length; i++) {
        if (data.frase[i] !== " " && this.criptoGuess[i] && this.criptoGuess[i] !== data.frase[i]) {
          errores++;
        }
      }

      const statusEl = document.getElementById("cripto-status-msg");
      if (statusEl) {
        if (errores === 0) {
          GymAudio.foundWord();
          statusEl.className = "puzzle-status-bar success";
          statusEl.innerHTML = "✔️ ¡Excelente deducción! Todas las letras ingresadas son correctas.";
        } else {
          GymAudio.error();
          statusEl.className = "puzzle-status-bar warning";
          statusEl.innerHTML = `⚠️ Se han detectado <strong>${errores}</strong> letras erróneas en tu propuesta.`;
        }
      }
    }

    victoriaCriptograma() {
      this.criptoSolved = true;
      GymAudio.victory();
      GymStats.recordSolve();
      this.updateStatsDisplay();

      const data = CRIPTOGRAMAS[this.criptoIndex];
      const statusEl = document.getElementById("cripto-status-msg");
      if (statusEl) {
        statusEl.className = "puzzle-status-bar success";
        statusEl.innerHTML = `
          🏆 <strong>¡CRIPTOGRAMA RESUELTO!</strong><br>
          «<em>${data.frase}</em>» — <strong>${data.autor}</strong> (${data.libro}).
        `;
      }
    }

    // =========================================================================
    // IMPRESIÓN LIMPIA EN FORMATO LIBRO PARA LLEVAR AL PAPEL FÍSICO
    // =========================================================================
    imprimirPasatiempoActual(tipo) {
      const win = window.open("", "_blank");
      if (!win) return;

      if (tipo === "sopa") {
        const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
        const rowsHtml = this.sopaGrid
          .map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`)
          .join("");

        const wordsHtml = config.palabras
          .map(w => `<span class="word-tag">□ ${w}</span>`)
          .join(" ");

        win.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>${config.nombre} — Ruichis Lab</title>
            <style>
              body { font-family: Georgia, serif; color: #111; max-width: 680px; margin: 24px auto; padding: 0 20px; text-align: center; }
              .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; }
              .imprint { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #444; }
              h1 { font-size: 20px; margin: 8px 0; font-family: Georgia, serif; }
              p.desc { font-size: 13px; color: #555; margin: 0; }
              table.grid { margin: 24px auto; border-collapse: collapse; }
              table.grid td { width: 32px; height: 32px; text-align: center; vertical-align: middle; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; border: 1px solid #ddd; }
              .words-box { margin-top: 24px; padding: 16px; border: 1px solid #111; border-radius: 4px; text-align: left; }
              .word-tag { display: inline-block; width: 32%; margin-bottom: 8px; font-family: 'Courier New', monospace; font-size: 13px; }
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
              Muestra física del libro <strong>${config.libroTitulo}</strong> • Ruichis Lab • ruichislab.com
            </div>
            <script>window.onload = () => { window.print(); };</script>
          </body>
          </html>
        `);
        win.document.close();
      } else if (tipo === "sudoku") {
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
      } else if (tipo === "criptograma") {
        const data = CRIPTOGRAMAS[this.criptoIndex];
        win.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Criptograma Asimétrico — Ruichis Lab</title>
            <style>
              body { font-family: Georgia, serif; color: #111; max-width: 680px; margin: 24px auto; padding: 0 20px; }
              .header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
              .imprint { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #444; }
              .pista { background: #f4f4f4; padding: 14px; border-left: 3px solid #111; font-style: italic; margin-bottom: 24px; }
              .phrase-box { border: 2px dashed #333; padding: 30px; letter-spacing: 4px; font-family: monospace; font-size: 18px; line-height: 2.2; text-align: center; }
              .footer { margin-top: 32px; font-size: 12px; color: #444; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="imprint">RUICHIS LAB • CRIPTOGRAMAS & FILOSOFÍA</div>
              <h1>Criptograma Asimétrico</h1>
              <p>Fuente: <strong>${data.libro}</strong> (${data.autor})</p>
            </div>
            <div class="pista">Pista: ${data.pista}</div>
            <div class="phrase-box">
              ${data.frase.replace(/[A-ZÑ]/g, "_ ")}
            </div>
            <div class="footer">
              Gimnasio Mental de <strong>Ruichis Lab</strong> • ruichislab.com
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
