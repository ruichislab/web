// src/js/juegos-mentales.js
// Gimnasio Mental Ruichis Lab — Suite Cognitiva: Sopas de Letras Pro (8 Direcciones) & Sudoku Maestro 9x9

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
  // TEMAS DE SOPA DE LETRAS PRO CON GLOSARIO EDUCATIVO (20+ PALABRAS POR TEMA)
  // =========================================================================
  const TEMAS_SOPA = {
    cultura_historia: {
      nombre: "Vol. I: Cultura General — Historia y Civilizaciones",
      libroTitulo: "100 Grandes Sopas de Letras de Cultura General (Vol. I)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      libroId: "sopas-cultura-general",
      descripcion: "Rastrea conceptos clave de las grandes civilizaciones antiguas, la historia clásica y los hitos documentales de la humanidad.",
      palabras: [
        "MESOPOTAMIA", "ALEJANDRIA", "RENACIMIENTO", "IMPRENTA",
        "ACROPOLIS", "FILOSOFIA", "CARTAGO", "BIZANCIO",
        "CRONICA", "MANUSCRITO", "DINASTIA", "ORACULO",
        "BABILONIA", "ESPARTA", "PARTENON", "PERGAMINO",
        "REPUBLICA", "SENADO", "IMPERIO", "ARCHIVO"
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
        ORACULO: "Centro sagrado donde se consultaba la voluntad divina en santuarios como Delfos.",
        BABILONIA: "Metrópoli antigua famosa por sus jardines colgantes y el Código de Hammurabi.",
        ESPARTA: "Polis griega célebre por su disciplina cívica, austeridad y entrenamiento militar.",
        PARTENON: "Templo dórico consagrado a Atenea en la Acrópolis, cumbre de la arquitectura clásica.",
        PERGAMINO: "Material de escritura elaborado con piel tratada que sustituyó progresivamente al papiro.",
        REPUBLICA: "Forma de gobierno basada en la ley, la magistratura y la representación ciudadana.",
        SENADO: "Asamblea deliberativa suprema que articuló la política de la antigua Roma.",
        IMPERIO: "Organización política extensa que integra múltiples territorios bajo una autoridad central.",
        ARCHIVO: "Repositorio institucional dedicado a conservar documentos históricos y legales."
      }
    },
    cultura_arte: {
      nombre: "Vol. I: Cultura General — Arte, Literatura y Filosofía",
      libroTitulo: "100 Grandes Sopas de Letras de Cultura General (Vol. I)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Cultura+General+Ruichis+Lab",
      libroId: "sopas-cultura-general",
      descripcion: "Movimientos estéticos, géneros literarios y técnicas maestras del arte universal presentes en nuestro Volumen I.",
      palabras: [
        "VANGUARDIA", "BARROCO", "SIMBOLISMO", "METAFORA",
        "SONETO", "ESCULTURA", "PERSPECTIVA", "LIENZO",
        "ANTOLOGIA", "EPISTOLA", "ESTETICA", "RETABLO",
        "CLAROSCURO", "FRESCO", "ODISEA", "TRAGEDIA",
        "ENSAYO", "POETICA", "MUSEO", "CANON"
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
        RETABLO: "Estructura artística monumental situada detrás del altar en templos históricos.",
        CLAROSCURO: "Contraste intenso entre luces y sombras para modelar volumen y dramatismo.",
        FRESCO: "Técnica pictórica mural aplicada sobre mortero de cal aún húmedo.",
        ODISEA: "Epopeya clásica que narra el regreso, el ingenio y la resiliencia frente al destino.",
        TRAGEDIA: "Género dramático clásico que explora los dilemas morales y la catarsis humana.",
        ENSAYO: "Prosa reflexiva breve que examina una idea con libertad estilística y rigor.",
        POETICA: "Tratado o conjunto de principios que rigen la creación literaria y artística.",
        MUSEO: "Institución dedicada a custodiar, investigar y exhibir el patrimonio cultural.",
        CANON: "Conjunto de obras y reglas consideradas ejemplares dentro de una tradición."
      }
    },
    biologia_celula: {
      nombre: "Vol. II: Biología — Célula, Genética y Vida Molecular",
      libroTitulo: "100 Grandes Sopas de Letras de Biología (Vol. II)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Biologia+Ruichis+Lab",
      libroId: "sopas-biologia",
      descripcion: "Explora la maquinaria microscópica de la vida: orgánulos celulares, genética molecular y bioquímica.",
      palabras: [
        "MITOCONDRIA", "RIBOSOMA", "CROMOSOMA", "GENOMA",
        "ENZIMA", "NUCLEOTIDO", "MEIOSIS", "PROTEINA",
        "SINAPSIS", "CLOROPLASTO", "CITOPLASMA", "OSMOSIS",
        "MEMBRANA", "LISOSOMA", "MUTACION", "MITOSIS",
        "GLUCOSA", "NEURONA", "TEJIDO", "NUCLEO"
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
        OSMOSIS: "Difusión pasiva del agua a través de una membrana semipermeable hacia mayor concentración.",
        MEMBRANA: "Bicapa lipídica selectiva que delimita la célula y regula el intercambio molecular.",
        LISOSOMA: "Vesícula celular rica en enzimas digestivas encargada de reciclar componentes.",
        MUTACION: "Cambio heredable en la secuencia de nucleótidos que impulsa la variabilidad genética.",
        MITOSIS: "División celular ecuacional que origina dos células hijas genéticamente idénticas.",
        GLUCOSA: "Monosacárido esencial que actúa como combustible primario del metabolismo celular.",
        NEURONA: "Célula excitable del sistema nervioso especializada en procesar y transmitir señales.",
        TEJIDO: "Conjunto organizado de células especializadas que cooperan en una misma función.",
        NUCLEO: "Compartimento eucariota que resguarda el ADN y coordina la expresión génica."
      }
    },
    biologia_ecosistemas: {
      nombre: "Vol. II: Biología — Botánica, Zoología y Evolución",
      libroTitulo: "100 Grandes Sopas de Letras de Biología (Vol. II)",
      libroUrl: "https://www.amazon.com/s?k=100+Grandes+Sopas+de+Letras+de+Biologia+Ruichis+Lab",
      libroId: "sopas-biologia",
      descripcion: "Procesos ecológicos, botánica y mecanismos evolutivos seleccionados del Volumen II de la Colección Letras y Retos.",
      palabras: [
        "FOTOSINTESIS", "BIODIVERSIDAD", "SIMBIOSIS", "TAXONOMIA",
        "ENDEMICO", "POLINIZACION", "FILOGENIA", "BIOMA",
        "ADAPTACION", "MICELIO", "ESTOMA", "ESPECIE",
        "HABITAT", "ECOSISTEMA", "PREDADOR", "FAUNA",
        "FLORA", "CLOROFILA", "SAVIA", "CORAL"
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
        ESPECIE: "Grupo de poblaciones naturales cuyos individuos pueden cruzarse y dejar descendencia fértil.",
        HABITAT: "Entorno físico y biológico específico donde una especie encuentra refugio y recursos.",
        ECOSISTEMA: "Sistema dinámico formado por la comunidad biológica y su ambiente abiótico.",
        PREDADOR: "Organismo que regula poblaciones al cazar y consumir a otras especies.",
        FAUNA: "Conjunto de especies animales que habitan una región o período geológico.",
        FLORA: "Conjunto de especies vegetales características de un territorio determinado.",
        CLOROFILA: "Pigmento verde esencial que captura fotones solares en plantas y algas.",
        SAVIA: "Fluido vital que transporta agua, minerales y azúcares por los vasos vegetales.",
        CORAL: "Organismo marino colonial que construye arrecifes ricos en vida oceánica."
      }
    },
    productividad_sistemas: {
      nombre: "Especial: Productividad Asimétrica & Foco Profundo",
      libroTitulo: "Productividad Asimétrica (ASIN: B0HD2MY2HN)",
      libroUrl: "https://www.amazon.com/dp/B0HD2MY2HN",
      libroId: "productividad-asimetrica-es",
      descripcion: "Conceptos clave de ejecución profunda, aislamiento cognitivo, apalancamiento algorítmico y sistemas modulares.",
      palabras: [
        "ASIMETRIA", "ALGORITMO", "HEURISTICA", "SISTEMAS",
        "ATENCION", "PALANCA", "EJECUCION", "MODULAR",
        "AISLAMIENTO", "SINAPSIS", "IMPACTO", "CLARIDAD",
        "DISCIPLINA", "PRECISION", "SINTESIS", "CRITERIO",
        "FLUJO", "MAESTRIA", "RITMO", "METODO"
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
        CLARIDAD: "Estado mental lúcido alcanzado al simplificar objetivos a lo estrictamente esencial.",
        DISCIPLINA: "Consistencia deliberada en la ejecución más allá de la fluctuación emocional.",
        PRECISION: "Exactitud quirúrgica al definir metas, métricas y bloques de concentración.",
        SINTESIS: "Capacidad de condensar información compleja en principios accionables claros.",
        CRITERIO: "Juicio estratégico para distinguir lo urgente y ruidoso de lo verdaderamente vital.",
        FLUJO: "Estado de inmersión total donde el tiempo se diluye y el rendimiento se multiplica.",
        MAESTRIA: "Dominio profundo adquirido tras ciclos continuos de práctica y retroalimentación.",
        RITMO: "Cadencia sostenible que equilibra picos de esfuerzo intenso con recuperación real.",
        METODO: "Procedimiento ordenado y replicable que convierte la intención en resultado."
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
  // CLASE PRINCIPAL: GIMNASIO MENTAL
  // =========================================================================
  class GimnasioMental {
    constructor() {
      this.activeGame = "sopa"; // 'sopa' | 'sudoku'
      GymAudio.init();

      // Estado Sopa de Letras Pro
      this.sopaTemaActual = "cultura_historia";
      this.sopaMode = "14"; // '12' | '14' | '16' | 'diario'
      this.sopaSize = 14;
      this.sopaCurrentWords = [];
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
      this.sopaCompleted = false;

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
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const target = btn.getAttribute("data-game-tab");
            this.switchGame(target);
            GymAudio.click();
          }
        });
      });
    }

    switchGame(gameType, options = {}) {
      this.activeGame = gameType === "sudoku" ? "sudoku" : "sopa";

      document.querySelectorAll("[data-game-tab]").forEach(btn => {
        const isActive = btn.getAttribute("data-game-tab") === this.activeGame;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      const sopaPanel = document.getElementById("panel-juego-sopa");
      const sudokuPanel = document.getElementById("panel-juego-sudoku");

      if (sopaPanel) sopaPanel.style.display = this.activeGame === "sopa" ? "block" : "none";
      if (sudokuPanel) sudokuPanel.style.display = this.activeGame === "sudoku" ? "block" : "none";

      if (this.activeGame === "sopa") {
        if (options.tema && TEMAS_SOPA[options.tema]) {
          const select = document.getElementById("sopa-tema-select");
          if (select) select.value = options.tema;
          this.sopaTemaActual = options.tema;
          this.generarNuevaSopa();
        }
        setTimeout(() => this.renderSopaSvgOverlay(), 50);
      } else if (this.activeGame === "sudoku") {
        if (options.dificultad) {
          const diffBtns = document.querySelectorAll("[data-sudoku-diff]");
          diffBtns.forEach(b => b.classList.toggle("active", b.getAttribute("data-sudoku-diff") === options.dificultad));
          this.sudokuDifficulty = options.dificultad;
          this.generarNuevoSudoku();
        }
      }
    }

    // =========================================================================
    // MOTOR 1: SOPA DE LETRAS PRO EN 8 DIRECCIONES (COLECCIÓN LETRAS Y RETOS)
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

      const sizeBtns = document.querySelectorAll("[data-sopa-size]");
      sizeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          sizeBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.sopaMode = btn.getAttribute("data-sopa-size") || "14";
          this.generarNuevaSopa();
          GymAudio.click();
        });
      });

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

      const btnVictoryShare = document.getElementById("btn-sopa-victory-share");
      if (btnVictoryShare) btnVictoryShare.addEventListener("click", () => this.compartirResultadoSopa(btnVictoryShare));

      const btnVictoryNew = document.getElementById("btn-sopa-victory-new");
      if (btnVictoryNew) {
        btnVictoryNew.addEventListener("click", () => {
          this.generarNuevaSopa();
          GymAudio.click();
        });
      }

      const btnVictoryView = document.getElementById("btn-sopa-victory-view");
      if (btnVictoryView) {
        btnVictoryView.addEventListener("click", () => {
          const ov = document.getElementById("sopa-victory-overlay");
          if (ov) ov.hidden = true;
          GymAudio.click();
        });
      }

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

    actualizarMejorTiempoSopaUI() {
      const bestEl = document.getElementById("sopa-best-time");
      if (!bestEl) return;
      try {
        const raw = localStorage.getItem("ruichis_sopa_best_v1");
        const bests = raw ? JSON.parse(raw) : {};
        const sec = bests[this.sopaMode];
        bestEl.textContent = typeof sec === "number" ? this.formatearTiempoMMSS(sec) : "--:--";
      } catch (e) {
        bestEl.textContent = "--:--";
      }
    }

    generarNuevaSopa() {
      const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
      const isDiario = this.sopaMode === "diario";
      const N = isDiario ? 14 : (parseInt(this.sopaMode, 10) || 14);
      this.sopaSize = N;

      const wordCount = N === 12 ? 8 : N === 16 ? 12 : 10;
      const rng = isDiario
        ? this.crearRngSemilla(`ruichis-sopa-${this.sopaTemaActual}-${this.obtenerFechaHoyKey()}`)
        : Math.random;

      // Barajar banco de palabras que caben en N×N y seleccionar subconjunto fresco
      const elegibles = config.palabras.filter(w => w.length <= N);
      const pool = [...elegibles];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      this.sopaCurrentWords = pool.slice(0, Math.min(wordCount, pool.length));

      this.sopaGrid = Array.from({ length: N }, () => Array(N).fill(""));
      this.sopaPlacements = [];
      this.sopaFoundCount = 0;
      this.sopaHintsUsed = 0;
      this.sopaClickStart = null;
      this.sopaCurrentPath = [];
      this.sopaCompleted = false;

      const victoryOverlay = document.getElementById("sopa-victory-overlay");
      if (victoryOverlay) victoryOverlay.hidden = true;

      const palabrasOrdenadas = [...this.sopaCurrentWords].sort((a, b) => b.length - a.length);

      palabrasOrdenadas.forEach((palabra, idx) => {
        const colocada = this.colocarPalabraBalanceada(palabra, idx, rng);
        if (!colocada) {
          this.colocarPalabraForzada(palabra, idx);
        }
      });

      const alfabeto = "AAABCCDEEEFGHIIIJKLMNNOOOPQRRSSSTTUUVWXYZ";
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!this.sopaGrid[r][c]) {
            this.sopaGrid[r][c] = alfabeto[Math.floor(rng() * alfabeto.length)];
          }
        }
      }

      this.iniciarTimerSopa();
      this.actualizarMejorTiempoSopaUI();
      this.renderSopaUI(config);
      this.actualizarPreviewPalabraSopa("");
      this.renderSopaSvgOverlay();
    }

    colocarPalabraBalanceada(palabra, idx, rng = Math.random) {
      const N = this.sopaSize;
      const len = palabra.length;
      const dirsShuffled = [...DIRECCIONES_8];
      for (let i = dirsShuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [dirsShuffled[i], dirsShuffled[j]] = [dirsShuffled[j], dirsShuffled[i]];
      }

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
      const elegida = topPool[Math.floor(rng() * topPool.length)];

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
      const panelTitleEl = document.getElementById("sopa-words-panel-title");
      const fillEl = document.getElementById("sopa-progress-fill");
      const statusEl = document.getElementById("sopa-status-msg");
      const libroTitEl = document.getElementById("sopa-libro-vinculado-titulo");
      const libroLinkEl = document.getElementById("sopa-libro-vinculado-link");

      const words = this.sopaCurrentWords;

      if (descEl) descEl.textContent = config.descripcion;
      if (counterEl) counterEl.textContent = `0 / ${words.length}`;
      if (panelTitleEl) panelTitleEl.textContent = `Palabras a Encontrar (${words.length})`;
      if (fillEl) fillEl.style.width = "0%";
      if (statusEl) {
        statusEl.className = "puzzle-status-bar";
        statusEl.innerHTML = this.sopaMode === "diario"
          ? "📅 <strong>Sopa del Día</strong>: mismo tablero y palabras para toda la comunidad hoy. Arrastra o haz clic en inicio y fin."
          : "Arrastra sobre las letras o haz clic en la primera y última letra de cada palabra (8 direcciones).";
      }
      if (libroTitEl) libroTitEl.textContent = config.libroTitulo;
      if (libroLinkEl) libroLinkEl.href = config.libroUrl;

      if (wordList) {
        wordList.innerHTML = words
          .map((p) => {
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
      if (this.sopaCompleted) return;
      this.sopaCompleted = true;
      if (this.sopaTimerId) clearInterval(this.sopaTimerId);
      GymAudio.victory();
      GymStats.recordSolve();
      this.updateStatsDisplay();

      const timeStr = this.formatearTiempoMMSS(this.sopaSeconds);
      const mins = Math.floor(this.sopaSeconds / 60);
      const secs = this.sopaSeconds % 60;
      const total = this.sopaPlacements.length;

      // Guardar mejor tiempo por modo/tamaño
      let isNewRecord = false;
      try {
        const raw = localStorage.getItem("ruichis_sopa_best_v1");
        const bests = raw ? JSON.parse(raw) : {};
        if (typeof bests[this.sopaMode] !== "number" || this.sopaSeconds < bests[this.sopaMode]) {
          bests[this.sopaMode] = this.sopaSeconds;
          localStorage.setItem("ruichis_sopa_best_v1", JSON.stringify(bests));
          isNewRecord = true;
        }
      } catch (e) {}
      this.actualizarMejorTiempoSopaUI();

      this.mostrarMensajeFeedback(
        `🏆 ¡FELICITACIONES! Has completado el reto en <strong>${mins}m ${secs}s</strong>.`,
        "success"
      );

      const modeLabels = {
        "12": "12×12 Normal",
        "14": "14×14 Desafío",
        "16": "16×16 Experto",
        "diario": "📅 Sopa del Día"
      };
      const overlay = document.getElementById("sopa-victory-overlay");
      const timeEl = document.getElementById("sopa-victory-time");
      const wordsEl = document.getElementById("sopa-victory-words");
      const modeEl = document.getElementById("sopa-victory-mode");
      const badgeEl = document.getElementById("sopa-victory-record-badge");

      if (timeEl) timeEl.textContent = timeStr;
      if (wordsEl) wordsEl.textContent = `${total} / ${total}`;
      if (modeEl) modeEl.textContent = modeLabels[this.sopaMode] || `${this.sopaSize}×${this.sopaSize}`;
      if (badgeEl) badgeEl.hidden = !isNewRecord;
      if (overlay) overlay.hidden = false;

      this.lanzarConfetiEn(".sopa-board-frame");
    }

    compartirResultadoSopa(btn) {
      const config = TEMAS_SOPA[this.sopaTemaActual] || TEMAS_SOPA.cultura_historia;
      const modeLabels = {
        "12": "12×12 Normal",
        "14": "14×14 Desafío",
        "16": "16×16 Experto",
        "diario": `Sopa del Día (${this.obtenerFechaHoyKey()})`
      };
      const label = modeLabels[this.sopaMode] || `${this.sopaSize}×${this.sopaSize}`;
      const timeStr = this.formatearTiempoMMSS(this.sopaSeconds);
      const total = this.sopaPlacements.length;
      const shareText = `🔤 Sopas de Letras Pro — Ruichis Lab\nTema: ${config.nombre}\nModo: ${label}\n⏱️ Tiempo: ${timeStr} | 🎯 Palabras: ${total}/${total}\nJuega gratis sin anuncios: https://ruichislab.com/#sopa`;

      const markCopied = () => {
        if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = "✅ ¡Resultado Copiado!";
        setTimeout(() => { btn.innerHTML = orig; }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(markCopied).catch(() => {
          alert(shareText);
        });
      } else {
        alert(shareText);
      }
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

      const btnPausa = document.getElementById("btn-sudoku-pausa");
      if (btnPausa) btnPausa.addEventListener("click", () => this.togglePausaSudoku());

      const btnResume = document.getElementById("btn-sudoku-resume");
      if (btnResume) btnResume.addEventListener("click", () => this.togglePausaSudoku(false));

      const btnLivesMode = document.getElementById("btn-sudoku-lives-mode");
      if (btnLivesMode) {
        btnLivesMode.addEventListener("click", () => {
          this.sudokuLivesMode = !this.sudokuLivesMode;
          btnLivesMode.classList.toggle("active", this.sudokuLivesMode);
          btnLivesMode.setAttribute("aria-pressed", this.sudokuLivesMode ? "true" : "false");
          btnLivesMode.textContent = this.sudokuLivesMode ? "❤️ 3 Vidas: ON" : "❤️ 3 Vidas: OFF";
          this.actualizarContadorErroresSudoku();
          GymAudio.click();
        });
      }

      const btnStats = document.getElementById("btn-sudoku-stats");
      if (btnStats) btnStats.addEventListener("click", () => this.abrirModalEstadisticasSudoku());

      const btnStatsClose = document.getElementById("btn-sudoku-stats-close");
      if (btnStatsClose) {
        btnStatsClose.addEventListener("click", () => {
          const modal = document.getElementById("sudoku-stats-overlay");
          if (modal) modal.hidden = true;
          GymAudio.click();
        });
      }

      const btnRetrySame = document.getElementById("btn-sudoku-retry-same");
      if (btnRetrySame) btnRetrySame.addEventListener("click", () => this.reintentarMismoSudoku());

      const btnGameOverNew = document.getElementById("btn-sudoku-gameover-new");
      if (btnGameOverNew) btnGameOverNew.addEventListener("click", () => {
        this.generarNuevoSudoku();
        GymAudio.click();
      });

      const btnFastMode = document.getElementById("btn-sudoku-fast-mode");
      if (btnFastMode) {
        btnFastMode.addEventListener("click", () => {
          this.sudokuFastMode = !this.sudokuFastMode;
          btnFastMode.classList.toggle("active", this.sudokuFastMode);
          btnFastMode.setAttribute("aria-pressed", this.sudokuFastMode ? "true" : "false");
          if (!this.sudokuFastMode) {
            this.sudokuLockedNumber = null;
            document.querySelectorAll("[data-sudoku-num]").forEach(b => b.classList.remove("fast-active"));
            this.seleccionarCeldaSudoku(this.sudokuSelected.r, this.sudokuSelected.c);
          }
          GymAudio.click();
        });
      }

      const btnVictoryShare = document.getElementById("btn-sudoku-victory-share");
      if (btnVictoryShare) btnVictoryShare.addEventListener("click", () => this.compartirResultadoSudoku(btnVictoryShare));

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
          if (this.sudokuFastMode) {
            this.sudokuLockedNumber = this.sudokuLockedNumber === num ? null : num;
            document.querySelectorAll("[data-sudoku-num]").forEach(b => {
              b.classList.toggle("fast-active", parseInt(b.getAttribute("data-sudoku-num"), 10) === this.sudokuLockedNumber);
            });
            this.resaltarNumeroEnTablero(this.sudokuLockedNumber);
            GymAudio.click();
          } else {
            this.ingresarNumeroSudoku(num);
          }
        });
      });

      // Teclado físico
      window.addEventListener("keydown", (e) => {
        if (this.activeGame !== "sudoku" || this.sudokuPaused || this.sudokuGameOver) return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        const key = e.key;
        if (key >= "1" && key <= "9") {
          this.ingresarNumeroSudoku(parseInt(key, 10));
        } else if (key === "Backspace" || key === "Delete") {
          this.borrarCeldaActualSudoku();
        } else if (key.toLowerCase() === "n") {
          if (btnNotas) btnNotas.click();
        } else if (key.toLowerCase() === "p") {
          this.togglePausaSudoku();
        } else if (key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
          this.deshacerJugadaSudoku();
        } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
          e.preventDefault();
          this.moverSeleccionSudoku(key);
        }
      });

      this.sudokuFastMode = false;
      this.sudokuLockedNumber = null;
      this.sudokuPaused = false;
      this.sudokuLivesMode = false;
      this.sudokuGameOver = false;

      if (!this.cargarPartidaSudoku()) {
        this.generarNuevoSudoku();
      }
      this.renderCalendarioDiarioSudoku();
    }

    obtenerFechaHoyKey(dateObj = new Date()) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    obtenerHistorialDiarioSudoku() {
      try {
        const raw = localStorage.getItem("ruichis_sudoku_daily_history_v1");
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr : []);
      } catch (e) {
        return new Set();
      }
    }

    registrarRetoDiarioCompletado() {
      const set = this.obtenerHistorialDiarioSudoku();
      set.add(this.obtenerFechaHoyKey());
      try {
        localStorage.setItem("ruichis_sudoku_daily_history_v1", JSON.stringify(Array.from(set)));
      } catch (e) {}
      this.renderCalendarioDiarioSudoku();
    }

    calcularRachaDiariaSudoku(datesSet) {
      let streak = 0;
      const cursor = new Date();
      const todayKey = this.obtenerFechaHoyKey(cursor);
      if (!datesSet.has(todayKey)) {
        cursor.setDate(cursor.getDate() - 1);
      }
      while (datesSet.has(this.obtenerFechaHoyKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      return streak;
    }

    renderCalendarioDiarioSudoku() {
      const strip = document.getElementById("sudoku-daily-calendar-7d");
      const streakEl = document.getElementById("sudoku-daily-streak-val");
      const datesSet = this.obtenerHistorialDiarioSudoku();
      const streak = this.calcularRachaDiariaSudoku(datesSet);

      if (streakEl) {
        streakEl.textContent = `${streak} ${streak === 1 ? "día" : "días"}`;
      }
      if (!strip) return;

      const dayLetters = ["D", "L", "M", "X", "J", "V", "S"];
      const items = [];
      for (let offset = 6; offset >= 0; offset--) {
        const dt = new Date();
        dt.setDate(dt.getDate() - offset);
        const key = this.obtenerFechaHoyKey(dt);
        const done = datesSet.has(key);
        const isToday = offset === 0;
        const letter = dayLetters[dt.getDay()];
        items.push(
          `<span class="daily-day-dot ${done ? "completed" : ""} ${isToday ? "today" : ""}" title="${key}${done ? " — Completado" : isToday ? " — Hoy" : ""}">${done ? "✓" : letter}</span>`
        );
      }
      strip.innerHTML = items.join("");
    }

    crearRngSemilla(seedStr) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seedStr.length; i++) {
        h ^= seedStr.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return () => {
        h += 0x6D2B79F5;
        let t = Math.imul(h ^ (h >>> 15), 1 | h);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    formatearTiempoMMSS(totalSecs) {
      const mins = String(Math.floor(totalSecs / 60)).padStart(2, "0");
      const secs = String(totalSecs % 60).padStart(2, "0");
      return `${mins}:${secs}`;
    }

    actualizarMejorTiempoUI() {
      const bestEl = document.getElementById("sudoku-best-time");
      if (!bestEl) return;
      try {
        const raw = localStorage.getItem("ruichis_sudoku_best_v1");
        const bests = raw ? JSON.parse(raw) : {};
        const sec = bests[this.sudokuDifficulty];
        bestEl.textContent = typeof sec === "number" ? this.formatearTiempoMMSS(sec) : "--:--";
      } catch (e) {
        bestEl.textContent = "--:--";
      }
    }

    togglePausaSudoku(forceState) {
      if (this.sudokuCompleted) return;
      this.sudokuPaused = typeof forceState === "boolean" ? forceState : !this.sudokuPaused;
      const pauseOverlay = document.getElementById("sudoku-pause-overlay");
      const btnPausa = document.getElementById("btn-sudoku-pausa");
      if (pauseOverlay) pauseOverlay.hidden = !this.sudokuPaused;
      if (btnPausa) btnPausa.innerHTML = this.sudokuPaused ? "▶️ Reanudar" : "⏸️ Pausar";
      GymAudio.click();
    }

    guardarPartidaSudoku() {
      if (this.sudokuCompleted) {
        try { localStorage.removeItem("ruichis_sudoku_saved_v1"); } catch (e) {}
        return;
      }
      try {
        const payload = {
          difficulty: this.sudokuDifficulty,
          dailyDate: this.sudokuDifficulty === "diario" ? this.obtenerFechaHoyKey() : null,
          solution: this.sudokuSolution,
          initial: this.sudokuInitial,
          board: this.sudokuBoard,
          notes: this.sudokuNotes.map(row => row.map(s => Array.from(s))),
          seconds: this.sudokuSeconds,
          mistakes: this.sudokuMistakes
        };
        localStorage.setItem("ruichis_sudoku_saved_v1", JSON.stringify(payload));
      } catch (e) {}
    }

    cargarPartidaSudoku() {
      try {
        const raw = localStorage.getItem("ruichis_sudoku_saved_v1");
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.board) || !Array.isArray(data.solution) || !Array.isArray(data.initial)) {
          return false;
        }
        if (data.difficulty === "diario" && data.dailyDate !== this.obtenerFechaHoyKey()) {
          return false;
        }
        this.sudokuDifficulty = data.difficulty || "medio";
        this.sudokuSolution = data.solution;
        this.sudokuInitial = data.initial;
        this.sudokuBoard = data.board;
        this.sudokuNotes = (data.notes || []).map(row => row.map(arr => new Set(arr))) ||
          Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
        this.sudokuHistory = [];
        this.sudokuSelected = { r: 0, c: 0 };
        this.sudokuMistakes = data.mistakes || 0;
        this.sudokuCompleted = false;
        this.sudokuPaused = false;

        document.querySelectorAll("[data-sudoku-diff]").forEach(b => {
          b.classList.toggle("active", b.getAttribute("data-sudoku-diff") === this.sudokuDifficulty);
        });

        this.actualizarContadorErroresSudoku();
        this.actualizarMejorTiempoUI();
        this.iniciarTimerSudoku(data.seconds || 0);
        this.renderSudokuGrid();
        this.actualizarProgresoYTecladoSudoku();
        return true;
      } catch (e) {
        return false;
      }
    }

    generarNuevoSudoku() {
      const rng = this.sudokuDifficulty === "diario"
        ? this.crearRngSemilla(`ruichis-sudoku-${this.obtenerFechaHoyKey()}`)
        : Math.random;

      this.sudokuSolution = this.generarTableroCompletoValido(rng);
      this.sudokuInitial = this.vaciarCeldasSegunDificultad(this.sudokuSolution, this.sudokuDifficulty, rng);
      this.sudokuBoard = this.sudokuInitial.map(row => [...row]);
      this.sudokuNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
      this.sudokuHistory = [];
      this.sudokuSelected = { r: 0, c: 0 };
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;
      this.sudokuPaused = false;
      this.sudokuGameOver = false;

      const overlay = document.getElementById("sudoku-victory-overlay");
      if (overlay) overlay.hidden = true;
      const pauseOverlay = document.getElementById("sudoku-pause-overlay");
      if (pauseOverlay) pauseOverlay.hidden = true;
      const gameOverOverlay = document.getElementById("sudoku-gameover-overlay");
      if (gameOverOverlay) gameOverOverlay.hidden = true;
      const statsOverlay = document.getElementById("sudoku-stats-overlay");
      if (statsOverlay) statsOverlay.hidden = true;
      const btnPausa = document.getElementById("btn-sudoku-pausa");
      if (btnPausa) btnPausa.innerHTML = "⏸️ Pausar";

      this.actualizarContadorErroresSudoku();
      this.actualizarMejorTiempoUI();
      const msg = document.getElementById("sudoku-status-msg");
      if (msg) {
        msg.className = "puzzle-status-bar";
        msg.innerHTML = this.sudokuDifficulty === "diario"
          ? `📅 <strong>Reto del Día (${this.obtenerFechaHoyKey()})</strong> activo. ¡Compite por el mejor tiempo sin errores!`
          : 'Selecciona una celda y usa el teclado numérico (1–9), activa <strong>✏️ Notas (Lápiz)</strong> o pulsa <strong>⚡ Entrada Rápida</strong> para rellenar dígitos al instante.';
      }

      this.iniciarTimerSudoku(0);
      this.renderSudokuGrid();
      this.actualizarProgresoYTecladoSudoku();
      this.guardarPartidaSudoku();
    }

    reintentarMismoSudoku() {
      this.sudokuBoard = this.sudokuInitial.map(row => [...row]);
      this.sudokuNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
      this.sudokuHistory = [];
      this.sudokuMistakes = 0;
      this.sudokuCompleted = false;
      this.sudokuPaused = false;
      this.sudokuGameOver = false;

      const gameOverOverlay = document.getElementById("sudoku-gameover-overlay");
      if (gameOverOverlay) gameOverOverlay.hidden = true;

      this.actualizarContadorErroresSudoku();
      this.iniciarTimerSudoku(0);
      this.renderSudokuGrid();
      this.actualizarProgresoYTecladoSudoku();
      this.guardarPartidaSudoku();
      GymAudio.click();
    }

    generarTableroCompletoValido(rng = Math.random) {
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

        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = nums.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [nums[i], nums[j]] = [nums[j], nums[i]];
        }
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

    vaciarCeldasSegunDificultad(solucion, diff, rng = Math.random) {
      const board = solucion.map(row => [...row]);
      const pistasPorDiff = {
        facil: 44,
        medio: 34,
        dificil: 28,
        experto: 24,
        diario: 31
      };
      const pistasDeseadas = pistasPorDiff[diff] || 34;
      const celdasABorrar = 81 - pistasDeseadas;

      const indices = [];
      for (let i = 0; i < 81; i++) indices.push(i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      for (let i = 0; i < celdasABorrar; i++) {
        const idx = indices[i];
        const r = Math.floor(idx / 9);
        const c = idx % 9;
        board[r][c] = 0;
      }
      return board;
    }

    iniciarTimerSudoku(initialSeconds = 0) {
      if (this.sudokuTimerId) clearInterval(this.sudokuTimerId);
      this.sudokuSeconds = initialSeconds;
      const timerEl = document.getElementById("sudoku-timer");
      if (timerEl) timerEl.textContent = this.formatearTiempoMMSS(this.sudokuSeconds);

      this.sudokuTimerId = setInterval(() => {
        if (this.sudokuPaused || this.sudokuCompleted || this.sudokuGameOver) return;
        this.sudokuSeconds++;
        if (timerEl) timerEl.textContent = this.formatearTiempoMMSS(this.sudokuSeconds);
        if (this.sudokuSeconds % 5 === 0) {
          this.guardarPartidaSudoku();
        }
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
            if (this.sudokuPaused) return;
            this.seleccionarCeldaSudoku(r, c);
            if (this.sudokuFastMode && this.sudokuLockedNumber && this.sudokuInitial[r][c] === 0 && !this.sudokuCompleted) {
              this.ingresarNumeroSudoku(this.sudokuLockedNumber);
            } else {
              GymAudio.cellSelect();
            }
          });

          grid.appendChild(cell);
        }
      }

      this.seleccionarCeldaSudoku(this.sudokuSelected.r, this.sudokuSelected.c);
      this.actualizarConflictosSudoku();
    }

    verificarUnidadesCompletasSudoku(r, c) {
      const cellsToFlash = new Set();

      // Fila completa y correcta
      let rowComplete = true;
      for (let i = 0; i < 9; i++) {
        if (this.sudokuBoard[r][i] !== this.sudokuSolution[r][i]) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) {
        for (let i = 0; i < 9; i++) cellsToFlash.add(`${r}-${i}`);
      }

      // Columna completa y correcta
      let colComplete = true;
      for (let i = 0; i < 9; i++) {
        if (this.sudokuBoard[i][c] !== this.sudokuSolution[i][c]) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        for (let i = 0; i < 9; i++) cellsToFlash.add(`${i}-${c}`);
      }

      // Bloque 3x3 completo y correcto
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      let boxComplete = true;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.sudokuBoard[br + i][bc + j] !== this.sudokuSolution[br + i][bc + j]) {
            boxComplete = false;
            break;
          }
        }
      }
      if (boxComplete) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            cellsToFlash.add(`${br + i}-${bc + j}`);
          }
        }
      }

      if (cellsToFlash.size > 0) {
        GymAudio.playTone(784, "triangle", 0.14, 0.05);
        cellsToFlash.forEach(key => {
          const [fr, fc] = key.split("-");
          const el = document.querySelector(`.sudoku-cell[data-r="${fr}"][data-c="${fc}"]`);
          if (el) {
            el.classList.remove("unit-flash");
            void el.offsetWidth;
            el.classList.add("unit-flash");
          }
        });
      }
    }

    actualizarContadorErroresSudoku() {
      const countEl = document.getElementById("sudoku-mistakes-count");
      const pillEl = document.getElementById("sudoku-mistakes-pill");
      const mistakes = this.sudokuMistakes || 0;
      if (countEl) {
        countEl.textContent = this.sudokuLivesMode ? `${mistakes} / 3` : String(mistakes);
      }
      if (pillEl) pillEl.classList.toggle("has-error", mistakes > 0);
    }

    resaltarNumeroEnTablero(targetNum) {
      document.querySelectorAll(".sudoku-cell").forEach(cell => {
        const cr = parseInt(cell.getAttribute("data-r"), 10);
        const cc = parseInt(cell.getAttribute("data-c"), 10);
        const val = this.sudokuBoard[cr][cc];
        cell.classList.toggle("match-number", Boolean(targetNum) && val === targetNum);
      });
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
      const currentVal = (this.sudokuFastMode && this.sudokuLockedNumber) ? this.sudokuLockedNumber : this.sudokuBoard[r][c];
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
      if (this.sudokuCompleted || this.sudokuPaused || this.sudokuGameOver) return;
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

          if (this.sudokuLivesMode && this.sudokuMistakes >= 3) {
            this.sudokuGameOver = true;
            const overOverlay = document.getElementById("sudoku-gameover-overlay");
            if (overOverlay) overOverlay.hidden = false;
          }
        } else {
          GymAudio.playTone(400 + num * 40, "sine", 0.05, 0.04);
          if (cellEl) {
            cellEl.classList.remove("error-shake", "correct-pop");
            void cellEl.offsetWidth;
            cellEl.classList.add("correct-pop");
          }
          this.limpiarNotasEnParesSudoku(r, c, num);
          this.verificarUnidadesCompletasSudoku(r, c);

          if (msg && msg.classList.contains("warning")) {
            msg.className = "puzzle-status-bar";
            msg.innerHTML = "✔️ Celda corregida. Sigue completando el tablero.";
          }
        }
      }

      this.actualizarConflictosSudoku();
      this.actualizarProgresoYTecladoSudoku();
      this.seleccionarCeldaSudoku(r, c);
      this.guardarPartidaSudoku();

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
      if (this.sudokuCompleted || this.sudokuPaused) return;
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
      this.guardarPartidaSudoku();
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
      if (this.sudokuCompleted || this.sudokuPaused || this.sudokuHistory.length === 0) return;
      const prev = this.sudokuHistory.pop();
      this.sudokuBoard = prev.board;
      this.sudokuNotes = prev.notes;
      this.renderSudokuGrid();
      this.actualizarConflictosSudoku();
      this.actualizarProgresoYTecladoSudoku();
      this.guardarPartidaSudoku();
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
      if (this.sudokuCompleted || this.sudokuPaused || this.sudokuGameOver) return;
      const vacias = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.sudokuBoard[r][c] === 0) {
            const candidatos = this.obtenerCandidatosValidos(r, c);
            vacias.push({ r, c, candidatos });
          }
        }
      }
      if (vacias.length === 0) return;

      vacias.sort((a, b) => a.candidatos.size - b.candidatos.size);
      const mejor = vacias[0];
      const numCorrecto = this.sudokuSolution[mejor.r][mejor.c];
      const esCandidatoUnico = mejor.candidatos.size === 1 && mejor.candidatos.has(numCorrecto);

      this.seleccionarCeldaSudoku(mejor.r, mejor.c);
      this.ingresarNumeroSudoku(numCorrecto);

      GymAudio.playTone(620, "sine", 0.15, 0.05);
      const msg = document.getElementById("sudoku-status-msg");
      if (msg) {
        msg.className = "puzzle-status-bar";
        msg.innerHTML = esCandidatoUnico
          ? `💡 <strong>Pista Lógica (Único Candidato):</strong> En (${mejor.r + 1}, ${mejor.c + 1}) solo cabe el <strong>${numCorrecto}</strong> porque el resto ya aparecen en su fila, columna o bloque 3×3.`
          : `💡 <strong>Pista Estratégica:</strong> Celda (${mejor.r + 1}, ${mejor.c + 1}) completada con <strong>${numCorrecto}</strong> (tenía ${mejor.candidatos.size} candidatos posibles).`;
      }
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
      this.guardarPartidaSudoku();
      GymAudio.victory();
      GymStats.recordSolve();
      this.updateStatsDisplay();

      const mins = Math.floor(this.sudokuSeconds / 60);
      const secs = this.sudokuSeconds % 60;
      const formattedTime = this.formatearTiempoMMSS(this.sudokuSeconds);
      const diffLabels = {
        facil: "Fácil",
        medio: "Medio",
        dificil: "Difícil",
        experto: "Experto",
        diario: "Reto del Día"
      };

      let isNewRecord = false;
      try {
        const raw = localStorage.getItem("ruichis_sudoku_best_v1");
        const bests = raw ? JSON.parse(raw) : {};
        const prevBest = bests[this.sudokuDifficulty];
        if (typeof prevBest !== "number" || this.sudokuSeconds < prevBest) {
          bests[this.sudokuDifficulty] = this.sudokuSeconds;
          localStorage.setItem("ruichis_sudoku_best_v1", JSON.stringify(bests));
          isNewRecord = true;
        }
      } catch (e) {}
      this.actualizarMejorTiempoUI();

      try {
        const rawStats = localStorage.getItem("ruichis_sudoku_stats_v1");
        const st = rawStats ? JSON.parse(rawStats) : { won: 0, perfect: 0, dailyCompleted: 0 };
        st.won = (st.won || 0) + 1;
        if (this.sudokuMistakes === 0) st.perfect = (st.perfect || 0) + 1;
        if (this.sudokuDifficulty === "diario") {
          st.dailyCompleted = (st.dailyCompleted || 0) + 1;
          this.registrarRetoDiarioCompletado();
        }
        localStorage.setItem("ruichis_sudoku_stats_v1", JSON.stringify(st));
      } catch (e) {}

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
      const recordBadge = document.getElementById("sudoku-victory-record-badge");

      if (timeEl) timeEl.textContent = formattedTime;
      if (mistakesEl) mistakesEl.textContent = String(this.sudokuMistakes);
      if (diffEl) diffEl.textContent = diffLabels[this.sudokuDifficulty] || "Medio";
      if (recordBadge) recordBadge.hidden = !isNewRecord;
      if (subtitleEl) {
        subtitleEl.textContent = this.sudokuMistakes === 0
          ? "¡Partida perfecta sin un solo error! Precisión lógica absoluta."
          : "Has completado las 81 celdas correctamente.";
      }
      if (overlay) overlay.hidden = false;
      this.lanzarConfetiEn(".sudoku-board-frame");
    }

    lanzarConfetiEn(selector = ".sudoku-board-frame") {
      const frame = document.querySelector(selector);
      if (!frame) return;
      const colors = ["#D4AF37", "#38BDF8", "#10B981", "#F59E0B", "#F43F5E"];
      for (let i = 0; i < 28; i++) {
        const piece = document.createElement("span");
        piece.className = "sudoku-confetti-piece";
        piece.style.left = `${Math.random() * 94 + 3}%`;
        piece.style.backgroundColor = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.45}s`;
        frame.appendChild(piece);
        setTimeout(() => piece.remove(), 2400);
      }
    }

    abrirModalEstadisticasSudoku() {
      const modal = document.getElementById("sudoku-stats-overlay");
      if (!modal) return;

      let st = { won: 0, perfect: 0, dailyCompleted: 0 };
      let bests = {};
      try {
        const rawStats = localStorage.getItem("ruichis_sudoku_stats_v1");
        if (rawStats) st = JSON.parse(rawStats);
        const rawBests = localStorage.getItem("ruichis_sudoku_best_v1");
        if (rawBests) bests = JSON.parse(rawBests);
      } catch (e) {}

      const wonEl = document.getElementById("stats-sudoku-won");
      const perfEl = document.getElementById("stats-sudoku-perfect");
      const dailyEl = document.getElementById("stats-sudoku-daily");
      const listEl = document.getElementById("stats-sudoku-best-list");

      if (wonEl) wonEl.textContent = String(st.won || 0);
      if (perfEl) perfEl.textContent = String(st.perfect || 0);
      if (dailyEl) dailyEl.textContent = String(st.dailyCompleted || 0);

      if (listEl) {
        const niveles = [
          { key: "facil", label: "Fácil" },
          { key: "medio", label: "Medio" },
          { key: "dificil", label: "Difícil" },
          { key: "experto", label: "Experto" },
          { key: "diario", label: "📅 Reto del Día" }
        ];
        listEl.innerHTML = niveles
          .map(n => {
            const val = typeof bests[n.key] === "number" ? this.formatearTiempoMMSS(bests[n.key]) : "—";
            return `<div class="stats-best-row"><span>${n.label}</span><strong>${val}</strong></div>`;
          })
          .join("");
      }

      modal.hidden = false;
      GymAudio.click();
    }

    compartirResultadoSudoku(btn) {
      const diffLabels = {
        facil: "Fácil",
        medio: "Medio",
        dificil: "Difícil",
        experto: "Experto",
        diario: `Reto del Día (${this.obtenerFechaHoyKey()})`
      };
      const label = diffLabels[this.sudokuDifficulty] || "Medio";
      const timeStr = this.formatearTiempoMMSS(this.sudokuSeconds);
      const perfect = this.sudokuMistakes === 0 ? " ✨ ¡Partida Perfecta!" : "";
      const shareText = `🧩 Sudoku Maestro — Ruichis Lab\nModo: ${label}\n⏱️ Tiempo: ${timeStr} | ❌ Errores: ${this.sudokuMistakes}${perfect}\nJuega gratis sin anuncios: https://ruichislab.com/#gimnasio-mental`;

      const markCopied = () => {
        if (!btn) return;
        const orig = btn.innerHTML;
        btn.innerHTML = "✅ ¡Resultado Copiado!";
        setTimeout(() => { btn.innerHTML = orig; }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(markCopied).catch(() => {
          alert(shareText);
        });
      } else {
        alert(shareText);
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

        const words = this.sopaCurrentWords && this.sopaCurrentWords.length
          ? this.sopaCurrentWords
          : config.palabras;
        const wordsHtml = words
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
              <h1>${config.nombre} (${this.sopaSize}×${this.sopaSize})</h1>
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
      }
    }
  }

  window.GimnasioMental = GimnasioMental;
})();
