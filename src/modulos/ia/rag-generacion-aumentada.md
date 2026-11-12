# Generación Aumentada por Recuperación (RAG): Arquitectura, Búsqueda Híbrida y GraphRAG

La **Generación Aumentada por Recuperación** (*Retrieval-Augmented Generation* o **RAG**) es un paradigma arquitectónico en inteligencia artificial que combina la capacidad generativa de los Modelos de Lenguaje Grande (LLMs) con sistemas externos de recuperación de información. En lugar de depender exclusivamente de los pesos sinápticos estáticos adquiridos durante la fase de preentrenamiento (memoria paramétrica), RAG dota al modelo de acceso dinámico a fuentes de datos estructuradas, no estructuradas o semiestructuradas (memoria no paramétrica). Este desacoplamiento entre el razonamiento lingüístico y el almacenamiento de hechos reduce drásticamente las alucinaciones factuales, permite la trazabilidad mediante citación directa de fuentes y facilita la actualización en tiempo real del corpus de conocimiento sin incurrir en los costos prohibitivos de reentrenamiento o ajuste fino (*fine-tuning*).

---

## 1. Origen e Intuición Fundamental

El concepto de RAG fue formalizado por Lewis et al. (2020) en el marco de la investigación sobre tareas intensivas en conocimiento (*knowledge-intensive NLP*). Tradicionalmente, los modelos de lenguaje afrontaban un dilema estructural: almacenar todo el conocimiento del mundo en sus pesos implicaba modelos descomunalmente grandes que, aun así, sufrían obsolescencia programada en el instante en que finalizaba su entrenamiento, además de una propensión intrínseca a generar falsedades con alta confianza estadística (*alucinaciones*).

La intuición fundamental de RAG puede comprenderse mediante la analogía de un examen académico:
* **LLM tradicional (Memoria paramétrica pura):** Opera como un estudiante rindiendo una prueba a "libro cerrado". Debe responder apelando únicamente a su memoria biológica interna. Si olvida un dato o lo confunde con otro semejante, tenderá a conjeturar una respuesta verosímil pero potencialmente errónea.
* **Sistema RAG (Memoria aumentada):** Opera como un estudiante rindiendo un examen a "libro abierto". Ante una interrogante compleja, primero consulta un índice bibliográfico, localiza los capítulos y extractos pertinentes, los examina en su escritorio y formula una respuesta rigurosa y fundamentada directamente en los textos consultados.

Bajo este esquema, la reducción de alucinaciones ocurre porque el espacio de generación del modelo se condiciona probabilísticamente sobre el contexto factual inyectado en el *prompt*. La actualización de conocimientos se convierte en una simple operación de inserción, actualización o borrado en la base documental externa, sin necesidad de modificar un solo parámetro de la red neuronal.

---

## 2. Arquitectura, Mecánica o Formulación Matemática

El flujo de trabajo de un sistema RAG moderno de nivel de producción trasciende el esquema ingenuo (*Naive RAG*) y se articula en una tubería multicapa: particionamiento semántico (*chunking*), recuperación híbrida (*sparse + dense*), reordenamiento (*reranking*) y modelado de grafos de conocimiento (*GraphRAG*).

```
   [ Documentos ] ───► [ Estrategia de Chunking ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ Índice Invertido ]                  [ Embeddings Densos ]
      (Léxico / BM25)                       (Espacio Vectorial)
            │                                     │
            └───────────────┬─────────────────────┘
                            ▼
               [ Recuperación Híbrida ]
               (Reciprocal Rank Fusion)
                            │
                            ▼
                 [ Modelo Reranker ]
                   (Cross-Encoder)
                            │
                            ▼
             [ Contexto Relevante Filtrado ]
                            │
  [ Consulta Usuario ] ─────┴─────► [ LLM Generador ] ───► [ Respuesta Fundamentada ]
```

### 2.1. Particionamiento del Texto (Chunking)

Los modelos de incrustación (*embeddings*) y los LLMs poseen ventanas de contexto finitas y sufren degradación de atención ante pasajes extensos. El *chunking* segmenta documentos largos en fragmentos procesables:
* **Fijo con solapamiento:** Divide el texto en bloques de tamaño $L$ con una superposición $\Delta$ (e.g., 512 tokens con 10% de solapamiento) para evitar la rotura de oraciones en los límites.
* **Semántico y recursivo:** Analiza separadores naturales (párrafos, encabezados Markdown, saltos de línea sintácticos) o saltos en la similitud coseno entre oraciones adyacentes para preservar la coherencia temática.
* **Padre-Hijo (*Parent-Document Retrieval*):** Recupera fragmentos pequeños para una coincidencia vectorial precisa, pero inyecta el documento o párrafo padre más amplio al LLM para no perder contexto circundante.

### 2.2. Búsqueda Híbrida: Fusión de Espacios Léxicos y Densos

La búsqueda exclusivamente vectorial suele fallar ante códigos alfanuméricos, identificadores, acrónimos o nombres propios poco frecuentes. La búsqueda híbrida combina:

1. **Recuperación Léxica Dispersa (BM25):** Evalúa la relevancia basada en la frecuencia de términos normalizada y la frecuencia inversa de documentos:
   $$\text{BM25}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
   donde $f(q_i, D)$ es la frecuencia del término $q_i$ en el documento $D$, $|D|$ es la longitud de $D$, $\text{avgdl}$ es la longitud promedio de documentos en la colección, y $k_1, b$ son hiperparámetros de calibración (habitualmente $k_1 \in [1.2, 2.0]$, $b = 0.75$).

2. **Recuperación Semántica Densa:** Proyecta la consulta $q$ y los fragmentos $d$ en un espacio latente mediante un codificador bi-encoder $E(\cdot)$, calculando la similitud coseno:
   $$S_{\text{densa}}(q, d) = \frac{\mathbf{e}_q \cdot \mathbf{e}_d}{\|\mathbf{e}_q\| \|\mathbf{e}_d\|}, \quad \text{donde } \mathbf{e}_q = E(q), \, \mathbf{e}_d = E(d)$$

3. **Reciprocal Rank Fusion (RRF):** Algoritmo estándar para intercalar listas de resultados de ambos métodos sin requerir la normalización de escalas heterogéneas de puntuación:
   $$\text{RRF\_Score}(d \in D) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
   donde $M$ es el conjunto de métodos de recuperación (BM25 y vectorial), $r_m(d)$ es la posición ordinal del documento $d$ en el ranking $m$, y $k$ es una constante estabilizadora (típicamente $k \approx 60$).

### 2.3. Reordenamiento Contextual (Reranking)

Los bi-encoders calculan representaciones vectoriales independientes para $q$ y $d$, lo que permite búsquedas de vecinos más cercanos muy rápidas (ANN), pero sacrifica la interacción cruzada entre términos. Un **Cross-Encoder** (*Reranker*) procesa la concatenación $[q; d]$ a través de capas de autoatención completa:
$$S_{\text{rerank}}(q, d) = \text{Softmax}\left(\mathbf{W} \cdot \text{Transformer}([q; d])\right)$$
Dado su mayor costo computacional, se aplica únicamente a los mejores candidatos (top-$K$, ej. $K=50$) de la búsqueda híbrida para seleccionar los top-$N$ (ej. $N=5$) que finalmente se enviarán al prompt.

### 2.4. GraphRAG: Recuperación Aumentada con Grafos de Conocimiento

El RAG vectorial estándar presenta severas deficiencias cuando la pregunta del usuario exige un razonamiento global sobre el corpus (e.g., *"¿Cuáles son las principales tendencias tecnológicas documentadas en los informes de los últimos tres años?"*). La búsqueda vectorial solo recupera fragmentos aislados similares a la frase de la consulta.

**GraphRAG** resuelve esta limitación mediante tres etapas:
1. **Extracción de entidades y relaciones:** Un LLM procesa los fragmentos de texto para extraer nodos (entidades: personas, organizaciones, conceptos) y aristas tipadas (relaciones semánticas), construyendo un Grafo de Conocimiento (*Knowledge Graph*).
2. **Detección de comunidades:** Se aplican algoritmos de partición jerárquica de grafos (como el algoritmo de Leiden) para agrupar entidades estrechamente vinculadas en clústeres temáticos a diferentes escalas de abstracción.
3. **Resumen jerárquico de comunidades:** El LLM genera resúmenes consolidados de cada comunidad. Al consultar, el sistema puede sintetizar respuestas a partir de los resúmenes globales (*búsqueda global*) o navegar caminos de relaciones específicas (*búsqueda local*).

```python
# Ejemplo canónico: Fusión de Rangos Recíprocos (RRF) en Python
def reciprocal_rank_fusion(dense_rankings: list[str], sparse_rankings: list[str], k: int = 60) -> list[tuple[str, float]]:
    scores: dict[str, float] = {}

    for rank, doc_id in enumerate(dense_rankings):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + (rank + 1)))

    for rank, doc_id in enumerate(sparse_rankings):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + (rank + 1)))

    # Ordenar documentos por puntuación descendente
    return sorted(scores.items(), key=lambda item: item[1], reverse=True)
```

---

## 3. Casos de Uso y Aplicaciones Reales

1. **Atención al Cliente y Soporte Técnico Corporativo:** Conexión de LLMs a manuales dinámicos, guías de reparación y bases de incidencias en Jira o Confluence. La empresa actualiza las políticas de servicio en el repositorio y el asistente adapta sus respuestas de inmediato sin tocar el modelo base.
2. **Inteligencia Legal y Regulatoria:** Motores de auditoría y análisis de jurisprudencia. Los juristas requieren citas exactas de artículos del código civil, normativas corporativas o sentencias precedentes. RAG aporta la evidencia documental estricta requerida para garantizar el cumplimiento legal (*compliance*).
3. **Sistemas de Diagnóstico e Información Biomédica:** Plataformas clínicas que indexan millones de artículos de PubMed y ensayos clínicos recientes. RAG permite al facultativo interrogar la literatura médica obteniendo referencias bibliográficas explícitas, mitigando prescripciones inventadas o posologías desactualizadas.
4. **Análisis Financiero y Contable Complejo:** Empleo de GraphRAG sobre informes anuales (formularios 10-K de la SEC) y balances corporativos para detectar conexiones ocultas de accionistas, subsidiarias cruzadas y riesgos sistémicos entre diversas empresas.

---

## 4. Ventajas, Limitaciones y Riesgos

### 4.1. Análisis Crítico

* **Ventajas:** Máxima auditabilidad mediante trazabilidad directa; costo computacional marginal comparado con el reentrenamiento; gobernanza de datos estricta, ya que el control de acceso basado en roles (RBAC) puede aplicarse directamente en la capa de recuperación antes de transferir datos al LLM.
* **Limitaciones:** Incremento en la latencia del sistema (*Time-To-First-Token*) derivado de las llamadas intermedias al índice y al reranker; sensibilidad extrema al ruido introducido por fragmentos irrelevantes que pueden saturar la atención del modelo (*lost in the middle*).
* **Riesgos y Seguridad:** Vulnerabilidad a la inyección indirecta de instrucciones (*indirect prompt injection*), donde un documento malicioso indexado en la base de datos contiene directivas ocultas para secuestrar el comportamiento del modelo durante la fase de lectura.

### 4.2. Tabla Comparativa de Enfoques

| Dimensión | RAG Naive (Solo Vectorial) | RAG Avanzado (Híbrido + Rerank) | GraphRAG | Fine-Tuning Tradicional |
| :--- | :--- | :--- | :--- | :--- |
| **Fuente de Verdad** | No paramétrica (vectores) | No paramétrica (vectores + léxico) | No paramétrica (grafo + resúmenes) | Paramétrica (pesos del modelo) |
| **Costo de Actualización** | Mínimo (reindexar fragmentos) | Mínimo (reindexar fragmentos) | Medio (extracción LLM y grafos) | Muy alto (cómputo y GPUs) |
| **Precisión en Términos Específicos** | Media (sufre con siglas y IDs) | Muy alta (apoyado en BM25) | Alta | Media-Baja |
| **Comprensión Holística del Corpus** | Muy deficiente (fragmentaria) | Deficiente a media | Excepcional (análisis de comunidades) | Media |
| **Riesgo de Alucinación** | Bajo | Muy bajo | Mínimo | Elevado |
| **Trazabilidad y Citas** | Directa por fragmento | Directa y precisa con rerank | Multidimensional (nodos y aristas) | Nula (caja negra) |
| **Latencia de Inferencia** | Baja (~100-300 ms) | Media (~300-600 ms) | Media-Alta (~1-3 s) | Muy baja (directa al LLM) |

---

## 5. Conceptos Relacionados

* **Bases de Datos Vectoriales e Índices HNSW:** Infraestructuras especializadas en indexar representaciones densas multidimensionales para búsquedas de vecinos más cercanos aproximados (*Approximate Nearest Neighbors*).
* **Cross-Encoders y Modelos de Incrustación:** Modelos de lenguaje transformadores optimizados para proyectar texto en espacios de similitud semántica o calificar pares consulta-documento.
* **Grafos de Conocimiento y Ontologías:** Estructuras formales que organizan entidades y propiedades semánticas, base fundamental de la arquitectura GraphRAG.
* **Ajuste Fino Eficiente en Parámetros (PEFT / LoRA):** Enfoque alternativo y complementario centrado en adaptar el estilo, formato y razonamiento del modelo más que en dotarlo de memoria factual externa.
