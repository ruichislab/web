// src/js/enciclopedia-datos.js
// Catálogo estructurado de la Enciclopedia Universal de IA — Ruichis Lab (20 Monografías)

(function () {
  const ENCICLOPEDIA_IA_CATEGORIAS = [
    { id: "todos", nombre: "Todas las Áreas", icono: "🌐" },
    { id: "fundamentos", nombre: "Fundamentos & ML", icono: "⚛️" },
    { id: "deep-learning", nombre: "Deep Learning & Transformers", icono: "🧠" },
    { id: "genai-llms", nombre: "LLMs & GenAI", icono: "✨" },
    { id: "agentes-rag", nombre: "Agentes, RAG & Prompts", icono: "🛠️" },
    { id: "multimodal", nombre: "Visión, Difusión & Multimodal", icono: "🎨" },
    { id: "sistemas", nombre: "Hardware, MLOps & Eval", icono: "⚡" },
    { id: "etica-futuro", nombre: "Seguridad, Ética & AGI", icono: "🛡️" }
  ];

  const ENCICLOPEDIA_IA_ARTICULOS = [
    {
      id: "que-es-ia",
      titulo: "Fundamentos de la Inteligencia Artificial",
      categoria: "fundamentos",
      categoriaLabel: "Fundamentos & ML",
      nivel: "Esencial",
      tiempoLectura: "7 min",
      icono: "🤖",
      resumen: "Del Test de Turing y la IA simbólica a los sistemas conexionistas modernos: taxonomía completa entre ANI, AGI y sistemas agenciales.",
      tags: ["IA Simbólica", "Conexionismo", "Test de Turing", "ANI", "AGI"],
      relacionados: ["machine-learning", "historia-fronteras-agi", "redes-neuronales"]
    },
    {
      id: "machine-learning",
      titulo: "Machine Learning: Paradigmas y Teoría",
      categoria: "fundamentos",
      categoriaLabel: "Fundamentos & ML",
      nivel: "Esencial",
      tiempoLectura: "8 min",
      icono: "📈",
      resumen: "Aprendizaje supervisado, no supervisado y auto-supervisado; equilibrio sesgo-varianza, árboles gradient boosting y validación cruzada.",
      tags: ["Supervisado", "No Supervisado", "Sesgo-Varianza", "XGBoost", "Validación"],
      relacionados: ["que-es-ia", "redes-neuronales", "aprendizaje-por-refuerzo"]
    },
    {
      id: "redes-neuronales",
      titulo: "Redes Neuronales y Backpropagation",
      categoria: "deep-learning",
      categoriaLabel: "Deep Learning & Transformers",
      nivel: "Esencial",
      tiempoLectura: "8 min",
      icono: "🧠",
      resumen: "Perceptrón multicapa, funciones de activación (ReLU, GELU, Softmax), regla de la cadena y retropropagación del gradiente.",
      tags: ["Perceptrón", "Backpropagation", "ReLU", "GELU", "Gradiente"],
      relacionados: ["deep-learning", "machine-learning", "transformers-atencion"]
    },
    {
      id: "deep-learning",
      titulo: "Deep Learning y Leyes de Escalamiento",
      categoria: "deep-learning",
      categoriaLabel: "Deep Learning & Transformers",
      nivel: "Intermedio",
      tiempoLectura: "8 min",
      icono: "🔮",
      resumen: "Optimización con AdamW, conexiones residuales, LayerNorm/BatchNorm y las leyes de escalamiento de Chinchilla.",
      tags: ["AdamW", "ResNet", "LayerNorm", "Chinchilla", "Escalamiento"],
      relacionados: ["redes-neuronales", "transformers-atencion", "hardware-gpu-inferencia"]
    },
    {
      id: "transformers-atencion",
      titulo: "Arquitectura Transformer y Auto-Atención",
      categoria: "deep-learning",
      categoriaLabel: "Deep Learning & Transformers",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "⚡",
      resumen: "Mecánica matemática de Q, K, V, Multi-Head Attention, codificación posicional RoPE y optimización FlashAttention.",
      tags: ["Self-Attention", "Multi-Head", "RoPE", "FlashAttention", "QKV"],
      relacionados: ["llms-modelos-lenguaje", "deep-learning", "vision-computacional"]
    },
    {
      id: "llms-modelos-lenguaje",
      titulo: "Grandes Modelos de Lenguaje (LLMs)",
      categoria: "genai-llms",
      categoriaLabel: "LLMs & GenAI",
      nivel: "Intermedio",
      tiempoLectura: "9 min",
      icono: "💬",
      resumen: "Tokenización BPE, pre-entrenamiento autoregresivo, estrategias de decodificación (Temperature, Top-p) y capacidades emergentes.",
      tags: ["LLM", "Tokenización BPE", "Autoregresivo", "Top-p", "Emergencia"],
      relacionados: ["transformers-atencion", "prompt-engineering", "fine-tuning-lora"]
    },
    {
      id: "aprendizaje-por-refuerzo",
      titulo: "Aprendizaje por Refuerzo, RLHF y DPO",
      categoria: "fundamentos",
      categoriaLabel: "Fundamentos & ML",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "🎯",
      resumen: "Procesos de Decisión de Markov, Q-Learning, PPO y alineamiento moderno de modelos mediante RLHF y Direct Preference Optimization.",
      tags: ["MDP", "Q-Learning", "PPO", "RLHF", "DPO"],
      relacionados: ["llms-modelos-lenguaje", "alineamiento-seguridad", "agentes-autonomos"]
    },
    {
      id: "vision-computacional",
      titulo: "Visión Computacional: CNNs a ViT y SAM",
      categoria: "multimodal",
      categoriaLabel: "Visión, Difusión & Multimodal",
      nivel: "Intermedio",
      tiempoLectura: "8 min",
      icono: "👁️",
      resumen: "Evolución desde convoluciones espaciales y ResNet hasta Vision Transformers (ViT), detección en tiempo real (YOLO) y segmentación universal.",
      tags: ["CNN", "ViT", "YOLO", "Segmentación", "SAM"],
      relacionados: ["modelos-difusion", "ia-multimodal", "transformers-atencion"]
    },
    {
      id: "modelos-difusion",
      titulo: "Modelos de Difusión y Flow Matching",
      categoria: "multimodal",
      categoriaLabel: "Visión, Difusión & Multimodal",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "🎨",
      resumen: "Proceso directo e inverso de ruido en DDPM, Latent Diffusion, VAEs, Classifier-Free Guidance, ControlNet y Flow Matching.",
      tags: ["DDPM", "Latent Diffusion", "VAE", "CFG", "Flow Matching"],
      relacionados: ["vision-computacional", "ia-multimodal", "deep-learning"]
    },
    {
      id: "embeddings-espacios-vectoriales",
      titulo: "Embeddings y Espacios Vectoriales",
      categoria: "agentes-rag",
      categoriaLabel: "Agentes, RAG & Prompts",
      nivel: "Intermedio",
      tiempoLectura: "7 min",
      icono: "🧭",
      resumen: "Representación geométrica del significado, similitud del coseno, índices HNSW y arquitectura de bases de datos vectoriales.",
      tags: ["Embeddings", "Coseno", "HNSW", "Vector DB", "Semántica"],
      relacionados: ["rag-generacion-aumentada", "llms-modelos-lenguaje", "ia-multimodal"]
    },
    {
      id: "rag-generacion-aumentada",
      titulo: "RAG: Generación Aumentada por Recuperación",
      categoria: "agentes-rag",
      categoriaLabel: "Agentes, RAG & Prompts",
      nivel: "Intermedio",
      tiempoLectura: "8 min",
      icono: "📚",
      resumen: "Chunking estratégico, búsqueda híbrida (BM25 + vectorial), reranking semántico y GraphRAG para eliminar alucinaciones.",
      tags: ["RAG", "BM25", "Reranking", "GraphRAG", "Chunking"],
      relacionados: ["embeddings-espacios-vectoriales", "agentes-autonomos", "evaluacion-benchmarks"]
    },
    {
      id: "agentes-autonomos",
      titulo: "Agentes Autónomos, Tool Use y MCP",
      categoria: "agentes-rag",
      categoriaLabel: "Agentes, RAG & Prompts",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "🕵️",
      resumen: "Ciclo percepción-planificación-acción, patrón ReAct, Function Calling, Model Context Protocol (MCP) y orquestación multi-agente.",
      tags: ["Agentes", "ReAct", "Tool Use", "MCP", "Multi-Agente"],
      relacionados: ["rag-generacion-aumentada", "prompt-engineering", "aprendizaje-por-refuerzo"]
    },
    {
      id: "prompt-engineering",
      titulo: "Prompt Engineering y Test-Time Compute",
      categoria: "agentes-rag",
      categoriaLabel: "Agentes, RAG & Prompts",
      nivel: "Esencial",
      tiempoLectura: "7 min",
      icono: "✍️",
      resumen: "Zero/Few-Shot, Chain-of-Thought, Tree of Thoughts, Structured Outputs y escalado de razonamiento en tiempo de inferencia.",
      tags: ["Prompting", "Chain-of-Thought", "ToT", "JSON Schema", "Razonamiento"],
      relacionados: ["llms-modelos-lenguaje", "agentes-autonomos", "evaluacion-benchmarks"]
    },
    {
      id: "fine-tuning-lora",
      titulo: "Fine-Tuning, LoRA y QLoRA (PEFT)",
      categoria: "genai-llms",
      categoriaLabel: "LLMs & GenAI",
      nivel: "Avanzado",
      tiempoLectura: "8 min",
      icono: "🔧",
      resumen: "Adaptación eficiente de parámetros mediante descomposición de bajo rango (ΔW = B·A), SFT, QLoRA en 4 bits y fusión de adaptadores.",
      tags: ["Fine-Tuning", "LoRA", "QLoRA", "PEFT", "SFT"],
      relacionados: ["llms-modelos-lenguaje", "hardware-gpu-inferencia", "aprendizaje-por-refuerzo"]
    },
    {
      id: "ia-multimodal",
      titulo: "IA Multimodal Nativa y Modelos VLA",
      categoria: "multimodal",
      categoriaLabel: "Visión, Difusión & Multimodal",
      nivel: "Intermedio",
      tiempoLectura: "8 min",
      icono: "🌐",
      resumen: "Alineación contrastiva CLIP, tokenización unificada any-to-any (texto, audio, imagen, video) y modelos Visión-Lenguaje-Acción.",
      tags: ["Multimodal", "CLIP", "Any-to-Any", "VLA", "Audio"],
      relacionados: ["vision-computacional", "modelos-difusion", "historia-fronteras-agi"]
    },
    {
      id: "hardware-gpu-inferencia",
      titulo: "Hardware de IA e Inferencia Eficiente",
      categoria: "sistemas",
      categoriaLabel: "Hardware, MLOps & Eval",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "🖥️",
      resumen: "GPUs, TPUs y Tensor Cores; cuantización (FP8, INT4, GGUF), KV-Cache, PagedAttention y Speculative Decoding en producción.",
      tags: ["GPU", "Cuantización", "KV-Cache", "PagedAttention", "Speculative Decoding"],
      relacionados: ["deep-learning", "fine-tuning-lora", "transformers-atencion"]
    },
    {
      id: "evaluacion-benchmarks",
      titulo: "Evaluación de IA y Benchmarks Modernos",
      categoria: "sistemas",
      categoriaLabel: "Hardware, MLOps & Eval",
      nivel: "Intermedio",
      tiempoLectura: "8 min",
      icono: "📊",
      resumen: "Perplejidad, MMLU, HumanEval, GPQA, SWE-bench, contaminación de datasets, ELO Arena y evaluación automatizada LLM-as-a-Judge.",
      tags: ["Benchmarks", "SWE-bench", "LLM-as-a-Judge", "Alucinaciones", "ELO"],
      relacionados: ["rag-generacion-aumentada", "alineamiento-seguridad", "llms-modelos-lenguaje"]
    },
    {
      id: "alineamiento-seguridad",
      titulo: "Alineamiento e Interpretabilidad Mecanística",
      categoria: "etica-futuro",
      categoriaLabel: "Seguridad, Ética & AGI",
      nivel: "Avanzado",
      tiempoLectura: "9 min",
      icono: "🛡️",
      resumen: "Sparse Autoencoders (SAEs), ingeniería de activaciones, Red Teaming, defensas contra Prompt Injection y control de riesgos.",
      tags: ["Alineamiento", "SAEs", "Interpretabilidad", "Prompt Injection", "Red Teaming"],
      relacionados: ["aprendizaje-por-refuerzo", "etica-privacidad-regulacion", "evaluacion-benchmarks"]
    },
    {
      id: "etica-privacidad-regulacion",
      titulo: "Ética, Privacidad y Regulación Global (EU AI Act)",
      categoria: "etica-futuro",
      categoriaLabel: "Seguridad, Ética & AGI",
      nivel: "Esencial",
      tiempoLectura: "8 min",
      icono: "⚖️",
      resumen: "Mitigación de sesgos algorítmicos, privacidad diferencial, aprendizaje federado, propiedad intelectual y marco regulatorio por niveles de riesgo.",
      tags: ["Ética", "Sesgos", "EU AI Act", "Privacidad Diferencial", "Federated Learning"],
      relacionados: ["alineamiento-seguridad", "que-es-ia", "evaluacion-benchmarks"]
    },
    {
      id: "historia-fronteras-agi",
      titulo: "Historia de la IA y Fronteras hacia la AGI",
      categoria: "etica-futuro",
      categoriaLabel: "Seguridad, Ética & AGI",
      nivel: "Intermedio",
      tiempoLectura: "9 min",
      icono: "🚀",
      resumen: "De Dartmouth 1956 y los inviernos de la IA a AlexNet, Transformers, World Models, IA neuro-simbólica y robótica física.",
      tags: ["Historia IA", "World Models", "Neuro-Simbólica", "Robótica", "AGI"],
      relacionados: ["que-es-ia", "ia-multimodal", "alineamiento-seguridad"]
    }
  ];

  window.ENCICLOPEDIA_IA_CATEGORIAS = ENCICLOPEDIA_IA_CATEGORIAS;
  window.ENCICLOPEDIA_IA_ARTICULOS = ENCICLOPEDIA_IA_ARTICULOS;
})();
